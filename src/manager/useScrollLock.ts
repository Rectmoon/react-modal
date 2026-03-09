import { useEffect } from 'react';
import { lock, unlock } from './ScrollLock';

/**
 * Hook that locks body scroll when true, unlocks when false.
 * Uses the same lock/unlock count as ScrollLock module (shared with ModalManager/ModalRenderer).
 */
export function useScrollLock(locked: boolean): void {
  useEffect(() => {
    if (!locked) return;
    lock();
    return () => unlock();
  }, [locked]);
}
