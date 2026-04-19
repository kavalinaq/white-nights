CREATE TYPE follow_status AS ENUM ('accepted', 'pending');

CREATE TABLE follows (
  follower_id BIGINT REFERENCES users(user_id),
  followee_id BIGINT REFERENCES users(user_id),
  status      follow_status NOT NULL DEFAULT 'accepted',
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (follower_id, followee_id),
  CHECK (follower_id <> followee_id)
);
CREATE INDEX ON follows(followee_id, status);
