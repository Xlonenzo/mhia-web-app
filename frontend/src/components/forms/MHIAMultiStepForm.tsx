import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Droplets, TrendingUp, Users, DollarSign, Settings, Play, ChevronLeft, ChevronRight, Check, Upload, HelpCircle } from 'lucide-react';
import {
  BasinCharacteristicsStep,
  AnthropoceneProjectionsStep,
  SocioeconomicParametersStep,
  ArtificialAquiferStep,
  EconomicAnalysisStep,
  CalibrationStep,
  ExecutionConfigurationStep
} from './MHIAStepComponents';

// Type definitions for all form data
interface ProjectConfig {
  simulationName: string;
  description: string;
  startDate: string;
  endDate: string;
  timeStep: 'daily' | 'monthly';
  outputDirectory: string;
  configurationMode: 'simplified' | 'detailed';
  includeAquifer: boolean;
  includeEconomicAnalysis: boolean;
  includeCalibration: boolean;
}

interface BasinCharacteristics {
  // Geographic
  basinArea: number;
  meanElevation: number;
  meanSlope: number;
  // Soil properties
  soilDepth: number;
  soilPorosity: number;
  hydraulicConductivity: number;
  // Land use distribution
  landUse: {
    forest: number;
    agricultural: number;
    urban: number;
    water: number;
  };
  // Climate baseline
  annualPrecipitation: number;
  meanTemperature: number;
  meanFlow: number;
  // Data files
  meteorologicalDataFile?: File;
  observedFlowFile?: File;
}

interface AnthropoceneConfig {
  climateScenario: 'RCP2.6' | 'RCP4.5' | 'RCP8.5';
  temperatureIncreaseRate: number;
  precipitationChangeRate: number;
  extremeIntensityFactor: number;
  temperatureThreshold: number;
  landUseChanges: {
    forestChangeRate: number;
    urbanChangeRate: number;
    agriculturalChangeRate: number;
    waterChangeRate: number;
  };
  forestThreshold: number;
  urbanThreshold: number;
  populationGrowthRate: number;
  gdpGrowthRate: number;
  waterDemandGrowthRate: number;
}

interface SocioeconomicConfig {
  currentPopulation: number;
  populationGrowthRate: number;
  perCapitaDemand: number;
  agriculturalDemand: number;
  industrialDemand: number;
  gdpPerCapita: number;
  waterPrice: number;
  governanceIndex: number;
  initialRiskPerception: number;
  initialMemory: number;
  memoryDecayRate: number;
  adaptationRate: number;
}

interface AquiferConfig {
  aquiferType: 'ASR' | 'MAR' | 'bank_filtration';
  storageCapacity: number;
  maxRechargeRate: number;
  maxRecoveryRate: number;
  recoveryEfficiency: number;
  hydraulicConductivity: number;
  porosity: number;
  aquiferThickness: number;
  aquiferArea: number;
  initialWaterLevel: number;
  nativeTDS: number;
  rechargeTDS: number;
  maxAcceptableTDS: number;
  operationMode: 'seasonal' | 'threshold';
  rechargeMonths: number[];
  recoveryMonths: number[];
  flowThresholds?: {
    rechargeMinFlow: number;
    recoveryMaxFlow: number;
  };
}

interface EconomicConfig {
  capex: {
    land: { area: number; unitCost: number };
    infrastructure: {
      intakeCapacity: number; intakeUnitCost: number;
      infiltrationArea: number; infiltrationUnitCost: number;
      recoveryCapacity: number; recoveryUnitCost: number;
      treatmentCapacity: number; treatmentUnitCost: number;
    };
    studies: number;
    contingency: number;
  };
  opex: {
    fixedAnnualCost: number;
    variableUnitCost: number;
    energyCost: number;
    laborCost: number;
    materialsPercent: number;
  };
  financial: {
    discountRate: number;
    projectLife: number;
    inflationRate: number;
    debtRatio: number;
    interestRate: number;
  };
  benefits: {
    waterSupplyValue: number;
    avoidedCosts: number;
    environmentalBenefits: number;
    floodProtectionValue: number;
  };
}

interface CalibrationConfig {
  observedData: {
    streamflowFile?: File;
    groundwaterFile?: File;
    calibrationStart: string;
    calibrationEnd: string;
    validationStart: string;
    validationEnd: string;
  };
  parameterRanges: {
    physical: {
      soilHydraulicConductivity: { min: number; max: number };
      soilPorosity: { min: number; max: number };
      runoffPartition: { min: number; max: number };
      baseflowRecession: { min: number; max: number };
    };
    socio: {
      memoryDecay: { min: number; max: number };
      memoryImpact: { min: number; max: number };
      adaptationRate: { min: number; max: number };
      conflictThreshold: { min: number; max: number };
    };
  };
  optimization: {
    algorithm: 'differential_evolution' | 'nelder_mead' | 'bfgs';
    maxIterations: number;
    tolerance: number;
    parallelProcesses: number;
    randomSeed: number;
  };
  metrics: ('NSE' | 'RMSE' | 'PBIAS' | 'KGE')[];
}

interface ExecutionConfig {
  modelComponents: {
    runAnthropocene: boolean;
    runPhysical: boolean;
    runSociohydrological: boolean;
    runArtificialAquifer: boolean;
    runEconomicAnalysis: boolean;
    applyAnthropoceneToPhysical: boolean;
    usePhysicalForSocio: boolean;
    useIntegratedForAquifer: boolean;
  };
  scenarioAnalysis?: {
    enabled: boolean;
    factors: {
      climate: { scenarios: ('RCP2.6' | 'RCP4.5' | 'RCP8.5')[]; extremeIntensity: number[] };
      landUse: { urbanRates: number[]; forestRates: number[] };
      socioeconomic: { populationGrowthRates: number[]; governanceIndices: number[] };
      intervention: { storageCapacities: number[]; recoveryEfficiencies: number[] };
    };
    kpis: string[];
    sustainabilityThresholds: { [kpi: string]: { min?: number; max?: number } };
    parallelExecution: boolean;
    maxScenarios: number;
  };
  outputs: {
    generateCharts: boolean;
    saveDetailedResults: boolean;
    saveIndicatorsOnly: boolean;
    exportFormats: ('CSV' | 'JSON' | 'Excel')[];
    chartTypes: ('timeseries' | 'water_balance' | 'scenarios' | 'economics')[];
  };
}

// Complete form data interface
interface MHIAFormData {
  project: ProjectConfig;
  basin: BasinCharacteristics;
  anthropocene: AnthropoceneConfig;
  socioeconomic: SocioeconomicConfig;
  aquifer: AquiferConfig;
  economic: EconomicConfig;
  calibration: CalibrationConfig;
  execution: ExecutionConfig;
}

// Form step definitions
const FORM_STEPS = [
  { id: 'project', title: 'Project Setup', icon: Settings, description: 'Basic simulation configuration' },
  { id: 'basin', title: 'Basin Characteristics', icon: MapPin, description: 'Physical basin and climate data' },
  { id: 'anthropocene', title: 'Future Projections', icon: TrendingUp, description: 'Climate change and land use scenarios' },
  { id: 'socioeconomic', title: 'Social Dynamics', icon: Users, description: 'Population and water demand parameters' },
  { id: 'aquifer', title: 'Artificial Aquifer', icon: Droplets, description: 'ASR/MAR system design (optional)' },
  { id: 'economic', title: 'Economic Analysis', icon: DollarSign, description: 'Financial feasibility assessment (optional)' },
  { id: 'calibration', title: 'Calibration', icon: Settings, description: 'Parameter optimization (optional)' },
  { id: 'execution', title: 'Run Configuration', icon: Play, description: 'Execution settings and scenario analysis' },
];

interface MHIAMultiStepFormProps {
  onSubmit: (data: MHIAFormData) => void;
  onSaveProgress?: (data: Partial<MHIAFormData>) => void;
  initialData?: Partial<MHIAFormData>;
  isLoading?: boolean;
}

const MHIAMultiStepForm: React.FC<MHIAMultiStepFormProps> = ({
  onSubmit,
  onSaveProgress,
  initialData,
  isLoading = false
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<MHIAFormData>({
    project: {
      simulationName: initialData?.project?.simulationName || 'MHIA_Simulation',
      description: initialData?.project?.description || '',
      startDate: initialData?.project?.startDate || '2023-01-01',
      endDate: initialData?.project?.endDate || '2023-12-31',
      timeStep: initialData?.project?.timeStep || 'daily',
      outputDirectory: initialData?.project?.outputDirectory || './outputs',
      configurationMode: initialData?.project?.configurationMode || 'simplified',
      includeAquifer: initialData?.project?.includeAquifer || false,
      includeEconomicAnalysis: initialData?.project?.includeEconomicAnalysis || false,
      includeCalibration: initialData?.project?.includeCalibration || false,
    },
    basin: {
      basinArea: initialData?.basin?.basinArea || 1000,
      meanElevation: initialData?.basin?.meanElevation || 500,
      meanSlope: initialData?.basin?.meanSlope || 5,
      soilDepth: initialData?.basin?.soilDepth || 2,
      soilPorosity: initialData?.basin?.soilPorosity || 0.4,
      hydraulicConductivity: initialData?.basin?.hydraulicConductivity || 0.5,
      landUse: {
        forest: initialData?.basin?.landUse?.forest || 30,
        agricultural: initialData?.basin?.landUse?.agricultural || 40,
        urban: initialData?.basin?.landUse?.urban || 20,
        water: initialData?.basin?.landUse?.water || 10,
      },
      annualPrecipitation: initialData?.basin?.annualPrecipitation || 1200,
      meanTemperature: initialData?.basin?.meanTemperature || 18,
      meanFlow: initialData?.basin?.meanFlow || 20,
    },
    anthropocene: {
      climateScenario: initialData?.anthropocene?.climateScenario || 'RCP4.5',
      temperatureIncreaseRate: initialData?.anthropocene?.temperatureIncreaseRate || 0.03,
      precipitationChangeRate: initialData?.anthropocene?.precipitationChangeRate || -0.003,
      extremeIntensityFactor: initialData?.anthropocene?.extremeIntensityFactor || 1.2,
      temperatureThreshold: initialData?.anthropocene?.temperatureThreshold || 2.0,
      landUseChanges: {
        forestChangeRate: initialData?.anthropocene?.landUseChanges?.forestChangeRate || -0.005,
        urbanChangeRate: initialData?.anthropocene?.landUseChanges?.urbanChangeRate || 0.007,
        agriculturalChangeRate: initialData?.anthropocene?.landUseChanges?.agriculturalChangeRate || -0.002,
        waterChangeRate: initialData?.anthropocene?.landUseChanges?.waterChangeRate || 0,
      },
      forestThreshold: initialData?.anthropocene?.forestThreshold || 15,
      urbanThreshold: initialData?.anthropocene?.urbanThreshold || 40,
      populationGrowthRate: initialData?.anthropocene?.populationGrowthRate || 1.5,
      gdpGrowthRate: initialData?.anthropocene?.gdpGrowthRate || 2.5,
      waterDemandGrowthRate: initialData?.anthropocene?.waterDemandGrowthRate || 0.5,
    },
    socioeconomic: {
      currentPopulation: initialData?.socioeconomic?.currentPopulation || 100000,
      populationGrowthRate: initialData?.socioeconomic?.populationGrowthRate || 1.5,
      perCapitaDemand: initialData?.socioeconomic?.perCapitaDemand || 150,
      agriculturalDemand: initialData?.socioeconomic?.agriculturalDemand || 12000,
      industrialDemand: initialData?.socioeconomic?.industrialDemand || 7500,
      gdpPerCapita: initialData?.socioeconomic?.gdpPerCapita || 10000,
      waterPrice: initialData?.socioeconomic?.waterPrice || 0.5,
      governanceIndex: initialData?.socioeconomic?.governanceIndex || 0.6,
      initialRiskPerception: initialData?.socioeconomic?.initialRiskPerception || 0.3,
      initialMemory: initialData?.socioeconomic?.initialMemory || 0.2,
      memoryDecayRate: initialData?.socioeconomic?.memoryDecayRate || 0.9,
      adaptationRate: initialData?.socioeconomic?.adaptationRate || 0.1,
    },
    aquifer: {
      aquiferType: initialData?.aquifer?.aquiferType || 'ASR',
      storageCapacity: initialData?.aquifer?.storageCapacity || 500000,
      maxRechargeRate: initialData?.aquifer?.maxRechargeRate || 5000,
      maxRecoveryRate: initialData?.aquifer?.maxRecoveryRate || 4000,
      recoveryEfficiency: initialData?.aquifer?.recoveryEfficiency || 80,
      hydraulicConductivity: initialData?.aquifer?.hydraulicConductivity || 5,
      porosity: initialData?.aquifer?.porosity || 0.2,
      aquiferThickness: initialData?.aquifer?.aquiferThickness || 50,
      aquiferArea: initialData?.aquifer?.aquiferArea || 10000000,
      initialWaterLevel: initialData?.aquifer?.initialWaterLevel || 10,
      nativeTDS: initialData?.aquifer?.nativeTDS || 500,
      rechargeTDS: initialData?.aquifer?.rechargeTDS || 250,
      maxAcceptableTDS: initialData?.aquifer?.maxAcceptableTDS || 1000,
      operationMode: initialData?.aquifer?.operationMode || 'seasonal',
      rechargeMonths: initialData?.aquifer?.rechargeMonths || [1, 2, 3, 4, 12],
      recoveryMonths: initialData?.aquifer?.recoveryMonths || [6, 7, 8, 9],
      flowThresholds: initialData?.aquifer?.flowThresholds || {
        rechargeMinFlow: 15,
        recoveryMaxFlow: 10,
      },
    },
    economic: {
      capex: {
        land: { 
          area: initialData?.economic?.capex?.land?.area || 10,
          unitCost: initialData?.economic?.capex?.land?.unitCost || 50000 
        },
        infrastructure: {
          intakeCapacity: initialData?.economic?.capex?.infrastructure?.intakeCapacity || 5000,
          intakeUnitCost: initialData?.economic?.capex?.infrastructure?.intakeUnitCost || 1000,
          infiltrationArea: initialData?.economic?.capex?.infrastructure?.infiltrationArea || 5000,
          infiltrationUnitCost: initialData?.economic?.capex?.infrastructure?.infiltrationUnitCost || 200,
          recoveryCapacity: initialData?.economic?.capex?.infrastructure?.recoveryCapacity || 4000,
          recoveryUnitCost: initialData?.economic?.capex?.infrastructure?.recoveryUnitCost || 1200,
          treatmentCapacity: initialData?.economic?.capex?.infrastructure?.treatmentCapacity || 4000,
          treatmentUnitCost: initialData?.economic?.capex?.infrastructure?.treatmentUnitCost || 800,
        },
        studies: initialData?.economic?.capex?.studies || 500000,
        contingency: initialData?.economic?.capex?.contingency || 15,
      },
      opex: {
        fixedAnnualCost: initialData?.economic?.opex?.fixedAnnualCost || 200000,
        variableUnitCost: initialData?.economic?.opex?.variableUnitCost || 0.1,
        energyCost: initialData?.economic?.opex?.energyCost || 0.12,
        laborCost: initialData?.economic?.opex?.laborCost || 150000,
        materialsPercent: initialData?.economic?.opex?.materialsPercent || 2,
      },
      financial: {
        discountRate: initialData?.economic?.financial?.discountRate || 6,
        projectLife: initialData?.economic?.financial?.projectLife || 30,
        inflationRate: initialData?.economic?.financial?.inflationRate || 2.5,
        debtRatio: initialData?.economic?.financial?.debtRatio || 70,
        interestRate: initialData?.economic?.financial?.interestRate || 5,
      },
      benefits: {
        waterSupplyValue: initialData?.economic?.benefits?.waterSupplyValue || 1.5,
        avoidedCosts: initialData?.economic?.benefits?.avoidedCosts || 100000,
        environmentalBenefits: initialData?.economic?.benefits?.environmentalBenefits || 50000,
        floodProtectionValue: initialData?.economic?.benefits?.floodProtectionValue || 25000,
      },
    },
    calibration: {
      observedData: {
        calibrationStart: initialData?.calibration?.observedData?.calibrationStart || '2020-01-01',
        calibrationEnd: initialData?.calibration?.observedData?.calibrationEnd || '2022-12-31',
        validationStart: initialData?.calibration?.observedData?.validationStart || '2023-01-01',
        validationEnd: initialData?.calibration?.observedData?.validationEnd || '2023-12-31',
      },
      parameterRanges: {
        physical: {
          soilHydraulicConductivity: { min: 0.1, max: 10.0 },
          soilPorosity: { min: 0.2, max: 0.6 },
          runoffPartition: { min: 0.1, max: 0.9 },
          baseflowRecession: { min: 0.85, max: 0.99 },
        },
        socio: {
          memoryDecay: { min: 0.8, max: 0.99 },
          memoryImpact: { min: 0.5, max: 5.0 },
          adaptationRate: { min: 0.01, max: 0.5 },
          conflictThreshold: { min: 0.5, max: 2.0 },
        },
      },
      optimization: {
        algorithm: initialData?.calibration?.optimization?.algorithm || 'differential_evolution',
        maxIterations: initialData?.calibration?.optimization?.maxIterations || 1000,
        tolerance: initialData?.calibration?.optimization?.tolerance || 0.001,
        parallelProcesses: initialData?.calibration?.optimization?.parallelProcesses || 4,
        randomSeed: initialData?.calibration?.optimization?.randomSeed || 42,
      },
      metrics: initialData?.calibration?.metrics || ['NSE', 'RMSE', 'PBIAS'],
    },
    execution: {
      modelComponents: {
        runAnthropocene: initialData?.execution?.modelComponents?.runAnthropocene ?? true,
        runPhysical: initialData?.execution?.modelComponents?.runPhysical ?? true,
        runSociohydrological: initialData?.execution?.modelComponents?.runSociohydrological ?? true,
        runArtificialAquifer: initialData?.execution?.modelComponents?.runArtificialAquifer ?? false,
        runEconomicAnalysis: initialData?.execution?.modelComponents?.runEconomicAnalysis ?? false,
        applyAnthropoceneToPhysical: initialData?.execution?.modelComponents?.applyAnthropoceneToPhysical ?? true,
        usePhysicalForSocio: initialData?.execution?.modelComponents?.usePhysicalForSocio ?? true,
        useIntegratedForAquifer: initialData?.execution?.modelComponents?.useIntegratedForAquifer ?? true,
      },
      outputs: {
        generateCharts: initialData?.execution?.outputs?.generateCharts ?? true,
        saveDetailedResults: initialData?.execution?.outputs?.saveDetailedResults ?? true,
        saveIndicatorsOnly: initialData?.execution?.outputs?.saveIndicatorsOnly ?? false,
        exportFormats: initialData?.execution?.outputs?.exportFormats || ['CSV', 'JSON'],
        chartTypes: initialData?.execution?.outputs?.chartTypes || ['timeseries', 'water_balance', 'scenarios'],
      },
    },
  });

  // Auto-save progress
  useEffect(() => {
    if (onSaveProgress) {
      onSaveProgress(formData);
    }
  }, [formData, onSaveProgress]);

  const updateFormData = (section: keyof MHIAFormData, data: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }));
  };

  const nextStep = () => {
    if (currentStep < FORM_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepComplete = (stepIndex: number): boolean => {
    // Basic validation logic for step completion
    switch (stepIndex) {
      case 0: return formData.project.simulationName.length > 0;
      case 1: return formData.basin.basinArea > 0;
      case 2: return true; // Anthropocene always valid with defaults
      case 3: return formData.socioeconomic.currentPopulation > 0;
      case 4: return !formData.project.includeAquifer || formData.aquifer.storageCapacity > 0;
      case 5: return !formData.project.includeEconomicAnalysis || formData.economic.capex.land.area > 0;
      case 6: return !formData.project.includeCalibration || formData.calibration.observedData.calibrationStart.length > 0;
      case 7: return true; // Execution always valid with defaults
      default: return false;
    }
  };

  const shouldShowStep = (stepIndex: number): boolean => {
    switch (stepIndex) {
      case 4: return formData.project.includeAquifer;
      case 5: return formData.project.includeEconomicAnalysis;
      case 6: return formData.project.includeCalibration;
      default: return true;
    }
  };

  const getVisibleSteps = () => {
    return FORM_STEPS.filter((_, index) => shouldShowStep(index));
  };

  const getCurrentVisibleStepIndex = () => {
    const visibleSteps = getVisibleSteps();
    return visibleSteps.findIndex((_, index) => FORM_STEPS.findIndex(step => step.id === visibleSteps[index].id) === currentStep);
  };

  const goToNextVisibleStep = () => {
    const nextIndex = currentStep + 1;
    for (let i = nextIndex; i < FORM_STEPS.length; i++) {
      if (shouldShowStep(i)) {
        setCurrentStep(i);
        break;
      }
    }
  };

  const goToPrevVisibleStep = () => {
    const prevIndex = currentStep - 1;
    for (let i = prevIndex; i >= 0; i--) {
      if (shouldShowStep(i)) {
        setCurrentStep(i);
        break;
      }
    }
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-slate-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-4">
              MHIA Model Configuration
            </h1>
            <p className="text-gray-300 text-lg">
              Integrated Hydrological Model for the Anthropocene - Comprehensive Setup
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex justify-between items-center overflow-x-auto pb-4">
              {getVisibleSteps().map((step, index) => {
                const stepIndex = FORM_STEPS.findIndex(s => s.id === step.id);
                const isActive = stepIndex === currentStep;
                const isCompleted = isStepComplete(stepIndex);
                const Icon = step.icon;

                return (
                  <div
                    key={step.id}
                    className={`flex flex-col items-center min-w-0 flex-1 cursor-pointer transition-all duration-200 ${
                      isActive ? 'scale-110' : 'hover:scale-105'
                    }`}
                    onClick={() => setCurrentStep(stepIndex)}
                  >
                    <div className={`
                      w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-200
                      ${isActive 
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/25' 
                        : isCompleted 
                        ? 'bg-green-500 shadow-lg shadow-green-500/25' 
                        : 'bg-slate-700 border border-slate-600'
                      }
                    `}>
                      {isCompleted && !isActive ? (
                        <Check className="w-6 h-6 text-white" />
                      ) : (
                        <Icon className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div className="text-center">
                      <div className={`text-sm font-medium ${isActive ? 'text-cyan-400' : isCompleted ? 'text-green-400' : 'text-gray-400'}`}>
                        {step.title}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 max-w-24 truncate">
                        {step.description}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Content */}
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-8 mb-8">
            {/* Step 1: Project Configuration */}
            {currentStep === 0 && (
              <ProjectConfigurationStep 
                data={formData.project} 
                onChange={(data) => updateFormData('project', data)}
              />
            )}

            {/* Step 2: Basin Characteristics */}
            {currentStep === 1 && (
              <BasinCharacteristicsStep 
                data={formData.basin} 
                onChange={(data) => updateFormData('basin', data)}
              />
            )}

            {/* Step 3: Anthropocene Projections */}
            {currentStep === 2 && (
              <AnthropoceneProjectionsStep 
                data={formData.anthropocene} 
                onChange={(data) => updateFormData('anthropocene', data)}
              />
            )}

            {/* Step 4: Socioeconomic Parameters */}
            {currentStep === 3 && (
              <SocioeconomicParametersStep 
                data={formData.socioeconomic} 
                onChange={(data) => updateFormData('socioeconomic', data)}
              />
            )}

            {/* Step 5: Artificial Aquifer (Optional) */}
            {currentStep === 4 && formData.project.includeAquifer && (
              <ArtificialAquiferStep 
                data={formData.aquifer} 
                onChange={(data) => updateFormData('aquifer', data)}
              />
            )}

            {/* Step 6: Economic Analysis (Optional) */}
            {currentStep === 5 && formData.project.includeEconomicAnalysis && (
              <EconomicAnalysisStep 
                data={formData.economic} 
                onChange={(data) => updateFormData('economic', data)}
              />
            )}

            {/* Step 7: Calibration (Optional) */}
            {currentStep === 6 && formData.project.includeCalibration && (
              <CalibrationStep 
                data={formData.calibration} 
                onChange={(data) => updateFormData('calibration', data)}
              />
            )}

            {/* Step 8: Execution Configuration */}
            {currentStep === 7 && (
              <ExecutionConfigurationStep 
                data={formData.execution} 
                projectConfig={formData.project}
                onChange={(data) => updateFormData('execution', data)}
              />
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center">
            <button
              onClick={goToPrevVisibleStep}
              disabled={currentStep === 0}
              className={`
                flex items-center px-6 py-3 rounded-lg font-semibold transition-all duration-200
                ${currentStep === 0
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-600 hover:bg-slate-500 text-white'
                }
              `}
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              Previous
            </button>

            <div className="flex space-x-4">
              {currentStep === FORM_STEPS.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex items-center px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      Run MHIA Model
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={goToNextVisibleStep}
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-lg font-semibold transition-all duration-200"
                >
                  Next
                  <ChevronRight className="w-5 h-5 ml-2" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Individual Step Components (will be implemented in separate files for modularity)
const ProjectConfigurationStep: React.FC<{
  data: ProjectConfig;
  onChange: (data: Partial<ProjectConfig>) => void;
}> = ({ data, onChange }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <Settings className="w-8 h-8 text-blue-400 mr-3" />
        <div>
          <h2 className="text-2xl font-bold text-white">Project Configuration</h2>
          <p className="text-gray-400">Set up basic simulation parameters and optional components</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Simulation Name */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Simulation Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={data.simulationName}
            onChange={(e) => onChange({ simulationName: e.target.value })}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
            placeholder="Enter simulation name"
            required
          />
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={data.description}
            onChange={(e) => onChange({ description: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
            placeholder="Describe the simulation objectives and scope"
          />
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Start Date <span className="text-red-400">*</span>
          </label>
          <input
            type="date"
            value={data.startDate}
            onChange={(e) => onChange({ startDate: e.target.value })}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-400"
            required
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            End Date <span className="text-red-400">*</span>
          </label>
          <input
            type="date"
            value={data.endDate}
            onChange={(e) => onChange({ endDate: e.target.value })}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-400"
            required
          />
        </div>

        {/* Time Step */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Time Step
          </label>
          <select
            value={data.timeStep}
            onChange={(e) => onChange({ timeStep: e.target.value as 'daily' | 'monthly' })}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-400"
          >
            <option value="daily">Daily</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        {/* Configuration Mode */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Configuration Mode
          </label>
          <select
            value={data.configurationMode}
            onChange={(e) => onChange({ configurationMode: e.target.value as 'simplified' | 'detailed' })}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-400"
          >
            <option value="simplified">Simplified</option>
            <option value="detailed">Detailed</option>
          </select>
        </div>

        {/* Output Directory */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Output Directory
          </label>
          <input
            type="text"
            value={data.outputDirectory}
            onChange={(e) => onChange({ outputDirectory: e.target.value })}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
            placeholder="./outputs"
          />
        </div>

        {/* Optional Components */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-300 mb-4">
            Optional Model Components
          </label>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={data.includeAquifer}
                onChange={(e) => onChange({ includeAquifer: e.target.checked })}
                className="mr-3 w-4 h-4 text-blue-500 bg-slate-700 border-slate-600 rounded focus:ring-blue-400"
              />
              <span className="text-gray-300">Include Artificial Aquifer Model</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={data.includeEconomicAnalysis}
                onChange={(e) => onChange({ includeEconomicAnalysis: e.target.checked })}
                className="mr-3 w-4 h-4 text-blue-500 bg-slate-700 border-slate-600 rounded focus:ring-blue-400"
              />
              <span className="text-gray-300">Include Economic Feasibility Analysis</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={data.includeCalibration}
                onChange={(e) => onChange({ includeCalibration: e.target.checked })}
                className="mr-3 w-4 h-4 text-blue-500 bg-slate-700 border-slate-600 rounded focus:ring-blue-400"
              />
              <span className="text-gray-300">Include Model Calibration</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MHIAMultiStepForm;