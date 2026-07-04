const { DATABASE_CONFIGS, getDbEnvVarName } = require("../config/dbTemplates");

 function generateCompose(appName, manifest, port) {

  const { framework } = manifest

  // Node.js frameworks
  if (['nextjs', 'nuxt', 'remix', 'sveltekit', 'astro',
       'express', 'fastify', 'nestjs', 'koa', 'hono',
       'node', 'gatsby', 'vite', 'cra'].includes(framework)) {
    return nodeServerTemplate(appName, manifest, port)
  }

  // Python frameworks
  if (['django', 'fastapi', 'flask', 'starlette',
       'python', 'streamlit'].includes(framework)) {
    return pythonTemplate(appName, manifest, port)
  }

  // Go frameworks
  if (['go', 'gin', 'echo', 'fiber', 'chi'].includes(framework)) {
    return goTemplate(appName, manifest, port)
  }

  // Dockerfile
  if (framework === 'dockerfile') {
    return dockerfileTemplate(appName, port, manifest)
  }

  // default fallback
  return nodeServerTemplate(appName, manifest, port)
}

// ── Node.js template ───────────────────────────────────────────────
function nodeServerTemplate(appName, manifest, hostPort) {

  const { buildCmd, startCmd, services } = manifest

  const dbType     = services?.database?.type
  const needsDb    = !!dbType && dbType !== 'sqlite' && !!DATABASE_CONFIGS[dbType]
  const needsRedis = services?.cache?.type === 'redis'
  const cmd        = startCmd || 'npm start'

  let compose = `version: '3.8'

services:
  web:
    image: node:20-alpine
    working_dir: /app
    volumes:
      - .:/app
      - /app/node_modules
    command: sh -c "npm install${buildCmd ? ` && ${buildCmd}` : ''} && ${cmd}"
    ports:
      - "${hostPort}:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000`

  // add database connection url
  if (dbType && DATABASE_CONFIGS[dbType]) {
    const dbConfig   = DATABASE_CONFIGS[dbType]      // ← dbConfig not db
    const envVarName = getDbEnvVarName(dbType)
    compose += `
      - ${envVarName}=${dbConfig.connectionUrl(appName)}`
  }

  if (needsRedis) {
    compose += `
      - REDIS_URL=redis://cache:6379`
  }

  compose += `
    restart: unless-stopped`

  if (needsDb || needsRedis) {
    compose += `
    depends_on:`
    if (needsDb)    compose += `\n      - db`
    if (needsRedis) compose += `\n      - cache`
  }

  if (needsDb) {
    const dbConfig = DATABASE_CONFIGS[dbType]        // ← dbConfig not db

    compose += `

  db:
    image: ${dbConfig.image}
    environment:`

    dbConfig.envVars(appName).forEach(envVar => {
      compose += `\n      - ${envVar}`
    })

    compose += `
    volumes:
      - ${appName}_dbdata:${dbConfig.volumePath}
    restart: unless-stopped`
  }

  if (needsRedis) {
    compose += `

  cache:
    image: redis:7-alpine
    restart: unless-stopped`
  }

  if (needsDb) {
    compose += `

volumes:
  ${appName}_dbdata:`
  }

  return compose
}

// ── Python template ────────────────────────────────────────────────
function pythonTemplate(appName, manifest, hostPort) {

  const { startCmd, services } = manifest

  const dbType     = services?.database?.type
  const needsDb    = !!dbType && dbType !== 'sqlite' && !!DATABASE_CONFIGS[dbType]
  const needsRedis = services?.cache?.type === 'redis'
  const cmd        = startCmd || 'python main.py'

  let compose = `version: '3.8'

services:
  web:
    image: python:3.11-slim
    working_dir: /app
    volumes:
      - .:/app
    command: sh -c "pip install -r requirements.txt && ${cmd}"
    ports:
      - "${hostPort}:8000"
    environment:
      - PORT=8000`

  if (dbType && DATABASE_CONFIGS[dbType]) {
    const dbConfig   = DATABASE_CONFIGS[dbType]
    const envVarName = getDbEnvVarName(dbType)
    compose += `
      - ${envVarName}=${dbConfig.connectionUrl(appName)}`
  }

  if (needsRedis) {
    compose += `
      - REDIS_URL=redis://cache:6379`
  }

  compose += `
    restart: unless-stopped`

  if (needsDb || needsRedis) {
    compose += `
    depends_on:`
    if (needsDb)    compose += `\n      - db`
    if (needsRedis) compose += `\n      - cache`
  }

  if (needsDb) {
    const dbConfig = DATABASE_CONFIGS[dbType]

    compose += `

  db:
    image: ${dbConfig.image}
    environment:`

    dbConfig.envVars(appName).forEach(envVar => {
      compose += `\n      - ${envVar}`
    })

    compose += `
    volumes:
      - ${appName}_dbdata:${dbConfig.volumePath}
    restart: unless-stopped`
  }

  if (needsRedis) {
    compose += `

  cache:
    image: redis:7-alpine
    restart: unless-stopped`
  }

  if (needsDb) {
    compose += `

volumes:
  ${appName}_dbdata:`
  }

  return compose
}

// ── Go template ────────────────────────────────────────────────────
function goTemplate(appName, manifest, hostPort) {

  const { startCmd, services } = manifest

  const dbType     = services?.database?.type
  const needsDb    = !!dbType && dbType !== 'sqlite' && !!DATABASE_CONFIGS[dbType]
  const needsRedis = services?.cache?.type === 'redis'

  let compose = `version: '3.8'

services:
  web:
    image: golang:1.22-alpine
    working_dir: /app
    volumes:
      - .:/app
    command: sh -c "go build -o app . && ${startCmd || './app'}"
    ports:
      - "${hostPort}:8080"
    environment:
      - PORT=8080`

  if (dbType && DATABASE_CONFIGS[dbType]) {
    const dbConfig   = DATABASE_CONFIGS[dbType]
    const envVarName = getDbEnvVarName(dbType)
    compose += `
      - ${envVarName}=${dbConfig.connectionUrl(appName)}`
  }

  if (needsRedis) {
    compose += `
      - REDIS_URL=redis://cache:6379`
  }

  compose += `
    restart: unless-stopped`

  if (needsDb || needsRedis) {
    compose += `
    depends_on:`
    if (needsDb)    compose += `\n      - db`
    if (needsRedis) compose += `\n      - cache`
  }

  if (needsDb) {
    const dbConfig = DATABASE_CONFIGS[dbType]

    compose += `

  db:
    image: ${dbConfig.image}
    environment:`

    dbConfig.envVars(appName).forEach(envVar => {
      compose += `\n      - ${envVar}`
    })

    compose += `
    volumes:
      - ${appName}_dbdata:${dbConfig.volumePath}
    restart: unless-stopped`
  }

  if (needsRedis) {
    compose += `

  cache:
    image: redis:7-alpine
    restart: unless-stopped`
  }

  if (needsDb) {
    compose += `

volumes:
  ${appName}_dbdata:`
  }

  return compose
}

// ── Dockerfile template ────────────────────────────────────────────
function dockerfileTemplate(appName, hostPort, manifest = {}) {

  const { services } = manifest
  const dbType     = services?.database?.type
  const needsDb    = !!dbType && dbType !== 'sqlite' && !!DATABASE_CONFIGS[dbType]
  const needsRedis = services?.cache?.type === 'redis'

  let compose = `version: '3.8'

services:
  web:
    build: .
    ports:
      - "${hostPort}:3000"
    environment:
      - PORT=3000`

  if (dbType && DATABASE_CONFIGS[dbType]) {
    const dbConfig   = DATABASE_CONFIGS[dbType]
    const envVarName = getDbEnvVarName(dbType)
    compose += `
      - ${envVarName}=${dbConfig.connectionUrl(appName)}`
  }

  if (needsRedis) {
    compose += `
      - REDIS_URL=redis://cache:6379`
  }

  compose += `
    restart: unless-stopped`

  if (needsDb || needsRedis) {
    compose += `
    depends_on:`
    if (needsDb)    compose += `\n      - db`
    if (needsRedis) compose += `\n      - cache`
  }

  if (needsDb) {
    const dbConfig = DATABASE_CONFIGS[dbType]

    compose += `

  db:
    image: ${dbConfig.image}
    environment:`

    dbConfig.envVars(appName).forEach(envVar => {
      compose += `\n      - ${envVar}`
    })

    compose += `
    volumes:
      - ${appName}_dbdata:${dbConfig.volumePath}
    restart: unless-stopped`
  }

  if (needsRedis) {
    compose += `

  cache:
    image: redis:7-alpine
    restart: unless-stopped`
  }

  if (needsDb) {
    compose += `

volumes:
  ${appName}_dbdata:`
  }

  return compose
}

module.exports ={generateCompose}