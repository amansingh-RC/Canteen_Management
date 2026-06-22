// Connect to Socket.IO, fire a test device scan via /iclock/cdata, and log
// every event to discover what the dashboard should listen to.
import { io } from "socket.io-client";

const HOST = process.argv[2] || "http://172.16.60.155:8083";
const USER_ID = process.argv[3] || "1";        // must be an existing userId
const TS = process.argv[4] || "2026-06-22 12:30:00"; // inside an active meal window
console.log("connecting to", HOST);

const socket = io(HOST, { transports: ["websocket", "polling"], reconnection: false });

socket.onAny((event, ...args) => {
  console.log("📨 EVENT:", event, "→", JSON.stringify(args).slice(0, 400));
});

socket.on("connect", async () => {
  console.log("✅ connected:", socket.id);
  // Fire a device scan a moment after connecting so we catch the emitted event.
  setTimeout(async () => {
    const body = `${USER_ID}\t${TS}\t1`;
    try {
      const res = await fetch(`${HOST}/iclock/cdata`, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body,
      });
      console.log("🛰️  posted scan, HTTP", res.status, "→", (await res.text()).slice(0, 200));
    } catch (e) {
      console.log("scan post failed:", e.message);
    }
  }, 1500);
});
socket.on("connect_error", (e) => console.log("connect_error:", e.message));

setTimeout(() => {
  console.log("done.");
  socket.close();
  process.exit(0);
}, 12000);
