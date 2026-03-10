import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { modalManager } from '../manager/ModalManager';
import { ModalRenderer } from '../core/Modal';

export interface ModalProviderProps {
  children?: ReactNode;
}

/**
 * Renders children and portals all modals (from modalManager) to document.body.
 * Wrap your app with <ModalProvider> when using Modal.open() or confirm/alert.
 */
function ModalProvider({ children }: ModalProviderProps) {
  const [, update] = useState({});

  useEffect(() => {
    return modalManager.subscribe(() => {
      update({});
    });
  }, []);

  return (
    <>
      {children}
      {createPortal(
        modalManager.modals.map((m) => <ModalRenderer key={m.id} {...m} />),
        document.body
      )}
    </>
  );
}

export default ModalProvider;
export { ModalProvider };
