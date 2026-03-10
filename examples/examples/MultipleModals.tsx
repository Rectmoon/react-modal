import { useModal } from 'react-modal';

export default function MultipleModalsExample() {
  const { open } = useModal();

  return (
    <section className="section">
      <h2>多弹窗</h2>
      <p>可同时打开多个弹窗；后打开的会叠在上层（z-index 由实现保证）。</p>
      <button
        type="button"
        className="primary"
        onClick={() =>
          open({
            title: '第一个弹窗',
            footer: ({ close }) => (
              <>
                <button
                  type="button"
                  className="primary"
                  onClick={() =>
                    open({
                      title: '第二个弹窗',
                      footer: ({ close: c }) => (
                        <button type="button" className="primary" onClick={c}>
                          关闭
                        </button>
                      ),
                      content: <p style={{ margin: 0 }}>这是第二个弹窗，会叠在第一个之上。</p>,
                    })
                  }
                >
                  再打开一个
                </button>
                <button type="button" onClick={close}>
                  关闭
                </button>
              </>
            ),
            content: (
              <p style={{ margin: 0 }}>点击「再打开一个」可打开第二个弹窗，形成堆叠。</p>
            ),
          })
        }
      >
        打开第一个弹窗
      </button>
    </section>
  );
}
