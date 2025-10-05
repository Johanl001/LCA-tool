// India-specific LCA data constants and configurations
// Based on official government sources and regulatory standards

// Central Electricity Authority (CEA) Baseline Database
export const CEA_GRID_FACTORS = {
  // National weighted average (CEA CO2 Baseline Database v20.0)
  NATIONAL_AVERAGE: {
    emissionFactor: 0.82, // kgCO2/kWh (2022-23 data)
    version: 'CEA Baseline Database v20.0',
    year: 2023,
    source: 'Central Electricity Authority, Ministry of Power, Government of India'
  },
  
  // State-wise grid emission factors (sample - would be expanded)
  STATES: {
    'Maharashtra': { factor: 0.79, year: 2023 },
    'Gujarat': { factor: 0.85, year: 2023 },
    'Tamil Nadu': { factor: 0.74, year: 2023 },
    'Karnataka': { factor: 0.78, year: 2023 },
    'Andhra Pradesh': { factor: 0.81, year: 2023 },
    'Rajasthan': { factor: 0.88, year: 2023 },
    'West Bengal': { factor: 0.91, year: 2023 },
    'Odisha': { factor: 0.94, year: 2023 },
    'Jharkhand': { factor: 0.96, year: 2023 },
    'Chhattisgarh': { factor: 0.97, year: 2023 }
  },
  
  // Grid composition (India national average)
  GRID_COMPOSITION: {
    coal: 44.3, // %
    gas: 2.5,
    hydro: 13.2,
    nuclear: 3.2,
    renewables: 36.8 // includes solar, wind, biomass
  }
};

// Central Pollution Control Board (CPCB) Standards
export const CPCB_STANDARDS = {
  // Emission standards for aluminium/metal industries
  AIR_EMISSIONS: {
    ALUMINIUM_SMELTING: {
      SO2: { limit: 400, unit: 'mg/Nm³', standard: 'CPCB 2016' },
      NOx: { limit: 300, unit: 'mg/Nm³', standard: 'CPCB 2016' },
      PM: { limit: 50, unit: 'mg/Nm³', standard: 'CPCB 2016' },
      HF: { limit: 5, unit: 'mg/Nm³', standard: 'CPCB 2016' },
      TOTAL_FLUORIDES: { limit: 10, unit: 'mg/Nm³', standard: 'CPCB 2016' }
    },
    THERMAL_POWER_PLANTS: {
      SO2: { limit: 200, unit: 'mg/Nm³', standard: 'CPCB 2015' },
      NOx: { limit: 300, unit: 'mg/Nm³', standard: 'CPCB 2015' },
      PM: { limit: 30, unit: 'mg/Nm³', standard: 'CPCB 2015' }
    }
  },
  
  // Effluent standards
  WATER_EMISSIONS: {
    MINING_OPERATIONS: {
      pH: { min: 6.0, max: 9.0, standard: 'CPCB Mining Guidelines' },
      TSS: { limit: 100, unit: 'mg/L', standard: 'CPCB 2016' },
      BOD: { limit: 30, unit: 'mg/L', standard: 'CPCB 2016' },
      COD: { limit: 250, unit: 'mg/L', standard: 'CPCB 2016' },
      HEAVY_METALS: {
        Lead: { limit: 0.1, unit: 'mg/L' },
        Mercury: { limit: 0.01, unit: 'mg/L' },
        Chromium: { limit: 0.1, unit: 'mg/L' },
        Cadmium: { limit: 2.0, unit: 'mg/L' }
      }
    },
    ALUMINIUM_PROCESSING: {
      pH: { min: 5.5, max: 9.0, standard: 'CPCB 2016' },
      TSS: { limit: 100, unit: 'mg/L', standard: 'CPCB 2016' },
      BOD: { limit: 30, unit: 'mg/L', standard: 'CPCB 2016' },
      COD: { limit: 250, unit: 'mg/L', standard: 'CPCB 2016' },
      FLUORIDES: { limit: 2.0, unit: 'mg/L', standard: 'CPCB 2016' },
      ALUMINIUM: { limit: 3.0, unit: 'mg/L', standard: 'CPCB 2016' }
    }
  }
};

// Indian Bureau of Mines (IBM) and Mining Governance
export const MINING_GOVERNANCE = {
  IBM_SUSTAINABILITY_FRAMEWORK: {
    RATING_CRITERIA: [
      'Environmental Management',
      'Mineral Conservation',
      'Safety Management',
      'Community Development',
      'Research & Development'
    ],
    RATING_SCALE: ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'],
    COMPLIANCE_REQUIREMENTS: [
      'Approved Mine Plans',
      'Environmental Clearance',
      'Forest Clearance (if applicable)',
      'Water NOC',
      'Explosives License'
    ]
  },
  
  LAND_REHABILITATION: {
    REQUIREMENTS: [
      'Afforestation of degraded land',
      'Backfilling of excavated areas',
      'Soil and water conservation',
      'Restoration of topography',
      'Community involvement in rehabilitation'
    ],
    FINANCIAL_ASSURANCE: 'Mine Closure Plan with adequate financial provision',
    MONITORING: 'Regular environmental monitoring and reporting'
  },
  
  STATE_MINING_RULES: {
    COMMON_REQUIREMENTS: [
      'State Environmental Impact Assessment',
      'Public Hearing Process',
      'Consent to Establish (CTE)',
      'Consent to Operate (CTO)',
      'Regular compliance monitoring'
    ]
  }
};

// Aluminum-specific process data for India
export const INDIA_ALUMINUM_DATA = {
  BAUXITE_RESERVES: {
    TOTAL_RESERVES: '6.0 billion tonnes', // As per IBM
    MAIN_LOCATIONS: ['Odisha', 'Andhra Pradesh', 'Gujarat', 'Jharkhand', 'Maharashtra'],
    AVERAGE_AL2O3_CONTENT: 45, // % typical for Indian bauxite
    AVERAGE_STRIPPING_RATIO: 1.5 // t waste : t ore
  },
  
  TYPICAL_PROCESS_PARAMETERS: {
    BAYER_PROCESS: {
      naohConsumption: 80, // kg/t alumina (India average)
      steamConsumption: 1200, // kg/t alumina
      electricityConsumption: 250, // kWh/t alumina
      redMudGeneration: 1.5, // t/t alumina
      causticRecovery: 96 // %
    },
    HALL_HEROULT_SMELTING: {
      powerConsumption: 13500, // kWh/t Al (India average, higher than global)
      anodeConsumption: 420, // kg/t Al
      aluminaConsumption: 1920, // kg/t Al
      pfcEmissions: 0.8, // kg CO2-eq/t Al
      potLifetime: 2500 // days
    },
    TRANSPORT_DISTANCES: {
      bauxiteToAlumina: 150, // km average
      aluminaToSmelter: 300, // km average
      smelterToMarket: 500 // km average
    }
  },
  
  ENERGY_MIX_IMPACT: {
    CAPTIVE_POWER: {
      prevalence: 65, // % of aluminum smelters with captive power
      coalIntensive: true,
      emissionFactor: 1.02 // kgCO2/kWh for captive coal plants
    },
    RENEWABLE_INITIATIVES: {
      solarAdoption: 15, // % of industry moving to solar
      windAdoption: 8, // % of industry using wind
      hydroAvailability: 25 // % potential for hydro power
    }
  }
};

// Reference databases and sources for India
export const REFERENCE_SOURCES = {
  GOVERNMENT_SOURCES: {
    CEA: {
      name: 'Central Electricity Authority',
      database: 'CO2 Baseline Database',
      url: 'https://cea.nic.in',
      currentVersion: 'v20.0',
      updateFrequency: 'Annual'
    },
    CPCB: {
      name: 'Central Pollution Control Board',
      standards: 'Environmental Standards',
      url: 'https://cpcb.nic.in',
      lastUpdated: '2016-2023'
    },
    IBM: {
      name: 'Indian Bureau of Mines',
      purpose: 'Mining regulations and sustainability',
      url: 'https://ibm.gov.in',
      ratingsystem: 'IBM Star Rating for Mines'
    }
  },
  
  INTERNATIONAL_DATABASES: {
    IAI: {
      name: 'International Aluminium Institute',
      data: 'Global LCI data for aluminum',
      url: 'https://international-aluminium.org',
      useCase: 'Benchmark and gap filling'
    },
    ECOINVENT: {
      name: 'ecoinvent Database',
      version: 'v3.8+',
      useCase: 'Background processes and international benchmarks'
    },
    GABI: {
      name: 'GaBi Professional Database',
      useCase: 'Industry-specific processes and validation'
    }
  }
};

// Default data quality indicators for India context
export const DATA_QUALITY_INDIA = {
  TEMPORAL_REPRESENTATIVENESS: {
    PREFERRED_RANGE: 5, // years
    ACCEPTABLE_RANGE: 10, // years
    CURRENT_YEAR: 2024
  },
  
  GEOGRAPHICAL_REPRESENTATIVENESS: {
    PREFERRED: 'India plant-specific',
    ACCEPTABLE: 'India regional average',
    PROXY: 'Global average with India adjustments'
  },
  
  TECHNOLOGICAL_REPRESENTATIVENESS: {
    PREFERRED: 'Current Indian technology',
    ACCEPTABLE: 'International best practice adapted for India',
    PROXY: 'Global average technology'
  },
  
  UNCERTAINTY_RANGES: {
    PRIMARY_DATA: { min: 5, max: 15 }, // % uncertainty
    SECONDARY_DATA: { min: 20, max: 40 },
    PROXY_DATA: { min: 50, max: 100 },
    GRID_EMISSION_FACTOR: { min: 10, max: 20 }
  }
};

// Functional unit templates for different scenarios
export const FUNCTIONAL_UNIT_TEMPLATES = {
  ALUMINUM: {
    PRIMARY_INGOT: '1 tonne Al ingot (primary) - cradle-to-gate',
    SECONDARY_INGOT: '1 tonne Al ingot (recycled) - cradle-to-gate',
    SHEET_PRODUCT: '1 kg Al sheet - cradle-to-gate',
    CLADDING: '1 m² of Al cladding - cradle-to-grave',
    AUTOMOTIVE_PART: '1 kg Al automotive component - cradle-to-grave'
  },
  STEEL: {
    PRIMARY_STEEL: '1 tonne crude steel (primary) - cradle-to-gate',
    REBAR: '1 tonne steel rebar - cradle-to-gate',
    SHEET_STEEL: '1 tonne steel sheet - cradle-to-gate'
  },
  COPPER: {
    REFINED_COPPER: '1 tonne refined copper - cradle-to-gate',
    COPPER_WIRE: '1 km copper electrical wire - cradle-to-grave'
  }
};

export default {
  CEA_GRID_FACTORS,
  CPCB_STANDARDS,
  MINING_GOVERNANCE,
  INDIA_ALUMINUM_DATA,
  REFERENCE_SOURCES,
  DATA_QUALITY_INDIA,
  FUNCTIONAL_UNIT_TEMPLATES
};