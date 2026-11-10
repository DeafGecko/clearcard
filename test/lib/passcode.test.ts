import { describe, it, expect } from 'vitest';
import { createPasscodeRecord, verifyPasscode } from '../../lib/passcode';

describe('passcode hashing', () => {
  it('never stores the code itself', async () => {
    const record = await createPasscodeRecord('123456');
    expect(JSON.stringify(record)).not.toContain('123456');
  });

  it('verifies the right code and rejects a wrong one', async () => {
    const record = await createPasscodeRecord('123456');
    expect(await verifyPasscode('123456', record)).toBe(true);
    expect(await verifyPasscode('654321', record)).toBe(false);
  });

  it('uses a new salt each time, so equal codes give different hashes', async () => {
    const a = await createPasscodeRecord('123456');
    const b = await createPasscodeRecord('123456');
    expect(a.passcodeSalt).not.toBe(b.passcodeSalt);
    expect(a.passcodeHash).not.toBe(b.passcodeHash);
  });

  it('rejects everything when no Secret Code is set', async () => {
    expect(await verifyPasscode('123456', {})).toBe(false);
  });
});
