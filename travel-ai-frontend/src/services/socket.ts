
import { io, Socket } from 'socket.io-client';

// Point this directly to your Express Real-Time Server
const SOCKET_URL = 'http://localhost:5000';

// Initialize the socket connection
export const socket: Socket = io(SOCKET_URL, {
  withCredentials: true,
});

// listeners to work in your browser console
socket.on('connect', () => {
  console.log('✅ Connected to Express WebSocket Server:', socket.id);
});

socket.on('disconnect', () => {
  console.log('❌ Disconnected from Server');
});