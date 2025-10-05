import React from 'react';
import { Bar } from 'react-chartjs-2';

interface ChartsData {
  comparisonChartData: any;
  stagesChartData: any;
}

interface ChartsSectionProps {
  chartsData: ChartsData;
}

const ChartsSection: React.FC<ChartsSectionProps> = ({ chartsData }) => {
  const { comparisonChartData, stagesChartData } = chartsData;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">Overall Comparison</h3>
        <div className="h-64">
          {comparisonChartData ? (
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
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <div className="text-lg mb-2">No Data Available</div>
                <div className="text-sm">Chart data is not available for overall comparison</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">Stage-wise Energy Comparison</h3>
        <div className="h-64">
          {stagesChartData ? (
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
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <div className="text-lg mb-2">No Data Available</div>
                <div className="text-sm">Chart data is not available for stage comparison</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChartsSection;