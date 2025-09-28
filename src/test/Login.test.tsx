import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import Login from '../components/Login'

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

const mockOnLogin = vi.fn()

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <MemoryRouter>
      {component}
    </MemoryRouter>
  )
}

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockClear()
  })

  it('renders login form correctly', () => {
    renderWithRouter(<Login onLogin={mockOnLogin} />)
    
    expect(screen.getByText('Welcome Back')).toBeInTheDocument()
    expect(screen.getByText('Sign in to your LCA Platform account')).toBeInTheDocument()
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('shows demo account information', () => {
    renderWithRouter(<Login onLogin={mockOnLogin} />)
    
    expect(screen.getByText('Demo Account')).toBeInTheDocument()
    expect(screen.getByText(/demo@lca.com/)).toBeInTheDocument()
    expect(screen.getByText(/demo123/)).toBeInTheDocument()
  })

  it('allows user to input email and password', async () => {
    const user = userEvent.setup()
    renderWithRouter(<Login onLogin={mockOnLogin} />)
    
    const emailInput = screen.getByLabelText('Email Address')
    const passwordInput = screen.getByLabelText('Password')
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    
    expect(emailInput).toHaveValue('test@example.com')
    expect(passwordInput).toHaveValue('password123')
  })

  it('submits form with correct data', async () => {
    const user = userEvent.setup()
    
    // Mock successful login response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        user: { id: '1', name: 'Test User', email: 'test@example.com', role: 'user' },
        token: 'mock-token'
      })
    })
    
    renderWithRouter(<Login onLogin={mockOnLogin} />)
    
    const emailInput = screen.getByLabelText('Email Address')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)
    
    expect(mockFetch).toHaveBeenCalledWith('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      }),
    })
  })

  it('handles login success', async () => {
    const user = userEvent.setup()
    const mockUserData = { id: '1', name: 'Test User', email: 'test@example.com', role: 'user' }
    const mockToken = 'mock-token'
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        user: mockUserData,
        token: mockToken
      })
    })
    
    renderWithRouter(<Login onLogin={mockOnLogin} />)
    
    const emailInput = screen.getByLabelText('Email Address')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalledWith(mockUserData, mockToken)
    })
  })

  it('displays error message on login failure', async () => {
    const user = userEvent.setup()
    
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: 'Invalid credentials'
      })
    })
    
    renderWithRouter(<Login onLogin={mockOnLogin} />)
    
    const emailInput = screen.getByLabelText('Email Address')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    await user.type(emailInput, 'wrong@example.com')
    await user.type(passwordInput, 'wrongpassword')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    })
    
    expect(mockOnLogin).not.toHaveBeenCalled()
  })

  it('shows loading state during submission', async () => {
    const user = userEvent.setup()
    
    // Mock a delayed response
    mockFetch.mockImplementationOnce(() => 
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => ({ user: {}, token: 'token' })
      }), 100))
    )
    
    renderWithRouter(<Login onLogin={mockOnLogin} />)
    
    const emailInput = screen.getByLabelText('Email Address')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)
    
    // Check for loading state
    expect(submitButton).toBeDisabled()
  })

  it('validates required fields', async () => {
    const user = userEvent.setup()
    renderWithRouter(<Login onLogin={mockOnLogin} />)
    
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    await user.click(submitButton)
    
    const emailInput = screen.getByLabelText('Email Address')
    const passwordInput = screen.getByLabelText('Password')
    
    expect(emailInput).toBeRequired()
    expect(passwordInput).toBeRequired()
  })

  it('contains link to registration page', () => {
    renderWithRouter(<Login onLogin={mockOnLogin} />)
    
    const registerLink = screen.getByText('Sign up here')
    expect(registerLink).toBeInTheDocument()
    expect(registerLink.closest('a')).toHaveAttribute('href', '/register')
  })
})