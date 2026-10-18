import React, { useState } from 'react';
import { Play, RotateCcw, Info, Activity, ShieldAlert, Award, FileText, Sliders } from 'lucide-react';

export default function App() {
  // Pitch & Environment State
  const [pitchCondition, setPitchCondition] = useState('hard_bouncy'); // 'hard_bouncy' | 'low_slow'
  const [cor, setCor] = useState(0.55); // Coefficient of Restitution

  // Bat Build State
  const [totalWeight, setTotalWeight] = useState(1180); // in grams (approx 2lb 9.6oz)
  const [pickupWeight, setPickupWeight] = useState(1120); // feel weight in grams
  const [moi, setMoi] = useState(2400); // Moment of Inertia (kg.cm^2)
  const [sweetSpotPos, setSweetSpotPos] = useState(21); // cm from toe
  const [spineHeight, setSpineHeight] = useState(64); // mm
  const [edgeThickness, setEdgeThickness] = useState(38); // mm

  // Calculated Metrics
  const calculateOPI = () => // Calculated Metrics: Dynamic Pitch-Dependent Sweet Spot Physics
  const calculateOPI = () => {
    const weightFactor = Math.max(0, 10 - Math.abs(totalWeight - 1170) / 15);
    
    // Dynamic ideal sweet spot based on pitch conditions:
    // Hard & Bouncy -> Higher sweet spot (~23cm)
    // Low & Slow -> Lower sweet spot (~18cm)
    const idealSweetSpot = pitchCondition === 'hard_bouncy' ? 23 : 18;
    const sweetSpotDeviation = Math.abs(sweetSpotPos - idealSweetSpot);
    
    // Bell-curve scoring: score drops quadratically as you move away from the pitch-optimized height
    const sweetSpotFactor = Math.max(0, 18 - (sweetSpotDeviation * sweetSpotDeviation * 1.5));

    // MOI penalty for extreme inertia mismatches
    const moiPenalty = Math.abs(moi - 2350) / 45;

    const rawScore = 68 + weightFactor + sweetSpotFactor - moiPenalty;
    return Math.min(Math.max(rawScore.toFixed(1), 40), 98);
  };

  const opiScore = calculateOPI();

  const handleReset = () => {
    setPitchCondition('hard_bouncy');
    setCor(0.55);
    setTotalWeight(1180);
    setPickupWeight(1120);
    setMoi(2400);
    setSweetSpotPos(21);
    setSpineHeight(64);
    setEdgeThickness(38);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased p-4 md:p-8">
      {/* Top Header */}
      <header className="max-w-7xl mx-auto mb-8 border-b border-slate-800 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Activity className="w-4 h-4" /> Physics Simulation Environment
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">BatCraft Studio</h1>
          <p className="text-slate-400 text-sm mt-1">
            Meta-Analysis Tool: Optimizing Cricket Bat MOI & Weight Distribution relative to Pitch Dynamics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg transition-all"
          >
            <RotateCcw className="w-4 h-4" /> Reset Model
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Parameter Controls */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Pitch Dynamics Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
            <h2 className="text-base font-bold text-white flex items-center gap-2 mb-4">
              <Sliders className="w-4 h-4 text-emerald-400" /> 1. Pitch & Surface Conditions
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Preset Surface</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => { setPitchCondition('hard_bouncy'); setCor(0.58); setSweetSpotPos(22); }}
                    className={`py-2.5 px-3 text-xs font-semibold rounded-lg border transition-all ${
                      pitchCondition === 'hard_bouncy'
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                        : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    Hard & Bouncy (WACA/Centurion)
                  </button>
                  <button
                    onClick={() => { setPitchCondition('low_slow'); setCor(0.48); setSweetSpotPos(18); }}
                    className={`py-2.5 px-3 text-xs font-semibold rounded-lg border transition-all ${
                      pitchCondition === 'low_slow'
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                        : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    Low & Slow (Subcontinent)
                  </button>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Coefficient of Restitution (COR)</span>
                  <span className="text-emerald-400 font-mono">{cor}</span>
                </div>
                <input
                  type="range"
                  min="0.35"
                  max="0.65"
                  step="0.01"
                  value={cor}
                  onChange={(e) => setCor(parseFloat(e.target.value))}
                  className="w-full accent-emerald-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Bat Specification Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
            <h2 className="text-base font-bold text-white flex items-center gap-2 mb-4">
              <Sliders className="w-4 h-4 text-cyan-400" /> 2. Bat Mass & Inertia Engineering
            </h2>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Dead / Static Weight</span>
                  <span className="text-cyan-400 font-mono">{totalWeight} g ({ (totalWeight / 453.592).toFixed(2) } lbs)</span>
                </div>
                <input
                  type="range"
                  min="1050"
                  max="1350"
                  step="10"
                  value={totalWeight}
                  onChange={(e) => setTotalWeight(parseInt(e.target.value))}
                  className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Moment of Inertia (MOI @ Handle)</span>
                  <span className="text-cyan-400 font-mono">{moi} kg·cm²</span>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="2800"
                  step="20"
                  value={moi}
                  onChange={(e) => setMoi(parseInt(e.target.value))}
                  className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Sweet Spot Height (from Toe)</span>
                  <span className="text-cyan-400 font-mono">{sweetSpotPos} cm</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="26"
                  step="1"
                  value={sweetSpotPos}
                  onChange={(e) => setSweetSpotPos(parseInt(e.target.value))}
                  className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Spine Profile</span>
                    <span className="text-cyan-400 font-mono">{spineHeight} mm</span>
                  </div>
                  <input
                    type="range"
                    min="55"
                    max="68"
                    step="1"
                    value={spineHeight}
                    onChange={(e) => setSpineHeight(parseInt(e.target.value))}
                    className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Edge Thickness</span>
                    <span className="text-cyan-400 font-mono">{edgeThickness} mm</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="42"
                    step="1"
                    value={edgeThickness}
                    onChange={(e) => setEdgeThickness(parseInt(e.target.value))}
                    className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Visualizer & Simulation Outputs */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* OPI Score Card */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-850 border border-slate-800 rounded-xl p-6 shadow-xl flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Award className="w-4 h-4" /> Optimal Profile Index (OPI)
              </div>
              <h3 className="text-2xl font-bold text-white">
                {opiScore >= 80 ? 'High Adaptation' : opiScore >= 60 ? 'Moderate Fit' : 'Sub-Optimal Setup'}
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Calculated balance ratio between bat MOI, sweet spot elevation, and target pitch energy return.
              </p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-emerald-400 font-mono">
                {opiScore}
              </div>
              <span className="text-xs text-slate-500 font-mono">Target: 80+</span>
            </div>
          </div>

          {/* Bat Visualizer Diagram */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Info className="w-4 h-4 text-emerald-400" /> Mass Distribution Profile Schematics
            </h3>

            <div className="relative h-44 bg-slate-950 rounded-lg border border-slate-800/80 p-4 flex items-center justify-center">
              <div className="relative w-full max-w-md h-12 bg-slate-800 rounded-r-2xl border border-slate-700 flex items-center">
                <div className="w-1/4 h-4 bg-amber-700/60 rounded-l border-r border-amber-600/40"></div>
                <div className="w-3/4 h-full relative flex items-center justify-start px-4">
                  <div 
                    className="absolute h-full bg-emerald-500/20 border-x-2 border-emerald-400/80 transition-all duration-300"
                    style={{
                      left: `${(sweetSpotPos / 30) * 100}%`,
                      width: '22%'
                    }}
                  >
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-mono text-emerald-400 whitespace-nowrap bg-slate-900 px-1.5 py-0.5 rounded border border-emerald-500/30">
                      Sweet Spot ({sweetSpotPos}cm)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="block text-[11px] text-slate-400">Pickup Rating</span>
                <span className="text-sm font-bold font-mono text-emerald-400">
                  {moi < 2300 ? 'Light / Fast' : moi < 2550 ? 'Balanced' : 'Power / Heavy'}
                </span>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="block text-[11px] text-slate-400">Ideal Line</span>
                <span className="text-sm font-bold font-mono text-cyan-400">
                  {sweetSpotPos > 21 ? 'High (Bouncer / Backfoot)' : 'Mid-Low (Frontfoot)'}
                </span>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="block text-[11px] text-slate-400">Restitution Index</span>
                <span className="text-sm font-bold font-mono text-amber-400">
                  {cor > 0.52 ? 'High Power Output' : 'Absorptive Surface'}
                </span>
              </div>
            </div>
          </div>

          {/* Research Summary Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" /> Academic Findings Summary
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {pitchCondition === 'hard_bouncy' 
                ? 'For hard, high-bounce pitches, higher MOI combined with an elevated sweet spot (21–24cm) minimizes handle vibration during high-impact contacts. Concaving the shoulders enables maximum spine height without compromising swing velocity.'
                : 'For low, slow pitches, lowering the sweet spot (17–20cm) and lowering total static weight improves maneuverability against skidding deliveries, maximizing energy transfer (COR) on lower contact points.'
              }
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}