CREATE TABLE verification_tokens (
    token_id   BIGSERIAL PRIMARY KEY,
    user_id    BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    token      VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX ON verification_tokens(token);
