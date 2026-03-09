import type { ReactNode } from 'react';
import { zIndexManager } from './ZIndexManager';
import type { Deferred } from '../core/createDeferred';

export interface OpenModalOptions {
  title?: ReactNode;
  content?: ReactNode;
  footer?: ReactNode | ((props: { close: () => void; setLoading?: (v: boolean) => void; defer?: Deferred<unknown> }) => ReactNode);
  maskClosable?: boolean;
  keyboard?: boolean;
  getContainer?: () => HTMLElement;
  mask?: boolean;
  width?: number | string;
  /** Called when modal is closed (by any means). */
  onClose?: () => void;
  /** For confirm-style: onOk receives controller. */
  onOk?: (controller: { close: () => void; setLoading: (v: boolean) => void; defer?: Deferred<unknown> }) => void | Promise<void>;
  /** For confirm-style. */
  onCancel?: () => void;
  /** 'modal' | 'confirm' for future drawer/alert. */
  type?: 'modal' | 'confirm';
  /** Optional deferred; when present, close will resolve it. */
  defer?: Deferred<unknown>;
  /** Confirm-style: OK button text */
  okText?: ReactNode;
  /** Confirm-style: Cancel button text */
  cancelText?: ReactNode;
  /** Confirm-style: if false, hide Cancel (alert style) */
  showCancel?: boolean;
  /** Animation duration in ms (enter/leave). Default 200. */
  duration?: number;
}

export interface ModalItem {
  id: string;
  zIndex: number;
  title?: ReactNode;
  content?: ReactNode;
  footer?: OpenModalOptions['footer'];
  options: OpenModalOptions;
}

type Listener = () => void;

class ModalManager {
  modals: ModalItem[] = [];
  listeners: Listener[] = [];
  private idCounter = 0;

  private generateId(): string {
    this.idCounter += 1;
    return `modal-${this.idCounter}`;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.push(listener);
    listener();
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  notify(): void {
    this.listeners.forEach((l) => l());
  }

  open(options: OpenModalOptions): { id: string; close: () => void } {
    const id = this.generateId();
    const zIndex = zIndexManager.next();
    const item: ModalItem = {
      id,
      zIndex,
      title: options.title,
      content: options.content,
      footer: options.footer,
      options: {
        ...options,
        getContainer: options.getContainer ?? (() => (typeof document !== 'undefined' ? document.body : null!)),
      },
    };
    this.modals.push(item);
    this.notify();

    const close = (): void => this.close(id);
    return { id, close };
  }

  close(id: string): void {
    const item = this.modals.find((m) => m.id === id);
    if (!item) return;
    this.modals = this.modals.filter((m) => m.id !== id);
    item.options.onClose?.();
    this.notify();
  }

  /** For tests: clear all modals and notify. */
  clear(): void {
    this.modals.length = 0;
    this.notify();
  }
}

export const modalManager = new ModalManager();

export const open = (options: OpenModalOptions) => modalManager.open(options);
export const close = (id: string) => modalManager.close(id);
export const subscribe = (listener: Listener) => modalManager.subscribe(listener);
export const getModals = (): readonly ModalItem[] => modalManager.modals;
export const _testClearModals = (): void => modalManager.clear();
