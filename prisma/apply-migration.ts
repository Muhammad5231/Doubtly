import { db } from '../lib/db';

async function run() {
  console.log('1. Enabling PostgreSQL extensions...');
  try {
    await db.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS pg_trgm;`);
    console.log('✔ pg_trgm enabled');
  } catch (e: any) {
    console.warn('Note on pg_trgm:', e.message);
  }

  try {
    await db.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS unaccent;`);
    console.log('✔ unaccent enabled');
  } catch (e: any) {
    console.warn('Note on unaccent:', e.message);
  }

  console.log('2. Setting up tsvector generated columns...');
  // In PostgreSQL, array_to_string is STABLE. A simple IMMUTABLE wrapper is required for generated columns:
  try {
    await db.$executeRawUnsafe(`
      CREATE OR REPLACE FUNCTION immutable_array_to_string(text[], text)
      RETURNS text AS $$
        SELECT array_to_string($1, $2);
      $$ LANGUAGE sql IMMUTABLE PARALLEL SAFE;
    `);
    console.log('✔ Helper function immutable_array_to_string created');
  } catch (e: any) {
    console.warn('Note on immutable function:', e.message);
  }

  // Question searchVector
  try {
    await db.$executeRawUnsafe(`ALTER TABLE "questions" DROP COLUMN IF EXISTS "searchVector";`);
    await db.$executeRawUnsafe(`
      ALTER TABLE "questions" ADD COLUMN "searchVector" tsvector
      GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce("title", '')), 'A') ||
        setweight(to_tsvector('english', coalesce(immutable_array_to_string("tags", ' '), '')), 'B') ||
        setweight(to_tsvector('english', coalesce("body", '')), 'C') ||
        setweight(to_tsvector('english', coalesce("answer", '')), 'D')
      ) STORED;
    `);
    console.log('✔ Question tsvector column generated');
  } catch (e: any) {
    console.warn('Note on Question tsvector:', e.message);
  }

  // Note searchVector
  try {
    await db.$executeRawUnsafe(`ALTER TABLE "notes" DROP COLUMN IF EXISTS "searchVector";`);
    await db.$executeRawUnsafe(`
      ALTER TABLE "notes" ADD COLUMN "searchVector" tsvector
      GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce("title", '')), 'A') ||
        setweight(to_tsvector('english', coalesce(immutable_array_to_string("tags", ' '), '')), 'B') ||
        setweight(to_tsvector('english', coalesce("description", '')), 'C')
      ) STORED;
    `);
    console.log('✔ Note tsvector column generated');
  } catch (e: any) {
    console.warn('Note on Note tsvector:', e.message);
  }

  console.log('3. Creating GIN and Trigram Indexes...');
  try {
    await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "questions_search_vector_idx" ON "questions" USING GIN ("searchVector");`);
    await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "notes_search_vector_idx" ON "notes" USING GIN ("searchVector");`);
    console.log('✔ GIN tsvector indexes created');
  } catch (e: any) {
    console.warn('Note on GIN indexes:', e.message);
  }

  try {
    await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "questions_title_trgm_idx" ON "questions" USING GIN ("title" gin_trgm_ops);`);
    await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "notes_title_trgm_idx" ON "notes" USING GIN ("title" gin_trgm_ops);`);
    console.log('✔ GIN Trigram indexes created');
  } catch (e: any) {
    console.warn('Note on Trigram indexes:', e.message);
  }

  console.log('4. Creating compound performance indexes...');
  try {
    await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "questions_subject_created_idx" ON "questions" ("subjectId", "createdAt" DESC);`);
    await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "questions_status_views_idx" ON "questions" ("status", "views" DESC);`);
    await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "questions_status_created_idx" ON "questions" ("status", "createdAt" DESC);`);
    await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "notes_subject_created_idx" ON "notes" ("subjectId", "createdAt" DESC);`);
    await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "notes_status_created_idx" ON "notes" ("status", "createdAt" DESC);`);
    console.log('✔ Compound performance indexes created');
  } catch (e: any) {
    console.warn('Note on Compound indexes:', e.message);
  }

  console.log('All migrations completed!');
  process.exit(0);
}

run().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
