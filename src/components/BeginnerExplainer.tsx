/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  BookOpen, 
  Droplets, 
  HelpCircle, 
  Layers, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle,
  Zap,
  Cpu,
  Repeat
} from 'lucide-react';

export const BeginnerExplainer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'concepts' | 'analogy' | 'tokenBucket'>('concepts');

  const concepts = [
    {
      title: 'What is a Packet?',
      desc: 'A packet is a small, standardized block of data formatted for transmission across a computer network (like the Internet). Larger files (videos, emails, web pages) are sliced into millions of packets.',
      badge: 'Data Unit',
      color: 'border-cyan-500/40 text-cyan-400',
    },
    {
      title: 'What is a Buffer?',
      desc: 'A buffer is a high-speed temporary memory area in a router or switch where incoming packets wait in queue before the network interface card can transmit them.',
      badge: 'Memory Queue',
      color: 'border-indigo-500/40 text-indigo-400',
    },
    {
      title: 'What is Bucket Size?',
      desc: 'The maximum finite capacity (in packets or bytes) of the buffer. Once this limit is reached, any additional arriving packets cannot be held and are immediately rejected.',
      badge: 'Max Capacity',
      color: 'border-amber-500/40 text-amber-400',
    },
    {
      title: 'What is Output Rate?',
      desc: 'The steady, fixed transmission rate at which the network interface emits packets per second or time interval, regardless of how bursty or erratic the input traffic was.',
      badge: 'Leak Rate',
      color: 'border-emerald-500/40 text-emerald-400',
    },
    {
      title: 'What is Overflow & Packet Drop?',
      desc: 'Occurs when incoming burst traffic plus previously queued packets exceeds the bucket capacity (stored > bucketSize). Network buffers cannot grow infinitely, so excess packets are dropped (lost).',
      badge: 'Congestion Loss',
      color: 'border-rose-500/40 text-rose-400',
    },
    {
      title: 'Why Traffic Shaping Matters',
      desc: 'Prevents network congestion! Without a leaky bucket, simultaneous bursts from multiple senders would choke intermediate routers, causing latency spikes and packet collisions.',
      badge: 'QoS & Stability',
      color: 'border-purple-500/40 text-purple-400',
    },
  ];

  const analogyMappings = [
    { physical: 'Bucket', network: 'Packet Buffer (Router Queue)', desc: 'Container with a fixed holding capacity' },
    { physical: 'Water / Liquid', network: 'Incoming Data Packets', desc: 'Can arrive in unpredictable splashes or torrents' },
    { physical: 'Bucket Capacity (e.g. 10 L)', network: 'Buffer Size (bucketSize)', desc: 'The physical ceiling on how much can be held' },
    { physical: 'Small Hole in Bottom', network: 'Network Transmission Channel', desc: 'Restricts water outflow to a fixed constant rate' },
    { physical: 'Water Leaking Out', network: 'Packets Sent (sent)', desc: 'Steady stream of packets transmitted onto the wire' },
    { physical: 'Water Spilling Over Edge', network: 'Packet Loss / Drops (dropped)', desc: 'Lost data requiring retransmission or causing glitch' },
  ];

  return (
    <div id="beginner-explainer-section" className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl flex flex-col gap-5">
      {/* Header with Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Networking Concept Fundamentals</h3>
            <p className="text-xs text-slate-400">Essential principles designed for computer networks students & beginners</p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('concepts')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'concepts' ? 'bg-cyan-500 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Core Concepts
          </button>
          <button
            onClick={() => setActiveTab('analogy')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'analogy' ? 'bg-cyan-500 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Droplets className="w-3.5 h-3.5" />
            Water Analogy
          </button>
          <button
            onClick={() => setActiveTab('tokenBucket')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'tokenBucket' ? 'bg-cyan-500 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Leaky vs Token Bucket
          </button>
        </div>
      </div>

      {/* Tab 1: Core Concepts Cards */}
      {activeTab === 'concepts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {concepts.map((c, i) => (
            <div
              key={i}
              className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/90 hover:border-slate-700 transition-all flex flex-col justify-between gap-2"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border font-bold ${c.color} bg-slate-950`}>
                    {c.badge}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-100 mb-1.5">{c.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Water Bucket Real-Life Analogy */}
      {activeTab === 'analogy' && (
        <div className="flex flex-col gap-4">
          <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
                <Droplets className="w-4 h-4 text-cyan-400" />
                The Water Bucket with a Hole Analogy
              </h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-2xl">
                Imagine pouring water from a pitcher into a bucket that has a small hole drilled at the bottom. No matter how violently or irregularly you pour water in, water only leaks out of the hole at a predictable, constant rate!
              </p>
            </div>
            <div className="bg-slate-950/80 px-4 py-2.5 rounded-xl border border-cyan-500/20 text-xs font-mono text-cyan-300 shrink-0">
              <div>Capacity: 10 Liters</div>
              <div>Inflow: 8 Liters</div>
              <div>Leak Hole: 3 L/sec</div>
            </div>
          </div>

          {/* Analogy Mapping Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/80">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-900 text-slate-400 border-b border-slate-800 font-semibold">
                  <th className="py-2.5 px-4">Water Bucket Element</th>
                  <th className="py-2.5 px-4">Computer Networks Equivalent</th>
                  <th className="py-2.5 px-4">Technical Explanation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                {analogyMappings.map((m, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40">
                    <td className="py-2.5 px-4 font-bold text-cyan-300 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                      {m.physical}
                    </td>
                    <td className="py-2.5 px-4 text-emerald-400 font-bold">{m.network}</td>
                    <td className="py-2.5 px-4 font-sans text-slate-400">{m.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Leaky Bucket vs Token Bucket */}
      {activeTab === 'tokenBucket' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-cyan-500/40 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-cyan-300">Leaky Bucket Algorithm</h4>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                Rigid Constant Rate
              </span>
            </div>
            <ul className="text-xs text-slate-300 space-y-2 list-disc pl-4 leading-relaxed">
              <li>Stores <strong>data packets</strong> directly in a buffer.</li>
              <li>Leaks packets out at a <strong>strictly fixed, constant rate</strong> (CBR).</li>
              <li><strong>Does NOT allow bursts:</strong> Even if the network was idle for 10 seconds, it will never send packets faster than the leak rate.</li>
              <li>Excess packets that exceed capacity are unconditionally <strong>dropped</strong>.</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-amber-500/40 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-amber-300">Token Bucket Algorithm</h4>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-mono">
                Allows Controlled Bursts
              </span>
            </div>
            <ul className="text-xs text-slate-300 space-y-2 list-disc pl-4 leading-relaxed">
              <li>Stores <strong>virtual tokens</strong> generated at a steady rate.</li>
              <li>A packet can only be transmitted if there are enough tokens in the bucket.</li>
              <li><strong>Allows bursty traffic:</strong> If tokens have accumulated during idle periods, a burst of packets can be sent all at once!</li>
              <li>Tokens overflow and are discarded if the token bucket is full, not packets.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
