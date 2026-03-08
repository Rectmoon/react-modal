import { useState } from 'react';
import Modal from 'react-modal';

export default function MaskEscExample() {
  const [maskOpen, setMaskOpen] = useState(false);
  const [noMaskOpen, setNoMaskOpen] = useState(false);
  const [noEscOpen, setNoEscOpen] = useState(false);

  return (
    <section className="section">
      <h2>遮罩与 ESC 关闭</h2>
      <p>默认支持点击遮罩关闭与按 ESC 关闭；可通过 maskClosable、keyboard 关闭该行为。</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <button type="button" className="primary" onClick={() => setMaskOpen(true)}>
          默认（遮罩 + ESC）
        </button>
        <button type="button" onClick={() => setNoMaskOpen(true)}>
          禁止点击遮罩关闭
        </button>
        <button type="button" onClick={() => setNoEscOpen(true)}>
          禁止 ESC 关闭
        </button>
      </div>

      <Modal
        open={maskOpen}
        onOpenChange={setMaskOpen}
        title="默认"
        footer={({ close }) => <button type="button" className="primary" onClick={close}>确定</button>}
      >
        可点击遮罩或按 ESC 关闭。
      </Modal>

      <Modal
        open={noMaskOpen}
        onOpenChange={setNoMaskOpen}
        maskClosable={false}
        title="禁止遮罩关闭"
        footer={({ close }) => <button type="button" className="primary" onClick={close}>确定</button>}
      >
        只能通过按钮或标题栏关闭，点击遮罩无效。
      </Modal>

      <Modal
        open={noEscOpen}
        onOpenChange={setNoEscOpen}
        keyboard={false}
        title="禁止 ESC 关闭"
        footer={({ close }) => <button type="button" className="primary" onClick={close}>确定</button>}
      >
        按 ESC 无效，需点击按钮或遮罩关闭。
      </Modal>
    </section>
  );
}
