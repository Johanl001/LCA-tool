import React from 'react';
import { 
  Download, 
  FileText,
  MessageCircle,
  BookOpen
} from 'lucide-react';

interface ReportExportsProps {
  reportData: any;
  onDownloadPDF: () => void;
  onDownloadExcel: () => void;
  onPrint: () => void;
  onOpenChatbot: () => void;
  onOpenDetailedReport: () => void;
}

const ReportExports: React.FC<ReportExportsProps> = ({
  reportData,
  onDownloadPDF,
  onDownloadExcel,
  onPrint,
  onOpenChatbot,
  onOpenDetailedReport
}) => {
  if (!reportData) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Export Options</h2>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={onDownloadPDF}
          className="flex items-center px-4 py-2 bg-red-600 text-white font-medium text-sm rounded-lg hover:bg-red-700 transition-colors"
        >
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </button>
        
        <button
          onClick={onDownloadExcel}
          className="flex items-center px-4 py-2 bg-green-600 text-white font-medium text-sm rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="h-4 w-4 mr-2" />
          Download Excel
        </button>
        
        <button
          onClick={onPrint}
          className="flex items-center px-4 py-2 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FileText className="h-4 w-4 mr-2" />
          Print Report
        </button>
        
        <button
          onClick={onOpenChatbot}
          className="flex items-center px-4 py-2 bg-purple-600 text-white font-medium text-sm rounded-lg hover:bg-purple-700 transition-colors"
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          AI Assistant
        </button>
        
        <button
          onClick={onOpenDetailedReport}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white font-medium text-sm rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <BookOpen className="h-4 w-4 mr-2" />
          6-Page Report
        </button>
      </div>
      
      {/* Report Info */}
      <div className="mt-6 pt-4 border-t border-gray-200 text-sm text-gray-600">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <span className="font-medium">Report Type:</span>
            <span className="ml-2">{reportData.metadata?.scenarioType || 'Standard LCA'}</span>
          </div>
          <div>
            <span className="font-medium">Generated:</span>
            <span className="ml-2">{new Date(reportData.metadata?.generatedAt || reportData.generatedAt || Date.now()).toLocaleDateString()}</span>
          </div>
          <div>
            <span className="font-medium">Version:</span>
            <span className="ml-2">{reportData.metadata?.reportVersion || '2.0'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportExports;