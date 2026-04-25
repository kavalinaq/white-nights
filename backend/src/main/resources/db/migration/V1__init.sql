-- Enums
CREATE TYPE user_role AS ENUM ('user', 'moderator', 'admin');
CREATE TYPE report_target_type AS ENUM ('post', 'comment', 'user');
CREATE TYPE report_status AS ENUM ('pending', 'in_review', 'resolved');
CREATE TYPE moderation_action_type AS ENUM ('block_post', 'warn_user', 'ban_user', 'reject');
CREATE TYPE chat_member_role AS ENUM ('member', 'owner');

-- Tables
CREATE TABLE "users" (
    user_id       BIGSERIAL PRIMARY KEY,
    nickname      VARCHAR(50) UNIQUE NOT NULL,
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role          user_role NOT NULL DEFAULT 'user',
    is_blocked    BOOLEAN NOT NULL DEFAULT FALSE,
    is_verified   BOOLEAN NOT NULL DEFAULT FALSE,
    bio           TEXT,
    avatar_url    VARCHAR(255),
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE posts (
    post_id     BIGSERIAL PRIMARY KEY,
    user_id     BIGINT REFERENCES "users"(user_id) ON DELETE CASCADE,
    image_url   VARCHAR(255),
    title       VARCHAR(255) NOT NULL,
    author      VARCHAR(255) NOT NULL,
    description TEXT,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE comments (
    comment_id  BIGSERIAL PRIMARY KEY,
    post_id     BIGINT REFERENCES posts(post_id) ON DELETE CASCADE,
    user_id     BIGINT REFERENCES users(user_id) ON DELETE CASCADE,
    text        TEXT NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tags (
    tag_id BIGSERIAL PRIMARY KEY,
    name   VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE post_and_tag (
    post_id BIGINT REFERENCES posts(post_id) ON DELETE CASCADE,
    tag_id  BIGINT REFERENCES tags(tag_id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, tag_id)
);

CREATE TABLE likes (
    user_id    BIGINT REFERENCES users(user_id) ON DELETE CASCADE,
    post_id    BIGINT REFERENCES posts(post_id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, post_id)
);

CREATE TABLE views (
    user_id    BIGINT REFERENCES users(user_id) ON DELETE CASCADE,
    post_id    BIGINT REFERENCES posts(post_id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, post_id)
);

CREATE TABLE save (
    user_id    BIGINT REFERENCES users(user_id) ON DELETE CASCADE,
    post_id    BIGINT REFERENCES posts(post_id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, post_id)
);

CREATE TABLE shelves (
    shelf_id BIGSERIAL PRIMARY KEY,
    user_id  BIGINT REFERENCES users(user_id) ON DELETE CASCADE,
    name     VARCHAR(50) NOT NULL, -- e.g. Read, Reading, Want to Read
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE books (
    book_id    BIGSERIAL PRIMARY KEY,
    user_id    BIGINT REFERENCES users(user_id) ON DELETE CASCADE,
    title      VARCHAR(255) NOT NULL,
    author     VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE books_on_shelves (
    shelf_id BIGINT REFERENCES shelves(shelf_id) ON DELETE CASCADE,
    book_id  BIGINT REFERENCES books(book_id) ON DELETE CASCADE,
    position INT NOT NULL,
    PRIMARY KEY (shelf_id, book_id)
);

CREATE TABLE reports (
    report_id    BIGSERIAL PRIMARY KEY,
    reporter_id  BIGINT REFERENCES users(user_id),
    target_type  report_target_type NOT NULL,
    target_id    BIGINT NOT NULL,
    reason       TEXT NOT NULL,
    status       report_status NOT NULL DEFAULT 'pending',
    created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE moderation_actions (
    action_id    BIGSERIAL PRIMARY KEY,
    report_id    BIGINT REFERENCES reports(report_id),
    moderator_id BIGINT REFERENCES users(user_id),
    action_type  moderation_action_type NOT NULL,
    created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE chats (
    chat_id    BIGSERIAL PRIMARY KEY,
    created_by BIGINT REFERENCES users(user_id),
    name       VARCHAR(100), -- Nullable for 1:1 chats
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE chat_members (
    chat_id   BIGINT REFERENCES chats(chat_id) ON DELETE CASCADE,
    user_id   BIGINT REFERENCES users(user_id) ON DELETE CASCADE,
    role      chat_member_role NOT NULL DEFAULT 'member',
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (chat_id, user_id)
);

CREATE TABLE messages (
    message_id BIGSERIAL PRIMARY KEY,
    chat_id    BIGINT REFERENCES chats(chat_id) ON DELETE CASCADE,
    sender_id  BIGINT REFERENCES users(user_id),
    text       TEXT NOT NULL,
    sent_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
