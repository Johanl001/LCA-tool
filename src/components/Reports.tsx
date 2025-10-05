import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Eye, 
  BarChart3,
  Loader,
  MessageCircle,
  BookOpen
} from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import AIChatbot from './AIChatbot';
import AdvancedCharts from './AdvancedCharts';
import ReportHeader from './ReportHeader';
import ComprehensiveReport from './ComprehensiveReport';
import DetailedReport from './DetailedReport';
import FileUploadProcessor from './FileUploadProcessor';

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
  // ISO 14040/14044 compliant structure (optional for different report types)
  executiveSummary?: {
    projectOverview: string;
    keyFindings: string[];
    recommendations: string[];
  };
  goalAndScope?: {
    goal: string;
    functionalUnit: string;
    systemBoundary: string;
    impactCategories: string[];
    cutoffCriteria: string;
    geographicalScope: string;
    timeScope: string;
    dataQuality: string;
  };
  lifeCycleInventory?: {
    dataCollection: string;
    stageMetrics: any[];
    inventoryFlows: {
      energy: { linear: number; circular: number; unit: string };
      water: { linear: number; circular: number; unit: string };
      materials: { recycled: number; unit: string };
      waste: { linear: number; circular: number; unit: string };
    };
  };
  lifeCycleImpactAssessment?: {
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
  interpretation?: {
    significantFindings: string[];
    limitations: string[];
    recommendations: string[];
    conclusionsAndRecommendations: string;
  };
  // Legacy structure for backward compatibility
  project?: {
    projectId: string;
    projectName: string;
    metalType: string;
    productionRoute: string;
    region: string;
    timestamp: string;
    user: string;
  };
  scores?: {
    sustainability: number;
    circular: number;
    linear: number;
  };
  stageMetrics?: any[];
  totals?: {
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
    impactTotals?: {
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
  aiInsights?: string[];
  metadata?: {
    generatedAt: string;
    reportVersion?: string;
    scenarioType?: string;
    standard?: string;
    softwareVersion?: string;
    reviewer?: string;
    dataQualityRating?: string;
  };
  // Executive report specific fields
  generatedAt?: string;
  projectName?: string;
  metalType?: string;
  overallSustainabilityScore?: number;
  keyMetrics?: {
    totalEnergyReduction: number;
    totalCo2Reduction: number;
    circularityIndex: number;
  };
  topRecommendations?: string[];
  // Technical report specific fields
  technicalDetails?: {
    calculationMethods: string;
    uncertaintyAnalysis: string;
    sensitivityAnalysis: string;
    dataProvenanceMatrix: string;
    qualityAssurance: string;
    complianceChecklist: {
      iso14040: string;
      iso14044: string;
      dataQuality: string;
      transparency: string;
    };
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
  const [reportType, setReportType] = useState<'full' | 'executive' | 'technical' | 'detailed'>('full');
  const [isComprehensiveReportOpen, setIsComprehensiveReportOpen] = useState(false);
  const [isDetailedReportOpen, setIsDetailedReportOpen] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    // Auto-generate report for the first project when projects are loaded
    if (projects.length > 0 && !reportData && !generating) {
      setSelectedProject(projects[0].projectId);
      generateReport('full');
    }
    // Only show demo if no projects are available
    else if (projects.length === 0 && !loading && !reportData && !generating) {
      generateDemoReport('full');
    }
  }, [projects, loading, reportData, generating]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('lca_token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      
      console.log('🔍 Fetching projects...');
      console.log('API Base URL:', API_BASE_URL);
      console.log('Auth token present:', !!token);
      
      const headers: any = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('✅ Using authentication token');
      } else {
        console.warn('⚠️ No authentication token found');
      }

      const url = `${API_BASE_URL}/api/process/all`;
      console.log('📡 Fetching from:', url);
      
      const response = await fetch(url, { 
        headers,
        method: 'GET'
      });

      console.log('📊 Response status:', response.status);
      console.log('📊 Response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('📦 Raw response data:', data);
        console.log('📦 Data type:', typeof data);
        console.log('📦 Is array:', Array.isArray(data));
        
        if (Array.isArray(data)) {
          setProjects(data);
          console.log(`✅ Successfully loaded ${data.length} projects`);
          
          if (data.length === 0) {
            console.log('📝 No projects found - this might be expected for new users');
          } else {
            console.log('📋 Project details:', data.map(p => ({
              id: p.projectId,
              name: p.projectName,
              timestamp: p.timestamp
            })));
          }
        } else {
          console.error('❌ Response is not an array:', data);
          setProjects([]);
        }
      } else {
        const errorText = await response.text();
        console.error('❌ HTTP Error:', response.status, response.statusText);
        console.error('❌ Error response:', errorText);
        
        try {
          const errorData = JSON.parse(errorText);
          console.error('❌ Parsed error:', errorData);
        } catch (parseError) {
          console.error('❌ Could not parse error response as JSON');
        }
        
        setProjects([]);
      }
    } catch (error) {
      console.error('💥 Network/Fetch Error:', error);
      
      // Type-safe error handling
      const errorDetails = error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : { message: String(error) };
      
      console.error('💥 Error details:', errorDetails);
      
      // Check if it's a network connectivity issue
      if (error instanceof Error && error.name === 'TypeError' && error.message.includes('fetch')) {
        console.error('🌐 This appears to be a network connectivity issue');
        console.error('🔧 Please check if the server is running on the expected port');
      }
      
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const createTestData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('lca_token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      
      console.log('🧪 Creating test project...');
      
      if (!token) {
        console.error('❌ No authentication token found');
        alert('Please log in first to create projects');
        return;
      }

      // First try to create sample data
      console.log('📡 Trying sample data endpoint...');
      const sampleResponse = await fetch(`${API_BASE_URL}/api/process/create-sample`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (sampleResponse.ok) {
        const sampleData = await sampleResponse.json();
        console.log('✅ Sample data created:', sampleData);
        await fetchProjects(); // Refresh the projects list
        return;
      }

      // If sample data fails, create a manual test project
      console.log('📡 Creating manual test project...');
      const testProject = {
        projectName: "Test Aluminum Production Study",
        overallData: {
          totalEnergyUsage: 20.5,
          totalWaterUsage: 12.5,
          metalType: "Aluminum",
          productionRoute: "Primary",
          region: "India",
          productLifetime: 50,
          reusePercentage: 5,
          recyclePercentage: 25,
          landfillPercentage: 70
        },
        stages: [
          {
            stageName: "Bauxite Mining",
            energyUsage: 1.2,
            waterUsage: 2.5,
            materialType: "Aluminum",
            transportMode: "truck",
            transportDistance: 150,
            wasteGenerated: 3.0,
            co2Emissions: 0.8,
            fuelType: "Mixed",
            recyclingPercentage: 5,
            efficiency: 85
          },
          {
            stageName: "Aluminum Smelting",
            energyUsage: 15.8,
            waterUsage: 1.8,
            materialType: "Aluminum",
            transportMode: "truck",
            transportDistance: 50,
            wasteGenerated: 0.5,
            co2Emissions: 12.0,
            fuelType: "Mixed",
            recyclingPercentage: 0,
            efficiency: 95
          }
        ]
      };

      const response = await fetch(`${API_BASE_URL}/api/process/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(testProject)
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Test project created:', data);
        await fetchProjects(); // Refresh the projects list
        alert('Test project created successfully!');
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('❌ Failed to create test project:', errorData);
        alert('Failed to create test project. Check console for details.');
      }
    } catch (error) {
      console.error('💥 Error creating test data:', error);
      alert('Error creating test project. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (type: 'full' | 'executive' | 'technical' | 'detailed' = 'full') => {
    if (!selectedProject) {
      console.log('No project selected, generating demo report');
      generateDemoReport(type);
      return;
    }

    // Handle detailed report separately
    if (type === 'detailed') {
      setIsDetailedReportOpen(true);
      return;
    }

    console.log(`Generating ${type} report for project:`, selectedProject);
    setGenerating(true);
    try {
      const token = localStorage.getItem('lca_token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const endpoint = type === 'executive' ? '/executive/' : type === 'technical' ? '/technical/' : '/generate/';
      const url = `${API_BASE_URL}/api/report${endpoint}${selectedProject}`;
      
      console.log('Fetching report from:', url);
      
      const headers: any = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(url, { headers });

      if (response.ok) {
        const data = await response.json();
        console.log('Report data received:', data);
        // Validate the response data structure
        if (data && typeof data === 'object') {
          setReportData(data);
          setReportType(type);
          console.log('Report generated successfully for real project data');
        } else {
          console.error('Invalid report data received:', data);
          generateDemoReport(type);
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Failed to generate report:', response.status, errorData.error);
        console.log('Falling back to demo report due to API error');
        generateDemoReport(type);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      console.log('Falling back to demo report due to network error');
      // Fallback to demo data
      generateDemoReport(type);
    } finally {
      setGenerating(false);
    }
  };

  const generateDemoReport = (type: 'full' | 'executive' | 'technical' | 'detailed' = 'full') => {
    const demoData: ReportData = {
      executiveSummary: {
        projectOverview: 'Comprehensive LCA analysis of aluminum production comparing linear and circular economy approaches',
        keyFindings: [
          'Circular economy reduces climate change impact by 57%',
          'Smelting stage accounts for 62% of energy consumption',
          'Material recovery achieves 95% energy savings'
        ],
        recommendations: [
          'Prioritize renewable energy for smelting operations',
          'Implement advanced recycling technologies',
          'Optimize process efficiency in high-impact stages'
        ]
      },
      goalAndScope: {
        goal: 'Comparative LCA of aluminum production to quantify environmental benefits',
        functionalUnit: '1 kg aluminum product',
        systemBoundary: 'Cradle-to-gate including mining, refining, smelting, and transportation',
        impactCategories: ['Climate Change', 'Acidification', 'Eutrophication', 'Human Toxicity'],
        cutoffCriteria: '1% mass, 0.5% energy',
        geographicalScope: 'India',
        timeScope: '2024',
        dataQuality: 'Industry average with India-specific factors'
      },
      lifeCycleInventory: {
        dataCollection: 'Industry-average data with regional adjustments',
        stageMetrics: [
          {
            stageNumber: 1,
            stageName: 'Bauxite Mining',
            materialType: 'Aluminum',
            linear: { energyUsage: 1.2, waterUsage: 2.5, wasteGenerated: 3.0, co2Emissions: 0.8 },
            circular: { energyUsage: 0.9, waterUsage: 2.0, wasteGenerated: 1.5, co2Emissions: 0.6 },
            improvement: { energySaving: 25, waterSaving: 20, wasteSaving: 50, co2Saving: 25 }
          },
          {
            stageNumber: 2,
            stageName: 'Alumina Refining',
            materialType: 'Aluminum',
            linear: { energyUsage: 3.5, waterUsage: 8.2, wasteGenerated: 1.5, co2Emissions: 2.1 },
            circular: { energyUsage: 2.8, waterUsage: 6.8, wasteGenerated: 0.8, co2Emissions: 1.7 },
            improvement: { energySaving: 20, waterSaving: 17, wasteSaving: 47, co2Saving: 19 }
          },
          {
            stageNumber: 3,
            stageName: 'Aluminum Smelting',
            materialType: 'Aluminum',
            linear: { energyUsage: 15.8, waterUsage: 1.8, wasteGenerated: 0.5, co2Emissions: 12.0 },
            circular: { energyUsage: 14.2, waterUsage: 1.6, wasteGenerated: 0.3, co2Emissions: 10.8 },
            improvement: { energySaving: 10, waterSaving: 11, wasteSaving: 40, co2Saving: 10 }
          }
        ],
        inventoryFlows: {
          energy: { linear: 20.5, circular: 17.9, unit: 'GJ' },
          water: { linear: 12.5, circular: 10.4, unit: 'm³' },
          materials: { recycled: 25, unit: '%' },
          waste: { linear: 5.0, circular: 2.6, unit: 'kg' }
        }
      },
      lifeCycleImpactAssessment: {
        characterization: {
          linear: {
            climateChange: 12.0,
            acidification: 0.042,
            eutrophication: 0.008,
            energyDemand: 20.5
          },
          circular: {
            climateChange: 5.2,
            acidification: 0.018,
            eutrophication: 0.003,
            energyDemand: 17.9
          }
        },
        normalization: 'EU-25 person equivalents',
        weighting: 'Not applied',
        impactCategories: {
          'Climate Change': 'Global Warming Potential (CO2-eq)',
          'Acidification': 'Acidification Potential (SO2-eq)',
          'Eutrophication': 'Eutrophication Potential (PO4-eq)'
        },
        uncertaintyAnalysis: 'Monte Carlo simulation recommended'
      },
      interpretation: {
        significantFindings: [
          'Smelting stage contributes 62% of climate change impact',
          'Circular economy achieves 57% reduction in overall impact',
          'Energy source transition could reduce impact by additional 40%'
        ],
        limitations: [
          'Analysis based on industry average data',
          'Transportation distances estimated',
          'End-of-life scenarios based on current rates'
        ],
        recommendations: [
          'Prioritize renewable energy for smelting',
          'Implement recycling technologies',
          'Optimize process efficiency'
        ],
        conclusionsAndRecommendations: 'Circular economy demonstrates significant benefits across all categories'
      },
      project: {
        projectId: 'demo-project-001',
        projectName: 'Demo Aluminum LCA Study',
        metalType: 'Aluminum',
        productionRoute: 'Primary',
        region: 'India',
        timestamp: new Date().toISOString(),
        user: 'Demo User'
      },
      scores: {
        sustainability: 75,
        circular: 85,
        linear: 45
      },
      stageMetrics: [
        {
          stageNumber: 1,
          stageName: 'Bauxite Mining',
          materialType: 'Aluminum',
          linear: { energyUsage: 1.2, waterUsage: 2.5, wasteGenerated: 3.0, co2Emissions: 0.8 },
          circular: { energyUsage: 0.9, waterUsage: 2.0, wasteGenerated: 1.5, co2Emissions: 0.6 },
          improvement: { energySaving: 25, waterSaving: 20, wasteSaving: 50, co2Saving: 25 }
        },
        {
          stageNumber: 2,
          stageName: 'Alumina Refining',
          materialType: 'Aluminum',
          linear: { energyUsage: 3.5, waterUsage: 8.2, wasteGenerated: 1.5, co2Emissions: 2.1 },
          circular: { energyUsage: 2.8, waterUsage: 6.8, wasteGenerated: 0.8, co2Emissions: 1.7 },
          improvement: { energySaving: 20, waterSaving: 17, wasteSaving: 47, co2Saving: 19 }
        },
        {
          stageNumber: 3,
          stageName: 'Aluminum Smelting',
          materialType: 'Aluminum',
          linear: { energyUsage: 15.8, waterUsage: 1.8, wasteGenerated: 0.5, co2Emissions: 12.0 },
          circular: { energyUsage: 14.2, waterUsage: 1.6, wasteGenerated: 0.3, co2Emissions: 10.8 },
          improvement: { energySaving: 10, waterSaving: 11, wasteSaving: 40, co2Saving: 10 }
        }
      ],
      totals: {
        linear: {
          energy: 20.5,
          water: 12.5,
          waste: 5.0,
          co2: 14.9
        },
        circular: {
          energy: 17.9,
          water: 10.4,
          waste: 2.6,
          co2: 12.1
        },
        impactTotals: {
          linear: {
            climateChange: 12.0,
            acidification: 0.042,
            eutrophication: 0.008,
            energyDemand: 20.5
          },
          circular: {
            climateChange: 5.2,
            acidification: 0.018,
            eutrophication: 0.003,
            energyDemand: 17.9
          }
        }
      },
      aiInsights: [
        'Stage 3 (Aluminum Smelting) has the highest energy impact. Consider renewable energy sources to reduce impact by 40%.',
        'Implementing circular economy principles could reduce total waste by 48%.',
        'Material substitution in aluminum processing could improve recycling efficiency by 15%.',
        'Transport optimization could reduce CO2 emissions by 25% using rail instead of road transport.'
      ],
      metadata: {
        generatedAt: new Date().toISOString(),
        reportVersion: '2.0-Demo',
        scenarioType: 'Demo LCA Analysis',
        standard: 'ISO 14040:2006',
        softwareVersion: 'LCA Platform v2.0',
        reviewer: 'Demo System',
        dataQualityRating: 'Demo Data'
      }
    };

    setReportData(demoData);
    setReportType(type);
  };

  const downloadPDF = async () => {
    if (!reportData) {
      console.error('No report data available for PDF generation');
      return;
    }

    try {
      // Import jsPDF dynamically
      const { jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas')).default;

      const doc = new jsPDF();
      const element = document.getElementById('report-content');
      
      if (!element) {
        console.error('Report content element not found');
        return;
      }

      // Show loading indicator
      const originalContent = element.innerHTML;
      element.innerHTML = '<div class="flex items-center justify-center h-64"><div class="text-lg">Generating PDF...</div></div>';

      try {
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        });
        
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 210;
        const pageHeight = 295;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        // Add first page
        doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        // Add additional pages if needed
        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          doc.addPage();
          doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        const fileName = `LCA_Report_${(reportData.project?.projectName || reportData.projectName || 'Unknown').replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
      } finally {
        // Restore original content
        element.innerHTML = originalContent;
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const downloadExcel = async () => {
    if (!reportData) {
      console.error('No report data available for Excel generation');
      return;
    }

    try {
      // Import XLSX dynamically
      const XLSX = await import('xlsx');

    // Create workbook with multiple sheets
    const workbook = XLSX.utils.book_new();

    // Project Overview Sheet
    const projectData = [
      ['Project Name', reportData.project?.projectName || reportData.projectName || 'Unknown'],
      ['Project ID', reportData.project?.projectId || 'Unknown'],
      ['Metal Type', reportData.project?.metalType || reportData.metalType || 'Unknown'],
      ['Production Route', reportData.project?.productionRoute || 'Unknown'],
      ['Region', reportData.project?.region || 'Unknown'],
      ['Generated Date', new Date(reportData.metadata?.generatedAt || reportData.generatedAt || Date.now()).toLocaleDateString()],
      [''],
      ['Scores'],
      ['Sustainability Score', `${reportData.scores?.sustainability || reportData.overallSustainabilityScore || 0}%`],
      ['Circular Score', `${reportData.scores?.circular || reportData.keyMetrics?.circularityIndex || 0}%`],
      ['Linear Score', `${reportData.scores?.linear || 0}%`]
    ];

    const projectSheet = XLSX.utils.aoa_to_sheet(projectData);
    XLSX.utils.book_append_sheet(workbook, projectSheet, 'Project Overview');

    // Stage Metrics Sheet
    const stageHeaders = ['Stage', 'Material', 'Linear Energy', 'Circular Energy', 'Linear Water', 'Circular Water', 'Waste Linear', 'Waste Circular', 'CO2 Linear', 'CO2 Circular'];
    const stageData = [
      stageHeaders,
      ...(reportData.stageMetrics || []).map(stage => [
        stage.stageName || 'Unknown',
        stage.materialType || 'Unknown',
        (stage.linear?.energyUsage || 0).toFixed(2),
        (stage.circular?.energyUsage || 0).toFixed(2),
        (stage.linear?.waterUsage || 0).toFixed(2),
        (stage.circular?.waterUsage || 0).toFixed(2),
        (stage.linear?.wasteGenerated || 0).toFixed(2),
        (stage.circular?.wasteGenerated || 0).toFixed(2),
        (stage.linear?.co2Emissions || 0).toFixed(2),
        (stage.circular?.co2Emissions || 0).toFixed(2)
      ])
    ];

    const stageSheet = XLSX.utils.aoa_to_sheet(stageData);
    XLSX.utils.book_append_sheet(workbook, stageSheet, 'Stage Metrics');

    // Totals Comparison Sheet
    const defaultTotals = { linear: { energy: 0, water: 0, waste: 0, co2: 0 }, circular: { energy: 0, water: 0, waste: 0, co2: 0 } };
    const totals = reportData.totals || defaultTotals;
    const totalsData = [
      ['Metric', 'Linear Total', 'Circular Total', 'Improvement', 'Percentage'],
      ['Energy (GJ)', totals.linear.energy.toFixed(2), totals.circular.energy.toFixed(2), (totals.linear.energy - totals.circular.energy).toFixed(2), totals.linear.energy > 0 ? (((totals.linear.energy - totals.circular.energy) / totals.linear.energy) * 100).toFixed(1) + '%' : '0%'],
      ['Water (m³)', totals.linear.water.toFixed(2), totals.circular.water.toFixed(2), (totals.linear.water - totals.circular.water).toFixed(2), totals.linear.water > 0 ? (((totals.linear.water - totals.circular.water) / totals.linear.water) * 100).toFixed(1) + '%' : '0%'],
      ['Waste (kg)', totals.linear.waste.toFixed(2), totals.circular.waste.toFixed(2), (totals.linear.waste - totals.circular.waste).toFixed(2), totals.linear.waste > 0 ? (((totals.linear.waste - totals.circular.waste) / totals.linear.waste) * 100).toFixed(1) + '%' : '0%'],
      ['CO2 (kg)', totals.linear.co2.toFixed(2), totals.circular.co2.toFixed(2), (totals.linear.co2 - totals.circular.co2).toFixed(2), totals.linear.co2 > 0 ? (((totals.linear.co2 - totals.circular.co2) / totals.linear.co2) * 100).toFixed(1) + '%' : '0%']
    ];

    const totalsSheet = XLSX.utils.aoa_to_sheet(totalsData);
    XLSX.utils.book_append_sheet(workbook, totalsSheet, 'Linear vs Circular');

    // AI Insights Sheet
    const insightsData = [
      ['AI-Generated Insights'],
      [''],
      ...(reportData.aiInsights || ['No AI insights available']).map(insight => [insight])
    ];

    const insightsSheet = XLSX.utils.aoa_to_sheet(insightsData);
    XLSX.utils.book_append_sheet(workbook, insightsSheet, 'AI Insights');

      // Save the file
      const fileName = `LCA_Report_${(reportData.project?.projectName || reportData.projectName || 'Unknown').replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
    } catch (error) {
      console.error('Error generating Excel file:', error);
      alert('Failed to generate Excel file. Please try again.');
    }
  };

  // Chart data for visualization (with comprehensive null checks)
  const comparisonChartData = reportData?.totals?.linear && reportData?.totals?.circular ? {
    labels: ['Energy (GJ)', 'Water (m³)', 'Waste (kg)', 'CO₂ (kg)'],
    datasets: [
      {
        label: 'Linear Economy',
        data: [
          Number(reportData.totals.linear.energy) || 0,
          Number(reportData.totals.linear.water) || 0,
          Number(reportData.totals.linear.waste) || 0,
          Number(reportData.totals.linear.co2) || 0
        ],
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 2
      },
      {
        label: 'Circular Economy',
        data: [
          Number(reportData.totals.circular.energy) || 0,
          Number(reportData.totals.circular.water) || 0,
          Number(reportData.totals.circular.waste) || 0,
          Number(reportData.totals.circular.co2) || 0
        ],
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 2
      }
    ]
  } : null;

  const stagesChartData = reportData?.stageMetrics && Array.isArray(reportData.stageMetrics) && reportData.stageMetrics.length > 0 ? {
    labels: reportData.stageMetrics.map((stage, index) => {
      if (!stage) return `Stage ${index + 1}`;
      return stage.stageName || `Stage ${stage.stageNumber || index + 1}`;
    }),
    datasets: [
      {
        label: 'Linear Energy Usage',
        data: reportData.stageMetrics.map(stage => {
          if (!stage || !stage.linear) return 0;
          return Number(stage.linear.energyUsage) || 0;
        }),
        backgroundColor: 'rgba(239, 68, 68, 0.6)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1
      },
      {
        label: 'Circular Energy Usage',
        data: reportData.stageMetrics.map(stage => {
          if (!stage || !stage.circular) return 0;
          return Number(stage.circular.energyUsage) || 0;
        }),
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

      {/* File Upload Section */}
      <FileUploadProcessor 
        onDataProcessed={(data, fileName) => {
          console.log('Data processed:', data, 'from file:', fileName);
        }}
        onReportGenerated={(reportData) => {
          setReportData(reportData);
          setReportType('full');
          console.log('Report generated from uploaded data');
        }}
      />

      {/* Project Selection and Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              <option value="">Select a project or view demo</option>
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
              onChange={(e) => setReportType(e.target.value as 'full' | 'executive' | 'technical' | 'detailed')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="full">Full LCA Report</option>
              <option value="detailed">Detailed 6-Page Report</option>
              <option value="executive">Executive Summary</option>
              <option value="technical">Technical Report</option>
            </select>
          </div>
        </div>
        
        {/* Generate Report Actions */}
        <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={() => generateReport(reportType)}
            disabled={generating}
            className="flex items-center px-4 py-2 bg-green-600 text-white font-medium text-sm rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {generating ? (
              <Loader className="animate-spin h-4 w-4 mr-2" />
            ) : (
              <BarChart3 className="h-4 w-4 mr-2" />
            )}
            {generating ? 'Generating...' : 'Generate Report'}
          </button>
          
          {!selectedProject && projects.length === 0 && (
            <button
              onClick={() => generateDemoReport('full')}
              className="flex items-center px-4 py-2 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Demo Report
            </button>
          )}
          
          <button
            onClick={() => {
              setReportData(null);
              if (selectedProject) {
                generateReport(reportType);
              } else {
                fetchProjects();
              }
            }}
            className="flex items-center px-4 py-2 bg-gray-600 text-white font-medium text-sm rounded-lg hover:bg-gray-700 transition-colors"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Refresh Data
          </button>
          
          {projects.length === 0 && (
            <button
              onClick={createTestData}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-purple-600 text-white font-medium text-sm rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <Loader className="animate-spin h-4 w-4 mr-2" />
              ) : (
                <BarChart3 className="h-4 w-4 mr-2" />
              )}
              Create Test Project
            </button>
          )}
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
              
              <button
                onClick={() => setIsDetailedReportOpen(true)}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white font-medium text-sm rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                6-Page Report
              </button>
            </div>
          </div>

          {/* Report Preview */}
          <div id="report-content" className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {reportData ? (
              <div className="p-8">
                {/* Report Header */}
                <div className="border-b border-gray-200 pb-6 mb-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Life Cycle Assessment Report
                      </h1>
                      <p className="text-lg text-gray-700 font-medium">
                        {reportData.project?.projectName || reportData.projectName || 'Demo Aluminum LCA Study'}
                      </p>
                    </div>
                    <div className="text-right text-sm text-gray-600">
                      <div>Generated: {new Date(reportData.metadata?.generatedAt || reportData.generatedAt || Date.now()).toLocaleDateString()}</div>
                      <div>Version: {reportData.metadata?.reportVersion || '2.0-Demo'}</div>
                      <div>Standard: {reportData.metadata?.standard || 'ISO 14040:2006'}</div>
                      <div>Metal Type: {reportData.project?.metalType || reportData.metalType || 'Aluminum'}</div>
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
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Overview</h2>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-700 mb-1">Metal Type</h3>
                      <p className="text-lg font-semibold text-gray-900">{reportData.project?.metalType || reportData.metalType || 'Aluminum'}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-700 mb-1">Production Route</h3>
                      <p className="text-lg font-semibold text-gray-900">{reportData.project?.productionRoute || 'Primary'}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-700 mb-1">Region</h3>
                      <p className="text-lg font-semibold text-gray-900">{reportData.project?.region || 'India'}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-700 mb-1">Analysis Type</h3>
                      <p className="text-lg font-semibold text-gray-900">Executive Summary LCA</p>
                    </div>
                  </div>
                </div>

                {/* Sustainability Scores */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Sustainability Scores</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600 mb-2">
                          {reportData.scores?.sustainability || reportData.overallSustainabilityScore || 75}%
                        </div>
                        <div className="text-sm font-medium text-green-700">Overall Sustainability</div>
                      </div>
                    </div>
                    <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-2">
                          {reportData.scores?.circular || reportData.keyMetrics?.circularityIndex || 85}%
                        </div>
                        <div className="text-sm font-medium text-blue-700">Circular Economy</div>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-600 mb-2">
                          {reportData.scores?.linear || 45}%
                        </div>
                        <div className="text-sm font-medium text-gray-700">Linear Economy</div>
                      </div>
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
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Linear Total</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Circular Total</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Improvement</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Percentage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-3 font-medium text-gray-900">Energy (GJ)</td>
                      <td className="px-4 py-3 text-center">{(reportData.totals?.linear?.energy || 20.5).toFixed(2)}</td>
                      <td className="px-4 py-3 text-center">{(reportData.totals?.circular?.energy || 17.9).toFixed(2)}</td>
                      <td className="px-4 py-3 text-center text-green-600 font-medium">
                        {((reportData.totals?.linear?.energy || 20.5) - (reportData.totals?.circular?.energy || 17.9)).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {(((reportData.totals?.linear?.energy || 20.5) - (reportData.totals?.circular?.energy || 17.9)) / (reportData.totals?.linear?.energy || 20.5) * 100).toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-gray-900">Water (m³)</td>
                      <td className="px-4 py-3 text-center">{(reportData.totals?.linear?.water || 12.5).toFixed(2)}</td>
                      <td className="px-4 py-3 text-center">{(reportData.totals?.circular?.water || 10.4).toFixed(2)}</td>
                      <td className="px-4 py-3 text-center text-blue-600 font-medium">
                        {((reportData.totals?.linear?.water || 12.5) - (reportData.totals?.circular?.water || 10.4)).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {(((reportData.totals?.linear?.water || 12.5) - (reportData.totals?.circular?.water || 10.4)) / (reportData.totals?.linear?.water || 12.5) * 100).toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-gray-900">CO₂ (kg)</td>
                      <td className="px-4 py-3 text-center">{(reportData.totals?.linear?.co2 || 14.9).toFixed(2)}</td>
                      <td className="px-4 py-3 text-center">{(reportData.totals?.circular?.co2 || 12.1).toFixed(2)}</td>
                      <td className="px-4 py-3 text-center text-green-600 font-medium">
                        {((reportData.totals?.linear?.co2 || 14.9) - (reportData.totals?.circular?.co2 || 12.1)).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {(((reportData.totals?.linear?.co2 || 14.9) - (reportData.totals?.circular?.co2 || 12.1)) / (reportData.totals?.linear?.co2 || 14.9) * 100).toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Charts */}
              {comparisonChartData && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Linear vs Circular Comparison</h3>
                    <div className="h-80">
                      <Bar data={comparisonChartData} options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'top' as const,
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                          },
                        },
                      }} />
                    </div>
                  </div>
                  
                  {stagesChartData && (
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Stage-wise Energy Usage</h3>
                      <div className="h-80">
                        <Bar data={stagesChartData} options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'top' as const,
                            },
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                            },
                          },
                        }} />
                      </div>
                    </div>
                  )}
                </div>
              )}

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
                {reportData.aiInsights?.map((insight, index) => (
                  <div key={index} className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                    <p className="text-blue-800">{insight}</p>
                  </div>
                )) || (
                  <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
                    No AI insights available for this report
                  </div>
                )}
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
                    {reportData?.stageMetrics?.map((stage, index) => (
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
                This report was generated by the LCA Platform on {new Date(reportData.metadata?.generatedAt || reportData.generatedAt || Date.now()).toLocaleDateString()}
              </p>
              <p>Report Version: {reportData.metadata?.reportVersion || 'N/A'} | Analysis Type: {reportData.metadata?.scenarioType || 'Standard LCA'}</p>
            </div>
          </div>
            ) : (
              <div className="p-12 text-center">
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Report Generated</h3>
                <p className="text-gray-600 mb-6">
                  Select a project and click "Generate Report" to view comprehensive LCA analysis, or try our demo report.
                </p>
                <button 
                  onClick={() => generateDemoReport('full')}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <BarChart3 className="h-5 w-5 mr-2" />
                  View Demo Report
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* No Projects State */}
      {projects.length === 0 && !loading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Projects Available</h3>
          <p className="text-gray-600 mb-6">
            Create and submit your first project to generate comprehensive LCA reports, or try our demo report.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => generateDemoReport('full')}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              <BarChart3 className="h-5 w-5 mr-2" />
              View Demo Report
            </button>
            <a href="/submit" className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium text-sm rounded-lg hover:bg-green-700 transition-colors">
              <BarChart3 className="h-5 w-5 mr-2" />
              Submit Your First Project
            </a>
          </div>
        </div>
      )}
      
      {/* AI Chatbot Integration - Always available */}
      <AIChatbot
        projectId={selectedProject || ''}
        projectName={reportData?.project?.projectName || reportData?.projectName || 'Unknown Project'}
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
        reportData={reportData}
      />
      
      {/* Comprehensive Report Modal */}
      {isComprehensiveReportOpen && (
        <ComprehensiveReport
          projectId={selectedProject || 'demo-project-001'}
          onClose={() => setIsComprehensiveReportOpen(false)}
        />
      )}
      
      {/* Detailed 6-Page Report Modal */}
      {isDetailedReportOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Detailed LCA Report (6 Pages)</h2>
              <button
                onClick={() => setIsDetailedReportOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="sr-only">Close</span>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="h-full overflow-auto">
              <DetailedReport 
                reportData={reportData} 
                onExport={(format) => {
                  if (format === 'pdf') downloadPDF();
                  if (format === 'excel') downloadExcel();
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;