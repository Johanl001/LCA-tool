import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Lightbulb, 
  TrendingUp, 
  Target, 
  Leaf, 
  Zap,
  Droplets,
  Recycle,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  BarChart3
} from 'lucide-react';

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
  stages: any[];
  overallData: any;
}

interface AIInsightsProps {
  user: User;
}

const AIInsights: React.FC<AIInsightsProps> = ({ user }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<any[]>([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      generateInsights();
    }
  }, [selectedProject]);

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
        if (data.length > 0) {
          setSelectedProject(data[0].projectId);
        }
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateInsights = () => {
    const project = projects.find(p => p.projectId === selectedProject);
    if (!project) return;

    // Calculate stage-wise metrics
    const stageMetrics = project.stages.map((stage, index) => ({
      index,
      stageName: stage.stageName,
      energyUsage: stage.energyUsage || 0,
      waterUsage: stage.waterUsage || 0,
      wasteGenerated: stage.wasteGenerated || (stage.energyUsage * 0.1),
      transportDistance: stage.transportDistance || 0,
      recyclingPercentage: stage.recyclingPercentage || 0,
      efficiency: stage.efficiency || 85
    }));

    // Find highest impact stages
    const highestEnergyStage = stageMetrics.reduce((max, stage) => 
      stage.energyUsage > max.energyUsage ? stage : max
    );
    
    const highestWaterStage = stageMetrics.reduce((max, stage) => 
      stage.waterUsage > max.waterUsage ? stage : max
    );

    const longestTransportStage = stageMetrics.reduce((max, stage) => 
      stage.transportDistance > max.transportDistance ? stage : max
    );

    // Calculate totals
    const totalEnergy = stageMetrics.reduce((sum, stage) => sum + stage.energyUsage, 0);
    const totalWater = stageMetrics.reduce((sum, stage) => sum + stage.waterUsage, 0);
    const avgRecycling = stageMetrics.reduce((sum, stage) => sum + stage.recyclingPercentage, 0) / stageMetrics.length;

    // Generate AI-powered insights (static placeholders with dynamic data)
    const generatedInsights = [
      {
        id: 1,
        type: 'energy',
        category: 'High Impact Stage',
        title: `${highestEnergyStage.stageName} consumes ${highestEnergyStage.energyUsage.toFixed(1)} GJ of energy`,
        description: `This stage accounts for ${((highestEnergyStage.energyUsage / totalEnergy) * 100).toFixed(1)}% of total energy consumption. Consider switching to renewable energy sources to reduce impact by 40%.`,
        impact: 'high',
        recommendation: 'Switch to renewable energy sources or improve process efficiency',
        potentialReduction: '25-40%',
        icon: Zap,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200'
      },
      {
        id: 2,
        type: 'water',
        category: 'Resource Optimization',
        title: `Water usage peak in ${highestWaterStage.stageName}`,
        description: `${highestWaterStage.stageName} uses ${highestWaterStage.waterUsage.toFixed(1)} m³ of water. Implementing water recycling systems could reduce consumption by 30%.`,
        impact: 'medium',
        recommendation: 'Implement closed-loop water recycling systems',
        potentialReduction: '20-30%',
        icon: Droplets,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      },
      {
        id: 3,
        type: 'circular',
        category: 'Circular Economy',
        title: `Current recycling rate is ${avgRecycling.toFixed(1)}%`,
        description: `Increasing recycling rates across all stages could improve your circular score by ${(100 - project.circularScore).toFixed(0)} points. Focus on material recovery and reuse strategies.`,
        impact: 'high',
        recommendation: 'Implement comprehensive material recovery programs',
        potentialReduction: '15-25%',
        icon: Recycle,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      },
      {
        id: 4,
        type: 'transport',
        category: 'Logistics Optimization',
        title: `Transport efficiency opportunity in ${longestTransportStage.stageName}`,
        description: `${longestTransportStage.stageName} involves ${longestTransportStage.transportDistance} km transport. Using rail instead of road transport could reduce CO₂ emissions by 75%.`,
        impact: 'medium',
        recommendation: 'Switch to more efficient transport modes (rail/ship)',
        potentialReduction: '10-20%',
        icon: Target,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200'
      },
      {
        id: 5,
        type: 'overall',
        category: 'Linear vs Circular',
        title: `Circular economy potential: ${(project.circularScore - project.linearScore).toFixed(0)} point advantage`,
        description: `Your project shows ${project.circularScore > project.linearScore ? 'strong' : 'limited'} circular economy adoption. Implementing design-for-disassembly and material passports could boost performance.`,
        impact: project.circularScore > project.linearScore ? 'medium' : 'high',
        recommendation: 'Design for circularity from the beginning',
        potentialReduction: '5-15%',
        icon: TrendingUp,
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50',
        borderColor: 'border-indigo-200'
      },
      {
        id: 6,
        type: 'sustainability',
        category: 'Overall Performance',
        title: `Sustainability score: ${project.sustainabilityScore}% - ${project.sustainabilityScore >= 80 ? 'Excellent' : project.sustainabilityScore >= 60 ? 'Good' : 'Needs Improvement'}`,
        description: `Your project ${project.sustainabilityScore >= 80 ? 'exceeds' : project.sustainabilityScore >= 60 ? 'meets' : 'falls below'} industry benchmarks. Focus on the highest impact stages for maximum improvement.`,
        impact: project.sustainabilityScore >= 60 ? 'low' : 'high',
        recommendation: project.sustainabilityScore >= 80 ? 'Maintain current practices and explore advanced optimizations' : 'Focus on energy and water reduction strategies',
        potentialReduction: project.sustainabilityScore >= 80 ? '5-10%' : '20-35%',
        icon: project.sustainabilityScore >= 80 ? CheckCircle : AlertTriangle,
        color: project.sustainabilityScore >= 80 ? 'text-green-600' : project.sustainabilityScore >= 60 ? 'text-yellow-600' : 'text-red-600',
        bgColor: project.sustainabilityScore >= 80 ? 'bg-green-50' : project.sustainabilityScore >= 60 ? 'bg-yellow-50' : 'bg-red-50',
        borderColor: project.sustainabilityScore >= 80 ? 'border-green-200' : project.sustainabilityScore >= 60 ? 'border-yellow-200' : 'border-red-200'
      }
    ];

    setInsights(generatedInsights);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  const selectedProjectData = projects.find(p => p.projectId === selectedProject);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div className="p-3 bg-purple-100 rounded-full mr-4">
            <Brain className="h-8 w-8 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI Insights</h1>
            <p className="text-gray-600">
              AI-powered recommendations to optimize your Life Cycle Assessment
            </p>
          </div>
        </div>

        {/* Project Selection */}
        <div className="max-w-md">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Project for Analysis
          </label>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">Select a project</option>
            {projects.map(project => (
              <option key={project.projectId} value={project.projectId}>
                {project.projectName} (Score: {project.sustainabilityScore}%)
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedProjectData && insights.length > 0 ? (
        <>
          {/* Project Overview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Project Overview: {selectedProjectData.projectName}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {selectedProjectData.sustainabilityScore}%
                </div>
                <div className="text-sm text-gray-600">Sustainability Score</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {selectedProjectData.circularScore}%
                </div>
                <div className="text-sm text-gray-600">Circular Economy Score</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600 mb-1">
                  {selectedProjectData.stages.length}
                </div>
                <div className="text-sm text-gray-600">Process Stages</div>
              </div>
            </div>
          </div>

          {/* AI Insights Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {insights.map((insight) => {
              const Icon = insight.icon;
              return (
                <div
                  key={insight.id}
                  className={`bg-white rounded-xl shadow-sm border-l-4 ${insight.borderColor} p-6 hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className={`p-2 ${insight.bgColor} rounded-lg mr-3`}>
                        <Icon className={`h-5 w-5 ${insight.color}`} />
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {insight.category}
                        </span>
                        <h3 className="text-lg font-semibold text-gray-900 mt-1">
                          {insight.title}
                        </h3>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        insight.impact === 'high'
                          ? 'bg-red-100 text-red-800'
                          : insight.impact === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {insight.impact} impact
                    </span>
                  </div>

                  <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                    {insight.description}
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-start">
                      <Lightbulb className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">Recommendation</div>
                        <div className="text-sm text-gray-600">{insight.recommendation}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <div className="flex items-center text-sm text-gray-500">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        Potential reduction: {insight.potentialReduction}
                      </div>
                      <button className="flex items-center text-sm text-purple-600 hover:text-purple-700 font-medium">
                        Learn more
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary Recommendations */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <h2 className="text-xl font-bold mb-4">🎯 Priority Recommendations</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/10 rounded-lg p-4">
                <h3 className="font-semibold mb-2">🔋 Energy Efficiency</h3>
                <p className="text-sm opacity-90">
                  Focus on your highest energy-consuming stage to achieve maximum impact reduction.
                </p>
              </div>
              
              <div className="bg-white/10 rounded-lg p-4">
                <h3 className="font-semibold mb-2">♻️ Circular Design</h3>
                <p className="text-sm opacity-90">
                  Implement design-for-circularity principles to boost your circular economy score.
                </p>
              </div>
              
              <div className="bg-white/10 rounded-lg p-4">
                <h3 className="font-semibold mb-2">🚛 Logistics</h3>
                <p className="text-sm opacity-90">
                  Optimize transportation modes and distances to reduce carbon footprint.
                </p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Projects Available</h3>
          <p className="text-gray-600 mb-6">
            Create and submit your first project to receive AI-powered insights and recommendations.
          </p>
          <button className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-medium text-sm rounded-lg hover:bg-purple-700 transition-colors">
            <Brain className="h-5 w-5 mr-2" />
            Submit Your First Project
          </button>
        </div>
      )}
    </div>
  );
};

export default AIInsights;