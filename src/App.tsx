/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  Network, 
  Layers, 
  Terminal, 
  Play, 
  RotateCcw, 
  HelpCircle, 
  Droplet, 
  Box, 
  Sparkles,
  ExternalLink,
  Cpu
} from 'lucide-react';
import { SimulationConfig, SimulationSpeed, TableRow } from './types';
import { generateSimulationTrace } from './utils/simulationEngine';
import { ThreeBucketScene } from './components/ThreeBucketScene';
import { ControlPanel } from './components/ControlPanel';
import { CCodePanel } from './components/CCodePanel';
import { LiveVariablePanel } from './components/LiveVariablePanel';
import { OutputTable } from './components/OutputTable';
import { TernaryExplainer } from './components/TernaryExplainer';
import { PacketFlowDiagram } from './components/PacketFlowDiagram';
import { BeginnerExplainer } from './components/BeginnerExplainer';

export default function App() {
  // Initial Simulation Configuration
  const [config, setConfig] = useState<SimulationConfig>({
    bucketSize: 10,
    outputRate: 3,
    intervals: [5, 8, 2, 7, 1],
  });

  // Playback States
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<SimulationSpeed>('medium');
  const [isAutoPlay, setIsAutoPlay] = useState<boolean>(true);
  const [visualMode, setVisualMode] = useState<'packets' | 'water'>('packets');

  // Generate trace based on config
  const trace = useMemo(() => {
    return generateSimulationTrace(config);
  }, [config]);

  const { steps, totalArrived, totalSent, totalDropped } = trace;
  const currentStep = steps[currentStepIndex] || null;

  // Compute completed table rows up to current step
  const visibleRows: TableRow[] = useMemo(() => {
    const rowsMap = new Map<number, TableRow>();
    for (let idx = 0; idx <= currentStepIndex; idx++) {
      const step = steps[idx];
      if (step?.completedRow) {
        rowsMap.set(step.completedRow.time, step.completedRow);
      }
    }
    return Array.from(rowsMap.values()).sort((a, b) => a.time - b.time);
  }, [steps, currentStepIndex]);

  // Speed delay calculation in milliseconds
  const speedDelay = useMemo(() => {
    switch (speed) {
      case 'slow':
        return 1400;
      case 'fast':
        return 350;
      case 'medium':
      default:
        return 800;
    }
  }, [speed]);

  // Playback timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev < steps.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            // Trigger victory celebration when simulation finishes successfully
            confetti({
              particleCount: 60,
              spread: 70,
              origin: { y: 0.6 },
            });
            return prev;
          }
        });
      }, speedDelay);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, steps.length, speedDelay]);

  // Handlers
  const handleTogglePlay = () => {
    if (currentStepIndex >= steps.length - 1) {
      setCurrentStepIndex(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleNextStep = () => {
    setIsPlaying(false);
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    setIsPlaying(false);
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
  };

  const handleChangeConfig = (newConfig: SimulationConfig) => {
    setIsPlaying(false);
    setConfig(newConfig);
    setCurrentStepIndex(0);
  };

  return (
    <div id="app-root" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950 antialiased">
      {/* Top Cyber Laboratory Navigation Bar */}
      <header
        id="lab-header"
        className="w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 px-4 lg:px-8 py-3.5 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-xs shadow-cyan-500/20">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-100 tracking-tight">
                Leaky Bucket 3D Visualizer
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                Computer Networks
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Interactive 3D Simulation & Line-by-Line C Code Debugger
            </p>
          </div>
        </div>

        {/* Header Right Status */}
        <div className="flex items-center gap-2.5">
          <div className="hidden md:flex items-center gap-2 text-xs font-mono bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Buffer: {currentStep?.variables.stored ?? 0}/{config.bucketSize}</span>
            <span className="text-slate-500">|</span>
            <span>Leak Rate: {config.outputRate}/tick</span>
          </div>

          <button
            onClick={() => {
              const el = document.getElementById('beginner-explainer-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-medium text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Concept Guide</span>
          </button>
        </div>
      </header>

      {/* Main Interactive Stage */}
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        {/* Pipeline Diagram */}
        <PacketFlowDiagram activeNode={currentStep?.flowNode ?? 'IDLE'} />

        {/* Primary Interactive Split: 3D Visualization + Controls on Left, C Code + Registers on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: 3D Scene + Control Panel */}
          <section id="visualizer-column" className="lg:col-span-7 flex flex-col gap-6">
            {/* 3D Scene Container */}
            <ThreeBucketScene
              currentStep={currentStep}
              bucketSize={config.bucketSize}
              storedCount={currentStep?.variables.stored ?? 0}
              droppedCount={currentStep?.variables.dropped ?? 0}
              sentCount={currentStep?.variables.sent ?? 0}
              incomingCount={currentStep?.variables.packetArriving ?? 0}
              isOverflowing={currentStep?.visualAction.type === 'overflow'}
              visualMode={visualMode}
              onToggleVisualMode={() => setVisualMode(visualMode === 'packets' ? 'water' : 'packets')}
            />

            {/* Simulation Control Panel */}
            <ControlPanel
              config={config}
              onChangeConfig={handleChangeConfig}
              isPlaying={isPlaying}
              onTogglePlay={handleTogglePlay}
              onNextStep={handleNextStep}
              onPrevStep={handlePrevStep}
              onReset={handleReset}
              speed={speed}
              onChangeSpeed={setSpeed}
              isAutoPlay={isAutoPlay}
              onToggleAutoPlay={() => setIsAutoPlay(!isAutoPlay)}
              currentStepIndex={currentStepIndex}
              totalSteps={steps.length}
              currentTimeLabel={currentStep?.timeLabel ?? 0}
            />
          </section>

          {/* Right Column: C Code Debugger + Live Variables Panel */}
          <section id="debugger-column" className="lg:col-span-5 flex flex-col gap-6">
            {/* Live CPU Registers / Stack Variables */}
            <LiveVariablePanel currentStep={currentStep} />

            {/* C Code with Active Line Highlighting */}
            <CCodePanel currentStep={currentStep} />
          </section>
        </div>

        {/* Secondary Detailed Explanations: Ternary Operator Visualizer */}
        <section id="ternary-section">
          <TernaryExplainer
            stored={currentStep?.variables.stored ?? 0}
            outputRate={config.outputRate}
            sent={currentStep?.variables.sent ?? (config.outputRate > (currentStep?.variables.stored ?? 0) ? (currentStep?.variables.stored ?? 0) : config.outputRate)}
          />
        </section>

        {/* Output Table matching printf output */}
        <section id="table-section">
          <OutputTable
            rows={visibleRows}
            currentTime={currentStep?.timeLabel ?? 0}
          />
        </section>

        {/* Beginner Explanations & Water Bucket Real-Life Analogy */}
        <section id="educational-section">
          <BeginnerExplainer />
        </section>
      </main>

      {/* Futuristic Laboratory Footer */}
      <footer id="app-footer" className="w-full border-t border-slate-900 bg-slate-950 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-500" />
            <span className="font-semibold text-slate-400">Leaky Bucket Algorithm Visualizer</span>
            <span>— Computer Networks Interactive Laboratory</span>
          </div>
          <p className="text-slate-500 text-[11px]">
            Implements Traffic Shaping, Buffer Overflow Protection & Constant Bit Rate (CBR) Transmission
          </p>
        </div>
      </footer>
    </div>
  );
}
