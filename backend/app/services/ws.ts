import { Server, type Socket } from 'socket.io'
import type { Server as HttpServer } from 'node:http'
import { Secret } from '@adonisjs/core/helpers'
import User from '#models/user'

// websocket service built on socket.io for real time chat events
class Ws {
  io: Server | null = null
  private booted = false

  // attaches socket.io to the adonis http server and authenticates sockets by access token
  boot(httpServer: HttpServer) {
    if (this.booted) return
    this.booted = true

    this.io = new Server(httpServer, {
      cors: { origin: true, credentials: true },
    })

    // verifies access token sent by client in handshake auth
    this.io.use(async (socket: Socket, next) => {
      try {
        const raw = socket.handshake.auth?.token
        if (!raw || typeof raw !== 'string') return next(new Error('unauthorized'))
        const token = await User.accessTokens.verify(new Secret(raw))
        if (!token) return next(new Error('unauthorized'))
        socket.data.userId = Number(token.tokenableId)
        next()
      } catch {
        next(new Error('unauthorized'))
      }
    })

    // each socket joins a personal room so events can be sent to a specific user
    this.io.on('connection', (socket: Socket) => {
      socket.join(Ws.userRoom(socket.data.userId))
    })
  }

  // returns room name for a user
  static userRoom(userId: number) {
    return `user:${userId}`
  }

  // emits an event to all sockets of the given users
  emitToUsers(userIds: number[], event: string, payload: unknown) {
    if (!this.io || !userIds.length) return
    this.io.to(userIds.map((id) => Ws.userRoom(id))).emit(event, payload)
  }
}

export default new Ws()
