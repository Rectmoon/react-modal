import Modal from 'react-modal';

export default function ModalOpenExample() {
  const handleOpen = () => {
    Modal.open({
      title: 'Service API 弹窗',
      content: (
        <p style={{ margin: 0 }}>
          通过 <code>Modal.open(options)</code> 打开的弹窗，无需在 JSX 中写 &lt;Modal&gt;。
          返回 <code>close</code> 可手动关闭。
        </p>
      ),
      footer: ({ close }) => (
        <button type="button" className="primary" onClick={close}>
          关闭
        </button>
      ),
    });
    // 可保存 close 在适当时机调用，例如 3 秒后自动关
    // setTimeout(close, 3000);
  };

  return (
    <section className="section">
      <h2>Modal.open() Service API</h2>
      <p>
        不依赖 React 组件树，通过 <code>Modal.open(options)</code> 打开弹窗；
        需在应用根节点挂载 <code>ModalProvider</code>。返回 <code>{'{ close, setLoading, defer }'}</code>，
        可调用 <code>close()</code> 关闭。
      </p>
      <button type="button" className="primary" onClick={handleOpen}>
        打开 Service 弹窗
      </button>
    </section>
  );
}
