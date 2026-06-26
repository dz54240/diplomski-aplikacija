-- Extensions only. Application schema (users, subjects, ...) is managed
-- via Rails migrations, against this same database.
--
-- The pgvector image runs every *.sql in /docker-entrypoint-initdb.d once on the
-- very first boot of an empty data volume. To re-run, drop the volume:
--   make clean

CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
