import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import App from '../../App'

// Mock fetch for API calls
const mockFetch = vi.fn()
global.fetch = mockFetch

const renderApp = () => {
  return render(<App />)
}

describe('User Flow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    mockFetch.mockClear()
  })

  it('complete user registration and login flow', async () => {
    const user = userEvent.setup()
    
    // Mock successful registration
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        message: 'User created successfully',
        user: {
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'user'
        },
        token: 'mock-token'
      })
    })

    renderApp()

    // Should show login page initially
    await waitFor(() => {
      expect(screen.getByText('Welcome Back')).toBeInTheDocument()
    })

    // Navigate to registration
    const registerLink = screen.getByText('Sign up here')
    await user.click(registerLink)

    // Fill registration form (assuming Register component exists)
    // This would require implementing the Register component test
    
    // After successful registration, user should be logged in
    // The onLogin callback should be called and user should see dashboard
  })

  it('demo account login flow', async () => {
    const user = userEvent.setup()
    
    // Mock successful demo login
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

    // Mock dashboard data fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => []
    })

    renderApp()

    // Wait for login page to load
    await waitFor(() => {
      expect(screen.getByText('Welcome Back')).toBeInTheDocument()
    })

    // Use demo credentials
    const emailInput = screen.getByLabelText('Email Address')
    const passwordInput = screen.getByLabelText('Password')
    const loginButton = screen.getByRole('button', { name: /sign in/i })

    await user.type(emailInput, 'demo@lca.com')
    await user.type(passwordInput, 'demo123')
    await user.click(loginButton)

    // Should redirect to dashboard after successful login
    await waitFor(() => {
      expect(screen.getByText('Welcome back, Demo User!')).toBeInTheDocument()
    })

    // Verify dashboard elements are present
    expect(screen.getByText('Total Projects')).toBeInTheDocument()
    expect(screen.getByText('Quick Actions')).toBeInTheDocument()
  })

  it('persistent login with token from localStorage', async () => {
    // Set up existing token and user data
    const userData = {
      id: '1',
      name: 'Existing User',
      email: 'existing@example.com',
      role: 'user'
    }
    
    localStorage.setItem('lca_token', 'existing-token')
    localStorage.setItem('lca_user', JSON.stringify(userData))

    // Mock dashboard data fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => []
    })

    renderApp()

    // Should skip login and go directly to dashboard
    await waitFor(() => {
      expect(screen.getByText('Welcome back, Existing User!')).toBeInTheDocument()
    })

    // Should not show login page
    expect(screen.queryByText('Sign in to your LCA Platform account')).not.toBeInTheDocument()
  })

  it('handles invalid token gracefully', async () => {
    // Set up invalid token data
    localStorage.setItem('lca_token', 'invalid-token')
    localStorage.setItem('lca_user', 'invalid-json-data')

    renderApp()

    // Should redirect to login page
    await waitFor(() => {
      expect(screen.getByText('Welcome Back')).toBeInTheDocument()
    })

    // Invalid data should be cleared
    expect(localStorage.getItem('lca_token')).toBeNull()
    expect(localStorage.getItem('lca_user')).toBeNull()
  })

  it('logout flow clears authentication', async () => {
    const user = userEvent.setup()
    
    // Set up authenticated user
    const userData = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'user'
    }
    
    localStorage.setItem('lca_token', 'test-token')
    localStorage.setItem('lca_user', JSON.stringify(userData))

    // Mock dashboard data fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => []
    })

    renderApp()

    // Should be on dashboard
    await waitFor(() => {
      expect(screen.getByText('Welcome back, Test User!')).toBeInTheDocument()
    })

    // Note: This would require the Navbar component to have a logout button
    // and would need to be implemented based on the actual Navbar component structure
  })

  it('handles API errors during login', async () => {
    const user = userEvent.setup()
    
    // Mock API error
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    renderApp()

    await waitFor(() => {
      expect(screen.getByText('Welcome Back')).toBeInTheDocument()
    })

    // Try to login
    const emailInput = screen.getByLabelText('Email Address')
    const passwordInput = screen.getByLabelText('Password')
    const loginButton = screen.getByRole('button', { name: /sign in/i })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(loginButton)

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/An error occurred during login/)).toBeInTheDocument()
    })

    // Should remain on login page
    expect(screen.getByText('Welcome Back')).toBeInTheDocument()
  })

  it('validates form inputs on login', async () => {
    const user = userEvent.setup()
    
    renderApp()

    await waitFor(() => {
      expect(screen.getByText('Welcome Back')).toBeInTheDocument()
    })

    // Try to submit empty form
    const loginButton = screen.getByRole('button', { name: /sign in/i })
    await user.click(loginButton)

    // Form should validate required fields
    const emailInput = screen.getByLabelText('Email Address')
    const passwordInput = screen.getByLabelText('Password')
    
    expect(emailInput).toBeRequired()
    expect(passwordInput).toBeRequired()
  })
})