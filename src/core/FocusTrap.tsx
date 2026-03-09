import { useEffect, useRef, type RefObject, type ReactNode } from 'react';

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => !el.hasAttribute('disabled') && el.offsetParent !== null
  );
}

export interface UseFocusTrapOptions {
  /** Whether focus trap is active */
  active: boolean;
  /** Callback when Escape is pressed (e.g. close modal) */
  onEscape?: () => void;
  /** Whether keyboard (Escape / Tab) is enabled */
  keyboard?: boolean;
}

/**
 * Traps focus inside the container: Tab cycles within, Escape calls onEscape,
 * restores focus to previous activeElement on deactivate.
 */
export function useFocusTrap(
  containerRef: RefObject<HTMLElement | null>,
  options: UseFocusTrapOptions
): void {
  const { active, onEscape, keyboard = true } = options;
  const previousActiveRef = useRef<Element | null>(null);

  useEffect(() => {
    if (!active || !containerRef.current) return;

    previousActiveRef.current = document.activeElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!keyboard) return;
      if (e.key === 'Escape' && onEscape) {
        onEscape();
        return;
      }
      if (e.key !== 'Tab' || !containerRef.current) return;
      const focusable = getFocusableElements(containerRef.current);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (previousActiveRef.current && typeof (previousActiveRef.current as HTMLElement).focus === 'function') {
        (previousActiveRef.current as HTMLElement).focus();
      }
    };
  }, [active, keyboard, onEscape, containerRef]);

  useEffect(() => {
    if (!active || !containerRef.current) return;
    const focusable = getFocusableElements(containerRef.current);
    const first = focusable[0];
    if (first) {
      first.focus();
    } else {
      containerRef.current.focus();
    }
  }, [active, containerRef]);
}

export interface FocusTrapProps {
  children?: ReactNode;
  active?: boolean;
  onEscape?: () => void;
  keyboard?: boolean;
}

/** Wrapper component that traps focus and handles Escape / Tab. */
function FocusTrap({ children, active = true, onEscape, keyboard = true }: FocusTrapProps) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, { active, onEscape, keyboard });
  return (
    <div ref={ref} tabIndex={-1} style={{ outline: 'none' }}>
      {children}
    </div>
  );
}

export default FocusTrap;
