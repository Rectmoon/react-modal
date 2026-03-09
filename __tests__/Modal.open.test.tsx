/// <reference types="@testing-library/jest-dom/vitest" />
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, act, render } from '@testing-library/react';
import Modal from '../src/index';
import { ModalProvider } from '../src/provider/ModalProvider';
import { _testClearModals } from '../src/manager/ModalManager';

function TestWrapper({ children }: { children?: React.ReactNode }) {
  return <ModalProvider>{children}</ModalProvider>;
}

describe('Modal.open()', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    _testClearModals();
  });

  afterEach(() => {
    vi.useRealTimers();
    _testClearModals();
  });

  it('opens a modal and returns close handle', async () => {
    render(<TestWrapper />);
    const { close } = Modal.open({
      title: 'Service modal',
      content: <p>Service content</p>,
    });
    await act(async () => {
      vi.runAllTimersAsync();
    });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Service content')).toBeInTheDocument();
    expect(typeof close).toBe('function');
    act(() => {
      close();
    });
    await act(async () => {
      vi.runAllTimersAsync();
    });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
