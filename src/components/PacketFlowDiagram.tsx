/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  ArrowDown, 
  ArrowRight, 
  Network, 
  Database, 
  ShieldAlert, 
  Send, 
  CornerDownRight, 
  CheckCircle,
  Clock
} from 'lucide-react';

interface PacketFlowDiagramProps {
  activeNode: 'ARRIVAL' | 'BUFFER' | 'CHECK_CAPACITY' | 'OVERFLOW_CHECK' | 'DROP' | 'OUTPUT_RATE' | 'SENT' | 'REMAINING' | 'IDLE';
}

export const PacketFlowDiagram: React.FC<PacketFlowDiagramProps> = ({ activeNode }) => {
  const getNodeClass = (node: string, color: 'cyan' | 'amber' | 'rose' | 'emerald' | 'indigo') => {
    const isActive = activeNode === node;
    const base = 'px-3 py-1.5 rounded-xl border text-xs font-bold font-mono transition-all flex items-center justify-center gap-1.5 shadow-sm';

    if (isActive) {
      if (color === 'rose') {
        return `${base} bg-rose-500 text-slate-950 border-rose-400 ring-2 ring-rose-400/50 shadow-md shadow-rose-900/50 scale-105 animate-pulse`;
      }
      if (color === 'emerald') {
        return `${base} bg-emerald-500 text-slate-950 border-emerald-400 ring-2 ring-emerald-400/50 shadow-md shadow-emerald-900/50 scale-105 animate-pulse`;
      }
      if (color === 'amber') {
        return `${base} bg-amber-400 text-slate-950 border-amber-300 ring-2 ring-amber-400/50 shadow-md shadow-amber-900/50 scale-105 animate-pulse`;
      }
      return `${base} bg-cyan-500 text-slate-950 border-cyan-400 ring-2 ring-cyan-400/50 shadow-md shadow-cyan-900/50 scale-105 animate-pulse`;
    }

    return `${base} bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-700`;
  };

  return (
    <div id="packet-flow-diagram" className="glass-panel rounded-2xl p-4 border border-slate-800 shadow-xl flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
            <Network className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200">Packet Lifecycle Pipeline</h4>
            <p className="text-[10px] text-slate-400">Active algorithm phase highlighted in real time</p>
          </div>
        </div>

        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-cyan-300 border border-slate-800">
          State: {activeNode}
        </span>
      </div>

      {/* Pipeline Diagram Flow */}
      <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-1.5 py-1 text-center overflow-x-auto">
        {/* Node 1: ARRIVAL */}
        <div className={getNodeClass('ARRIVAL', 'cyan')}>
          <span>1. ARRIVAL</span>
        </div>

        <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0 hidden md:block" />

        {/* Node 2: BUFFER */}
        <div className={getNodeClass('BUFFER', 'indigo')}>
          <span>2. BUFFER</span>
        </div>

        <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0 hidden md:block" />

        {/* Node 3: CHECK CAPACITY */}
        <div className={getNodeClass('CHECK_CAPACITY', 'amber')}>
          <span>3. CAPACITY?</span>
        </div>

        <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0 hidden md:block" />

        {/* Branch: DROP vs CONTINUE */}
        <div className="flex flex-col gap-1 shrink-0">
          <div className={getNodeClass('DROP', 'rose')}>
            <span>OVERFLOW: DROP</span>
          </div>
          <div className={getNodeClass('OUTPUT_RATE', 'cyan')}>
            <span>FIT: CONTINUE</span>
          </div>
        </div>

        <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0 hidden md:block" />

        {/* Node 5: SENT */}
        <div className={getNodeClass('SENT', 'emerald')}>
          <span>4. LEAK / SENT</span>
        </div>

        <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0 hidden md:block" />

        {/* Node 6: REMAINING */}
        <div className={getNodeClass('REMAINING', 'cyan')}>
          <span>5. REMAINING</span>
        </div>
      </div>
    </div>
  );
};
