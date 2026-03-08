import type { ReactNode } from 'react';
import { ModalHeader } from './ModalHeader';
import { ModalBody } from './ModalBody';
import { ModalFooter } from './ModalFooter';

export interface ModalPanelProps {
  title?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode | ((props: { close: () => void }) => ReactNode);
  width?: number | string;
  centered?: boolean;
  titleId?: string;
  bodyId?: string;
  close: () => void;
  className?: string;
  style?: React.CSSProperties;
  'data-testid'?: string;
}

export function ModalPanel({
  title,
  children,
  footer,
  width = 520,
  centered = true,
  titleId,
  bodyId,
  close,
  className = '',
  style = {},
  'data-testid': testId = 'modal-panel',
}: ModalPanelProps) {
  const footerContent =
    typeof footer === 'function' ? footer({ close }) : footer;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title != null ? titleId : undefined}
      aria-describedby={children != null ? bodyId : undefined}
      data-modal-panel
      data-testid={testId}
      className={className}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        ...(centered ? { margin: 'auto' } : {}),
        ...style,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {title != null && (
        <ModalHeader id={titleId}>
          {title}
        </ModalHeader>
      )}
      {children != null && <ModalBody id={bodyId}>{children}</ModalBody>}
      {footerContent != null && <ModalFooter>{footerContent}</ModalFooter>}
    </div>
  );
}
