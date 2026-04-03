import { Server, Socket } from 'socket.io'

export const initSocket = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log(`🔌 Client connected: ${socket.id}`)

    socket.on('join:family', (familyId: string) => {
      socket.join(`family:${familyId}`)
      console.log(`Socket ${socket.id} joined family:${familyId}`)
    })

    socket.on('join:elder', (elderId: string) => {
      socket.join(`elder:${elderId}`)
      console.log(`Socket ${socket.id} joined elder:${elderId}`)
    })

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`)
    })
  })
}

export const emitToFamily = (
  io: Server,
  familyId: string,
  event: string,
  data: unknown
) => {
  io.to(`family:${familyId}`).emit(event, data)
}

export const emitToElder = (
  io: Server,
  elderId: string,
  event: string,
  data: unknown
) => {
  io.to(`elder:${elderId}`).emit(event, data)
}