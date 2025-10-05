import React, { useState } from 'react';
import { 
  BarChart3, 
  Loader,
  Eye,
  RefreshCw,
  Database
} from 'lucide-react';

interface Project {
  projectId: string;
  projectName: string;
  sustainabilityScore: number;
  circularScore: number;
  linearScore: number;
  timestamp: string;
}

interface ReportGenerationProps {
  projects: Project[];
  selectedProject: string;
  reportType: 'full' | 'executive' | 'technical' | 'detailed';
  generating: boolean;
  onProjectChange: (projectId: string) => void;
  onReportTypeChange: (type: 'full' | 'executive' | 'technical' | 'detailed') => void;
  onGenerateReport: (type: 'full' | 'executive' | 'technical' | 'detailed') => void;
  onGenerateDemoReport: () => void;
  onRefreshData: () => void;
  onCreateTestData: () => void;
  loading: boolean;
}

const ReportGeneration: React.FC<ReportGenerationProps> = ({
  projects,
  selectedProject,
  reportType,
  generating,
  onProjectChange,
  onReportTypeChange,
  onGenerateReport,
  onGenerateDemoReport,
  onRefreshData,
  onCreateTestData,
  loading
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Project for Report Generation
          </label>
          <select
            value={selectedProject}
            onChange={(e) => onProjectChange(e.target.value)}
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
            onChange={(e) => onReportTypeChange(e.target.value as 'full' | 'executive' | 'technical' | 'detailed')}
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
          onClick={() => onGenerateReport(reportType)}
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
            onClick={onGenerateDemoReport}
            className="flex items-center px-4 py-2 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Demo Report
          </button>
        )}
        
        <button
          onClick={onRefreshData}
          className="flex items-center px-4 py-2 bg-gray-600 text-white font-medium text-sm rounded-lg hover:bg-gray-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </button>
        
        {projects.length === 0 && (
          <button
            onClick={onCreateTestData}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-purple-600 text-white font-medium text-sm rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <Loader className="animate-spin h-4 w-4 mr-2" />
            ) : (
              <Database className="h-4 w-4 mr-2" />
            )}
            Create Test Project
          </button>
        )}
      </div>
      
      {/* Project Statistics */}
      {projects.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{projects.length}</p>
              <p className="text-gray-600">Total Projects</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {Math.round(projects.reduce((sum, p) => sum + p.sustainabilityScore, 0) / projects.length) || 0}%
              </p>
              <p className="text-gray-600">Avg Sustainability</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {Math.max(...projects.map(p => p.circularScore)) || 0}%
              </p>
              <p className="text-gray-600">Best Circular Score</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {projects.filter(p => p.sustainabilityScore >= 70).length}
              </p>
              <p className="text-gray-600">High Performance</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportGeneration;