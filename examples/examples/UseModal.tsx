import { useModal } from 'react-modal';

function fakeSubmit(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 1200));
}

export default function UseModalExample() {
  const { open, confirm, alert } = useModal();

  const handleOpen = () => {
    const { close } = open({
      title: 'useModal().open()',
      content: (
        <p style={{ margin: 0 }}>
          通过 <code>useModal()</code> 在组件内拿到 <code>open / confirm / alert</code>，
          与 BasicModal 使用同一套 Overlay + Panel，样式与交互一致。
        </p>
      ),
      footer: ({ close }) => (
        <button type="button" className="primary" onClick={close}>
          确定
        </button>
      ),
    });
  };

  const handleConfirm = () => {
    confirm({
      title: '确认',
      content: '是否继续？',
      onOk: ({ close }) => close(),
    });
  };

  const handleAlert = () => {
    alert({
      title: '提示',
      content: '这是一条提示信息。',
    });
  };

  const handleConfirmAsync = () => {
    confirm({
      title: '提交确认',
      content: '确定提交？提交后将模拟 1.2s 请求再关闭。',
      okText: '提交',
      cancelText: '取消',
      onOk: async ({ close, setLoading }) => {
        try {
          setLoading(true);
          await fakeSubmit();
          close();
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleConfirmAsyncError = () => {
    confirm({
      title: '模拟失败',
      content: '点击确定将模拟请求失败，弹窗不关闭。',
      okText: '确定',
      onOk: async ({ setLoading }) => {
        try {
          setLoading(true);
          await new Promise((_, reject) => setTimeout(() => reject(new Error('Network error')), 800));
        } catch {
          window.alert('请求失败，请重试');
        } finally {
          setLoading(false);
        }
      },
    });
  };

  return (
    <section className="section">
      <h2>useModal()</h2>
      <p>
        在组件内调用 <code>useModal()</code> 获取 <code>{'{ open, confirm, alert }'}</code>，
        需在应用根节点挂载 <code>ModalProvider</code>。<code>confirm</code> 支持异步 <code>onOk</code>：<code>setLoading(true)</code> 防重复点击，请求完成后 <code>close()</code>。
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <button type="button" className="primary" onClick={handleOpen}>
          open()
        </button>
        <button type="button" onClick={handleConfirm}>
          confirm()
        </button>
        <button type="button" onClick={handleAlert}>
          alert()
        </button>
        <button type="button" className="primary" onClick={handleConfirmAsync}>
          confirm() 异步
        </button>
        <button type="button" onClick={handleConfirmAsyncError}>
          confirm() 异步失败
        </button>
      </div>
    </section>
  );
}
