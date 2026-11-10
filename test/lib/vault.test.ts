import { describe, it, expect } from 'vitest';
import { newVaultKey, wrapVaultKey, unwrapVaultKey, sealVault, openVault } from '../../lib/vault';
import { SystemCategories, VisioCard } from '../../types';

const card: VisioCard = {
  id: 'p1',
  title: 'Personal ID',
  content: 'ID: 4481-22 / Address: 12 Oak St',
  category: SystemCategories.VAULT,
  isSensitive: true,
  isLocked: true,
  createdAt: 1,
};

describe('vault encryption', () => {
  it('unwraps the vault key with the right secret', async () => {
    const key = await newVaultKey();
    const wrap = await wrapVaultKey(key, '123456');
    expect(await unwrapVaultKey('123456', wrap)).not.toBeNull();
  });

  it('returns null for a wrong secret', async () => {
    const wrap = await wrapVaultKey(await newVaultKey(), '123456');
    expect(await unwrapVaultKey('654321', wrap)).toBeNull();
  });

  it('round-trips cards through the encrypted blob', async () => {
    const key = await newVaultKey();
    const blob = await sealVault(key, [card]);
    expect(blob).not.toContain('Oak St');
    expect(await openVault(key, blob)).toEqual([card]);
  });

  it('cannot open the blob with a different key', async () => {
    const blob = await sealVault(await newVaultKey(), [card]);
    expect(await openVault(await newVaultKey(), blob)).toBeNull();
  });

  it('rejects a blob that was changed after it was saved', async () => {
    const key = await newVaultKey();
    const blob = JSON.parse(await sealVault(key, [card])) as { iv: string; data: string };
    const bytes = Uint8Array.from(atob(blob.data), c => c.charCodeAt(0));
    bytes[0] ^= 1;
    blob.data = btoa(String.fromCharCode(...bytes));
    expect(await openVault(key, JSON.stringify(blob))).toBeNull();
  });
});
