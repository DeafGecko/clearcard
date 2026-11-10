// Vault encryption. Private cards are stored as one AES-GCM blob.
//
// The blob is encrypted with a random 256-bit vault key. That key is never stored
// in the clear. It is wrapped twice: once with a key derived from the Secret Code,
// and once with a key derived from the recovery key. Changing the code only
// re-wraps the vault key, so the cards do not need to be encrypted again.

import { VisioCard, VaultWrap } from '../types';

const ITERATIONS = 310_000;
const SALT_BYTES = 16;
const IV_BYTES = 12;

export interface SealedBlob {
  iv: string;
  data: string;
}

const toBase64 = (bytes: Uint8Array): string => {
  let binary = '';
  bytes.forEach(b => (binary += String.fromCharCode(b)));
  return btoa(binary);
};

const fromBase64 = (text: string): Uint8Array =>
  Uint8Array.from(atob(text), c => c.charCodeAt(0));

const deriveWrappingKey = async (secret: string, salt: Uint8Array): Promise<CryptoKey> => {
  const baseKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: ITERATIONS },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
};

export const newVaultKey = (): Promise<CryptoKey> =>
  crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);

const encryptBytes = async (key: CryptoKey, plain: Uint8Array): Promise<SealedBlob> => {
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plain);
  return { iv: toBase64(iv), data: toBase64(new Uint8Array(cipher)) };
};

const decryptBytes = async (key: CryptoKey, sealed: SealedBlob): Promise<Uint8Array> => {
  const plain = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: fromBase64(sealed.iv) },
    key,
    fromBase64(sealed.data)
  );
  return new Uint8Array(plain);
};

// Wraps the vault key with a secret. The result can be stored safely.
export const wrapVaultKey = async (vaultKey: CryptoKey, secret: string): Promise<VaultWrap> => {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const wrapKey = await deriveWrappingKey(secret, salt);
  const raw = new Uint8Array(await crypto.subtle.exportKey('raw', vaultKey));
  return { salt: toBase64(salt), ...(await encryptBytes(wrapKey, raw)) };
};

// Returns the vault key, or null when the secret is wrong.
export const unwrapVaultKey = async (secret: string, wrap: VaultWrap): Promise<CryptoKey | null> => {
  try {
    const wrapKey = await deriveWrappingKey(secret, fromBase64(wrap.salt));
    const raw = await decryptBytes(wrapKey, wrap);
    return await crypto.subtle.importKey('raw', raw, { name: 'AES-GCM' }, true, ['encrypt', 'decrypt']);
  } catch {
    return null;
  }
};

export const sealVault = async (vaultKey: CryptoKey, cards: VisioCard[]): Promise<string> => {
  const plain = new TextEncoder().encode(JSON.stringify(cards));
  return JSON.stringify(await encryptBytes(vaultKey, plain));
};

// Returns the cards, or null when the blob cannot be read with this key.
export const openVault = async (vaultKey: CryptoKey, blob: string): Promise<VisioCard[] | null> => {
  try {
    const plain = await decryptBytes(vaultKey, JSON.parse(blob) as SealedBlob);
    const parsed: unknown = JSON.parse(new TextDecoder().decode(plain));
    return Array.isArray(parsed) ? (parsed as VisioCard[]) : null;
  } catch {
    return null;
  }
};
