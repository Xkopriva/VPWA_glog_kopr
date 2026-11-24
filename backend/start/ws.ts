import app from '@adonisjs/core/services/app'
import server from '@adonisjs/core/services/server'
import type { Server as HttpServer } from 'node:http'
import ws from '#services/ws'

// starts socket.io once the http server is ready
app.ready(() => {
  const nodeServer = server.getNodeServer()
  if (nodeServer) {
    ws.boot(nodeServer as HttpServer)
  }
})
