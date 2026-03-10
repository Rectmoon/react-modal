# react-modal

可复用、可扩展的 React 弹窗/对话框组件。**Modal 仅声明式**（`<Modal open={} />`）；`Modal.open` / `confirm` / `alert` 与声明式共用 Manager 栈，由 **ModalProvider** 统一渲染。支持受控/非受控、**动态 title/content**（打开后随 props 更新）、**Deferred 模式**、自定义页脚与无障碍。

## 安装

```bash
npm install react-modal
```

要求：`react`、`react-dom` >= 17。

## 快速开始

### 使用 ModalProvider（推荐）

使用 `Modal.confirm` / `Modal.alert` / `Modal.open` 或声明式 `<Modal>` 时，建议在根节点挂载 `ModalProvider`：

```tsx
import { createRoot } from 'react-dom/client';
import { ModalProvider } from 'react-modal';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <ModalProvider>
    <App />
  </ModalProvider>
);
```

### 声明式：<Modal open={} />（受控）

```tsx
import { useState } from 'react';
import { Modal } from 'react-modal';

function App() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>打开</button>
      <Modal
        open={open}
        onOpenChange={setOpen}
        title="标题"
        footer={({ close }) => <button onClick={close}>关闭</button>}
      >
        内容区域
      </Modal>
    </>
  );
}
```

弹窗打开后，若父组件更新 `title`、`children`、`footer` 等 props，会同步到 Manager 并刷新 UI，无需关闭再打开。若在弹窗内通过按钮更新标题等，建议将按钮放在弹窗内容（`children`）内，避免被遮罩遮挡无法点击。

### 声明式非受控：defaultOpen

不传 `open`，只传 `defaultOpen`，由组件内部维护开关；适合「点击后挂载并打开」的写法。开发环境下即使用 React Strict Mode 也只会打开一个弹窗。

```tsx
const [mounted, setMounted] = useState(false);
return (
  <>
    <button onClick={() => setMounted(true)}>打开</button>
    {mounted && (
      <Modal defaultOpen={true} onOpenChange={(next) => !next && setMounted(false)} title="非受控" footer={({ close }) => <button onClick={close}>关闭</button>}>
        内容
      </Modal>
    )}
  </>
);
```

### API 式：useModal().open()

```tsx
import { useModal } from 'react-modal';

function App() {
  const { open } = useModal();

  return (
    <button
      onClick={() =>
        open({
          title: '标题',
          content: '内容区域',
          footer: ({ close }) => <button onClick={close}>关闭</button>,
        })
      }
    >
      打开
    </button>
  );
}
```

### Service API：Modal.open()

不依赖 JSX，通过 API 打开弹窗；返回 `{ close, setLoading, defer }` 可手动关闭或配合异步：

```tsx
import Modal from 'react-modal';

const { close } = Modal.open({
  title: '标题',
  content: '内容',
  footer: ({ close }) => <button onClick={close}>关闭</button>,
});
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

**Deferred 模式**：在 `onOk` 中通过 `defer` 在异步完成后再 resolve，无需手动 `close()`：

```tsx
const result = await Modal.confirm({
  title: '确认',
  content: '确定？',
  onOk: async ({ defer }) => {
    await doApi();
    defer?.resolve('ok'); // 关闭并令 confirm 的 Promise resolve 为 'ok'
  },
});
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
| `duration` | `number` | `200` | 过渡时长（ms）；配合 enter/leave 的 opacity、panel scale 动画 |
| `className` / `style` | - | - | 样式 |

### Modal.open(options)

返回 `ModalOpenController`: `{ close, setLoading, defer }`，可调用 `close()` 关闭弹窗。声明式 `<Modal open={} />` 会同步到 Manager，由 ModalProvider 与 `Modal.open` / `confirm` 共用同一套 UI 与 zIndex 栈。

### confirm(options)

返回 `Promise<'ok' | 'cancel'>`。

| 选项 | 类型 | 说明 |
|------|------|------|
| `title` | `ReactNode` | 标题 |
| `content` | `ReactNode` | 内容 |
| `onOk` | `(controller) => void \| Promise<void>` | 确定回调；`controller.close()` 关闭并 resolve `'ok'`，`controller.setLoading(bool)` 控制加载态，`controller.defer?.resolve('ok')` 支持 Deferred 模式 |
| `onCancel` | `() => void` | 取消回调 |
| `okText` / `cancelText` | `string` | 按钮文案 |
| `showCancel` | `boolean` | 为 `false` 时仅显示确定（类似 alert） |
| `maskClosable` / `keyboard` | `boolean` | 同 Modal |

### 组件与 Hooks

- **Modal**：仅声明式，接收 `open` / `defaultOpen` / `onOpenChange` / `children` 等（见上表）。内部同步到 Manager，实际 UI 由 ModalProvider 渲染；打开后 `title`/`children`/`footer` 等变化会通过 `modalManager.update` 同步到 UI。
- **ModalFromManager**：内部用，供 ModalProvider 渲染栈中每条 Manager 项（不对外单独使用）。
- **useModal()**：返回 `{ open, confirm, alert }`，在组件内通过 API 打开弹窗。
- **ModalProvider**：挂载后订阅 Manager，将栈内弹窗用 `ModalFromManager` 渲染到 body，支持多弹窗与 zIndex。
- **createDeferred**：创建 `{ promise, resolve, reject }`，用于 Deferred 模式。

## 自定义页脚

```tsx
const { open } = useModal();
open({
  title: '自定义页脚',
  content: '内容',
  footer: ({ close }) => (
    <div>
      <button onClick={close}>取消</button>
      <button onClick={() => { doSubmit(); close(); }}>提交</button>
    </div>
  ),
});
```

## 导出说明

- **默认导出**：`Modal` 组件 + 静态方法 `Modal.open`、`Modal.confirm`、`Modal.alert`。推荐：`import Modal from 'react-modal'`。
- **命名导出**：`ModalProvider`、`Modal`、`useModal`、`confirm`、`modalOpen`、`modalAlert`、`createDeferred`、`modalManager`、`update`（Manager 的 `update(id, options)` 用于更新已打开弹窗的 title/content 等）等。

## 项目结构

```
src/
├── core/           # Modal（仅声明式）、ModalFromManager（供 Provider）、Overlay+Panel+useModalTransition、service、FocusTrap、createDeferred
├── manager/        # ModalManager、ZIndexManager、ScrollLock、useScrollLock
├── provider/       # ModalProvider（用 ModalFromManager 渲染栈）
├── hooks/          # useModal
└── index.ts
__tests__/          # 单元测试（Manager 打开/关闭/update、声明式受控/非受控/动态标题、confirm、Modal.open）
```

## 示例

`npm run examples` 启动 Vite 示例页，包含：声明式受控、非受控、动态标题/内容（按钮在弹窗内可点击）、自定义内容、`useModal().open()`、`Modal.open` / `Modal.alert`、`confirm` 异步、多弹窗、遮罩/ESC 等。

## 开发与脚本

```bash
npm install
npm run build    # 构建
npm run test     # 测试（__tests__ 目录）
npm run examples # 启动示例（Vite）
```

## License

MIT
