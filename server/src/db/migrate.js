const {config} =  require('../config/index')
const postgres = require('postgres')
const sql = postgres("postgresql://postgres:12345678@localhost:5433/asrking")

async function migrate()
{
    console.info("Creating tables.........................")
    
   await sql`
    CREATE TABLE IF NOT EXISTS users (
      id            TEXT PRIMARY KEY,
      email         TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      api_key       TEXT UNIQUE,
      created_at    TIMESTAMP DEFAULT NOW() NOT NULL
    )
  `

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

  await sql`
    CREATE TABLE IF NOT EXISTS env_vars (
      id              TEXT PRIMARY KEY,
      app_id          TEXT NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
      key             TEXT NOT NULL,
      encrypted_value TEXT NOT NULL,
      created_at      TIMESTAMP DEFAULT NOW() NOT NULL
    )
  `

  console.log('✓ All tables created')
  await sql.end()

}


migrate().catch(console.error)