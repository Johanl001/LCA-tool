import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Save, 
  Zap, 
  Droplets, 
  Package, 
  Truck, 
  Recycle,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Stage {
  stageName: string;
  energyUsage: number;
  waterUsage: number;
  materialType: string;
  transportMode: string;
  transportDistance: number;
  wasteGenerated: number;
  fuelType: string;
  recyclingPercentage: number;
  efficiency: number;
}

interface OverallData {
  totalEnergyUsage: number;
  totalWaterUsage: number;
  sustainabilityScore: number;
  projectNotes: string;
  metalType: string;
  productionRoute: string;
  region: string;
  productLifetime: number;
  reusePercentage: number;
  recyclePercentage: number;
  landfillPercentage: number;
}

interface SubmitProcessProps {
  user: User;
}

const SubmitProcess: React.FC<SubmitProcessProps> = ({ user }) => {
  const [projectName, setProjectName] = useState('');
  const [stages, setStages] = useState<Stage[]>([
    {
      stageName: 'Mining',
      energyUsage: 0,
      waterUsage: 0,
      materialType: '',
      transportMode: 'truck',
      transportDistance: 0,
      wasteGenerated: 0,
      fuelType: 'Mixed',
      recyclingPercentage: 0,
      efficiency: 85
    }
  ]);

  const [overallData, setOverallData] = useState<OverallData>({
    totalEnergyUsage: 0,
    totalWaterUsage: 0,
    sustainabilityScore: 0,
    projectNotes: '',
    metalType: 'Aluminum',
    productionRoute: 'Primary',
    region: 'North America',
    productLifetime: 15,
    reusePercentage: 0,
    recyclePercentage: 0,
    landfillPercentage: 100
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const commonStages = [
    'Mining', 'Processing', 'Smelting', 'Refining', 'Manufacturing', 
    'Transport', 'Use Phase', 'End-of-Life'
  ];

  const materialTypes = [
    'Aluminum', 'Copper', 'Steel', 'Iron Ore', 'Titanium', 'Zinc', 'Lead', 'Other'
  ];

  const transportModes = [
    { value: 'truck', label: 'Truck' },
    { value: 'rail', label: 'Rail' },
    { value: 'ship', label: 'Ship' },
    { value: 'pipeline', label: 'Pipeline' },
    { value: 'mixed', label: 'Mixed' }
  ];

  const fuelTypes = [
    'Renewable', 'Natural Gas', 'Coal', 'Oil', 'Nuclear', 'Mixed'
  ];

  const regions = [
    'North America', 'Europe', 'Asia', 'South America', 'Africa', 'Oceania'
  ];

  const addStage = () => {
    const newStage: Stage = {
      stageName: '',
      energyUsage: 0,
      waterUsage: 0,
      materialType: overallData.metalType,
      transportMode: 'truck',
      transportDistance: 0,
      wasteGenerated: 0,
      fuelType: 'Mixed',
      recyclingPercentage: 0,
      efficiency: 85
    };
    setStages([...stages, newStage]);
  };

  const removeStage = (index: number) => {
    if (stages.length > 1) {
      const newStages = stages.filter((_, i) => i !== index);
      setStages(newStages);
    }
  };

  const updateStage = (index: number, field: keyof Stage, value: any) => {
    const newStages = [...stages];
    newStages[index] = { ...newStages[index], [field]: value };
    setStages(newStages);
    
    // Auto-calculate totals
    calculateTotals(newStages);
  };

  const updateOverallData = (field: keyof OverallData, value: any) => {
    setOverallData({ ...overallData, [field]: value });
    
    // Update recycling percentages to sum to 100
    if (field === 'reusePercentage' || field === 'recyclePercentage') {
      const reuse = field === 'reusePercentage' ? value : overallData.reusePercentage;
      const recycle = field === 'recyclePercentage' ? value : overallData.recyclePercentage;
      const landfill = Math.max(0, 100 - reuse - recycle);
      
      setOverallData({
        ...overallData,
        [field]: value,
        landfillPercentage: landfill
      });
    }
  };

  const calculateTotals = (stageData: Stage[]) => {
    const totalEnergy = stageData.reduce((sum, stage) => sum + (stage.energyUsage || 0), 0);
    const totalWater = stageData.reduce((sum, stage) => sum + (stage.waterUsage || 0), 0);
    
    setOverallData(prev => ({
      ...prev,
      totalEnergyUsage: totalEnergy,
      totalWaterUsage: totalWater
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const token = localStorage.getItem('lca_token');
      const response = await fetch('http://localhost:5000/api/process/submit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          projectName,
          overallData,
          stages
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit process data');
      }

      setSuccess(true);
      // Reset form after successful submission
      setTimeout(() => {
        setProjectName('');
        setStages([{
          stageName: 'Mining',
          energyUsage: 0,
          waterUsage: 0,
          materialType: '',
          transportMode: 'truck',
          transportDistance: 0,
          wasteGenerated: 0,
          fuelType: 'Mixed',
          recyclingPercentage: 0,
          efficiency: 85
        }]);
        setOverallData({
          totalEnergyUsage: 0,
          totalWaterUsage: 0,
          sustainabilityScore: 0,
          projectNotes: '',
          metalType: 'Aluminum',
          productionRoute: 'Primary',
          region: 'North America',
          productLifetime: 15,
          reusePercentage: 0,
          recyclePercentage: 0,
          landfillPercentage: 100
        });
        setSuccess(false);
      }, 3000);

    } catch (error: any) {
      setError(error.message || 'An error occurred while submitting');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Submit Process Data</h1>
        <p className="text-gray-600">
          Enter your Life Cycle Assessment data for comprehensive analysis
        </p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
          <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
          <span className="text-green-700">Process data submitted successfully!</span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Project Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Project Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Name *
              </label>
              <input
                type="text"
                required
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter project name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Metal Type *
              </label>
              <select
                required
                value={overallData.metalType}
                onChange={(e) => updateOverallData('metalType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {materialTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Production Route *
              </label>
              <select
                required
                value={overallData.productionRoute}
                onChange={(e) => updateOverallData('productionRoute', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="Primary">Primary</option>
                <option value="Secondary">Secondary</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Region *
              </label>
              <select
                required
                value={overallData.region}
                onChange={(e) => updateOverallData('region', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {regions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stage-wise Inputs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Stage-wise Inputs</h2>
            <button
              type="button"
              onClick={addStage}
              className="flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Stage
            </button>
          </div>

          <div className="space-y-6">
            {stages.map((stage, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6 relative">
                {stages.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeStage(index)}
                    className="absolute top-4 right-4 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}

                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Stage {index + 1}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stage Name *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={stage.stageName}
                        onChange={(e) => updateStage(index, 'stageName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Select or enter stage name"
                        list={`stages-${index}`}
                      />
                      <datalist id={`stages-${index}`}>
                        {commonStages.map(stageName => (
                          <option key={stageName} value={stageName} />
                        ))}
                      </datalist>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Zap className="inline h-4 w-4 mr-1" />
                      Energy Usage (GJ) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={stage.energyUsage}
                      onChange={(e) => updateStage(index, 'energyUsage', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Droplets className="inline h-4 w-4 mr-1" />
                      Water Usage (m³) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={stage.waterUsage}
                      onChange={(e) => updateStage(index, 'waterUsage', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Package className="inline h-4 w-4 mr-1" />
                      Material Type *
                    </label>
                    <select
                      required
                      value={stage.materialType}
                      onChange={(e) => updateStage(index, 'materialType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Select material</option>
                      {materialTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Truck className="inline h-4 w-4 mr-1" />
                      Transport Mode *
                    </label>
                    <select
                      required
                      value={stage.transportMode}
                      onChange={(e) => updateStage(index, 'transportMode', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      {transportModes.map(mode => (
                        <option key={mode.value} value={mode.value}>{mode.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transport Distance (km) *
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      required
                      value={stage.transportDistance}
                      onChange={(e) => updateStage(index, 'transportDistance', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fuel Type
                    </label>
                    <select
                      value={stage.fuelType}
                      onChange={(e) => updateStage(index, 'fuelType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      {fuelTypes.map(fuel => (
                        <option key={fuel} value={fuel}>{fuel}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Recycle className="inline h-4 w-4 mr-1" />
                      Recycling % (0-100)
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      max="100"
                      value={stage.recyclingPercentage}
                      onChange={(e) => updateStage(index, 'recyclingPercentage', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Process Efficiency % (0-100)
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      max="100"
                      value={stage.efficiency}
                      onChange={(e) => updateStage(index, 'efficiency', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Overall Inputs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Overall Project Data</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Energy Usage (GJ)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={overallData.totalEnergyUsage}
                onChange={(e) => updateOverallData('totalEnergyUsage', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50"
                placeholder="Auto-calculated from stages"
              />
              <p className="text-xs text-gray-500 mt-1">Auto-calculated from stage data</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Water Usage (m³)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={overallData.totalWaterUsage}
                onChange={(e) => updateOverallData('totalWaterUsage', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50"
                placeholder="Auto-calculated from stages"
              />
              <p className="text-xs text-gray-500 mt-1">Auto-calculated from stage data</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Lifetime (years)
              </label>
              <input
                type="number"
                step="1"
                min="1"
                value={overallData.productLifetime}
                onChange={(e) => updateOverallData('productLifetime', parseFloat(e.target.value) || 15)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reuse Percentage (%)
              </label>
              <input
                type="number"
                step="1"
                min="0"
                max="100"
                value={overallData.reusePercentage}
                onChange={(e) => updateOverallData('reusePercentage', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recycle Percentage (%)
              </label>
              <input
                type="number"
                step="1"
                min="0"
                max="100"
                value={overallData.recyclePercentage}
                onChange={(e) => updateOverallData('recyclePercentage', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Landfill Percentage (%)
              </label>
              <input
                type="number"
                step="1"
                min="0"
                max="100"
                value={overallData.landfillPercentage}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-gray-50"
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">Auto-calculated (100% - Reuse% - Recycle%)</p>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Notes (Optional)
            </label>
            <textarea
              value={overallData.projectNotes}
              onChange={(e) => updateOverallData('projectNotes', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Add any additional notes about this project..."
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center px-8 py-3 bg-green-600 text-white font-medium text-sm rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="h-5 w-5 mr-2" />
            )}
            {loading ? 'Submitting...' : 'Submit Process Data'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubmitProcess;