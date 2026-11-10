import { describe, it, expect } from 'vitest';
import { generateRecoveryKey, hashRecoveryKey, verifyRecoveryKey, normalizeRecoveryKey } from '../../lib/recovery';

describe('recovery key', () => {
  it('generates 16 characters in four groups, without confusable characters', () => {
    const key = generateRecoveryKey();
    expect(key).toMatch(/^[A-HJ-KM-NP-Z2-9]{4}(-[A-HJ-KM-NP-Z2-9]{4}){3}$/);
  });

  it('generates different keys each time', () => {
    expect(generateRecoveryKey()).not.toBe(generateRecoveryKey());
  });

  it('ignores case, dashes, and spaces when checking', async () => {
    const key = 'ABCD-EFGH-JKMN-PQRS';
    const hash = await hashRecoveryKey(key);
    expect(await verifyRecoveryKey('abcd efgh jkmn pqrs', hash)).toBe(true);
    expect(await verifyRecoveryKey('ABCDEFGHJKMNPQRS', hash)).toBe(true);
  });

  it('rejects a wrong key', async () => {
    const hash = await hashRecoveryKey('ABCD-EFGH-JKMN-PQRS');
    expect(await verifyRecoveryKey('ABCD-EFGH-JKMN-PQRT', hash)).toBe(false);
  });

  it('rejects every key when no hash is stored', async () => {
    expect(await verifyRecoveryKey('ABCD-EFGH-JKMN-PQRS', '')).toBe(false);
  });

  it('stores a hash, not the key itself', async () => {
    const key = generateRecoveryKey();
    const hash = await hashRecoveryKey(key);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(hash).not.toContain(normalizeRecoveryKey(key));
  });
});
