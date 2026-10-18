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
  useEffect(() => {
    if (autoLinkPhysics) {
      // Base MOI calculation based on mass distribution & sweet spot leverage
      const computedMoi = Math.round(
        1800 + 
        (totalWeight * 0.35) + 
        (sweetSpotPos * 18) + 
        (spineHeight * 3.5) + 
        (edgeThickness * 2.5)
      );

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