CREATE TABLE user_blocks (
    blocker_id BIGINT NOT NULL REFERENCES "users"(user_id) ON DELETE CASCADE,
    blocked_id BIGINT NOT NULL REFERENCES "users"(user_id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    PRIMARY KEY (blocker_id, blocked_id)
);
