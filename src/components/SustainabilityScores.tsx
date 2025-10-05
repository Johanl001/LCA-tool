import React from 'react';

interface SustainabilityScoresProps {
  scores: {
    sustainability?: number;
    circular?: number;
    linear?: number;
  };
}

const SustainabilityScores: React.FC<SustainabilityScoresProps> = ({ scores }) => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Sustainability Scores</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {scores?.sustainability || 0}%
          </div>
          <div className="text-sm font-medium text-green-800">Overall Sustainability</div>
        </div>
        
        <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {scores?.circular || 0}%
          </div>
          <div className="text-sm font-medium text-blue-800">Circular Economy</div>
        </div>
        
        <div className="text-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
          <div className="text-3xl font-bold text-gray-600 mb-2">
            {scores?.linear || 0}%
          </div>
          <div className="text-sm font-medium text-gray-800">Linear Economy</div>
        </div>
      </div>
    </div>
  );
};

export default SustainabilityScores;