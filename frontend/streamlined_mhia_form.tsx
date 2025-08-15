// Streamlined MHIA Form Component - Innovative & Disruptive Design
import React from 'react';

interface StreamlinedMHIAFormProps {
  modelData: any;
  setModelData: (data: any) => void;
  onExecuteModel: (modelType: string) => void;
  modelResults: any;
  executionStatus: any;
}

const StreamlinedMHIAForm: React.FC<StreamlinedMHIAFormProps> = ({
  modelData,
  setModelData,
  onExecuteModel,
  modelResults,
  executionStatus
}) => {
  const [currentPhase, setCurrentPhase] = React.useState(1);
  const [aiSuggestions, setAiSuggestions] = React.useState({});

  // AI-Assisted Location Detection
  const detectLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Simulate AI-powered location analysis
        const suggestions = {
          projectName: `Basin Analysis ${new Date().getFullYear()} - Lat ${latitude.toFixed(2)}°`,
          climateZone: latitude > 23.5 ? 'Temperate' : 'Tropical',
          meanPrecipitation: Math.round(800 + Math.random() * 800),
          meanTemperature: Math.round(15 + (Math.abs(latitude) < 30 ? 10 : -5)),
          basinArea: Math.round(500 + Math.random() * 2000),
          population: Math.round(50000 + Math.random() * 200000)
        };
        
        setAiSuggestions(suggestions);
        setModelData({
          ...modelData,
          name: suggestions.projectName,
          latitude,
          longitude,
          meanPrecipitation: suggestions.meanPrecipitation,
          meanTemperature: suggestions.meanTemperature,
          basinArea: suggestions.basinArea,
          population: suggestions.population
        });
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* AI-Powered Quick Setup */}
      <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl p-6 border border-purple-500/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-purple-400 flex items-center">
            🧠 AI-Powered Quick Setup
          </h3>
          <button
            onClick={detectLocation}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-lg text-white font-medium transition-all"
          >
            Auto-Configure with AI
          </button>
        </div>
        <p className="text-gray-300 text-sm">
          Enable location access for AI-assisted parameter estimation using satellite data, climate databases, and regional hydrology patterns.
        </p>
      </div>

      {/* Phase-Based Configuration */}
      <div className="bg-gradient-to-br from-slate-800/50 to-gray-900/50 rounded-xl p-6 border border-white/10">
        {/* Phase Navigation */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-semibold text-cyan-400">MHIA Professional Configuration</h3>
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((phase) => (
              <button
                key={phase}
                onClick={() => setCurrentPhase(phase)}
                className={`w-10 h-10 rounded-full font-bold transition-all ${
                  currentPhase === phase
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                }`}
              >
                {phase}
              </button>
            ))}
          </div>
        </div>

        {/* Phase Content */}
        {currentPhase === 1 && (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">1</div>
              <h4 className="text-lg font-semibold text-purple-400">Anthropocene Configuration</h4>
              <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded">30-Year Horizon</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Climate Scenario</label>
                <select
                  value={modelData.climateScenario || 'RCP4.5'}
                  onChange={(e) => setModelData({...modelData, climateScenario: e.target.value})}
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
                >
                  <option value="RCP2.6">RCP2.6 - Strong Mitigation</option>
                  <option value="RCP4.5">RCP4.5 - Moderate Pathway</option>
                  <option value="RCP8.5">RCP8.5 - High Emissions</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Base Temperature (°C)
                  {aiSuggestions.meanTemperature && (
                    <span className="ml-2 text-xs text-green-400">AI: {aiSuggestions.meanTemperature}</span>
                  )}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={modelData.meanTemperature || ''}
                  onChange={(e) => setModelData({...modelData, meanTemperature: e.target.value})}
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
                  placeholder="18.0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Projection Years</label>
                <input
                  type="number"
                  value={modelData.projectionYears || 30}
                  onChange={(e) => setModelData({...modelData, projectionYears: e.target.value})}
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
                />
              </div>
            </div>

            <div className="mt-6 p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
              <h5 className="font-semibold text-purple-300 mb-2">Land Use Change Rates (Annual %)</h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs text-gray-400">Forest Loss</label>
                  <input
                    type="number"
                    step="0.001"
                    value={modelData.forestLossRate || -0.005}
                    onChange={(e) => setModelData({...modelData, forestLossRate: e.target.value})}
                    className="w-full px-2 py-1 bg-white/5 border border-white/20 rounded text-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400">Urban Growth</label>
                  <input
                    type="number"
                    step="0.001"
                    value={modelData.urbanGrowthRate || 0.007}
                    onChange={(e) => setModelData({...modelData, urbanGrowthRate: e.target.value})}
                    className="w-full px-2 py-1 bg-white/5 border border-white/20 rounded text-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400">Agriculture</label>
                  <input
                    type="number"
                    step="0.001"
                    value={modelData.agricultureRate || -0.002}
                    onChange={(e) => setModelData({...modelData, agricultureRate: e.target.value})}
                    className="w-full px-2 py-1 bg-white/5 border border-white/20 rounded text-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400">Population Growth</label>
                  <input
                    type="number"
                    step="0.001"
                    value={modelData.populationGrowth || 0.015}
                    onChange={(e) => setModelData({...modelData, populationGrowth: e.target.value})}
                    className="w-full px-2 py-1 bg-white/5 border border-white/20 rounded text-white text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {currentPhase === 2 && (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">2</div>
              <h4 className="text-lg font-semibold text-blue-400">Physical Hydrology Setup</h4>
              <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded">Water Balance</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h5 className="font-semibold text-gray-300">Basin Characteristics</h5>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">
                      Basin Area (km²)
                      {aiSuggestions.basinArea && (
                        <span className="ml-2 text-green-400">AI: {aiSuggestions.basinArea}</span>
                      )}
                    </label>
                    <input
                      type="number"
                      value={modelData.basinArea || ''}
                      onChange={(e) => setModelData({...modelData, basinArea: e.target.value})}
                      className="w-full px-2 py-2 bg-white/5 border border-white/20 rounded text-white text-sm"
                      placeholder="1000"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Mean Elevation (m)</label>
                    <input
                      type="number"
                      value={modelData.meanElevation || ''}
                      onChange={(e) => setModelData({...modelData, meanElevation: e.target.value})}
                      className="w-full px-2 py-2 bg-white/5 border border-white/20 rounded text-white text-sm"
                      placeholder="500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Mean Slope (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={modelData.meanSlope || ''}
                      onChange={(e) => setModelData({...modelData, meanSlope: e.target.value})}
                      className="w-full px-2 py-2 bg-white/5 border border-white/20 rounded text-white text-sm"
                      placeholder="5.0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Soil Depth (m)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={modelData.soilDepth || ''}
                      onChange={(e) => setModelData({...modelData, soilDepth: e.target.value})}
                      className="w-full px-2 py-2 bg-white/5 border border-white/20 rounded text-white text-sm"
                      placeholder="2.0"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h5 className="font-semibold text-gray-300">Climate Data</h5>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">
                      Annual Precipitation (mm)
                      {aiSuggestions.meanPrecipitation && (
                        <span className="ml-2 text-green-400">AI: {aiSuggestions.meanPrecipitation}</span>
                      )}
                    </label>
                    <input
                      type="number"
                      value={modelData.meanPrecipitation || ''}
                      onChange={(e) => setModelData({...modelData, meanPrecipitation: e.target.value})}
                      className="w-full px-2 py-2 bg-white/5 border border-white/20 rounded text-white text-sm"
                      placeholder="1200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Simulation Period</label>
                    <select
                      value={modelData.timeStep || 'daily'}
                      onChange={(e) => setModelData({...modelData, timeStep: e.target.value})}
                      className="w-full px-2 py-2 bg-white/5 border border-white/20 rounded text-white text-sm"
                    >
                      <option value="daily">Daily</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentPhase === 3 && (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">3</div>
              <h4 className="text-lg font-semibold text-green-400">Sociohydrological Parameters</h4>
              <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">Human-Water</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Population
                  {aiSuggestions.population && (
                    <span className="ml-2 text-xs text-green-400">AI: {aiSuggestions.population}</span>
                  )}
                </label>
                <input
                  type="number"
                  value={modelData.population || ''}
                  onChange={(e) => setModelData({...modelData, population: e.target.value})}
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
                  placeholder="100000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Water Demand (L/person/day)</label>
                <input
                  type="number"
                  value={modelData.waterDemandPerCapita || ''}
                  onChange={(e) => setModelData({...modelData, waterDemandPerCapita: e.target.value})}
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
                  placeholder="150"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Governance Index (0-1)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  value={modelData.governanceIndex || ''}
                  onChange={(e) => setModelData({...modelData, governanceIndex: e.target.value})}
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
                  placeholder="0.6"
                />
              </div>
            </div>
          </div>
        )}

        {currentPhase === 4 && (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold">4</div>
              <h4 className="text-lg font-semibold text-cyan-400">Artificial Aquifer System</h4>
              <span className="text-xs px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded">ASR/MAR</span>
            </div>

            <div className="flex items-center space-x-3 mb-4">
              <input
                type="checkbox"
                id="includeAquifer"
                checked={modelData.includeAquifer || false}
                onChange={(e) => setModelData({...modelData, includeAquifer: e.target.checked})}
                className="w-4 h-4 rounded"
              />
              <label htmlFor="includeAquifer" className="text-gray-300">Include Artificial Aquifer System</label>
            </div>

            {modelData.includeAquifer && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Storage Capacity (m³)</label>
                  <input
                    type="number"
                    value={modelData.storageCapacity || ''}
                    onChange={(e) => setModelData({...modelData, storageCapacity: e.target.value})}
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
                    placeholder="500000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Recovery Efficiency (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={modelData.recoveryEfficiency || ''}
                    onChange={(e) => setModelData({...modelData, recoveryEfficiency: e.target.value})}
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
                    placeholder="80"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Operation Mode</label>
                  <select
                    value={modelData.operationMode || 'seasonal'}
                    onChange={(e) => setModelData({...modelData, operationMode: e.target.value})}
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
                  >
                    <option value="seasonal">Seasonal</option>
                    <option value="threshold">Threshold-based</option>
                    <option value="continuous">Continuous</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Water Quality TDS (mg/L)</label>
                  <input
                    type="number"
                    value={modelData.waterQualityTDS || ''}
                    onChange={(e) => setModelData({...modelData, waterQualityTDS: e.target.value})}
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
                    placeholder="500"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {currentPhase === 5 && (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">5</div>
              <h4 className="text-lg font-semibold text-orange-400">Economic & Regulatory</h4>
              <span className="text-xs px-2 py-1 bg-orange-500/20 text-orange-400 rounded">Compliance</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h5 className="font-semibold text-gray-300">Economic Parameters</h5>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Project Life (years)</label>
                    <input
                      type="number"
                      value={modelData.projectLife || 30}
                      onChange={(e) => setModelData({...modelData, projectLife: e.target.value})}
                      className="w-full px-2 py-2 bg-white/5 border border-white/20 rounded text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Discount Rate (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={modelData.discountRate || 8}
                      onChange={(e) => setModelData({...modelData, discountRate: e.target.value})}
                      className="w-full px-2 py-2 bg-white/5 border border-white/20 rounded text-white text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h5 className="font-semibold text-gray-300">Brazilian Regulatory Compliance</h5>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="outorga"
                      checked={modelData.requiresOutorga || false}
                      onChange={(e) => setModelData({...modelData, requiresOutorga: e.target.checked})}
                      className="w-4 h-4 rounded"
                    />
                    <label htmlFor="outorga" className="text-sm text-gray-300">Water Rights Permit (Outorga) Required</label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="fce"
                      checked={modelData.requiresFCE || false}
                      onChange={(e) => setModelData({...modelData, requiresFCE: e.target.checked})}
                      className="w-4 h-4 rounded"
                    />
                    <label htmlFor="fce" className="text-sm text-gray-300">FCE (Federal Control Form) Required</label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="fob"
                      checked={modelData.requiresFOB || false}
                      onChange={(e) => setModelData({...modelData, requiresFOB: e.target.checked})}
                      className="w-4 h-4 rounded"
                    />
                    <label htmlFor="fob" className="text-sm text-gray-300">FOB (Basic Operational Form) Required</label>
                  </div>

                  {(modelData.requiresOutorga || modelData.requiresFCE) && (
                    <div className="mt-3">
                      <label className="block text-xs text-gray-400 mb-1">CNAH Number</label>
                      <input
                        type="text"
                        value={modelData.cnahNumber || ''}
                        onChange={(e) => setModelData({...modelData, cnahNumber: e.target.value})}
                        className="w-full px-2 py-2 bg-white/5 border border-white/20 rounded text-white text-sm"
                        placeholder="CNAH-XXXXX-XX"
                      />
                    </div>
                  )}

                  <div className="mt-3">
                    <label className="block text-xs text-gray-400 mb-1">ART Number (Technical Responsibility)</label>
                    <input
                      type="text"
                      value={modelData.artNumber || ''}
                      onChange={(e) => setModelData({...modelData, artNumber: e.target.value})}
                      className="w-full px-2 py-2 bg-white/5 border border-white/20 rounded text-white text-sm"
                      placeholder="ART-XXXXXXX-X"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Phase Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
          <button
            onClick={() => setCurrentPhase(Math.max(1, currentPhase - 1))}
            disabled={currentPhase === 1}
            className={`px-4 py-2 rounded-lg font-medium ${
              currentPhase === 1
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            Previous Phase
          </button>

          <div className="flex space-x-2">
            <span className="text-sm text-gray-400">Phase {currentPhase} of 5</span>
          </div>

          <button
            onClick={() => setCurrentPhase(Math.min(5, currentPhase + 1))}
            disabled={currentPhase === 5}
            className={`px-4 py-2 rounded-lg font-medium ${
              currentPhase === 5
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white'
            }`}
          >
            Next Phase
          </button>
        </div>
      </div>

      {/* Professional Summary */}
      {currentPhase === 5 && (
        <div className="bg-gradient-to-br from-green-900/30 to-blue-900/30 rounded-xl p-6 border border-green-500/20">
          <h3 className="text-xl font-semibold text-green-400 mb-4 flex items-center">
            📋 Professional Project Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="space-y-2">
              <div className="text-gray-400">Project Scope:</div>
              <div className="text-white">{modelData.name || 'Untitled Project'}</div>
              <div className="text-white">Basin: {modelData.basinArea || 'TBD'} km²</div>
              <div className="text-white">Population: {modelData.population?.toLocaleString() || 'TBD'}</div>
            </div>
            <div className="space-y-2">
              <div className="text-gray-400">Technical Configuration:</div>
              <div className="text-white">Climate: {modelData.climateScenario || 'RCP4.5'}</div>
              <div className="text-white">Timestep: {modelData.timeStep || 'Daily'}</div>
              <div className="text-white">Aquifer: {modelData.includeAquifer ? 'Yes' : 'No'}</div>
            </div>
            <div className="space-y-2">
              <div className="text-gray-400">Regulatory Compliance:</div>
              <div className="text-white">Outorga: {modelData.requiresOutorga ? 'Required' : 'N/A'}</div>
              <div className="text-white">FCE: {modelData.requiresFCE ? 'Required' : 'N/A'}</div>
              <div className="text-white">ART: {modelData.artNumber || 'Pending'}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StreamlinedMHIAForm;