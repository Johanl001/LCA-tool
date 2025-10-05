import React from 'react';
import { Zap, Droplets, Recycle, ArrowDown } from 'lucide-react';

interface MetricsTableProps {
  totals: {
    linear?: {
      energy?: number;
      water?: number;
      waste?: number;
      co2?: number;
    };
    circular?: {
      energy?: number;
      water?: number;
      waste?: number;
      co2?: number;
    };
  };
}

const MetricsComparisonTable: React.FC<MetricsTableProps> = ({ totals }) => {
  const calculateImprovement = (linear: number = 0, circular: number = 0) => {
    return linear > 0 ? (((linear - circular) / linear) * 100).toFixed(1) : '0.0';
  };

  const metricsData = [
    {
      name: 'Energy (GJ)',
      icon: <Zap className="inline h-4 w-4 mr-2 text-orange-500" />,
      linear: totals?.linear?.energy || 0,
      circular: totals?.circular?.energy || 0
    },
    {
      name: 'Water (m³)',
      icon: <Droplets className="inline h-4 w-4 mr-2 text-blue-500" />,
      linear: totals?.linear?.water || 0,
      circular: totals?.circular?.water || 0
    },
    {
      name: 'Waste (kg)',
      icon: <Recycle className="inline h-4 w-4 mr-2 text-green-500" />,
      linear: totals?.linear?.waste || 0,
      circular: totals?.circular?.waste || 0
    },
    {
      name: 'CO₂ Emissions (kg)',
      icon: <div className="inline h-4 w-4 mr-2 bg-gray-500 rounded-full"></div>,
      linear: totals?.linear?.co2 || 0,
      circular: totals?.circular?.co2 || 0
    }
  ];

  return (
    <div className="overflow-x-auto mb-6">
      <table className="w-full border border-gray-200 rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Metric</th>
            <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Linear Economy</th>
            <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Circular Economy</th>
            <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Improvement</th>
            <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Percentage</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {metricsData.map((metric, index) => (
            <tr key={index}>
              <td className="px-4 py-3 font-medium text-gray-900">
                {metric.icon}
                {metric.name}
              </td>
              <td className="px-4 py-3 text-center text-red-600">
                {metric.linear.toFixed(2)}
              </td>
              <td className="px-4 py-3 text-center text-green-600">
                {metric.circular.toFixed(2)}
              </td>
              <td className="px-4 py-3 text-center">
                <div className="flex items-center justify-center">
                  <ArrowDown className="h-4 w-4 text-green-500 mr-1" />
                  {(metric.linear - metric.circular).toFixed(2)}
                </div>
              </td>
              <td className="px-4 py-3 text-center font-medium text-green-600">
                {calculateImprovement(metric.linear, metric.circular)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MetricsComparisonTable;