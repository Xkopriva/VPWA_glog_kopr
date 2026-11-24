import { MessageSchema } from '#database/schema'
import User from '#models/user'
import Channel from '#models/channel'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

// message model representing chat messages in channels
export default class Message extends MessageSchema {
  // sets primary key to match message id in database
  static primaryKey = 'messageId'
  static table = 'messages'

  // compatibility getter for standard id property
  get id(): number {
    return this.messageId
  }

  // defines author relation
  @belongsTo(() => User, { foreignKey: 'userId' })
  declare author: BelongsTo<typeof User>

  // defines channel relation
  @belongsTo(() => Channel, { foreignKey: 'channelId' })
  declare channel: BelongsTo<typeof Channel>
}
