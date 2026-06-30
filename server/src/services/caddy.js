
const {Mutex} = require("../utils/mutex")
const {config} = require("../config/index")
const {logger} = require("../utils/logger")

const CADDY_API = config.caddyApiUrl || "http://localhost:2019"

const caddyMutex = new Mutex()

const addCaddyRoute = async(appName, port)=>
{

    await caddyMutex.acquire();
    

    try
    {
        const domain = `${appName}.${config.baseDomain}`

    logger.info('Adding caddy route', `${domain}-> ${port} `);

    const route = {

        match: [
            {host: [domain]}
        ],
        handle: [
            {
                handler: 'reverse_proxy',
                upstreams: [{dial: `localhost:${port}`}]
            }
        ],
        terminal: true
    }
        const res = await fetch(
            `${CADDY_API}/config/apps/http/servers/srv0/routes`,
            {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(route)
            }
        )

        if(!res.ok)
        {
            const text = await res.text();
            throw new Error(`Caddy API Error: ${text}`)
        }

        logger.info('caddy route added', domain)
    }
    catch(err)
    {
        logger.error('Failed to add caddy route', err.message);
        throw err;
    }
    finally
    {
        caddyMutex.release();
    }
}


const removeCaddyRoute = async(appName)=>
{
   
    await caddyMutex.acquire();
    try
    {
        const domain = `${appName}.${config.baseDomain}`

    logger.info('Removing Caddy Route', domain);

        const res = await fetch(
            `${CADDY_API}/config/apps/http/servers/srv0/routes`

        )

        if(!res.ok)
        {
            throw new Error('Could not fetch caddy routes')
        }

        const routes = await res.json();

        const updatedRoutes = routes.filter(route=> {
            const hosts = route.match?.[0]?.host || []
            return !hosts.includes(domain)
        })

        const updatedResponse = await fetch(
            `${CADDY_API}/config/apps/http/servers/srv0/routes`,
            {
                method:'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(updatedRoutes)
            }
        )

        if(!updatedResponse.ok)
        {
            throw new Error('Could not update caddy routes')
        }

        logger.info('Caddy route romoveed', domain);
    }

    catch(err)
    {
        logger.error('Failed to remove caddy route', err.message);
        throw err;
    }
    finally
    {
        caddyMutex.release();
    }
}


module.exports = {removeCaddyRoute,addCaddyRoute}
