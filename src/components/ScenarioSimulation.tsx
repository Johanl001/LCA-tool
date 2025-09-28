import React, { useState, useEffect } from 'react';
import { 
  Play, 
  RotateCcw, 
  TrendingUp, 
  Zap, 
  Droplets, 
  Recycle,
  Truck,
  Settings,
  BarChart3,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Bar, Line } from 'react-chartjs-2';

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
}

interface ScenarioChanges {
  energySource: string;
  materialType: string;
  transportMode: string;
  recyclingRate: number;
  efficiency: number;
}

interface SimulationResult {
  originalScore: number;
  predictedScore: number;
  improvements: {
    energyReduction: number;
    waterReduction: number;
    co2Reduction: number;
  };
  scenarioChanges: ScenarioChanges;
}

interface ScenarioSimulationProps {
  user: User;
}

const ScenarioSimulation: React.FC<ScenarioSimulationProps> = ({ user }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [scenarios, setScenarios] = useState<ScenarioChanges>({
    energySource: 'mixed',
    materialType: '',
    transportMode: 'truck',
    recyclingRate: 50,
    efficiency: 85
  });
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchSimulationHistory();
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
    }
  };

  const fetchSimulationHistory = async () => {
    try {
      const token = localStorage.getItem('lca_token');
      const response = await fetch(`http://localhost:5000/api/simulation/history/${selectedProject}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      }
    } catch (error) {
      console.error('Error fetching simulation history:', error);
    }
  };

  const runSimulation = async () => {
    if (!selectedProject) {
      setError('Please select a project first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('lca_token');
      const response = await fetch('http://localhost:5000/api/simulation/run', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          projectId: selectedProject,
          scenarioName: 'Custom Scenario',
          scenarioChanges: scenarios
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Simulation failed');
      }

      setSimulationResult({
        originalScore: data.originalScore,
        predictedScore: data.predictedScore,
        improvements: data.improvements,
        scenarioChanges: data.scenarioChanges
      });

      // Refresh history
      fetchSimulationHistory();

    } catch (error: any) {
      setError(error.message || 'An error occurred during simulation');
    } finally {
      setLoading(false);
    }
  };

  const resetScenarios = () => {
    setScenarios({
      energySource: 'mixed',
      materialType: '',
      transportMode: 'truck',
      recyclingRate: 50,
      efficiency: 85
    });
    setSimulationResult(null);
    setError('');
  };

  const updateScenario = (field: keyof ScenarioChanges, value: any) => {
    setScenarios({
      ...scenarios,
      [field]: value
    });
  };

  // Chart data for comparison
  const comparisonChartData = simulationResult ? {
    labels: ['Current', 'Predicted'],
    datasets: [
      {
        label: 'Sustainability Score',
        data: [simulationResult.originalScore, simulationResult.predictedScore],
        backgroundColor: ['rgba(239, 68, 68, 0.8)', 'rgba(16, 185, 129, 0.8)'],
        borderColor: ['rgba(239, 68, 68, 1)', 'rgba(16, 185, 129, 1)'],
        borderWidth: 2
      }
    ]
  } : null;

  const improvementsChartData = simulationResult ? {
    labels: ['Energy Reduction', 'Water Reduction', 'CO₂ Reduction'],
    datasets: [
      {
        label: 'Improvement (%)',
        data: [
          simulationResult.improvements.energyReduction,
          simulationResult.improvements.waterReduction,
          simulationResult.improvements.co2Reduction
        ],
        backgroundColor: ['rgba(251, 146, 60, 0.8)', 'rgba(14, 165, 233, 0.8)', 'rgba(16, 185, 129, 0.8)'],
        borderColor: ['rgba(251, 146, 60, 1)', 'rgba(14, 165, 233, 1)', 'rgba(16, 185, 129, 1)'],
        borderWidth: 2
      }
    ]
  } : null;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Scenario Simulation</h1>
        <p className="text-gray-600">
          Explore different scenarios and their impact on sustainability metrics
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Scenario Configuration */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Configure Scenario</h2>
              <button
                onClick={resetScenarios}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </button>
            </div>

            {/* Project Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Project
              </label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Select a project</option>
                {projects.map(project => (
                  <option key={project.projectId} value={project.projectId}>
                    {project.projectName} (Score: {project.sustainabilityScore}%)
                  </option>
                ))}
              </select>
            </div>

            {/* Scenario Parameters */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Zap className="inline h-4 w-4 mr-1" />
                  Energy Source
                </label>
                <select
                  value={scenarios.energySource}
                  onChange={(e) => updateScenario('energySource', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="mixed">Mixed Sources</option>
                  <option value="renewable">Renewable Energy</option>
                  <option value="fossil">Fossil Fuels</option>
                  <option value="nuclear">Nuclear</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Truck className="inline h-4 w-4 mr-1" />
                  Transport Mode
                </label>
                <select
                  value={scenarios.transportMode}
                  onChange={(e) => updateScenario('transportMode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="truck">Truck</option>
                  <option value="rail">Rail</option>
                  <option value="ship">Ship</option>
                  <option value="pipeline">Pipeline</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Recycle className="inline h-4 w-4 mr-1" />
                  Recycling Rate: {scenarios.recyclingRate}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={scenarios.recyclingRate}
                  onChange={(e) => updateScenario('recyclingRate', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Settings className="inline h-4 w-4 mr-1" />
                  Process Efficiency: {scenarios.efficiency}%
                </label>
                <input
                  type="range"
                  min="50"
                  max="100"
                  step="1"
                  value={scenarios.efficiency}
                  onChange={(e) => updateScenario('efficiency', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>50%</span>
                  <span>75%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            {/* Run Simulation Button */}
            <button
              onClick={runSimulation}
              disabled={loading || !selectedProject}
              className="w-full mt-6 flex items-center justify-center px-6 py-3 bg-green-600 text-white font-medium text-sm rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              ) : (
                <Play className="h-5 w-5 mr-2" />
              )}
              {loading ? 'Running Simulation...' : 'Run Simulation'}
            </button>
          </div>
        </div>

        {/* Simulation Results */}
        <div className="space-y-6">
          {simulationResult && (
            <>
              {/* Score Comparison */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Score Impact</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Current Score</span>
                    <span className="text-lg font-medium text-red-600">
                      {simulationResult.originalScore}%
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Predicted Score</span>
                    <span className="text-lg font-medium text-green-600">
                      {simulationResult.predictedScore}%
                    </span>
                  </div>
                  
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">Improvement</span>
                      <div className="flex items-center">
                        <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                        <span className="text-lg font-bold text-green-600">
                          +{simulationResult.predictedScore - simulationResult.originalScore}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Environmental Impact */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Environmental Impact</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Zap className="h-4 w-4 text-orange-500 mr-2" />
                      <span className="text-sm text-gray-700">Energy Reduction</span>
                    </div>
                    <span className="font-medium text-orange-600">
                      {simulationResult.improvements.energyReduction}%
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Droplets className="h-4 w-4 text-blue-500 mr-2" />
                      <span className="text-sm text-gray-700">Water Reduction</span>
                    </div>
                    <span className="font-medium text-blue-600">
                      {simulationResult.improvements.waterReduction}%
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-4 w-4 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-700">CO₂ Reduction</span>
                    </div>
                    <span className="font-medium text-green-600">
                      {simulationResult.improvements.co2Reduction}%
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Simulation History */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Simulation History</h3>
            
            <div className="space-y-3">
              {history.length > 0 ? (
                history.slice(0, 5).map((sim, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{sim.scenarioName}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(sim.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-600">
                        {sim.predictedScores.sustainabilityScore}%
                      </p>
                      <div className="flex items-center">
                        <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                        <span className="text-xs text-gray-500">
                          +{sim.predictedScores.energyReduction}% energy
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No simulation history</p>
                  <p className="text-sm text-gray-400">Run your first simulation to see results here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      {/* Charts Section */}
{simulationResult && (
  <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
    {/* Score Comparison Chart */}
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Score Comparison</h3>
      <div className="h-80"> {/* Fixed height */}
        {comparisonChartData && (
          <Bar
            data={comparisonChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: { beginAtZero: true, max: 100 }
              }
            }}
          />
        )}
      </div>
    </div>

    {/* Improvements Chart */}
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Environmental Improvements</h3>
      <div className="h-80"> {/* Fixed height */}
        {improvementsChartData && (
          <Bar
            data={improvementsChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: { beginAtZero: true }
              }
            }}
          />
        )}
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default ScenarioSimulation;