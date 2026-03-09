import { useState, useCallback, useId, useEffect, useRef } from 'react';
import type { ModalProps } from '../types';
import { Overlay, Panel } from './ModalRenderer';

const defaultGetContainer = () =>
  typeof document !== 'undefined' ? document.body : (null as unknown as HTMLElement);

export function Modal(props: ModalProps) {
  const {
    open: controlledOpen,
    defaultOpen = false,
    onOpenChange,
    title,
    children,
    footer,
    maskClosable = true,
    keyboard = true,
    closable = true,
    width = 520,
    centered = true,
    getContainer = defaultGetContainer,
    destroyOnClose = false,
    mask = true,
    afterOpenChange,
    titleId: titleIdProp,
    bodyId: bodyIdProp,
    duration = 200,
    className,
    style,
  } = props;

  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const [leaving, setLeaving] = useState(false);
  const [visible, setVisible] = useState(open);
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const titleId = titleIdProp ?? useId();
  const bodyId = bodyIdProp ?? useId();

  useEffect(() => {
    if (open) {
      setLeaving(false);
      setVisible(false);
      const t = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(t);
    }
  }, [open]);

  useEffect(() => {
    if (isControlled && !open) afterOpenChange?.(false);
  }, [isControlled, open, afterOpenChange]);

  const finishClose = useCallback(() => {
    if (!isControlled) setUncontrolledOpen(false);
    onOpenChange?.(false);
    afterOpenChange?.(false);
    setLeaving(false);
  }, [isControlled, onOpenChange, afterOpenChange]);

  const close = useCallback(() => {
    if (duration > 0) {
      setVisible(false);
      setLeaving(true);
      leaveTimerRef.current = setTimeout(() => {
        leaveTimerRef.current = null;
        finishClose();
      }, duration);
    } else {
      finishClose();
    }
  }, [duration, finishClose]);

  useEffect(() => {
    return () => {
      if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    };
  }, []);

  const overlayOpen = open || leaving;
  const shouldRenderContent = overlayOpen || !destroyOnClose;
  const container = getContainer?.();

  const footerContent =
    typeof footer === 'function' ? footer({ close }) : footer;

  if (!container) return null;

  return (
    <Overlay
      open={overlayOpen}
      visible={visible}
      duration={duration}
      mask={mask}
      maskClosable={maskClosable}
      keyboard={keyboard}
      onClose={close}
      getContainer={getContainer}
      className={className}
    >
      {shouldRenderContent && (
        <Panel
          title={title}
          titleId={titleId}
          bodyId={bodyId}
          footer={footerContent}
          width={width}
          centered={centered}
          close={close}
          closable={closable}
          visible={visible}
          duration={duration}
          style={style}
        >
          {children}
        </Panel>
      )}
    </Overlay>
  );
}
