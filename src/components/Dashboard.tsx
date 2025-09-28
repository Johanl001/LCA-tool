import React, { useState, useEffect } from 'react';
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
      const token = localStorage.getItem('lca_token');
      const response = await fetch('http://localhost:5000/api/process/all', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProjects(data);
        calculateStats(data);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
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
      return sum + p.stages.reduce((stageSum: number, stage: any) => stageSum + (stage.energyUsage || 0), 0);
    }, 0);

    setStats({
      totalProjects: projectsData.length,
      avgSustainabilityScore: Math.round(avgScore),
      totalEnergyReduction: Math.round(totalEnergy * 0.15), // Estimated 15% reduction potential
      bestCircularScore: Math.round(bestCircular)
    });
  };

  // Chart data
  const recentProjects = projects.slice(0, 6).reverse();
  
  const lineChartData = {
    labels: recentProjects.map((p, i) => `Project ${i + 1}`),
    datasets: [
      {
        label: 'Sustainability Score',
        data: recentProjects.map(p => p.sustainabilityScore || 0),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.3,
        fill: true
      },
      {
        label: 'Circular Score',
        data: recentProjects.map(p => p.circularScore || 0),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
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
          p.stages.reduce((sum: number, stage: any) => sum + (stage.energyUsage || 0), 0)
        ),
        backgroundColor: 'rgba(251, 146, 60, 0.8)',
        borderColor: 'rgba(251, 146, 60, 1)',
        borderWidth: 1
      },
      {
        label: 'Water Usage (m³)',
        data: recentProjects.map(p => 
          p.stages.reduce((sum: number, stage: any) => sum + (stage.waterUsage || 0), 0)
        ),
        backgroundColor: 'rgba(14, 165, 233, 0.8)',
        borderColor: 'rgba(14, 165, 233, 1)',
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
          'rgba(16, 185, 129, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(156, 163, 175, 0.8)'
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(156, 163, 175, 1)'
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
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      title: 'Avg Sustainability Score',
      value: `${stats.avgSustainabilityScore}%`,
      icon: Leaf,
      color: 'bg-green-500',
      change: '+5.2%'
    },
    {
      title: 'Energy Reduction Potential',
      value: `${stats.totalEnergyReduction} GJ`,
      icon: Zap,
      color: 'bg-orange-500',
      change: '+18%'
    },
    {
      title: 'Best Circular Score',
      value: `${stats.bestCircularScore}%`,
      icon: TrendingUp,
      color: 'bg-purple-500',
      change: '+8.1%'
    }
  ];

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
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
                    <span className="text-green-600 text-sm font-medium">{stat.change}</span>
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
     {/* Sustainability Trends */}
<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
  <h3 className="text-lg font-semibold text-gray-900 mb-4">
    Sustainability Trends
  </h3>
  <div className="h-80"> {/* Fixed height */}
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
  <div className="h-80"> {/* Fixed height */}
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

   {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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

        {/* Recent Projects */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Projects
          </h3>
          <div className="space-y-4">
            {projects.slice(0, 5).map((project, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">
                    {project.projectName || 'Unnamed Project'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(project.timestamp).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-green-600">
                    {project.sustainabilityScore || 0}%
                  </p>
                  <p className="text-xs text-gray-500">Score</p>
                </div>
              </div>
            ))}
            {projects.length === 0 && (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No projects yet</p>
                <button className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Project
                </button>
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
            <button className="w-full flex items-center p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
              <Plus className="h-5 w-5 text-green-600 mr-3" />
              <span className="text-green-700 font-medium">Submit New Process Data</span>
            </button>
            
            <button className="w-full flex items-center p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
              <Activity className="h-5 w-5 text-blue-600 mr-3" />
              <span className="text-blue-700 font-medium">Run Scenario Simulation</span>
            </button>
            
            <button className="w-full flex items-center p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
              <BarChart3 className="h-5 w-5 text-purple-600 mr-3" />
              <span className="text-purple-700 font-medium">Generate Report</span>
            </button>
            
            <button className="w-full flex items-center p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
              <TrendingUp className="h-5 w-5 text-orange-600 mr-3" />
              <span className="text-orange-700 font-medium">Compare Projects</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;