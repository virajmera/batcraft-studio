import React, { useState, useEffect } from 'react';
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
  Award,
  Link2,
  Unlink
} from 'lucide-react';

export default function App() {
  // State for Primary Bat Parameters
  const [totalWeight, setTotalWeight] = useState(1180); // in grams (~2lb 9.6oz)
  const [sweetSpotPos, setSweetSpotPos] = useState(21); // cm from toe
  const [spineHeight, setSpineHeight] = useState(64); // mm
  const [edgeThickness, setEdgeThickness] = useState(38); // mm
  const [pitchCondition, setPitchCondition] = useState('hard_bouncy'); // 'hard_bouncy' or 'low_slow'
  const [cor, setCor] = useState(0.55); // Coefficient of Restitution

  // Interconnected Physics Linking Toggle
  const [autoLinkPhysics, setAutoLinkPhysics] = useState(true);

  // Derived / Dependent State
  const [pickupWeight, setPickupWeight] = useState(1120); // feel weight in grams
  const [moi, setMoi] = useState(2400); // Moment of Inertia (kg.cm^2)

  // Real-world Physics Coupling Effect
  // Higher sweet spot & thicker spine/edges move center of mass upward, increasing MOI & Pickup Weight
 // Real-world Physics Coupling Effect (Dynamic MOI & Pickup)
  useEffect(() => {
    if (autoLinkPhysics) {
      // Dynamic leverage multiplier:
      // Moving sweet spot higher shifts mass outward relative to the pivot (hands), 
      // heavily increasing rotational inertia (MOI).
      const computedMoi = Math.round(
        1600 + 
        (totalWeight * 0.42) + 
        ((sweetSpotPos - 14) * 35) +  // Increased multiplier from 18 to 35 for higher sensitivity
        ((spineHeight - 50) * 8.5) +  // Increased spine impact
        ((edgeThickness - 30) * 6.0)  // Increased edge thickness impact
      );

      // Pickup feel reacts heavily to sweet spot height and mass concentration
      const computedPickup = Math.round(
        totalWeight - 90 + 
        ((sweetSpotPos - 18) * 12) + 
        ((spineHeight - 60) * 3.5)
      );

      setMoi(Math.min(Math.max(computedMoi, 2100), 2850));
      setPickupWeight(Math.min(Math.max(computedPickup, 1000), 1280));
    }
  }, [totalWeight, sweetSpotPos, spineHeight, edgeThickness, autoLinkPhysics]);

      // Pickup weight increases if sweet spot is higher (higher center of gravity)
      const computedPickup = Math.round(
        totalWeight - 80 + ((sweetSpotPos - 18) * 6) + ((spineHeight - 60) * 1.5)
      );

      setMoi(computedMoi);
      setPickupWeight(computedPickup);
    }
  }, [totalWeight, sweetSpotPos, spineHeight, edgeThickness, autoLinkPhysics]);

  // Calculated Metrics: Dynamic Pitch-Dependent Sweet Spot Physics + Interdependent MOI Impact
  const calculateOPI = () => {
    const weightFactor = Math.max(0, 10 - Math.abs(totalWeight - 1170) / 15);
    
    // Dynamic ideal sweet spot based on pitch conditions:
    // Hard & Bouncy -> Higher sweet spot (~23cm)
    // Low & Slow -> Lower sweet spot (~18cm)
    const idealSweetSpot = pitchCondition === 'hard_bouncy' ? 23 : 18;
    const sweetSpotDeviation = Math.abs(sweetSpotPos - idealSweetSpot);
    
    // Bell-curve scoring: score drops quadratically as you move away from the pitch-optimized height
    const sweetSpotFactor = Math.max(0, 18 - (sweetSpotDeviation * sweetSpotDeviation * 1.5));

    // MOI coupling penalty: higher sweet spot raises MOI, which reduces swing speed unless balanced
    const idealMoiForSweetSpot = 2200 + (sweetSpotPos * 12);
    const moiDeviation = Math.abs(moi - idealMoiForSweetSpot);
    const moiPenalty = moiDeviation / 40;

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
    setAutoLinkPhysics(true);
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
              <p className="text-sm text-slate-400">Advanced Cricket Bat Physics & Interdependent Engineering</p>
            </div>
          </div>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-4">
          <button
            onClick={() => setAutoLinkPhysics(!autoLinkPhysics)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-sm font-medium transition-all cursor-pointer ${
              autoLinkPhysics 
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-300' 
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {autoLinkPhysics ? <Link2 className="w-4 h-4 text-amber-400" /> : <Unlink className="w-4 h-4 text-slate-500" />}
            {autoLinkPhysics ? 'Physics Linked: ON' : 'Physics Linked: OFF'}
          </button>
          
          <button 
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-sm font-medium transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-slate-400" />
            Reset
          </button>
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
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-400" />
                Physical Specifications
              </h2>
              {autoLinkPhysics && (
                <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-md">
                  Interdependent Coupling Active
                </span>
              )}
            </div>

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
              {autoLinkPhysics && (
                <p className="text-[11px] text-slate-500 italic">
                  * Raising sweet spot shifts mass higher, automatically raising MOI and Pickup Feel.
                </p>
              )}
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

            {/* Derived Dynamics Section (MOI & Pickup) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800/80 bg-slate-950/40 p-4 rounded-xl border border-slate-800">
              {/* Pickup Weight */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300 font-medium flex items-center gap-1.5">
                    Pickup Feel
                    {autoLinkPhysics && <span className="text-[10px] text-amber-400 font-mono">(Auto)</span>}
                  </span>
                  <span className="text-amber-400 font-bold">{pickupWeight} g</span>
                </div>
                <input 
                  type="range" 
                  min="1000" 
                  max="1250" 
                  step="5"
                  disabled={autoLinkPhysics}
                  value={pickupWeight}
                  onChange={(e) => setPickupWeight(Number(e.target.value))}
                  className={`w-full h-2 rounded-lg ${autoLinkPhysics ? 'accent-amber-500/50 opacity-60 cursor-not-allowed bg-slate-800' : 'accent-amber-500 cursor-pointer bg-slate-800'}`}
                />
              </div>

              {/* MOI */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300 font-medium flex items-center gap-1.5">
                    Moment of Inertia (MOI)
                    {autoLinkPhysics && <span className="text-[10px] text-amber-400 font-mono">(Auto)</span>}
                  </span>
                  <span className="text-amber-400 font-bold">{moi} kg·cm²</span>
                </div>
                <input 
                  type="range" 
                  min="2100" 
                  max="2800" 
                  step="10"
                  disabled={autoLinkPhysics}
                  value={moi}
                  onChange={(e) => setMoi(Number(e.target.value))}
                  className={`w-full h-2 rounded-lg ${autoLinkPhysics ? 'accent-amber-500/50 opacity-60 cursor-not-allowed bg-slate-800' : 'accent-amber-500 cursor-pointer bg-slate-800'}`}
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

          {/* Dynamic Physics Insights Breakdown */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4 backdrop-blur-md">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-amber-400" />
              Interdependent Physics Analysis
            </h4>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
                <span className="text-slate-400">Mass Distribution</span>
                <span className="font-semibold text-slate-200">
                  {sweetSpotPos > 22 ? 'Top-Heavy Profile' : sweetSpotPos < 19 ? 'Low-Weighted Toe' : 'Mid Balanced'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
                <span className="text-slate-400">Pickup Index Ratio</span>
                <span className="font-semibold text-slate-200">
                  {(totalWeight - pickupWeight) > 60 ? 'Light & Feathered' : 'Substantial Inertia'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
                <span className="text-slate-400">Inertia Class (MOI)</span>
                <span className="font-semibold text-amber-400">
                  {moi > 2550 ? 'High Power / Slow Turn' : moi < 2300 ? 'Rapid Hand Speed' : 'Balanced Swing'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-400">Physics Coupling</span>
                <span className="font-semibold text-emerald-400">
                  {autoLinkPhysics ? 'Real-World Linked' : 'Manual Overrides'}
                </span>
              </div>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}