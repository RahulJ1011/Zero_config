const { DB_TEMPLATES } = require("../config/dbTemplates");


const generateCompose = (appName,manifest,port)=>
{
    const {framework, runTime, buildCmd, startCmd, services} = manifest

    if(framework === 'nextjs' || framework==='nuxt' || framework === 'remix' || framework === 'sveltekit')
    {
        
    }

    if(framework === 'express' || framework === 'nuxt' || framework === 'nestjs' || framework === 'koa' || framework === 'hono' || framework ==='node')
    {

    }

    if(framework ==='django' || framework === 'fastapi' || framework === 'flask' || framework === 'python')
    {

    }

    if(framework === 'go' || framework =='gin' || framework ==='fiber')
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
if(needsDb)
{
    const db = DB_TEMPLATES[dbType]
    compose+= `
        - DATABASE_URL=${db.connectionUrl(appName)} 
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
    dependson:`
    if(needsDb) compose+=`\n   -db`
    if(needsRedis) compose+=`\n  -cache`
  }

  if(needsDb)
  {
    const db = DB_TEMPLATES[dbType]
    compose+= `
    db:
        image: ${db.image}
        environment:`
    db.envVars(appName).forEach(envVar => {
        compose+= `\n   -${envVar}`
    })

    compose+=`
    volumes: 
        - ${appName}_dbdata:${db.volumePath}
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


