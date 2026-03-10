import { useState } from 'react';
import { Modal } from 'react-modal';

/**
 * 声明式：受控用法 <Modal open={open} onOpenChange={setOpen} />
 */
export default function DeclarativeControlledExample() {
  const [open, setOpen] = useState(false);

  return (
    <section className="section">
      <h2>声明式 Modal（受控）</h2>
      <p>
        使用 <code>{'<Modal open={open} onOpenChange={setOpen} />'}</code>，
        open 与 onOpenChange 由父组件状态控制。
      </p>
      <button type="button" className="primary" onClick={() => setOpen(true)}>
        打开弹窗
      </button>
      <Modal
        open={open}
        onOpenChange={setOpen}
        title="受控弹窗"
        footer={({ close }: { close: () => void }) => (
          <button type="button" className="primary" onClick={close}>
            确定
          </button>
        )}
      >
        <p style={{ margin: 0 }}>内容由父组件 state 控制显示/隐藏。</p>
      </Modal>
    </section>
  );
}
