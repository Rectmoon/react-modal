import type { ReactNode } from 'react';
import { useState, useCallback, useId, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { modalManager } from '../manager/ModalManager';
import type { ModalItem, OpenModalOptions } from '../manager/ModalManager';
import { useScrollLock } from '../manager/useScrollLock';
import { useFocusTrap } from './FocusTrap';

const defaultGetContainer = () =>
  typeof document !== 'undefined' ? document.body : (null as unknown as HTMLElement);

// ----- Shared overlay + panel (used by ManagerModal; exported for Modal.tsx) -----

export function Overlay({
  open,
  visible = true,
  duration = 200,
  mask = true,
  maskClosable = true,
  keyboard = true,
  onClose,
  zIndex = 1000,
  getContainer,
  className = '',
  children,
}: {
  open: boolean;
  visible?: boolean;
  duration?: number;
  mask?: boolean;
  maskClosable?: boolean;
  keyboard?: boolean;
  onClose: () => void;
  zIndex?: number;
  getContainer?: () => HTMLElement;
  className?: string;
  children: ReactNode;
}) {
  const container = getContainer?.() ?? (typeof document !== 'undefined' ? document.body : null);
  const contentRef = useRef<HTMLDivElement>(null);

  useScrollLock(open);
  useFocusTrap(contentRef, {
    active: open,
    onEscape: keyboard ? onClose : undefined,
    keyboard,
  });

  const handleOverlayClick = () => {
    if (maskClosable) onClose();
  };

  if (!open || !container) return null;

  const overlay = (
    <div
      data-modal-overlay
      className={className}
      role="presentation"
      onClick={mask ? handleOverlayClick : undefined}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: visible ? 1 : 0,
        transition: `opacity ${duration}ms ease`,
        ...(mask
          ? { backgroundColor: 'rgba(0,0,0,0.45)' }
          : { backgroundColor: 'transparent', pointerEvents: 'none' }),
      }}
    >
      <div
        ref={contentRef}
        tabIndex={-1}
        style={{
          flex: 1,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: mask ? 'auto' : 'none',
          outline: 'none',
        }}
        onClick={mask ? handleOverlayClick : undefined}
      >
        {children}
      </div>
    </div>
  );

  return createPortal(overlay, container);
}

export function Panel({
  title,
  children,
  footer,
  width = 520,
  centered = true,
  titleId,
  bodyId,
  close,
  closable = true,
  visible = true,
  duration = 200,
  style = {},
  className = '',
}: {
  title?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  width?: number | string;
  centered?: boolean;
  titleId?: string;
  bodyId?: string;
  close: () => void;
  closable?: boolean;
  visible?: boolean;
  duration?: number;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title != null ? titleId : undefined}
      aria-describedby={children != null ? bodyId : undefined}
      data-modal-panel
      className={className}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        ...(centered ? { margin: 'auto' } : {}),
        transform: visible ? 'scale(1)' : 'scale(0.95)',
        opacity: visible ? 1 : 0,
        transition: `transform ${duration}ms ease, opacity ${duration}ms ease`,
        backgroundColor: 'var(--modal-bg, #fff)',
        borderRadius: 'var(--modal-radius, 8px)',
        boxShadow: 'var(--modal-shadow, 0 4px 12px rgba(0,0,0,0.15))',
        ...style,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {title != null && (
        <div id={titleId} className="modal-header" data-modal-header>
          <div data-modal-title>{title}</div>
          {closable && (
            <button type="button" data-modal-close onClick={close} aria-label="Close">
              ×
            </button>
          )}
        </div>
      )}
      {children != null && (
        <div id={bodyId} className="modal-body" data-modal-body role="region" aria-label="Modal content">
          {children}
        </div>
      )}
      {footer != null && <div className="modal-footer" data-modal-footer>{footer}</div>}
    </div>
  );
}

// ----- Manager-driven: one modal from ModalManager -----

const DEFAULT_DURATION = 200;

export default function ModalRenderer(props: ModalItem) {
  const { id, title, content, zIndex, options: opts } = props;
  const { onOk, onCancel, defer, maskClosable = true, keyboard = true, duration = DEFAULT_DURATION } = opts ?? {};
  const titleId = useId();
  const bodyId = useId();
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const doClose = useCallback(() => {
    modalManager.close(id);
  }, [id]);

  const close = useCallback(() => {
    if (leaving) return;
    if (duration <= 0) {
      doClose();
      return;
    }
    setVisible(false);
    setLeaving(true);
    leaveTimerRef.current = setTimeout(() => {
      leaveTimerRef.current = null;
      doClose();
    }, duration);
  }, [duration, leaving, doClose]);

  useEffect(() => {
    return () => {
      if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    };
  }, []);

  const closeWithOk = useCallback(() => {
    defer?.resolve('ok');
    close();
  }, [close, defer]);

  const controller = useMemo(
    () => ({ close: opts?.type === 'confirm' ? closeWithOk : close, setLoading, defer }),
    [close, closeWithOk, opts?.type, defer]
  );

  const handleOk = useCallback(async () => {
    if (!onOk) {
      defer?.resolve('ok');
      close();
      return;
    }
    try {
      await onOk(controller);
    } catch {
      // leave open on error
    }
  }, [onOk, controller, close, defer]);

  const handleCancel = useCallback(() => {
    onCancel?.();
    defer?.resolve('cancel');
    close();
  }, [onCancel, defer, close]);

  useEffect(() => {
    const d = defer;
    if (!d) return;
    d.promise.then(close, close);
  }, [defer, close]);

  const showCancel = opts?.type === 'confirm' && opts.showCancel !== false && opts.cancelText != null;
  const cancelText = opts?.cancelText ?? 'Cancel';
  const okText = opts?.okText ?? 'OK';

  const footerContent =
    opts?.type === 'confirm'
      ? (
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            {showCancel && (
              <button type="button" onClick={handleCancel} disabled={loading}>
                {cancelText}
              </button>
            )}
            <button type="button" onClick={handleOk} disabled={loading}>
              {loading ? 'Loading...' : okText}
            </button>
          </div>
        )
      : typeof opts?.footer === 'function'
        ? opts.footer({ close, setLoading, defer: opts.defer })
        : opts?.footer ?? null;

  const onClose = maskClosable
    ? (opts?.type === 'confirm' ? handleCancel : close)
    : () => {};

  const getContainer = opts?.getContainer ?? defaultGetContainer;
  const overlayOpen = true;

  return (
    <Overlay
      open={overlayOpen}
      visible={visible}
      duration={duration}
      mask={opts?.mask !== false}
      maskClosable={maskClosable}
      keyboard={keyboard}
      onClose={onClose}
      zIndex={zIndex}
      getContainer={getContainer}
    >
      <Panel
        title={title}
        titleId={titleId}
        bodyId={bodyId}
        close={opts?.type === 'confirm' ? closeWithOk : close}
        closable={false}
        width={opts?.width ?? 520}
        footer={footerContent}
        visible={visible}
        duration={duration}
      >
        {content}
      </Panel>
    </Overlay>
  );
}
