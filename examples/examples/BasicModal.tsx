import { useModal } from 'react-modal';

export default function BasicModalExample() {
  const { open } = useModal();

  return (
    <section className="section">
      <h2>基础 Modal 开关</h2>
      <p>通过 useModal().open() 打开弹窗，点击确定或遮罩关闭。</p>
      <button
        type="button"
        className="primary"
        onClick={() =>
          open({
            title: '基础弹窗',
            footer: ({ close }) => (
              <button type="button" className="primary" onClick={close}>
                确定
              </button>
            ),
            content: <p style={{ margin: 0 }}>这是弹窗内容。点击确定或遮罩关闭。</p>,
          })
        }
      >
        打开弹窗
      </button>
    </section>
  );
}
