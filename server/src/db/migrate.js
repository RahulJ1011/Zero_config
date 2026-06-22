// src/db/migrate.js
const postgres = require('postgres')
const dotenv = require('dotenv')

dotenv.config()

const sql = postgres(process.env.DATABASE_URL)

async function migrate() {
  console.log('Creating tables...')

  try {

    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id            TEXT PRIMARY KEY,
        email         TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        api_key       TEXT UNIQUE,
        created_at    TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `
    console.log('✓ users table created')

    await sql`
      CREATE TABLE IF NOT EXISTS apps (
        id          TEXT PRIMARY KEY,
        user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name        TEXT NOT NULL UNIQUE,
        language    TEXT,
        framework   TEXT,
        runtime     TEXT,
        port        INTEGER,
        status      TEXT DEFAULT 'deploying',
        url         TEXT,
        region      TEXT DEFAULT 'eu',
        created_at  TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at  TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `
    console.log('✓ apps table created')

    await sql`
      CREATE TABLE IF NOT EXISTS deployments (
        id            TEXT PRIMARY KEY,
        app_id        TEXT NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
        status        TEXT DEFAULT 'queued',
        error_message TEXT,
        logs          TEXT,
        commit_hash   TEXT,
        created_at    TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at    TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `
    console.log('✓ deployments table created')

    await sql`
      CREATE TABLE IF NOT EXISTS env_vars (
        id              TEXT PRIMARY KEY,
        app_id          TEXT NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
        key             TEXT NOT NULL,
        encrypted_value TEXT NOT NULL,
        created_at      TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `
    console.log('✓ env_vars table created')

    console.log('')
    console.log('✓ All tables created successfully')

  } catch (error) {
    console.error('Migration failed:', error.message)
  } finally {
    await sql.end()
  }
}

migrate()