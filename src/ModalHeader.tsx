import type { ReactNode } from 'react';
import { useContext } from 'react';
import { ModalContext } from './context';

export interface ModalHeaderProps {
  children?: ReactNode;
  id?: string;
  className?: string;
  closeIcon?: ReactNode;
}

export function ModalHeader({
  children,
  id,
  className = '',
  closeIcon = '\u00D7',
}: ModalHeaderProps) {
  const ctx = useContext(ModalContext);

  return (
    <div id={id} className={className} data-modal-header>
      <div data-modal-title>{children}</div>
      {ctx?.closable !== false && (
        <button
          type="button"
          data-modal-close
          onClick={ctx?.close}
          aria-label="Close"
        >
          {closeIcon}
        </button>
      )}
    </div>
  );
}
