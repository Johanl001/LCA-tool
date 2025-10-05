import React from 'react';
import { 
  ChevronRight, 
  CheckCircle, 
  AlertTriangle, 
  Info,
  Target,
  Database,
  BarChart3,
  TrendingUp,
  FileText
} from 'lucide-react';

interface ISOSection {
  title: string;
  content: any;
  icon: React.ReactNode;
  required: boolean;
}

interface ISOReportSectionProps {
  reportData: any;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const ISOReportSection: React.FC<ISOReportSectionProps> = ({ 
  reportData, 
  activeSection, 
  onSectionChange 
}) => {
  
  const isoSections: ISOSection[] = [
    {
      title: 'Executive Summary',
      content: reportData.executiveSummary,
      icon: <FileText className="h-5 w-5" />,
      required: false
    },
    {
      title: 'Goal & Scope',
      content: reportData.goalAndScope,
      icon: <Target className="h-5 w-5" />,
      required: true
    },
    {
      title: 'Life Cycle Inventory (LCI)',
      content: reportData.lifeCycleInventory,
      icon: <Database className="h-5 w-5" />,
      required: true
    },
    {
      title: 'Life Cycle Impact Assessment (LCIA)',
      content: reportData.lifeCycleImpactAssessment,
      icon: <BarChart3 className="h-5 w-5" />,
      required: true
    },
    {
      title: 'Interpretation',
      content: reportData.interpretation,
      icon: <TrendingUp className="h-5 w-5" />,
      required: true
    }
  ];

  const renderExecutiveSummary = (content: any) => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Project Overview</h3>
        <p className="text-gray-700 leading-relaxed">{content.projectOverview}</p>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Findings</h3>
        <ul className="space-y-2">
          {content.keyFindings?.map((finding: string, index: number) => (
            <li key={index} className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">{finding}</span>
            </li>
          ))}
        </ul>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Primary Recommendations</h3>
        <ul className="space-y-2">
          {content.recommendations?.map((rec: string, index: number) => (
            <li key={index} className="flex items-start">
              <ChevronRight className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">{rec}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  const renderGoalAndScope = (content: any) => (
    <div className="space-y-6">
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
        <div className="flex items-center">
          <Info className="h-5 w-5 text-blue-400 mr-2" />
          <h4 className="text-sm font-medium text-blue-800">ISO 14040 Requirement</h4>
        </div>
        <p className="text-sm text-blue-700 mt-1">
          This section defines the goal, scope, and functional unit of the LCA study as required by ISO 14040.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Study Goal</h4>
            <p className="text-gray-700">{content.goal}</p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Functional Unit</h4>
            <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{content.functionalUnit}</p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">System Boundary</h4>
            <p className="text-gray-700">{content.systemBoundary}</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Geographical Scope</h4>
            <p className="text-gray-700">{content.geographicalScope}</p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Time Scope</h4>
            <p className="text-gray-700">{content.timeScope}</p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Data Quality</h4>
            <p className="text-gray-700">{content.dataQuality}</p>
          </div>
        </div>
      </div>
      
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Impact Categories</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {content.impactCategories?.map((category: string, index: number) => (
            <div key={index} className="bg-gray-50 p-3 rounded-lg">
              <span className="text-sm text-gray-700">{category}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderLCI = (content: any) => (
    <div className="space-y-6">
      <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
        <div className="flex items-center">
          <Database className="h-5 w-5 text-green-500 mr-2" />
          <h4 className="text-sm font-medium text-green-800">Life Cycle Inventory</h4>
        </div>
        <p className="text-sm text-green-700 mt-1">
          Quantification of inputs and outputs for the product system throughout its life cycle.
        </p>
      </div>
      
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Data Collection Methodology</h4>
        <p className="text-gray-700 mb-4">{content.dataCollection}</p>
      </div>
      
      <div>
        <h4 className="font-medium text-gray-900 mb-4">Inventory Flows Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(content.inventoryFlows || {}).map(([key, flow]: [string, any]) => (
            <div key={key} className="bg-white border border-gray-200 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 capitalize mb-2">{key}</h5>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Linear:</span>
                  <span className="font-medium">{flow.linear?.toFixed(2)} {flow.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Circular:</span>
                  <span className="font-medium text-green-600">{flow.circular?.toFixed(2)} {flow.unit}</span>
                </div>
                {flow.linear && flow.circular && (
                  <div className="flex justify-between border-t pt-1 mt-1">
                    <span className="text-gray-600">Reduction:</span>
                    <span className="font-medium text-green-600">
                      {(((flow.linear - flow.circular) / flow.linear) * 100).toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderLCIA = (content: any) => (
    <div className="space-y-6">
      <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
        <div className="flex items-center">
          <BarChart3 className="h-5 w-5 text-purple-500 mr-2" />
          <h4 className="text-sm font-medium text-purple-800">Life Cycle Impact Assessment</h4>
        </div>
        <p className="text-sm text-purple-700 mt-1">
          Translation of inventory data into potential environmental impacts using characterization factors.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Characterization Results</h4>
          <div className="space-y-3">
            {Object.entries(content.characterization?.linear || {}).map(([impact, value]: [string, any]) => (
              <div key={impact} className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-900 capitalize">{impact.replace(/([A-Z])/g, ' $1').trim()}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Linear:</span>
                    <span className="font-medium ml-2">{value?.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Circular:</span>
                    <span className="font-medium text-green-600 ml-2">
                      {content.characterization?.circular?.[impact]?.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Methodology Details</h4>
          <div className="space-y-4">
            <div>
              <h5 className="text-sm font-medium text-gray-700">Normalization</h5>
              <p className="text-sm text-gray-600">{content.normalization}</p>
            </div>
            <div>
              <h5 className="text-sm font-medium text-gray-700">Weighting</h5>
              <p className="text-sm text-gray-600">{content.weighting}</p>
            </div>
            <div>
              <h5 className="text-sm font-medium text-gray-700">Uncertainty Analysis</h5>
              <p className="text-sm text-gray-600">{content.uncertaintyAnalysis}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderInterpretation = (content: any) => (
    <div className="space-y-6">
      <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
        <div className="flex items-center">
          <TrendingUp className="h-5 w-5 text-orange-500 mr-2" />
          <h4 className="text-sm font-medium text-orange-800">Interpretation</h4>
        </div>
        <p className="text-sm text-orange-700 mt-1">
          Analysis of results, limitations, and recommendations as required by ISO 14040.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
            Significant Findings
          </h4>
          <ul className="space-y-2">
            {content.significantFindings?.map((finding: string, index: number) => (
              <li key={index} className="text-sm text-gray-700 bg-green-50 p-2 rounded">
                {finding}
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />
            Limitations
          </h4>
          <ul className="space-y-2">
            {content.limitations?.map((limitation: string, index: number) => (
              <li key={index} className="text-sm text-gray-700 bg-yellow-50 p-2 rounded">
                {limitation}
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <ChevronRight className="h-4 w-4 text-blue-500 mr-2" />
            Recommendations
          </h4>
          <ul className="space-y-2">
            {content.recommendations?.map((rec: string, index: number) => (
              <li key={index} className="text-sm text-gray-700 bg-blue-50 p-2 rounded">
                {rec}
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Conclusions and Recommendations</h4>
        <p className="text-gray-700">{content.conclusionsAndRecommendations}</p>
      </div>
    </div>
  );

  const renderSectionContent = (section: ISOSection) => {
    if (!section.content) {
      return (
        <div className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-gray-500">No data available for this section</p>
        </div>
      );
    }

    switch (section.title.toLowerCase()) {
      case 'executive summary':
        return renderExecutiveSummary(section.content);
      case 'goal & scope':
        return renderGoalAndScope(section.content);
      case 'life cycle inventory (lci)':
        return renderLCI(section.content);
      case 'life cycle impact assessment (lcia)':
        return renderLCIA(section.content);
      case 'interpretation':
        return renderInterpretation(section.content);
      default:
        return <div>Section content not implemented</div>;
    }
  };

  return (
    <div className="flex">
      {/* Navigation Sidebar */}
      <div className="w-80 bg-gray-50 border-r border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-4">ISO 14040/14044 Sections</h3>
        <nav className="space-y-2">
          {isoSections.map((section) => (
            <button
              key={section.title}
              onClick={() => onSectionChange(section.title)}
              className={`w-full flex items-center p-3 text-left rounded-lg transition-colors ${
                activeSection === section.title
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="mr-3">{section.icon}</div>
              <div className="flex-1">
                <div className="font-medium">{section.title}</div>
                {section.required && (
                  <div className="text-xs text-gray-500 mt-1">Required by ISO</div>
                )}
              </div>
              {section.content && (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
            </button>
          ))}
        </nav>
      </div>
      
      {/* Content Area */}
      <div className="flex-1 p-6">
        {(() => {
          const activeISOSection = isoSections.find(s => s.title === activeSection);
          return activeISOSection ? (
            <div>
              <div className="flex items-center mb-6">
                {activeISOSection.icon}
                <h2 className="text-2xl font-bold text-gray-900 ml-3">{activeISOSection.title}</h2>
                {activeISOSection.required && (
                  <span className="ml-3 px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                    Required
                  </span>
                )}
              </div>
              {renderSectionContent(activeISOSection)}
            </div>
          ) : (
            <div>Section not found</div>
          );
        })()}
      </div>
    </div>
  );
};

export default ISOReportSection;