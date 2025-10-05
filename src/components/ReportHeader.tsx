import React from 'react';

interface ReportHeaderProps {
  project: {
    projectName?: string;
    user?: string;
  };
  metadata: {
    generatedAt?: string;
    reportVersion?: string;
    standard?: string;
  };
}

const ReportHeader: React.FC<ReportHeaderProps> = ({ project, metadata }) => {
  return (
    <div className="border-b border-gray-200 pb-6 mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Life Cycle Assessment Report
          </h1>
          <p className="text-lg text-gray-700 font-medium">
            {project?.projectName || 'Unknown Project'}
          </p>
        </div>
        <div className="text-right text-sm text-gray-600">
          <div>Generated: {new Date(metadata?.generatedAt || Date.now()).toLocaleDateString()}</div>
          <div>Version: {metadata?.reportVersion || 'Unknown'}</div>
          <div>Standard: {metadata?.standard || 'Legacy Format'}</div>
          <div>User: {project?.user || 'Unknown User'}</div>
        </div>
      </div>
    </div>
  );
};

export default ReportHeader;