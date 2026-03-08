# react-modal

可复用、可扩展的 React 弹窗/对话框组件。支持受控/非受控、确认框（confirm）、自定义页脚与无障碍属性。

## 安装

```bash
npm install react-modal
```

要求：`react`、`react-dom` >= 17。

## 快速开始

### 基础 Modal

```tsx
import { Modal } from 'react-modal';

function App() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>打开</button>
      <Modal open={open} onOpenChange={setOpen} title="标题">
        内容区域
      </Modal>
    </>
  );
}
```

### 确认框 confirm

```tsx
import Modal from 'react-modal';

// 默认导出带 confirm / alert 的 Modal
const result = await Modal.confirm({
  title: '确认删除',
  content: '删除后无法恢复，确定继续？',
  okText: '删除',
  cancelText: '取消',
  onOk: async ({ close, setLoading }) => {
    setLoading(true);
    await doDelete();
    setLoading(false);
    close();
  },
});
// result === 'ok' | 'cancel'
```

### 仅确认（Alert 风格）

```tsx
import Modal from 'react-modal';

await Modal.alert({
  title: '提示',
  content: '操作已完成',
  okText: '知道了',
});
```

## API

### Modal 主要属性

| 属性 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `open` | `boolean` | - | 是否打开（受控） |
| `defaultOpen` | `boolean` | `false` | 默认是否打开（非受控） |
| `onOpenChange` | `(open: boolean) => void` | - | 打开状态变化回调 |
| `title` | `ReactNode` | - | 标题 |
| `children` | `ReactNode` | - | 内容 |
| `footer` | `ReactNode \| (props: { close }) => ReactNode` | - | 页脚或渲染函数 |
| `maskClosable` | `boolean` | `true` | 点击遮罩是否关闭 |
| `keyboard` | `boolean` | `true` | 是否支持 ESC 关闭 |
| `closable` | `boolean` | `true` | 是否显示关闭按钮 |
| `width` | `number \| string` | `520` | 宽度（px 或 CSS 值） |
| `centered` | `boolean` | `true` | 是否居中 |
| `getContainer` | `() => HTMLElement` | `() => document.body` | 挂载容器 |
| `destroyOnClose` | `boolean` | `false` | 关闭时销毁内容 |
| `mask` | `boolean` | `true` | 是否显示遮罩 |
| `afterOpenChange` | `(open: boolean) => void` | - | 打开/关闭动画结束后回调 |
| `duration` | `number` | `200` | 过渡时长（ms） |
| `className` / `style` | - | - | 样式 |

### confirm(options)

返回 `Promise<'ok' | 'cancel'>`。

| 选项 | 类型 | 说明 |
|------|------|------|
| `title` | `ReactNode` | 标题 |
| `content` | `ReactNode` | 内容 |
| `onOk` | `(controller) => void \| Promise<void>` | 确定回调；`controller.close()` 关闭并 resolve `'ok'`，`controller.setLoading(bool)` 控制加载态 |
| `onCancel` | `() => void` | 取消回调 |
| `okText` / `cancelText` | `string` | 按钮文案 |
| `showCancel` | `boolean` | 为 `false` 时仅显示确定（类似 alert） |
| `maskClosable` / `keyboard` | `boolean` | 同 Modal |

### 子组件与 Hooks

- `ModalHeader`、`ModalBody`、`ModalFooter`、`ModalPanel`、`ModalOverlay`：可单独使用以自定义布局。
- `useModal()`：在 Modal 内部使用，返回 `{ close, closable }`。
- `ModalContext`：提供 `close` 与 `closable` 的 Context。

## 自定义页脚

```tsx
<Modal
  open={open}
  onOpenChange={setOpen}
  title="自定义页脚"
  footer={({ close }) => (
    <div>
      <button onClick={close}>取消</button>
      <button onClick={() => { doSubmit(); close(); }}>提交</button>
    </div>
  )}
>
  内容
</Modal>
```

## 开发与脚本

```bash
npm install
npm run build    # 构建
npm run test     # 测试
npm run examples # 启动示例（Vite）
```

## License

MIT
