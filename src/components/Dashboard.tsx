import React, { useState, useEffect } from 'react';
import { useTheme, getThemeColors } from '../contexts/ThemeContext';
import authService from '../utils/authService';
import { 
  BarChart3, 
  TrendingUp, 
  Leaf, 
  Zap, 
  Droplets, 
  Trash2,
  Plus,
  Activity
} from 'lucide-react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
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
  ArcElement
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
  ArcElement
);

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProjects: 0,
    avgSustainabilityScore: 0,
    totalEnergyReduction: 0,
    bestCircularScore: 0
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      // Use authentication service for secure API calls
      const response = await authService.makeAuthenticatedRequest(
        'http://localhost:5000/api/process/all'
      );

      if (response.ok) {
        const data = await response.json();
        setProjects(data);
        calculateStats(data);
        console.log(`Successfully loaded ${data.length} projects`);
      } else {
        console.error('Failed to fetch projects:', response.status, response.statusText);
        setProjects([]);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      
      // Handle authentication errors
      if (error instanceof Error) {
        if (error.message.includes('No valid authentication token')) {
          console.log('No valid token - user needs to login');
          authService.redirectToLogin();
        } else if (error.message.includes('fetch')) {
          console.error('Network error - server may be down');
        }
      }
      
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (projectsData: any[]) => {
    if (projectsData.length === 0) {
      setStats({
        totalProjects: 0,
        avgSustainabilityScore: 0,
        totalEnergyReduction: 0,
        bestCircularScore: 0
      });
      return;
    }

    const avgScore = projectsData.reduce((sum, p) => sum + (p.sustainabilityScore || 0), 0) / projectsData.length;
    const bestCircular = Math.max(...projectsData.map(p => p.circularScore || 0));
    const totalEnergy = projectsData.reduce((sum, p) => {
      return sum + (p.stages?.reduce((stageSum: number, stage: any) => stageSum + (stage.energyUsage || 0), 0) || 0);
    }, 0);

    setStats({
      totalProjects: projectsData.length,
      avgSustainabilityScore: Math.round(avgScore),
      totalEnergyReduction: Math.round(totalEnergy * 0.15), // Estimated 15% reduction potential
      bestCircularScore: Math.round(bestCircular)
    });
  };

  // Generate theme-aware chart colors
  const getChartColors = () => {
    if (theme === 'sunset') {
      return {
        primary: 'rgba(243, 126, 32, 0.8)',
        primaryBorder: 'rgba(243, 126, 32, 1)',
        secondary: 'rgba(232, 111, 71, 0.8)',
        secondaryBorder: 'rgba(232, 111, 71, 1)',
        accent: 'rgba(245, 158, 11, 0.8)',
        accentBorder: 'rgba(245, 158, 11, 1)'
      };
    } else {
      return {
        primary: 'rgba(14, 165, 233, 0.8)',
        primaryBorder: 'rgba(14, 165, 233, 1)',
        secondary: 'rgba(34, 197, 94, 0.8)',
        secondaryBorder: 'rgba(34, 197, 94, 1)',
        accent: 'rgba(210, 109, 75, 0.8)',
        accentBorder: 'rgba(210, 109, 75, 1)'
      };
    }
  };

  const chartColors = getChartColors();

  // Chart data
  const recentProjects = projects.slice(0, 6).reverse();
  
  const lineChartData = {
    labels: recentProjects.map((p, i) => `Project ${i + 1}`),
    datasets: [
      {
        label: 'Sustainability Score',
        data: recentProjects.map(p => p.sustainabilityScore || 0),
        borderColor: chartColors.primaryBorder,
        backgroundColor: chartColors.primary.replace('0.8', '0.1'),
        tension: 0.3,
        fill: true
      },
      {
        label: 'Circular Score',
        data: recentProjects.map(p => p.circularScore || 0),
        borderColor: chartColors.secondaryBorder,
        backgroundColor: chartColors.secondary.replace('0.8', '0.1'),
        tension: 0.3
      }
    ]
  };

  const barChartData = {
    labels: recentProjects.map(p => p.projectName || 'Unnamed'),
    datasets: [
      {
        label: 'Energy Usage (GJ)',
        data: recentProjects.map(p => 
          p.stages?.reduce((sum: number, stage: any) => sum + (stage.energyUsage || 0), 0) || 0
        ),
        backgroundColor: chartColors.primary,
        borderColor: chartColors.primaryBorder,
        borderWidth: 1
      },
      {
        label: 'Water Usage (m³)',
        data: recentProjects.map(p => 
          p.stages?.reduce((sum: number, stage: any) => sum + (stage.waterUsage || 0), 0) || 0
        ),
        backgroundColor: chartColors.secondary,
        borderColor: chartColors.secondaryBorder,
        borderWidth: 1
      }
    ]
  };

  const doughnutData = {
    labels: ['Renewable Energy', 'Fossil Fuels', 'Mixed Sources'],
    datasets: [
      {
        data: [35, 45, 20],
        backgroundColor: [
          chartColors.secondary,
          chartColors.primary,
          chartColors.accent
        ],
        borderColor: [
          chartColors.secondaryBorder,
          chartColors.primaryBorder,
          chartColors.accentBorder
        ],
        borderWidth: 2
      }
    ]
  };

  const statCards = [
    {
      title: 'Total Projects',
      value: stats.totalProjects,
      icon: BarChart3,
      color: theme === 'sunset' ? 'bg-sunset-500' : 'bg-adventure-500',
      change: '+12%'
    },
    {
      title: 'Avg Sustainability Score',
      value: `${stats.avgSustainabilityScore}%`,
      icon: Leaf,
      color: theme === 'sunset' ? 'bg-sunsetRed-500' : 'bg-adventureGreen-500',
      change: '+5.2%'
    },
    {
      title: 'Energy Reduction Potential',
      value: `${stats.totalEnergyReduction} GJ`,
      icon: Zap,
      color: theme === 'sunset' ? 'bg-sunsetGold-500' : 'bg-adventureBrown-500',
      change: '+18%'
    },
    {
      title: 'Best Circular Score',
      value: `${stats.bestCircularScore}%`,
      icon: TrendingUp,
      color: theme === 'sunset' ? 'bg-sunset-600' : 'bg-adventure-600',
      change: '+8.1%'
    }
  ];

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${theme === 'sunset' ? 'border-sunset-600' : 'border-adventure-600'}`}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user.name}!
        </h1>
        <p className="text-gray-600">
          Here's an overview of your Life Cycle Assessment projects
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <span className={`${colors.textSecondary} text-sm font-medium`}>{stat.change}</span>
                    <span className="text-gray-500 text-sm ml-1">from last month</span>
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Sustainability Trends */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Sustainability Trends
          </h3>
          <div className="h-80">
            {recentProjects.length > 0 ? (
              <Line
                data={lineChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                    },
                  },
                }}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                No data available. Create your first project to see trends.
              </div>
            )}
          </div>
        </div>

        {/* Resource Usage */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Resource Usage by Project
          </h3>
          <div className="h-80">
            {recentProjects.length > 0 ? (
              <Bar
                data={barChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                }}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                No data available. Create your first project to see usage.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Energy Sources */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Energy Sources Distribution
          </h3>
          <div className="h-64">
            <Doughnut
              data={doughnutData}
              options={{
                responsive: true,
                maintainAspectRatio: false
              }}
            />
          </div>
        </div>

        {/* Recent Projects with Detailed Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Project History
            </h3>
            <span className="text-sm text-gray-500">{projects.length} total projects</span>
          </div>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {projects.slice(0, 10).map((project, index) => (
              <div key={index} className="border border-gray-200 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-sm mb-1">
                      {project.projectName || 'Unnamed Project'}
                    </h4>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>{new Date(project.timestamp).toLocaleDateString()}</span>
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full">
                        {project.overallData?.metalType || 'Unknown'}
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                        {project.overallData?.productionRoute || 'Primary'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className={`text-lg font-bold ${colors.textSecondary}`}>
                      {project.sustainabilityScore || 0}%
                    </p>
                    <p className="text-xs text-gray-500">Sustainability</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div className="text-center p-2 bg-green-50 rounded">
                    <p className="font-medium text-green-700">{project.circularScore || 0}%</p>
                    <p className="text-green-600">Circular</p>
                  </div>
                  <div className="text-center p-2 bg-orange-50 rounded">
                    <p className="font-medium text-orange-700">{project.linearScore || 0}%</p>
                    <p className="text-orange-600">Linear</p>
                  </div>
                  <div className="text-center p-2 bg-blue-50 rounded">
                    <p className="font-medium text-blue-700">
                      {project.stages?.reduce((sum: number, stage: any) => sum + (stage.energyUsage || 0), 0).toFixed(1) || '0.0'} GJ
                    </p>
                    <p className="text-blue-600">Energy</p>
                  </div>
                  <div className="text-center p-2 bg-purple-50 rounded">
                    <p className="font-medium text-purple-700">
                      {project.stages?.reduce((sum: number, stage: any) => sum + (stage.waterUsage || 0), 0).toFixed(1) || '0.0'} m³
                    </p>
                    <p className="text-purple-600">Water</p>
                  </div>
                </div>
                
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-xs text-gray-500">
                    <span>{project.stages?.length || 0} stages</span>
                    <span>•</span>
                    <span>{project.overallData?.region || 'Unknown region'}</span>
                  </div>
                  <div className="flex space-x-2">
                    <a href="/reports" className="text-green-600 hover:text-green-800 text-xs font-medium">
                      Generate Report
                    </a>
                  </div>
                </div>
              </div>
            ))}
            {projects.length === 0 && (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No projects yet</p>
                <p className="text-sm text-gray-400 mb-4">Create your first LCA project to start tracking environmental impacts</p>
                <a href="/submit" className={`inline-flex items-center px-4 py-2 ${theme === 'sunset' ? 'bg-sunset-600 hover:bg-sunset-700' : 'bg-adventure-600 hover:bg-adventure-700'} text-white text-sm font-medium rounded-lg transition-colors`}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Project
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <a href="/submit" className={`w-full flex items-center p-3 ${theme === 'sunset' ? 'bg-sunset-50 text-sunset-700 hover:bg-sunset-100' : 'bg-adventure-50 text-adventure-700 hover:bg-adventure-100'} rounded-lg transition-colors`}>
              <Plus className="h-5 w-5 mr-3" />
              New LCA Project
            </a>
            <a href="/reports" className={`w-full flex items-center p-3 ${theme === 'sunset' ? 'bg-sunsetRed-50 text-sunsetRed-700 hover:bg-sunsetRed-100' : 'bg-adventureGreen-50 text-adventureGreen-700 hover:bg-adventureGreen-100'} rounded-lg transition-colors`}>
              <BarChart3 className="h-5 w-5 mr-3" />
              View Reports
            </a>
            <a href="/simulation" className={`w-full flex items-center p-3 ${theme === 'sunset' ? 'bg-sunsetGold-50 text-sunsetGold-700 hover:bg-sunsetGold-100' : 'bg-adventureBrown-50 text-adventureBrown-700 hover:bg-adventureBrown-100'} rounded-lg transition-colors`}>
              <Activity className="h-5 w-5 mr-3" />
              Run Simulation
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;