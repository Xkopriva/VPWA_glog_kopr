import Message from '#models/message'
import { createMessageValidator } from '#validators/message'
import ws from '#services/ws'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

// maximum number of messages returned in channel history
const HISTORY_LIMIT = 500

// handles loading and sending chat messages in channels
export default class MessagesController {
  // checks if user is member of channel
  private async isMember(channelId: number, userId: number) {
    const row = await db
      .from('channel_users')
      .where('channel_id', channelId)
      .where('user_id', userId)
      .first()
    return !!row
  }

  // converts message row and mention ids to frontend message format
  private toPayload(m: Message, mentions: number[]) {
    return {
      id: m.messageId,
      channelId: Number(m.channelId),
      authorId: Number(m.userId),
      text: m.text,
      createdAt: m.createdAt.toMillis(),
      mentions,
    }
  }

  // lists latest messages of a channel ordered from oldest to newest
  async index({ auth, params, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const channelId = Number(params.id)

    if (!(await this.isMember(channelId, user.userId))) {
      return response.forbidden({ message: 'Nie ste členom kanála.' })
    }

    const latest = await Message.query()
      .where('channel_id', channelId)
      .orderBy('created_at', 'desc')
      .orderBy('message_id', 'desc')
      .limit(HISTORY_LIMIT)
    const messages = latest.reverse()

    // loads mentions for returned messages
    const mentionsMap: Record<number, number[]> = {}
    if (messages.length) {
      const rows = await db
        .from('message_mentions')
        .whereIn(
          'message_id',
          messages.map((m) => m.messageId)
        )
        .select('message_id', 'user_id')
      for (const r of rows) {
        const mid = Number(r.message_id)
        if (!mentionsMap[mid]) mentionsMap[mid] = []
        mentionsMap[mid].push(Number(r.user_id))
      }
    }

    return messages.map((m) => this.toPayload(m, mentionsMap[m.messageId] || []))
  }

  // stores new message and broadcasts it to all channel members
  async store({ auth, params, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const channelId = Number(params.id)
    const { text } = await request.validateUsing(createMessageValidator)

    if (!(await this.isMember(channelId, user.userId))) {
      return response.forbidden({
        message: 'Správu môžete odoslať iba v kanáli, ktorého ste členom.',
      })
    }

    // finds mentioned users by nickname
    const nicks = Array.from(new Set([...text.matchAll(/@(\w+)/g)].map((x) => x[1].toLowerCase())))
    const mentionedRows = nicks.length
      ? await db
          .from('users')
          .where((q) => {
            nicks.forEach((n) => q.orWhereRaw('LOWER(nick_name) = ?', [n]))
          })
          .select('user_id')
      : []
    const mentionedIds: number[] = mentionedRows.map((r) => Number(r.user_id))

    // saves message, mentions and channel activity in one transaction
    const message = await db.transaction(async (trx) => {
      const m = await Message.create({ channelId, userId: user.userId, text }, { client: trx })
      if (mentionedIds.length) {
        await trx
          .table('message_mentions')
          .insert(mentionedIds.map((uid) => ({ message_id: m.messageId, user_id: uid })))
      }
      await trx
        .from('channels')
        .where('channel_id', channelId)
        .update({ last_activity: DateTime.now().toSQL() })
      return m
    })

    // reloads message so created_at default from database is present
    await message.refresh()
    const payload = this.toPayload(message, mentionedIds)

    // pushes new message to every member of the channel
    const members = await db.from('channel_users').where('channel_id', channelId).select('user_id')
    ws.emitToUsers(
      members.map((r) => Number(r.user_id)),
      'message:new',
      payload
    )

    return response.created(payload)
  }
}
