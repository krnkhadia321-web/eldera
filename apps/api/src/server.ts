import http from 'http'
import { Server } from 'socket.io'
import dotenv from 'dotenv'
dotenv.config()

import app from './app'
import { initSocket } from './sockets/socket.gateway'
import { startAllJobs } from './jobs/reminder.cron'
import { startCleanupJobs } from './jobs/cleanup.cron'

const PORT = process.env.PORT || 5000

const httpServer = http.createServer(app)

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
})

initSocket(io)

startAllJobs()
startCleanupJobs()

httpServer.listen(PORT, () => {
  console.log(`🚀 EldEra API running on port ${PORT}`)
  console.log(`📡 Environment: ${process.env.NODE_ENV}`)
})

export { io }