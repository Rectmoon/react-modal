import { useState } from 'react';
import { Modal } from 'react-modal';

/**
 * 声明式：弹窗打开后 title / content 等可随父组件 state 动态更新，会同步到 Manager 并刷新 UI。
 * 用于更新标题的按钮放在弹窗内容（children）内，避免被遮罩遮挡无法点击。
 */
export default function DeclarativeDynamicTitleExample() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('初始标题');
  const [step, setStep] = useState(0);

  return (
    <section className="section">
      <h2>声明式 Modal（动态标题/内容）</h2>
      <p>
        受控 <code>open</code> 下，<code>title</code>、<code>children</code>、<code>footer</code> 等在弹窗打开后仍可随父组件 state
        变化而更新，会同步到 Manager，无需关闭再打开。
      </p>
      <button type="button" className="primary" onClick={() => setOpen(true)}>
        打开弹窗
      </button>
      <Modal
        open={open}
        onOpenChange={setOpen}
        title={title}
        footer={({ close }: { close: () => void }) => (
          <button type="button" className="primary" onClick={close}>
            关闭
          </button>
        )}
      >
        <div>
          <p style={{ margin: '0 0 12px 0' }}>
            当前标题：<strong>{title}</strong>（步骤 {step}）。点击下方按钮可更新标题。
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => {
                setStep((s) => s + 1);
                setTitle(`步骤 ${step + 1}`);
              }}
            >
              更换标题
            </button>
            <button type="button" onClick={() => setTitle('自定义：' + Date.now())}>
              随机标题
            </button>
          </div>
        </div>
      </Modal>
    </section>
  );
}
