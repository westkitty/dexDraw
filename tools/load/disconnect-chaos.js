/**
 * k6 chaos/disconnect storm test for dexDraw.
 * Simulates clients that rapidly connect, send a few ops, then disconnect.
 *
 * Usage:
 *   k6 run tools/load/disconnect-chaos.js
 */

import { check, sleep } from 'k6';
import { Counter } from 'k6/metrics';
import ws from 'k6/ws';

const WS_URL = __ENV.WS_URL || 'ws://localhost:4000/ws/chaos-board';

export const options = {
  scenarios: {
    disconnect_storm: {
      executor: 'ramping-vus',
      startVUs: 2,
      stages: [
        { duration: '10s', target: 5 },
        { duration: '10s', target: 20 },
        { duration: '10s', target: 5 },
        { duration: '10s', target: 0 },
      ],
    },
  },
  thresholds: {
    checks: ['rate>0.90'],
  },
};

const disconnects = new Counter('disconnect_count');
const reconnects = new Counter('reconnect_count');

export default function () {
  const clientId = `chaos-${__VU}-${__ITER}`;

  // Connect
  const res = ws.connect(WS_URL, {}, (socket) => {
    socket.on('open', () => {
      reconnects.add(1);
      socket.send(
        JSON.stringify({
          type: 'join',
          clientId,
          displayName: `Chaos-${__VU}`,
          lastSeenServerSeq: 0,
        }),
      );
    });

    // Send a burst of ops
    for (let i = 0; i < 5; i++) {
      socket.send(
        JSON.stringify({
          v: 1,
          type: 'durable',
          roomId: 'chaos-board',
          clientId,
          msgId: `${clientId}-${i}`,
          ts: Date.now(),
          payload: {
            kind: 'opBatch',
            clientSeqStart: i,
            ops: [
              {
                type: 'createObject',
                objectId: `${clientId}-obj-${i}`,
                objectType: 'stroke',
                data: {},
              },
            ],
          },
        }),
      );
    }

    // Disconnect after a random short delay (0-2s)
    sleep(Math.random() * 2);
    socket.close();
    disconnects.add(1);
  });

  check(res, {
    connected: (r) => r && r.status === 101,
  });

  // Brief pause before reconnecting
  sleep(Math.random() * 1);
}
