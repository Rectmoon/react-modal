/// <reference types="@testing-library/jest-dom/vitest" />
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, act, fireEvent, render } from '@testing-library/react';
import Modal from '../src/core/Modal';
import { modalManager, getModals, _testClearModals } from '../src/manager/ModalManager';
import { ModalProvider } from '../src/provider/ModalProvider';

function TestWrapper({ children }: { children: React.ReactNode }) {
  return <ModalProvider>{children}</ModalProvider>;
}

describe('Modal (via Manager + ModalProvider)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    _testClearModals();
    render(<TestWrapper><div /></TestWrapper>);
  });

  afterEach(() => {
    _testClearModals();
    vi.useRealTimers();
  });

  it('renders when opened via manager and shows title and content', async () => {
    modalManager.open({
      title: 'Test Title',
      content: <p>Modal body content</p>,
    });
    await act(async () => {
      vi.runAllTimersAsync();
    });
    expect(screen.getByRole('dialog', { name: /test title/i })).toBeInTheDocument();
    expect(screen.getByText('Modal body content')).toBeInTheDocument();
  });

  it('closes when user triggers close', async () => {
    const { id } = modalManager.open({
      title: 'Close me',
      content: <p>Content</p>,
      maskClosable: true,
    });
    await act(async () => {
      vi.runAllTimersAsync();
    });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    const overlay = document.querySelector('[data-modal-overlay]');
    fireEvent.click(overlay!);
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(getModals().find((m) => m.id === id)).toBeUndefined();
  });
});

describe('Modal (declarative <Modal open={} />)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    _testClearModals();
  });

  afterEach(() => {
    _testClearModals();
    vi.useRealTimers();
  });

  it('controlled: renders when open and calls onOpenChange(false) when closed', async () => {
    const onOpenChange = vi.fn();
    render(
      <TestWrapper>
        <Modal
          open={true}
          onOpenChange={onOpenChange}
          title="Declarative"
          footer={({ close }: { close: () => void }) => (
            <button type="button" onClick={close}>
              关闭
            </button>
          )}
        >
          <p>Declarative content</p>
        </Modal>
      </TestWrapper>
    );
    await act(async () => {
      vi.runAllTimersAsync();
    });
    expect(screen.getByRole('dialog', { name: /declarative/i })).toBeInTheDocument();
    expect(screen.getByText('Declarative content')).toBeInTheDocument();
    const closeBtn = screen.getByRole('button', { name: /关闭/i });
    fireEvent.click(closeBtn);
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('does not render when open is false', async () => {
    render(
      <TestWrapper>
        <Modal open={false} title="Hidden">
          <p>Hidden content</p>
        </Modal>
      </TestWrapper>
    );
    await act(async () => {
      vi.runAllTimersAsync();
    });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('uncontrolled: defaultOpen={true} renders exactly one modal (Strict Mode safe)', async () => {
    render(
      <TestWrapper>
        <Modal defaultOpen={true} title="Uncontrolled" footer={null}>
          <p>Uncontrolled content</p>
        </Modal>
      </TestWrapper>
    );
    await act(async () => {
      await Promise.resolve();
      vi.runAllTimersAsync();
    });
    const dialogs = screen.getAllByRole('dialog', { name: /uncontrolled/i });
    expect(dialogs).toHaveLength(1);
    expect(screen.getByText('Uncontrolled content')).toBeInTheDocument();
  });

  it('uncontrolled: mount with defaultOpen later still opens only one modal', async () => {
    const { rerender } = render(
      <TestWrapper>
        <div data-testid="placeholder">no modal</div>
      </TestWrapper>
    );
    await act(async () => {
      vi.runAllTimersAsync();
    });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    rerender(
      <TestWrapper>
        <Modal defaultOpen={true} title="Uncontrolled Mount" footer={null}>
          <p>Mounted content</p>
        </Modal>
      </TestWrapper>
    );
    await act(async () => {
      await Promise.resolve();
      vi.runAllTimersAsync();
    });
    const dialogs = screen.getAllByRole('dialog', { name: /uncontrolled mount/i });
    expect(dialogs).toHaveLength(1);
    expect(screen.getByText('Mounted content')).toBeInTheDocument();
  });

  it('syncs dynamic title when props change while open', async () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <TestWrapper>
        <Modal open={true} onOpenChange={onOpenChange} title="Title A" footer={null}>
          <p>Body</p>
        </Modal>
      </TestWrapper>
    );
    await act(async () => {
      vi.runAllTimersAsync();
    });
    expect(screen.getByRole('dialog', { name: /title a/i })).toBeInTheDocument();
    rerender(
      <TestWrapper>
        <Modal open={true} onOpenChange={onOpenChange} title="Title B" footer={null}>
          <p>Body</p>
        </Modal>
      </TestWrapper>
    );
    await act(async () => {
      vi.runAllTimersAsync();
    });
    expect(screen.getByRole('dialog', { name: /title b/i })).toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: /title a/i })).not.toBeInTheDocument();
  });
});
