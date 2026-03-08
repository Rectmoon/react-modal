/// <reference types="@testing-library/jest-dom/vitest" />
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { Modal } from './Modal';

describe('Modal', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders nothing when open is false', () => {
    render(
      <Modal open={false} title="Title">
        Content
      </Modal>
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders title and content when open', () => {
    render(
      <Modal open={true} title="Test Title">
        Test content
      </Modal>
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('calls onOpenChange(false) when close button is clicked', () => {
    const onOpenChange = vi.fn();
    render(
      <Modal open={true} onOpenChange={onOpenChange} title="Title">
        Content
      </Modal>
    );
    const closeBtn = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeBtn);
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('closes on mask click when maskClosable is true', () => {
    const onOpenChange = vi.fn();
    render(
      <Modal open={true} maskClosable={true} onOpenChange={onOpenChange} title="Title">
        Content
      </Modal>
    );
    const overlay = screen.getByTestId('modal-overlay');
    fireEvent.click(overlay);
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('does not close on mask click when maskClosable is false', () => {
    const onOpenChange = vi.fn();
    render(
      <Modal open={true} maskClosable={false} onOpenChange={onOpenChange} title="Title">
        Content
      </Modal>
    );
    const overlay = screen.getByTestId('modal-overlay');
    fireEvent.click(overlay);
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('closes on Escape when keyboard is true', () => {
    const onOpenChange = vi.fn();
    render(
      <Modal open={true} keyboard={true} onOpenChange={onOpenChange} title="Title">
        Content
      </Modal>
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('has role="dialog" and aria-modal="true"', () => {
    render(
      <Modal open={true} title="Title">
        Content
      </Modal>
    );
    const dialog = screen.getByRole('dialog', { name: undefined });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('renders footer from function with close', () => {
    const onOpenChange = vi.fn();
    render(
      <Modal
        open={true}
        onOpenChange={onOpenChange}
        title="Title"
        footer={({ close }) => (
          <button type="button" onClick={close}>
            Done
          </button>
        )}
      >
        Content
      </Modal>
    );
    const doneBtn = screen.getByRole('button', { name: /done/i });
    fireEvent.click(doneBtn);
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('does not render header close button when closable is false', () => {
    render(
      <Modal open={true} closable={false} title="Title">
        Content
      </Modal>
    );
    expect(screen.queryByRole('button', { name: /close/i })).not.toBeInTheDocument();
  });
});
