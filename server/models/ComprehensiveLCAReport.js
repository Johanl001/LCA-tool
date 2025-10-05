import mongoose from 'mongoose';

// Comprehensive LCA Report Schema based on 12-point framework
const comprehensiveLCAReportSchema = new mongoose.Schema({
  projectId: { type: String, required: true, index: true },
  
  // 1. High-level modeling choices
  goalAndIntendedApplication: {
    goal: { type: String, required: true },
    functionalUnit: { type: String, required: true },
    systemBoundary: { 
      type: String, 
      enum: ['cradle-to-gate', 'cradle-to-grave', 'cradle-to-cradle'],
      required: true 
    },
    allocationMethod: { 
      type: String, 
      enum: ['mass', 'energy', 'economic', 'system-expansion'],
      default: 'economic'
    },
    lciaMethod: {
      method: { type: String, default: 'ReCiPe 2016' },
      midpoint: { type: Boolean, default: true },
      endpoint: { type: Boolean, default: true },
      gwpTimeframe: { type: Number, default: 100 } // GWP100
    }
  },

  // 2. Core inventory parameters
  inventoryParameters: {
    // A. General/material flow data
    generalData: {
      functionalUnit: { type: String, required: true },
      massFlow: {
        rawOre: { value: Number, unit: String }, // tonnes bauxite for Al
        refinedProduct: { value: Number, unit: String }, // alumina (Al2O3)
        metalProduced: { value: Number, unit: String },
        coProducts: [{ name: String, value: Number, unit: String }]
      },
      oreGrade: { 
        percentAl2O3: Number, // % Al2O3 for bauxite
        metalGrade: Number // metal grade for other metals
      },
      strippingRatio: {
        oreToWaste: Number, // m³ ore : m³ waste or t ore : t waste
        unit: String
      },
      recoveryYieldRates: {
        mining: { type: Number, min: 0, max: 100 },
        beneficiation: { type: Number, min: 0, max: 100 },
        refining: { type: Number, min: 0, max: 100 },
        smelting: { type: Number, min: 0, max: 100 },
        casting: { type: Number, min: 0, max: 100 }
      },
      productLifetime: { value: Number, unit: String } // for cradle-to-grave
    },

    // B. Energy & fuels
    energyAndFuels: {
      electricityConsumption: {
        mining: { value: Number, unit: String, acDc: String },
        beneficiation: { value: Number, unit: String, acDc: String },
        bayer: { value: Number, unit: String, acDc: String },
        smelting: { value: Number, unit: String, acDc: String },
        casting: { value: Number, unit: String, acDc: String },
        rolling: { value: Number, unit: String, acDc: String },
        total: { value: Number, unit: String }
      },
      fuelConsumption: {
        diesel: { value: Number, unit: String, use: String }, // mining haul
        heavyFuelOil: { value: Number, unit: String },
        naturalGas: { value: Number, unit: String },
        coal: { value: Number, unit: String, use: String }, // thermal heat
        lpg: { value: Number, unit: String },
        biomass: { value: Number, unit: String }
      },
      electricitySource: {
        gridEmissionFactor: { value: Number, unit: String }, // kgCO2e/kWh
        gridComposition: {
          coal: Number,
          gas: Number,
          hydro: Number,
          renewables: Number,
          nuclear: Number
        },
        ceaBaselineUsed: { type: Boolean, default: true },
        ceaVersion: String
      }
    },

    // C. Materials & chemicals
    materialsAndChemicals: {
      chemicalReagents: {
        causticSoda: { value: Number, unit: String }, // NaOH for Bayer
        lime: { value: Number, unit: String },
        sodaAsh: { value: Number, unit: String },
        fluorspar: { value: Number, unit: String }, // cryolite
        potlining: { value: Number, unit: String },
        carbonAnodes: { value: Number, unit: String },
        aluminaRefineryAux: [{ name: String, value: Number, unit: String }]
      },
      metallurgicalInputs: {
        cokeConsumption: { value: Number, unit: String }, // kg/t Al
        carbonAnodeConsumption: { value: Number, unit: String },
        additives: [{ name: String, value: Number, unit: String }],
        fluxes: [{ name: String, value: Number, unit: String }],
        lubricants: [{ name: String, value: Number, unit: String }]
      }
    },

    // D. Emissions & wastes
    emissionsAndWastes: {
      airEmissions: {
        co2: { value: Number, unit: String },
        pfcs: {
          cf4: { value: Number, unit: String },
          c2f6: { value: Number, unit: String }
        },
        nox: { value: Number, unit: String },
        sox: { value: Number, unit: String },
        particulateMatter: {
          pm10: { value: Number, unit: String },
          pm25: { value: Number, unit: String }
        },
        heavyMetals: {
          lead: { value: Number, unit: String },
          alParticulates: { value: Number, unit: String }
        }
      },
      waterEmissions: {
        bod: { value: Number, unit: String },
        cod: { value: Number, unit: String },
        tss: { value: Number, unit: String },
        ph: { value: Number, unit: String },
        heavyMetals: [{ metal: String, concentration: Number, unit: String }],
        dischargedVolume: { value: Number, unit: String }
      },
      solidWastes: {
        redMud: { value: Number, unit: String }, // Bayer process
        tailingsVolume: { value: Number, unit: String },
        tailingsComposition: [{ component: String, percentage: Number }],
        spentPotLining: { value: Number, unit: String }, // SPL
        slag: { value: Number, unit: String },
        mineWaste: { value: Number, unit: String }
      },
      landUse: {
        areaDisturbed: { value: Number, unit: String }, // hectares
        duration: { value: Number, unit: String }
      },
      transportEmissions: [{
        stage: String, // ore->alumina, alumina->smelter, etc.
        distance: { value: Number, unit: String },
        mode: { type: String, enum: ['truck', 'rail', 'ship'] },
        loadFactor: { value: Number, unit: String }, // t/km
        emissions: { value: Number, unit: String }
      }]
    },

    // E. End-of-life / recycling
    endOfLife: {
      collectionRate: { value: Number, unit: String }, // % collected after use
      recyclingRate: { value: Number, unit: String },
      recoveryEfficiency: { value: Number, unit: String },
      secondaryAluminumEnergy: { 
        value: Number, 
        unit: String,
        note: String // "95% less energy than primary"
      },
      energyForRecycling: { value: Number, unit: String },
      emissionsForRecycling: { value: Number, unit: String }
    },

    // F. Economic/social (optional)
    economicSocial: {
      marketPrices: [{ product: String, value: Number, currency: String }],
      employment: { value: Number, unit: String }, // person-hours per FU
      socialImpacts: [{ category: String, description: String }]
    }
  },

  // 3. Process-specific parameters (aluminum-focused)
  processSpecificParameters: {
    bauxiteMining: {
      oreType: String,
      strippingRatio: Number,
      dieselUsage: { value: Number, unit: String }, // L/t ore
      blastingExplosives: { value: Number, unit: String }, // kg
      haulDistance: { value: Number, unit: String } // km to plant
    },
    beneficiation: {
      grindingEnergy: { value: Number, unit: String }, // kWh/t
      waterUse: { value: Number, unit: String }, // m³/t
      reagents: [{ name: String, value: Number, unit: String }]
    },
    aluminaRefining: { // Bayer process
      naohConsumption: { value: Number, unit: String }, // kg/t alumina
      causticRecovery: { value: Number, unit: String }, // %
      redMudGeneration: { value: Number, unit: String }, // t/t alumina
      heat: { value: Number, unit: String }, // MJ per t alumina
      electricity: { value: Number, unit: String } // kWh per t alumina
    },
    smelting: { // Hall-Héroult process
      cellPowerIntensity: { value: Number, unit: String }, // kWh/t Al
      anodeConsumption: { value: Number, unit: String }, // kg/t
      pfcEmissions: { value: Number, unit: String }, // kg/t
      bathChemicals: [{ name: String, value: Number, unit: String }],
      dataSource: { type: String, default: 'IAI average' }
    },
    casting: {
      meltingEnergy: { value: Number, unit: String }, // MJ/t
      furnaceFuel: String,
      alloyingAdditions: [{ name: String, value: Number, unit: String }],
      heatTreatments: [{ name: String, energy: Number, unit: String }]
    },
    transportation: [{
      stage: String, // bauxite->alumina plant->smelter->casting->market
      distance: { value: Number, unit: String },
      mode: { type: String, enum: ['truck', 'rail', 'ship', 'pipeline'] }
    }]
  },

  // 4. Impact categories (minimum + advanced)
  impactCategories: {
    minimum: {
      climateChange: { value: Number, unit: String, method: String }, // kg CO2e
      acidificationPotential: { value: Number, unit: String },
      eutrophicationPotential: { value: Number, unit: String },
      humanToxicity: { value: Number, unit: String },
      particulateMatter: { value: Number, unit: String },
      resourceDepletion: { value: Number, unit: String },
      waterScarcity: { value: Number, unit: String }
    },
    advanced: {
      ozoneDepletion: { value: Number, unit: String },
      photochemicalOzoneFormation: { value: Number, unit: String },
      landUseImpacts: { value: Number, unit: String },
      ecosystemToxicity: { value: Number, unit: String },
      freshwaterEcotoxicity: { value: Number, unit: String }
    },
    characterizationMethod: { type: String, default: 'ReCiPe 2016' }
  },

  // 5. Data quality & uncertainty handling
  dataQuality: {
    temporalRepresentativeness: {
      dataYear: Number,
      within5Years: { type: Boolean, default: true },
      olderDataNote: String
    },
    geographicRepresentativeness: {
      country: { type: String, default: 'India' },
      region: String,
      state: String,
      gridFactorsUsed: String // India CEA
    },
    technologicalRepresentativeness: {
      plantSpecific: Boolean,
      industryAverage: Boolean,
      dataSource: { type: String, enum: ['IAI', 'GaBi', 'ecoinvent', 'company', 'literature'] }
    },
    completeness: {
      massCutoff: { value: { type: Number, default: 1 }, unit: { type: String, default: '%' } }, // %
      energyCutoff: { value: { type: Number, default: 0.5 }, unit: { type: String, default: '%' } }, // %
      justification: String
    },
    uncertaintyAnalysis: {
      monteCarloPerformed: { type: Boolean, default: false },
      iterations: Number,
      sensitivityParameters: [String],
      keyParametersUncertainty: [{
        parameter: String,
        uncertaintyRange: String,
        distribution: String
      }]
    },
    dataSourcesClassification: [{
      source: String,
      type: { type: String, enum: ['primary', 'secondary', 'literature', 'government'] },
      confidence: { type: String, enum: ['high', 'medium', 'low'] }
    }]
  },

  // 6. India-specific considerations
  indiaSpecific: {
    gridEmissionFactors: {
      ceaBaselineUsed: { type: Boolean, default: true },
      plantLevel: Boolean,
      weightedAverage: Boolean,
      emissionFactor: { value: Number, unit: String }, // kgCO2/kWh
      ceaVersion: String,
      citation: String
    },
    regulatoryStandards: {
      cpcbEmissionNorms: [{
        standard: String,
        value: Number,
        unit: String,
        compliance: Boolean
      }],
      cpcbEffluentNorms: [{
        parameter: String,
        limit: mongoose.Schema.Types.Mixed, // Can be Number or String for ranges like "5.5-9"
        unit: String,
        compliance: Boolean
      }],
      mineDischargeStandards: [String]
    },
    miningGovernance: {
      ibmRating: String, // Indian Bureau of Mines rating
      stateMiningRules: [String],
      landRehabilitationPractices: [String],
      sustainabilityPrograms: [String]
    },
    electricityMix: {
      thermalHeavy: { type: Boolean, default: true },
      captivePowerPrevalence: Number, // %
      plantSpecificRenewableShare: Number, // %
      impactOnSmelting: String
    },
    dataGapsAndProxies: [{
      parameter: String,
      proxyUsed: String,
      source: { type: String, enum: ['IAI', 'ecoinvent', 'GaBi'] },
      flaggedAsNonLocal: { type: Boolean, default: true },
      sensitivityRun: Boolean
    }]
  },

  // Metadata & provenance
  metadata: {
    dateOfModeling: { type: Date, default: Date.now },
    dataVintage: String, // "Data mostly 2020-2024"
    databases: [{
      name: String,
      version: String,
      citation: String
    }],
    companyVsLiteratureFlag: String,
    assumptionsList: [String],
    contactInfo: String,
    modelVersion: String
  },

  // Report generation timestamps and versions
  reportGeneration: {
    generatedAt: { type: Date, default: Date.now },
    reportVersion: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  }
}, {
  timestamps: true,
  collection: 'comprehensive_lca_reports'
});

// Indexes for performance
comprehensiveLCAReportSchema.index({ projectId: 1, userId: 1 });
comprehensiveLCAReportSchema.index({ 'reportGeneration.generatedAt': -1 });

const ComprehensiveLCAReport = mongoose.model('ComprehensiveLCAReport', comprehensiveLCAReportSchema);

export default ComprehensiveLCAReport;