import { io } from "socket.io-client";

const BACKEND_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export const socket = io(BACKEND_URL, {
  autoConnect: false,
  withCredentials: true,
  reconnection: true,
  reconnectionAttempts: 5,
  transports: ["websocket", "polling"],
});

export const connectSocket = (token) => {
  if (token) {
    socket.auth = { token };
  }

  if (!socket.connected) {
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
    socket.auth = {};
  }
};

socket.on("connect_error", (err) => {
  console.error("Socket Connection Error:", err.message);
});
