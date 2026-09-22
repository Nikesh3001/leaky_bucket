/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ExecutionStep, SimulationConfig, TableRow } from '../types';

export function generateSimulationTrace(config: SimulationConfig): {
  steps: ExecutionStep[];
  finalRows: TableRow[];
  totalArrived: number;
  totalSent: number;
  totalDropped: number;
} {
  const { bucketSize, outputRate, intervals } = config;
  const n = intervals.length;
  const steps: ExecutionStep[] = [];
  const finalRows: TableRow[] = [];

  let stored = 0;
  let stepId = 1;
  let totalArrived = 0;
  let totalSent = 0;
  let totalDropped = 0;

  // Initial step before the loop starts
  steps.push({
    id: stepId++,
    intervalIndex: 0,
    timeLabel: 0,
    subStep: 'INIT',
    cCodeLine: 6,
    cCodeSnippet: 'int stored = 0;',
    explanation: 'Initialize the buffer storage count to 0. Bucket is empty and ready to accept incoming packets.',
    mathExplanation: `bucketSize = ${bucketSize}, outputRate = ${outputRate}, n = ${n}, stored = 0`,
    variables: {
      bucketSize,
      outputRate,
      n,
      i: 0,
      stored: 0,
      dropped: 0,
      sent: 0,
      packetArriving: 0,
    },
    visualAction: {
      type: 'idle',
      packetCount: 0,
    },
    flowNode: 'IDLE',
  });

  // Main Loop over time intervals
  for (let i = 0; i < n; i++) {
    const packetArriving = intervals[i];
    totalArrived += packetArriving;
    let dropped = 0;
    const prevStoredBeforeArrival = stored;

    // Substep 1: Loop iteration declaration & packet arrival
    steps.push({
      id: stepId++,
      intervalIndex: i,
      timeLabel: i + 1,
      subStep: 'ARRIVAL',
      cCodeLine: 24,
      cCodeSnippet: 'for (int i = 0; i < n; i++)',
      explanation: `Time interval ${i + 1} begins (index i = ${i}). ${packetArriving} packets arrive at the network interface.`,
      mathExplanation: `i = ${i} (< ${n}), incoming packets[${i}] = ${packetArriving}`,
      variables: {
        bucketSize,
        outputRate,
        n,
        i,
        stored,
        dropped: 0,
        sent: 0,
        packetArriving,
      },
      visualAction: {
        type: 'arriving',
        packetCount: packetArriving,
      },
      flowNode: 'ARRIVAL',
      changedVariable: {
        name: 'i',
        from: i - 1 < 0 ? 0 : i - 1,
        to: i,
      },
    });

    // Substep 2: stored += packets[i];
    const newStoredTemporary = stored + packetArriving;
    steps.push({
      id: stepId++,
      intervalIndex: i,
      timeLabel: i + 1,
      subStep: 'ADD_TO_STORED',
      cCodeLine: 28,
      cCodeSnippet: 'stored += packets[i];',
      explanation: `Incoming ${packetArriving} packets are pushed into the bucket buffer. Previous stored (${stored}) + arrived (${packetArriving}) = ${newStoredTemporary}.`,
      mathExplanation: `stored = ${stored} + ${packetArriving} = ${newStoredTemporary}`,
      variables: {
        bucketSize,
        outputRate,
        n,
        i,
        stored: newStoredTemporary,
        dropped: 0,
        sent: 0,
        packetArriving,
      },
      visualAction: {
        type: 'storing',
        packetCount: packetArriving,
      },
      flowNode: 'BUFFER',
      changedVariable: {
        name: 'stored',
        from: stored,
        to: newStoredTemporary,
      },
    });

    stored = newStoredTemporary;

    // Substep 3: if (stored > bucketSize)
    const isOverflow = stored > bucketSize;
    steps.push({
      id: stepId++,
      intervalIndex: i,
      timeLabel: i + 1,
      subStep: 'CHECK_OVERFLOW',
      cCodeLine: 30,
      cCodeSnippet: 'if (stored > bucketSize)',
      explanation: `Check whether buffer capacity is exceeded: stored (${stored}) vs bucketSize (${bucketSize}). Result: ${isOverflow ? 'TRUE (Overflow occurred!)' : 'FALSE (Fits inside bucket).'}.`,
      mathExplanation: `${stored} > ${bucketSize} → ${isOverflow ? 'TRUE' : 'FALSE'}`,
      variables: {
        bucketSize,
        outputRate,
        n,
        i,
        stored,
        dropped,
        sent: 0,
        packetArriving,
      },
      visualAction: {
        type: isOverflow ? 'overflow' : 'idle',
        packetCount: stored,
        overflowCount: isOverflow ? stored - bucketSize : 0,
      },
      flowNode: 'CHECK_CAPACITY',
    });

    if (isOverflow) {
      dropped = stored - bucketSize;
      totalDropped += dropped;

      // Substep 4a: dropped = stored - bucketSize;
      steps.push({
        id: stepId++,
        intervalIndex: i,
        timeLabel: i + 1,
        subStep: 'OVERFLOW_DROP',
        cCodeLine: 32,
        cCodeSnippet: 'dropped = stored - bucketSize;',
        explanation: `Capacity exceeded by ${dropped} packets. Overflow packets cannot be buffered and must be immediately discarded.`,
        mathExplanation: `dropped = ${stored} - ${bucketSize} = ${dropped}`,
        variables: {
          bucketSize,
          outputRate,
          n,
          i,
          stored,
          dropped,
          sent: 0,
          packetArriving,
        },
        visualAction: {
          type: 'overflow',
          packetCount: stored,
          overflowCount: dropped,
        },
        flowNode: 'DROP',
        changedVariable: {
          name: 'dropped',
          from: 0,
          to: dropped,
        },
      });

      // Substep 4b: stored = bucketSize;
      const prevStoredClamped = stored;
      stored = bucketSize;
      steps.push({
        id: stepId++,
        intervalIndex: i,
        timeLabel: i + 1,
        subStep: 'OVERFLOW_DROP',
        cCodeLine: 33,
        cCodeSnippet: 'stored = bucketSize;',
        explanation: `The buffer storage is clamped to the maximum physical bucket capacity (${bucketSize}).`,
        mathExplanation: `stored = ${bucketSize}`,
        variables: {
          bucketSize,
          outputRate,
          n,
          i,
          stored: bucketSize,
          dropped,
          sent: 0,
          packetArriving,
        },
        visualAction: {
          type: 'settled',
          packetCount: bucketSize,
        },
        flowNode: 'BUFFER',
        changedVariable: {
          name: 'stored',
          from: prevStoredClamped,
          to: bucketSize,
        },
      });
    }

    // Substep 5: int sent = (stored < outputRate) ? stored : outputRate;
    const sent = stored < outputRate ? stored : outputRate;
    totalSent += sent;

    steps.push({
      id: stepId++,
      intervalIndex: i,
      timeLabel: i + 1,
      subStep: 'CALC_SENT_TERNARY',
      cCodeLine: 36,
      cCodeSnippet: 'int sent = (stored < outputRate) ? stored : outputRate;',
      explanation: `Ternary operator evaluates transmission: Is stored (${stored}) < outputRate (${outputRate})? ${
        stored < outputRate
          ? `YES: Only ${stored} packet(s) are available to transmit, so sent = ${stored}.`
          : `NO: Send fixed quota of ${outputRate} packets at leak rate, so sent = ${outputRate}.`
      }`,
      mathExplanation: `(${stored} < ${outputRate}) ? ${stored} : ${outputRate} → sent = ${sent}`,
      variables: {
        bucketSize,
        outputRate,
        n,
        i,
        stored,
        dropped,
        sent,
        packetArriving,
      },
      visualAction: {
        type: 'sending',
        packetCount: stored,
        sentCount: sent,
      },
      flowNode: 'OUTPUT_RATE',
      changedVariable: {
        name: 'sent',
        from: 0,
        to: sent,
      },
    });

    // Substep 6: stored -= sent;
    const remainingStored = stored - sent;
    steps.push({
      id: stepId++,
      intervalIndex: i,
      timeLabel: i + 1,
      subStep: 'DRAIN_TRANSMIT',
      cCodeLine: 37,
      cCodeSnippet: 'stored -= sent;',
      explanation: `${sent} packet(s) exit through the bottom leak nozzle onto the transmission line. Buffer decrements from ${stored} to ${remainingStored}.`,
      mathExplanation: `stored = ${stored} - ${sent} = ${remainingStored}`,
      variables: {
        bucketSize,
        outputRate,
        n,
        i,
        stored: remainingStored,
        dropped,
        sent,
        packetArriving,
      },
      visualAction: {
        type: 'sending',
        packetCount: remainingStored,
        sentCount: sent,
      },
      flowNode: 'SENT',
      changedVariable: {
        name: 'stored',
        from: stored,
        to: remainingStored,
      },
    });

    stored = remainingStored;

    // Substep 7: printf("%d\t%d\t%d\t%d\t\t%d\n", i + 1, packets[i], sent, stored, dropped);
    const row: TableRow = {
      time: i + 1,
      arrived: packetArriving,
      sent,
      remaining: stored,
      dropped,
      isDraining: false,
    };
    finalRows.push(row);

    steps.push({
      id: stepId++,
      intervalIndex: i,
      timeLabel: i + 1,
      subStep: 'INTERVAL_DONE',
      cCodeLine: 39,
      cCodeSnippet: 'printf("%d\\t%d\\t%d\\t%d\\t\\t%d\\n", i + 1, packets[i], sent, stored, dropped);',
      explanation: `Time interval ${i + 1} complete. Row recorded in output log: Arrived = ${packetArriving}, Sent = ${sent}, Remaining = ${stored}, Dropped = ${dropped}.`,
      mathExplanation: `Output: Time ${i + 1} | Arrived: ${packetArriving} | Sent: ${sent} | Remaining: ${stored} | Dropped: ${dropped}`,
      variables: {
        bucketSize,
        outputRate,
        n,
        i,
        stored,
        dropped,
        sent,
        packetArriving,
      },
      visualAction: {
        type: 'settled',
        packetCount: stored,
      },
      flowNode: 'REMAINING',
      completedRow: row,
    });
  }

  // Draining loop: while (stored > 0)
  let drainTime = n;
  if (stored > 0) {
    steps.push({
      id: stepId++,
      intervalIndex: drainTime,
      timeLabel: drainTime + 1,
      subStep: 'DRAIN_LOOP_START',
      cCodeLine: 43,
      cCodeSnippet: 'while (stored > 0)',
      explanation: `All ${n} input intervals are finished, but ${stored} packet(s) still remain inside the buffer! Entering drain loop until bucket is empty.`,
      mathExplanation: `stored = ${stored} > 0 → TRUE (Continue draining)`,
      variables: {
        bucketSize,
        outputRate,
        n: drainTime,
        i: n,
        stored,
        dropped: 0,
        sent: 0,
        packetArriving: 0,
      },
      visualAction: {
        type: 'idle',
        packetCount: stored,
      },
      flowNode: 'BUFFER',
    });

    while (stored > 0) {
      drainTime++;
      const sent = stored < outputRate ? stored : outputRate;
      const prevStored = stored;
      stored -= sent;
      totalSent += sent;

      // Ternary calculation in drain loop
      steps.push({
        id: stepId++,
        intervalIndex: drainTime - 1,
        timeLabel: drainTime,
        subStep: 'DRAIN_LOOP_STEP',
        cCodeLine: 45,
        cCodeSnippet: 'int sent = (stored < outputRate) ? stored : outputRate;',
        explanation: `Drain Time ${drainTime}: ${sent} packet(s) leaked from remaining ${prevStored} stored packets (No new arrivals: arrived = 0).`,
        mathExplanation: `(${prevStored} < ${outputRate}) ? ${prevStored} : ${outputRate} → sent = ${sent}`,
        variables: {
          bucketSize,
          outputRate,
          n: drainTime,
          i: n,
          stored: prevStored,
          dropped: 0,
          sent,
          packetArriving: 0,
        },
        visualAction: {
          type: 'sending',
          packetCount: prevStored,
          sentCount: sent,
        },
        flowNode: 'OUTPUT_RATE',
        changedVariable: {
          name: 'sent',
          from: 0,
          to: sent,
        },
      });

      // stored -= sent;
      steps.push({
        id: stepId++,
        intervalIndex: drainTime - 1,
        timeLabel: drainTime,
        subStep: 'DRAIN_LOOP_STEP',
        cCodeLine: 46,
        cCodeSnippet: 'stored -= sent;',
        explanation: `Stored buffer decreases from ${prevStored} to ${stored}.`,
        mathExplanation: `stored = ${prevStored} - ${sent} = ${stored}`,
        variables: {
          bucketSize,
          outputRate,
          n: drainTime,
          i: n,
          stored,
          dropped: 0,
          sent,
          packetArriving: 0,
        },
        visualAction: {
          type: 'settled',
          packetCount: stored,
          sentCount: sent,
        },
        flowNode: 'SENT',
        changedVariable: {
          name: 'stored',
          from: prevStored,
          to: stored,
        },
      });

      const drainRow: TableRow = {
        time: drainTime,
        arrived: 0,
        sent,
        remaining: stored,
        dropped: 0,
        isDraining: true,
      };
      finalRows.push(drainRow);

      // printf("%d\t0\t%d\t%d\t\t0\n", ++n, sent, stored);
      steps.push({
        id: stepId++,
        intervalIndex: drainTime - 1,
        timeLabel: drainTime,
        subStep: 'INTERVAL_DONE',
        cCodeLine: 47,
        cCodeSnippet: 'printf("%d\\t0\\t%d\\t%d\\t\\t0\\n", ++n, sent, stored);',
        explanation: `Drain step complete. Time ${drainTime}: 0 arrived, ${sent} sent, ${stored} remaining.`,
        mathExplanation: `Output: Time ${drainTime} | Arrived: 0 | Sent: ${sent} | Remaining: ${stored} | Dropped: 0`,
        variables: {
          bucketSize,
          outputRate,
          n: drainTime,
          i: n,
          stored,
          dropped: 0,
          sent,
          packetArriving: 0,
        },
        visualAction: {
          type: 'settled',
          packetCount: stored,
        },
        flowNode: 'REMAINING',
        completedRow: drainRow,
      });
    }
  }

  // Program termination
  steps.push({
    id: stepId++,
    intervalIndex: drainTime,
    timeLabel: drainTime,
    subStep: 'COMPLETE',
    cCodeLine: 50,
    cCodeSnippet: 'return 0;',
    explanation: 'Simulation and program execution complete! All packets processed, bucket is empty, and exit code 0 returned.',
    mathExplanation: `Total Arrived: ${totalArrived} | Total Sent: ${totalSent} | Total Dropped: ${totalDropped}`,
    variables: {
      bucketSize,
      outputRate,
      n: drainTime,
      i: n,
      stored: 0,
      dropped: 0,
      sent: 0,
      packetArriving: 0,
    },
    visualAction: {
      type: 'settled',
      packetCount: 0,
    },
    flowNode: 'IDLE',
  });

  return {
    steps,
    finalRows,
    totalArrived,
    totalSent,
    totalDropped,
  };
}
