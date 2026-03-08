import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useScrollLock } from './useScrollLock';

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => !el.hasAttribute('disabled') && el.offsetParent !== null
  );
}

export interface ModalOverlayProps {
  open: boolean;
  mask?: boolean;
  maskClosable?: boolean;
  keyboard?: boolean;
  onClose: () => void;
  children: ReactNode;
  getContainer?: () => HTMLElement;
  className?: string;
  /** For leave animation: overlay stays mounted but with this false */
  visible?: boolean;
  /** Transition duration in ms for overlay opacity */
  duration?: number;
  'data-testid'?: string;
}

export function ModalOverlay({
  open,
  mask = true,
  maskClosable = true,
  keyboard = true,
  onClose,
  children,
  getContainer,
  className = '',
  visible = true,
  duration = 200,
  'data-testid': testId = 'modal-overlay',
}: ModalOverlayProps) {
  const container = getContainer?.() ?? (typeof document !== 'undefined' ? document.body : null);
  const contentRef = useRef<HTMLDivElement>(null);
  const previousActiveRef = useRef<Element | null>(null);

  useScrollLock(open);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && keyboard) {
      onClose();
      return;
    }
    if (e.key !== 'Tab' || !contentRef.current) return;
    const focusable = getFocusableElements(contentRef.current);
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

  useEffect(() => {
    if (!open) return;
    previousActiveRef.current = document.activeElement;
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (previousActiveRef.current && typeof (previousActiveRef.current as HTMLElement).focus === 'function') {
        (previousActiveRef.current as HTMLElement).focus();
      }
    };
  }, [open, keyboard]);

  useEffect(() => {
    if (!open || !contentRef.current) return;
    const focusable = getFocusableElements(contentRef.current);
    const first = focusable[0];
    if (first) {
      first.focus();
    } else {
      contentRef.current.focus();
    }
  }, [open]);

  const handleOverlayClick = () => {
    if (maskClosable) onClose();
  };

  if (!open || !container) return null;

  const overlay = (
    <div
      data-modal-overlay
      data-testid={testId}
      className={className}
      role="presentation"
      onClick={mask ? handleOverlayClick : undefined}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: visible ? 1 : 0,
        transition: `opacity ${duration}ms ease`,
        ...(mask
          ? {
              backgroundColor: 'rgba(0,0,0,0.45)',
            }
          : { backgroundColor: 'transparent', pointerEvents: 'none' }),
      }}
    >
      <div
        ref={contentRef}
        tabIndex={-1}
        style={{
          flex: 1,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: mask ? 'auto' : 'none',
          outline: 'none',
        }}
        onClick={mask ? handleOverlayClick : undefined}
      >
        {children}
      </div>
    </div>
  );

  return createPortal(overlay, container);
}
