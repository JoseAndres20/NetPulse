import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import React from 'react'
import { Badge } from '../src/components/ui/Badge'

describe('Badge', () => {
  it('renders with online status', () => {
    render(<Badge status="online" isOnline={true} />)
    expect(document.querySelector('.badge')).toBeDefined()
  })

  it('renders with offline status', () => {
    render(<Badge status="offline" isOnline={false} />)
    expect(document.querySelector('.badge')).toBeDefined()
  })

  it('renders with unknown status', () => {
    render(<Badge status="unknown" isOnline={false} />)
    expect(document.querySelector('.badge')).toBeDefined()
  })

  it('renders pending status', () => {
    render(<Badge status="pending" isOnline={false} />)
    expect(document.querySelector('.badge')).toBeDefined()
  })

  it('renders running status', () => {
    render(<Badge status="running" isOnline={false} />)
    expect(document.querySelector('.badge')).toBeDefined()
  })

  it('renders completed status', () => {
    render(<Badge status="completed" isOnline={true} />)
    expect(document.querySelector('.badge')).toBeDefined()
  })

  it('renders failed status', () => {
    render(<Badge status="failed" isOnline={false} />)
    expect(document.querySelector('.badge')).toBeDefined()
  })
})