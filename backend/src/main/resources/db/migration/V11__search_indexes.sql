CREATE EXTENSION IF NOT EXISTS pg_trgm;

ALTER TABLE posts ADD COLUMN IF NOT EXISTS search_vector TSVECTOR
    GENERATED ALWAYS AS (
        to_tsvector('simple',
            coalesce(title, '') || ' ' || coalesce(author, '') || ' ' || coalesce(description, ''))
    ) STORED;

CREATE INDEX IF NOT EXISTS idx_posts_search ON posts USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS idx_users_nickname_trgm ON users USING GIN (nickname gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_tags_name_trgm ON tags USING GIN (name gin_trgm_ops);
