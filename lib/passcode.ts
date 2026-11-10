// Secret Code storage: only a salted PBKDF2 hash is saved, never the code itself.
// The salt is random per code, and the high iteration count makes guessing the
// six digits from a stolen hash slow.

const ITERATIONS = 310_000;
const SALT_BYTES = 16;

const toHex = (bytes: Uint8Array): string =>
  Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');

const fromHex = (hex: string): Uint8Array =>
  new Uint8Array(hex.match(/.{2}/g)?.map(byte => parseInt(byte, 16)) ?? []);

const deriveHash = async (code: string, salt: Uint8Array): Promise<string> => {
  const baseKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(code),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: ITERATIONS },
    baseKey,
    256
  );
  return toHex(new Uint8Array(bits));
};

export interface PasscodeRecord {
  passcodeHash: string;
  passcodeSalt: string;
}

export const createPasscodeRecord = async (code: string): Promise<PasscodeRecord> => {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  return {
    passcodeHash: await deriveHash(code, salt),
    passcodeSalt: toHex(salt),
  };
};

export const verifyPasscode = async (
  code: string,
  record: Partial<PasscodeRecord>
): Promise<boolean> => {
  if (!record.passcodeHash || !record.passcodeSalt) return false;
  return (await deriveHash(code, fromHex(record.passcodeSalt))) === record.passcodeHash;
};
