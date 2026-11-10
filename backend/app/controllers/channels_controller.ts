import Channel from '#models/channel'
import User from '#models/user'
import { createChannelValidator, targetUserValidator } from '#validators/channel'
import ChannelTransformer from '#transformers/channel_transformer'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

// handles channel management and membership operations
export default class ChannelsController {
  // attaches member ids, banned ids and kick votes to channels
  private async attachChannelExtras(channels: Channel[]) {
    if (!channels.length) return

    const channelIds = channels.map((c) => c.channelId)

    const [members, bans, votes] = await Promise.all([
      db.from('channel_users').whereIn('channel_id', channelIds).select('channel_id', 'user_id'),
      db.from('channel_bans').whereIn('channel_id', channelIds).select('channel_id', 'user_id'),
      db
        .from('channel_kick_votes')
        .whereIn('channel_id', channelIds)
        .select('channel_id', 'voter_id', 'target_id'),
    ])

    const membersMap: Record<number, number[]> = {}
    const bansMap: Record<number, number[]> = {}
    const votesMap: Record<number, Record<number, number[]>> = {}

    for (const m of members) {
      const cid = Number(m.channel_id)
      if (!membersMap[cid]) membersMap[cid] = []
      membersMap[cid].push(Number(m.user_id))
    }

    for (const b of bans) {
      const cid = Number(b.channel_id)
      if (!bansMap[cid]) bansMap[cid] = []
      bansMap[cid].push(Number(b.user_id))
    }

    for (const v of votes) {
      const cid = Number(v.channel_id)
      const targetId = Number(v.target_id)
      const voterId = Number(v.voter_id)
      if (!votesMap[cid]) votesMap[cid] = {}
      if (!votesMap[cid][targetId]) votesMap[cid][targetId] = []
      votesMap[cid][targetId].push(voterId)
    }

    for (const c of channels) {
      c.$extras = {
        memberIds: membersMap[c.channelId] || [],
        bannedIds: bansMap[c.channelId] || [],
        kickVotes: votesMap[c.channelId] || {},
      }
    }
  }

  // prunes channels inactive for more than thirty days
  private async pruneInactiveChannels() {
    const cutoff = DateTime.now().minus({ days: 30 }).toSQL()
    if (cutoff) {
      await db.from('channels').where('last_activity', '<', cutoff).delete()
    }
  }

  // lists my channels, invites and discoverable public channels
  async index({ auth, serialize }: HttpContext) {
    await this.pruneInactiveChannels()
    const user = auth.getUserOrFail()

    // finds channel ids where user is a member
    const memberRows = await db
      .from('channel_users')
      .where('user_id', user.userId)
      .select('channel_id')
    const myChannelIds = memberRows.map((r) => Number(r.channel_id))

    // finds channel ids where user has pending invites
    const inviteRows = await db
      .from('channel_invites')
      .where('user_id', user.userId)
      .select('channel_id', 'user_id')
    const inviteChannelIds = inviteRows.map((r) => Number(r.channel_id))

    // finds channel ids where user is banned
    const banRows = await db.from('channel_bans').where('user_id', user.userId).select('channel_id')
    const bannedChannelIds = banRows.map((r) => Number(r.channel_id))

    // loads channel entities
    const allRelevantIds = Array.from(new Set([...myChannelIds, ...inviteChannelIds]))
    const [myChannels, inviteChannels, discoverable] = await Promise.all([
      myChannelIds.length
        ? Channel.query().whereIn('channel_id', myChannelIds).orderBy('last_activity', 'desc')
        : Promise.resolve([]),
      inviteChannelIds.length
        ? Channel.query().whereIn('channel_id', inviteChannelIds)
        : Promise.resolve([]),
      Channel.query()
        .where('type', 'public')
        .whereNotIn(
          'channel_id',
          allRelevantIds.concat(bannedChannelIds).length
            ? allRelevantIds.concat(bannedChannelIds)
            : [0]
        )
        .orderBy('name', 'asc'),
    ])

    const allChannels = [...myChannels, ...inviteChannels, ...discoverable]
    await this.attachChannelExtras(allChannels)

    const invitesData = inviteRows.map((i) => ({
      channelId: Number(i.channel_id),
      userId: Number(i.user_id),
    }))

    return await serialize({
      myChannels: ChannelTransformer.transform(myChannels),
      inviteChannels: ChannelTransformer.transform(inviteChannels),
      invites: invitesData,
      discoverable: ChannelTransformer.transform(discoverable),
    })
  }

  // creates a new channel or joins an existing one
  async store({ auth, request, serialize, response }: HttpContext) {
    await this.pruneInactiveChannels()
    const user = auth.getUserOrFail()
    const payload = await request.validateUsing(createChannelValidator)

    const existing = await Channel.query()
      .whereRaw('LOWER(name) = ?', [payload.name.toLowerCase()])
      .first()

    if (!existing) {
      // creates new channel and adds creator as admin
      const channel = await Channel.create({
        name: payload.name,
        type: payload.type || 'public',
        adminId: user.userId,
        lastActivity: DateTime.now(),
      })

      await db.table('channel_users').insert({
        user_id: user.userId,
        channel_id: channel.channelId,
        joined_at: DateTime.now().toSQL(),
      })

      await this.attachChannelExtras([channel])
      const serialized = await serialize(ChannelTransformer.transform(channel))
      return response.created(serialized)
    }

    // handles join into existing channel
    const isBanned = await db
      .from('channel_bans')
      .where('channel_id', existing.channelId)
      .where('user_id', user.userId)
      .first()

    if (isBanned) {
      return response.forbidden({ message: 'you are permanently banned from this channel' })
    }

    const isMember = await db
      .from('channel_users')
      .where('channel_id', existing.channelId)
      .where('user_id', user.userId)
      .first()

    if (isMember) {
      await this.attachChannelExtras([existing])
      return await serialize(ChannelTransformer.transform(existing))
    }

    if (existing.type === 'private') {
      const invite = await db
        .from('channel_invites')
        .where('channel_id', existing.channelId)
        .where('user_id', user.userId)
        .first()

      if (!invite) {
        return response.forbidden({ message: 'private channel requires an invite' })
      }

      await db
        .from('channel_invites')
        .where('channel_id', existing.channelId)
        .where('user_id', user.userId)
        .delete()
    }

    await db.table('channel_users').insert({
      user_id: user.userId,
      channel_id: existing.channelId,
      joined_at: DateTime.now().toSQL(),
    })

    await this.attachChannelExtras([existing])
    return await serialize(ChannelTransformer.transform(existing))
  }

  // shows details of a specific channel
  async show({ params, serialize }: HttpContext) {
    const channel = await Channel.findOrFail(params.id)
    await this.attachChannelExtras([channel])
    return await serialize(ChannelTransformer.transform(channel))
  }

  // leaves channel or deletes it if user is admin
  async leave({ auth, params, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const channel = await Channel.findOrFail(params.id)

    if (channel.adminId === user.userId) {
      await channel.delete()
      return response.ok({
        message: 'admin left the channel and it has been deleted',
        deleted: true,
        channelId: channel.channelId,
      })
    }

    await db
      .from('channel_users')
      .where('channel_id', channel.channelId)
      .where('user_id', user.userId)
      .delete()

    await db
      .from('channel_kick_votes')
      .where('channel_id', channel.channelId)
      .where((q) => q.where('voter_id', user.userId).orWhere('target_id', user.userId))
      .delete()

    return response.ok({
      message: 'left channel successfully',
      deleted: false,
      channelId: channel.channelId,
    })
  }

  // deletes channel by admin
  async destroy({ auth, params, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const channel = await Channel.findOrFail(params.id)

    if (channel.adminId !== user.userId) {
      return response.forbidden({ message: 'only channel admin can delete the channel' })
    }

    await channel.delete()
    return response.ok({
      message: 'channel deleted successfully',
      deleted: true,
      channelId: channel.channelId,
    })
  }

  // invites user to channel
  async invite({ auth, params, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const channel = await Channel.findOrFail(params.id)
    const { targetNickName } = await request.validateUsing(targetUserValidator)

    const targetUser = await User.query()
      .whereRaw('LOWER(nick_name) = ?', [targetNickName.toLowerCase()])
      .first()

    if (!targetUser) {
      return response.notFound({ message: 'user not found' })
    }

    if (channel.type === 'private' && channel.adminId !== user.userId) {
      return response.forbidden({ message: 'only admin can invite to private channel' })
    }

    const isMember = await db
      .from('channel_users')
      .where('channel_id', channel.channelId)
      .where('user_id', targetUser.userId)
      .first()

    if (isMember) {
      return response.badRequest({ message: 'user is already a member of this channel' })
    }

    // lifts ban if admin invites
    if (channel.adminId === user.userId) {
      await db
        .from('channel_bans')
        .where('channel_id', channel.channelId)
        .where('user_id', targetUser.userId)
        .delete()
    } else {
      const isBanned = await db
        .from('channel_bans')
        .where('channel_id', channel.channelId)
        .where('user_id', targetUser.userId)
        .first()

      if (isBanned) {
        return response.forbidden({ message: 'user is banned and cannot be invited' })
      }
    }

    const existingInvite = await db
      .from('channel_invites')
      .where('channel_id', channel.channelId)
      .where('user_id', targetUser.userId)
      .first()

    if (!existingInvite) {
      await db.table('channel_invites').insert({
        channel_id: channel.channelId,
        user_id: targetUser.userId,
        invited_by: user.userId,
        created_at: DateTime.now().toSQL(),
      })
    }

    return response.ok({
      message: 'invitation sent successfully',
      targetId: targetUser.userId,
      channelId: channel.channelId,
    })
  }

  // accepts channel invite
  async acceptInvite({ auth, params, serialize, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const channel = await Channel.findOrFail(params.id)

    const invite = await db
      .from('channel_invites')
      .where('channel_id', channel.channelId)
      .where('user_id', user.userId)
      .first()

    if (!invite) {
      return response.notFound({ message: 'invitation not found' })
    }

    await db
      .from('channel_invites')
      .where('channel_id', channel.channelId)
      .where('user_id', user.userId)
      .delete()

    const isMember = await db
      .from('channel_users')
      .where('channel_id', channel.channelId)
      .where('user_id', user.userId)
      .first()

    if (!isMember) {
      await db.table('channel_users').insert({
        user_id: user.userId,
        channel_id: channel.channelId,
        joined_at: DateTime.now().toSQL(),
      })
    }

    await this.attachChannelExtras([channel])
    return await serialize(ChannelTransformer.transform(channel))
  }

  // declines channel invite
  async declineInvite({ auth, params, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const channelId = Number(params.id)

    await db
      .from('channel_invites')
      .where('channel_id', channelId)
      .where('user_id', user.userId)
      .delete()

    return response.ok({
      message: 'invitation declined successfully',
      channelId,
    })
  }

  // revokes user membership in private channel
  async revoke({ auth, params, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const channel = await Channel.findOrFail(params.id)
    const targetUserId = Number(params.userId)

    if (channel.type !== 'private') {
      return response.badRequest({ message: 'revoke works only in private channels' })
    }

    if (channel.adminId !== user.userId) {
      return response.forbidden({ message: 'only admin can revoke members' })
    }

    if (targetUserId === user.userId) {
      return response.badRequest({ message: 'cannot revoke self' })
    }

    await db
      .from('channel_users')
      .where('channel_id', channel.channelId)
      .where('user_id', targetUserId)
      .delete()

    await db
      .from('channel_invites')
      .where('channel_id', channel.channelId)
      .where('user_id', targetUserId)
      .delete()

    return response.ok({
      message: 'member removed successfully',
      channelId: channel.channelId,
      userId: targetUserId,
    })
  }

  // votes to kick or bans user from public channel
  async kick({ auth, params, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const channel = await Channel.findOrFail(params.id)
    const { targetNickName } = await request.validateUsing(targetUserValidator)

    if (channel.type !== 'public') {
      return response.badRequest({ message: 'kick works only in public channels' })
    }

    const targetUser = await User.query()
      .whereRaw('LOWER(nick_name) = ?', [targetNickName.toLowerCase()])
      .first()

    if (!targetUser) {
      return response.notFound({ message: 'user not found' })
    }

    if (targetUser.userId === channel.adminId || targetUser.userId === user.userId) {
      return response.badRequest({ message: 'this user cannot be kicked' })
    }

    const isMember = await db
      .from('channel_users')
      .where('channel_id', channel.channelId)
      .where('user_id', targetUser.userId)
      .first()

    if (!isMember) {
      return response.badRequest({ message: 'user is not a member of this channel' })
    }

    // ban helper logic
    const banUser = async () => {
      await db
        .from('channel_users')
        .where('channel_id', channel.channelId)
        .where('user_id', targetUser.userId)
        .delete()

      const alreadyBanned = await db
        .from('channel_bans')
        .where('channel_id', channel.channelId)
        .where('user_id', targetUser.userId)
        .first()

      if (!alreadyBanned) {
        await db.table('channel_bans').insert({
          user_id: targetUser.userId,
          channel_id: channel.channelId,
          banned_at: DateTime.now().toSQL(),
        })
      }

      await db
        .from('channel_kick_votes')
        .where('channel_id', channel.channelId)
        .where('target_id', targetUser.userId)
        .delete()
    }

    if (channel.adminId === user.userId) {
      await banUser()
      return response.ok({
        message: 'user permanently banned from channel',
        banned: true,
        targetId: targetUser.userId,
      })
    }

    const existingVote = await db
      .from('channel_kick_votes')
      .where('channel_id', channel.channelId)
      .where('voter_id', user.userId)
      .where('target_id', targetUser.userId)
      .first()

    if (existingVote) {
      return response.badRequest({ message: 'already voted to kick this user' })
    }

    await db.table('channel_kick_votes').insert({
      channel_id: channel.channelId,
      voter_id: user.userId,
      target_id: targetUser.userId,
      created_at: DateTime.now().toSQL(),
    })

    const voteRows = await db
      .from('channel_kick_votes')
      .where('channel_id', channel.channelId)
      .where('target_id', targetUser.userId)
      .select('voter_id')

    if (voteRows.length >= 3) {
      await banUser()
      return response.ok({
        message: 'user reached three kick votes and has been banned',
        banned: true,
        targetId: targetUser.userId,
      })
    }

    return response.ok({
      message: 'vote to kick recorded',
      banned: false,
      votes: voteRows.length,
      targetId: targetUser.userId,
    })
  }

  // prunes inactive channels manually
  async prune({ response }: HttpContext) {
    await this.pruneInactiveChannels()
    return response.ok({
      message: 'inactive channels pruned successfully',
    })
  }
}
