export { Modal } from './Modal';
export { ModalHeader } from './ModalHeader';
export { ModalBody } from './ModalBody';
export { ModalFooter } from './ModalFooter';
export { ModalPanel } from './ModalPanel';
export { ModalOverlay } from './ModalOverlay';
export { ModalContext } from './context';
export { useModal } from './useModal';
export type { ModalProps } from './types';
export type { ModalContextValue } from './context';
export type { ModalHeaderProps } from './ModalHeader';
export type { ModalBodyProps } from './ModalBody';
export type { ModalFooterProps } from './ModalFooter';
export type { ModalPanelProps } from './ModalPanel';
export type { ModalOverlayProps } from './ModalOverlay';

import { Modal } from './Modal';
import { confirm } from './confirm';

export type { ConfirmOptions, ConfirmOkController, ConfirmResult } from './confirm';

function alert(options: Parameters<typeof confirm>[0]) {
  return confirm({ ...options, showCancel: false });
}

const ModalWithConfirm = Object.assign(Modal, { confirm, alert });

export { ModalWithConfirm as default };
export { confirm };
