import { Modal } from './core/Modal';
import ModalRenderer from './core/ModalRenderer';
import ModalProvider from './provider/ModalProvider';
import { useModal } from './hooks/useModal';
import { confirm, open as modalOpen, alert as modalAlert } from './core/service';
import { createDeferred } from './core/createDeferred';
import {
  modalManager,
  open as modalManagerOpen,
  close as modalManagerClose,
  subscribe as modalManagerSubscribe,
  getModals,
} from './manager/ModalManager';

const ModalWithStatic = Object.assign(Modal, {
  open: modalOpen,
  confirm,
  alert: (options: Parameters<typeof confirm>[0]) => confirm({ ...options, showCancel: false }),
});

export {
  ModalProvider,
  ModalRenderer,
  Modal,
  useModal,
  confirm,
  modalOpen,
  modalAlert,
  createDeferred,
  modalManagerOpen,
  modalManagerClose,
  modalManagerSubscribe,
  getModals,
  modalManager,
};
export type { ModalOpenOptions, ModalOpenController } from './core/service';
export type { Deferred } from './core/createDeferred';
export type { ConfirmOptions, ConfirmResult, ConfirmOkController } from './core/service';
export type { OpenModalOptions, ModalItem } from './manager/ModalManager';
export type { ModalProps } from './types';
export default ModalWithStatic;
