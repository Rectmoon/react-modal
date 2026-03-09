import type { ReactNode } from 'react';
import { useCallback } from 'react';
import { modalManager } from '../manager/ModalManager';
import { createDeferred, type Deferred } from '../core/createDeferred';

export interface UseModalController {
  close: () => void;
  setLoading: (loading: boolean) => void;
  defer: Deferred<unknown>;
}

type FooterProps = { close: () => void; setLoading?: (v: boolean) => void; defer?: Deferred<unknown> };

export interface UseModalOpenOptions {
  title?: ReactNode;
  content?: ReactNode;
  footer?: ReactNode | ((props: FooterProps) => ReactNode);
  onOk?: (ctrl: UseModalController) => void | Promise<void>;
  onCancel?: (ctrl?: UseModalController) => void;
  maskClosable?: boolean;
  keyboard?: boolean;
}

export interface UseModalConfirmOptions {
  title?: ReactNode;
  content?: ReactNode;
  onOk?: (ctrl: UseModalController) => void | Promise<void>;
  onCancel?: () => void;
  okText?: string;
  cancelText?: string;
  showCancel?: boolean;
  maskClosable?: boolean;
  keyboard?: boolean;
}

export function useModal() {
  const open = useCallback((options: UseModalOpenOptions = {}): UseModalController => {
    const defer = createDeferred<unknown>();

    const result = modalManager.open({
      title: options.title,
      content: options.content ?? null,
      footer:
        typeof options.footer === 'function'
          ? options.footer
          : options.onOk != null || options.onCancel != null
            ? ({ close, setLoading = () => {}, defer: d }) => (
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  {options.onCancel != null && (
                    <button
                      type="button"
                      onClick={() => {
                        options.onCancel?.({ close, setLoading, defer: d ?? defer });
                        close();
                      }}
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="button"
                    className="primary"
                    onClick={() => {
                      const p = options.onOk?.({ close, setLoading, defer: d ?? defer });
                      if (p instanceof Promise) p.finally(() => close());
                      else close();
                    }}
                  >
                    OK
                  </button>
                </div>
              )
            : options.footer ?? undefined,
      defer: defer as Deferred<unknown>,
      maskClosable: options.maskClosable,
      keyboard: options.keyboard,
    });

    return { close: result.close, setLoading: () => {}, defer };
  }, []);

  const confirm = useCallback((options: UseModalConfirmOptions): Promise<'ok' | 'cancel'> => {
    const defer = createDeferred<'ok' | 'cancel'>();

    modalManager.open({
      type: 'confirm',
      title: options.title,
      content: options.content,
      defer: defer as Deferred<unknown>,
      onOk: options.onOk as (controller: { close: () => void; setLoading: (v: boolean) => void; defer?: Deferred<unknown> }) => void | Promise<void> | undefined,
      onCancel: options.onCancel,
      okText: options.okText,
      cancelText: options.cancelText,
      showCancel: options.showCancel !== false,
      maskClosable: options.maskClosable,
      keyboard: options.keyboard,
    });

    return defer.promise as Promise<'ok' | 'cancel'>;
  }, []);

  const alert = useCallback((options: UseModalConfirmOptions): Promise<'ok' | 'cancel'> => {
    return confirm({ ...options, showCancel: false });
  }, [confirm]);

  return { open, confirm, alert };
}
