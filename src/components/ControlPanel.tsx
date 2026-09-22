/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  RotateCcw, 
  Sliders, 
  Zap, 
  Clock, 
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { SimulationConfig, SimulationSpeed, TRAFFIC_PRESETS, PresetTraffic } from '../types';

interface ControlPanelProps {
  config: SimulationConfig;
  onChangeConfig: (newConfig: SimulationConfig) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNextStep: () => void;
  onPrevStep: () => void;
  onReset: () => void;
  speed: SimulationSpeed;
  onChangeSpeed: (speed: SimulationSpeed) => void;
  isAutoPlay: boolean;
  onToggleAutoPlay: () => void;
  currentStepIndex: number;
  totalSteps: number;
  currentTimeLabel: number;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  config,
  onChangeConfig,
  isPlaying,
  onTogglePlay,
  onNextStep,
  onPrevStep,
  onReset,
  speed,
  onChangeSpeed,
  isAutoPlay,
  onToggleAutoPlay,
  currentStepIndex,
  totalSteps,
  currentTimeLabel,
}) => {
  const [showIntervalInputs, setShowIntervalInputs] = useState(false);

  const handleBucketSizeChange = (val: number) => {
    const safeVal = Math.max(1, Math.min(30, val));
    onChangeConfig({ ...config, bucketSize: safeVal });
  };

  const handleOutputRateChange = (val: number) => {
    const safeVal = Math.max(1, Math.min(20, val));
    onChangeConfig({ ...config, outputRate: safeVal });
  };

  const handleIntervalCountChange = (count: number) => {
    const safeCount = Math.max(1, Math.min(10, count));
    let newIntervals = [...config.intervals];
    if (safeCount > newIntervals.length) {
      while (newIntervals.length < safeCount) {
        newIntervals.push(Math.floor(Math.random() * 8) + 1);
      }
    } else {
      newIntervals = newIntervals.slice(0, safeCount);
    }
    onChangeConfig({ ...config, intervals: newIntervals });
  };

  const handlePacketChange = (index: number, value: number) => {
    const safeVal = Math.max(0, Math.min(30, value));
    const nextIntervals = [...config.intervals];
    nextIntervals[index] = safeVal;
    onChangeConfig({ ...config, intervals: nextIntervals });
  };

  const applyPreset = (preset: PresetTraffic) => {
    onChangeConfig({
      bucketSize: preset.bucketSize,
      outputRate: preset.outputRate,
      intervals: [...preset.intervals],
    });
  };

  return (
    <div id="simulation-control-panel" className="glass-panel rounded-2xl p-5 border border-slate-800 shadow-xl flex flex-col gap-5">
      {/* Header with Title & Quick Presets */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              Simulation Controls
            </h2>
            <p className="text-xs text-slate-400">Configure parameters or select traffic test scenarios</p>
          </div>
        </div>

        {/* Preset Traffic Selectors */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-400 mr-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Presets:
          </span>
          {TRAFFIC_PRESETS.map((preset) => {
            const isActive =
              config.bucketSize === preset.bucketSize &&
              config.outputRate === preset.outputRate &&
              JSON.stringify(config.intervals) === JSON.stringify(preset.intervals);
            return (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset)}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 font-semibold shadow-xs shadow-cyan-500/40'
                    : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                }`}
                title={preset.description}
              >
                {preset.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Parameters Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Bucket Size Input */}
        <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800/90 flex flex-col gap-1.5">
          <div className="flex justify-between items-center text-xs">
            <label htmlFor="input-bucket-size" className="font-semibold text-slate-300 flex items-center gap-1">
              Bucket Size (Capacity)
            </label>
            <span className="font-mono text-cyan-400 font-bold">{config.bucketSize}</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="input-bucket-size"
              type="number"
              min={2}
              max={30}
              value={config.bucketSize}
              onChange={(e) => handleBucketSizeChange(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg px-2.5 py-1.5 text-sm font-mono text-slate-100 outline-hidden"
            />
          </div>
          <span className="text-[11px] text-slate-500">Maximum packets stored</span>
        </div>

        {/* Output Rate Input */}
        <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800/90 flex flex-col gap-1.5">
          <div className="flex justify-between items-center text-xs">
            <label htmlFor="input-output-rate" className="font-semibold text-slate-300">
              Output Rate (Leak Rate)
            </label>
            <span className="font-mono text-emerald-400 font-bold">{config.outputRate}</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="input-output-rate"
              type="number"
              min={1}
              max={20}
              value={config.outputRate}
              onChange={(e) => handleOutputRateChange(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-sm font-mono text-slate-100 outline-hidden"
            />
          </div>
          <span className="text-[11px] text-slate-500">Packets sent per interval</span>
        </div>

        {/* Intervals Count Input */}
        <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800/90 flex flex-col gap-1.5">
          <div className="flex justify-between items-center text-xs">
            <label htmlFor="input-intervals-count" className="font-semibold text-slate-300">
              Number of Intervals (n)
            </label>
            <span className="font-mono text-indigo-400 font-bold">{config.intervals.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="input-intervals-count"
              type="number"
              min={1}
              max={10}
              value={config.intervals.length}
              onChange={(e) => handleIntervalCountChange(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-2.5 py-1.5 text-sm font-mono text-slate-100 outline-hidden"
            />
          </div>
          <span className="text-[11px] text-slate-500">Total arrival time intervals</span>
        </div>
      </div>

      {/* Customizable Packet Sequence Section */}
      <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            Packet Arrivals for Each Time Interval:
          </span>
          <button
            onClick={() => setShowIntervalInputs(!showIntervalInputs)}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            {showIntervalInputs ? 'Hide individual inputs' : 'Edit values'}
            {showIntervalInputs ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {/* Quick summary chips or editable inputs */}
        <div className="flex flex-wrap gap-2">
          {config.intervals.map((packets, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs transition-all ${
                currentTimeLabel === idx + 1
                  ? 'bg-cyan-500/20 border-cyan-500 text-cyan-200 shadow-xs shadow-cyan-500/20'
                  : 'bg-slate-900 border-slate-800 text-slate-300'
              }`}
            >
              <span className="font-medium text-slate-400">Time {idx + 1}:</span>
              {showIntervalInputs ? (
                <input
                  type="number"
                  min={0}
                  max={30}
                  value={packets}
                  onChange={(e) => handlePacketChange(idx, Number(e.target.value))}
                  className="w-12 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-center font-mono font-bold text-cyan-300 focus:outline-hidden focus:border-cyan-400"
                />
              ) : (
                <span className="font-mono font-bold text-cyan-300">{packets} pkts</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Execution Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
        {/* Playback Buttons */}
        <div className="flex items-center gap-2">
          {/* Play / Pause */}
          <button
            id="start-simulation-btn"
            onClick={onTogglePlay}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg cursor-pointer ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/25'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>{currentStepIndex > 0 ? 'Resume' : 'Start Simulation'}</span>
              </>
            )}
          </button>

          {/* Previous Step */}
          <button
            id="prev-step-btn"
            onClick={onPrevStep}
            disabled={currentStepIndex <= 0 || isPlaying}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 transition-all"
            title="Previous Step"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          {/* Next Step */}
          <button
            id="next-step-btn"
            onClick={onNextStep}
            disabled={currentStepIndex >= totalSteps - 1 || isPlaying}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-cyan-500/40 hover:border-cyan-500 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-cyan-300 font-semibold text-sm transition-all"
            title="Advance exactly one line/step"
          >
            <span>Next Step</span>
            <SkipForward className="w-4 h-4" />
          </button>

          {/* Reset */}
          <button
            id="reset-simulation-btn"
            onClick={onReset}
            className="flex items-center gap-1.5 p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-rose-500/50 hover:text-rose-400 text-slate-300 transition-all"
            title="Reset Simulation to Initial State"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Speed and Options Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Auto Play Toggle */}
          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl">
            <span className="text-xs text-slate-400 font-medium">Auto Play:</span>
            <button
              id="toggle-autoplay-btn"
              onClick={onToggleAutoPlay}
              className={`px-2 py-0.5 rounded-md text-xs font-bold transition-all ${
                isAutoPlay
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {isAutoPlay ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Speed Selector */}
          <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-1 rounded-xl">
            <span className="text-xs text-slate-400 px-2 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" /> Speed:
            </span>
            {(['slow', 'medium', 'fast'] as SimulationSpeed[]).map((spd) => (
              <button
                key={spd}
                onClick={() => onChangeSpeed(spd)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg capitalize transition-all ${
                  speed === spd
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {spd}
              </button>
            ))}
          </div>

          {/* Step Progress Counter */}
          <div className="text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            Step <span className="text-cyan-400 font-bold">{currentStepIndex + 1}</span> / {totalSteps}
          </div>
        </div>
      </div>
    </div>
  );
};
