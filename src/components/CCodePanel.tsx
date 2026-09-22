/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { Code2, Copy, Check, Download, Info, ChevronRight, Terminal } from 'lucide-react';
import { C_PROGRAM_CODE, ExecutionStep } from '../types';

interface CCodePanelProps {
  currentStep: ExecutionStep | null;
}

export const CCodePanel: React.FC<CCodePanelProps> = ({ currentStep }) => {
  const [copied, setCopied] = useState(false);
  const codeLines = C_PROGRAM_CODE.split('\n');
  const activeLineRef = useRef<HTMLDivElement | null>(null);
  const codeScrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll code container to keep highlighted line nicely centered
  useEffect(() => {
    if (activeLineRef.current && codeScrollContainerRef.current) {
      const container = codeScrollContainerRef.current;
      const element = activeLineRef.current;
      const elementTop = element.offsetTop;
      const containerHeight = container.clientHeight;
      container.scrollTo({
        top: elementTop - containerHeight / 2 + 30,
        behavior: 'smooth',
      });
    }
  }, [currentStep?.cCodeLine]);

  const handleCopy = () => {
    navigator.clipboard.writeText(C_PROGRAM_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([C_PROGRAM_CODE], { type: 'text/x-c' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leaky_bucket.c';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const activeLine = currentStep ? currentStep.cCodeLine : -1;

  return (
    <div id="c-code-panel" className="glass-panel rounded-2xl p-5 border border-slate-800 shadow-xl flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span>C Program Execution</span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-300 font-mono border border-indigo-800">
                leaky_bucket.c
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">Live line-by-line debugger synchronized with 3D simulation</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 hover:text-white transition-all"
            title="Copy C Code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 hover:text-white transition-all"
            title="Download leaky_bucket.c"
          >
            <Download className="w-3.5 h-3.5" />
            <span>.c</span>
          </button>
        </div>
      </div>

      {/* Code Display Area */}
      <div
        ref={codeScrollContainerRef}
        className="flex-1 max-h-[360px] md:max-h-[420px] overflow-y-auto bg-slate-950/90 rounded-xl border border-slate-800 p-2.5 font-mono text-xs leading-relaxed"
      >
        {codeLines.map((lineText, idx) => {
          const lineNumber = idx + 1;
          const isHighlighted = lineNumber === activeLine;

          // Determine highlight style based on line context
          let highlightClass = '';
          if (isHighlighted) {
            if (lineText.includes('dropped') || lineText.includes('> bucketSize')) {
              highlightClass = 'code-highlight-warning bg-rose-950/40 text-rose-200';
            } else if (lineText.includes('sent') || lineText.includes('outputRate')) {
              highlightClass = 'code-highlight-success bg-emerald-950/40 text-emerald-200';
            } else {
              highlightClass = 'code-highlight-glow bg-cyan-950/40 text-cyan-200';
            }
          }

          return (
            <div
              key={lineNumber}
              ref={isHighlighted ? activeLineRef : null}
              className={`flex items-start rounded px-2 py-0.5 transition-colors ${highlightClass} ${
                !isHighlighted ? 'hover:bg-slate-900/60' : ''
              }`}
            >
              {/* Line indicator icon */}
              <div className="w-4 shrink-0 flex items-center justify-center mr-1">
                {isHighlighted && <ChevronRight className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />}
              </div>

              {/* Line Number */}
              <span
                className={`w-7 shrink-0 select-none text-right mr-3 font-mono text-[11px] ${
                  isHighlighted ? 'text-cyan-400 font-bold' : 'text-slate-600'
                }`}
              >
                {lineNumber}
              </span>

              {/* Code text */}
              <span
                className={`whitespace-pre ${
                  isHighlighted
                    ? 'font-semibold'
                    : lineText.trim().startsWith('//')
                    ? 'text-slate-500'
                    : lineText.includes('#include')
                    ? 'text-purple-400'
                    : lineText.includes('int ') || lineText.includes('return')
                    ? 'text-sky-400'
                    : lineText.includes('printf') || lineText.includes('scanf')
                    ? 'text-amber-300'
                    : lineText.includes('for') || lineText.includes('if') || lineText.includes('while')
                    ? 'text-pink-400'
                    : 'text-slate-300'
                }`}
              >
                {lineText || ' '}
              </span>
            </div>
          );
        })}
      </div>

      {/* Dynamic Line Explanation Card */}
      {currentStep && (
        <div className="mt-3.5 p-3.5 rounded-xl bg-slate-900/90 border border-slate-700/80 shadow-md flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-cyan-400 flex items-center gap-1.5 uppercase tracking-wider">
              <Info className="w-3.5 h-3.5" />
              Line {currentStep.cCodeLine} Explanation
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
              {currentStep.cCodeSnippet}
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {currentStep.explanation}
          </p>

          {/* Mathematical Evaluation Box */}
          {currentStep.mathExplanation && (
            <div className="mt-1 p-2 rounded-lg bg-slate-950 border border-cyan-500/30 flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">Math Trace:</span>
              <span className="font-mono text-xs text-emerald-300 font-semibold">
                {currentStep.mathExplanation}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
