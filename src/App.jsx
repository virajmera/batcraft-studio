import React, { useState } from 'react';
import { 
  Activity, 
  Sliders, 
  RotateCcw, 
  Shield, 
  Zap, 
  Scale, 
  Compass, 
  BarChart2, 
  Layers,
  Award
} from 'lucide-react';

export default function App() {
  // State for Bat Parameters
  const [totalWeight, setTotalWeight] = useState(1180); // in grams (~2lb 9.6oz)
  const [pickupWeight, setPickupWeight] = useState(1120); // feel weight in grams
  const [moi, setMoi] = useState(2400); // Moment of Inertia (kg.cm^2)
  const [sweetSpotPos, setSweetSpotPos] = useState(21); // cm from toe
  const [spineHeight, setSpineHeight] = useState(64); // mm
  const [edgeThickness, setEdgeThickness] = useState(38); // mm
  const [pitchCondition, setPitchCondition] = useState('hard_bouncy'); // 'hard_bouncy' or 'low_slow'
  const [cor, setCor] = useState(0.55); // Coefficient of Restitution

  // Calculated Metrics: Dynamic Pitch-Dependent Sweet Spot Physics
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
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      {/* Header */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center border-b border-slate-800 pb-6 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">BatCraft Studio</h1>
              <p className="text-sm text-slate-400">Advanced Cricket Bat Physics & Profile Engineering</p>
            </div>
          </div>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-4">
          <button 
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-sm font-medium transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-slate-400" />
            Reset Defaults
          </button>
          <div className="px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 font-semibold text-sm">
            Vite + React v19
          </div>
        </div>
      </header>

      {/* Main Dashboard Grid */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Controls Column (2 spans) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Pitch & Environmental Setup */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Compass className="w-5 h-5 text-amber-400" />
              Pitch Condition & Environment
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setPitchCondition('hard_bouncy')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  pitchCondition === 'hard_bouncy'
                    ? 'bg-amber-500/10 border-amber-500/50 text-amber-300 shadow-lg shadow-amber-500/5'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-base mb-1">Hard & Bouncy Pitch</div>
                <p className="text-xs text-slate-400">Optimizes for higher bounce with a raised sweet spot (~23cm).</p>
              </button>

              <button
                onClick={() => setPitchCondition('low_slow')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  pitchCondition === 'low_slow'
                    ? 'bg-amber-500/10 border-amber-500/50 text-amber-300 shadow-lg shadow-amber-500/5'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-base mb-1">Low & Slow Pitch</div>
                <p className="text-xs text-slate-400">Optimizes for skidding deliveries with a lower sweet spot (~18cm).</p>
              </button>
            </div>
          </div>

          {/* Bat Parameters Sliders */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-amber-400" />
              Physical Specifications
            </h2>

            {/* Total Weight */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-300 font-medium">Total Mass (Weight)</span>
                <span className="text-amber-400 font-bold">{totalWeight} g</span>
              </div>
              <input 
                type="range" 
                min="1050" 
                max="1300" 
                step="5"
                value={totalWeight}
                onChange={(e) => setTotalWeight(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer bg-slate-800 h-2 rounded-lg"
              />
            </div>

            {/* Pickup Weight */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-300 font-medium">Pickup Weight (Dynamic Balance)</span>
                <span className="text-amber-400 font-bold">{pickupWeight} g</span>
              </div>
              <input 
                type="range" 
                min="1000" 
                max="1250" 
                step="5"
                value={pickupWeight}
                onChange={(e) => setPickupWeight(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer bg-slate-800 h-2 rounded-lg"
              />
            </div>

            {/* Sweet Spot Position */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-300 font-medium">Sweet Spot Height (from Toe)</span>
                <span className="text-amber-400 font-bold">{sweetSpotPos} cm</span>
              </div>
              <input 
                type="range" 
                min="14" 
                max="28" 
                step="0.5"
                value={sweetSpotPos}
                onChange={(e) => setSweetSpotPos(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer bg-slate-800 h-2 rounded-lg"
              />
            </div>

            {/* MOI */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-300 font-medium">Moment of Inertia (MOI)</span>
                <span className="text-amber-400 font-bold">{moi} kg·cm²</span>
              </div>
              <input 
                type="range" 
                min="2100" 
                max="2800" 
                step="10"
                value={moi}
                onChange={(e) => setMoi(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer bg-slate-800 h-2 rounded-lg"
              />
            </div>

            {/* Spine & Edges */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-800">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300 font-medium">Spine Height</span>
                  <span className="text-amber-400 font-bold">{spineHeight} mm</span>
                </div>
                <input 
                  type="range" 
                  min="50" 
                  max="80" 
                  value={spineHeight}
                  onChange={(e) => setSpineHeight(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer bg-slate-800 h-2 rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300 font-medium">Edge Thickness</span>
                  <span className="text-amber-400 font-bold">{edgeThickness} mm</span>
                </div>
                <input 
                  type="range" 
                  min="30" 
                  max="45" 
                  value={edgeThickness}
                  onChange={(e) => setEdgeThickness(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer bg-slate-800 h-2 rounded-lg"
                />
              </div>
            </div>

          </div>
        </div>

        {/* Analytics & Performance Column (1 span) */}
        <div className="space-y-6">
          
          {/* OPI Score Card */}
          <div className="bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/30 rounded-2xl p-6 text-center relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="inline-flex p-3 bg-amber-500/20 text-amber-400 rounded-2xl mb-3">
              <Award className="w-8 h-8" />
            </div>
            
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Optimal Profile Index (OPI)</h3>
            
            <div className="my-4 flex items-baseline justify-center gap-1">
              <span className="text-6xl font-black text-white tracking-tight">{opiScore}</span>
              <span className="text-xl font-bold text-amber-400">/ 100</span>
            </div>

            <p className="text-xs text-slate-400 px-4">
              {pitchCondition === 'hard_bouncy' 
                ? "Calibrated for Hard & Bouncy conditions (Target sweet spot ~23cm)." 
                : "Calibrated for Low & Slow conditions (Target sweet spot ~18cm)."}
            </p>
          </div>

          {/* Quick Metrics Breakdown */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4 backdrop-blur-md">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-amber-400" />
              Profile Analysis
            </h4>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
                <span className="text-slate-400">Bat Balance Ratio</span>
                <span className="font-semibold text-slate-200">{(totalWeight - pickupWeight > 50) ? 'Feather Pickup' : 'Substantial Feel'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
                <span className="text-slate-400">Inertia Rating</span>
                <span className="font-semibold text-slate-200">{moi > 2500 ? 'Heavy Swing' : 'Quick Hand Speed'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
                <span className="text-slate-400">Rebound Energy (COR)</span>
                <span className="font-semibold text-amber-400">{cor}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-400">Sweet Spot Alignment</span>
                <span className="font-semibold text-emerald-400">Optimal Bell-Curve</span>
              </div>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}