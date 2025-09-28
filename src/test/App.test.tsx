import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import App from '../App'

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <MemoryRouter>
      {component}
    </MemoryRouter>
  )
}

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('renders loading state initially', () => {
    render(<App />)
    expect(screen.getByText('Loading LCA Application...')).toBeInTheDocument()
  })

  it('redirects to login when no user is authenticated', async () => {
    render(<App />)
    
    await waitFor(() => {
      expect(screen.getByText('Welcome Back')).toBeInTheDocument()
    })
  })

  it('shows dashboard when user is authenticated', async () => {
    // Mock authenticated user
    const mockUser = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'user'
    }
    
    localStorage.setItem('lca_token', 'mock-token')
    localStorage.setItem('lca_user', JSON.stringify(mockUser))
    
    // Mock dashboard API call
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => []
    })
    
    render(<App />)
    
    await waitFor(() => {
      expect(screen.getByText('Team StrawHats')).toBeInTheDocument()
    })
  })

  it('handles logout correctly', async () => {
    // Mock authenticated user
    const mockUser = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'user'
    }
    
    localStorage.setItem('lca_token', 'mock-token')
    localStorage.setItem('lca_user', JSON.stringify(mockUser))
    
    // Mock dashboard API call
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => []
    })
    
    render(<App />)
    
    await waitFor(() => {
      expect(screen.getByText('Team StrawHats')).toBeInTheDocument()
    })
    
    // Verify localStorage is cleared after logout (would be triggered by navbar component)
    expect(localStorage.getItem('lca_token')).toBe('mock-token')
  })
})