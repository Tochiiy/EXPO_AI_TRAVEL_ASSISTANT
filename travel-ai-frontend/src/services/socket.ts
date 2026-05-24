/*import { io, Socket } from 'socket.io-client';


const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const socket: Socket = io(SOCKET_URL, {
  withCredentials: true,
  
  transports: ['websocket', 'polling'], 
});

*/

import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'https://expo-ai-travel-assistant.onrender.com';

export const socket: Socket = io(SOCKET_URL, {
  withCredentials: true,
  transports: ['websocket', 'polling'], 
});