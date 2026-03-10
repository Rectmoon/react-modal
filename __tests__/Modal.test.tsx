/// <reference types="@testing-library/jest-dom/vitest" />
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, act, fireEvent, render } from '@testing-library/react';
import { modalManager, getModals, _testClearModals } from '../src/manager/ModalManager';
import { ModalProvider } from '../src/provider/ModalProvider';

function TestWrapper({ children }: { children: React.ReactNode }) {
  return <ModalProvider>{children}</ModalProvider>;
}

describe('Modal (manager-driven)', () => {
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
    const id = modalManager.open({
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
