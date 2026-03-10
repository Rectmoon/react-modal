import { useState } from 'react';
import { Modal } from 'react-modal';

/**
 * 声明式非受控：不传 open，只传 defaultOpen，由 Modal 内部维护是否打开。
 * 点击后挂载 <Modal defaultOpen={true} />，仅会打开一个弹窗（React Strict Mode 下亦然）。
 */
export default function DeclarativeUncontrolledExample() {
  const [mounted, setMounted] = useState(false);

  return (
    <section className="section">
      <h2>声明式 Modal（非受控）</h2>
      <p>
        <strong>非受控</strong>：不传 <code>open</code>，只传{" "}
        <code>defaultOpen</code>，由 Modal 内部维护开关。 Modal 始终在树里；
        <code>defaultOpen=false</code> 时不推栈，点击后切到{" "}
        <code>defaultOpen=true</code> 的实例（通过 key 切换），弹窗出现。
      </p>
      <button
        type="button"
        className="primary"
        onClick={() => setMounted(true)}
      >
        打开弹窗
      </button>
      {mounted && (
        <Modal
          defaultOpen={true}
          onOpenChange={(next) => {
            if (!next) setMounted(false);
          }}
          title="非受控弹窗"
          footer={({ close }: { close: () => void }) => (
            <button type="button" className="primary" onClick={close}>
              关闭
            </button>
          )}
        >
          <p style={{ margin: 0 }}>
            未传 open，由 defaultOpen 控制；关闭后
            setShow(false)，再次点击可重新打开。
          </p>
        </Modal>
      )}
    </section>
  );
}
