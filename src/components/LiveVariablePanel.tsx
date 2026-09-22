/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Cpu, ArrowRight, Activity } from 'lucide-react';
import { ExecutionStep } from '../types';

interface LiveVariablePanelProps {
  currentStep: ExecutionStep | null;
}

export const LiveVariablePanel: React.FC<LiveVariablePanelProps> = ({ currentStep }) => {
  const vars = currentStep?.variables ?? {
    bucketSize: 10,
    outputRate: 3,
    n: 5,
    i: 0,
    stored: 0,
    dropped: 0,
    sent: 0,
    packetArriving: 0,
  };

  const changed = currentStep?.changedVariable;

  const variableItems = [
    { name: 'bucketSize', label: 'Bucket Capacity', value: vars.bucketSize, color: 'text-cyan-400', desc: 'Max storage buffer' },
    { name: 'outputRate', label: 'Leak Rate', value: vars.outputRate, color: 'text-emerald-400', desc: 'Fixed send quota per tick' },
    { name: 'n', label: 'Intervals Count', value: vars.n, color: 'text-indigo-400', desc: 'Total scheduled intervals' },
    { name: 'i', label: 'Loop Index i', value: vars.i, color: 'text-purple-400', desc: 'Current interval iteration' },
    { name: 'packets[i]', label: 'Incoming Packets', value: vars.packetArriving, color: 'text-sky-300', desc: 'Arriving at current time' },
    { name: 'stored', label: 'Stored in Buffer', value: vars.stored, color: 'text-amber-300', desc: 'Current buffered packets' },
    { name: 'dropped', label: 'Dropped Packets', value: vars.dropped, color: 'text-rose-400', desc: 'Discarded on overflow' },
    { name: 'sent', label: 'Sent Packets', value: vars.sent, color: 'text-emerald-300', desc: 'Transmitted out of pipe' },
  ];

  return (
    <div id="live-variables-panel" className="glass-panel rounded-2xl p-5 border border-slate-800 shadow-xl flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span>Live Memory Registers</span>
              <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            </h3>
            <p className="text-xs text-slate-400">Real-time C runtime stack variables</p>
          </div>
        </div>

        {/* Change notification badge */}
        {changed && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 text-xs font-mono font-semibold animate-pulse shadow-md shadow-cyan-950">
            <span>{changed.name}:</span>
            <span className="text-slate-400">{changed.from}</span>
            <ArrowRight className="w-3 h-3 text-cyan-400" />
            <span className="text-cyan-200 font-bold">{changed.to}</span>
          </div>
        )}
      </div>

      {/* Variables Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {variableItems.map((item) => {
          const isChanged = changed?.name === item.name;

          return (
            <div
              key={item.name}
              className={`p-3 rounded-xl border transition-all ${
                isChanged
                  ? 'bg-cyan-950/60 border-cyan-400 ring-2 ring-cyan-500/30 shadow-lg shadow-cyan-950/50 scale-[1.02]'
                  : 'bg-slate-900/80 border-slate-800/90'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-xs font-bold text-slate-200">{item.name}</span>
                {isChanged && (
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                )}
              </div>
              <div className="flex items-baseline justify-between">
                <span className={`text-xl font-mono font-extrabold ${item.color}`}>
                  {item.value}
                </span>
                <span className="text-[10px] text-slate-500 truncate max-w-[80px] text-right">
                  {item.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
