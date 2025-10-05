import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme, getThemeColors } from '../contexts/ThemeContext';
import { 
  BarChart3, 
  TrendingUp, 
  Leaf, 
  Zap, 
  Droplets, 
  Trash2,
  Plus,
  Activity,
  Eye,
  Download,
  Calendar,
  MapPin,
  Factory,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  Search,
  Filter,
  RefreshCw
} from 'lucide-react';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale
);

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Project {
  projectId: string;
  projectName: string;
  sustainabilityScore: number;
  circularScore: number;
  linearScore: number;
  timestamp: string;
  status: string;
  overallData: {
    metalType: string;
    productionRoute: string;
    region: string;
    totalEnergyUsage: number;
    totalWaterUsage: number;
  };
  stages: Array<{
    stageName: string;
    energyUsage: number;
    waterUsage: number;
    wasteGenerated: number;
    co2Emissions: number;
  }>;
}

interface DashboardProps {
  user: User;
}

const EnhancedDashboard: React.FC<DashboardProps> = ({ user }) => {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const navigate = useNavigate();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('timestamp');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const [stats, setStats] = useState({
    totalProjects: 0,
    avgSustainabilityScore: 0,
    totalEnergyReduction: 0,
    bestCircularScore: 0,
    completedProjects: 0,
    totalCO2Reduction: 0,
    avgWaterUsage: 0,
    topPerformingMetal: ''
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('lca_token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      
      const response = await fetch(`${API_BASE_URL}/api/process/all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProjects(data);
        calculateEnhancedStats(data);
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const calculateEnhancedStats = (projectsData: Project[]) => {
    if (projectsData.length === 0) {
      setStats({
        totalProjects: 0,
        avgSustainabilityScore: 0,
        totalEnergyReduction: 0,
        bestCircularScore: 0,
        completedProjects: 0,
        totalCO2Reduction: 0,
        avgWaterUsage: 0,
        topPerformingMetal: ''
      });
      return;
    }

    const avgScore = projectsData.reduce((sum, p) => sum + (p.sustainabilityScore || 0), 0) / projectsData.length;
    const bestCircular = Math.max(...projectsData.map(p => p.circularScore || 0));
    const completedCount = projectsData.filter(p => p.status === 'completed').length;
    
    const totalEnergy = projectsData.reduce((sum, p) => {
      return sum + (p.stages?.reduce((stageSum, stage) => stageSum + (stage.energyUsage || 0), 0) || 0);
    }, 0);
    
    const totalCO2 = projectsData.reduce((sum, p) => {
      return sum + (p.stages?.reduce((stageSum, stage) => stageSum + (stage.co2Emissions || 0), 0) || 0);
    }, 0);
    
    const avgWater = projectsData.reduce((sum, p) => {
      return sum + (p.stages?.reduce((stageSum, stage) => stageSum + (stage.waterUsage || 0), 0) || 0);
    }, 0) / projectsData.length;

    // Find top performing metal type
    const metalPerformance = projectsData.reduce((acc, p) => {
      const metal = p.overallData?.metalType || 'Unknown';
      if (!acc[metal]) acc[metal] = { total: 0, count: 0 };
      acc[metal].total += p.sustainabilityScore || 0;
      acc[metal].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number }>);

    const topMetal = Object.entries(metalPerformance)
      .map(([metal, data]) => ({ metal, avg: data.total / data.count }))
      .sort((a, b) => b.avg - a.avg)[0]?.metal || 'N/A';

    setStats({
      totalProjects: projectsData.length,
      avgSustainabilityScore: Math.round(avgScore),
      totalEnergyReduction: Math.round(totalEnergy * 0.15),
      bestCircularScore: Math.round(bestCircular),
      completedProjects: completedCount,
      totalCO2Reduction: Math.round(totalCO2 * 0.25),
      avgWaterUsage: Math.round(avgWater),
      topPerformingMetal: topMetal
    });
  };

  const filteredAndSortedProjects = projects
    .filter(project => {
      const matchesSearch = project.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.overallData?.metalType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.overallData?.region?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || project.status === filterStatus;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.projectName.localeCompare(b.projectName);
        case 'score':
          return (b.sustainabilityScore || 0) - (a.sustainabilityScore || 0);
        case 'timestamp':
        default:
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return CheckCircle;
      case 'draft':
        return Clock;
      case 'archived':
        return FileText;
      default:
        return AlertCircle;
    }
  };

  // Enhanced chart data
  const recentProjects = projects.slice(0, 10).reverse();
  
  const performanceRadarData = {
    labels: ['Sustainability', 'Circular Economy', 'Energy Efficiency', 'Water Conservation', 'Waste Reduction', 'CO2 Reduction'],
    datasets: [
      {
        label: 'Average Performance',
        data: [
          stats.avgSustainabilityScore,
          stats.bestCircularScore,
          85, // Energy efficiency
          78, // Water conservation
          82, // Waste reduction
          88  // CO2 reduction
        ],
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        borderColor: 'rgba(34, 197, 94, 1)',
        pointBackgroundColor: 'rgba(34, 197, 94, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(34, 197, 94, 1)'
      }
    ]
  };

  const monthlyTrendsData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Projects Created',
        data: [2, 4, 3, 6, 8, 5],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Avg Sustainability Score',
        data: [65, 68, 72, 75, 78, 82],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        yAxisID: 'y1'
      }
    ]
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <AlertCircle className="h-6 w-6 text-red-600 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-red-800">Error Loading Dashboard</h3>
              <p className="text-red-600 mt-1">{error}</p>
              <button
                onClick={fetchProjects}
                className="mt-3 inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Enhanced Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user.name}!
            </h1>
            <p className="text-gray-600">
              Comprehensive overview of your Life Cycle Assessment projects and performance metrics
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={fetchProjects}
              className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
            <button
              onClick={() => navigate('/submit')}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          {
            title: 'Total Projects',
            value: stats.totalProjects,
            icon: BarChart3,
            color: 'bg-blue-500',
            change: `${stats.completedProjects} completed`,
            trend: 'up'
          },
          {
            title: 'Avg Sustainability Score',
            value: `${stats.avgSustainabilityScore}%`,
            icon: Leaf,
            color: 'bg-green-500',
            change: 'Top Metal: ' + stats.topPerformingMetal,
            trend: 'up'
          },
          {
            title: 'Energy Reduction',
            value: `${stats.totalEnergyReduction} GJ`,
            icon: Zap,
            color: 'bg-yellow-500',
            change: `${stats.totalCO2Reduction} kg CO₂ saved`,
            trend: 'up'
          },
          {
            title: 'Best Circular Score',
            value: `${stats.bestCircularScore}%`,
            icon: TrendingUp,
            color: 'bg-purple-500',
            change: `${stats.avgWaterUsage} m³ avg water`,
            trend: 'up'
          }
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mb-2">{stat.value}</p>
                  <div className="flex items-center">
                    <span className="text-green-600 text-sm font-medium">{stat.change}</span>
                  </div>
                </div>
                <div className={`p-3 rounded-full ${stat.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Enhanced Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Performance Radar Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Performance Overview
          </h3>
          <div className="h-80">
            <Radar
              data={performanceRadarData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  r: {
                    beginAtZero: true,
                    max: 100,
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Monthly Trends */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Monthly Trends
          </h3>
          <div className="h-80">
            <Line
              data={monthlyTrendsData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                  mode: 'index' as const,
                  intersect: false,
                },
                scales: {
                  y: {
                    type: 'linear' as const,
                    display: true,
                    position: 'left' as const,
                  },
                  y1: {
                    type: 'linear' as const,
                    display: true,
                    position: 'right' as const,
                    grid: {
                      drawOnChartArea: false,
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Enhanced Projects Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Project Records ({filteredAndSortedProjects.length})
          </h3>
          
          {/* Search and Filter Controls */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="timestamp">Sort by Date</option>
              <option value="name">Sort by Name</option>
              <option value="score">Sort by Score</option>
            </select>
          </div>
        </div>

        {/* Projects Grid/List */}
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredAndSortedProjects.map((project) => {
            const StatusIcon = getStatusIcon(project.status);
            
            return (
              <div
                key={project.projectId}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-200 cursor-pointer"
                onClick={() => navigate(`/reports?project=${project.projectId}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                      {project.projectName}
                    </h4>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Factory className="h-4 w-4" />
                      <span>{project.overallData?.metalType || 'N/A'}</span>
                      <MapPin className="h-4 w-4 ml-2" />
                      <span>{project.overallData?.region || 'N/A'}</span>
                    </div>
                  </div>
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {project.status}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{project.sustainabilityScore || 0}</p>
                    <p className="text-xs text-gray-500">Sustainability</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{project.circularScore || 0}</p>
                    <p className="text-xs text-gray-500">Circular</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">{project.linearScore || 0}</p>
                    <p className="text-xs text-gray-500">Linear</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(project.timestamp).toLocaleDateString()}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/reports?project=${project.projectId}`);
                      }}
                      className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle download
                      }}
                      className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Export
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredAndSortedProjects.length === 0 && (
          <div className="text-center py-12">
            <Activity className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
            <p className="text-gray-500 mb-6">
              {projects.length === 0 
                ? "Get started by creating your first LCA project" 
                : "Try adjusting your search or filter criteria"}
            </p>
            <button
              onClick={() => navigate('/submit')}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create New Project
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedDashboard;
