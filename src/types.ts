import type { ReactNode } from 'react';

export interface ModalProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;

  title?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode | ((props: { close: () => void }) => ReactNode);

  maskClosable?: boolean;
  keyboard?: boolean;
  closable?: boolean;

  width?: number | string;
  centered?: boolean;
  getContainer?: () => HTMLElement;

  destroyOnClose?: boolean;
  mask?: boolean;

  afterOpenChange?: (open: boolean) => void;

  /** Animation: class name for overlay/panel when entering or leaving */
  transitionName?: string;
  /** Animation duration in ms */
  duration?: number;
  /** Callback when overlay transition ends (for cleanup after leave) */
  onTransitionEnd?: (open: boolean) => void;

  /** Accessibility: id for title (aria-labelledby) */
  titleId?: string;
  /** Accessibility: id for body (aria-describedby) */
  bodyId?: string;

  className?: string;
  style?: React.CSSProperties;
}
