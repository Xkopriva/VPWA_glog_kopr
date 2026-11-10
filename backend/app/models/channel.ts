import { ChannelSchema } from '#database/schema'
import User from '#models/user'
import { manyToMany, belongsTo } from '@adonisjs/lucid/orm'
import type { ManyToMany, BelongsTo } from '@adonisjs/lucid/types/relations'

// channel model representing chat channels
export default class Channel extends ChannelSchema {
  // sets primary key to match channel id in database
  static primaryKey = 'channelId'
  static table = 'channels'

  // compatibility getter for standard id property
  get id(): number {
    return this.channelId
  }

  // defines admin user relation
  @belongsTo(() => User, { foreignKey: 'adminId' })
  declare admin: BelongsTo<typeof User>

  // defines many to many member relation through channel users table
  @manyToMany(() => User, {
    pivotTable: 'channel_users',
    pivotForeignKey: 'channel_id',
    pivotRelatedForeignKey: 'user_id',
    pivotTimestamps: { createdAt: 'joined_at', updatedAt: false },
  })
  declare members: ManyToMany<typeof User>
}
