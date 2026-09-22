/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SimulationSpeed = 'slow' | 'medium' | 'fast';

export type SubStepType = 
  | 'INIT'
  | 'ARRIVAL'
  | 'ADD_TO_STORED'
  | 'CHECK_OVERFLOW'
  | 'OVERFLOW_DROP'
  | 'NO_OVERFLOW'
  | 'CALC_SENT_TERNARY'
  | 'DRAIN_TRANSMIT'
  | 'INTERVAL_DONE'
  | 'DRAIN_LOOP_START'
  | 'DRAIN_LOOP_STEP'
  | 'COMPLETE';

export interface ExecutionStep {
  id: number;
  intervalIndex: number; // 0-indexed for user intervals, or subsequent for drain loop
  timeLabel: number; // 1-indexed time interval
  subStep: SubStepType;
  cCodeLine: number; // 1-based line number in C code
  cCodeSnippet: string;
  explanation: string;
  mathExplanation?: string;
  
  // Variables at this moment
  variables: {
    bucketSize: number;
    outputRate: number;
    n: number;
    i: number;
    stored: number;
    dropped: number;
    sent: number;
    packetArriving: number;
  };
  
  // Visual state cues for 3D engine
  visualAction: {
    type: 'idle' | 'arriving' | 'storing' | 'overflow' | 'sending' | 'settled';
    packetCount: number;
    overflowCount?: number;
    sentCount?: number;
  };

  // Flowchart node to highlight
  flowNode: 'ARRIVAL' | 'BUFFER' | 'CHECK_CAPACITY' | 'OVERFLOW_CHECK' | 'DROP' | 'OUTPUT_RATE' | 'SENT' | 'REMAINING' | 'IDLE';

  // Variable that was changed in this step
  changedVariable?: {
    name: string;
    from: number;
    to: number;
  };

  // Completed row if this step finalizes an interval
  completedRow?: TableRow;
}

export interface TableRow {
  time: number;
  arrived: number;
  sent: number;
  remaining: number;
  dropped: number;
  isDraining?: boolean;
}

export interface SimulationConfig {
  bucketSize: number;
  outputRate: number;
  intervals: number[];
}

export interface PresetTraffic {
  name: string;
  description: string;
  bucketSize: number;
  outputRate: number;
  intervals: number[];
}

export const TRAFFIC_PRESETS: PresetTraffic[] = [
  {
    name: 'Classic C Program',
    description: 'The standard sample from networking textbooks: [5, 8, 2, 7, 1] with capacity 10 and leak rate 3.',
    bucketSize: 10,
    outputRate: 3,
    intervals: [5, 8, 2, 7, 1],
  },
  {
    name: 'Sudden Traffic Spike',
    description: 'A sudden burst of 15 packets testing the overflow limit followed by quiet periods.',
    bucketSize: 10,
    outputRate: 4,
    intervals: [3, 15, 2, 1, 0],
  },
  {
    name: 'Constant Bit Rate (CBR)',
    description: 'Steady incoming traffic equal to the leak rate; no packets are dropped or accumulated.',
    bucketSize: 10,
    outputRate: 3,
    intervals: [3, 3, 3, 3, 3],
  },
  {
    name: 'Severe Congestion',
    description: 'Continuous high arrival rate exceeding capacity causing massive drop rates.',
    bucketSize: 8,
    outputRate: 2,
    intervals: [7, 8, 8, 7, 9],
  },
];

export const C_PROGRAM_CODE = `#include <stdio.h> 
 
int main() 
{ 
    int bucketSize, outputRate, packets[20], n; 
    int stored = 0; 
 
    printf("Enter bucket size: "); 
    scanf("%d", &bucketSize); 
 
    printf("Enter output rate: "); 
    scanf("%d", &outputRate); 
 
    printf("Enter number of time intervals: "); 
    scanf("%d", &n); 
 
    for (int i = 0; i < n; i++) 
    { 
        printf("Packets arriving at time %d: ", i + 1); 
        scanf("%d", &packets[i]); 
    } 
 
    printf("\\nTime\\tArrived\\tSent\\tRemaining\\tDropped\\n"); 
 
    for (int i = 0; i < n; i++) 
    { 
        int dropped = 0; 
 
        stored += packets[i]; 
 
        if (stored > bucketSize) 
        { 
            dropped = stored - bucketSize; 
            stored = bucketSize; 
        } 
 
        int sent = (stored < outputRate) ? stored : outputRate; 
        stored -= sent; 
 
        printf("%d\\t%d\\t%d\\t%d\\t\\t%d\\n", 
               i + 1, packets[i], sent, stored, dropped); 
    } 
 
    while (stored > 0) 
    { 
        int sent = (stored < outputRate) ? stored : outputRate; 
        stored -= sent; 
        printf("%d\\t0\\t%d\\t%d\\t\\t0\\n", ++n, sent, stored); 
    } 
 
    return 0; 
}`;
