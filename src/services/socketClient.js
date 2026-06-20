import { io } from "socket.io-client";

// Where the Socket.IO server lives. Defaults to same-origin ("/") so a Vite
// proxy or same-host backend works without extra config; override per-env.
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? "/";

// Single shared connection for the whole app (Socket.IO multiplexes events
// over one connection, so we never want more than one).
let socket = null;

/** Lazily create the shared socket. Does NOT connect until connectSocket(). */
export function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      transports: ["websocket"],
      // Pull a token from storage if/when auth is wired up.
      // auth: { token: localStorage.getItem("token") },
    });
  }
  return socket;
}

/** Open the shared connection (idempotent — safe to call repeatedly). */
export function connectSocket() {
  const s = getSocket();
  if (!s.connected) s.connect();
  return s;
}

/** Close the shared connection (e.g. on logout). */
export function disconnectSocket() {
  if (socket?.connected) socket.disconnect();
}
