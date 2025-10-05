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
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

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
    
    // Clear validation errors for this field
    const errorKey = `stage_${index}_${field === 'stageName' ? 'name' : field === 'materialType' ? 'material' : field === 'energyUsage' ? 'energy' : field === 'waterUsage' ? 'water' : field === 'transportDistance' ? 'transport' : field}`;
    if (validationErrors[errorKey]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
    
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

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};
    
    // Validate project name
    if (!projectName.trim()) {
      errors.projectName = 'Project name is required';
    } else if (projectName.trim().length < 3) {
      errors.projectName = 'Project name must be at least 3 characters long';
    }
    
    // Validate stages
    if (stages.length === 0) {
      errors.stages = 'At least one stage is required';
    } else {
      stages.forEach((stage, index) => {
        if (!stage.stageName.trim()) {
          errors[`stage_${index}_name`] = `Stage ${index + 1} name is required`;
        }
        if (!stage.materialType.trim()) {
          errors[`stage_${index}_material`] = `Stage ${index + 1} material type is required`;
        }
        if (stage.energyUsage < 0) {
          errors[`stage_${index}_energy`] = `Stage ${index + 1} energy usage cannot be negative`;
        }
        if (stage.waterUsage < 0) {
          errors[`stage_${index}_water`] = `Stage ${index + 1} water usage cannot be negative`;
        }
        if (stage.transportDistance < 0) {
          errors[`stage_${index}_transport`] = `Stage ${index + 1} transport distance cannot be negative`;
        }
      });
    }
    
    // Validate percentages sum to 100
    const totalPercentage = overallData.reusePercentage + overallData.recyclePercentage + overallData.landfillPercentage;
    if (Math.abs(totalPercentage - 100) > 1) {
      errors.percentages = 'Reuse, recycle, and landfill percentages must sum to 100%';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
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
    
    // Clear previous errors
    setError('');
    setValidationErrors({});
    
    // Validate form
    if (!validateForm()) {
      setError('Please fix the validation errors below');
      return;
    }
    
    setLoading(true);
    setSuccess(false);

    try {
      const token = localStorage.getItem('lca_token');
      
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      // Validate data before sending
      const payload = {
        projectName: projectName.trim(),
        overallData: {
          ...overallData,
          totalEnergyUsage: Number(overallData.totalEnergyUsage.toFixed(2)),
          totalWaterUsage: Number(overallData.totalWaterUsage.toFixed(2))
        },
        stages: stages.map(stage => ({
          ...stage,
          energyUsage: Number(stage.energyUsage),
          waterUsage: Number(stage.waterUsage),
          transportDistance: Number(stage.transportDistance),
          wasteGenerated: Number(stage.wasteGenerated || 0),
          recyclingPercentage: Number(stage.recyclingPercentage || 0),
          efficiency: Number(stage.efficiency || 85)
        }))
      };
      
      const response = await fetch('http://localhost:5000/api/process/submit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error types
        if (response.status === 400 && data.validationErrors) {
          const fieldErrors: {[key: string]: string} = {};
          data.validationErrors.forEach((err: any) => {
            fieldErrors[err.field] = err.message;
          });
          setValidationErrors(fieldErrors);
          throw new Error(data.details || 'Validation failed');
        }
        
        if (response.status === 401) {
          // Clear invalid token
          localStorage.removeItem('lca_token');
          localStorage.removeItem('lca_user');
          throw new Error('Session expired. Please log in again.');
        }
        
        throw new Error(data.details || data.error || `Server error: ${response.status}`);
      }

      setSuccess(true);
      
      // Show success message and reset form after delay
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
        setValidationErrors({});
      }, 3000);

    } catch (error: any) {
      console.error('Submission error:', error);
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setError('Network error: Unable to connect to server. Please check your connection and try again.');
      } else if (error.message.includes('JSON')) {
        setError('Server response error: Invalid data received. Please try again.');
      } else {
        setError(error.message || 'An unexpected error occurred while submitting your project.');
      }
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
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <span className="text-red-700 font-medium">Error:</span>
              <span className="text-red-700 ml-2">{error}</span>
              {Object.keys(validationErrors).length > 0 && (
                <div className="mt-3">
                  <p className="text-sm text-red-600 font-medium mb-2">Validation Errors:</p>
                  <ul className="text-sm text-red-600 space-y-1">
                    {Object.entries(validationErrors).map(([key, message]) => (
                      <li key={key} className="flex items-start">
                        <span className="w-2 h-2 bg-red-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                        {message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
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
                onChange={(e) => {
                  setProjectName(e.target.value);
                  if (validationErrors.projectName) {
                    setValidationErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors.projectName;
                      return newErrors;
                    });
                  }
                }}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  validationErrors.projectName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Enter project name"
              />
              {validationErrors.projectName && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.projectName}</p>
              )}
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