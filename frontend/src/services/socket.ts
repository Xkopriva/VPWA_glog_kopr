import { io, type Socket } from 'socket.io-client'
import { getStoredToken } from '@/services/api'

// websocket server url pointing to adonis backend
const WS_URL = 'http://localhost:3333'

let socket: Socket | null = null

// opens authenticated socket connection (reuses existing one if already connected)
export function connectSocket(): Socket | null {
  const token = getStoredToken()
  if (!token) return null
  if (socket) {
    if (socket.connected || socket.active) return socket
    socket.auth = { token }
    socket.connect()
    return socket
  }
  socket = io(WS_URL, { auth: { token }, transports: ['websocket', 'polling'] })
  return socket
}

// closes socket connection, used on logout
export function disconnectSocket(): void {
  if (socket) {
    socket.removeAllListeners()
    socket.disconnect()
    socket = null
  }
}
