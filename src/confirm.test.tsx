/// <reference types="@testing-library/jest-dom/vitest" />
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, act, fireEvent, within } from '@testing-library/react';
import { confirm, _testClearConfirmContainer } from './confirm';

describe('confirm', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    _testClearConfirmContainer();
    document.querySelectorAll('[data-testid="modal-overlay"]').forEach((el) => el.remove());
    vi.useRealTimers();
  });

  it('resolves with "cancel" when user clicks Cancel', async () => {
    const resultPromise = confirm({
      title: 'Confirm',
      content: 'Content',
      okText: 'OK',
      cancelText: 'Cancel',
    });
    await act(async () => {
      vi.runAllTimersAsync();
    });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelBtn);
    act(() => {
      vi.advanceTimersByTime(250);
    });
    await expect(resultPromise).resolves.toBe('cancel');
  });

  it('resolves with "ok" when user clicks OK and onOk calls close()', async () => {
    const onOk = vi.fn(({ close }: { close: () => void }) => {
      close();
    });
    const resultPromise = confirm({
      title: 'Confirm',
      content: 'Content',
      onOk,
      okText: 'OK',
      cancelText: 'Cancel',
    });
    await act(async () => {
      vi.runAllTimersAsync();
    });
    const dialog = screen.getByRole('dialog', { name: /confirm/i });
    const okBtn = within(dialog).getByRole('button', { name: /^ok$/i });
    fireEvent.click(okBtn);
    act(() => {
      vi.advanceTimersByTime(250);
    });
    await expect(resultPromise).resolves.toBe('ok');
    expect(onOk).toHaveBeenCalledTimes(1);
  });

  it('stays open and shows loading when onOk is async and calls setLoading', async () => {
    const onOk = vi.fn(async ({ close, setLoading }: { close: () => void; setLoading: (v: boolean) => void }) => {
      setLoading(true);
      await new Promise((r) => setTimeout(r, 100));
      setLoading(false);
      close();
    });
    confirm({
      title: 'Async',
      content: 'Content',
      onOk,
      okText: 'Submit',
      cancelText: 'Cancel',
    });
    await act(async () => {
      vi.runAllTimersAsync();
    });
    const submitBtn = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitBtn);
    expect(onOk).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: /loading/i })).toBeInTheDocument();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
    });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('does not close when onOk throws', async () => {
    const onOk = vi.fn(async () => {
      throw new Error('API error');
    });
    confirm({
      title: 'Confirm',
      content: 'Content',
      onOk,
      okText: 'OK',
      cancelText: 'Cancel',
    });
    await act(async () => {
      vi.runAllTimersAsync();
    });
    const dialog = screen.getByRole('dialog', { name: /confirm/i });
    const okBtn = within(dialog).getByRole('button', { name: /^ok$/i });
    fireEvent.click(okBtn);
    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(onOk).toHaveBeenCalledTimes(1);
  });

  it('does not close when onOk does not call close()', async () => {
    const onOk = vi.fn(async () => {
      // never call close()
    });
    confirm({
      title: 'Confirm',
      content: 'Content',
      onOk,
      okText: 'OK',
      cancelText: 'Cancel',
    });
    await act(async () => {
      vi.runAllTimersAsync();
    });
    const dialog = screen.getByRole('dialog', { name: /confirm/i });
    const okBtn = within(dialog).getByRole('button', { name: /^ok$/i });
    fireEvent.click(okBtn);
    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
