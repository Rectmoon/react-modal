import { useState, useEffect } from 'react';
import BasicModalExample from './examples/BasicModal';
import CustomContentExample from './examples/CustomContent';
import ConfirmAsyncExample from './examples/ConfirmAsync';
import MaskEscExample from './examples/MaskEsc';
import MultipleModalsExample from './examples/MultipleModals';
import ModalOpenExample from './examples/ModalOpen';
import UseModalExample from './examples/UseModal';

const EXAMPLES = [
  { id: 'basic', label: '基础 Modal 开关', component: BasicModalExample },
  { id: 'custom', label: '自定义标题/内容/Footer', component: CustomContentExample },
  { id: 'confirm-async', label: 'Confirm 异步关闭', component: ConfirmAsyncExample },
  { id: 'mask-esc', label: '遮罩与 ESC 关闭', component: MaskEscExample },
  { id: 'multiple', label: '多弹窗', component: MultipleModalsExample },
  { id: 'modal-open', label: 'Modal.open() Service API', component: ModalOpenExample },
  { id: 'use-modal', label: 'useModal()', component: UseModalExample },
];

function getExampleId(): string {
  if (typeof window === 'undefined') return 'basic';
  const hash = window.location.hash.slice(1) || 'basic';
  return EXAMPLES.some((e) => e.id === hash) ? hash : 'basic';
}

export default function App() {
  const [current, setCurrent] = useState(getExampleId);

  useEffect(() => {
    const handleHash = () => setCurrent(getExampleId());
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const ActiveExample = EXAMPLES.find((e) => e.id === current)?.component ?? BasicModalExample;

  return (
    <div>
      <h1>React Modal 示例</h1>
      <nav className="nav">
        {EXAMPLES.map(({ id, label }) => (
          <a
            key={id}
            href={`#${id}`}
            className={current === id ? 'active' : ''}
            onClick={(e) => {
              e.preventDefault();
              window.location.hash = id;
              setCurrent(id);
            }}
          >
            {label}
          </a>
        ))}
      </nav>
      <ActiveExample />
    </div>
  );
}
