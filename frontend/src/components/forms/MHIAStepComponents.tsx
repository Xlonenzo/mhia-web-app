import React from 'react';
import { MapPin, TrendingUp, Users, Droplets, DollarSign, Settings, Upload, Calendar } from 'lucide-react';

// Basin Characteristics Step
export const BasinCharacteristicsStep: React.FC<{
  data: any;
  onChange: (data: any) => void;
}> = ({ data, onChange }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <MapPin className="w-8 h-8 text-green-400 mr-3" />
        <div>
          <h2 className="text-2xl font-bold text-white">Basin Characteristics</h2>
          <p className="text-gray-400">Physical basin properties and meteorological data</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basin Area */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Basin Area (km²) <span className="text-red-400">*</span>
          </label>
          <input
            type="number"
            value={data.basinArea}
            onChange={(e) => onChange({ basinArea: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-green-400"
            placeholder="1000"
            required
          />
        </div>

        {/* Mean Elevation */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Mean Elevation (m)
          </label>
          <input
            type="number"
            value={data.meanElevation}
            onChange={(e) => onChange({ meanElevation: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-green-400"
            placeholder="500"
          />
        </div>

        {/* Land Use Distribution */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-300 mb-4">
            Land Use Distribution (%)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Forest</label>
              <input
                type="number"
                value={data.landUse.forest}
                onChange={(e) => onChange({ 
                  landUse: { ...data.landUse, forest: parseFloat(e.target.value) || 0 }
                })}
                className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-green-400"
                min="0" max="100"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Agricultural</label>
              <input
                type="number"
                value={data.landUse.agricultural}
                onChange={(e) => onChange({ 
                  landUse: { ...data.landUse, agricultural: parseFloat(e.target.value) || 0 }
                })}
                className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-green-400"
                min="0" max="100"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Urban</label>
              <input
                type="number"
                value={data.landUse.urban}
                onChange={(e) => onChange({ 
                  landUse: { ...data.landUse, urban: parseFloat(e.target.value) || 0 }
                })}
                className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-green-400"
                min="0" max="100"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Water</label>
              <input
                type="number"
                value={data.landUse.water}
                onChange={(e) => onChange({ 
                  landUse: { ...data.landUse, water: parseFloat(e.target.value) || 0 }
                })}
                className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-green-400"
                min="0" max="100"
              />
            </div>
          </div>
        </div>

        {/* Climate Data */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Annual Precipitation (mm)
          </label>
          <input
            type="number"
            value={data.annualPrecipitation}
            onChange={(e) => onChange({ annualPrecipitation: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-green-400"
            placeholder="1200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Mean Temperature (°C)
          </label>
          <input
            type="number"
            step="0.1"
            value={data.meanTemperature}
            onChange={(e) => onChange({ meanTemperature: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-green-400"
            placeholder="18"
          />
        </div>
      </div>
    </div>
  );
};

// Anthropocene Projections Step
export const AnthropoceneProjectionsStep: React.FC<{
  data: any;
  onChange: (data: any) => void;
}> = ({ data, onChange }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <TrendingUp className="w-8 h-8 text-orange-400 mr-3" />
        <div>
          <h2 className="text-2xl font-bold text-white">Future Projections</h2>
          <p className="text-gray-400">Climate change scenarios and land use transformations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Climate Scenario */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Climate Scenario <span className="text-red-400">*</span>
          </label>
          <select
            value={data.climateScenario}
            onChange={(e) => onChange({ climateScenario: e.target.value })}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-orange-400"
            required
          >
            <option value="RCP2.6">RCP2.6 (Strong Mitigation)</option>
            <option value="RCP4.5">RCP4.5 (Moderate Mitigation)</option>
            <option value="RCP8.5">RCP8.5 (High Emissions)</option>
          </select>
        </div>

        {/* Temperature Increase Rate */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Temperature Increase Rate (°C/year)
          </label>
          <input
            type="number"
            step="0.001"
            value={data.temperatureIncreaseRate}
            onChange={(e) => onChange({ temperatureIncreaseRate: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-orange-400"
            placeholder="0.03"
          />
        </div>

        {/* Precipitation Change Rate */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Precipitation Change Rate (%/year)
          </label>
          <input
            type="number"
            step="0.001"
            value={data.precipitationChangeRate}
            onChange={(e) => onChange({ precipitationChangeRate: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-orange-400"
            placeholder="-0.003"
          />
        </div>

        {/* Land Use Changes */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Forest Change Rate (%/year)
          </label>
          <input
            type="number"
            step="0.001"
            value={data.landUseChanges.forestChangeRate}
            onChange={(e) => onChange({ 
              landUseChanges: { 
                ...data.landUseChanges, 
                forestChangeRate: parseFloat(e.target.value) || 0 
              }
            })}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-orange-400"
            placeholder="-0.005"
          />
        </div>
      </div>
    </div>
  );
};

// Socioeconomic Parameters Step
export const SocioeconomicParametersStep: React.FC<{
  data: any;
  onChange: (data: any) => void;
}> = ({ data, onChange }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <Users className="w-8 h-8 text-blue-400 mr-3" />
        <div>
          <h2 className="text-2xl font-bold text-white">Social Dynamics</h2>
          <p className="text-gray-400">Population, water demand, and governance parameters</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Population */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Current Population <span className="text-red-400">*</span>
          </label>
          <input
            type="number"
            value={data.currentPopulation}
            onChange={(e) => onChange({ currentPopulation: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-400"
            placeholder="100000"
            required
          />
        </div>

        {/* Population Growth Rate */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Population Growth Rate (%/year)
          </label>
          <input
            type="number"
            step="0.1"
            value={data.populationGrowthRate}
            onChange={(e) => onChange({ populationGrowthRate: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-400"
            placeholder="1.5"
          />
        </div>

        {/* Per Capita Demand */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Per Capita Water Demand (L/day)
          </label>
          <input
            type="number"
            value={data.perCapitaDemand}
            onChange={(e) => onChange({ perCapitaDemand: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-400"
            placeholder="150"
          />
        </div>

        {/* Governance Index */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Governance Index (0-1)
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="1"
            value={data.governanceIndex}
            onChange={(e) => onChange({ governanceIndex: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-400"
            placeholder="0.6"
          />
        </div>
      </div>
    </div>
  );
};

// Artificial Aquifer System Configuration
export const ArtificialAquiferStep: React.FC<{ data: any; onChange: (data: any) => void }> = ({ data, onChange }) => (
  <div className="space-y-6">
    <div className="flex items-center mb-6">
      <Droplets className="w-8 h-8 text-cyan-400 mr-3" />
      <div>
        <h2 className="text-2xl font-bold text-white">Artificial Aquifer System</h2>
        <p className="text-gray-400">ASR/MAR system design and configuration</p>
      </div>
    </div>

    {/* System Type and Capacity */}
    <div className="bg-slate-700/50 rounded-lg p-6 space-y-6">
      <h3 className="text-lg font-semibold text-white mb-4">System Configuration</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Aquifer Type */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Aquifer Type <span className="text-red-400">*</span>
          </label>
          <select
            value={data.aquiferType || 'ASR'}
            onChange={(e) => onChange({ aquiferType: e.target.value })}
            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:border-cyan-400"
          >
            <option value="ASR">ASR - Aquifer Storage Recovery</option>
            <option value="MAR">MAR - Managed Aquifer Recharge</option>
            <option value="bank_filtration">Bank Filtration</option>
          </select>
        </div>

        {/* Storage Capacity */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Storage Capacity (thousand m³) <span className="text-red-400">*</span>
          </label>
          <input
            type="number"
            value={data.storageCapacity || 1000}
            onChange={(e) => onChange({ storageCapacity: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:border-cyan-400"
            placeholder="1000"
            min="0"
          />
        </div>

        {/* Max Recharge Rate */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Max Recharge Rate (m³/day)
          </label>
          <input
            type="number"
            value={data.maxRechargeRate || 10000}
            onChange={(e) => onChange({ maxRechargeRate: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:border-cyan-400"
            placeholder="10000"
            min="0"
          />
        </div>

        {/* Max Recovery Rate */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Max Recovery Rate (m³/day)
          </label>
          <input
            type="number"
            value={data.maxRecoveryRate || 8000}
            onChange={(e) => onChange({ maxRecoveryRate: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:border-cyan-400"
            placeholder="8000"
            min="0"
          />
        </div>

        {/* Recovery Efficiency */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Recovery Efficiency (%)
          </label>
          <input
            type="number"
            value={data.recoveryEfficiency || 80}
            onChange={(e) => onChange({ recoveryEfficiency: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:border-cyan-400"
            placeholder="80"
            min="0" max="100"
          />
        </div>

        {/* Aquifer Area */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Aquifer Area (km²)
          </label>
          <input
            type="number"
            value={data.aquiferArea || 10}
            onChange={(e) => onChange({ aquiferArea: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:border-cyan-400"
            placeholder="10"
            min="0"
          />
        </div>
      </div>
    </div>

    {/* Hydrogeological Properties */}
    <div className="bg-slate-700/50 rounded-lg p-6 space-y-6">
      <h3 className="text-lg font-semibold text-white mb-4">Hydrogeological Properties</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Hydraulic Conductivity (m/day)
          </label>
          <input
            type="number"
            value={data.hydraulicConductivity || 5}
            onChange={(e) => onChange({ hydraulicConductivity: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:border-cyan-400"
            placeholder="5"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Porosity
          </label>
          <input
            type="number"
            value={data.porosity || 0.2}
            onChange={(e) => onChange({ porosity: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:border-cyan-400"
            placeholder="0.2"
            min="0" max="1" step="0.01"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Aquifer Thickness (m)
          </label>
          <input
            type="number"
            value={data.aquiferThickness || 50}
            onChange={(e) => onChange({ aquiferThickness: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:border-cyan-400"
            placeholder="50"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Initial Water Level (m below surface)
          </label>
          <input
            type="number"
            value={data.initialWaterLevel || 10}
            onChange={(e) => onChange({ initialWaterLevel: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:border-cyan-400"
            placeholder="10"
            min="0"
          />
        </div>
      </div>
    </div>

    {/* Water Quality Parameters */}
    <div className="bg-slate-700/50 rounded-lg p-6 space-y-6">
      <h3 className="text-lg font-semibold text-white mb-4">Water Quality Parameters</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Native Water TDS (mg/L)
          </label>
          <input
            type="number"
            value={data.nativeTDS || 500}
            onChange={(e) => onChange({ nativeTDS: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:border-cyan-400"
            placeholder="500"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Recharge Water TDS (mg/L)
          </label>
          <input
            type="number"
            value={data.rechargeTDS || 250}
            onChange={(e) => onChange({ rechargeTDS: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:border-cyan-400"
            placeholder="250"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Max Acceptable TDS (mg/L)
          </label>
          <input
            type="number"
            value={data.maxAcceptableTDS || 1000}
            onChange={(e) => onChange({ maxAcceptableTDS: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:border-cyan-400"
            placeholder="1000"
            min="0"
          />
        </div>
      </div>
    </div>

    {/* Operation Rules */}
    <div className="bg-slate-700/50 rounded-lg p-6 space-y-6">
      <h3 className="text-lg font-semibold text-white mb-4">Operation Rules</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Operation Mode
          </label>
          <select
            value={data.operationMode || 'seasonal'}
            onChange={(e) => onChange({ operationMode: e.target.value })}
            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:border-cyan-400"
          >
            <option value="seasonal">Seasonal Operation</option>
            <option value="threshold">Threshold-based Operation</option>
          </select>
        </div>

        {(data.operationMode === 'seasonal' || !data.operationMode) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Recharge Months (comma-separated)
              </label>
              <input
                type="text"
                value={data.rechargeMonths || '1,2,3,4,12'}
                onChange={(e) => onChange({ rechargeMonths: e.target.value })}
                className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                placeholder="1,2,3,4,12"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Recovery Months (comma-separated)
              </label>
              <input
                type="text"
                value={data.recoveryMonths || '6,7,8,9'}
                onChange={(e) => onChange({ recoveryMonths: e.target.value })}
                className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                placeholder="6,7,8,9"
              />
            </div>
          </div>
        )}

        {data.operationMode === 'threshold' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Flow Recharge Threshold (m³/day)
              </label>
              <input
                type="number"
                value={data.flowRechargeThreshold || 25000}
                onChange={(e) => onChange({ flowRechargeThreshold: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                placeholder="25000"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Flow Recovery Threshold (m³/day)
              </label>
              <input
                type="number"
                value={data.flowRecoveryThreshold || 10000}
                onChange={(e) => onChange({ flowRecoveryThreshold: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                placeholder="10000"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Demand Recovery Threshold (%)
              </label>
              <input
                type="number"
                value={data.demandRecoveryThreshold || 120}
                onChange={(e) => onChange({ demandRecoveryThreshold: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                placeholder="120"
                min="0"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);

export const EconomicAnalysisStep: React.FC<{ data: any; onChange: (data: any) => void }> = ({ data, onChange }) => (
  <div className="space-y-6">
    <div className="flex items-center mb-6">
      <DollarSign className="w-8 h-8 text-green-400 mr-3" />
      <div>
        <h2 className="text-2xl font-bold text-white">Economic Analysis</h2>
        <p className="text-gray-400">Financial feasibility and cost-benefit analysis</p>
      </div>
    </div>

    {/* Capital Expenditure (CAPEX) */}
    <div className="bg-slate-700/50 rounded-lg p-6 space-y-6">
      <h3 className="text-lg font-semibold text-white mb-4">Capital Expenditure (CAPEX)</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Infrastructure Costs */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Infrastructure Construction (USD) <span className="text-red-400">*</span>
          </label>
          <input
            type="number"
            value={data.capex?.infrastructureCost || 2500000}
            onChange={(e) => onChange({ 
              capex: { ...data.capex, infrastructureCost: parseFloat(e.target.value) || 0 }
            })}
            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:border-green-400"
            placeholder="2500000"
            min="0"
          />
        </div>

        {/* Equipment Costs */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Equipment & Machinery (USD)
          </label>
          <input
            type="number"
            value={data.capex?.equipmentCost || 800000}
            onChange={(e) => onChange({ 
              capex: { ...data.capex, equipmentCost: parseFloat(e.target.value) || 0 }
            })}
            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:border-green-400"
            placeholder="800000"
            min="0"
          />
        </div>

        {/* Land Acquisition */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Land Acquisition (USD)
          </label>
          <input
            type="number"
            value={data.capex?.landCost || 300000}
            onChange={(e) => onChange({ 
              capex: { ...data.capex, landCost: parseFloat(e.target.value) || 0 }
            })}
            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:border-green-400"
            placeholder="300000"
            min="0"
          />
        </div>

        {/* Engineering & Design */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Engineering & Design (USD)
          </label>
          <input
            type="number"
            value={data.capex?.engineeringCost || 450000}
            onChange={(e) => onChange({ 
              capex: { ...data.capex, engineeringCost: parseFloat(e.target.value) || 0 }
            })}
            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:border-green-400"
            placeholder="450000"
            min="0"
          />
        </div>

        {/* Permitting & Legal */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Permitting & Legal (USD)
          </label>
          <input
            type="number"
            value={data.capex?.permittingCost || 150000}
            onChange={(e) => onChange({ 
              capex: { ...data.capex, permittingCost: parseFloat(e.target.value) || 0 }
            })}
            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:border-green-400"
            placeholder="150000"
            min="0"
          />
        </div>

        {/* Contingency */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Contingency (% of total CAPEX)
          </label>
          <input
            type="number"
            value={data.capex?.contingencyPercent || 15}
            onChange={(e) => onChange({ 
              capex: { ...data.capex, contingencyPercent: parseFloat(e.target.value) || 0 }
            })}
            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:border-green-400"
            placeholder="15"
            min="0" max="50"
          />
        </div>
      </div>
    </div>

    {/* Operating Expenditure (OPEX) */}
    <div className="bg-slate-700/50 rounded-lg p-6 space-y-6">
      <h3 className="text-lg font-semibold text-white mb-4">Operating Expenditure (OPEX) - Annual</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personnel Costs */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Personnel Costs (USD/year)
          </label>
          <input
            type="number"
            value={data.opex?.personnelCost || 180000}
            onChange={(e) => onChange({ 
              opex: { ...data.opex, personnelCost: parseFloat(e.target.value) || 0 }
            })}
            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:border-green-400"
            placeholder="180000"
            min="0"
          />
        </div>

        {/* Energy Costs */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Energy Costs (USD/year)
          </label>
          <input
            type="number"
            value={data.opex?.energyCost || 120000}
            onChange={(e) => onChange({ 
              opex: { ...data.opex, energyCost: parseFloat(e.target.value) || 0 }
            })}
            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:border-green-400"
            placeholder="120000"
            min="0"
          />
        </div>

        {/* Maintenance & Repairs */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Maintenance & Repairs (USD/year)
          </label>
          <input
            type="number"
            value={data.opex?.maintenanceCost || 85000}
            onChange={(e) => onChange({ 
              opex: { ...data.opex, maintenanceCost: parseFloat(e.target.value) || 0 }
            })}
            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:border-green-400"
            placeholder="85000"
            min="0"
          />
        </div>

        {/* Chemical Treatment */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Chemical Treatment (USD/year)
          </label>
          <input
            type="number"
            value={data.opex?.chemicalCost || 45000}
            onChange={(e) => onChange({ 
              opex: { ...data.opex, chemicalCost: parseFloat(e.target.value) || 0 }
            })}
            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:border-green-400"
            placeholder="45000"
            min="0"
          />
        </div>

        {/* Insurance */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Insurance (USD/year)
          </label>
          <input
            type="number"
            value={data.opex?.insuranceCost || 25000}
            onChange={(e) => onChange({ 
              opex: { ...data.opex, insuranceCost: parseFloat(e.target.value) || 0 }
            })}
            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:border-green-400"
            placeholder="25000"
            min="0"
          />
        </div>

        {/* Administration */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Administration (USD/year)
          </label>
          <input
            type="number"
            value={data.opex?.adminCost || 35000}
            onChange={(e) => onChange({ 
              opex: { ...data.opex, adminCost: parseFloat(e.target.value) || 0 }
            })}
            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:border-green-400"
            placeholder="35000"
            min="0"
          />
        </div>
      </div>
    </div>

    {/* Financial Parameters */}
    <div className="bg-slate-700/50 rounded-lg p-6 space-y-6">
      <h3 className="text-lg font-semibold text-white mb-4">Financial Parameters</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Project Lifetime (years)
          </label>
          <input
            type="number"
            value={data.financial?.projectLifetime || 25}
            onChange={(e) => onChange({ 
              financial: { ...data.financial, projectLifetime: parseFloat(e.target.value) || 0 }
            })}
            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:border-green-400"
            placeholder="25"
            min="1" max="50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Discount Rate (%)
          </label>
          <input
            type="number"
            step="0.1"
            value={data.financial?.discountRate || 8.0}
            onChange={(e) => onChange({ 
              financial: { ...data.financial, discountRate: parseFloat(e.target.value) || 0 }
            })}
            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:border-green-400"
            placeholder="8.0"
            min="0" max="20" step="0.1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Inflation Rate (%)
          </label>
          <input
            type="number"
            step="0.1"
            value={data.financial?.inflationRate || 3.5}
            onChange={(e) => onChange({ 
              financial: { ...data.financial, inflationRate: parseFloat(e.target.value) || 0 }
            })}
            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:border-green-400"
            placeholder="3.5"
            min="0" max="15" step="0.1"
          />
        </div>
      </div>
    </div>

    {/* Revenue Parameters */}
    <div className="bg-slate-700/50 rounded-lg p-6 space-y-6">
      <h3 className="text-lg font-semibold text-white mb-4">Revenue Parameters</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Water Tariff (USD/m³)
          </label>
          <input
            type="number"
            step="0.01"
            value={data.revenue?.waterTariff || 0.85}
            onChange={(e) => onChange({ 
              revenue: { ...data.revenue, waterTariff: parseFloat(e.target.value) || 0 }
            })}
            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:border-green-400"
            placeholder="0.85"
            min="0" step="0.01"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Annual Water Sales (m³/year)
          </label>
          <input
            type="number"
            value={data.revenue?.annualWaterSales || 5000000}
            onChange={(e) => onChange({ 
              revenue: { ...data.revenue, annualWaterSales: parseFloat(e.target.value) || 0 }
            })}
            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:border-green-400"
            placeholder="5000000"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Environmental Benefits (USD/year)
          </label>
          <input
            type="number"
            value={data.revenue?.environmentalBenefits || 200000}
            onChange={(e) => onChange({ 
              revenue: { ...data.revenue, environmentalBenefits: parseFloat(e.target.value) || 0 }
            })}
            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:border-green-400"
            placeholder="200000"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Government Subsidies (USD/year)
          </label>
          <input
            type="number"
            value={data.revenue?.subsidies || 50000}
            onChange={(e) => onChange({ 
              revenue: { ...data.revenue, subsidies: parseFloat(e.target.value) || 0 }
            })}
            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:border-green-400"
            placeholder="50000"
            min="0"
          />
        </div>
      </div>
    </div>

    {/* Sensitivity Analysis */}
    <div className="bg-slate-700/50 rounded-lg p-6 space-y-6">
      <h3 className="text-lg font-semibold text-white mb-4">Sensitivity Analysis</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            CAPEX Variation Range (±%)
          </label>
          <input
            type="number"
            value={data.sensitivity?.capexVariation || 20}
            onChange={(e) => onChange({ 
              sensitivity: { ...data.sensitivity, capexVariation: parseFloat(e.target.value) || 0 }
            })}
            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:border-green-400"
            placeholder="20"
            min="0" max="100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            OPEX Variation Range (±%)
          </label>
          <input
            type="number"
            value={data.sensitivity?.opexVariation || 15}
            onChange={(e) => onChange({ 
              sensitivity: { ...data.sensitivity, opexVariation: parseFloat(e.target.value) || 0 }
            })}
            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:border-green-400"
            placeholder="15"
            min="0" max="100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Revenue Variation Range (±%)
          </label>
          <input
            type="number"
            value={data.sensitivity?.revenueVariation || 25}
            onChange={(e) => onChange({ 
              sensitivity: { ...data.sensitivity, revenueVariation: parseFloat(e.target.value) || 0 }
            })}
            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:border-green-400"
            placeholder="25"
            min="0" max="100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Enable Monte Carlo Analysis
          </label>
          <select
            value={data.sensitivity?.monteCarloEnabled || false}
            onChange={(e) => onChange({ 
              sensitivity: { ...data.sensitivity, monteCarloEnabled: e.target.value === 'true' }
            })}
            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:border-green-400"
          >
            <option value="false">Disabled</option>
            <option value="true">Enabled</option>
          </select>
        </div>
      </div>
    </div>
  </div>
);

export const CalibrationStep: React.FC<{ data: any; onChange: (data: any) => void }> = ({ data, onChange }) => (
  <div className="space-y-6">
    <div className="flex items-center mb-6">
      <Settings className="w-8 h-8 text-purple-400 mr-3" />
      <div>
        <h2 className="text-2xl font-bold text-white">Model Calibration</h2>
        <p className="text-gray-400">Parameter optimization and validation setup</p>
      </div>
    </div>

    {/* Calibration Strategy */}
    <div className="bg-slate-700/50 rounded-lg p-6 space-y-6">
      <h3 className="text-lg font-semibold text-white mb-4">Calibration Strategy</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Calibration Method <span className="text-red-400">*</span>
          </label>
          <select
            value={data.strategy?.method || 'automatic'}
            onChange={(e) => onChange({ 
              strategy: { ...data.strategy, method: e.target.value }
            })}
            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:border-purple-400"
          >
            <option value="automatic">Automatic Optimization</option>
            <option value="manual">Manual Parameter Adjustment</option>
            <option value="hybrid">Hybrid (Manual + Automatic)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Objective Function
          </label>
          <select
            value={data.strategy?.objectiveFunction || 'nash_sutcliffe'}
            onChange={(e) => onChange({ 
              strategy: { ...data.strategy, objectiveFunction: e.target.value }
            })}
            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:border-purple-400"
          >
            <option value="nash_sutcliffe">Nash-Sutcliffe Efficiency</option>
            <option value="rmse">Root Mean Square Error</option>
            <option value="mae">Mean Absolute Error</option>
            <option value="correlation">Correlation Coefficient</option>
            <option value="multi_objective">Multi-Objective</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Optimization Algorithm
          </label>
          <select
            value={data.strategy?.algorithm || 'genetic_algorithm'}
            onChange={(e) => onChange({ 
              strategy: { ...data.strategy, algorithm: e.target.value }
            })}
            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:border-purple-400"
          >
            <option value="genetic_algorithm">Genetic Algorithm</option>
            <option value="particle_swarm">Particle Swarm Optimization</option>
            <option value="differential_evolution">Differential Evolution</option>
            <option value="bayesian">Bayesian Optimization</option>
            <option value="nelder_mead">Nelder-Mead Simplex</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Maximum Iterations
          </label>
          <input
            type="number"
            value={data.strategy?.maxIterations || 1000}
            onChange={(e) => onChange({ 
              strategy: { ...data.strategy, maxIterations: parseInt(e.target.value) || 0 }
            })}
            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:border-purple-400"
            placeholder="1000"
            min="10" max="10000"
          />
        </div>
      </div>
    </div>

    {/* Physical Model Parameters */}
    <div className="bg-slate-700/50 rounded-lg p-6 space-y-6">
      <h3 className="text-lg font-semibold text-white mb-4">Physical Model Parameters</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Hydraulic Conductivity (m/day)</label>
          <div className="flex space-x-2">
            <input
              type="number"
              step="0.1"
              value={data.physical?.hydraulicConductivity?.min || 0.1}
              onChange={(e) => onChange({ 
                physical: { 
                  ...data.physical, 
                  hydraulicConductivity: { 
                    ...data.physical?.hydraulicConductivity, 
                    min: parseFloat(e.target.value) || 0 
                  }
                }
              })}
              className="flex-1 px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:border-purple-400"
              placeholder="Min: 0.1"
            />
            <input
              type="number"
              step="0.1"
              value={data.physical?.hydraulicConductivity?.max || 10}
              onChange={(e) => onChange({ 
                physical: { 
                  ...data.physical, 
                  hydraulicConductivity: { 
                    ...data.physical?.hydraulicConductivity, 
                    max: parseFloat(e.target.value) || 0 
                  }
                }
              })}
              className="flex-1 px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:border-purple-400"
              placeholder="Max: 10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Porosity (0-1)</label>
          <div className="flex space-x-2">
            <input
              type="number"
              step="0.01"
              value={data.physical?.porosity?.min || 0.1}
              onChange={(e) => onChange({ 
                physical: { 
                  ...data.physical, 
                  porosity: { 
                    ...data.physical?.porosity, 
                    min: parseFloat(e.target.value) || 0 
                  }
                }
              })}
              className="flex-1 px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:border-purple-400"
              placeholder="Min: 0.1"
              min="0" max="1"
            />
            <input
              type="number"
              step="0.01"
              value={data.physical?.porosity?.max || 0.6}
              onChange={(e) => onChange({ 
                physical: { 
                  ...data.physical, 
                  porosity: { 
                    ...data.physical?.porosity, 
                    max: parseFloat(e.target.value) || 0 
                  }
                }
              })}
              className="flex-1 px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:border-purple-400"
              placeholder="Max: 0.6"
              min="0" max="1"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Soil Depth (m)</label>
          <div className="flex space-x-2">
            <input
              type="number"
              step="0.1"
              value={data.physical?.soilDepth?.min || 0.5}
              onChange={(e) => onChange({ 
                physical: { 
                  ...data.physical, 
                  soilDepth: { 
                    ...data.physical?.soilDepth, 
                    min: parseFloat(e.target.value) || 0 
                  }
                }
              })}
              className="flex-1 px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:border-purple-400"
              placeholder="Min: 0.5"
              min="0"
            />
            <input
              type="number"
              step="0.1"
              value={data.physical?.soilDepth?.max || 5}
              onChange={(e) => onChange({ 
                physical: { 
                  ...data.physical, 
                  soilDepth: { 
                    ...data.physical?.soilDepth, 
                    max: parseFloat(e.target.value) || 0 
                  }
                }
              })}
              className="flex-1 px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:border-purple-400"
              placeholder="Max: 5"
              min="0"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Runoff Coefficient</label>
          <div className="flex space-x-2">
            <input
              type="number"
              step="0.01"
              value={data.physical?.runoffCoeff?.min || 0.05}
              onChange={(e) => onChange({ 
                physical: { 
                  ...data.physical, 
                  runoffCoeff: { 
                    ...data.physical?.runoffCoeff, 
                    min: parseFloat(e.target.value) || 0 
                  }
                }
              })}
              className="flex-1 px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:border-purple-400"
              placeholder="Min: 0.05"
              min="0" max="1"
            />
            <input
              type="number"
              step="0.01"
              value={data.physical?.runoffCoeff?.max || 0.8}
              onChange={(e) => onChange({ 
                physical: { 
                  ...data.physical, 
                  runoffCoeff: { 
                    ...data.physical?.runoffCoeff, 
                    max: parseFloat(e.target.value) || 0 
                  }
                }
              })}
              className="flex-1 px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:border-purple-400"
              placeholder="Max: 0.8"
              min="0" max="1"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Evapotranspiration Factor</label>
          <div className="flex space-x-2">
            <input
              type="number"
              step="0.01"
              value={data.physical?.etFactor?.min || 0.5}
              onChange={(e) => onChange({ 
                physical: { 
                  ...data.physical, 
                  etFactor: { 
                    ...data.physical?.etFactor, 
                    min: parseFloat(e.target.value) || 0 
                  }
                }
              })}
              className="flex-1 px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:border-purple-400"
              placeholder="Min: 0.5"
              min="0" max="2"
            />
            <input
              type="number"
              step="0.01"
              value={data.physical?.etFactor?.max || 1.5}
              onChange={(e) => onChange({ 
                physical: { 
                  ...data.physical, 
                  etFactor: { 
                    ...data.physical?.etFactor, 
                    max: parseFloat(e.target.value) || 0 
                  }
                }
              })}
              className="flex-1 px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:border-purple-400"
              placeholder="Max: 1.5"
              min="0" max="2"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Infiltration Rate (mm/h)</label>
          <div className="flex space-x-2">
            <input
              type="number"
              step="0.1"
              value={data.physical?.infiltrationRate?.min || 1}
              onChange={(e) => onChange({ 
                physical: { 
                  ...data.physical, 
                  infiltrationRate: { 
                    ...data.physical?.infiltrationRate, 
                    min: parseFloat(e.target.value) || 0 
                  }
                }
              })}
              className="flex-1 px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:border-purple-400"
              placeholder="Min: 1"
              min="0"
            />
            <input
              type="number"
              step="0.1"
              value={data.physical?.infiltrationRate?.max || 50}
              onChange={(e) => onChange({ 
                physical: { 
                  ...data.physical, 
                  infiltrationRate: { 
                    ...data.physical?.infiltrationRate, 
                    max: parseFloat(e.target.value) || 0 
                  }
                }
              })}
              className="flex-1 px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:border-purple-400"
              placeholder="Max: 50"
              min="0"
            />
          </div>
        </div>
      </div>
    </div>

    {/* Socio-hydrological Parameters */}
    <div className="bg-slate-700/50 rounded-lg p-6 space-y-6">
      <h3 className="text-lg font-semibold text-white mb-4">Socio-hydrological Parameters</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Water Demand Growth Rate (%/year)</label>
          <div className="flex space-x-2">
            <input
              type="number"
              step="0.1"
              value={data.socio?.demandGrowth?.min || 0}
              onChange={(e) => onChange({ 
                socio: { 
                  ...data.socio, 
                  demandGrowth: { 
                    ...data.socio?.demandGrowth, 
                    min: parseFloat(e.target.value) || 0 
                  }
                }
              })}
              className="flex-1 px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:border-purple-400"
              placeholder="Min: 0"
            />
            <input
              type="number"
              step="0.1"
              value={data.socio?.demandGrowth?.max || 5}
              onChange={(e) => onChange({ 
                socio: { 
                  ...data.socio, 
                  demandGrowth: { 
                    ...data.socio?.demandGrowth, 
                    max: parseFloat(e.target.value) || 0 
                  }
                }
              })}
              className="flex-1 px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:border-purple-400"
              placeholder="Max: 5"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Governance Index (0-1)</label>
          <div className="flex space-x-2">
            <input
              type="number"
              step="0.1"
              value={data.socio?.governanceIndex?.min || 0.2}
              onChange={(e) => onChange({ 
                socio: { 
                  ...data.socio, 
                  governanceIndex: { 
                    ...data.socio?.governanceIndex, 
                    min: parseFloat(e.target.value) || 0 
                  }
                }
              })}
              className="flex-1 px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:border-purple-400"
              placeholder="Min: 0.2"
              min="0" max="1"
            />
            <input
              type="number"
              step="0.1"
              value={data.socio?.governanceIndex?.max || 0.9}
              onChange={(e) => onChange({ 
                socio: { 
                  ...data.socio, 
                  governanceIndex: { 
                    ...data.socio?.governanceIndex, 
                    max: parseFloat(e.target.value) || 0 
                  }
                }
              })}
              className="flex-1 px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:border-purple-400"
              placeholder="Max: 0.9"
              min="0" max="1"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Risk Perception Factor (0-1)</label>
          <div className="flex space-x-2">
            <input
              type="number"
              step="0.1"
              value={data.socio?.riskPerception?.min || 0.1}
              onChange={(e) => onChange({ 
                socio: { 
                  ...data.socio, 
                  riskPerception: { 
                    ...data.socio?.riskPerception, 
                    min: parseFloat(e.target.value) || 0 
                  }
                }
              })}
              className="flex-1 px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:border-purple-400"
              placeholder="Min: 0.1"
              min="0" max="1"
            />
            <input
              type="number"
              step="0.1"
              value={data.socio?.riskPerception?.max || 0.8}
              onChange={(e) => onChange({ 
                socio: { 
                  ...data.socio, 
                  riskPerception: { 
                    ...data.socio?.riskPerception, 
                    max: parseFloat(e.target.value) || 0 
                  }
                }
              })}
              className="flex-1 px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:border-purple-400"
              placeholder="Max: 0.8"
              min="0" max="1"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Adaptation Capacity (0-1)</label>
          <div className="flex space-x-2">
            <input
              type="number"
              step="0.1"
              value={data.socio?.adaptationCapacity?.min || 0.2}
              onChange={(e) => onChange({ 
                socio: { 
                  ...data.socio, 
                  adaptationCapacity: { 
                    ...data.socio?.adaptationCapacity, 
                    min: parseFloat(e.target.value) || 0 
                  }
                }
              })}
              className="flex-1 px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:border-purple-400"
              placeholder="Min: 0.2"
              min="0" max="1"
            />
            <input
              type="number"
              step="0.1"
              value={data.socio?.adaptationCapacity?.max || 0.9}
              onChange={(e) => onChange({ 
                socio: { 
                  ...data.socio, 
                  adaptationCapacity: { 
                    ...data.socio?.adaptationCapacity, 
                    max: parseFloat(e.target.value) || 0 
                  }
                }
              })}
              className="flex-1 px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:border-purple-400"
              placeholder="Max: 0.9"
              min="0" max="1"
            />
          </div>
        </div>
      </div>
    </div>

    {/* Validation Settings */}
    <div className="bg-slate-700/50 rounded-lg p-6 space-y-6">
      <h3 className="text-lg font-semibold text-white mb-4">Validation Settings</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Cross-Validation Method
          </label>
          <select
            value={data.validation?.method || 'split_sample'}
            onChange={(e) => onChange({ 
              validation: { ...data.validation, method: e.target.value }
            })}
            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:border-purple-400"
          >
            <option value="split_sample">Split Sample</option>
            <option value="time_series_cv">Time Series Cross-Validation</option>
            <option value="k_fold">K-Fold Cross-Validation</option>
            <option value="leave_one_out">Leave One Out</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Training Data Percentage (%)
          </label>
          <input
            type="number"
            value={data.validation?.trainingPercent || 70}
            onChange={(e) => onChange({ 
              validation: { ...data.validation, trainingPercent: parseFloat(e.target.value) || 0 }
            })}
            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:border-purple-400"
            placeholder="70"
            min="50" max="90"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Convergence Tolerance
          </label>
          <input
            type="number"
            step="0.0001"
            value={data.validation?.tolerance || 0.001}
            onChange={(e) => onChange({ 
              validation: { ...data.validation, tolerance: parseFloat(e.target.value) || 0 }
            })}
            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:border-purple-400"
            placeholder="0.001"
            min="0.0001" max="0.1" step="0.0001"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Enable Uncertainty Analysis
          </label>
          <select
            value={data.validation?.uncertaintyAnalysis || true}
            onChange={(e) => onChange({ 
              validation: { ...data.validation, uncertaintyAnalysis: e.target.value === 'true' }
            })}
            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:border-purple-400"
          >
            <option value="true">Enabled</option>
            <option value="false">Disabled</option>
          </select>
        </div>
      </div>
    </div>

    {/* Output Configuration */}
    <div className="bg-slate-700/50 rounded-lg p-6 space-y-6">
      <h3 className="text-lg font-semibold text-white mb-4">Calibration Output</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={data.output?.saveParameterHistory || true}
            onChange={(e) => onChange({
              output: { ...data.output, saveParameterHistory: e.target.checked }
            })}
            className="w-4 h-4 text-purple-500 bg-slate-700 border-slate-600 rounded focus:ring-purple-400"
          />
          <span className="text-gray-300">Save Parameter History</span>
        </label>
        
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={data.output?.generateGraphs || true}
            onChange={(e) => onChange({
              output: { ...data.output, generateGraphs: e.target.checked }
            })}
            className="w-4 h-4 text-purple-500 bg-slate-700 border-slate-600 rounded focus:ring-purple-400"
          />
          <span className="text-gray-300">Generate Calibration Graphs</span>
        </label>
        
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={data.output?.exportResults || true}
            onChange={(e) => onChange({
              output: { ...data.output, exportResults: e.target.checked }
            })}
            className="w-4 h-4 text-purple-500 bg-slate-700 border-slate-600 rounded focus:ring-purple-400"
          />
          <span className="text-gray-300">Export Results to CSV</span>
        </label>
        
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={data.output?.saveOptimalParameters || true}
            onChange={(e) => onChange({
              output: { ...data.output, saveOptimalParameters: e.target.checked }
            })}
            className="w-4 h-4 text-purple-500 bg-slate-700 border-slate-600 rounded focus:ring-purple-400"
          />
          <span className="text-gray-300">Save Optimal Parameters</span>
        </label>
      </div>
    </div>
  </div>
);

export const ExecutionConfigurationStep: React.FC<{ 
  data: any; 
  onChange: (data: any) => void;
  projectConfig: any;
}> = ({ data, onChange, projectConfig }) => (
  <div className="space-y-6">
    <div className="flex items-center mb-6">
      <Settings className="w-8 h-8 text-indigo-400 mr-3" />
      <div>
        <h2 className="text-2xl font-bold text-white">Execution Configuration</h2>
        <p className="text-gray-400">Model execution settings and output options</p>
      </div>
    </div>

    {/* Model Components */}
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Model Components</h3>
      <div className="grid grid-cols-2 gap-4">
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={data.modelComponents.runPhysical}
            onChange={(e) => onChange({
              modelComponents: { ...data.modelComponents, runPhysical: e.target.checked }
            })}
            className="w-4 h-4 text-blue-500 bg-slate-700 border-slate-600 rounded focus:ring-blue-400"
          />
          <span className="text-gray-300">Run Physical Model</span>
        </label>
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={data.modelComponents.runSociohydrological}
            onChange={(e) => onChange({
              modelComponents: { ...data.modelComponents, runSociohydrological: e.target.checked }
            })}
            className="w-4 h-4 text-blue-500 bg-slate-700 border-slate-600 rounded focus:ring-blue-400"
          />
          <span className="text-gray-300">Run Socio-hydrological Model</span>
        </label>
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={data.modelComponents.runAnthropocene}
            onChange={(e) => onChange({
              modelComponents: { ...data.modelComponents, runAnthropocene: e.target.checked }
            })}
            className="w-4 h-4 text-blue-500 bg-slate-700 border-slate-600 rounded focus:ring-blue-400"
          />
          <span className="text-gray-300">Run Anthropocene Model</span>
        </label>
        {projectConfig.includeAquifer && (
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={data.modelComponents.runArtificialAquifer}
              onChange={(e) => onChange({
                modelComponents: { ...data.modelComponents, runArtificialAquifer: e.target.checked }
              })}
              className="w-4 h-4 text-blue-500 bg-slate-700 border-slate-600 rounded focus:ring-blue-400"
            />
            <span className="text-gray-300">Run Artificial Aquifer Model</span>
          </label>
        )}
      </div>
    </div>

    {/* Output Options */}
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Output Options</h3>
      <div className="grid grid-cols-2 gap-4">
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={data.outputs.generateCharts}
            onChange={(e) => onChange({
              outputs: { ...data.outputs, generateCharts: e.target.checked }
            })}
            className="w-4 h-4 text-green-500 bg-slate-700 border-slate-600 rounded focus:ring-green-400"
          />
          <span className="text-gray-300">Generate Charts</span>
        </label>
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={data.outputs.saveDetailedResults}
            onChange={(e) => onChange({
              outputs: { ...data.outputs, saveDetailedResults: e.target.checked }
            })}
            className="w-4 h-4 text-green-500 bg-slate-700 border-slate-600 rounded focus:ring-green-400"
          />
          <span className="text-gray-300">Save Detailed Results</span>
        </label>
      </div>
    </div>
  </div>
);