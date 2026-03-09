import { describe, it, expect, beforeEach } from 'vitest';
import { open, close, subscribe, getModals } from '@/manager/ModalManager';
import { zIndexManager } from '@/manager/ZIndexManager';

describe('ModalManager', () => {
  beforeEach(() => {
    while (getModals().length > 0) {
      close(getModals()[0].id);
    }
    zIndexManager.reset();
  });

  it('open adds a modal and notifies', () => {
    const received: unknown[][] = [];
    const unsub = subscribe(() => received.push([...getModals()]));

    const { id, close: closeFn } = open({ title: 'Test' });
    expect(getModals()).toHaveLength(1);
    expect(getModals()[0].id).toBe(id);
    expect(getModals()[0].title).toBe('Test');
    expect(received.length).toBeGreaterThanOrEqual(1);
    expect(received[received.length - 1]).toHaveLength(1);

    closeFn();
    expect(getModals()).toHaveLength(0);
    expect(received[received.length - 1]).toHaveLength(0);

    unsub();
  });

  it('close(id) removes the modal', () => {
    const { id } = open({ content: 'C' });
    expect(getModals()).toHaveLength(1);
    close(id);
    expect(getModals()).toHaveLength(0);
  });

  it('assigns incrementing zIndex', () => {
    const a = open({});
    const b = open({});
    expect(getModals()[0].zIndex).toBe(1000);
    expect(getModals()[1].zIndex).toBe(1010);
    close(a.id);
    close(b.id);
  });
});
