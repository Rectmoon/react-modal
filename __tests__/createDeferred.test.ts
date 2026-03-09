import { describe, it, expect } from 'vitest';
import { createDeferred } from '../src/core/createDeferred';

describe('createDeferred', () => {
  it('exposes promise, resolve, reject', () => {
    const d = createDeferred<number>();
    expect(d).toHaveProperty('promise');
    expect(d).toHaveProperty('resolve');
    expect(d).toHaveProperty('reject');
    expect(d.promise).toBeInstanceOf(Promise);
  });

  it('resolve settles the promise with the value', async () => {
    const d = createDeferred<string>();
    d.resolve('ok');
    await expect(d.promise).resolves.toBe('ok');
  });

  it('reject settles the promise with the reason', async () => {
    const d = createDeferred<void>();
    d.reject(new Error('fail'));
    await expect(d.promise).rejects.toThrow('fail');
  });
});
