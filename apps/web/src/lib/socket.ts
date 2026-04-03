import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export const connectSocket = (familyId?: string, elderId?: string) => {
  socket = io('http://localhost:5000', {
    withCredentials: true,
  })

  socket.on('connect', () => {
    console.log('🔌 Socket connected')
    if (familyId) socket?.emit('join:family', familyId)
    if (elderId) socket?.emit('join:elder', elderId)
  })

  return socket
}

export const getSocket = () => socket

export const disconnectSocket = () => {
  socket?.disconnect()
  socket = null
}