import React from 'react';

interface ProjectOverviewProps {
  project: {
    metalType?: string;
    productionRoute?: string;
    region?: string;
  };
  metadata: {
    scenarioType?: string;
  };
}

const ProjectOverview: React.FC<ProjectOverviewProps> = ({ project, metadata }) => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Metal Type</div>
          <div className="font-medium text-gray-900">{project?.metalType || 'Unknown'}</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Production Route</div>
          <div className="font-medium text-gray-900">{project?.productionRoute || 'Unknown'}</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Region</div>
          <div className="font-medium text-gray-900">{project?.region || 'Unknown'}</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Analysis Type</div>
          <div className="font-medium text-gray-900">{metadata?.scenarioType || 'Unknown'}</div>
        </div>
      </div>
    </div>
  );
};

export default ProjectOverview;