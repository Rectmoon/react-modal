import { useState } from 'react';
import { Modal } from 'react-modal';

/**
 * 声明式：自定义 title / content / footer，maskClosable、closable 等
 */
export default function DeclarativeCustomExample() {
  const [open, setOpen] = useState(false);

  return (
    <section className="section">
      <h2>声明式 Modal（自定义内容）</h2>
      <p>
        <code>{'<Modal>'}</code> 下 title、children、footer 均为 React 节点；
        footer 可为函数 <code>{'({ close }) => ...'}</code>，
        支持 <code>closable</code>、<code>maskClosable</code>、<code>width</code> 等。
      </p>
      <button type="button" className="primary" onClick={() => setOpen(true)}>
        打开自定义弹窗
      </button>
      <Modal
        open={open}
        onOpenChange={setOpen}
        title={<span style={{ color: '#0969da' }}>自定义标题</span>}
        width={480}
        closable
        footer={({ close }: { close: () => void }) => (
          <>
            <button type="button" onClick={close}>
              取消
            </button>
            <button type="button" className="primary" onClick={close}>
              提交
            </button>
          </>
        )}
      >
        <div>
          <p>自定义内容区域，可放表单、列表等。</p>
          <input type="text" placeholder="输入框" style={{ width: '100%', padding: 8 }} />
        </div>
      </Modal>
    </section>
  );
}
