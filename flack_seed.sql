-- =====================================================================
--  Flack DB - testovacie data
-- =====================================================================

-- ---------------------------------------------------------------------
--  Users (10)
-- ---------------------------------------------------------------------
INSERT INTO users (user_id, first_name, last_name, nick_name, email, password, status, only_mentions) VALUES
(1,  'Jozef',   'Mrkvicka',   'jozko',  'jozko@flack.sk',  '$2b$10$fakehash01', 'online',  FALSE),
(2,  'Anna',    'Novakova',   'anka',   'anka@flack.sk',   '$2b$10$fakehash02', 'online',  FALSE),
(3,  'Peter',   'Kovac',      'peto',   'peto@flack.sk',   '$2b$10$fakehash03', 'dnd',     TRUE),
(4,  'Jana',    'Horvathova', 'jana',   'jana@flack.sk',   '$2b$10$fakehash04', 'online',  FALSE),
(5,  'Martin',  'Szabo',      'martin', 'martin@flack.sk', '$2b$10$fakehash05', 'offline', FALSE),
(6,  'Lucia',   'Balaz',      'lucia',  'lucia@flack.sk',  '$2b$10$fakehash06', 'online',  TRUE),
(7,  'Tomas',   'Kral',       'tomas',  'tomas@flack.sk',  '$2b$10$fakehash07', 'dnd',     FALSE),
(8,  'Eva',     'Vargova',    'eva',    'eva@flack.sk',    '$2b$10$fakehash08', 'offline', FALSE),
(9,  'Michal',  'Toth',       'michal', 'michal@flack.sk', '$2b$10$fakehash09', 'online',  FALSE),
(10, 'Zuzana',  'Polakova',   'zuzka',  'zuzka@flack.sk',  '$2b$10$fakehash10', 'offline', TRUE);

-- ---------------------------------------------------------------------
--  Channels (5)
-- ---------------------------------------------------------------------
INSERT INTO channels (channel_id, admin_id, name, type) VALUES
(1, 1, 'general',       'public'),
(2, 2, 'random',        'public'),
(3, 3, 'projekt-flack', 'private'),
(4, 5, 'gaming',        'public'),
(5, 4, 'ucenie',        'private');

-- ---------------------------------------------------------------------
--  Channel users (clenovia kanalov, vratane adminov)
-- ---------------------------------------------------------------------
INSERT INTO channel_users (user_id, channel_id) VALUES
-- general: userov 1-9 (user 10 je zabanovany)
(1,1),(2,1),(3,1),(4,1),(5,1),(6,1),(7,1),(8,1),(9,1),
-- random
(2,2),(1,2),(4,2),(6,2),(8,2),
-- projekt-flack
(3,3),(1,3),(2,3),(7,3),
-- gaming
(5,4),(6,4),(7,4),(9,4),
-- ucenie
(4,5),(1,5),(8,5),(10,5);

-- ---------------------------------------------------------------------
--  Messages (14)
-- ---------------------------------------------------------------------
INSERT INTO messages (message_id, channel_id, user_id, text) VALUES
(1,  1, 1,  'Ahojte vsetci, vitajte vo Flacku!'),
(2,  1, 2,  'Ahoj @jozko, super ze tu si.'),
(3,  1, 3,  'Kto sa pripaja na dnesny call?'),
(4,  1, 4,  'Ja, @peto, budem tam o 15:00.'),
(5,  2, 2,  'Videl niekto ten novy film?'),
(6,  2, 6,  'Ja som ho videla, odporucam @anka!'),
(7,  3, 3,  'Zajtra musime dokoncit databazu.'),
(8,  3, 7,  'Mam hotovy ER diagram, @peto @anka mrknite na to.'),
(9,  3, 1,  'Super, ja pripravim SQL skript.'),
(10, 4, 5,  'Kto ide vecer hrat?'),
(11, 4, 9,  'Ja som in, @martin.'),
(12, 5, 4,  'Zajtra je skuska, kto sa chce ucit spolu?'),
(13, 5, 8,  'Ja, @jana, o kolkej?'),
(14, 5, 10, 'Ja tiez, prinesiem poznamky.');

-- ---------------------------------------------------------------------
--  Mentions
-- ---------------------------------------------------------------------
INSERT INTO message_mentions (message_id, user_id) VALUES
(2, 1),   -- @jozko
(4, 3),   -- @peto
(6, 2),   -- @anka
(8, 3),   -- @peto
(8, 2),   -- @anka
(11, 5),  -- @martin
(13, 4);  -- @jana

-- ---------------------------------------------------------------------
--  Invites (cakajuce pozvanky: user, channel, invited_by)
-- ---------------------------------------------------------------------
INSERT INTO channel_invites (user_id, channel_id, invited_by) VALUES
(5,  3, 3),   -- peto pozval martina do projekt-flack
(9,  5, 4),   -- jana pozvala michala do ucenie
(6,  5, 4),   -- jana pozvala lucku do ucenie
(10, 2, 2);   -- anka pozvala zuzku do random

-- ---------------------------------------------------------------------
--  Bans
-- ---------------------------------------------------------------------
INSERT INTO channel_bans (user_id, channel_id) VALUES
(10, 1),      -- zuzka je zabanovana v general
(9,  2);      -- michal je zabanovany v random

-- ---------------------------------------------------------------------
--  Kick votes (channel, voter, target)
-- ---------------------------------------------------------------------
INSERT INTO channel_kick_votes (channel_id, voter_id, target_id) VALUES
(4, 5, 9),    -- martin hlasuje za vykopnutie michala v gaming
(4, 6, 9),    -- lucia hlasuje za vykopnutie michala v gaming
(1, 2, 7),    -- anka hlasuje za vykopnutie tomasa v general
(1, 3, 7);    -- peto hlasuje za vykopnutie tomasa v general

-- ---------------------------------------------------------------------
--  last_activity kanalov = cas poslednej spravy
-- ---------------------------------------------------------------------
UPDATE channels c
SET last_activity = COALESCE(
    (SELECT MAX(m.created_at) FROM messages m WHERE m.channel_id = c.channel_id),
    c.last_activity);

-- ---------------------------------------------------------------------
--  Posun sekvencii (aby dalsie INSERTy bez ID nekolidovali)
-- ---------------------------------------------------------------------
SELECT setval(pg_get_serial_sequence('users',    'user_id'),    (SELECT MAX(user_id)    FROM users));
SELECT setval(pg_get_serial_sequence('channels', 'channel_id'), (SELECT MAX(channel_id) FROM channels));
SELECT setval(pg_get_serial_sequence('messages', 'message_id'), (SELECT MAX(message_id) FROM messages));
