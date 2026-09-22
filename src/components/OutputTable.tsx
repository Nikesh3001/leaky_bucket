/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Table, CheckCircle2, AlertOctagon, Send, Database } from 'lucide-react';
import { TableRow } from '../types';

interface OutputTableProps {
  rows: TableRow[];
  currentTime: number;
}

export const OutputTable: React.FC<OutputTableProps> = ({ rows, currentTime }) => {
  const totalArrived = rows.reduce((acc, r) => acc + r.arrived, 0);
  const totalSent = rows.reduce((acc, r) => acc + r.sent, 0);
  const totalDropped = rows.reduce((acc, r) => acc + r.dropped, 0);
  const currentRemaining = rows.length > 0 ? rows[rows.length - 1].remaining : 0;
  const dropRate = totalArrived > 0 ? ((totalDropped / totalArrived) * 100).toFixed(1) : '0.0';

  return (
    <div id="output-table-panel" className="glass-panel rounded-2xl p-5 border border-slate-800 shadow-xl flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Table className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span>Program Output Table</span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-slate-900 border border-slate-700 font-mono text-slate-400">
                printf() logs
              </span>
            </h3>
            <p className="text-xs text-slate-400">Exact tabular execution records matching C terminal output</p>
          </div>
        </div>

        {/* Aggregate Stats Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] flex items-center gap-1.5">
            <span className="text-slate-400">Total Arrived:</span>
            <span className="font-mono font-bold text-cyan-400">{totalArrived}</span>
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] flex items-center gap-1.5">
            <span className="text-slate-400">Total Sent:</span>
            <span className="font-mono font-bold text-emerald-400">{totalSent}</span>
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] flex items-center gap-1.5">
            <span className="text-slate-400">Dropped:</span>
            <span className={`font-mono font-bold ${totalDropped > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
              {totalDropped} ({dropRate}%)
            </span>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/80">
        <table className="w-full text-left border-collapse text-xs font-mono">
          <thead>
            <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800">
              <th className="py-2.5 px-4 font-semibold">Time (Interval)</th>
              <th className="py-2.5 px-4 font-semibold">Arrived</th>
              <th className="py-2.5 px-4 font-semibold">Sent</th>
              <th className="py-2.5 px-4 font-semibold">Remaining</th>
              <th className="py-2.5 px-4 font-semibold">Dropped</th>
              <th className="py-2.5 px-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500 font-sans text-xs">
                  Simulation has not started yet. Click <span className="text-cyan-400 font-semibold">Start Simulation</span> or <span className="text-cyan-400 font-semibold">Next Step</span> to generate output rows.
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const isCurrent = row.time === currentTime;
                const hasDrop = row.dropped > 0;

                return (
                  <tr
                    key={row.time}
                    className={`transition-colors ${
                      isCurrent
                        ? 'bg-cyan-950/50 text-cyan-200 font-bold border-l-4 border-l-cyan-400'
                        : 'hover:bg-slate-900/40 text-slate-300'
                    }`}
                  >
                    <td className="py-2 px-4 flex items-center gap-2">
                      <span className="font-bold text-slate-100">{row.time}</span>
                      {row.isDraining && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-sans">
                          Drain Loop
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-4 text-cyan-400 font-bold">{row.arrived}</td>
                    <td className="py-2 px-4 text-emerald-400 font-bold">{row.sent}</td>
                    <td className="py-2 px-4 text-amber-300">{row.remaining}</td>
                    <td className="py-2 px-4">
                      {hasDrop ? (
                        <span className="inline-flex items-center gap-1 text-rose-400 font-bold bg-rose-950/40 px-2 py-0.5 rounded border border-rose-900">
                          <AlertOctagon className="w-3 h-3" />
                          {row.dropped}
                        </span>
                      ) : (
                        <span className="text-slate-500">0</span>
                      )}
                    </td>
                    <td className="py-2 px-4 font-sans text-[11px]">
                      {hasDrop ? (
                        <span className="text-rose-400">Overflow Dropped</span>
                      ) : row.isDraining ? (
                        <span className="text-indigo-400">Emptying Buffer</span>
                      ) : (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Transmitted
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
