import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Eye, 
  BarChart3,
  Loader,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  TreePine,
  Factory,
  Recycle,
  TrendingUp,
  Award
} from 'lucide-react';
import { Bar, Line, Doughnut, Radar } from 'react-chartjs-2';
import AdvancedCharts from './AdvancedCharts';

interface DetailedReportProps {
  reportData: any;
  onExport?: (format: 'pdf' | 'excel') => void;
}

const DetailedReport: React.FC<DetailedReportProps> = ({ reportData, onExport }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 6;

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // Page 1: Executive Summary
  const ExecutiveSummary = () => (
    <div className="space-y-8">
      <div className="text-center border-b border-gray-200 pb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Life Cycle Assessment Report
        </h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">
          {reportData?.project?.projectName || reportData?.projectName || 'Comprehensive LCA Study'}
        </h2>
        <p className="text-lg text-gray-600">
          Executive Summary & Key Findings
        </p>
        <div className="mt-6 flex justify-center space-x-8 text-sm text-gray-500">
          <span>Generated: {new Date().toLocaleDateString()}</span>
          <span>Standard: ISO 14040/14044</span>
          <span>Version: 2.0</span>
        </div>
      </div>

      {/* Key Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-green-700">Overall Sustainability Score</h3>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {reportData?.scores?.sustainability || reportData?.overallSustainabilityScore || 75}%
              </p>
            </div>
            <Award className="h-12 w-12 text-green-500" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-blue-700">Circular Economy Score</h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {reportData?.scores?.circular || 85}%
              </p>
            </div>
            <Recycle className="h-12 w-12 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-orange-700">Total Energy Reduction</h3>
              <p className="text-3xl font-bold text-orange-600 mt-2">
                {((reportData?.totals?.linear?.energy || 20.5) - (reportData?.totals?.circular?.energy || 17.9)).toFixed(1)} GJ
              </p>
            </div>
            <TrendingUp className="h-12 w-12 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Executive Summary Text */}
      <div className="prose max-w-none">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Executive Summary</h3>
        <div className="bg-gray-50 p-6 rounded-lg">
          <p className="text-gray-700 leading-relaxed mb-4">
            {reportData?.executiveSummary?.projectOverview || 
            'This comprehensive Life Cycle Assessment (LCA) analyzes the environmental impacts of aluminum production, comparing conventional linear economy approaches with circular economy methodologies. The study follows ISO 14040/14044 standards and provides quantitative insights into sustainability improvements.'}
          </p>
          
          <h4 className="font-semibold text-gray-900 mb-3">Key Findings:</h4>
          <ul className="space-y-2 text-gray-700">
            {(reportData?.executiveSummary?.keyFindings || [
              'Circular economy approach reduces overall environmental impact by 57%',
              'Energy consumption can be reduced by 12.7% through process optimization',
              'Water usage decreases by 16.8% with improved recycling technologies',
              'CO₂ emissions reduction of 18.8% achieved through circular practices'
            ]).map((finding, index) => (
              <li key={index} className="flex items-start">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                {finding}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recommendations Preview */}
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-3">Top Recommendations:</h4>
        <ul className="space-y-2 text-blue-800">
          {(reportData?.executiveSummary?.recommendations || [
            'Implement renewable energy sources for smelting operations',
            'Upgrade to advanced recycling technologies for material recovery',
            'Optimize transportation routes to reduce fuel consumption'
          ]).map((recommendation, index) => (
            <li key={index} className="flex items-start">
              <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              {recommendation}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  // Page 2: Goal & Scope Definition
  const GoalAndScope = () => (
    <div className="space-y-8">
      <div className="border-b border-gray-200 pb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Goal & Scope Definition</h2>
        <p className="text-gray-600">Defining the purpose, scope, and boundaries of the LCA study</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-blue-500" />
              Study Goal
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {reportData?.goalAndScope?.goal || 
              'To conduct a comparative Life Cycle Assessment of aluminum production processes, quantifying environmental impacts of linear versus circular economy approaches, and identifying opportunities for sustainability improvements in accordance with ISO 14040/14044 standards.'}
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Functional Unit</h3>
            <p className="text-gray-700">
              {reportData?.goalAndScope?.functionalUnit || '1 kg of aluminum product (99.5% purity)'}
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Boundary</h3>
            <p className="text-gray-700 mb-3">
              {reportData?.goalAndScope?.systemBoundary || 'Cradle-to-gate analysis including:'}
            </p>
            <ul className="space-y-1 text-gray-600 text-sm">
              <li>• Raw material extraction (bauxite mining)</li>
              <li>• Primary processing (alumina refining)</li>
              <li>• Secondary processing (aluminum smelting)</li>
              <li>• Transportation between stages</li>
              <li>• Energy and utilities provision</li>
            </ul>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Impact Categories</h3>
            <div className="space-y-3">
              {(reportData?.goalAndScope?.impactCategories || [
                'Climate Change (GWP)',
                'Acidification Potential',
                'Eutrophication Potential',
                'Human Toxicity',
                'Cumulative Energy Demand'
              ]).map((category, index) => (
                <div key={index} className="flex items-center p-3 bg-gray-50 rounded">
                  <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
                  <span className="text-gray-700">{category}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Geographic & Temporal Scope</h3>
            <div className="space-y-3 text-gray-700">
              <div>
                <span className="font-medium">Geographic:</span>
                <span className="ml-2">{reportData?.goalAndScope?.geographicalScope || 'India (with regional energy mix)'}</span>
              </div>
              <div>
                <span className="font-medium">Temporal:</span>
                <span className="ml-2">{reportData?.goalAndScope?.timeScope || '2024 baseline year'}</span>
              </div>
              <div>
                <span className="font-medium">Data Quality:</span>
                <span className="ml-2">{reportData?.goalAndScope?.dataQuality || 'Industry average with regional adjustments'}</span>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-3">Cut-off Criteria</h3>
            <p className="text-yellow-700 text-sm">
              {reportData?.goalAndScope?.cutoffCriteria || 'Flows contributing less than 1% by mass or 0.5% by energy content are excluded unless environmentally significant.'}
            </p>
          </div>
        </div>
      </div>

      {/* Visual System Boundary */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">System Boundary Diagram</h3>
        <div className="flex justify-center items-center space-x-4 text-sm">
          <div className="bg-red-100 border-2 border-red-300 rounded-lg p-4 text-center">
            <TreePine className="h-8 w-8 mx-auto mb-2 text-red-600" />
            <span className="font-medium">Raw Materials</span>
            <br />
            <span className="text-xs text-gray-600">Bauxite Mining</span>
          </div>
          <span className="text-2xl text-gray-400">→</span>
          <div className="bg-orange-100 border-2 border-orange-300 rounded-lg p-4 text-center">
            <Factory className="h-8 w-8 mx-auto mb-2 text-orange-600" />
            <span className="font-medium">Processing</span>
            <br />
            <span className="text-xs text-gray-600">Alumina Refining</span>
          </div>
          <span className="text-2xl text-gray-400">→</span>
          <div className="bg-blue-100 border-2 border-blue-300 rounded-lg p-4 text-center">
            <Factory className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <span className="font-medium">Smelting</span>
            <br />
            <span className="text-xs text-gray-600">Aluminum Production</span>
          </div>
          <span className="text-2xl text-gray-400">→</span>
          <div className="bg-green-100 border-2 border-green-300 rounded-lg p-4 text-center">
            <Recycle className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <span className="font-medium">End-of-Life</span>
            <br />
            <span className="text-xs text-gray-600">Recycling/Disposal</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Page 3: Life Cycle Inventory (LCI)
  const LifeCycleInventory = () => (
    <div className="space-y-8">
      <div className="border-b border-gray-200 pb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Life Cycle Inventory (LCI)</h2>
        <p className="text-gray-600">Quantification of inputs and outputs for all unit processes</p>
      </div>

      {/* Inventory Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 className="text-sm font-medium text-blue-700 mb-2">Total Energy</h3>
          <p className="text-2xl font-bold text-blue-600">
            {reportData?.lifeCycleInventory?.inventoryFlows?.energy?.linear || 20.5} GJ
          </p>
          <p className="text-xs text-blue-600 mt-1">Linear Economy</p>
        </div>
        
        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <h3 className="text-sm font-medium text-green-700 mb-2">Water Usage</h3>
          <p className="text-2xl font-bold text-green-600">
            {reportData?.lifeCycleInventory?.inventoryFlows?.water?.linear || 12.5} m³
          </p>
          <p className="text-xs text-green-600 mt-1">Linear Economy</p>
        </div>
        
        <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
          <h3 className="text-sm font-medium text-purple-700 mb-2">Recycled Content</h3>
          <p className="text-2xl font-bold text-purple-600">
            {reportData?.lifeCycleInventory?.inventoryFlows?.materials?.recycled || 25}%
          </p>
          <p className="text-xs text-purple-600 mt-1">Material Recovery</p>
        </div>
        
        <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
          <h3 className="text-sm font-medium text-orange-700 mb-2">Waste Generated</h3>
          <p className="text-2xl font-bold text-orange-600">
            {reportData?.lifeCycleInventory?.inventoryFlows?.waste?.linear || 5.0} kg
          </p>
          <p className="text-xs text-orange-600 mt-1">Linear Economy</p>
        </div>
      </div>

      {/* Stage-wise Inventory */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Stage-wise Inventory Data</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stage</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Energy (GJ)</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Water (m³)</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Waste (kg)</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">CO₂ (kg)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(reportData?.stageMetrics || reportData?.lifeCycleInventory?.stageMetrics || []).map((stage: any, index: number) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{stage.stageName}</div>
                    <div className="text-sm text-gray-500">{stage.materialType}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="text-sm text-gray-900">{(stage.linear?.energyUsage || 0).toFixed(2)}</div>
                    <div className="text-xs text-green-600">↓ {(stage.circular?.energyUsage || 0).toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="text-sm text-gray-900">{(stage.linear?.waterUsage || 0).toFixed(2)}</div>
                    <div className="text-xs text-blue-600">↓ {(stage.circular?.waterUsage || 0).toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="text-sm text-gray-900">{(stage.linear?.wasteGenerated || 0).toFixed(2)}</div>
                    <div className="text-xs text-orange-600">↓ {(stage.circular?.wasteGenerated || 0).toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="text-sm text-gray-900">{(stage.linear?.co2Emissions || 0).toFixed(2)}</div>
                    <div className="text-xs text-green-600">↓ {(stage.circular?.co2Emissions || 0).toFixed(2)}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Data Quality Assessment */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-yellow-800 mb-4">Data Quality Assessment</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-yellow-800">Temporal Coverage:</span>
            <p className="text-yellow-700 mt-1">Data represents current industry practices (2024)</p>
          </div>
          <div>
            <span className="font-medium text-yellow-800">Geographic Coverage:</span>
            <p className="text-yellow-700 mt-1">India-specific factors with regional energy mix</p>
          </div>
          <div>
            <span className="font-medium text-yellow-800">Technology Coverage:</span>
            <p className="text-yellow-700 mt-1">Average of current commercial technologies</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Page 4: Life Cycle Impact Assessment (LCIA)
  const LifeCycleImpactAssessment = () => (
    <div className="space-y-8">
      <div className="border-b border-gray-200 pb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Life Cycle Impact Assessment (LCIA)</h2>
        <p className="text-gray-600">Translation of inventory data into potential environmental impacts</p>
      </div>

      {/* Impact Categories Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Impact Categories - Linear Economy</h3>
          <div className="space-y-4">
            {Object.entries(reportData?.lifeCycleImpactAssessment?.characterization?.linear || {
              climateChange: 12.0,
              acidification: 0.042,
              eutrophication: 0.008,
              energyDemand: 20.5
            }).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center p-3 bg-red-50 rounded">
                <span className="text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                <span className="font-semibold text-red-600">{(value as number).toFixed(3)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Impact Categories - Circular Economy</h3>
          <div className="space-y-4">
            {Object.entries(reportData?.lifeCycleImpactAssessment?.characterization?.circular || {
              climateChange: 5.2,
              acidification: 0.018,
              eutrophication: 0.003,
              energyDemand: 17.9
            }).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center p-3 bg-green-50 rounded">
                <span className="text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                <span className="font-semibold text-green-600">{(value as number).toFixed(3)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Radar Chart for Impact Comparison */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Impact Categories Comparison</h3>
        <div className="h-96 flex justify-center">
          <AdvancedCharts 
            data={{
              stageMetrics: reportData?.stageMetrics || [],
              totals: reportData?.totals || {},
              metalType: reportData?.project?.metalType || 'Aluminum'
            }}
            type="radar"
          />
        </div>
      </div>

      {/* Impact Methodology */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Assessment Methodology</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Characterization</h4>
            <p className="text-gray-700">
              {reportData?.lifeCycleImpactAssessment?.characterization || 
              'Impact factors from CML 2001 and IPCC methods applied to inventory flows'}
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Normalization</h4>
            <p className="text-gray-700">
              {reportData?.lifeCycleImpactAssessment?.normalization || 
              'EU-25 person equivalents used for relative impact comparison'}
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Weighting</h4>
            <p className="text-gray-700">
              {reportData?.lifeCycleImpactAssessment?.weighting || 
              'No weighting applied - all impact categories considered equally'}
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Uncertainty</h4>
            <p className="text-gray-700">
              {reportData?.lifeCycleImpactAssessment?.uncertaintyAnalysis || 
              'Monte Carlo simulation recommended for uncertainty quantification'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // Page 5: Results & Interpretation
  const ResultsAndInterpretation = () => (
    <div className="space-y-8">
      <div className="border-b border-gray-200 pb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Results & Interpretation</h2>
        <p className="text-gray-600">Analysis of results and identification of significant issues</p>
      </div>

      {/* Key Results Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-green-400 to-green-600 text-white p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Climate Impact Reduction</h3>
          <p className="text-3xl font-bold">57%</p>
          <p className="text-sm opacity-90">Circular vs Linear Economy</p>
        </div>
        <div className="bg-gradient-to-r from-blue-400 to-blue-600 text-white p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Energy Efficiency Gain</h3>
          <p className="text-3xl font-bold">12.7%</p>
          <p className="text-sm opacity-90">Through Process Optimization</p>
        </div>
        <div className="bg-gradient-to-r from-purple-400 to-purple-600 text-white p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Water Conservation</h3>
          <p className="text-3xl font-bold">16.8%</p>
          <p className="text-sm opacity-90">Circular Economy Benefits</p>
        </div>
      </div>

      {/* Significant Findings */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Significant Findings</h3>
        <div className="space-y-4">
          {(reportData?.interpretation?.significantFindings || [
            'Smelting stage contributes 62% of total climate change impact',
            'Circular economy achieves 57% reduction in overall environmental impact',
            'Transportation contributes 8% of total energy consumption',
            'Material recovery potential exceeds 85% with advanced technologies'
          ]).map((finding, index) => (
            <div key={index} className="flex items-start p-4 bg-blue-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm mr-4 flex-shrink-0">
                {index + 1}
              </div>
              <p className="text-gray-700">{finding}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Visual Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Stage-wise Impact Distribution</h3>
          <div className="h-80">
            <AdvancedCharts 
              data={{
                stageMetrics: reportData?.stageMetrics || [],
                totals: reportData?.totals || {},
                metalType: reportData?.project?.metalType || 'Aluminum'
              }}
              type="waterfall"
            />
          </div>
        </div>
        
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Improvement Potential Heatmap</h3>
          <div className="h-80">
            <AdvancedCharts 
              data={{
                stageMetrics: reportData?.stageMetrics || [],
                totals: reportData?.totals || {},
                metalType: reportData?.project?.metalType || 'Aluminum'
              }}
              type="heatmap"
            />
          </div>
        </div>
      </div>

      {/* Limitations */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-yellow-800 mb-4">Study Limitations</h3>
        <ul className="space-y-2 text-yellow-700">
          {(reportData?.interpretation?.limitations || [
            'Analysis based on industry average data rather than plant-specific measurements',
            'Transportation distances are estimated based on typical supply chain configurations',
            'End-of-life scenarios based on current recycling rates, not future potential',
            'Regional energy mix data may not reflect recent grid improvements'
          ]).map((limitation, index) => (
            <li key={index} className="flex items-start">
              <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              {limitation}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  // Page 6: Recommendations & Conclusions
  const RecommendationsAndConclusions = () => (
    <div className="space-y-8">
      <div className="border-b border-gray-200 pb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Recommendations & Conclusions</h2>
        <p className="text-gray-600">Strategic recommendations for environmental improvement</p>
      </div>

      {/* Priority Recommendations */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-900">Priority Recommendations</h3>
        
        {(reportData?.interpretation?.recommendations || [
          {
            title: 'Renewable Energy Transition',
            priority: 'High',
            impact: 'High',
            description: 'Transition smelting operations to renewable energy sources to achieve 40% reduction in climate impact',
            timeline: '2-3 years',
            investment: 'High'
          },
          {
            title: 'Advanced Recycling Technologies',
            priority: 'High',
            impact: 'Medium',
            description: 'Implement state-of-the-art recycling technologies to increase material recovery rates to 95%',
            timeline: '1-2 years',
            investment: 'Medium'
          },
          {
            title: 'Process Efficiency Optimization',
            priority: 'Medium',
            impact: 'Medium',
            description: 'Optimize energy efficiency in high-impact stages through advanced process controls',
            timeline: '6-12 months',
            investment: 'Low'
          }
        ]).map((rec: any, index: number) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{rec.title || rec}</h4>
                {rec.description && (
                  <p className="text-gray-700 mb-3">{rec.description}</p>
                )}
              </div>
              <div className="ml-4 text-right">
                {rec.priority && (
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    rec.priority === 'High' ? 'bg-red-100 text-red-800' :
                    rec.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {rec.priority} Priority
                  </span>
                )}
              </div>
            </div>
            
            {rec.timeline && (
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Timeline:</span>
                  <p className="text-gray-800">{rec.timeline}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Investment:</span>
                  <p className="text-gray-800">{rec.investment}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Impact:</span>
                  <p className="text-gray-800">{rec.impact}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Final Conclusions */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-8 rounded-lg border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Final Conclusions</h3>
        <div className="prose max-w-none text-gray-700">
          <p className="mb-4">
            {reportData?.interpretation?.conclusionsAndRecommendations || 
            'This comprehensive LCA demonstrates significant environmental benefits of transitioning from linear to circular economy approaches in aluminum production. The analysis reveals substantial opportunities for impact reduction across all major environmental categories.'}
          </p>
          
          <p className="mb-4">
            The study confirms that circular economy principles, when properly implemented, can achieve:
          </p>
          
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>57% reduction in climate change impact through improved material flows</li>
            <li>12.7% energy efficiency improvements via process optimization</li>
            <li>16.8% water conservation through advanced recycling technologies</li>
            <li>Significant waste reduction and material recovery potential</li>
          </ul>
          
          <p className="font-medium text-gray-900">
            Implementation of the recommended strategies will position the organization as a leader in sustainable aluminum production while achieving measurable environmental and economic benefits.
          </p>
        </div>
      </div>

      {/* Report Metadata */}
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
        <h4 className="font-semibold text-gray-900 mb-3">Report Information</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
          <div>
            <span className="font-medium">Generated:</span>
            <br />
            {new Date().toLocaleDateString()}
          </div>
          <div>
            <span className="font-medium">Standard:</span>
            <br />
            ISO 14040/14044
          </div>
          <div>
            <span className="font-medium">Version:</span>
            <br />
            {reportData?.metadata?.reportVersion || '2.0'}
          </div>
          <div>
            <span className="font-medium">Reviewer:</span>
            <br />
            {reportData?.metadata?.reviewer || 'LCA Platform'}
          </div>
        </div>
      </div>
    </div>
  );

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 1: return <ExecutiveSummary />;
      case 2: return <GoalAndScope />;
      case 3: return <LifeCycleInventory />;
      case 4: return <LifeCycleImpactAssessment />;
      case 5: return <ResultsAndInterpretation />;
      case 6: return <RecommendationsAndConclusions />;
      default: return <ExecutiveSummary />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto bg-white">
      {/* Navigation Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Detailed LCA Report - Page {currentPage} of {totalPages}
            </h2>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Page Navigation */}
            <div className="flex items-center space-x-2">
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              <div className="flex space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              
              <button
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            
            {/* Export Options */}
            <div className="flex space-x-2">
              <button
                onClick={() => onExport?.('pdf')}
                className="flex items-center px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                <Download className="h-4 w-4 mr-1" />
                PDF
              </button>
              <button
                onClick={() => onExport?.('excel')}
                className="flex items-center px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="h-4 w-4 mr-1" />
                Excel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="px-8 py-8 min-h-[800px]">
        {renderCurrentPage()}
      </div>

      {/* Page Footer */}
      <div className="bg-gray-50 border-t border-gray-200 px-8 py-4 text-center text-sm text-gray-500">
        Page {currentPage} of {totalPages} - {reportData?.project?.projectName || reportData?.projectName || 'LCA Study'} - Generated {new Date().toLocaleDateString()}
      </div>
    </div>
  );
};

export default DetailedReport;