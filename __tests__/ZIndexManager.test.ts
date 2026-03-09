import { describe, it, expect, beforeEach } from 'vitest';
import { zIndexManager } from '@/manager/ZIndexManager';

describe('ZIndexManager', () => {
  beforeEach(() => {
    zIndexManager.reset();
  });

  it('returns incrementing values starting at 1000', () => {
    expect(zIndexManager.next()).toBe(1000);
    expect(zIndexManager.next()).toBe(1010);
    expect(zIndexManager.next()).toBe(1020);
  });

  it('reset brings counter back to base', () => {
    zIndexManager.next();
    zIndexManager.next();
    zIndexManager.reset();
    expect(zIndexManager.next()).toBe(1000);
  });
});
