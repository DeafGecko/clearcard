// Recovery key: a one-time code shown when a Secret Code is set. Only its SHA-256
// hash is stored, so the stored value cannot be used to recover the key itself.

// Leaves out easily confused characters (0/O, 1/I/L).
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const KEY_LENGTH = 16;

export const generateRecoveryKey = (): string => {
  const bytes = new Uint8Array(KEY_LENGTH);
  crypto.getRandomValues(bytes);
  const chars = Array.from(bytes, b => ALPHABET[b % ALPHABET.length]);
  return chars.join('').replace(/(.{4})(?=.)/g, '$1-');
};

// Ignores case, dashes, and spaces so the user can type the key loosely.
export const normalizeRecoveryKey = (input: string): string =>
  input.toUpperCase().replace(/[^A-Z0-9]/g, '');

export const hashRecoveryKey = async (key: string): Promise<string> => {
  const data = new TextEncoder().encode(normalizeRecoveryKey(key));
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
};

export const verifyRecoveryKey = async (input: string, storedHash: string): Promise<boolean> => {
  if (!storedHash) return false;
  return (await hashRecoveryKey(input)) === storedHash;
};
