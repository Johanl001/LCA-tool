import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import Login from '../../components/Login'

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

const mockOnLogin = vi.fn()

const renderLogin = () => {
  return render(
    <MemoryRouter>
      <Login onLogin={mockOnLogin} />
    </MemoryRouter>
  )
}

describe('Login Component - Isolated Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockClear()
  })

  it('renders all essential elements', () => {
    renderLogin()
    
    expect(screen.getByText('Welcome Back')).toBeInTheDocument()
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    expect(screen.getByText('Demo Account')).toBeInTheDocument()
  })

  it('handles successful demo login flow', async () => {
    const user = userEvent.setup()
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        message: 'Login successful',
        user: {
          id: 'demo',
          name: 'Demo User',
          email: 'demo@lca.com',
          role: 'user'
        },
        token: 'demo-token'
      })
    })

    renderLogin()

    const emailInput = screen.getByLabelText('Email Address')
    const passwordInput = screen.getByLabelText('Password')
    const loginButton = screen.getByRole('button', { name: /sign in/i })

    await user.type(emailInput, 'demo@lca.com')
    await user.type(passwordInput, 'demo123')
    await user.click(loginButton)

    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'demo@lca.com',
          name: 'Demo User'
        }),
        'demo-token'
      )
    })
  })

  it('validates email format', async () => {
    const user = userEvent.setup()
    renderLogin()

    const emailInput = screen.getByLabelText('Email Address')
    expect(emailInput).toHaveAttribute('type', 'email')
    expect(emailInput).toBeRequired()
  })

  it('shows appropriate error for network failures', async () => {
    const user = userEvent.setup()
    
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    renderLogin()

    const emailInput = screen.getByLabelText('Email Address')
    const passwordInput = screen.getByLabelText('Password')
    const loginButton = screen.getByRole('button', { name: /sign in/i })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(loginButton)

    await waitFor(() => {
      expect(screen.getByText(/An error occurred during login/)).toBeInTheDocument()
    })
  })
})