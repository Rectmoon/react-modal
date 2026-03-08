import type { ReactNode } from 'react';

export interface ModalFooterProps {
  children?: ReactNode;
  className?: string;
}

export function ModalFooter({ children, className = '' }: ModalFooterProps) {
  return (
    <div className={className} data-modal-footer>
      {children}
    </div>
  );
}
