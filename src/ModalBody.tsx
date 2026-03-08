import type { ReactNode } from 'react';

export interface ModalBodyProps {
  children?: ReactNode;
  id?: string;
  className?: string;
}

export function ModalBody({ children, id, className = '' }: ModalBodyProps) {
  return (
    <div id={id} className={className} data-modal-body role="region" aria-label="Modal content">
      {children}
    </div>
  );
}
