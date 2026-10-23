import React, { useState } from 'react';
import {
  Sliders,
  RotateCcw,
  Shield,
  Compass,
  BarChart2,
  Award,
} from 'lucide-react';

// Pitch presets set all six pitch metrics at once. Editing any metric switches to the custom pitch.
const PITCH_PRESETS = {
  hard_bouncy: { pace: 6, bounce: 8, grassCover: 30, moisture: 2, hardness: 8, turn: 3 },
  low_slow: { pace: 2, bounce: 3, grassCover: 80, moisture: 8, hardness: 4, turn: 6 },
};

const PITCH_LABELS = { hard_bouncy: 'Hard & Bouncy', low_slow: 'Low & Slow', custom: 'Custom' };

const PITCH_CONTROLS = [
  { key: 'pace', label: 'Pace', min: 1, max: 10, step: 1, low: 'Slow', high: 'Fast' },
  { key: 'bounce', label: 'Bounce', min: 1, max: 10, step: 1, low: 'Low', high: 'High' },
  { key: 'grassCover', label: 'Grass Cover', min: 0, max: 100, step: 5, unit: '%' },
  { key: 'moisture', label: 'Moisture', min: 1, max: 10, step: 1, low: 'Dry', high: 'Damp' },
  { key: 'hardness', label: 'Hardness', min: 1, max: 10, step: 1, low: 'Soft', high: 'Firm' },
  { key: 'turn', label: 'Turn', min: 1, max: 10, step: 1, low: 'Flat', high: 'Spinning' },
];

// Ideal sweet spot height (cm) for a pitch.
// Bounce and hardness raise it; pace, grass cover, moisture and turn lower it.
const getIdealSweetSpot = (pitch) =>
  20 +
  0.4 * (pitch.bounce - 5) +
  0.3 * (pitch.hardness - 5) -
  0.2 * (pitch.pace - 5) -
  0.03 * (pitch.grassCover - 50) -
  0.1 * (pitch.moisture - 5) -
  0.1 * (pitch.turn - 5);

export default function App() {
  // State for Primary Bat Parameters
  const [totalWeight, setTotalWeight] = useState(1180); // in grams (~2lb 9.6oz)
  const [sweetSpotPos, setSweetSpotPos] = useState(21); // cm from toe
  const [spineHeight, setSpineHeight] = useState(64); // mm
  const [edgeThickness, setEdgeThickness] = useState(38); // mm
  const [pitchCondition, setPitchCondition] = useState('hard_bouncy'); // 'hard_bouncy', 'low_slow' or 'custom'
  const [pitch, setPitch] = useState(PITCH_PRESETS.hard_bouncy); // the six pitch metrics
  const [cor, setCor] = useState(0.55); // Coefficient of Restitution

  // Real-world Physics Coupling Effect (always on)
  // Higher sweet spot & thicker spine/edges move center of mass upward, increasing MOI & Pickup Weight.
  // Dynamic leverage multiplier: moving the sweet spot higher shifts mass outward relative to the
  // pivot (hands), heavily increasing rotational inertia (MOI).
  const moi = Math.min(
    Math.max(
      Math.round(
        1600 +
        (totalWeight * 0.42) +
        ((sweetSpotPos - 14) * 35) +
        ((spineHeight - 50) * 8.5) +
        ((edgeThickness - 30) * 6.0)
      ),
      2100
    ),
    2850
  ); // Moment of Inertia (kg.cm^2)

  // Pickup feel reacts heavily to sweet spot height and mass concentration
  const pickupWeight = Math.min(
    Math.max(
      Math.round(
        totalWeight - 90 +
        ((sweetSpotPos - 18) * 12) +
        ((spineHeight - 60) * 3.5)
      ),
      1000
    ),
    1280
  ); // feel weight in grams

  // Ideal sweet spot for the selected pitch, from its metrics
  const idealSweetSpot = getIdealSweetSpot(pitch);

  const applyPreset = (name) => {
    setPitchCondition(name);
    setPitch(PITCH_PRESETS[name]);
  };

  const updatePitch = (key, value) => {
    setPitchCondition('custom');
    setPitch((prev) => ({ ...prev, [key]: value }));
  };

  // Calculated Metrics: Dynamic Pitch-Dependent Sweet Spot Physics + Interdependent MOI Impact
  const calculateOPI = () => {
    const weightFactor = Math.max(0, 10 - Math.abs(totalWeight - 1170) / 15);

    // Bell-curve scoring: score drops quadratically as you move away from the pitch-optimized height
    const sweetSpotDeviation = Math.abs(sweetSpotPos - idealSweetSpot);
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
    setPitch(PITCH_PRESETS.hard_bouncy);
    setCor(0.55);
    setTotalWeight(1180);
    setSweetSpotPos(21);
    setSpineHeight(64);
    setEdgeThickness(38);
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 p-4 md:p-8 font-sans">
      {/* Header */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center border-b border-zinc-800 pb-6 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/10 border border-purple-500/30 rounded-xl text-purple-400">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">BatCraft Studio</h1>
              <p className="text-sm text-zinc-400">Advanced Cricket Bat Physics & Interdependent Engineering</p>
            </div>
          </div>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-4">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-xl text-sm font-medium transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-zinc-400" />
            Reset
          </button>
        </div>
      </header>

      {/* Main Dashboard Grid */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Controls Column (2 spans) */}
        <div className="lg:col-span-2 space-y-6">

          {/* Pitch & Environmental Setup */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Compass className="w-5 h-5 text-purple-400" />
              Pitch Condition & Environment
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => applyPreset('hard_bouncy')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  pitchCondition === 'hard_bouncy'
                    ? 'bg-purple-500/10 border-purple-500/50 text-purple-300'
                    : 'bg-zinc-950/40 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className="font-bold text-base mb-1">Hard & Bouncy Pitch</div>
                <p className="text-xs text-zinc-400">Optimizes for higher bounce with a raised sweet spot (~23cm).</p>
              </button>

              <button
                onClick={() => applyPreset('low_slow')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  pitchCondition === 'low_slow'
                    ? 'bg-purple-500/10 border-purple-500/50 text-purple-300'
                    : 'bg-zinc-950/40 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className="font-bold text-base mb-1">Low & Slow Pitch</div>
                <p className="text-xs text-zinc-400">Optimizes for skidding deliveries with a lower sweet spot (~18cm).</p>
              </button>

              <button
                onClick={() => setPitchCondition('custom')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  pitchCondition === 'custom'
                    ? 'bg-purple-500/10 border-purple-500/50 text-purple-300'
                    : 'bg-zinc-950/40 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className="font-bold text-base mb-1">Custom Pitch</div>
                <p className="text-xs text-zinc-400">Build your own pitch from the metrics below.</p>
              </button>
            </div>

            {/* Pitch Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 mt-6 border-t border-zinc-800">
              {PITCH_CONTROLS.map((control) => (
                <div key={control.key} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-300 font-medium">{control.label}</span>
                    <span className="text-purple-400 font-bold">{pitch[control.key]}{control.unit ?? ''}</span>
                  </div>
                  <input
                    type="range"
                    min={control.min}
                    max={control.max}
                    step={control.step}
                    value={pitch[control.key]}
                    onChange={(e) => updatePitch(control.key, Number(e.target.value))}
                    className="w-full accent-purple-500 cursor-pointer bg-zinc-800 h-2 rounded-lg"
                  />
                  {control.low && (
                    <div className="flex justify-between text-[11px] text-zinc-500">
                      <span>{control.low}</span>
                      <span>{control.high}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Bat Parameters Sliders */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-purple-400" />
                Physical Specifications
              </h2>
              <span className="text-xs bg-purple-500/10 text-purple-400 border border-purple-500/30 px-2.5 py-1 rounded-md">
                Interdependent Coupling Active
              </span>
            </div>

            {/* Total Weight */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-300 font-medium">Total Mass (Weight)</span>
                <span className="text-purple-400 font-bold">{totalWeight} g</span>
              </div>
              <input
                type="range"
                min="1050"
                max="1300"
                step="5"
                value={totalWeight}
                onChange={(e) => setTotalWeight(Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer bg-zinc-800 h-2 rounded-lg"
              />
            </div>

            {/* Sweet Spot Position */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-300 font-medium">Sweet Spot Height (from Toe)</span>
                <span className="text-purple-400 font-bold">{sweetSpotPos} cm</span>
              </div>
              <input
                type="range"
                min="14"
                max="28"
                step="0.5"
                value={sweetSpotPos}
                onChange={(e) => setSweetSpotPos(Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer bg-zinc-800 h-2 rounded-lg"
              />
              <p className="text-[11px] text-zinc-500 italic">
                * Raising sweet spot shifts mass higher, automatically raising MOI and Pickup Feel.
              </p>
            </div>

            {/* Spine & Edges */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-zinc-800">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-300 font-medium">Spine Height</span>
                  <span className="text-purple-400 font-bold">{spineHeight} mm</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="80"
                  value={spineHeight}
                  onChange={(e) => setSpineHeight(Number(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer bg-zinc-800 h-2 rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-300 font-medium">Edge Thickness</span>
                  <span className="text-purple-400 font-bold">{edgeThickness} mm</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="45"
                  value={edgeThickness}
                  onChange={(e) => setEdgeThickness(Number(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer bg-zinc-800 h-2 rounded-lg"
                />
              </div>
            </div>

            {/* Derived Dynamics Section (MOI & Pickup), calculated from the specs above */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-zinc-800/80 bg-zinc-950/40 p-4 rounded-xl border border-zinc-800">
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-300 font-medium">Pickup Feel</span>
                  <span className="text-purple-400 font-bold">{pickupWeight} g</span>
                </div>
                <p className="text-[11px] text-zinc-500">Calculated from mass and sweet spot.</p>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-300 font-medium">Moment of Inertia (MOI)</span>
                  <span className="text-purple-400 font-bold">{moi} kg·cm²</span>
                </div>
                <p className="text-[11px] text-zinc-500">Calculated from mass, sweet spot, spine and edges.</p>
              </div>
            </div>

          </div>
        </div>

        {/* Analytics & Performance Column (1 span) */}
        <div className="space-y-6">

          {/* OPI Score Card */}
          <div className="bg-zinc-950 border border-purple-500/30 rounded-2xl p-6 text-center relative overflow-hidden">

            <div className="inline-flex p-3 bg-purple-500/20 text-purple-400 rounded-2xl mb-3">
              <Award className="w-8 h-8" />
            </div>

            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Optimal Profile Index (OPI)</h3>

            <div className="my-4 flex items-baseline justify-center gap-1">
              <span className="text-6xl font-black text-white tracking-tight">{opiScore}</span>
              <span className="text-xl font-bold text-purple-400">/ 100</span>
            </div>

            <p className="text-xs text-zinc-400 px-4">
              {`Calibrated for ${PITCH_LABELS[pitchCondition]} conditions (Target sweet spot ~${idealSweetSpot.toFixed(1)}cm).`}
            </p>
          </div>

          {/* Dynamic Physics Insights Breakdown */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-purple-400" />
              Interdependent Physics Analysis
            </h4>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-zinc-800/60">
                <span className="text-zinc-400">Mass Distribution</span>
                <span className="font-semibold text-zinc-200">
                  {sweetSpotPos > 22 ? 'Top-Heavy Profile' : sweetSpotPos < 19 ? 'Low-Weighted Toe' : 'Mid Balanced'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-zinc-800/60">
                <span className="text-zinc-400">Pickup Index Ratio</span>
                <span className="font-semibold text-zinc-200">
                  {(totalWeight - pickupWeight) > 60 ? 'Light & Feathered' : 'Substantial Inertia'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-zinc-400">Inertia Class (MOI)</span>
                <span className="font-semibold text-purple-400">
                  {moi > 2550 ? 'High Power / Slow Turn' : moi < 2300 ? 'Rapid Hand Speed' : 'Balanced Swing'}
                </span>
              </div>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
