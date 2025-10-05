import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Eye, 
  BarChart3,
  Zap,
  Droplets,
  Recycle,
  ArrowDown,
  Loader,
  MessageCircle
} from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import AIChatbot from './AIChatbot';
import AdvancedCharts from './AdvancedCharts';
import ISOReportSection from './ISOReportSection';
import MetricsComparisonTable from './MetricsComparisonTable';
import SustainabilityScores from './SustainabilityScores';
import ProjectOverview from './ProjectOverview';
import ReportHeader from './ReportHeader';
import ChartsSection from './ChartsSection';

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
  // ISO 14040/14044 compliant structure
  executiveSummary: {
    projectOverview: string;
    keyFindings: string[];
    recommendations: string[];
  };
  goalAndScope: {
    goal: string;
    functionalUnit: string;
    systemBoundary: string;
    impactCategories: string[];
    cutoffCriteria: string;
    geographicalScope: string;
    timeScope: string;
    dataQuality: string;
  };
  lifeCycleInventory: {
    dataCollection: string;
    stageMetrics: any[];
    inventoryFlows: {
      energy: { linear: number; circular: number; unit: string };
      water: { linear: number; circular: number; unit: string };
      materials: { recycled: number; unit: string };
      waste: { linear: number; circular: number; unit: string };
    };
  };
  lifeCycleImpactAssessment: {
    characterization: {
      linear: {
        climateChange: number;
        acidification: number;
        eutrophication: number;
        energyDemand: number;
      };
      circular: {
        climateChange: number;
        acidification: number;
        eutrophication: number;
        energyDemand: number;
      };
    };
    normalization: string;
    weighting: string;
    impactCategories: Record<string, string>;
    uncertaintyAnalysis: string;
  };
  interpretation: {
    significantFindings: string[];
    limitations: string[];
    recommendations: string[];
    conclusionsAndRecommendations: string;
  };
  // Legacy structure for backward compatibility
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
    impactTotals: {
      linear: {
        climateChange: number;
        acidification: number;
        eutrophication: number;
        energyDemand: number;
      };
      circular: {
        climateChange: number;
        acidification: number;
        eutrophication: number;
        energyDemand: number;
      };
    };
  };
  aiInsights: string[];
  metadata: {
    generatedAt: string;
    reportVersion: string;
    scenarioType: string;
    standard: string;
    softwareVersion: string;
    reviewer: string;
    dataQualityRating: string;
  };
}

interface ReportsProps {
  user: User;
}

const Reports: React.FC<ReportsProps> = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [reportType, setReportType] = useState<'full' | 'executive' | 'technical'>('full');
  const [viewMode, setViewMode] = useState<'iso' | 'legacy'>('iso');
  const [activeSection, setActiveSection] = useState<string>('executive');

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

  const generateReport = async (type: 'full' | 'executive' | 'technical' = 'full') => {
    if (!selectedProject) return;

    setGenerating(true);
    try {
      const token = localStorage.getItem('lca_token');
      const endpoint = type === 'executive' ? '/executive/' : type === 'technical' ? '/technical/' : '/generate/';
      const response = await fetch(`http://localhost:5000/api/report${endpoint}${selectedProject}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setReportData(data);
        setReportType(type);
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

  // Chart data for visualization (with null checks)
  const comparisonChartData = reportData?.totals?.linear ? {
    labels: ['Energy (GJ)', 'Water (m³)', 'Waste (kg)', 'CO₂ (kg)'],
    datasets: [
      {
        label: 'Linear Economy',
        data: [
          reportData.totals.linear.energy || 0,
          reportData.totals.linear.water || 0,
          reportData.totals.linear.waste || 0,
          reportData.totals.linear.co2 || 0
        ],
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 2
      },
      {
        label: 'Circular Economy',
        data: [
          reportData.totals.circular?.energy || 0,
          reportData.totals.circular?.water || 0,
          reportData.totals.circular?.waste || 0,
          reportData.totals.circular?.co2 || 0
        ],
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 2
      }
    ]
  } : null;

  const stagesChartData = reportData?.stageMetrics && reportData.stageMetrics.length > 0 ? {
    labels: reportData.stageMetrics.map(stage => stage.stageName || 'Unknown Stage'),
    datasets: [
      {
        label: 'Linear Energy Usage',
        data: reportData.stageMetrics.map(stage => stage.linear?.energyUsage || 0),
        backgroundColor: 'rgba(239, 68, 68, 0.6)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1
      },
      {
        label: 'Circular Energy Usage',
        data: reportData.stageMetrics.map(stage => stage.circular?.energyUsage || 0),
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Project Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Project for Report Generation
            </label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Select a project</option>
              {projects.map(project => (
                <option key={project.projectId} value={project.projectId}>
                  {project.projectName} - {new Date(project.timestamp).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>
          
          {/* Report Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as 'full' | 'executive' | 'technical')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="executive">Executive Summary</option>
              <option value="full">Full ISO 14040/14044 Report</option>
              <option value="technical">Technical Detailed Report</option>
            </select>
          </div>
          
          {/* View Mode Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              View Mode
            </label>
            <div className="flex space-x-3">
              <button
                onClick={() => setViewMode('iso')}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  viewMode === 'iso'
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                }`}
              >
                ISO Standard
              </button>
              <button
                onClick={() => setViewMode('legacy')}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  viewMode === 'legacy'
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                }`}
              >
                Legacy View
              </button>
            </div>
          </div>
        </div>
        
        {/* Generate Report Actions */}
        <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={() => generateReport('executive')}
            disabled={!selectedProject || generating}
            className="flex items-center px-4 py-2 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {generating && reportType === 'executive' ? (
              <Loader className="animate-spin h-4 w-4 mr-2" />
            ) : (
              <Eye className="h-4 w-4 mr-2" />
            )}
            Executive Summary
          </button>
          
          <button
            onClick={() => generateReport('full')}
            disabled={!selectedProject || generating}
            className="flex items-center px-4 py-2 bg-green-600 text-white font-medium text-sm rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {generating && reportType === 'full' ? (
              <Loader className="animate-spin h-4 w-4 mr-2" />
            ) : (
              <Eye className="h-4 w-4 mr-2" />
            )}
            Full ISO Report
          </button>
          
          <button
            onClick={() => generateReport('technical')}
            disabled={!selectedProject || generating}
            className="flex items-center px-4 py-2 bg-purple-600 text-white font-medium text-sm rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {generating && reportType === 'technical' ? (
              <Loader className="animate-spin h-4 w-4 mr-2" />
            ) : (
              <Eye className="h-4 w-4 mr-2" />
            )}
            Technical Details
          </button>
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
          <div id="report-content" className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {viewMode === 'iso' && reportData?.executiveSummary ? (
              // ISO 14040/14044 Compliant View
              <ISOReportSection 
                reportData={reportData}
                activeSection={activeSection}
                onSectionChange={setActiveSection}
              />
            ) : (
              // Legacy View
              <div className="p-8">
                {/* Report Header */}
                <div className="border-b border-gray-200 pb-6 mb-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Life Cycle Assessment Report
                      </h1>
                      <p className="text-lg text-gray-700 font-medium">
                        {reportData.project?.projectName || 'Unknown Project'}
                      </p>
                    </div>
                    <div className="text-right text-sm text-gray-600">
                      <div>Generated: {new Date(reportData.metadata?.generatedAt || Date.now()).toLocaleDateString()}</div>
                      <div>Version: {reportData.metadata?.reportVersion || 'Unknown'}</div>
                      <div>Standard: {reportData.metadata?.standard || 'Legacy Format'}</div>
                      <div>User: {reportData.project?.user || 'Unknown User'}</div>
                    </div>
                  </div>
                </div>

                {/* Advanced Visualizations Section */}
                {reportData?.totals?.impactTotals && reportData?.stageMetrics && (
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Advanced Impact Analysis</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Environmental Impact Categories</h3>
                        <AdvancedCharts 
                          data={{
                            stageMetrics: reportData.stageMetrics,
                            totals: reportData.totals,
                            metalType: reportData.project?.metalType || 'Unknown'
                          }}
                          type="radar"
                        />
                      </div>
                      
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Energy Flow Analysis</h3>
                        <AdvancedCharts 
                          data={{
                            stageMetrics: reportData.stageMetrics,
                            totals: reportData.totals,
                            metalType: reportData.project?.metalType || 'Unknown'
                          }}
                          type="sankey"
                        />
                      </div>
                      
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Impact Distribution</h3>
                        <AdvancedCharts 
                          data={{
                            stageMetrics: reportData.stageMetrics,
                            totals: reportData.totals,
                            metalType: reportData.project?.metalType || 'Unknown'
                          }}
                          type="waterfall"
                        />
                      </div>
                      
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Improvement Trends</h3>
                        <AdvancedCharts 
                          data={{
                            stageMetrics: reportData.stageMetrics,
                            totals: reportData.totals,
                            metalType: reportData.project?.metalType || 'Unknown'
                          }}
                          type="heatmap"
                        />
                      </div>
                    </div>
                  </div>
                )}                
                {/* Report Header */}
                <ReportHeader 
                  project={reportData.project || {}}
                  metadata={reportData.metadata || {}}
                />

                {/* Project Overview */}
                <ProjectOverview 
                  project={reportData.project || {}}
                  metadata={reportData.metadata || {}}
                />

                {/* Sustainability Scores */}
                <SustainabilityScores scores={reportData.scores || {}} />

            {/* Linear vs Circular Comparison */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Linear vs Circular Economy Impact</h2>
              
              {/* Metrics Comparison Table */}
              <MetricsComparisonTable totals={reportData.totals || {}} />

              {/* Charts */}
              <ChartsSection 
                chartsData={{
                  comparisonChartData,
                  stagesChartData
                }}
              />

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
        )}
      </div>

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
          projectName={reportData.project?.projectName || 'Unknown Project'}
          isOpen={isChatbotOpen}
          onClose={() => setIsChatbotOpen(false)}
          reportData={reportData}
        />
      )}
    </div>
  );
};

export default Reports;