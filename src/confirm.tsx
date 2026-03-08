import type { ReactNode } from 'react';
import { useState, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { Modal } from './Modal';

export type ConfirmOkController = {
  close: () => void;
  setLoading: (loading: boolean) => void;
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
  /** If false, only OK button (alert style). If true or undefined, show Cancel. */
  showCancel?: boolean;
  /** For tests: mount modal into this container instead of body. */
  getContainer?: () => HTMLElement;
}

export type ConfirmResult = 'ok' | 'cancel';

function ConfirmImpl({
  options,
  resolveRef,
}: {
  options: ConfirmOptions;
  resolveRef: { current: (value: ConfirmResult) => void };
}) {
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const closeReasonRef = { current: 'cancel' as ConfirmResult };

  const close = useCallback(() => {
    closeReasonRef.current = 'ok';
    setOpen(false);
  }, []);

  const handleOk = useCallback(async () => {
    const controller: ConfirmOkController = { close, setLoading };
    if (!options.onOk) {
      close();
      return;
    }
    try {
      await options.onOk(controller);
    } catch {
      // Error: don't close
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

/** Only for tests: clear container so confirm dialogs don't leak between tests. */
export function _testClearConfirmContainer(): void {
  if (confirmContainer) confirmContainer.innerHTML = '';
}

export function confirm(options: ConfirmOptions): Promise<ConfirmResult> {
  return new Promise((resolve) => {
    const container = getConfirmContainer();
    const div = document.createElement('div');
    container.appendChild(div);

    const resolveRef: { current: (value: ConfirmResult) => void } = {
      current: (value: ConfirmResult) => {
        resolve(value);
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
      <ConfirmImpl
        options={options}
        resolveRef={resolveRef}
      />
    );
  });
}
