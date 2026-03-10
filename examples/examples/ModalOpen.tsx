import Modal from 'react-modal';

export default function ModalOpenExample() {
  const handleOpen = () => {
    Modal.open({
      title: 'Modal.open() 弹窗',
      content: (
        <p style={{ margin: 0 }}>
          通过 <code>Modal.open(options)</code> 打开，无需在 JSX 中写 &lt;Modal&gt;。
          返回 <code>{'{ close, setLoading, defer }'}</code> 可手动关闭。
        </p>
      ),
      footer: ({ close }) => (
        <button type="button" className="primary" onClick={close}>
          关闭
        </button>
      ),
    });
  };

  const handleAlert = () => {
    Modal.alert({
      title: '提示',
      content: '这是 <code>Modal.alert(options)</code>，仅确定按钮，无取消。',
    });
  };

  return (
    <section className="section">
      <h2>Modal.open() / Modal.alert() 静态方法</h2>
      <p>
        不依赖组件树：<code>Modal.open(options)</code> 返回 <code>close</code> 等；
        <code>Modal.alert(options)</code> 仅确定按钮。需在根节点挂载 <code>ModalProvider</code>。
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <button type="button" className="primary" onClick={handleOpen}>
          Modal.open()
        </button>
        <button type="button" onClick={handleAlert}>
          Modal.alert()
        </button>
      </div>
    </section>
  );
}
