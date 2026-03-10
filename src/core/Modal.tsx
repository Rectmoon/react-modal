import {
  useState,
  useCallback,
  useId,
  useMemo,
  useEffect,
  useRef,
  ReactNode
} from "react";
import { createPortal } from "react-dom";
import { modalManager } from "../manager/ModalManager";
import { useScrollLock } from "../manager/useScrollLock";
import { useFocusTrap } from "./FocusTrap";
import type { ModalItem } from "../manager/ModalManager";
import type { ModalProps } from "../types";

// ----- 进入/离开过渡（原 useModalTransition） -----

export const defaultGetContainer = () =>
  typeof document !== "undefined"
    ? document.body
    : (null as unknown as HTMLElement);

export interface UseModalTransitionOptions {
  /** 动画时长，≤0 表示无动画 */
  duration?: number;
  /** 关闭动画结束后的回调 */
  onClosed?: () => void;
}

/**
 * 进入/离开动画 + 延迟关闭。
 * - open 为 true 时在下一帧将 visible 置为 true（进入动画）
 * - close() 时先置 visible 为 false，duration 后再调用 onClosed（离开动画）
 */
export function useModalTransition(
  open: boolean,
  options: UseModalTransitionOptions = {},
) {
  const { duration = 200, onClosed } = options;
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (open) {
      setLeaving(false);
      const t = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(t);
    } else {
      setVisible(false);
    }
  }, [open]);

  const close = useCallback(() => {
    if (leaving) return;
    if (duration <= 0) {
      onClosed?.();
      return;
    }
    setVisible(false);
    setLeaving(true);
    leaveTimerRef.current = setTimeout(() => {
      leaveTimerRef.current = null;
      onClosed?.();
    }, duration);
  }, [duration, leaving, onClosed]);

  useEffect(() => {
    return () => {
      if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    };
  }, []);

  return { visible, close, leaving };
}

// ----- Shared overlay + panel -----

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
  className = "",
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
  const container =
    getContainer?.() ??
    (typeof document !== "undefined" ? document.body : null);
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
        position: "fixed",
        inset: 0,
        zIndex,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: visible ? 1 : 0,
        transition: `opacity ${duration}ms ease`,
        ...(mask
          ? { backgroundColor: "rgba(0,0,0,0.45)" }
          : { backgroundColor: "transparent", pointerEvents: "none" }),
      }}
    >
      <div
        ref={contentRef}
        tabIndex={-1}
        style={{
          flex: 1,
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: mask ? "auto" : "none",
          outline: "none",
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
  className = "",
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
        width: typeof width === "number" ? `${width}px` : width,
        ...(centered ? { margin: "auto" } : {}),
        transform: visible ? "scale(1)" : "scale(0.95)",
        opacity: visible ? 1 : 0,
        transition: `transform ${duration}ms ease, opacity ${duration}ms ease`,
        backgroundColor: "var(--modal-bg, #fff)",
        borderRadius: "var(--modal-radius, 8px)",
        boxShadow: "var(--modal-shadow, 0 4px 12px rgba(0,0,0,0.15))",
        ...style,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {title != null && (
        <div id={titleId} className="modal-header" data-modal-header>
          <div data-modal-title>{title}</div>
          {closable && (
            <button
              type="button"
              data-modal-close
              onClick={close}
              aria-label="Close"
            >
              ×
            </button>
          )}
        </div>
      )}
      {children != null && (
        <div
          id={bodyId}
          className="modal-body"
          data-modal-body
          role="region"
          aria-label="Modal content"
        >
          {children}
        </div>
      )}
      {footer != null && (
        <div className="modal-footer" data-modal-footer>
          {footer}
        </div>
      )}
    </div>
  );
}

// ----- 声明式：仅同步到 Manager，UI 由 ModalProvider + 同一 Modal 渲染 -----

function DeclarativeToManager(props: ModalProps) {
  const {
    open: controlledOpen,
    defaultOpen = false,
    onOpenChange,
    afterOpenChange,
  } = props;

  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const idRef = useRef<string | null>(null);
  const mountedRef = useRef(true);
  const openGenRef = useRef(0);
  const propsRef = useRef(props);
  propsRef.current = props;

  const handleClose = useCallback(() => {
    if (!isControlled) setUncontrolledOpen(false);
    onOpenChange?.(false);
    afterOpenChange?.(false);
  }, [isControlled, onOpenChange, afterOpenChange]);

  // 用 useEffect + queueMicrotask：在 React 提交后再推栈，避免在生命周期内 notify 导致 Provider 不更新；非受控/key 切换时弹窗能稳定出现
  // openGenRef：Strict Mode 下 effect 会跑两遍、排两个微任务，只有「当前代次」的微任务真正 open，避免出现两个弹窗
  useEffect(() => {
    if (open) {
      mountedRef.current = true;
      const gen = ++openGenRef.current;
      queueMicrotask(() => {
        if (!mountedRef.current || gen !== openGenRef.current) return;
        const p = propsRef.current;
        const footerNode =
          typeof p.footer === "function"
            ? (opts: { close: () => void }) =>
                (p.footer as (props: { close: () => void }) => ReactNode)({
                  close: opts.close,
                })
            : p.footer;
        const { id } = modalManager.open({
          title: p.title,
          content: p.children,
          footer: footerNode,
          maskClosable: p.maskClosable ?? true,
          keyboard: p.keyboard ?? true,
          getContainer: p.getContainer ?? defaultGetContainer,
          mask: p.mask !== false,
          width: p.width ?? 520,
          duration: p.duration ?? 200,
          onClose: handleClose,
        });
        if (mountedRef.current) idRef.current = id;
        else modalManager.close(id);
      });
      return () => {
        mountedRef.current = false;
        if (idRef.current) {
          modalManager.close(idRef.current);
          idRef.current = null;
        }
      };
    } else if (idRef.current) {
      modalManager.close(idRef.current);
      idRef.current = null;
    }
  }, [open, handleClose]);

  // 弹窗已打开时，业务侧 title/content/footer 等变化时同步到 Manager，保证动态标题等能更新
  useEffect(() => {
    if (!open || !idRef.current) return;
    const p = propsRef.current;
    const footerNode =
      typeof p.footer === "function"
        ? (opts: { close: () => void }) =>
            (p.footer as (props: { close: () => void }) => ReactNode)({
              close: opts.close,
            })
        : p.footer;
    modalManager.update(idRef.current, {
      title: p.title,
      content: p.children,
      footer: footerNode,
      maskClosable: p.maskClosable ?? true,
      keyboard: p.keyboard ?? true,
      getContainer: p.getContainer ?? defaultGetContainer,
      mask: p.mask !== false,
      width: p.width ?? 520,
      duration: p.duration ?? 200,
    });
  }, [open, props]);

  return null;
}

// ----- 唯一 UI 实现：Manager 驱动（ModalProvider 渲染的 item 或直接传 id/content/options） -----

const DEFAULT_DURATION = 200;

export function ModalRenderer(props: ModalItem) {
  const { id, title, content, zIndex, options: opts } = props;
  const {
    onOk,
    onCancel,
    defer,
    maskClosable = true,
    keyboard = true,
    duration = DEFAULT_DURATION,
  } = opts ?? {};
  const titleId = useId();
  const bodyId = useId();
  const [loading, setLoading] = useState(false);

  const doClose = useCallback(() => modalManager.close(id), [id]);
  const { visible, close } = useModalTransition(true, {
    duration,
    onClosed: doClose,
  });

  const closeWithOk = useCallback(() => {
    defer?.resolve("ok");
    close();
  }, [close, defer]);

  const controller = useMemo(
    () => ({
      close: opts?.type === "confirm" ? closeWithOk : close,
      setLoading,
      defer,
    }),
    [close, closeWithOk, opts?.type, defer],
  );

  const handleOk = useCallback(async () => {
    if (!onOk) {
      defer?.resolve("ok");
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
    defer?.resolve("cancel");
    close();
  }, [onCancel, defer, close]);

  useEffect(() => {
    const d = defer;
    if (!d) return;
    d.promise.then(close, close);
  }, [defer, close]);

  const showCancel =
    opts?.type === "confirm" &&
    opts.showCancel !== false &&
    opts.cancelText != null;
  const cancelText = opts?.cancelText ?? "Cancel";
  const okText = opts?.okText ?? "OK";

  const footerContent =
    opts?.type === "confirm" ? (
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        {showCancel && (
          <button type="button" onClick={handleCancel} disabled={loading}>
            {cancelText}
          </button>
        )}
        <button type="button" onClick={handleOk} disabled={loading}>
          {loading ? "Loading..." : okText}
        </button>
      </div>
    ) : typeof opts?.footer === "function" ? (
      opts.footer({ close, setLoading, defer: opts.defer })
    ) : (
      (opts?.footer ?? null)
    );

  const onClose = maskClosable
    ? opts?.type === "confirm"
      ? handleCancel
      : close
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
        close={opts?.type === "confirm" ? closeWithOk : close}
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

// ----- 导出：仅声明式；Manager 项由 ModalProvider 用 ModalFromManager 渲染 -----

/** 声明式 <Modal open={} />，内部同步到 Manager，UI 由 ModalProvider 渲染 */
export default function Modal(props: ModalProps) {
  return <DeclarativeToManager {...props} />;
}
