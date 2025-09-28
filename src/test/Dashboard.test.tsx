import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import Dashboard from '../components/Dashboard'

// Mock Chart.js components
vi.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="line-chart">Line Chart</div>,
  Bar: () => <div data-testid="bar-chart">Bar Chart</div>,
  Doughnut: () => <div data-testid="doughnut-chart">Doughnut Chart</div>
}))

// Mock Chart.js
vi.mock('chart.js', () => ({
  Chart: { register: vi.fn() },
  CategoryScale: {},
  LinearScale: {},
  PointElement: {},
  LineElement: {},
  BarElement: {},
  Title: {},
  Tooltip: {},
  Legend: {},
  ArcElement: {}
}))

const mockUser = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'user'
}

const mockFetch = vi.fn()
global.fetch = mockFetch

describe('Dashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.setItem('lca_token', 'mock-token')
  })

  it('renders welcome message with user name', () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => []
    })

    render(<Dashboard user={mockUser} />)
    
    expect(screen.getByText('Welcome back, Test User!')).toBeInTheDocument()
    expect(screen.getByText('Here\'s an overview of your Life Cycle Assessment projects')).toBeInTheDocument()
  })

  it('shows loading state initially', () => {
    mockFetch.mockImplementationOnce(() => new Promise(() => {})) // Never resolves
    
    render(<Dashboard user={mockUser} />)
    
    const loadingElement = screen.getByRole('status', { hidden: true }) || 
                          document.querySelector('.animate-spin')
    expect(loadingElement).toBeInTheDocument()
  })

  it('displays stat cards', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => []
    })

    render(<Dashboard user={mockUser} />)
    
    await waitFor(() => {
      expect(screen.getByText('Total Projects')).toBeInTheDocument()
      expect(screen.getByText('Avg Sustainability Score')).toBeInTheDocument()
      expect(screen.getByText('Energy Reduction Potential')).toBeInTheDocument()
      expect(screen.getByText('Best Circular Score')).toBeInTheDocument()
    })
  })

  it('displays correct stats when no projects exist', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => []
    })

    render(<Dashboard user={mockUser} />)
    
    await waitFor(() => {
      expect(screen.getByText('0')).toBeInTheDocument() // Total Projects
      expect(screen.getByText('0%')).toBeInTheDocument() // Avg Sustainability Score
    })
  })

  it('calculates and displays stats correctly with project data', async () => {
    const mockProjects = [
      {
        projectName: 'Project 1',
        sustainabilityScore: 80,
        circularScore: 70,
        stages: [
          { energyUsage: 100, waterUsage: 50 },
          { energyUsage: 150, waterUsage: 75 }
        ],
        timestamp: new Date().toISOString()
      },
      {
        projectName: 'Project 2',
        sustainabilityScore: 90,
        circularScore: 85,
        stages: [
          { energyUsage: 200, waterUsage: 100 }
        ],
        timestamp: new Date().toISOString()
      }
    ]

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockProjects
    })

    render(<Dashboard user={mockUser} />)
    
    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument() // Total Projects
      expect(screen.getByText('85%')).toBeInTheDocument() // Avg Sustainability Score (80+90)/2 = 85
      expect(screen.getByText('85%')).toBeInTheDocument() // Best Circular Score
    })
  })

  it('renders charts section', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => []
    })

    render(<Dashboard user={mockUser} />)
    
    await waitFor(() => {
      expect(screen.getByText('Sustainability Trends')).toBeInTheDocument()
      expect(screen.getByText('Resource Usage by Project')).toBeInTheDocument()
      expect(screen.getByText('Energy Sources Distribution')).toBeInTheDocument()
    })
  })

  it('displays "no data" message when no projects exist for charts', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => []
    })

    render(<Dashboard user={mockUser} />)
    
    await waitFor(() => {
      expect(screen.getByText('No data available. Create your first project to see trends.')).toBeInTheDocument()
      expect(screen.getByText('No data available. Create your first project to see usage.')).toBeInTheDocument()
    })
  })

  it('displays recent projects list', async () => {
    const mockProjects = [
      {
        projectName: 'Recent Project 1',
        sustainabilityScore: 85,
        timestamp: new Date().toISOString()
      },
      {
        projectName: 'Recent Project 2',
        sustainabilityScore: 92,
        timestamp: new Date().toISOString()
      }
    ]

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockProjects
    })

    render(<Dashboard user={mockUser} />)
    
    await waitFor(() => {
      expect(screen.getByText('Recent Projects')).toBeInTheDocument()
      expect(screen.getByText('Recent Project 1')).toBeInTheDocument()
      expect(screen.getByText('Recent Project 2')).toBeInTheDocument()
      expect(screen.getByText('85%')).toBeInTheDocument()
      expect(screen.getByText('92%')).toBeInTheDocument()
    })
  })

  it('shows "no projects" state when project list is empty', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => []
    })

    render(<Dashboard user={mockUser} />)
    
    await waitFor(() => {
      expect(screen.getByText('No projects yet')).toBeInTheDocument()
      expect(screen.getByText('Create Project')).toBeInTheDocument()
    })
  })

  it('displays quick actions section', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => []
    })

    render(<Dashboard user={mockUser} />)
    
    await waitFor(() => {
      expect(screen.getByText('Quick Actions')).toBeInTheDocument()
      expect(screen.getByText('Submit New Process Data')).toBeInTheDocument()
      expect(screen.getByText('Run Scenario Simulation')).toBeInTheDocument()
      expect(screen.getByText('Generate Report')).toBeInTheDocument()
      expect(screen.getByText('Compare Projects')).toBeInTheDocument()
    })
  })

  it('handles fetch error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    render(<Dashboard user={mockUser} />)
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching projects:', expect.any(Error))
    })

    consoleSpy.mockRestore()
  })

  it('makes API call with correct headers', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => []
    })

    render(<Dashboard user={mockUser} />)
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:5000/api/process/all', {
        headers: {
          'Authorization': 'Bearer mock-token',
          'Content-Type': 'application/json'
        }
      })
    })
  })
})