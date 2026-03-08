import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useScrollLock } from './useScrollLock';

export interface ModalOverlayProps {
  open: boolean;
  mask?: boolean;
  maskClosable?: boolean;
  keyboard?: boolean;
  onClose: () => void;
  children: ReactNode;
  getContainer?: () => HTMLElement;
  className?: string;
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
  'data-testid': testId = 'modal-overlay',
}: ModalOverlayProps) {
  const container = getContainer?.() ?? (typeof document !== 'undefined' ? document.body : null);
  useScrollLock(open);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && keyboard) {
      onClose();
    }
  };

  useEffect(() => {
    if (!open) return;
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, keyboard]);

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
        ...(mask
          ? {
              backgroundColor: 'rgba(0,0,0,0.45)',
            }
          : { backgroundColor: 'transparent', pointerEvents: 'none' }),
      }}
    >
      <div
        style={{
          flex: 1,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: mask ? 'auto' : 'none',
        }}
        onClick={mask ? handleOverlayClick : undefined}
      >
        {children}
      </div>
    </div>
  );

  return createPortal(overlay, container);
}
