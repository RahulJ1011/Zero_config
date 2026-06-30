const {config} = require('../config/index')
const {logger} = require('../utils/logger')

const CF_API = 'https://api.cloudfare.com/clientv4'
const ZONE_ID = config.cloudflare.zoneId;
const API_TOKEN = config.cloudflare.apiToken

const cfRequest = async(method, endPoint, body = null)=>
{
    const options = {
        method,
        headers:{
            'Authorization': `Bearer ${API_TOKEN}`,
            'Content-Type': 'application/json'
        },
    }

    if(body)
    {
        options.body = JSON.stringify(body);

        
    }
    const res = await fetch(`${CF_API}${endPoint}`, options);
        const data = await res.json();

        if(!data.success)
        {
            const errors = data.errors.map(e => e.message).join(', ')
            throw new Error(`CloudFare API errors: ${errors}`)
        }

        return data.result;
}

const  createDNSRecord = async(appName)=>
{
    const name = `${appName}.${config.baseDomain}`

    logger.info(`Creating DNS Record`, name);

    try
    {
        const record = await cfRequest('POST',`/zones/${ZONE_ID}/dns_records`,{
            type: 'A',
            name: name,
            content: config.ssh.host,
            ttl: 1,
            proxied: true
        })


        logger.info('DNS Record created ', name);
        return record.id;
    }

    catch(err)
    {
        if(err.message.includes('already exists'))
        {
            logger.warn("DNS Record already exists", name);
            return null;
        }
        logger.error('Failed to create DNS Record', err.message);
        throw err;
    }
}



const deleteRecord = async(appName)=>
{
    const name = `${appName}.${config.baseDomain}`

    logger.info('Deleting DNS Record', name);
    try
    {
        const records = await cfRequest(
            'GET',
            ''
        )
    }
}