import Modal, { confirm } from 'react-modal';

function fakeDeleteApi(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 1500);
  });
}

export default function ConfirmAsyncExample() {
  const handleDelete = () => {
    confirm({
      title: '删除确认',
      content: '确定要删除该项吗？删除后不可恢复。',
      okText: '删除',
      cancelText: '取消',
      onOk: async ({ close, setLoading }) => {
        try {
          setLoading(true);
          await fakeDeleteApi();
          close();
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleDeleteWithError = () => {
    confirm({
      title: '模拟失败',
      content: '点击确定将模拟接口失败，弹窗不会关闭。',
      okText: '确定',
      onOk: async ({ setLoading }) => {
        try {
          setLoading(true);
          await new Promise((_, reject) => setTimeout(() => reject(new Error('Network error')), 800));
        } catch {
          alert('接口失败，请重试');
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleDefer = () => {
    confirm({
      title: 'Deferred 模式',
      content: '异步完成后通过 defer.resolve("ok") 关闭并 resolve，无需手动调用 close()。',
      okText: '提交',
      cancelText: '取消',
      onOk: async ({ defer, setLoading }) => {
        setLoading(true);
        await new Promise((r) => setTimeout(r, 1200));
        setLoading(false);
        defer?.resolve('ok');
      },
    });
  };

  return (
    <section className="section">
      <h2>Confirm 异步关闭</h2>
      <p>
        使用 onOk 的控制器 close / setLoading：接口成功后再 close()，请求期间 setLoading(true) 防止重复点击；接口失败不调用 close，弹窗保持打开。Deferred 模式可用 defer.resolve("ok") 替代 close()。
      </p>
      <button type="button" className="primary" onClick={handleDelete}>
        删除（模拟 1.5s 后成功关闭）
      </button>
      <span style={{ marginLeft: 8 }} />
      <button type="button" onClick={handleDeleteWithError}>
        模拟失败（不关闭）
      </button>
      <span style={{ marginLeft: 8 }} />
      <button type="button" className="primary" onClick={handleDefer}>
        Deferred 模式（defer.resolve）
      </button>
    </section>
  );
}
 