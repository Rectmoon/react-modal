import { useModal } from 'react-modal';

export default function MaskEscExample() {
  const { open } = useModal();

  return (
    <section className="section">
      <h2>遮罩与 ESC 关闭</h2>
      <p>默认支持点击遮罩关闭与按 ESC 关闭；可通过 maskClosable、keyboard 关闭该行为。</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <button
          type="button"
          className="primary"
          onClick={() =>
            open({
              title: '默认',
              footer: ({ close }) => (
                <button type="button" className="primary" onClick={close}>
                  确定
                </button>
              ),
              content: '可点击遮罩或按 ESC 关闭。',
            })
          }
        >
          默认（遮罩 + ESC）
        </button>
        <button
          type="button"
          onClick={() =>
            open({
              title: '禁止遮罩关闭',
              maskClosable: false,
              footer: ({ close }) => (
                <button type="button" className="primary" onClick={close}>
                  确定
                </button>
              ),
              content: '只能通过按钮或标题栏关闭，点击遮罩无效。',
            })
          }
        >
          禁止点击遮罩关闭
        </button>
        <button
          type="button"
          onClick={() =>
            open({
              title: '禁止 ESC 关闭',
              keyboard: false,
              footer: ({ close }) => (
                <button type="button" className="primary" onClick={close}>
                  确定
                </button>
              ),
              content: '按 ESC 无效，需点击按钮或遮罩关闭。',
            })
          }
        >
          禁止 ESC 关闭
        </button>
      </div>
    </section>
  );
}
