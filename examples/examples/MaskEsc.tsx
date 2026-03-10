import Modal from 'react-modal';

export default function MaskEscExample() {
  const openDefault = () => {
    Modal.open({
      title: '默认',
      content: '可点击遮罩或按 ESC 关闭。',
      footer: ({ close }) => (
        <button type="button" className="primary" onClick={close}>
          确定
        </button>
      ),
    });
  };

  const openNoMaskClose = () => {
    Modal.open({
      title: '禁止遮罩关闭',
      maskClosable: false,
      content: '只能通过按钮关闭，点击遮罩无效。',
      footer: ({ close }) => (
        <button type="button" className="primary" onClick={close}>
          确定
        </button>
      ),
    });
  };

  const openNoEsc = () => {
    Modal.open({
      title: '禁止 ESC 关闭',
      keyboard: false,
      content: '按 ESC 无效，需点击按钮或遮罩关闭。',
      footer: ({ close }) => (
        <button type="button" className="primary" onClick={close}>
          确定
        </button>
      ),
    });
  };

  return (
    <section className="section">
      <h2>遮罩与 ESC 关闭（Modal.open）</h2>
      <p>通过 <code>Modal.open(options)</code> 的 <code>maskClosable</code>、<code>keyboard</code> 控制：默认支持点击遮罩与按 ESC 关闭。</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <button type="button" className="primary" onClick={openDefault}>
          默认（遮罩 + ESC）
        </button>
        <button type="button" onClick={openNoMaskClose}>
          禁止点击遮罩关闭
        </button>
        <button type="button" onClick={openNoEsc}>
          禁止 ESC 关闭
        </button>
      </div>
    </section>
  );
}
