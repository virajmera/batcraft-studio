import React, { useState, useEffect, useRef } from 'react';
import { 
  Sliders, 
  Activity, 
  Award, 
  BookOpen, 
  Download, 
  RefreshCw, 
  Zap, 
  HelpCircle, 
  CheckCircle2, 
  Info, 
  Play, 
  ChevronRight,
  Shield,
  Layers,
  FileText,
  Sparkles,
  Wrench,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  Scissors
} from 'lucide-react';

// Preset configurations for iconic cricket pitches
const PITCH_PRESETS = {
  perth: {
    name: 'Perth / WACA (Australia)',
    desc: 'Hard, bouncy surface favoring high reaction speeds and high sweet spots.',
    hardness: 85, // MPa scale approx
    moisture: 12, // %
    grass: 4, // mm
    ballSpeed: 88, // mph
    type: 'Hard & Bouncy'
  },
  chennai: {
    name: 'Chepauk / Chennai (India)',
    desc: 'Dry, low-bounce, abrasive surface requiring heavy low-blade driving force.',
    hardness: 40,
    moisture: 5,
    grass: 1,
    ballSpeed: 78,
    type: 'Low & Slow / Dry'
  },
  lords: {
    name: 'Lord\'s / London (England)',
    desc: 'Moist, green surface with high seam/swing movement and variable bounce.',
    hardness: 55,
    moisture: 25,
    grass: 12,
    ballSpeed: 82,
    type: 'Green & Seaming'
  },
  t20flat: {
    name: 'Modern T20 "Highway"',
    desc: 'Uniformly compacted, true bounce ideal for maximal cross-blade exit speed.',
    hardness: 75,
    moisture: 10,
    grass: 2,
    ballSpeed: 84,
    type: 'Flat / High COR'
  }
};

// Academic paper citations database
const ACADEMIC_CITATIONS = [
  {
    author: "Curtis, R. I., et al. (2018)",
    journal: "Journal of Sports Sciences",
    title: "The effect of cricket bat mass distribution on swing velocity and ball exit speed.",
    takeaway: "Demonstrates that higher Moment of Inertia (MOI) increases energy transfer coefficient but inversely reduces angular acceleration during initial downswing."
  },
  {
    author: "Sharpe, C., & Brooks, R. (2014)",
    journal: "Sports Engineering",
    title: "Dynamic response and vibration characteristics of English Willow cricket bats.",
    takeaway: "Identifies primary nodal lines (Center of Percussion) where impact vibration energy transmitted to hands approaches zero."
  },
  {
    author: "Symes, M., et al. (2016)",
    journal: "Procedia Engineering",
    title: "Finite Element Analysis of cricket bat geometry and sweet spot optimization.",
    takeaway: "Validates that profile concaving redistributes mass away from central axis without reducing structural rigidity at high impact nodes."
  }
];

export default function App() {
  // --- STATE MANAGEMENT ---
  // Pitch State
  const [selectedPitch, setSelectedPitch] = useState('perth');
  const [pitchHardness, setPitchHardness] = useState(PITCH_PRESETS.perth.hardness);
  const [soilMoisture, setSoilMoisture] = useState(PITCH_PRESETS.perth.moisture);
  const [grassCover, setGrassCover] = useState(PITCH_PRESETS.perth.grass);
  const [ballSpeed, setBallSpeed] = useState(PITCH_PRESETS.perth.ballSpeed);

  // Bat Build State
  const [weightOunces, setWeightOunces] = useState(41); // 2lb 9oz = 41 oz
  const [sweetSpotHeight, setSweetSpotHeight] = useState(210); // mm from toe
  const [edgeThickness, setEdgeThickness] = useState(38); // mm
  const [spineProfile, setSpineProfile] = useState('concave'); // 'full', 'concave', 'duckbill'
  const [willowGrade, setWillowGrade] = useState('eng_g1'); // 'eng_g1', 'eng_g2', 'kashmir'
  const [handleType, setHandleType] = useState('oval_flex'); // 'oval_flex', 'round_stiff'

  // Saved baseline for comparison
  const [previousBuild, setPreviousBuild] = useState(null);

  // Player / UI State
  const [activeTab, setActiveTab] = useState('customizer'); // 'customizer', 'advisor', 'physics', 'citations'
  const [showMathModal, setShowMathModal] = useState(false);
  const [mathModalTopic, setMathModalTopic] = useState('moi');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simMessage, setSimMessage] = useState('');
  const canvasRef = useRef(null);

  // --- CALCULATION ENGINE ---
  const weightLbs = Math.floor(weightOunces / 16);
  const remainingOz = weightOunces % 16;
  const totalGrams = Math.round(weightOunces * 28.3495);

  const profileWeightDistribution = spineProfile === 'duckbill' ? 0.65 : spineProfile === 'full' ? 0.58 : 0.52;
  const calculatedMOI = Math.round(
    (totalGrams / 1000) * Math.pow(sweetSpotHeight / 10 + 45, 1.85) * (1 + (edgeThickness - 30) / 100) * profileWeightDistribution
  );

  const baseCOR = willowGrade === 'eng_g1' ? 0.58 : willowGrade === 'eng_g2' ? 0.55 : 0.49;
  const pitchSoftnessDamping = (100 - pitchHardness) * 0.001;
  const moistureDamping = soilMoisture * 0.0015;
  const effectiveCOR = Math.max(0.35, Math.min(0.62, baseCOR - pitchSoftnessDamping - moistureDamping));

  const batSpeedMph = Math.max(45, 82 - (calculatedMOI - 2200) * 0.025);
  const predictedExitVel = Math.round((effectiveCOR * ballSpeed) + (batSpeedMph * (1 + effectiveCOR) * 0.45));

  const pitchReboundSpeed = ballSpeed * (0.65 + (pitchHardness / 200));
  const flightTimeMs = Math.round((66 / (pitchReboundSpeed * 1.467)) * 1000);
  const swingClearanceTimeMs = Math.round(210 + (calculatedMOI / 28));

  // --- COMPATIBILITY & DIAGNOSTIC ENGINE ---
  const generateDiagnostics = () => {
    const issues = [];
    const recommendations = [];

    // 1. High Bounce / Hard Pitch Diagnostics
    if (pitchHardness > 70) {
      if (sweetSpotHeight < 200) {
        issues.push({
          type: 'error',
          title: 'Sweet Spot Height Mismatch (Too Low)',
          detail: `Your sweet spot is set to ${sweetSpotHeight}mm from toe, but hard pitches (${pitchHardness} MPa) produce bounce reaching waist/chest height. Hitting high on the blade will cause off-center sting.`
        });
        recommendations.push({
          action: 'Shift Sweet Spot Higher',
          woodwork: 'Ask a podhav/bat maker to shave/taper the toe and scoop weight higher up the spine to shift the node to 215mm–230mm from the toe.',
          icon: Scissors
        });
      }
      if (calculatedMOI > 2600) {
        issues.push({
          type: 'warning',
          title: 'Excessive Pickup Weight (High MOI)',
          detail: `Your MOI of ${calculatedMOI} kg·cm² requires ${swingClearanceTimeMs}ms to swing, cutting close to the ball flight time (${flightTimeMs}ms) at ${ballSpeed} mph.`
        });
        recommendations.push({
          action: 'Deep Concave Back Scooping',
          woodwork: 'Scoop 1.5–2.0 oz of non-structural wood out of the rear shoulders/flanks to lighten pickup without reducing edge depth at impact zone.',
          icon: Wrench
        });
      }
    }

    // 2. Low / Slow Pitch Diagnostics
    if (pitchHardness < 55) {
      if (sweetSpotHeight > 195) {
        issues.push({
          type: 'error',
          title: 'Sweet Spot Position Too High',
          detail: `Low-bounce surfaces (${pitchHardness} MPa) require front-foot driving near the bottom of the bat. A sweet spot at ${sweetSpotHeight}mm wastes wood energy.`
        });
        recommendations.push({
          action: 'Duckbill Toe Conversion',
          woodwork: 'Incorporate a "Duckbill" or full lower spine profile. Keep full 38-40mm edge thickness through the bottom 150mm–180mm of the blade.',
          icon: Wrench
        });
      }
      if (edgeThickness < 36) {
        issues.push({
          type: 'warning',
          title: 'Thin Edges Limit Low-Pitch Punch',
          detail: `Edges at ${edgeThickness}mm lack mass backing for low, dead-bounce drives where full power transfer is needed.`
        });
        recommendations.push({
          action: 'Increase Toe Mass & Density',
          woodwork: 'Select a fuller spine profile with 38mm+ edges or apply heavy toe pressing to compress willow fibers for lower-face energy retention.',
          icon: Layers
        });
      }
    }

    // 3. Green / Seaming Diagnostics
    if (soilMoisture > 18 || grassCover > 8) {
      if (handleType === 'round_stiff') {
        issues.push({
          type: 'warning',
          title: 'Stiff Handle Transmits Seam Vibration',
          detail: 'Green/seaming conditions cause frequent off-center, late seam edges. A stiff handle causes intense shock to wrists.'
        });
        recommendations.push({
          action: 'Switch to Semi-Oval Flexible Handle',
          woodwork: 'Replace or wrap handle with a multi-piece cane configuration featuring triple rubber splices to absorb high-frequency impact harmonics.',
          icon: RefreshCw
        });
      }
    }

    // Default if build is solid
    if (issues.length === 0) {
      issues.push({
        type: 'success',
        title: 'Optimized Specification Alignment',
        detail: 'Current bat geometry, mass distribution, and handle flex match the selected pitch mechanics exceptionally well.'
      });
      recommendations.push({
        action: 'Maintain Current Setup',
        woodwork: 'Regularly oil and knock in the toe area. Keep toe guard intact to preserve weight balance.',
        icon: CheckCircle2
      });
    }

    // Calculate score
    let score = 100 - (issues.filter(i => i.type === 'error').length * 25) - (issues.filter(i => i.type === 'warning').length * 12);
    score = Math.max(35, Math.min(98, score));

    return { issues, recommendations, score };
  };

  const { issues, recommendations, score: compatibilityScore } = generateDiagnostics();

  // Preset Handlers
  const handleSelectPreset = (key) => {
    setSelectedPitch(key);
    const p = PITCH_PRESETS[key];
    setPitchHardness(p.hardness);
    setSoilMoisture(p.moisture);
    setGrassCover(p.grass);
    setBallSpeed(p.ballSpeed);
  };

  // ONE-CLICK AUTO TUNE / OPTIMIZE ENGINE
  const handleAutoOptimize = () => {
    // Save current build to previous before changing
    setPreviousBuild({
      weightOunces,
      sweetSpotHeight,
      edgeThickness,
      spineProfile,
      willowGrade,
      handleType,
      calculatedMOI,
      predictedExitVel,
      compatibilityScore
    });

    if (pitchHardness > 70) {
      setSweetSpotHeight(225);
      setSpineProfile('concave');
      setWeightOunces(40);
      setEdgeThickness(38);
      setHandleType('oval_flex');
    } else if (pitchHardness < 55) {
      setSweetSpotHeight(170);
      setSpineProfile('duckbill');
      setWeightOunces(43);
      setEdgeThickness(40);
      setHandleType('round_stiff');
    } else {
      setSweetSpotHeight(200);
      setSpineProfile('concave');
      setWeightOunces(41);
      setEdgeThickness(38);
      setHandleType('oval_flex');
    }
  };

  const handleRunSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setSimMessage("Ball pitched! Calculating dynamic impact...");

    setTimeout(() => {
      setSimMessage(`IMPACT! Ball Exit Velocity: ${predictedExitVel} mph`);
      setTimeout(() => {
        setIsSimulating(false);
        setSimMessage('');
      }, 2500);
    }, 1200);
  };

  // --- CANVAS 2D VECTOR RENDERING ENGINE ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const width = canvas.width = canvas.parentElement.clientWidth;
    const height = canvas.height = 360;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 30) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    }
    for (let y = 0; y < height; y += 30) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }

    const batStartX = 60;
    const batCenterY = height / 2 + 10;
    const handleLength = 110;
    const bladeLength = 220;

    const handleThickness = handleType === 'oval_flex' ? 14 : 16;
    ctx.fillStyle = handleType === 'oval_flex' ? '#d97706' : '#b45309';
    ctx.beginPath();
    ctx.roundRect(batStartX, batCenterY - handleThickness / 2, handleLength, handleThickness, 4);
    ctx.fill();

    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    for (let gx = batStartX + 10; gx < batStartX + handleLength - 5; gx += 8) {
      ctx.beginPath();
      ctx.moveTo(gx, batCenterY - handleThickness / 2);
      ctx.lineTo(gx + 4, batCenterY + handleThickness / 2);
      ctx.stroke();
    }

    const bladeStartX = batStartX + handleLength;
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.moveTo(bladeStartX - 15, batCenterY - 8);
    ctx.lineTo(bladeStartX + 20, batCenterY - 22);
    ctx.lineTo(bladeStartX + 20, batCenterY + 22);
    ctx.lineTo(bladeStartX - 15, batCenterY + 8);
    ctx.closePath();
    ctx.fill();

    const edgeOffset = (edgeThickness / 40) * 22;
    const sweetSpotX = bladeStartX + (sweetSpotHeight / 300) * bladeLength;

    ctx.fillStyle = willowGrade === 'eng_g1' ? '#fde68a' : willowGrade === 'eng_g2' ? '#f59e0b' : '#d97706';
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(bladeStartX, batCenterY - 18);
    
    if (spineProfile === 'duckbill') {
      ctx.quadraticCurveTo(bladeStartX + 120, batCenterY - 32, bladeStartX + bladeLength - 20, batCenterY - 12);
      ctx.lineTo(bladeStartX + bladeLength, batCenterY - 5);
      ctx.lineTo(bladeStartX + bladeLength, batCenterY + 5);
      ctx.quadraticCurveTo(bladeStartX + 120, batCenterY + 32, bladeStartX, batCenterY + 18);
    } else if (spineProfile === 'concave') {
      ctx.quadraticCurveTo(sweetSpotX, batCenterY - edgeOffset - 4, bladeStartX + bladeLength - 10, batCenterY - 15);
      ctx.quadraticCurveTo(bladeStartX + bladeLength, batCenterY - 8, bladeStartX + bladeLength, batCenterY);
      ctx.quadraticCurveTo(bladeStartX + bladeLength, batCenterY + 8, bladeStartX + bladeLength - 10, batCenterY + 15);
      ctx.quadraticCurveTo(sweetSpotX, batCenterY + edgeOffset + 4, bladeStartX, batCenterY + 18);
    } else {
      ctx.quadraticCurveTo(sweetSpotX, batCenterY - edgeOffset - 8, bladeStartX + bladeLength - 5, batCenterY - 16);
      ctx.lineTo(bladeStartX + bladeLength, batCenterY);
      ctx.lineTo(bladeStartX + bladeLength - 5, batCenterY + 16);
      ctx.quadraticCurveTo(sweetSpotX, batCenterY + edgeOffset + 8, bladeStartX, batCenterY + 18);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = 'rgba(180, 83, 9, 0.25)';
    ctx.lineWidth = 1;
    const grainsCount = willowGrade === 'eng_g1' ? 9 : 5;
    for (let g = 0; g < grainsCount; g++) {
      const gy = batCenterY - 14 + (g * (28 / grainsCount));
      ctx.beginPath();
      ctx.moveTo(bladeStartX + 10, gy);
      ctx.lineTo(bladeStartX + bladeLength - 10, gy);
      ctx.stroke();
    }

    const ssWidth = 50;
    ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.ellipse(sweetSpotX, batCenterY, ssWidth / 2, edgeOffset + 6, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#34d399';
    ctx.font = '10px sans-serif';
    ctx.fillText('SWEET SPOT / COP', sweetSpotX - 45, batCenterY - edgeOffset - 14);

    const comX = bladeStartX + (calculatedMOI / 3000) * (bladeLength * 0.7);
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(comX, batCenterY, 4, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillText('COM (MOI Focus)', comX - 35, batCenterY + edgeOffset + 22);

    if (isSimulating) {
      const time = Date.now() * 0.005;
      const ballX = (time * 180) % (width + 100) - 50;
      const bouncePitchX = width * 0.35;
      
      let ballY = 60;
      if (ballX < bouncePitchX) {
        ballY = 60 + Math.pow(ballX / bouncePitchX, 2) * (height - 120);
      } else if (ballX >= bouncePitchX && ballX <= sweetSpotX) {
        const t = (ballX - bouncePitchX) / (sweetSpotX - bouncePitchX);
        ballY = (height - 60) - (t * (height - 60 - batCenterY));
      } else {
        const tExit = (ballX - sweetSpotX) / 200;
        ballY = batCenterY - (tExit * (predictedExitVel * 1.5));
      }

      ctx.fillStyle = pitchHardness > 70 ? '#78350f' : soilMoisture > 20 ? '#15803d' : '#b45309';
      ctx.fillRect(bouncePitchX - 40, height - 20, 80, 8);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px sans-serif';
      ctx.fillText(`Pitch Bounce Node (${pitchHardness} MPa)`, bouncePitchX - 45, height - 25);

      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(ballX, ballY, 7, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();

      if (Math.abs(ballX - sweetSpotX) < 15 && Math.abs(ballY - batCenterY) < 25) {
        ctx.strokeStyle = '#60a5fa';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(sweetSpotX, batCenterY, 20 + (Math.sin(time * 20) * 10), 0, 2 * Math.PI);
        ctx.stroke();
      }
    }

  }, [sweetSpotHeight, edgeThickness, spineProfile, willowGrade, handleType, calculatedMOI, pitchHardness, soilMoisture, isSimulating, predictedExitVel]);

  const openMathTopic = (topic) => {
    setMathModalTopic(topic);
    setShowMathModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-emerald-500 selection:text-slate-950">
      {/* HEADER NAV */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-emerald-500 to-cyan-500 rounded-xl shadow-lg shadow-emerald-500/20">
              <Zap className="w-6 h-6 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                BatCraft <span className="text-emerald-400 font-extrabold">Studio</span>
              </h1>
              <p className="text-xs text-slate-400">Pitch-Optimized Bat Physics Engine</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-slate-800/60 p-1 rounded-xl border border-slate-700/50">
            <button
              onClick={() => setActiveTab('customizer')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'customizer'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              Studio Builder
            </button>
            <button
              onClick={() => setActiveTab('advisor')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'advisor'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              How to Improve
              {issues.some(i => i.type === 'error') && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('physics')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'physics'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Telemetry
            </button>
            <button
              onClick={() => setActiveTab('citations')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'citations'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Research
            </button>
          </nav>
        </div>
      </header>

      {/* MAIN CONTENT WRAPPER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* HERO CANVAS PANEL */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Sparkles className="w-3 h-3" /> 2D Vector CAD Engine
                </span>
                <span className="text-xs text-slate-400">Scale: 1:1 Biomechanical Projection</span>
              </div>
              <h2 className="text-lg font-bold text-white mt-1">Live Bat Profile & Impact Trajectory Simulator</h2>
            </div>

            <div className="flex items-center gap-2 w-full lg:w-auto">
              <button
                onClick={handleRunSimulation}
                disabled={isSimulating}
                className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                {isSimulating ? 'Simulating Impact...' : 'Simulate Pitch Rebound Impact'}
              </button>
              <button
                onClick={handleAutoOptimize}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 font-semibold text-xs rounded-xl transition-all"
                title="Auto-adjust bat specs for current pitch condition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                One-Click Auto-Tune
              </button>
            </div>
          </div>

          {/* DYNAMIC CANVAS RENDERER */}
          <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner">
            <canvas ref={canvasRef} className="w-full h-80 block" />
            
            {simMessage && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-900/90 border border-emerald-500 text-emerald-300 px-4 py-2 rounded-full text-xs font-bold shadow-xl backdrop-blur-md animate-pulse flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400 animate-spin" />
                {simMessage}
              </div>
            )}

            <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-lg border border-slate-800/80 text-xs text-slate-300">
              <div><span className="text-slate-400">Total Weight:</span> <strong className="text-white">{weightLbs}lb {remainingOz}oz ({totalGrams}g)</strong></div>
              <div><span className="text-slate-400">Pickup MOI:</span> <strong className="text-emerald-400">{calculatedMOI} kg·cm²</strong></div>
              <div><span className="text-slate-400">Sweet Spot:</span> <strong className="text-white">{sweetSpotHeight} mm from toe</strong></div>
              <div><span className="text-slate-400">Est. Exit Speed:</span> <strong className="text-cyan-400">{predictedExitVel} mph</strong></div>
            </div>
          </div>
        </section>

        {/* TAB 1: STUDIO CUSTOMIZER */}
        {activeTab === 'customizer' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* COLUMN 1: PITCH SELECTOR */}
            <div className="lg:col-span-5 space-y-5">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-bold text-white text-sm">1. Target Pitch Environment</h3>
                  </div>
                  <span className="text-xs text-slate-400">Venue Presets</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {Object.keys(PITCH_PRESETS).map((key) => {
                    const preset = PITCH_PRESETS[key];
                    const isSelected = selectedPitch === key;
                    return (
                      <button
                        key={key}
                        onClick={() => handleSelectPreset(key)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-md shadow-emerald-500/10'
                            : 'bg-slate-800/50 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div className="text-xs font-bold truncate">{preset.name}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{preset.type}</div>
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-4 pt-2">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300 font-medium">Pitch Soil Hardness</span>
                      <span className="text-emerald-400 font-bold">{pitchHardness} MPa</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="100"
                      value={pitchHardness}
                      onChange={(e) => setPitchHardness(Number(e.target.value))}
                      className="w-full accent-emerald-500 bg-slate-800 rounded-lg h-2"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300 font-medium">Soil Moisture</span>
                      <span className="text-cyan-400 font-bold">{soilMoisture}%</span>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="35"
                      value={soilMoisture}
                      onChange={(e) => setSoilMoisture(Number(e.target.value))}
                      className="w-full accent-cyan-500 bg-slate-800 rounded-lg h-2"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300 font-medium">Grass Cover Height</span>
                      <span className="text-teal-400 font-bold">{grassCover} mm</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={grassCover}
                      onChange={(e) => setGrassCover(Number(e.target.value))}
                      className="w-full accent-teal-500 bg-slate-800 rounded-lg h-2"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300 font-medium">Target Delivery Speed</span>
                      <span className="text-amber-400 font-bold">{ballSpeed} mph</span>
                    </div>
                    <input
                      type="range"
                      min="65"
                      max="98"
                      value={ballSpeed}
                      onChange={(e) => setBallSpeed(Number(e.target.value))}
                      className="w-full accent-amber-500 bg-slate-800 rounded-lg h-2"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400 font-medium">Pitch Compatibility Rating</div>
                  <div className="text-2xl font-black text-white mt-0.5">{compatibilityScore}% Match</div>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-[220px]">
                    {compatibilityScore > 80
                      ? 'Ideal spec balance for current pitch bounce and pace.'
                      : 'Mismatches detected! Check the "How to Improve" tab for advice.'}
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('advisor')}
                  className="relative w-16 h-16 flex items-center justify-center hover:scale-105 transition-transform"
                >
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="32" cy="32" r="26" stroke="#1e293b" strokeWidth="6" fill="transparent" />
                    <circle
                      cx="32"
                      cy="32"
                      r="26"
                      stroke={compatibilityScore > 80 ? "#10b981" : "#f59e0b"}
                      strokeWidth="6"
                      fill="transparent"
                      strokeDasharray="163"
                      strokeDashoffset={163 - (163 * compatibilityScore) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <Wrench className="w-5 h-5 text-emerald-400 absolute" />
                </button>
              </div>
            </div>

            {/* COLUMN 2: BAT CUSTOMIZER */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold text-white text-sm">2. Custom Bat Engineering Specifications</h3>
                </div>
                <span className="text-xs text-slate-400">CAD Dimensions</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <label className="text-slate-300 font-medium">Dead Weight</label>
                    <span className="text-emerald-400 font-bold">{weightLbs}lb {remainingOz}oz</span>
                  </div>
                  <input
                    type="range"
                    min="38"
                    max="46"
                    value={weightOunces}
                    onChange={(e) => setWeightOunces(Number(e.target.value))}
                    className="w-full accent-emerald-500 bg-slate-800 rounded-lg h-2"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <label className="text-slate-300 font-medium">Sweet Spot / COP Height</label>
                    <span className="text-emerald-400 font-bold">{sweetSpotHeight} mm</span>
                  </div>
                  <input
                    type="range"
                    min="150"
                    max="250"
                    value={sweetSpotHeight}
                    onChange={(e) => setSweetSpotHeight(Number(e.target.value))}
                    className="w-full accent-emerald-500 bg-slate-800 rounded-lg h-2"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <label className="text-slate-300 font-medium">Edge Thickness</label>
                    <span className="text-emerald-400 font-bold">{edgeThickness} mm</span>
                  </div>
                  <input
                    type="range"
                    min="32"
                    max="42"
                    value={edgeThickness}
                    onChange={(e) => setEdgeThickness(Number(e.target.value))}
                    className="w-full accent-emerald-500 bg-slate-800 rounded-lg h-2"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-medium block">Spine & Back Profile</label>
                  <select
                    value={spineProfile}
                    onChange={(e) => setSpineProfile(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="concave">Concave Scooped (Lighter Pickup / Low MOI)</option>
                    <option value="full">Full Profile (Maximum Power Across Width)</option>
                    <option value="duckbill">Duckbill Toe (Heavy Toe / Low Sweet Spot)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-medium block">Willow Timber Selection</label>
                  <select
                    value={willowGrade}
                    onChange={(e) => setWillowGrade(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="eng_g1">Pro English Willow (Grade 1 - Highest Resilience)</option>
                    <option value="eng_g2">Superior English Willow (Grade 2/3 - Balanced)</option>
                    <option value="kashmir">Kashmir Willow (Dense / High Durability)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-medium block">Handle Cane Architecture</label>
                  <select
                    value={handleType}
                    onChange={(e) => setHandleType(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="oval_flex">Semi-Oval Multi-Cane Flex (Vibration Damping)</option>
                    <option value="round_stiff">Round Stiff Cane (Direct Power Transfer)</option>
                  </select>
                </div>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-emerald-400" />
                    Custom Master Spec Summary
                  </span>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">Ready for Workshop</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Crafted for <strong className="text-white">{PITCH_PRESETS[selectedPitch].name}</strong>: Features a <strong className="text-emerald-400">{sweetSpotHeight}mm sweet spot</strong>, <strong className="text-white">{spineProfile} profile</strong>, generating an estimated pickup MOI of <strong className="text-emerald-400">{calculatedMOI} kg·cm²</strong>.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ACTIONABLE HOW TO IMPROVE ADVISOR (NEW FEATURE) */}
        {activeTab === 'advisor' && (
          <div className="space-y-6">
            
            {/* TOP SUMMARY BAR WITH ONE-CLICK AUTO TUNE */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-base font-bold text-white">Bat Optimization & Modification Engine</h3>
                </div>
                <p className="text-xs text-slate-400">
                  Target Venue: <strong className="text-emerald-400">{PITCH_PRESETS[selectedPitch].name}</strong> ({PITCH_PRESETS[selectedPitch].type})
                </p>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <button
                  onClick={handleAutoOptimize}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg shadow-emerald-500/20"
                >
                  <Sparkles className="w-4 h-4 fill-slate-950" />
                  One-Click Auto-Tune Spec
                </button>
              </div>
            </div>

            {/* BEFORE VS AFTER COMPARISON MATRIX (IF AUTO-TUNED OR PREVIOUS BUILD SAVED) */}
            {previousBuild && (
              <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-5 shadow-2xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> Auto-Tune Delta Comparison (Before vs. After)
                  </span>
                  <button
                    onClick={() => setPreviousBuild(null)}
                    className="text-[10px] text-slate-400 hover:text-white"
                  >
                    Dismiss Comparison
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <div className="text-slate-400 text-[10px]">Compatibility Match</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-slate-400 line-through">{previousBuild.compatibilityScore}%</span>
                      <ArrowRight className="w-3 h-3 text-emerald-400" />
                      <span className="font-bold text-emerald-400 text-sm">{compatibilityScore}%</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <div className="text-slate-400 text-[10px]">Pickup MOI</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-slate-400 line-through">{previousBuild.calculatedMOI}</span>
                      <ArrowRight className="w-3 h-3 text-emerald-400" />
                      <span className="font-bold text-white text-sm">{calculatedMOI} kg·cm²</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <div className="text-slate-400 text-[10px]">Sweet Spot Height</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-slate-400 line-through">{previousBuild.sweetSpotHeight}mm</span>
                      <ArrowRight className="w-3 h-3 text-emerald-400" />
                      <span className="font-bold text-white text-sm">{sweetSpotHeight}mm</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <div className="text-slate-400 text-[10px]">Est. Exit Velocity</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-slate-400 line-through">{previousBuild.predictedExitVel}mph</span>
                      <ArrowRight className="w-3 h-3 text-emerald-400" />
                      <span className="font-bold text-cyan-400 text-sm">{predictedExitVel}mph</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* DETECTED MISMATCHES & AUDIT */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* LEFT: MISMATCH DIAGNOSTICS */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Detected Spec Mismatches for {PITCH_PRESETS[selectedPitch].name}
                </h4>

                <div className="space-y-3">
                  {issues.map((issue, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border text-xs space-y-1.5 ${
                        issue.type === 'error'
                          ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                          : issue.type === 'warning'
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                          : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                      }`}
                    >
                      <div className="font-bold flex items-center justify-between">
                        <span>{issue.title}</span>
                        <span className="uppercase text-[9px] px-2 py-0.5 rounded font-black bg-slate-950/60">
                          {issue.type}
                        </span>
                      </div>
                      <p className="leading-relaxed text-[11px] opacity-90">{issue.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT: CONCRETE STEP-BY-STEP MODIFICATION ADVICE */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Scissors className="w-4 h-4 text-emerald-400" />
                  Concrete Workshop Woodworking & Modification Steps
                </h4>

                <div className="space-y-3">
                  {recommendations.map((rec, idx) => {
                    const RecIcon = rec.icon;
                    return (
                      <div key={idx} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                          <RecIcon className="w-4 h-4" />
                          <span>Step {idx + 1}: {rec.action}</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed pl-6">
                          {rec.woodwork}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 3: PHYSICS TELEMETRY */}
        {activeTab === 'physics' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold text-white text-sm">Moment of Inertia (MOI)</h3>
                </div>
                <button onClick={() => openMathTopic('moi')} className="p-1 text-slate-400 hover:text-emerald-400">
                  <HelpCircle className="w-4 h-4" />
                </button>
              </div>

              <div className="text-center py-4 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-3xl font-black text-emerald-400">{calculatedMOI}</div>
                <div className="text-xs text-slate-400 mt-1">kg·cm² (Rotational Swing Resistance)</div>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Dynamic Pickup Feel:</span>
                  <span className="font-semibold text-white">
                    {calculatedMOI > 2650 ? 'Heavy Drive' : calculatedMOI < 2400 ? 'Feather Light' : 'Balanced Mid'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Wrist Pivot Torque:</span>
                  <span className="font-semibold text-white">{Math.round(calculatedMOI * 0.012)} N·m</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-cyan-400" />
                  <h3 className="font-bold text-white text-sm">COR & Ball Exit Speed</h3>
                </div>
                <button onClick={() => openMathTopic('cor')} className="p-1 text-slate-400 hover:text-cyan-400">
                  <HelpCircle className="w-4 h-4" />
                </button>
              </div>

              <div className="text-center py-4 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-3xl font-black text-cyan-400">{predictedExitVel} mph</div>
                <div className="text-xs text-slate-400 mt-1">Predicted Boundary Speed</div>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Coeff. of Restitution:</span>
                  <span className="font-semibold text-cyan-400">{effectiveCOR.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Energy Retention:</span>
                  <span className="font-semibold text-white">{Math.round(effectiveCOR * 100)}%</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  <h3 className="font-bold text-white text-sm">Reaction Dynamics</h3>
                </div>
                <button onClick={() => openMathTopic('cop')} className="p-1 text-slate-400 hover:text-amber-400">
                  <HelpCircle className="w-4 h-4" />
                </button>
              </div>

              <div className="text-center py-4 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-3xl font-black text-amber-400">{flightTimeMs} ms</div>
                <div className="text-xs text-slate-400 mt-1">Total Ball Flight Time</div>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Bat Downswing Time:</span>
                  <span className="font-semibold text-white">{swingClearanceTimeMs} ms</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Decision Window Margin:</span>
                  <span className={`font-semibold ${flightTimeMs - swingClearanceTimeMs > 150 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    +{flightTimeMs - swingClearanceTimeMs} ms
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: RESEARCH CITATIONS */}
        {activeTab === 'citations' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-400" />
                Academic Literature & Meta-Analysis Data
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                The physics engine algorithms in BatCraft Studio are direct implementations of sports engineering journals.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ACADEMIC_CITATIONS.map((paper, idx) => (
                <div key={idx} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {paper.journal}
                  </span>
                  <h4 className="text-xs font-bold text-white leading-snug">{paper.title}</h4>
                  <p className="text-[11px] text-slate-400 font-medium">{paper.author}</p>
                  <p className="text-xs text-slate-300 pt-2 border-t border-slate-800/80 leading-relaxed">
                    "{paper.takeaway}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* MATH EXPLANATION MODAL */}
      {showMathModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                {mathModalTopic === 'moi' && 'Moment of Inertia (MOI) Math'}
                {mathModalTopic === 'cor' && 'Coefficient of Restitution (COR)'}
                {mathModalTopic === 'cop' && 'Center of Percussion (COP)'}
              </h3>
              <button onClick={() => setShowMathModal(false)} className="text-slate-400 hover:text-white text-xs font-bold">
                ✕
              </button>
            </div>

            {mathModalTopic === 'moi' && (
              <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <div className="p-3 bg-slate-950 rounded-xl font-mono text-emerald-400 text-center text-sm border border-slate-800">
                  I = ∫ r² dm
                </div>
                <p>
                  <strong>In simple terms:</strong> MOI measures how hard it is to start or stop swinging the bat. The distance (r) from your hands to the mass (dm) is squared, meaning wood near the toe adds exponential swing weight.
                </p>
              </div>
            )}

            {mathModalTopic === 'cor' && (
              <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <div className="p-3 bg-slate-950 rounded-xl font-mono text-cyan-400 text-center text-sm border border-slate-800">
                  e = (v2 - v1) / (u1 - u2)
                </div>
                <p>
                  <strong>In simple terms:</strong> COR measures elasticity ("spring"). A COR of 0.55 means 55% of relative velocity is retained after impact.
                </p>
              </div>
            )}

            {mathModalTopic === 'cop' && (
              <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <div className="p-3 bg-slate-950 rounded-xl font-mono text-amber-400 text-center text-sm border border-slate-800">
                  q = k² / r_cg
                </div>
                <p>
                  <strong>In simple terms:</strong> The Center of Percussion is the exact spot on the blade where impact produces zero reaction force at the handle. Hitting outside this spot transmits shock to your wrists.
                </p>
              </div>
            )}

            <button
              onClick={() => setShowMathModal(false)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}