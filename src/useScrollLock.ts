const lockCountRef = { current: 0 };
const originalOverflow = { current: '' };
const originalPaddingRight = { current: '' };

function getScrollbarWidth(): number {
  if (typeof document === 'undefined') return 0;
  const outer = document.createElement('div');
  outer.style.overflow = 'scroll';
  outer.style.visibility = 'hidden';
  outer.style.position = 'absolute';
  document.body.appendChild(outer);
  const inner = document.createElement('div');
  outer.appendChild(inner);
  const width = outer.offsetWidth - inner.offsetWidth;
  outer.remove();
  return width;
}

export function useScrollLock(locked: boolean): void {
  if (typeof document === 'undefined') return;

  if (locked) {
    lockCountRef.current += 1;
    if (lockCountRef.current === 1) {
      originalOverflow.current = document.body.style.overflow;
      originalPaddingRight.current = document.body.style.paddingRight;
      const scrollbarWidth = getScrollbarWidth();
      document.body.style.overflow = 'hidden';
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
    }
  } else {
    lockCountRef.current = Math.max(0, lockCountRef.current - 1);
    if (lockCountRef.current === 0) {
      document.body.style.overflow = originalOverflow.current;
      document.body.style.paddingRight = originalPaddingRight.current;
    }
  }
}
