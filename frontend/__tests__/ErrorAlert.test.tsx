import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { ErrorAlert } from '../src/components/domain/ErrorAlert'

describe('ErrorAlert', () => {
  it('renders error message', () => {
    render(<ErrorAlert message="Something went wrong" />)
    expect(screen.getByText('Something went wrong')).toBeDefined()
  })

  it('renders with different messages', () => {
    render(<ErrorAlert message="Network error" />)
    expect(screen.getByText('Network error')).toBeDefined()
  })
})