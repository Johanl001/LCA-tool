import React from 'react';
import { Bar, Doughnut, Radar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler
);

interface ChartData {
  stageMetrics: any[];
  totals: {
    linear?: any;
    circular?: any;
    impactTotals?: {
      linear?: any;
      circular?: any;
    };
  };
  metalType: string;
}

interface AdvancedChartsProps {
  data: ChartData;
  type: 'sankey' | 'radar' | 'waterfall' | 'heatmap';
}

const AdvancedCharts: React.FC<AdvancedChartsProps> = ({ data, type }) => {
  
  // Impact Categories Radar Chart with enhanced validation
  const createRadarChart = () => {
    if (!data || !data.totals?.impactTotals?.linear || !data.totals?.impactTotals?.circular) {
      console.warn('Insufficient impact data for radar chart');
      return null;
    }
    
    const linearImpacts = data.totals.impactTotals.linear;
    const circularImpacts = data.totals.impactTotals.circular;
    
    const radarData = {
      labels: ['Climate Change', 'Acidification', 'Eutrophication', 'Energy Demand'],
      datasets: [
        {
          label: 'Linear Economy',
          data: [
            Number(linearImpacts.climateChange) || 0,
            Number(linearImpacts.acidification) || 0,
            Number(linearImpacts.eutrophication) || 0,
            Number(linearImpacts.energyDemand) || 0
          ],
          backgroundColor: 'rgba(239, 68, 68, 0.2)',
          borderColor: 'rgba(239, 68, 68, 1)',
          borderWidth: 2,
          pointBackgroundColor: 'rgba(239, 68, 68, 1)',
        },
        {
          label: 'Circular Economy',
          data: [
            Number(circularImpacts.climateChange) || 0,
            Number(circularImpacts.acidification) || 0,
            Number(circularImpacts.eutrophication) || 0,
            Number(circularImpacts.energyDemand) || 0
          ],
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          borderColor: 'rgba(16, 185, 129, 1)',
          borderWidth: 2,
          pointBackgroundColor: 'rgba(16, 185, 129, 1)',
        }
      ]
    };

    const radarOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          beginAtZero: true,
          ticks: {
            stepSize: 10
          }
        }
      },
      plugins: {
        title: {
          display: true,
          text: 'Environmental Impact Categories Comparison'
        },
        legend: {
          position: 'bottom' as const
        }
      }
    };

    return <Radar data={radarData} options={radarOptions} />;
  };

  // Stage-wise Energy Flow (Sankey-like visualization using bar chart)
  const createEnergyFlowChart = () => {
    if (!data.stageMetrics || data.stageMetrics.length === 0) return null;
    
    const flowData = {
      labels: data.stageMetrics.map((stage, index) => `Stage ${index + 1}: ${stage.stageName || 'Unknown'}`),
      datasets: [
        {
          label: 'Energy Input',
          data: data.stageMetrics.map(stage => stage.linear?.energyUsage || 0),
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1
        },
        {
          label: 'Energy Saved (Circular)',
          data: data.stageMetrics.map(stage => 
            (stage.linear?.energyUsage || 0) - (stage.circular?.energyUsage || 0)
          ),
          backgroundColor: 'rgba(16, 185, 129, 0.8)',
          borderColor: 'rgba(16, 185, 129, 1)',
          borderWidth: 1
        }
      ]
    };

    const flowOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          stacked: false,
          title: {
            display: true,
            text: 'Production Stages'
          }
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Energy (GJ)'
          }
        }
      },
      plugins: {
        title: {
          display: true,
          text: 'Energy Flow Through Production Stages'
        },
        legend: {
          position: 'top' as const
        }
      }
    };

    return <Bar data={flowData} options={flowOptions} />;
  };

  // Impact Distribution Pie Chart
  const createImpactDistributionChart = () => {
    if (!data.stageMetrics || data.stageMetrics.length === 0) return null;
    
    const impactData = {
      labels: data.stageMetrics.map(stage => stage.stageName || 'Unknown Stage'),
      datasets: [
        {
          label: 'CO2 Emissions Distribution',
          data: data.stageMetrics.map(stage => stage.linear?.co2Emissions || 0),
          backgroundColor: [
            'rgba(239, 68, 68, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(139, 92, 246, 0.8)',
            'rgba(236, 72, 153, 0.8)'
          ],
          borderColor: [
            'rgba(239, 68, 68, 1)',
            'rgba(245, 158, 11, 1)',
            'rgba(59, 130, 246, 1)',
            'rgba(16, 185, 129, 1)',
            'rgba(139, 92, 246, 1)',
            'rgba(236, 72, 153, 1)'
          ],
          borderWidth: 2
        }
      ]
    };

    const pieOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'CO2 Emissions Distribution by Stage'
        },
        legend: {
          position: 'right' as const
        }
      }
    };

    return <Doughnut data={impactData} options={pieOptions} />;
  };

  // Time Series Improvement Chart
  const createImprovementTrendChart = () => {
    if (!data.stageMetrics || data.stageMetrics.length === 0) return null;
    
    const improvementData = {
      labels: data.stageMetrics.map((stage, index) => `Stage ${index + 1}`),
      datasets: [
        {
          label: 'Energy Saving %',
          data: data.stageMetrics.map(stage => stage.improvement?.energySaving || 0),
          borderColor: 'rgba(245, 158, 11, 1)',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'CO2 Reduction %',
          data: data.stageMetrics.map(stage => stage.improvement?.co2Saving || 0),
          borderColor: 'rgba(16, 185, 129, 1)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Waste Reduction %',
          data: data.stageMetrics.map(stage => stage.improvement?.wasteSaving || 0),
          borderColor: 'rgba(139, 92, 246, 1)',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    };

    const lineOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          title: {
            display: true,
            text: 'Improvement Percentage (%)'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Production Stages'
          }
        }
      },
      plugins: {
        title: {
          display: true,
          text: 'Circular Economy Benefits by Stage'
        },
        legend: {
          position: 'top' as const
        }
      }
    };

    return <Line data={improvementData} options={lineOptions} />;
  };

  const renderChart = () => {
    let chart = null;
    switch (type) {
      case 'radar':
        chart = createRadarChart();
        break;
      case 'sankey':
        chart = createEnergyFlowChart();
        break;
      case 'waterfall':
        chart = createImpactDistributionChart();
        break;
      case 'heatmap':
        chart = createImprovementTrendChart();
        break;
      default:
        chart = createRadarChart();
    }
    
    if (!chart) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <div className="text-lg mb-2">No Data Available</div>
            <div className="text-sm">Chart data is not available for this visualization</div>
          </div>
        </div>
      );
    }
    
    return chart;
  };

  return (
    <div className="h-96 w-full">
      {renderChart()}
    </div>
  );
};

export default AdvancedCharts;