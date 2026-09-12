-- Enable PostgreSQL Extensions for Trigram search and accent-insensitive matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- In PostgreSQL, array_to_string is STABLE. A simple IMMUTABLE wrapper is required for generated columns:
CREATE OR REPLACE FUNCTION immutable_array_to_string(text[], text)
RETURNS text AS $$
  SELECT array_to_string($1, $2);
$$ LANGUAGE sql IMMUTABLE PARALLEL SAFE;

-- Ensure generated tsvector column on Question with weights:
-- Title: 'A', Tags: 'B', Body: 'C', Answer: 'D'
ALTER TABLE "questions" DROP COLUMN IF EXISTS "searchVector";

ALTER TABLE "questions" ADD COLUMN "searchVector" tsvector
GENERATED ALWAYS AS (
  setweight(to_tsvector('english', coalesce("title", '')), 'A') ||
  setweight(to_tsvector('english', coalesce(immutable_array_to_string("tags", ' '), '')), 'B') ||
  setweight(to_tsvector('english', coalesce("body", '')), 'C') ||
  setweight(to_tsvector('english', coalesce("answer", '')), 'D')
) STORED;

-- Ensure generated tsvector column on Note with weights:
-- Title: 'A', Tags: 'B', Description: 'C'
ALTER TABLE "notes" DROP COLUMN IF EXISTS "searchVector";

ALTER TABLE "notes" ADD COLUMN "searchVector" tsvector
GENERATED ALWAYS AS (
  setweight(to_tsvector('english', coalesce("title", '')), 'A') ||
  setweight(to_tsvector('english', coalesce(immutable_array_to_string("tags", ' '), '')), 'B') ||
  setweight(to_tsvector('english', coalesce("description", '')), 'C')
) STORED;

-- GIN Indexes for tsvector Full-Text Search
CREATE INDEX IF NOT EXISTS "questions_search_vector_idx" ON "questions" USING GIN ("searchVector");
CREATE INDEX IF NOT EXISTS "notes_search_vector_idx" ON "notes" USING GIN ("searchVector");

-- GIN Trigram Indexes for Typo-Tolerant Similarity and Fuzzy Search
CREATE INDEX IF NOT EXISTS "questions_title_trgm_idx" ON "questions" USING GIN ("title" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "notes_title_trgm_idx" ON "notes" USING GIN ("title" gin_trgm_ops);
