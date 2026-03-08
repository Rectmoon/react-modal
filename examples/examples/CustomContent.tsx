import { useState } from 'react';
import Modal from 'react-modal';

export default function CustomContentExample() {
  const [open, setOpen] = useState(false);

  return (
    <section className="section">
      <h2>自定义标题 / 内容 / Footer</h2>
      <p>标题、正文和底部按钮均可自定义为任意 React 节点；footer 支持函数形式获取 close。</p>
      <button type="button" className="primary" onClick={() => setOpen(true)}>
        打开自定义弹窗
      </button>
      <Modal
        open={open}
        onOpenChange={setOpen}
        title={<span style={{ color: '#0969da' }}>自定义标题</span>}
        footer={({ close }) => (
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
          <p>自定义内容区域，可以放表单、列表等。</p>
          <input type="text" placeholder="输入框" style={{ width: '100%', padding: 8 }} />
        </div>
      </Modal>
    </section>
  );
}
