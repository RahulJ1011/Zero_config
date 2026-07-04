


const LOCKFILE_SIGNALS = [

   { file: 'package-lock.json', language: 'nodejs', weight: 0.9 },
  { file: 'yarn.lock',         language: 'nodejs', weight: 0.9 },
  { file: 'pnpm-lock.yaml',    language: 'nodejs', weight: 0.9 },
  { file: 'bun.lockb',         language: 'nodejs', weight: 0.9 },
  { file: 'poetry.lock',       language: 'python', weight: 0.9 },
  { file: 'Pipfile.lock',      language: 'python', weight: 0.9 },
  { file: 'go.sum',            language: 'go',     weight: 0.9 },
  { file: 'Cargo.lock',        language: 'rust',   weight: 0.9 },
  { file: 'Gemfile.lock',      language: 'ruby',   weight: 0.9 },
  { file: 'composer.lock',     language: 'php',    weight: 0.9 },
  { file: 'mix.lock',          language: 'elixir', weight: 0.9 },
]

const MANIFEST_SIGNALS = [
     { file: 'package.json',     language: 'nodejs',  weight: 0.75 },
  { file: 'go.mod',           language: 'go',      weight: 0.8  },
  { file: 'Cargo.toml',       language: 'rust',    weight: 0.8  },
  { file: 'requirements.txt', language: 'python',  weight: 0.75 },
  { file: 'pyproject.toml',   language: 'python',  weight: 0.75 },
  { file: 'Pipfile',          language: 'python',  weight: 0.75 },
  { file: 'Gemfile',          language: 'ruby',    weight: 0.75 },
  { file: 'composer.json',    language: 'php',     weight: 0.8  },
  { file: 'pom.xml',          language: 'java',    weight: 0.8  },
  { file: 'build.gradle',     language: 'java',    weight: 0.8  },
  { file: 'mix.exs',          language: 'elixir',  weight: 0.85 },
  { file: 'deno.json',        language: 'deno',    weight: 0.85 },
]

const FRAMEWORK_SIGNALS = [
// In FRAMEWORK_SIGNALS array, add these alongside existing ones:
{ file: 'client/vite.config.js',   language: 'nodejs', framework: 'vite',   weight: 0.85 },
{ file: 'client/next.config.js',   language: 'nodejs', framework: 'nextjs', weight: 0.97 },
{ file: 'client/next.config.ts',   language: 'nodejs', framework: 'nextjs', weight: 0.97 },
{ file: 'client/nuxt.config.ts',   language: 'nodejs', framework: 'nuxt',   weight: 0.97 },
{ file: 'client/svelte.config.js', language: 'nodejs', framework: 'svelte', weight: 0.97 },
  // Astro
  { file: 'astro.config.mjs',  language: 'nodejs', framework: 'astro',    weight: 0.97 },
  { file: 'astro.config.ts',   language: 'nodejs', framework: 'astro',    weight: 0.97 },
  // Remix
  { file: 'remix.config.js',   language: 'nodejs', framework: 'remix',    weight: 0.97 },
  // Vite
  { file: 'vite.config.js',    language: 'nodejs', framework: 'vite',     weight: 0.85 },
  { file: 'vite.config.ts',    language: 'nodejs', framework: 'vite',     weight: 0.85 },
  // Angular
  { file: 'angular.json',      language: 'nodejs', framework: 'angular',  weight: 0.97 },
  // Gatsby
  { file: 'gatsby-config.js',  language: 'nodejs', framework: 'gatsby',   weight: 0.97 },
  { file: 'gatsby-config.ts',  language: 'nodejs', framework: 'gatsby',   weight: 0.97 },
  // Django
  { file: 'manage.py',         language: 'python', framework: 'django',   weight: 0.97 },
  { file: 'wsgi.py',           language: 'python', framework: 'django',   weight: 0.85 },
  // Laravel
  { file: 'artisan',           language: 'php',    framework: 'laravel',  weight: 0.97 },
  // Rails
  { file: 'config/application.rb', language: 'ruby', framework: 'rails', weight: 0.97 },
  // Phoenix (Elixir)
  { file: 'mix.exs',           language: 'elixir', framework: 'phoenix',  weight: 0.85 },
  // Spring Boot (Java)
  { file: 'src/main/resources/application.properties',
                               language: 'java',   framework: 'spring',   weight: 0.9  },
  { file: 'src/main/resources/application.yml',
                               language: 'java',   framework: 'spring',   weight: 0.9  },
]


const DATABASE_SIGNALS = {
    nodejs: [
    { dep: 'pg',                    db: 'postgres' },
    { dep: 'postgres',              db: 'postgres' },
    { dep: '@neondatabase/serverless', db: 'postgres' },
    { dep: 'prisma',                db: 'postgres' },
    { dep: '@prisma/client',        db: 'postgres' },
    { dep: 'mongoose',              db: 'mongodb'  },
    { dep: 'mongodb',               db: 'mongodb'  },
    { dep: 'mysql2',                db: 'mysql'    },
    { dep: 'mysql',                 db: 'mysql'    },
    { dep: 'better-sqlite3',        db: 'sqlite'   },
    { dep: 'ioredis',               db: 'redis'    },
    { dep: 'redis',                 db: 'redis'    },
  ],

   python: [
    { dep: 'psycopg2',              db: 'postgres' },
    { dep: 'psycopg2-binary',       db: 'postgres' },
    { dep: 'asyncpg',               db: 'postgres' },
    { dep: 'pymongo',               db: 'mongodb'  },
    { dep: 'pymysql',               db: 'mysql'    },
    { dep: 'redis',                 db: 'redis'    },
  ]
}

const GO_FRAMEWORK_DEPS = [
  { dep: 'github.com/gin-gonic/gin',  framework: 'gin',   startCmd: './app', port: 8080 },
  { dep: 'github.com/labstack/echo',  framework: 'echo',  startCmd: './app', port: 8080 },
  { dep: 'github.com/gofiber/fiber',  framework: 'fiber', startCmd: './app', port: 3000 },
  { dep: 'github.com/go-chi/chi',     framework: 'chi',   startCmd: './app', port: 8080 },
]

const PYTHON_FRAMEWORK_DEPS = [
  { dep: 'fastapi',   framework: 'fastapi',   startCmd: 'uvicorn main:app --host 0.0.0.0 --port 8000',  port: 8000 },
  { dep: 'django',    framework: 'django',    startCmd: 'gunicorn myproject.wsgi:application',           port: 8000 },
  { dep: 'flask',     framework: 'flask',     startCmd: 'gunicorn app:app',                              port: 8000 },
  { dep: 'starlette', framework: 'starlette', startCmd: 'uvicorn app:app --host 0.0.0.0',                port: 8000 },
  { dep: 'tornado',   framework: 'tornado',   startCmd: 'python main.py',                                port: 8888 },
  { dep: 'streamlit', framework: 'streamlit', startCmd: 'streamlit run app.py --server.port 8501',       port: 8501 },
]

const NODE_FRAMEWORK_DEPS = [
  { dep: 'next',         framework: 'nextjs',   buildCmd: 'npm run build', startCmd: 'npm start',          port: 3000 },
  { dep: 'nuxt',         framework: 'nuxt',     buildCmd: 'npm run build', startCmd: 'node .output/server/index.mjs', port: 3000 },
  { dep: 'express',      framework: 'express',  buildCmd: null,            startCmd: 'node index.js',      port: 3000 },
  { dep: 'fastify',      framework: 'fastify',  buildCmd: null,            startCmd: 'node server.js',     port: 3000 },
  { dep: '@nestjs/core', framework: 'nestjs',   buildCmd: 'npm run build', startCmd: 'node dist/main',     port: 3000 },
  { dep: 'remix',        framework: 'remix',    buildCmd: 'npm run build', startCmd: 'npm start',          port: 3000 },
  { dep: 'astro',        framework: 'astro',    buildCmd: 'npm run build', startCmd: 'npm start',          port: 4321 },
  { dep: 'hono',         framework: 'hono',     buildCmd: null,            startCmd: 'node src/index.js',  port: 3000 },
  { dep: 'gatsby',       framework: 'gatsby',   buildCmd: 'npm run build', startCmd: 'npm start',          port: 9000 },
  { dep: 'vite',         framework: 'vite',     buildCmd: 'npm run build', startCmd: null,                 port: 4173, static: true },
  { dep: 'react-scripts',framework: 'cra',      buildCmd: 'npm run build', startCmd: null,                 port: null, static: true },
  { dep: '@sveltejs/kit',framework: 'sveltekit',buildCmd: 'npm run build', startCmd: 'node build/index.js',port: 3000 },
  { dep: 'koa',          framework: 'koa',      buildCmd: null,            startCmd: 'node app.js',        port: 3000 },
]


const LANGUAGE_DEFAULTS = {
  nodejs:  { runtime: 'node20',     startCmd: 'node index.js',   port: 3000, buildCmd: null           },
  python:  { runtime: 'python3.11', startCmd: 'python main.py',  port: 8000, buildCmd: null           },
  go:      { runtime: 'go1.22',     startCmd: './app',           port: 8080, buildCmd: 'go build -o app .' },
  rust:    { runtime: 'rust',       startCmd: './target/release/app', port: 8080, buildCmd: 'cargo build --release' },
  ruby:    { runtime: 'ruby3.2',    startCmd: 'ruby app.rb',     port: 3000, buildCmd: 'bundle install' },
  php:     { runtime: 'php8.2',     startCmd: 'php -S 0.0.0.0:8000', port: 8000, buildCmd: null      },
  java:    { runtime: 'java21',     startCmd: 'java -jar app.jar', port: 8080, buildCmd: 'mvn package' },
  elixir:  { runtime: 'elixir1.16', startCmd: 'mix run --no-halt', port: 4000, buildCmd: 'mix deps.get' },
  deno:    { runtime: 'deno2',      startCmd: 'deno run --allow-all main.ts', port: 8000, buildCmd: null },
}


const EXTENSION_MAP = {
  js:   'nodejs',
  mjs:  'nodejs',
  cjs:  'nodejs',
  ts:   'nodejs',
  tsx:  'nodejs',
  jsx:  'nodejs',
  py:   'python',
  go:   'go',
  rs:   'rust',
  rb:   'ruby',
  php:  'php',
  java: 'java',
  kt:   'kotlin',
  ex:   'elixir',
  exs:  'elixir',
  cs:   'dotnet',
}


module.exports = {EXTENSION_MAP,DATABASE_SIGNALS,FRAMEWORK_SIGNALS,NODE_FRAMEWORK_DEPS,PYTHON_FRAMEWORK_DEPS,LANGUAGE_DEFAULTS,MANIFEST_SIGNALS,LOCKFILE_SIGNALS,GO_FRAMEWORK_DEPS}