-- =====================================================================
--  Flack DB - tabulky pre PostgreSQL
--  v pgAdmine vytvor DB "flack"
--  -> Query Tool, vloz a spusti (F5).
-- =====================================================================

-- ---------------------------------------------------------------------
--  ENUM
-- ---------------------------------------------------------------------
CREATE TYPE user_status  AS ENUM ('online', 'dnd', 'offline');
CREATE TYPE channel_type AS ENUM ('private', 'public');

-- ---------------------------------------------------------------------
--  Users
-- ---------------------------------------------------------------------
CREATE TABLE users (
    user_id        SERIAL        PRIMARY KEY,
    first_name     VARCHAR(50)   NOT NULL,
    last_name      VARCHAR(100)  NOT NULL,
    nick_name      VARCHAR(50)   NOT NULL UNIQUE,
    email          VARCHAR(255)  NOT NULL UNIQUE,
    password       VARCHAR(255)  NOT NULL,          -- ukladaj hash, nie plain text
    status         user_status   NOT NULL DEFAULT 'offline',
    only_mentions  BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
--  Channels
-- ---------------------------------------------------------------------
CREATE TABLE channels (
    channel_id     SERIAL        PRIMARY KEY,
    admin_id       INT           NOT NULL
                       REFERENCES users (user_id) ON DELETE RESTRICT,
    name           VARCHAR(24)   NOT NULL UNIQUE,
    type           channel_type  NOT NULL DEFAULT 'public',
    last_activity  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
--  Messages
-- ---------------------------------------------------------------------
CREATE TABLE messages (
    message_id     SERIAL        PRIMARY KEY,
    channel_id     INT           NOT NULL
                       REFERENCES channels (channel_id) ON DELETE CASCADE,
    user_id        INT           NOT NULL
                       REFERENCES users (user_id) ON DELETE CASCADE,
    text           TEXT          NOT NULL,
    created_at     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
--  Users/Messages (mentions)
-- ---------------------------------------------------------------------
CREATE TABLE message_mentions (
    message_id     INT NOT NULL
                       REFERENCES messages (message_id) ON DELETE CASCADE,
    user_id        INT NOT NULL
                       REFERENCES users (user_id) ON DELETE CASCADE,
    PRIMARY KEY (message_id, user_id)
);

-- ---------------------------------------------------------------------
--  Users/Channels (user list)
-- ---------------------------------------------------------------------
CREATE TABLE channel_users (
    user_id        INT       NOT NULL
                       REFERENCES users (user_id) ON DELETE CASCADE,
    channel_id     INT       NOT NULL
                       REFERENCES channels (channel_id) ON DELETE CASCADE,
    joined_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, channel_id)
);

-- ---------------------------------------------------------------------
--  Users/Channels (channel invites)
-- ---------------------------------------------------------------------
CREATE TABLE channel_invites (
    user_id        INT       NOT NULL
                       REFERENCES users (user_id) ON DELETE CASCADE,
    channel_id     INT       NOT NULL
                       REFERENCES channels (channel_id) ON DELETE CASCADE,
    invited_by     INT       NOT NULL
                       REFERENCES users (user_id) ON DELETE CASCADE,
    created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, channel_id),
    CONSTRAINT chk_invite_not_self CHECK (user_id <> invited_by)
);

-- ---------------------------------------------------------------------
--  Users/Channels (channel bans)
-- ---------------------------------------------------------------------
CREATE TABLE channel_bans (
    user_id        INT       NOT NULL
                       REFERENCES users (user_id) ON DELETE CASCADE,
    channel_id     INT       NOT NULL
                       REFERENCES channels (channel_id) ON DELETE CASCADE,
    banned_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, channel_id)
);

-- ---------------------------------------------------------------------
--  Users/Channels (kick votes)
-- ---------------------------------------------------------------------
CREATE TABLE channel_kick_votes (
    channel_id     INT       NOT NULL
                       REFERENCES channels (channel_id) ON DELETE CASCADE,
    voter_id       INT       NOT NULL
                       REFERENCES users (user_id) ON DELETE CASCADE,
    target_id      INT       NOT NULL
                       REFERENCES users (user_id) ON DELETE CASCADE,
    created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (channel_id, voter_id, target_id),
    CONSTRAINT chk_kick_not_self CHECK (voter_id <> target_id)
);

-- ---------------------------------------------------------------------
--  Indexy pre rychlejsie dotazy
-- ---------------------------------------------------------------------
CREATE INDEX idx_channels_admin          ON channels (admin_id);
CREATE INDEX idx_messages_channel_time   ON messages (channel_id, created_at DESC);
CREATE INDEX idx_messages_user           ON messages (user_id);
CREATE INDEX idx_mentions_user           ON message_mentions (user_id);
CREATE INDEX idx_channel_users_channel   ON channel_users (channel_id);
CREATE INDEX idx_channel_invites_channel ON channel_invites (channel_id);
CREATE INDEX idx_channel_bans_channel    ON channel_bans (channel_id);
CREATE INDEX idx_kick_votes_target       ON channel_kick_votes (channel_id, target_id);
