/// <reference types="@testing-library/jest-dom/vitest" />
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, act, fireEvent, render } from '@testing-library/react';
import { Modal } from '../src/core/Modal';

describe('Modal', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders when open and shows title and children', async () => {
    render(
      <Modal open={true} title="Test Title" onOpenChange={() => {}}>
        <p>Modal body content</p>
      </Modal>
    );
    await act(async () => {
      vi.runAllTimersAsync();
    });
    expect(screen.getByRole('dialog', { name: /test title/i })).toBeInTheDocument();
    expect(screen.getByText('Modal body content')).toBeInTheDocument();
  });

  it('does not render when open is false', () => {
    render(
      <Modal open={false} title="Hidden" onOpenChange={() => {}}>
        <p>Hidden content</p>
      </Modal>
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('calls onOpenChange(false) when user closes via overlay or close', async () => {
    const onOpenChange = vi.fn();
    render(
      <Modal open={true} title="Close me" onOpenChange={onOpenChange} maskClosable={true}>
        <p>Content</p>
      </Modal>
    );
    await act(async () => {
      vi.runAllTimersAsync();
    });
    const dialog = screen.getByRole('dialog');
    const closeBtn = dialog.querySelector('[data-modal-close]') ?? dialog.querySelector('[aria-label="Close"]');
    if (closeBtn) {
      fireEvent.click(closeBtn as HTMLElement);
    } else {
      const mask = document.querySelector('.modal-mask, [class*="mask"]') ?? document.body;
      fireEvent.click(mask);
    }
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
