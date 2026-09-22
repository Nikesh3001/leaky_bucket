/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HelpCircle, GitBranch, ArrowDown, Check, X, Sparkles } from 'lucide-react';

interface TernaryExplainerProps {
  stored: number;
  outputRate: number;
  sent: number;
}

export const TernaryExplainer: React.FC<TernaryExplainerProps> = ({ stored, outputRate, sent }) => {
  const isStoredLessThanRate = stored < outputRate;

  return (
    <div id="ternary-operator-explainer" className="glass-panel rounded-2xl p-5 border border-slate-800 shadow-xl flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <GitBranch className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              Ternary Operator Visual Breakdown
            </h3>
            <p className="text-xs text-slate-400">Understanding <code className="text-amber-300 font-mono text-[11px]">condition ? expr1 : expr2</code></p>
          </div>
        </div>

        <span className="text-[11px] px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-300 font-mono">
          Line 36 in C Code
        </span>
      </div>

      {/* Target Expression Banner */}
      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs md:text-sm text-center">
        <span className="text-purple-400 font-bold">int </span>
        <span className="text-slate-100">sent = </span>
        <span className="text-amber-300 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-800/60 font-bold">
          (stored &lt; outputRate)
        </span>
        <span className="text-slate-400"> ? </span>
        <span className="text-emerald-400 font-bold">stored</span>
        <span className="text-slate-400"> : </span>
        <span className="text-cyan-400 font-bold">outputRate</span>;
      </div>

      {/* Visual Branching Decision Tree Diagram */}
      <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex flex-col items-center relative overflow-hidden">
        {/* Condition Box */}
        <div className="flex flex-col items-center">
          <div className="px-4 py-2 rounded-xl bg-slate-900 border-2 border-amber-500/60 shadow-lg text-center">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
              Evaluation Condition
            </div>
            <div className="font-mono text-sm font-bold text-amber-300">
              Is stored &lt; outputRate?
            </div>
            <div className="text-xs font-mono text-slate-400 mt-1">
              ({stored} &lt; {outputRate}) →{' '}
              <span className={`font-bold ${isStoredLessThanRate ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isStoredLessThanRate ? 'TRUE (YES)' : 'FALSE (NO)'}
              </span>
            </div>
          </div>
        </div>

        {/* Branch connector lines */}
        <div className="w-full max-w-sm flex items-center justify-between px-8 py-2 relative">
          {/* Left Line */}
          <div className="flex flex-col items-center gap-1">
            <div className="h-4 w-0.5 bg-slate-700" />
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                isStoredLessThanRate
                  ? 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-400'
                  : 'bg-slate-800 text-slate-500'
              }`}
            >
              YES (True)
            </span>
            <ArrowDown
              className={`w-4 h-4 ${isStoredLessThanRate ? 'text-emerald-400 animate-bounce' : 'text-slate-700'}`}
            />
          </div>

          {/* Right Line */}
          <div className="flex flex-col items-center gap-1">
            <div className="h-4 w-0.5 bg-slate-700" />
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                !isStoredLessThanRate
                  ? 'bg-cyan-500 text-slate-950 ring-2 ring-cyan-400'
                  : 'bg-slate-800 text-slate-500'
              }`}
            >
              NO (False)
            </span>
            <ArrowDown
              className={`w-4 h-4 ${!isStoredLessThanRate ? 'text-cyan-400 animate-bounce' : 'text-slate-700'}`}
            />
          </div>
        </div>

        {/* Outcome Boxes */}
        <div className="w-full max-w-sm grid grid-cols-2 gap-4">
          {/* Left Outcome: stored */}
          <div
            className={`p-3 rounded-xl border text-center transition-all ${
              isStoredLessThanRate
                ? 'bg-emerald-950/50 border-emerald-500 shadow-md shadow-emerald-950'
                : 'bg-slate-900/40 border-slate-800 opacity-60'
            }`}
          >
            <div className="text-[11px] font-medium text-slate-400">Send available stored</div>
            <div className="text-base font-bold font-mono text-emerald-400 mt-0.5">
              sent = stored
            </div>
            <div className="text-xs font-mono text-emerald-300 mt-1">
              Result: {stored}
            </div>
          </div>

          {/* Right Outcome: outputRate */}
          <div
            className={`p-3 rounded-xl border text-center transition-all ${
              !isStoredLessThanRate
                ? 'bg-cyan-950/50 border-cyan-500 shadow-md shadow-cyan-950'
                : 'bg-slate-900/40 border-slate-800 opacity-60'
            }`}
          >
            <div className="text-[11px] font-medium text-slate-400">Send standard leak rate</div>
            <div className="text-base font-bold font-mono text-cyan-400 mt-0.5">
              sent = outputRate
            </div>
            <div className="text-xs font-mono text-cyan-300 mt-1">
              Result: {outputRate}
            </div>
          </div>
        </div>

        {/* Live Sent Resolution */}
        <div className="mt-4 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-xs text-slate-300 font-medium">Final Value Assigned to variable:</span>
          <span className="font-mono text-sm font-bold text-amber-300">sent = {sent}</span>
        </div>
      </div>

      {/* Side-by-Side Equivalent C Code Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
          <div className="text-[11px] font-semibold text-amber-400 mb-1.5 flex items-center gap-1">
            <span>Ternary Operator (Compact):</span>
          </div>
          <pre className="font-mono text-xs text-slate-300 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 overflow-x-auto">
            {`int sent = (stored < outputRate) ? stored : outputRate;`}
          </pre>
        </div>

        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
          <div className="text-[11px] font-semibold text-emerald-400 mb-1.5 flex items-center gap-1">
            <span>Equivalent Standard if-else:</span>
          </div>
          <pre className="font-mono text-xs text-slate-300 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 overflow-x-auto">
{`if (stored < outputRate)
    sent = stored;
else
    sent = outputRate;`}
          </pre>
        </div>
      </div>

      {/* Beginner Explanation Tip */}
      <div className="text-xs text-slate-400 leading-relaxed bg-slate-900/50 p-3 rounded-xl border border-slate-800/80">
        <span className="font-semibold text-slate-200">Why this matters in Networking: </span>
        If the bucket holds fewer packets than its transmission bandwidth (e.g. only 2 packets while the line can send 3),
        it can only transmit what is physically present (2 packets). If the bucket holds more than 3 packets, it strictly
        transmits at the steady rate of 3 to shape traffic smoothly!
      </div>
    </div>
  );
};
