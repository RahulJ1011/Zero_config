const { DATABASE_CONFIGS, getDbEnvVarName } = require("../config/dbTemplates");


const generateCompose = (appName,manifest,port)=>
{
    const {framework, runTime, buildCmd, startCmd, services} = manifest

   if (framework === 'nextjs' || framework === 'nuxt' ||
      framework === 'remix'  || framework === 'sveltekit' ||
      framework === 'express'|| framework === 'fastify' ||
      framework === 'nestjs' || framework === 'koa' ||
      framework === 'hono'   || framework === 'node')
    {
        
    }

    if(framework === 'express' || framework === 'nuxt' || framework === 'nestjs' || framework === 'koa' || framework === 'hono' || framework ==='node')
    {

    }

    if (framework === 'django' || framework === 'fastapi' ||
      framework === 'flask'  || framework === 'python') 
    {

    }

     if (framework === 'go' || framework === 'gin' ||
      framework === 'echo' || framework === 'fiber')
    {

    }

    if(framework === 'dockerfile')
    {

    }


    return nodeServerTemplate(appName,manifest,port);
}



const nodeServerTemplate = (appName, manifest, hostPort)=>
{


    const {buildCmd, startCmd, services} = manifest;

    const dbType = services?.database?.type
    const needsDb = dbType && dbType!== 'sqlite' && DB_TEMPLATES[dbType]
    const needsRedis = services?.cache?.type === 'redis'

    const cmd = startCmd || 'npm start';

    let compose = `version: '3.8'

services:
    web:
        image: node:20-alpine
        working_dir: /app
        volumes:
            - .:/app
            - /app/node_modules
        command: sh -c "npm install ${buildCmd ? `&& ${buildCmd}` : ''} && ${cmd}"
        ports:
            -"${hostPort}:3000"
        environment:
            - NODE_ENV=production
            - PORT=3000`
if(dbType && DATABASE_CONFIGS[dbType])
{
    const dbConfig = DATABASE_CONFIGS[dbType]
    const envVarName = getDbEnvVarName(dbType)
    compose+= `
        - ${envVarName}=${dbConfig.connectionUrl(appName)} 
    `
}

 if (needsRedis) {
    compose += `
      - REDIS_URL=redis://cache:6379`
  }

  compose+= `
    restart: unless-stopped
  `

  if(needsDb || needsRedis)
  {
    compose+= `
    depends_on:`
    if(needsDb) compose+=`\n   -db`
    if(needsRedis) compose+=`\n  -cache`
  }

  if(needsDb)
  {
    const dbConfig = DATABASE_CONFIGS[dbType]
    compose+= `
    db:
        image: ${db.image}
        environment:`
    dbConfig.envVars(appName).forEach(envVar => {
        compose+= `\n   -${envVar}`
    })

    compose+=`
    volumes: 
        - ${appName}_dbdata:${dbConfig.volumePath}
    restart: unless-stopped`
  }

  if(needsRedis)
  {
    compose+= `
    
    cache:
        image: redis:7-alpine
        restart: unless-stopped`
  }

  if(needsDb){
    compose+=  `
    
    volumes:
        ${appName}_dbdata:`
  }
  return compose
}


const pythonTemplate = (appName,manifest, hostPort)=>
{
    const {startCmd, services} = manifest;
    const dbType = services?.database?.type
    const needsDb = !!dbType && dbType!='sqlite'
    const needsRedis = services?.cache?.type === 'redis'
    const cmd = startCmd || 'python main.py'


    let compose = `version: '3.8'
    
services:
    web:
        image: python:3.11-slim
        working_dir: /app
        volumes:
            - .:/app
        command: sh -c "pip install -r requirements.txt && ${cmd}"
        ports:
            -"${hostPort}:8000"
        environment:
            -PORT=8000
        `

    if(dbType && DATABASE_CONFIGS[dbType])
    {
        const dbConfig = DATABASE_CONFIGS[dbType]
        const envVarName = getDbEnvVarName(dbType)
        compose+= `
            - ${envVarName}=${dbConfig.connectionUrl(appName)}`
    }

    if(needsRedis)
    {
        compose+=`
            - REDIS_URL=redis://cache:6367`
    }
    compose+= `
        restart: unless-stopped`
    
    if(needsDb || needsRedis)
    {
      

        compose+=`
        depends_on:`
        
        if(needsDb)
        compose+=`\n     - db`
        if(needsRedis)
        compose+=`\n     - cache`
     }

        if(needsDb)
        {
              const dbConfig = DATABASE_CONFIGS[dbType]
              compose+=`
             db:
        image: ${dbConfig.image}
        environment:`
        
        dbConfig.envVars(appName).forEach(envVar => {
            compose+= `\n     - ${envVar}`
        })

        compose+= `
        volumes:
            - ${appName}_dbdata:${dbConfig.volumePath}
        restart: unless-stopped`
              
        }

        if(needsRedis)
        {
            compose+= `
            
            cache:
                image: redis:7-alpine
                restart: unless-stopped`
        }

        if(needsDb)
        {
            compose+=`
            
            volumes:
                ${appName}_dbdata:`
        }
   
   
    return compose;
}

const goTemplate = (appName,manifest, hostPort)=>
{
  const {startCmd, services} = manifest;

  const dbType = services?.database?.type
  const needsDb = !!dbType && dbType!=='sqlite'
  const needsRedis = services?.cache?.type === 'redis'

  let compose = `version: 3.8
  
services:
    web:
        image: golang:1.22-alpine
        working_dir: /app
        volumes:
        -   .:/app
        command: sh -c "go build -o app . && ${startCmd || './app'}
        ports:
            - "${hostPort}:8080"
        environment:
            - PORT=8080`
    
    if(dbType && DATABASE_CONFIGS[dbType])
    {
        const dbConfig   = DATABASE_CONFIGS[dbType]
        const envVarName = getDbEnvVarName(dbType)

        compose+= `
            -${envVarName}=${dbConfig.connectionUrl(appName)}`
    }

    if(needsRedis)
    {
        compose+=`
            - REDIS_URL=redis://cache:6379`
    }

    compose+= `
        restart: unless-stopped`

    if(needsDb || needsRedis)
    {
        compose+= `
        depends_on:`
        if(needsDb)  compose+=`\n     - db`
        if(needsRedis) compose+=`\n   - cache`
    }

    if(needsDb)
    {
        const dbConfig = DATABASE_CONFIGS[dbType]
        compose+= `
        
    db:
        image: ${dbConfig.image}
        environment:`
        
        dbConfig.envVars(appName).forEach(envVar => {
            compose+= `\n     - ${envVar}`
        })

        compose+=`
        volumes:
            - ${appName}_dbdata:${dbConfig.volumePath}
        restart: unless-stopped`
    }

    if(needsRedis)
    {
        compose+=`
        
    cache:
        image: redis:7-alpine
        restart: unless-stopped`
    }

    if(needsDb)
    {
        compose+=`
    volumes:
        ${appName}_dbData:`
    }
    return compose

}

const dockerFileTemplate = (appName,hostPort)=>
{
    return `version: 3.8
services:
    web:
        build: .
        ports:
            - "${hostPort}:3000"
        restart: unless-stopped`
}

const dockerfileTemplate = (appName, hostPort, manifest = {}) => {

  const { services } = manifest
  const dbType     = services?.database?.type
  const needsDb    = !!dbType && dbType !== 'sqlite'
  const needsRedis = services?.cache?.type === 'redis'

  let compose = `version: '3.8'

services:
  web:
    build: .
    ports:
      - "${hostPort}:3000"
    environment:
      - PORT=3000`

  // add database url if needed
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