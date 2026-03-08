import { useState } from 'react';
import Modal from 'react-modal';

export default function BasicModalExample() {
  const [open, setOpen] = useState(false);

  return (
    <section className="section">
      <h2>基础 Modal 开关</h2>
      <p>受控方式：通过 open 与 onOpenChange 控制显示/隐藏。</p>
      <button type="button" className="primary" onClick={() => setOpen(true)}>
        打开弹窗
      </button>
      <Modal
        open={open}
        onOpenChange={setOpen}
        title="基础弹窗"
        footer={({ close }) => (
          <button type="button" className="primary" onClick={close}>
            确定
          </button>
        )}
      >
        <p style={{ margin: 0 }}>这是弹窗内容。点击确定或遮罩关闭。</p>
      </Modal>
    </section>
  );
}
