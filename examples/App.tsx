import { useState, useEffect } from 'react';
import BasicModalExample from './examples/BasicModal';
import CustomContentExample from './examples/CustomContent';
import ConfirmAsyncExample from './examples/ConfirmAsync';
import MaskEscExample from './examples/MaskEsc';
import MultipleModalsExample from './examples/MultipleModals';
import ModalOpenExample from './examples/ModalOpen';
import UseModalExample from './examples/UseModal';
import DeclarativeControlledExample from './examples/DeclarativeControlled';
import DeclarativeUncontrolledExample from './examples/DeclarativeUncontrolled';
import DeclarativeCustomExample from './examples/DeclarativeCustom';
import DeclarativeDynamicTitleExample from './examples/DeclarativeDynamicTitle';

const EXAMPLES = [
  { id: 'decl-controlled', label: '<Modal> 受控', component: DeclarativeControlledExample },
  { id: 'decl-uncontrolled', label: '<Modal> 非受控', component: DeclarativeUncontrolledExample },
  { id: 'decl-dynamic', label: '<Modal> 动态标题/内容', component: DeclarativeDynamicTitleExample },
  { id: 'decl-custom', label: '<Modal> 自定义内容', component: DeclarativeCustomExample },
  { id: 'basic', label: 'useModal().open() 基础', component: BasicModalExample },
  { id: 'modal-open', label: 'Modal.open() / Modal.alert()', component: ModalOpenExample },
  { id: 'confirm-async', label: 'confirm() 异步', component: ConfirmAsyncExample },
  { id: 'use-modal', label: 'useModal() confirm/alert', component: UseModalExample },
  { id: 'multiple', label: '多弹窗 Modal.open()', component: MultipleModalsExample },
  { id: 'custom', label: '自定义内容 Modal.open()', component: CustomContentExample },
  { id: 'mask-esc', label: '遮罩/ESC Modal.open()', component: MaskEscExample },
];

function getExampleId(): string {
  if (typeof window === 'undefined') return EXAMPLES[0].id;
  const hash = window.location.hash.slice(1) || EXAMPLES[0].id;
  return EXAMPLES.some((e) => e.id === hash) ? hash : EXAMPLES[0].id;
}

export default function App() {
  const [current, setCurrent] = useState(getExampleId);

  useEffect(() => {
    const handleHash = () => setCurrent(getExampleId());
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const ActiveExample = EXAMPLES.find((e) => e.id === current)?.component ?? EXAMPLES[0].component;

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
