CREATE INDEX ON posts(user_id, created_at DESC);
CREATE INDEX ON comments(post_id, created_at);
CREATE INDEX ON likes(post_id);
CREATE INDEX ON save(user_id, created_at DESC);
CREATE INDEX ON messages(chat_id, sent_at);
CREATE INDEX ON chat_members(user_id);
CREATE INDEX ON reports(status, created_at);
