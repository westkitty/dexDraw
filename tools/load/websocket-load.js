/**
 * k6 WebSocket load test for dexDraw server.
 *
 * Usage:
 *   k6 run tools/load/websocket-load.js
 *
 * Environment variables:
 *   WS_URL - WebSocket URL (default: ws://localhost:4000/ws/test-board)
 *   VUS - Virtual users (default: 10)
 *   DURATION - Test duration (default: 30s)
 */

import { check, sleep } from 'k6';
import { Counter, Trend } from 'k6/metrics';
import ws from 'k6/ws';

const WS_URL = __ENV.WS_URL || 'ws://localhost:4000/ws/test-board';

export const options = {
  vus: parseInt(__ENV.VUS, 10) || 10,
  duration: __ENV.DURATION || '30s',
  thresholds: {
    ws_connecting: ['p(95)<2000'],
    checks: ['rate>0.95'],
  },
};

const opsReceived = new Counter('ops_received');
const opLatency = new Trend('op_latency_ms');

export default function () {
  const clientId = `load-test-${__VU}-${Date.now()}`;
  let clientSeq = 0;

  const res = ws.connect(WS_URL, {}, (socket) => {
    // Send join message
    socket.on('open', () => {
      socket.send(
        JSON.stringify({
          type: 'join',
          clientId,
          displayName: `LoadUser-${__VU}`,
          lastSeenServerSeq: 0,
        }),
      );
    });

    socket.on('message', (data) => {
      const msg = JSON.parse(data);
      if (msg.type === 'opBroadcast') {
        opsReceived.add(1);
      }
    });

    // Send ops at ~10 ops/sec
    socket.setInterval(() => {
      const opStart = Date.now();
      socket.send(
        JSON.stringify({
          v: 1,
          type: 'durable',
          roomId: 'test-board',
          clientId,
          msgId: `${clientId}-${clientSeq}`,
          ts: Date.now(),
          payload: {
            kind: 'opBatch',
            clientSeqStart: clientSeq,
            ops: [
              {
                type: 'createObject',
                objectId: `${clientId}-obj-${clientSeq}`,
                objectType: 'stroke',
                data: { points: [[100 + Math.random() * 500, 100 + Math.random() * 500]] },
              },
            ],
          },
        }),
      );
      opLatency.add(Date.now() - opStart);
      clientSeq++;
    }, 100);

    // Send cursor updates at ~20Hz
    socket.setInterval(() => {
      socket.send(
        JSON.stringify({
          type: 'ephemeral',
          payload: {
            kind: 'cursor',
            x: Math.random() * 1000,
            y: Math.random() * 800,
          },
        }),
      );
    }, 50);

    // Run for the duration
    sleep(parseInt(__ENV.DURATION?.replace('s', ''), 10) || 30);
  });

  check(res, {
    'connected successfully': (r) => r && r.status === 101,
  });
}

export function handleSummary(data) {
  return {
    stdout: JSON.stringify(
      {
        vus: options.vus,
        duration: options.duration,
        ops_received: data.metrics.ops_received?.values?.count ?? 0,
        op_latency_p95: data.metrics.op_latency_ms?.values?.['p(95)'] ?? 0,
        checks_passed: data.metrics.checks?.values?.passes ?? 0,
        checks_failed: data.metrics.checks?.values?.fails ?? 0,
      },
      null,
      2,
    ),
  };
}
