import type { WorkerInbound, WorkerOutbound, ConnectionState, TransportType } from './WorkerProtocol';

let ws: WebSocket | null = null;
let state: ConnectionState = 'disconnected';
let transport: TransportType = 'none';
let rtt = 0;
let pingTimer: ReturnType<typeof setInterval> | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let reconnectAttempts = 0;
let lastPingTime = 0;

// Connection config
let currentUrl = '';
let currentRoomId = '';
let currentClientId = '';
let currentDisplayName = '';
let currentLastSeenServerSeq = 0;

const PING_INTERVAL = 15_000;
const PONG_TIMEOUT = 5_000;
const MAX_RECONNECT_DELAY = 30_000;
const WS_FAIL_THRESHOLD = 3;

function post(msg: WorkerOutbound) {
  self.postMessage(msg);
}

function updateStatus() {
  post({ type: 'status', state, transport, rtt });
}

function connect() {
  if (ws) {
    ws.close();
    ws = null;
  }

  state = reconnectAttempts > 0 ? 'reconnecting' : 'connecting';
  transport = 'websocket';
  updateStatus();

  const wsUrl = currentUrl.replace(/^http/, 'ws') + `/ws/${currentRoomId}`;

  try {
    ws = new WebSocket(wsUrl);
  } catch {
    handleWsFailure('WebSocket constructor failed');
    return;
  }

  ws.onopen = () => {
    state = 'connected';
    transport = 'websocket';
    reconnectAttempts = 0;
    updateStatus();
    post({ type: 'connected' });

    // Send join message
    ws!.send(JSON.stringify({
      type: 'join',
      roomId: currentRoomId,
      clientId: currentClientId,
      displayName: currentDisplayName,
      lastSeenServerSeq: currentLastSeenServerSeq,
    }));

    startPingLoop();
  };

  ws.onmessage = (event) => {
    const data = typeof event.data === 'string' ? event.data : '';

    // Handle pong
    try {
      const msg = JSON.parse(data);
      if (msg.type === 'pong') {
        rtt = Date.now() - lastPingTime;
        updateStatus();
        return;
      }
    } catch {
      // Not JSON, forward as-is
    }

    post({ type: 'message', data });
  };

  ws.onclose = (event) => {
    stopPingLoop();
    ws = null;

    if (state !== 'disconnected') {
      handleWsFailure(`WebSocket closed: ${event.code} ${event.reason}`);
    }
  };

  ws.onerror = () => {
    // onclose will fire after onerror
  };
}

function handleWsFailure(reason: string) {
  reconnectAttempts++;

  if (reconnectAttempts > WS_FAIL_THRESHOLD) {
    // Switch to long-poll fallback
    state = 'fallback_polling';
    transport = 'longpoll';
    updateStatus();
    startLongPoll();
    return;
  }

  // Exponential backoff
  const delay = Math.min(1000 * 2 ** (reconnectAttempts - 1), MAX_RECONNECT_DELAY);
  state = 'reconnecting';
  updateStatus();

  reconnectTimer = setTimeout(() => {
    connect();
  }, delay);
}

function startPingLoop() {
  stopPingLoop();
  pingTimer = setInterval(() => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      lastPingTime = Date.now();
      ws.send(JSON.stringify({ type: 'ping' }));

      // Pong timeout check
      setTimeout(() => {
        if (Date.now() - lastPingTime > PONG_TIMEOUT && rtt === 0) {
          // No pong received — connection might be dead
          if (ws) {
            ws.close();
          }
        }
      }, PONG_TIMEOUT);
    }
  }, PING_INTERVAL);
}

function stopPingLoop() {
  if (pingTimer) {
    clearInterval(pingTimer);
    pingTimer = null;
  }
}

// Long-poll fallback
let pollActive = false;
let pollTimer: ReturnType<typeof setTimeout> | null = null;

function startLongPoll() {
  pollActive = true;
  pollLoop();
}

function stopLongPoll() {
  pollActive = false;
  if (pollTimer) {
    clearTimeout(pollTimer);
    pollTimer = null;
  }
}

async function pollLoop() {
  if (!pollActive) return;

  try {
    const baseUrl = currentUrl.replace(/\/$/, '');
    const url = `${baseUrl}/api/poll?roomId=${currentRoomId}&since=${currentLastSeenServerSeq}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.ops && Array.isArray(data.ops)) {
      for (const op of data.ops) {
        post({ type: 'message', data: JSON.stringify(op) });
      }
    }
  } catch {
    // Poll failed, retry
  }

  if (pollActive) {
    pollTimer = setTimeout(pollLoop, 1000); // Poll every 1s
  }
}

function disconnect() {
  state = 'disconnected';
  transport = 'none';
  stopPingLoop();
  stopLongPoll();

  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  if (ws) {
    ws.close();
    ws = null;
  }

  reconnectAttempts = 0;
  updateStatus();
  post({ type: 'disconnected', reason: 'manual' });
}

// Message handler
self.onmessage = (event: MessageEvent<WorkerInbound>) => {
  const msg = event.data;

  switch (msg.type) {
    case 'connect':
      currentUrl = msg.url;
      currentRoomId = msg.roomId;
      currentClientId = msg.clientId;
      currentDisplayName = msg.displayName;
      currentLastSeenServerSeq = msg.lastSeenServerSeq;
      reconnectAttempts = 0;
      connect();
      break;

    case 'send':
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(msg.data);
      } else if (pollActive) {
        // Send via HTTP POST for long-poll mode
        const baseUrl = currentUrl.replace(/\/$/, '');
        fetch(`${baseUrl}/api/ops`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: msg.data,
        }).catch(() => {
          post({ type: 'error', message: 'Failed to send op via HTTP' });
        });
      }
      break;

    case 'disconnect':
      disconnect();
      break;
  }
};
