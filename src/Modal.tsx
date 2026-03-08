import { useState, useCallback, useId, useMemo } from 'react';
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
  className,
  style,
}: ModalProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const titleId = titleIdProp ?? useId();
  const bodyId = bodyIdProp ?? useId();

  const close = useCallback(() => {
    if (!isControlled) setUncontrolledOpen(false);
    onOpenChange?.(false);
    afterOpenChange?.(false);
  }, [isControlled, onOpenChange, afterOpenChange]);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
      afterOpenChange?.(next);
    },
    [isControlled, onOpenChange, afterOpenChange]
  );

  const contextValue = useMemo(
    () => ({ close, closable }),
    [close, closable]
  );

  const shouldRenderContent = open || !destroyOnClose;
  const container = getContainer?.();

  if (!container) return null;

  return (
    <ModalContext.Provider value={contextValue}>
      <ModalOverlay
        open={open}
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
