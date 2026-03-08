import { createContext } from 'react';

export interface ModalContextValue {
  close: () => void;
  closable?: boolean;
}

export const ModalContext = createContext<ModalContextValue | null>(null);
