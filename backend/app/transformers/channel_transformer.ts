import type Channel from '#models/channel'
import { BaseTransformer } from '@adonisjs/core/transformers'

// transforms channel model for json serialization
export default class ChannelTransformer extends BaseTransformer<Channel> {
  // serializes channel attributes to frontend compatible shape
  toObject() {
    return {
      id: this.resource.channelId,
      channelId: this.resource.channelId,
      name: this.resource.name,
      type: this.resource.type,
      adminId: this.resource.adminId,
      createdAt: this.resource.createdAt ? this.resource.createdAt.toMillis() : Date.now(),
      lastActivityAt: this.resource.lastActivity
        ? this.resource.lastActivity.toMillis()
        : Date.now(),
      members: (this.resource.$extras?.memberIds ?? []) as number[],
      banned: (this.resource.$extras?.bannedIds ?? []) as number[],
      kickVotes: (this.resource.$extras?.kickVotes ?? {}) as Record<number, number[]>,
    }
  }
}
