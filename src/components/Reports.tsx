import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Eye, 
  Calendar, 
  BarChart3,
  TrendingUp,
  Zap,
  Droplets,
  Recycle,
  ArrowDown,
  ArrowUp,
  Loader,
  MessageCircle
} from 'lucide-react';
import { Bar, Line } from 'react-chartjs-2';
import AIChatbot from './AIChatbot';

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
}

interface ReportData {
  project: {
    projectId: string;
    projectName: string;
    metalType: string;
    productionRoute: string;
    region: string;
    timestamp: string;
    user: string;
  };
  scores: {
    sustainability: number;
    circular: number;
    linear: number;
  };
  stageMetrics: any[];
  totals: {
    linear: {
      energy: number;
      water: number;
      waste: number;
      co2: number;
    };
    circular: {
      energy: number;
      water: number;
      waste: number;
      co2: number;
    };
  };
  aiInsights: string[];
  metadata: {
    generatedAt: string;
    reportVersion: string;
    scenarioType: string;
  };
}

interface ReportsProps {
  user: User;
}

const Reports: React.FC<ReportsProps> = ({ user }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
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

  const generateReport = async () => {
    if (!selectedProject) return;

    setGenerating(true);
    try {
      const token = localStorage.getItem('lca_token');
      const response = await fetch(`http://localhost:5000/api/report/generate/${selectedProject}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setReportData(data);
      }
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setGenerating(false);
    }
  };

  const downloadPDF = async () => {
    if (!reportData) return;

    // Import jsPDF dynamically
    const { jsPDF } = await import('jspdf');
    const html2canvas = (await import('html2canvas')).default;

    const doc = new jsPDF();
    const element = document.getElementById('report-content');
    
    if (element) {
      const canvas = await html2canvas(element);
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        doc.addPage();
        doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      doc.save(`LCA_Report_${reportData.project.projectName}_${new Date().toISOString().split('T')[0]}.pdf`);
    }
  };

  const downloadExcel = async () => {
    if (!reportData) return;

    // Import XLSX dynamically
    const XLSX = await import('xlsx');

    // Create workbook with multiple sheets
    const workbook = XLSX.utils.book_new();

    // Project Overview Sheet
    const projectData = [
      ['Project Name', reportData.project.projectName],
      ['Project ID', reportData.project.projectId],
      ['Metal Type', reportData.project.metalType],
      ['Production Route', reportData.project.productionRoute],
      ['Region', reportData.project.region],
      ['Generated Date', new Date(reportData.metadata.generatedAt).toLocaleDateString()],
      [''],
      ['Scores'],
      ['Sustainability Score', `${reportData.scores.sustainability}%`],
      ['Circular Score', `${reportData.scores.circular}%`],
      ['Linear Score', `${reportData.scores.linear}%`]
    ];

    const projectSheet = XLSX.utils.aoa_to_sheet(projectData);
    XLSX.utils.book_append_sheet(workbook, projectSheet, 'Project Overview');

    // Stage Metrics Sheet
    const stageHeaders = ['Stage', 'Material', 'Linear Energy', 'Circular Energy', 'Linear Water', 'Circular Water', 'Waste Linear', 'Waste Circular', 'CO2 Linear', 'CO2 Circular'];
    const stageData = [
      stageHeaders,
      ...reportData.stageMetrics.map(stage => [
        stage.stageName,
        stage.materialType,
        stage.linear.energyUsage.toFixed(2),
        stage.circular.energyUsage.toFixed(2),
        stage.linear.waterUsage.toFixed(2),
        stage.circular.waterUsage.toFixed(2),
        stage.linear.wasteGenerated.toFixed(2),
        stage.circular.wasteGenerated.toFixed(2),
        stage.linear.co2Emissions.toFixed(2),
        stage.circular.co2Emissions.toFixed(2)
      ])
    ];

    const stageSheet = XLSX.utils.aoa_to_sheet(stageData);
    XLSX.utils.book_append_sheet(workbook, stageSheet, 'Stage Metrics');

    // Totals Comparison Sheet
    const totalsData = [
      ['Metric', 'Linear Total', 'Circular Total', 'Improvement', 'Percentage'],
      ['Energy (GJ)', reportData.totals.linear.energy.toFixed(2), reportData.totals.circular.energy.toFixed(2), (reportData.totals.linear.energy - reportData.totals.circular.energy).toFixed(2), (((reportData.totals.linear.energy - reportData.totals.circular.energy) / reportData.totals.linear.energy) * 100).toFixed(1) + '%'],
      ['Water (m³)', reportData.totals.linear.water.toFixed(2), reportData.totals.circular.water.toFixed(2), (reportData.totals.linear.water - reportData.totals.circular.water).toFixed(2), (((reportData.totals.linear.water - reportData.totals.circular.water) / reportData.totals.linear.water) * 100).toFixed(1) + '%'],
      ['Waste (kg)', reportData.totals.linear.waste.toFixed(2), reportData.totals.circular.waste.toFixed(2), (reportData.totals.linear.waste - reportData.totals.circular.waste).toFixed(2), (((reportData.totals.linear.waste - reportData.totals.circular.waste) / reportData.totals.linear.waste) * 100).toFixed(1) + '%'],
      ['CO2 (kg)', reportData.totals.linear.co2.toFixed(2), reportData.totals.circular.co2.toFixed(2), (reportData.totals.linear.co2 - reportData.totals.circular.co2).toFixed(2), (((reportData.totals.linear.co2 - reportData.totals.circular.co2) / reportData.totals.linear.co2) * 100).toFixed(1) + '%']
    ];

    const totalsSheet = XLSX.utils.aoa_to_sheet(totalsData);
    XLSX.utils.book_append_sheet(workbook, totalsSheet, 'Linear vs Circular');

    // AI Insights Sheet
    const insightsData = [
      ['AI-Generated Insights'],
      [''],
      ...reportData.aiInsights.map(insight => [insight])
    ];

    const insightsSheet = XLSX.utils.aoa_to_sheet(insightsData);
    XLSX.utils.book_append_sheet(workbook, insightsSheet, 'AI Insights');

    // Save the file
    XLSX.writeFile(workbook, `LCA_Report_${reportData.project.projectName}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Chart data for visualization
  const comparisonChartData = reportData ? {
    labels: ['Energy (GJ)', 'Water (m³)', 'Waste (kg)', 'CO₂ (kg)'],
    datasets: [
      {
        label: 'Linear Economy',
        data: [
          reportData.totals.linear.energy,
          reportData.totals.linear.water,
          reportData.totals.linear.waste,
          reportData.totals.linear.co2
        ],
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 2
      },
      {
        label: 'Circular Economy',
        data: [
          reportData.totals.circular.energy,
          reportData.totals.circular.water,
          reportData.totals.circular.waste,
          reportData.totals.circular.co2
        ],
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 2
      }
    ]
  } : null;

  const stagesChartData = reportData ? {
    labels: reportData.stageMetrics.map(stage => stage.stageName),
    datasets: [
      {
        label: 'Linear Energy Usage',
        data: reportData.stageMetrics.map(stage => stage.linear.energyUsage),
        backgroundColor: 'rgba(239, 68, 68, 0.6)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1
      },
      {
        label: 'Circular Energy Usage',
        data: reportData.stageMetrics.map(stage => stage.circular.energyUsage),
        backgroundColor: 'rgba(16, 185, 129, 0.6)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1
      }
    ]
  } : null;

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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports & Exports</h1>
        <p className="text-gray-600">
          Generate comprehensive LCA reports with linear vs circular economy analysis
        </p>
      </div>

      {/* Project Selection and Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Project for Report Generation
            </label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full md:max-w-md px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Select a project</option>
              {projects.map(project => (
                <option key={project.projectId} value={project.projectId}>
                  {project.projectName} - {new Date(project.timestamp).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={generateReport}
              disabled={!selectedProject || generating}
              className="flex items-center px-4 py-2 bg-green-600 text-white font-medium text-sm rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {generating ? (
                <Loader className="animate-spin h-4 w-4 mr-2" />
              ) : (
                <Eye className="h-4 w-4 mr-2" />
              )}
              {generating ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </div>
      </div>

      {/* Report Content */}
      {reportData && (
        <>
          {/* Export Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Export Options</h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={downloadPDF}
                className="flex items-center px-4 py-2 bg-red-600 text-white font-medium text-sm rounded-lg hover:bg-red-700 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </button>
              
              <button
                onClick={downloadExcel}
                className="flex items-center px-4 py-2 bg-green-600 text-white font-medium text-sm rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Excel
              </button>
              
              <button
                onClick={() => window.print()}
                className="flex items-center px-4 py-2 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FileText className="h-4 w-4 mr-2" />
                Print Report
              </button>
              
              <button
                onClick={() => setIsChatbotOpen(true)}
                className="flex items-center px-4 py-2 bg-purple-600 text-white font-medium text-sm rounded-lg hover:bg-purple-700 transition-colors"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                AI Assistant
              </button>
            </div>
          </div>

          {/* Report Preview */}
          <div id="report-content" className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            {/* Report Header */}
            <div className="border-b border-gray-200 pb-6 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Life Cycle Assessment Report
                  </h1>
                  <p className="text-lg text-gray-700 font-medium">
                    {reportData.project.projectName}
                  </p>
                </div>
                <div className="text-right text-sm text-gray-600">
                  <div>Generated: {new Date(reportData.metadata.generatedAt).toLocaleDateString()}</div>
                  <div>Version: {reportData.metadata.reportVersion}</div>
                  <div>User: {reportData.project.user}</div>
                </div>
              </div>
            </div>

            {/* Project Overview */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Metal Type</div>
                  <div className="font-medium text-gray-900">{reportData.project.metalType}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Production Route</div>
                  <div className="font-medium text-gray-900">{reportData.project.productionRoute}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Region</div>
                  <div className="font-medium text-gray-900">{reportData.project.region}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Analysis Type</div>
                  <div className="font-medium text-gray-900">{reportData.metadata.scenarioType}</div>
                </div>
              </div>
            </div>

            {/* Sustainability Scores */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Sustainability Scores</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {reportData.scores.sustainability}%
                  </div>
                  <div className="text-sm font-medium text-green-800">Overall Sustainability</div>
                </div>
                
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {reportData.scores.circular}%
                  </div>
                  <div className="text-sm font-medium text-blue-800">Circular Economy</div>
                </div>
                
                <div className="text-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
                  <div className="text-3xl font-bold text-gray-600 mb-2">
                    {reportData.scores.linear}%
                  </div>
                  <div className="text-sm font-medium text-gray-800">Linear Economy</div>
                </div>
              </div>
            </div>

            {/* Linear vs Circular Comparison */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Linear vs Circular Economy Impact</h2>
              
              {/* Metrics Comparison Table */}
              <div className="overflow-x-auto mb-6">
                <table className="w-full border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Metric</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Linear Economy</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Circular Economy</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Improvement</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Percentage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        <Zap className="inline h-4 w-4 mr-2 text-orange-500" />
                        Energy (GJ)
                      </td>
                      <td className="px-4 py-3 text-center text-red-600">
                        {reportData.totals.linear.energy.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-center text-green-600">
                        {reportData.totals.circular.energy.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center">
                          <ArrowDown className="h-4 w-4 text-green-500 mr-1" />
                          {(reportData.totals.linear.energy - reportData.totals.circular.energy).toFixed(2)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center font-medium text-green-600">
                        {(((reportData.totals.linear.energy - reportData.totals.circular.energy) / reportData.totals.linear.energy) * 100).toFixed(1)}%
                      </td>
                    </tr>
                    
                    <tr>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        <Droplets className="inline h-4 w-4 mr-2 text-blue-500" />
                        Water (m³)
                      </td>
                      <td className="px-4 py-3 text-center text-red-600">
                        {reportData.totals.linear.water.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-center text-green-600">
                        {reportData.totals.circular.water.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center">
                          <ArrowDown className="h-4 w-4 text-green-500 mr-1" />
                          {(reportData.totals.linear.water - reportData.totals.circular.water).toFixed(2)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center font-medium text-green-600">
                        {(((reportData.totals.linear.water - reportData.totals.circular.water) / reportData.totals.linear.water) * 100).toFixed(1)}%
                      </td>
                    </tr>
                    
                    <tr>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        <Recycle className="inline h-4 w-4 mr-2 text-green-500" />
                        Waste (kg)
                      </td>
                      <td className="px-4 py-3 text-center text-red-600">
                        {reportData.totals.linear.waste.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-center text-green-600">
                        {reportData.totals.circular.waste.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center">
                          <ArrowDown className="h-4 w-4 text-green-500 mr-1" />
                          {(reportData.totals.linear.waste - reportData.totals.circular.waste).toFixed(2)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center font-medium text-green-600">
                        {(((reportData.totals.linear.waste - reportData.totals.circular.waste) / reportData.totals.linear.waste) * 100).toFixed(1)}%
                      </td>
                    </tr>
                    
                    <tr>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        <div className="inline h-4 w-4 mr-2 bg-gray-500 rounded-full"></div>
                        CO₂ Emissions (kg)
                      </td>
                      <td className="px-4 py-3 text-center text-red-600">
                        {reportData.totals.linear.co2.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-center text-green-600">
                        {reportData.totals.circular.co2.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center">
                          <ArrowDown className="h-4 w-4 text-green-500 mr-1" />
                          {(reportData.totals.linear.co2 - reportData.totals.circular.co2).toFixed(2)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center font-medium text-green-600">
                        {(((reportData.totals.linear.co2 - reportData.totals.circular.co2) / reportData.totals.linear.co2) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Charts */}
{/* Charts */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <div>
    <h3 className="text-lg font-medium text-gray-900 mb-3">Overall Comparison</h3>
    <div className="h-64">
      {comparisonChartData && (
        <Bar
          data={comparisonChartData}
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
      )}
    </div>
  </div>

  <div>
    <h3 className="text-lg font-medium text-gray-900 mb-3">Stage-wise Energy Comparison</h3>
    <div className="h-64">
      {stagesChartData && (
        <Bar
          data={stagesChartData}
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
      )}
    </div>
  </div>
</div>

            </div>

            {/* AI-Generated Insights */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">AI-Generated Insights</h2>
                <button
                  onClick={() => setIsChatbotOpen(true)}
                  className="flex items-center px-3 py-1.5 bg-purple-100 text-purple-700 text-sm font-medium rounded-full hover:bg-purple-200 transition-colors"
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Ask AI
                </button>
              </div>
              <div className="space-y-4">
                {reportData.aiInsights.map((insight, index) => (
                  <div key={index} className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                    <p className="text-blue-800">{insight}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Stage-wise Details */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Stage-wise Analysis</h2>
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Stage</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Material</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Energy Saving</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Water Saving</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Waste Reduction</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">CO₂ Reduction</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {reportData.stageMetrics.map((stage, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 font-medium text-gray-900">
                          Stage {stage.stageNumber}: {stage.stageName}
                        </td>
                        <td className="px-4 py-3 text-gray-700">{stage.materialType}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            {stage.improvement.energySaving}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {stage.improvement.waterSaving}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {stage.improvement.wasteSaving}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {stage.improvement.co2Saving}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 pt-6 text-center text-sm text-gray-500">
              <p>
                This report was generated by the LCA Platform on {new Date(reportData.metadata.generatedAt).toLocaleDateString()}
              </p>
              <p>Report Version: {reportData.metadata.reportVersion} | Analysis Type: {reportData.metadata.scenarioType}</p>
            </div>
          </div>
        </>
      )}

      {/* No Projects State */}
      {projects.length === 0 && !loading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Projects Available</h3>
          <p className="text-gray-600 mb-6">
            Create and submit your first project to generate comprehensive LCA reports.
          </p>
          <button className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium text-sm rounded-lg hover:bg-green-700 transition-colors">
            <BarChart3 className="h-5 w-5 mr-2" />
            Submit Your First Project
          </button>
        </div>
      )}
      
      {/* AI Chatbot Integration */}
      {reportData && (
        <AIChatbot
          projectId={selectedProject}
          projectName={reportData.project.projectName}
          isOpen={isChatbotOpen}
          onClose={() => setIsChatbotOpen(false)}
          reportData={reportData}
        />
      )}
    </div>
  );
};

export default Reports;