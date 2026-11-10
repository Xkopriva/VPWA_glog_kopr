import { BaseSeeder } from '@adonisjs/lucid/seeders'
import db from '@adonisjs/lucid/services/db'
import hash from '@adonisjs/core/services/hash'

export default class extends BaseSeeder {
  async run() {
    // truncates existing tables in reverse order of foreign key dependencies
    await db.rawQuery(`
      TRUNCATE channel_kick_votes, channel_bans, channel_invites, 
               channel_users, message_mentions, messages, channels, users CASCADE;
    `)

    //generates valid hash for test password
    const hashedPassword = await hash.make('1234')

    //inserts users data with hashed password
    await db.table('users').multiInsert([
      {
        user_id: 1,
        first_name: 'Jozef',
        last_name: 'Mrkvicka',
        nick_name: 'jozko',
        email: 'jozko@flack.sk',
        password: hashedPassword,
        status: 'online',
        only_mentions: false,
      },
      {
        user_id: 2,
        first_name: 'Anna',
        last_name: 'Novakova',
        nick_name: 'anka',
        email: 'anka@flack.sk',
        password: hashedPassword,
        status: 'online',
        only_mentions: false,
      },
      {
        user_id: 3,
        first_name: 'Peter',
        last_name: 'Kovac',
        nick_name: 'peto',
        email: 'peto@flack.sk',
        password: hashedPassword,
        status: 'dnd',
        only_mentions: true,
      },
      {
        user_id: 4,
        first_name: 'Jana',
        last_name: 'Horvathova',
        nick_name: 'jana',
        email: 'jana@flack.sk',
        password: hashedPassword,
        status: 'online',
        only_mentions: false,
      },
      {
        user_id: 5,
        first_name: 'Martin',
        last_name: 'Szabo',
        nick_name: 'martin',
        email: 'martin@flack.sk',
        password: hashedPassword,
        status: 'offline',
        only_mentions: false,
      },
      {
        user_id: 6,
        first_name: 'Lucia',
        last_name: 'Balaz',
        nick_name: 'lucia',
        email: 'lucia@flack.sk',
        password: hashedPassword,
        status: 'online',
        only_mentions: true,
      },
      {
        user_id: 7,
        first_name: 'Tomas',
        last_name: 'Kral',
        nick_name: 'tomas',
        email: 'tomas@flack.sk',
        password: hashedPassword,
        status: 'dnd',
        only_mentions: false,
      },
      {
        user_id: 8,
        first_name: 'Eva',
        last_name: 'Vargova',
        nick_name: 'eva',
        email: 'eva@flack.sk',
        password: hashedPassword,
        status: 'offline',
        only_mentions: false,
      },
      {
        user_id: 9,
        first_name: 'Michal',
        last_name: 'Toth',
        nick_name: 'michal',
        email: 'michal@flack.sk',
        password: hashedPassword,
        status: 'online',
        only_mentions: false,
      },
      {
        user_id: 10,
        first_name: 'Zuzana',
        last_name: 'Polakova',
        nick_name: 'zuzka',
        email: 'zuzka@flack.sk',
        password: hashedPassword,
        status: 'offline',
        only_mentions: true,
      },
    ])

    //inserts channels data
    await db.table('channels').multiInsert([
      { channel_id: 1, admin_id: 1, name: 'general', type: 'public' },
      { channel_id: 2, admin_id: 2, name: 'random', type: 'public' },
      { channel_id: 3, admin_id: 3, name: 'projekt-flack', type: 'private' },
      { channel_id: 4, admin_id: 5, name: 'gaming', type: 'public' },
      { channel_id: 5, admin_id: 4, name: 'ucenie', type: 'private' },
    ])

    // inserts channel users memberships
    await db.table('channel_users').multiInsert([
      { user_id: 1, channel_id: 1 },
      { user_id: 2, channel_id: 1 },
      { user_id: 3, channel_id: 1 },
      { user_id: 4, channel_id: 1 },
      { user_id: 5, channel_id: 1 },
      { user_id: 6, channel_id: 1 },
      { user_id: 7, channel_id: 1 },
      { user_id: 8, channel_id: 1 },
      { user_id: 9, channel_id: 1 },
      { user_id: 2, channel_id: 2 },
      { user_id: 1, channel_id: 2 },
      { user_id: 4, channel_id: 2 },
      { user_id: 6, channel_id: 2 },
      { user_id: 8, channel_id: 2 },
      { user_id: 3, channel_id: 3 },
      { user_id: 1, channel_id: 3 },
      { user_id: 2, channel_id: 3 },
      { user_id: 7, channel_id: 3 },
      { user_id: 5, channel_id: 4 },
      { user_id: 6, channel_id: 4 },
      { user_id: 7, channel_id: 4 },
      { user_id: 9, channel_id: 4 },
      { user_id: 4, channel_id: 5 },
      { user_id: 1, channel_id: 5 },
      { user_id: 8, channel_id: 5 },
      { user_id: 10, channel_id: 5 },
    ])

    // inserts messages data
    await db.table('messages').multiInsert([
      { message_id: 1, channel_id: 1, user_id: 1, text: 'Ahojte vsetci, vitajte vo Flacku!' },
      { message_id: 2, channel_id: 1, user_id: 2, text: 'Ahoj @jozko, super ze tu si.' },
      { message_id: 3, channel_id: 1, user_id: 3, text: 'Kto sa pripaja na dnesny call?' },
      { message_id: 4, channel_id: 1, user_id: 4, text: 'Ja, @peto, budem tam o 15:00.' },
      { message_id: 5, channel_id: 2, user_id: 2, text: 'Videl niekto ten novy film?' },
      { message_id: 6, channel_id: 2, user_id: 6, text: 'Ja som ho videla, odporucam @anka!' },
      { message_id: 7, channel_id: 3, user_id: 3, text: 'Zajtra musime dokoncit databazu.' },
      {
        message_id: 8,
        channel_id: 3,
        user_id: 7,
        text: 'Mam hotovy ER diagram, @peto @anka mrknite na to.',
      },
      { message_id: 9, channel_id: 3, user_id: 1, text: 'Super, ja pripravim SQL skript.' },
      { message_id: 10, channel_id: 4, user_id: 5, text: 'Kto ide vecer hrat?' },
      { message_id: 11, channel_id: 4, user_id: 9, text: 'Ja som in, @martin.' },
      {
        message_id: 12,
        channel_id: 5,
        user_id: 4,
        text: 'Zajtra je skuska, kto sa chce ucit spolu?',
      },
      { message_id: 13, channel_id: 5, user_id: 8, text: 'Ja, @jana, o kolkej?' },
      { message_id: 14, channel_id: 5, user_id: 10, text: 'Ja tiez, prinesiem poznamky.' },
    ])

    // inserts message mentions data
    await db.table('message_mentions').multiInsert([
      { message_id: 2, user_id: 1 },
      { message_id: 4, user_id: 3 },
      { message_id: 6, user_id: 2 },
      { message_id: 8, user_id: 3 },
      { message_id: 8, user_id: 2 },
      { message_id: 11, user_id: 5 },
      { message_id: 13, user_id: 4 },
    ])

    // inserts channel invites data
    await db.table('channel_invites').multiInsert([
      { user_id: 5, channel_id: 3, invited_by: 3 },
      { user_id: 9, channel_id: 5, invited_by: 4 },
      { user_id: 6, channel_id: 5, invited_by: 4 },
      { user_id: 10, channel_id: 2, invited_by: 2 },
    ])

    // inserts channel bans data
    await db.table('channel_bans').multiInsert([
      { user_id: 10, channel_id: 1 },
      { user_id: 9, channel_id: 2 },
    ])

    // inserts channel kick votes data
    await db.table('channel_kick_votes').multiInsert([
      { channel_id: 4, voter_id: 5, target_id: 9 },
      { channel_id: 4, voter_id: 6, target_id: 9 },
      { channel_id: 1, voter_id: 2, target_id: 7 },
      { channel_id: 1, voter_id: 3, target_id: 7 },
    ])

    // updates last activity timestamp for channels based on latest message
    await db.rawQuery(`
      UPDATE channels c
      SET last_activity = COALESCE(
        (SELECT MAX(m.created_at) FROM messages m WHERE m.channel_id = c.channel_id),
        c.last_activity
      );
    `)

    // updates postgres auto increment sequence values
    await db.rawQuery(`
      SELECT setval(pg_get_serial_sequence('users', 'user_id'), (SELECT MAX(user_id) FROM users));
      SELECT setval(pg_get_serial_sequence('channels', 'channel_id'), (SELECT MAX(channel_id) FROM channels));
      SELECT setval(pg_get_serial_sequence('messages', 'message_id'), (SELECT MAX(message_id) FROM messages));
    `)
  }
}
