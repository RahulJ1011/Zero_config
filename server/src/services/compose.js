

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






