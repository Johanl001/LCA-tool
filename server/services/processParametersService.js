// Process-specific parameters and industry database integration for comprehensive LCA reporting
import { INDIA_ALUMINUM_DATA, CEA_GRID_FACTORS, FUNCTIONAL_UNIT_TEMPLATES } from '../config/indiaLCAData.js';

// Enhanced process parameters for different metals and production routes
export const PROCESS_SPECIFIC_PARAMETERS = {
  
  // Aluminum production processes
  ALUMINUM: {
    BAUXITE_MINING: {
      defaultParameters: {
        oreGrade: { value: 45, unit: '% Al2O3', source: 'India average' },
        strippingRatio: { value: 1.5, unit: 't waste/t ore', source: 'India mining operations' },
        dieselConsumption: { value: 2.1, unit: 'L/t ore', source: 'Industry average' },
        blastingExplosives: { value: 0.15, unit: 'kg/t ore', source: 'Mining handbook' },
        haulDistance: { value: 8, unit: 'km', source: 'Typical pit to crusher' },
        waterUsage: { value: 0.8, unit: 'm³/t ore', source: 'Dust suppression' },
        electricity: { value: 4.2, unit: 'kWh/t ore', source: 'Crushing and screening' }
      },
      processEfficiencyFactors: {
        recovery: { min: 85, max: 95, typical: 90, unit: '%' },
        gradeVariability: { min: 35, max: 55, typical: 45, unit: '% Al2O3' }
      },
      environmentalParameters: {
        dustEmissions: { value: 0.5, unit: 'kg/t ore', controlMeasures: 'Water spraying' },
        noiseLevel: { value: 85, unit: 'dB', mitigation: 'Berms and barriers' },
        landDisturbance: { value: 0.8, unit: 'ha/Mt ore', restoration: 'Progressive rehabilitation' }
      }
    },

    BENEFICIATION: {
      defaultParameters: {
        grindingEnergy: { value: 12, unit: 'kWh/t bauxite', source: 'Typical ball mill' },
        waterConsumption: { value: 2.5, unit: 'm³/t bauxite', source: 'Washing and separation' },
        causticConsumption: { value: 8, unit: 'kg/t bauxite', source: 'Pre-treatment' },
        flocculants: { value: 0.05, unit: 'kg/t bauxite', source: 'Clarification' },
        yieldImprovement: { value: 3, unit: '% grade increase', source: 'Typical beneficiation' }
      },
      processConditions: {
        temperature: { value: 60, unit: '°C', notes: 'Washing temperature' },
        pressure: { value: 1, unit: 'atm', notes: 'Atmospheric pressure' },
        retention: { value: 2, unit: 'hours', notes: 'Washing time' }
      }
    },

    BAYER_PROCESS: {
      defaultParameters: {
        aluminaYield: { value: 0.48, unit: 'kg Al2O3/kg bauxite', source: 'Typical Indian plants' },
        causticConsumption: { value: 80, unit: 'kg NaOH/t Al2O3', source: 'INDIA_ALUMINUM_DATA' },
        limeConsumption: { value: 15, unit: 'kg/t Al2O3', source: 'Impurity removal' },
        steamConsumption: { value: 1200, unit: 'kg/t Al2O3', source: 'Digestion and evaporation' },
        electricity: { value: 250, unit: 'kWh/t Al2O3', source: 'INDIA_ALUMINUM_DATA' },
        coolingWater: { value: 150, unit: 'm³/t Al2O3', source: 'Heat exchangers' },
        processWater: { value: 8, unit: 'm³/t Al2O3', source: 'Washing and dilution' }
      },
      processConditions: {
        digestionTemp: { value: 145, unit: '°C', pressure: '4.5 bar' },
        digestionTime: { value: 45, unit: 'minutes', notes: 'Residence time' },
        causticStrength: { value: 140, unit: 'g/L Na2O', notes: 'Liquor concentration' },
        liquorRatio: { value: 2.2, unit: 'kg liquor/kg bauxite', notes: 'L/S ratio' }
      },
      byproducts: {
        redMud: {
          generation: { value: 1.5, unit: 't/t Al2O3', source: 'INDIA_ALUMINUM_DATA' },
          composition: {
            Fe2O3: 45, Al2O3: 18, SiO2: 15, TiO2: 8, CaO: 6, Na2O: 4, others: 4
          },
          moisture: { value: 35, unit: '%', notes: 'After filtration' },
          disposal: 'Tailings pond with neutralization'
        },
        steamRecovery: { value: 0.85, unit: 'fraction', notes: 'Heat recovery efficiency' }
      }
    },

    HALL_HEROULT_SMELTING: {
      defaultParameters: {
        powerConsumption: { value: 13500, unit: 'kWh/t Al', source: 'INDIA_ALUMINUM_DATA (high)' },
        aluminaConsumption: { value: 1920, unit: 'kg/t Al', source: 'Stoichiometric + excess' },
        anodeConsumption: { value: 420, unit: 'kg carbon/t Al', source: 'INDIA_ALUMINUM_DATA' },
        cryoliteAddition: { value: 15, unit: 'kg/t Al', source: 'Bath makeup' },
        aluminumFluoride: { value: 25, unit: 'kg/t Al', source: 'Bath chemistry control' },
        cathodeCarbon: { value: 35, unit: 'kg/t Al', source: 'Cathode consumption' }
      },
      processConditions: {
        operatingTemp: { value: 960, unit: '°C', range: '950-970°C' },
        cellVoltage: { value: 4.2, unit: 'V', range: '4.0-4.5V' },
        currentDensity: { value: 0.85, unit: 'A/cm²', notes: 'Cathode surface' },
        bathRatio: { value: 2.5, unit: 'NaF/AlF3', notes: 'Cryolite ratio' },
        potLife: { value: 2500, unit: 'days', source: 'INDIA_ALUMINUM_DATA' }
      },
      emissions: {
        pfcEmissions: {
          CF4: { value: 0.6, unit: 'kg/t Al', source: 'Process disruptions' },
          C2F6: { value: 0.08, unit: 'kg/t Al', source: 'Secondary reaction' },
          totalCO2eq: { value: 0.8, unit: 'kg CO2-eq/t Al', source: 'INDIA_ALUMINUM_DATA' }
        },
        particulateEmissions: {
          totalPM: { value: 1.2, unit: 'kg/t Al', control: 'Dry scrubbing + baghouse' },
          fluorides: { value: 0.3, unit: 'kg/t Al', control: 'HF/particulate abatement' }
        },
        so2Emissions: { value: 15, unit: 'kg/t Al', source: 'Anode sulfur content' }
      }
    },

    CASTING_ROLLING: {
      defaultParameters: {
        meltingEnergy: { value: 450, unit: 'MJ/t Al', source: 'Reverberatory furnace' },
        rollingEnergy: { value: 180, unit: 'kWh/t product', source: 'Cold rolling' },
        alloyingAdditions: { value: 20, unit: 'kg/t Al', source: 'Si, Fe, Cu additions' },
        lubricants: { value: 2, unit: 'kg/t product', source: 'Rolling oils' },
        yieldLoss: { value: 5, unit: '%', source: 'Trimming and scrap' }
      },
      productSpecific: {
        sheet: {
          thickness: { min: 0.2, max: 6.0, unit: 'mm' },
          widthRange: { min: 600, max: 2000, unit: 'mm' },
          specificEnergy: { value: 200, unit: 'kWh/t', notes: 'Including annealing' }
        },
        extrusion: {
          profileComplexity: 'Simple to complex',
          specificEnergy: { value: 350, unit: 'kWh/t', notes: 'Including heating' },
          yieldLoss: { value: 12, unit: '%', notes: 'Higher due to butt discard' }
        }
      }
    }
  },

  // Steel production processes (abbreviated for space)
  STEEL: {
    IRON_ORE_MINING: {
      defaultParameters: {
        oreGrade: { value: 62, unit: '% Fe', source: 'Indian iron ore average' },
        strippingRatio: { value: 1.2, unit: 't waste/t ore', source: 'Indian mines' },
        dieselConsumption: { value: 1.8, unit: 'L/t ore', source: 'Lower than aluminum' }
      }
    },
    BLAST_FURNACE: {
      defaultParameters: {
        cokeConsumption: { value: 450, unit: 'kg/t pig iron', source: 'Indian BF average' },
        ironOreConsumption: { value: 1600, unit: 'kg/t pig iron', source: 'Sinter + lump ore' },
        limestone: { value: 250, unit: 'kg/t pig iron', source: 'Flux requirement' }
      }
    }
  },

  // Copper production processes (abbreviated)
  COPPER: {
    MINING: {
      defaultParameters: {
        oreGrade: { value: 0.8, unit: '% Cu', source: 'Typical porphyry deposit' },
        energyIntensity: { value: 15, unit: 'kWh/t ore', source: 'Higher than aluminum mining' }
      }
    }
  }
};

// Industry database integration mappings
export const DATABASE_MAPPINGS = {
  // ecoinvent database mappings
  ECOINVENT: {
    version: 'v3.8',
    processes: {
      'aluminum, primary, ingot': {
        uuid: '44ca429f-de9e-47f7-99b0-7cd542e16a7c',
        geography: 'GLO',
        timeperiod: '2016-2020',
        technology: 'average technology'
      },
      'bauxite, from open pit mine': {
        uuid: 'f1a4f4dc-fbf5-4b7e-9c3a-8b5f5c0e8e9f',
        geography: 'RoW',
        adaptation_needed: 'Adjust for Indian mining conditions'
      },
      'alumina, from bauxite': {
        uuid: 'e4b2c8d9-4f5a-4b2c-8d9e-5f6a7b8c9d0e',
        geography: 'GLO',
        adaptation_needed: 'Use India-specific energy mix'
      }
    },
    adaptations_for_india: {
      electricity_mix: 'Use CEA grid factors',
      transportation: 'Adjust distances for Indian logistics',
      emission_factors: 'Apply CPCB standards where applicable'
    }
  },

  // GaBi database mappings
  GABI: {
    version: '2020',
    processes: {
      'Aluminum ingot (primary)': {
        region: 'GLOBAL',
        technology: 'Mix',
        adaptations: 'Scale to Indian energy intensity'
      }
    }
  },

  // IAI (International Aluminium Institute) LCI data
  IAI: {
    version: '2019',
    scope: 'Global aluminum industry average',
    parameters: {
      energy_intensity: { global: 15.0, india_estimate: 15.8, unit: 'kWh/kg Al' },
      pfc_emissions: { global: 0.4, india_estimate: 0.8, unit: 'kg CO2-eq/kg Al' },
      data_quality: 'Primary industry data, representative'
    },
    recommended_use: 'Benchmark and validation for Indian data'
  }
};

// Process parameter validation and quality checks
export const PARAMETER_VALIDATION = {
  ranges: {
    aluminum: {
      energy_smelting: { min: 12000, max: 18000, unit: 'kWh/t Al', flag_if_outside: true },
      alumina_consumption: { min: 1900, max: 1950, unit: 'kg/t Al', typical: 1920 },
      pfc_emissions: { min: 0.2, max: 2.0, unit: 'kg CO2-eq/t Al', india_typical: 0.8 }
    }
  },

  data_quality_indicators: {
    temporal: {
      excellent: '< 2 years old',
      good: '2-5 years old',
      acceptable: '5-10 years old',
      poor: '> 10 years old'
    },
    geographical: {
      excellent: 'Plant-specific Indian data',
      good: 'India regional average',
      acceptable: 'South Asia average',
      poor: 'Global average'
    },
    technological: {
      excellent: 'Current Indian technology',
      good: 'Recent international technology adapted',
      acceptable: 'International average with adjustments',
      poor: 'Outdated or non-representative technology'
    }
  }
};

// Default allocation methods by process and co-product
export const ALLOCATION_METHODS = {
  aluminum: {
    bauxite_mining: {
      method: 'mass',
      justification: 'Limited co-products, mass allocation appropriate',
      alternatives: ['economic', 'exergy']
    },
    bayer_process: {
      method: 'economic',
      justification: 'Red mud has negative economic value',
      allocation_factors: {
        alumina: 1.0,
        red_mud: 0.0
      },
      sensitivity: 'Test system expansion method'
    }
  },

  steel: {
    blast_furnace: {
      method: 'mass',
      justification: 'Slag has limited economic value',
      allocation_factors: {
        pig_iron: 0.85,
        slag: 0.15
      }
    }
  }
};

// Integration with comprehensive report service
export class ProcessParameterService {
  static getProcessParameters(metalType, processStage, region = 'India') {
    const metalParams = PROCESS_SPECIFIC_PARAMETERS[metalType.toUpperCase()];
    if (!metalParams || !metalParams[processStage]) {
      throw new Error(`Process parameters not found for ${metalType} - ${processStage}`);
    }

    const params = metalParams[processStage].defaultParameters;
    
    // Apply regional adjustments if different from India
    if (region === 'India') {
      return this.applyIndiaSpecificAdjustments(params, metalType, processStage);
    }
    
    return params;
  }

  static applyIndiaSpecificAdjustments(params, metalType, processStage) {
    const adjustedParams = { ...params };
    
    // Apply India-specific adjustments based on INDIA_ALUMINUM_DATA
    if (metalType === 'ALUMINUM') {
      switch (processStage) {
        case 'HALL_HEROULT_SMELTING':
          adjustedParams.powerConsumption = {
            ...adjustedParams.powerConsumption,
            value: INDIA_ALUMINUM_DATA.TYPICAL_PROCESS_PARAMETERS.HALL_HEROULT_SMELTING.powerConsumption
          };
          break;
        case 'BAYER_PROCESS':
          adjustedParams.causticConsumption = {
            ...adjustedParams.causticConsumption,
            value: INDIA_ALUMINUM_DATA.TYPICAL_PROCESS_PARAMETERS.BAYER_PROCESS.naohConsumption
          };
          break;
      }
    }
    
    return adjustedParams;
  }

  static validateParameters(parameters, metalType, processStage) {
    const validationRules = PARAMETER_VALIDATION.ranges[metalType.toLowerCase()];
    if (!validationRules) return { isValid: true, warnings: [] };

    const warnings = [];
    const errors = [];

    // Check if parameters fall within expected ranges
    Object.entries(parameters).forEach(([param, data]) => {
      const rule = validationRules[param];
      if (rule && typeof data.value === 'number') {
        if (data.value < rule.min || data.value > rule.max) {
          warnings.push(`${param}: ${data.value} ${data.unit} is outside typical range (${rule.min}-${rule.max} ${rule.unit})`);
        }
      }
    });

    return {
      isValid: errors.length === 0,
      warnings,
      errors
    };
  }

  static getDatabaseMapping(metalType, processStage, preferredDatabase = 'ecoinvent') {
    const mappings = DATABASE_MAPPINGS[preferredDatabase.toUpperCase()];
    if (!mappings) return null;

    // Find appropriate process mapping
    const processKey = `${metalType.toLowerCase()}, ${processStage.toLowerCase()}`;
    return mappings.processes[processKey] || null;
  }

  static generateProcessSpecificInventory(projectData, metalType) {
    const inventory = {
      processStages: [],
      materialBalance: {},
      energyBalance: {},
      emissionsSummary: {},
      dataQualityAssessment: {}
    };

    // Generate inventory for each process stage
    projectData.stages.forEach((stage, index) => {
      const processParams = this.getProcessParameters(metalType, stage.stageName.toUpperCase());
      const validation = this.validateParameters(processParams, metalType, stage.stageName);
      
      inventory.processStages.push({
        stageNumber: index + 1,
        stageName: stage.stageName,
        parameters: processParams,
        validation: validation,
        dataQuality: this.assessDataQuality(processParams),
        databaseMapping: this.getDatabaseMapping(metalType, stage.stageName)
      });
    });

    return inventory;
  }

  static assessDataQuality(parameters) {
    const assessment = {
      temporal: 'good', // Default assumption
      geographical: 'good', // India-specific data
      technological: 'good', // Current technology
      overall: 'good'
    };

    // More sophisticated assessment would analyze actual data sources
    return assessment;
  }
}

export default {
  PROCESS_SPECIFIC_PARAMETERS,
  DATABASE_MAPPINGS,
  PARAMETER_VALIDATION,
  ALLOCATION_METHODS,
  ProcessParameterService
};