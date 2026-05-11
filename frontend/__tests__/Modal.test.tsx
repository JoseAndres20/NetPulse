import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { Modal } from '../src/components/ui/Modal'

describe('Modal', () => {
  it('renders when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    )
    
    expect(screen.getByText('Test Modal')).toBeDefined()
    expect(screen.getByText('Modal content')).toBeDefined()
  })

  it('does not render when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={() => {}} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    )
    
    expect(screen.queryByText('Test Modal')).toBeNull()
  })

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn()
    render(
      <Modal isOpen={true} onClose={handleClose} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    )
    
    const closeButton = document.querySelector('button')
    if (closeButton) {
      fireEvent.click(closeButton)
      expect(handleClose).toHaveBeenCalled()
    }
  })

  it('renders with children correctly', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal">
        <div data-testid="modal-child">Child Content</div>
      </Modal>
    )
    
    expect(screen.getByTestId('modal-child')).toBeDefined()
  })
})