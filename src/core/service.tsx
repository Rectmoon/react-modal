import type { ReactNode } from 'react';
import { useState, useCallback, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { createDeferred } from './createDeferred';
import type { Deferred } from './createDeferred';
import { open as openModal } from '../manager/ModalManager';
import { Modal } from './Modal';

// ----- Types (confirm + open/alert) -----

export type ConfirmOkController = {
  close: () => void;
  setLoading: (loading: boolean) => void;
  defer?: Deferred<ConfirmResult>;
};

export interface ConfirmOptions {
  title?: ReactNode;
  content?: ReactNode;
  onOk?: (controller: ConfirmOkController) => void | Promise<void>;
  onCancel?: () => void;
  okText?: string;
  cancelText?: string;
  maskClosable?: boolean;
  keyboard?: boolean;
  showCancel?: boolean;
  getContainer?: () => HTMLElement;
}

export type ConfirmResult = 'ok' | 'cancel';

export interface ModalOpenController {
  close: () => void;
  setLoading: (loading: boolean) => void;
  defer: Deferred<unknown>;
}

export interface ModalOpenOptions {
  title?: string;
  content?: ReactNode;
  footer?: ReactNode | ((props: { close: () => void }) => ReactNode);
  onOk?: (ctrl: ModalOpenController) => void | Promise<void>;
  onCancel?: (ctrl?: ModalOpenController) => void;
}

// ----- confirm() implementation: legacy createRoot path + queue path -----

function ConfirmImplLegacy({
  options,
  resolveRef,
  defer,
}: {
  options: ConfirmOptions;
  resolveRef: { current: (value: ConfirmResult) => void };
  defer: Deferred<ConfirmResult>;
}) {
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const closeReasonRef = { current: 'cancel' as ConfirmResult };

  const close = useCallback(() => {
    closeReasonRef.current = 'ok';
    setOpen(false);
  }, []);

  const controller: ConfirmOkController = { close, setLoading, defer };

  const handleOk = useCallback(async () => {
    if (!options.onOk) {
      close();
      return;
    }
    try {
      await options.onOk(controller);
    } catch {
      // no-op
    }
  }, [options, close]);

  const handleCancel = useCallback(() => {
    options.onCancel?.();
    closeReasonRef.current = 'cancel';
    setOpen(false);
  }, [options]);

  const handleOverlayClose = useCallback(() => {
    closeReasonRef.current = 'cancel';
    setOpen(false);
  }, []);

  useEffect(() => {
    defer.promise.then(
      (value) => {
        closeReasonRef.current = value;
        setOpen(false);
      },
      () => {
        closeReasonRef.current = 'cancel';
        setOpen(false);
      }
    );
  }, [defer]);

  const afterOpenChange = useCallback(
    (next: boolean) => {
      if (!next) resolveRef.current(closeReasonRef.current);
    },
    [resolveRef]
  );

  const showCancel = options.showCancel !== false && options.cancelText !== null;
  const cancelText = options.cancelText ?? 'Cancel';

  const footer = (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
      {showCancel && (
        <button type="button" onClick={handleCancel} disabled={loading}>
          {cancelText}
        </button>
      )}
      <button type="button" onClick={handleOk} disabled={loading}>
        {loading ? 'Loading...' : (options.okText ?? 'OK')}
      </button>
    </div>
  );

  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        if (!next) handleOverlayClose();
      }}
      afterOpenChange={afterOpenChange}
      title={options.title}
      maskClosable={options.maskClosable ?? true}
      keyboard={options.keyboard ?? true}
      footer={footer}
    >
      {options.content}
    </Modal>
  );
}

let confirmContainer: HTMLElement | null = null;

function getConfirmContainer(): HTMLElement {
  if (typeof document === 'undefined') throw new Error('document is undefined');
  if (!confirmContainer) {
    confirmContainer = document.createElement('div');
    document.body.appendChild(confirmContainer);
  }
  return confirmContainer;
}

const confirmQueue: { options: ConfirmOptions; defer: Deferred<ConfirmResult> }[] = [];
let isConfirmOpen = false;

export function _testResetConfirmQueue(): void {
  confirmQueue.length = 0;
  isConfirmOpen = false;
}

function processConfirmQueue(): void {
  if (isConfirmOpen || confirmQueue.length === 0) return;
  isConfirmOpen = true;
  const item = confirmQueue.shift()!;
  openModal({
    title: item.options.title,
    content: item.options.content,
    type: 'confirm',
    defer: item.defer as Deferred<unknown>,
    onOk: item.options.onOk
      ? (controller) => item.options.onOk!(controller as ConfirmOkController)
      : undefined,
    onCancel: item.options.onCancel,
    okText: item.options.okText,
    cancelText: item.options.cancelText,
    showCancel: item.options.showCancel,
    maskClosable: item.options.maskClosable,
    keyboard: item.options.keyboard,
  });
  item.defer.promise.finally(() => {
    isConfirmOpen = false;
    processConfirmQueue();
  });
}

/**
 * When getContainer is provided (e.g. in tests), use legacy createRoot so ModalProvider is not required.
 * Otherwise use ModalManager (queue: only one confirm at a time); requires <ModalProvider /> at app root.
 */
export function confirm(options: ConfirmOptions): Promise<ConfirmResult> {
  const defer = createDeferred<ConfirmResult>();

  if (options.getContainer) {
    const container = getConfirmContainer();
    const div = document.createElement('div');
    container.appendChild(div);
    const resolveRef: { current: (value: ConfirmResult) => void } = {
      current: (value: ConfirmResult) => {
        defer.resolve(value);
        queueMicrotask(() => {
          try {
            root.unmount();
          } catch {}
          div.remove();
        });
      },
    };
    const root = createRoot(div);
    root.render(
      <ConfirmImplLegacy options={options} resolveRef={resolveRef} defer={defer} />
    );
    return defer.promise;
  }

  confirmQueue.push({ options, defer });
  processConfirmQueue();
  return defer.promise;
}

export function _testClearConfirmContainer(): void {
  if (confirmContainer) confirmContainer.innerHTML = '';
}

// ----- open() / alert() -----

export function open(options: ModalOpenOptions): ModalOpenController {
  const defer = createDeferred<unknown>();
  const setLoading = (_v: boolean) => {};

  const result = openModal({
    title: options.title,
    content: options.content ?? (options.title ? <p>{options.title}</p> : null),
    footer:
      typeof options.footer === 'function'
        ? options.footer
        : options.onOk != null || options.onCancel != null
          ? ({ close }) => (
              <>
                <button
                  type="button"
                  onClick={() => {
                    options.onCancel?.({ close, setLoading, defer });
                    close();
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="primary"
                  onClick={() => {
                    const p = options.onOk?.({ close, setLoading, defer });
                    if (p instanceof Promise) p.finally(() => close());
                    else close();
                  }}
                >
                  OK
                </button>
              </>
            )
          : options.footer,
    defer: defer as Deferred<unknown>,
  });

  return { close: result.close, setLoading, defer };
}

export function alert(options: ConfirmOptions): Promise<ConfirmResult> {
  return confirm({ ...options, showCancel: false });
}
