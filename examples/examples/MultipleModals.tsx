import { useState } from 'react';
import Modal from 'react-modal';

export default function MultipleModalsExample() {
  const [firstOpen, setFirstOpen] = useState(false);
  const [secondOpen, setSecondOpen] = useState(false);

  return (
    <section className="section">
      <h2>多弹窗</h2>
      <p>可同时打开多个弹窗；后打开的会叠在上层（z-index 由实现保证）。</p>
      <button type="button" className="primary" onClick={() => setFirstOpen(true)}>
        打开第一个弹窗
      </button>
      <Modal
        open={firstOpen}
        onOpenChange={setFirstOpen}
        title="第一个弹窗"
        footer={({ close }) => (
          <>
            <button type="button" className="primary" onClick={() => setSecondOpen(true)}>
              再打开一个
            </button>
            <button type="button" onClick={close}>关闭</button>
          </>
        )}
      >
        <p style={{ margin: 0 }}>点击「再打开一个」可打开第二个弹窗，形成堆叠。</p>
      </Modal>

      <Modal
        open={secondOpen}
        onOpenChange={setSecondOpen}
        title="第二个弹窗"
        footer={({ close }) => <button type="button" className="primary" onClick={close}>关闭</button>}
      >
        <p style={{ margin: 0 }}>这是第二个弹窗，会叠在第一个之上。</p>
      </Modal>
    </section>
  );
}
