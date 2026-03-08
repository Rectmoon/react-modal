import { useState, useCallback, useId, useMemo, useEffect, useRef } from 'react';
import { ModalContext } from './context';
import { ModalOverlay } from './ModalOverlay';
import { ModalPanel } from './ModalPanel';
import type { ModalProps } from './types';

const defaultGetContainer = () =>
  typeof document !== 'undefined' ? document.body : (null as unknown as HTMLElement);

export function Modal({
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
}: ModalProps) {
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
      setVisible(true);
    }
  }, [open]);

  // When controlled and parent sets open to false, notify so confirm promise can resolve
  useEffect(() => {
    if (isControlled && !open) {
      afterOpenChange?.(false);
    }
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

  const contextValue = useMemo(
    () => ({ close, closable }),
    [close, closable]
  );

  const overlayOpen = open || leaving;
  const shouldRenderContent = overlayOpen || !destroyOnClose;
  const container = getContainer?.();

  if (!container) return null;

  return (
    <ModalContext.Provider value={contextValue}>
      <ModalOverlay
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
          <ModalPanel
            title={title}
            footer={footer}
            width={width}
            centered={centered}
            titleId={titleId}
            bodyId={bodyId}
            close={close}
            style={style}
          >
            {children}
          </ModalPanel>
        )}
      </ModalOverlay>
    </ModalContext.Provider>
  );
}
