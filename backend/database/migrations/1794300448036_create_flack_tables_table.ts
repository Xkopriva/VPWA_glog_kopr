import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    //creates users table
    this.schema.createTable('users', (table) => {
      table.increments('user_id').primary()
      table.string('first_name', 50).notNullable()
      table.string('last_name', 100).notNullable()
      table.string('nick_name', 50).notNullable().unique()
      table.string('email', 255).notNullable().unique()
      table.string('password', 255).notNullable()
      table
        .enum('status', ['online', 'dnd', 'offline'], { useNative: true, enumName: 'user_status' })
        .notNullable()
        .defaultTo('offline')
      table.boolean('only_mentions').notNullable().defaultTo(false)
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
    })

    //creates channels table
    this.schema.createTable('channels', (table) => {
      table.increments('channel_id').primary()
      table
        .integer('admin_id')
        .unsigned()
        .notNullable()
        .references('user_id')
        .inTable('users')
        .onDelete('RESTRICT')
      table.string('name', 24).notNullable().unique()
      table
        .enum('type', ['private', 'public'], { useNative: true, enumName: 'channel_type' })
        .notNullable()
        .defaultTo('public')
      table.timestamp('last_activity', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())

      table.index(['admin_id'], 'idx_channels_admin')
    })

    //creates messages table
    this.schema.createTable('messages', (table) => {
      table.increments('message_id').primary()
      table
        .integer('channel_id')
        .unsigned()
        .notNullable()
        .references('channel_id')
        .inTable('channels')
        .onDelete('CASCADE')
      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('user_id')
        .inTable('users')
        .onDelete('CASCADE')
      table.text('text').notNullable()
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())

      table.index(['channel_id', 'created_at'], 'idx_messages_channel_time')
      table.index(['user_id'], 'idx_messages_user')
    })

    //creates message mentions junction table
    this.schema.createTable('message_mentions', (table) => {
      table
        .integer('message_id')
        .unsigned()
        .notNullable()
        .references('message_id')
        .inTable('messages')
        .onDelete('CASCADE')
      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('user_id')
        .inTable('users')
        .onDelete('CASCADE')
      table.primary(['message_id', 'user_id'])

      table.index(['user_id'], 'idx_mentions_user')
    })

    //creates channel users junction table
    this.schema.createTable('channel_users', (table) => {
      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('user_id')
        .inTable('users')
        .onDelete('CASCADE')
      table
        .integer('channel_id')
        .unsigned()
        .notNullable()
        .references('channel_id')
        .inTable('channels')
        .onDelete('CASCADE')
      table.timestamp('joined_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.primary(['user_id', 'channel_id'])

      table.index(['channel_id'], 'idx_channel_users_channel')
    })

    //creates channel invites table
    this.schema.createTable('channel_invites', (table) => {
      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('user_id')
        .inTable('users')
        .onDelete('CASCADE')
      table
        .integer('channel_id')
        .unsigned()
        .notNullable()
        .references('channel_id')
        .inTable('channels')
        .onDelete('CASCADE')
      table
        .integer('invited_by')
        .unsigned()
        .notNullable()
        .references('user_id')
        .inTable('users')
        .onDelete('CASCADE')
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.primary(['user_id', 'channel_id'])
      table.check('user_id <> invited_by', [], 'chk_invite_not_self')

      table.index(['channel_id'], 'idx_channel_invites_channel')
    })

    //creates channel bans table
    this.schema.createTable('channel_bans', (table) => {
      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('user_id')
        .inTable('users')
        .onDelete('CASCADE')
      table
        .integer('channel_id')
        .unsigned()
        .notNullable()
        .references('channel_id')
        .inTable('channels')
        .onDelete('CASCADE')
      table.timestamp('banned_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.primary(['user_id', 'channel_id'])

      table.index(['channel_id'], 'idx_channel_bans_channel')
    })

    //creates channel kick votes table
    this.schema.createTable('channel_kick_votes', (table) => {
      table
        .integer('channel_id')
        .unsigned()
        .notNullable()
        .references('channel_id')
        .inTable('channels')
        .onDelete('CASCADE')
      table
        .integer('voter_id')
        .unsigned()
        .notNullable()
        .references('user_id')
        .inTable('users')
        .onDelete('CASCADE')
      table
        .integer('target_id')
        .unsigned()
        .notNullable()
        .references('user_id')
        .inTable('users')
        .onDelete('CASCADE')
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.primary(['channel_id', 'voter_id', 'target_id'])
      table.check('voter_id <> target_id', [], 'chk_kick_not_self')

      table.index(['channel_id', 'target_id'], 'idx_kick_votes_target')
    })
  }

  async down() {
    //drops tables in reverse order of creation
    this.schema.dropTable('channel_kick_votes')
    this.schema.dropTable('channel_bans')
    this.schema.dropTable('channel_invites')
    this.schema.dropTable('channel_users')
    this.schema.dropTable('message_mentions')
    this.schema.dropTable('messages')
    this.schema.dropTable('channels')
    this.schema.dropTable('users')

    //drops native postgresql enum types
    this.schema.raw('DROP TYPE IF EXISTS user_status')
    this.schema.raw('DROP TYPE IF EXISTS channel_type')
  }
}
