import Modal from 'react-modal';

export default function CustomContentExample() {
  const handleOpen = () => {
    Modal.open({
      title: <span style={{ color: '#0969da' }}>自定义标题</span>,
      content: (
        <div>
          <p>自定义内容区域，可以放表单、列表等。使用 <code>Modal.open(options)</code> 时同样支持 React 节点。</p>
          <input type="text" placeholder="输入框" style={{ width: '100%', padding: 8 }} />
        </div>
      ),
      footer: ({ close }) => (
        <>
          <button type="button" onClick={close}>
            取消
          </button>
          <button type="button" className="primary" onClick={close}>
            提交
          </button>
        </>
      ),
    });
  };

  return (
    <section className="section">
      <h2>自定义标题 / 内容 / Footer（Modal.open）</h2>
      <p>用 <code>Modal.open(options)</code> 时，title、content、footer 均可传入任意 React 节点；footer 为函数时接收 <code>{'{ close }'}</code>。</p>
      <button type="button" className="primary" onClick={handleOpen}>
        打开自定义弹窗
      </button>
    </section>
  );
}
