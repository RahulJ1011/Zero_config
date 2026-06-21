const dotenv = require('dotenv')
dotenv.config();

 const config= {


    port: parseInt(process.env.PORT) || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    isDev: process.env.NODE_ENV !== 'production',

    databaseUrl: process.env.DATABASE_URL,

    redisUrl: process.env.REDIS_URL,

    jwtSecret: process.env.JWT_SECRET,

    encryptionKey: process.env.ENCRYPTIONKEY,


    baseDomain: process.env.BASE_DOMAIN,

    cloudflare:{
        apiToken: process.env.CLOUDFARE_API_TOKEN,
        zoneId: process.env.CLOUDFARE_ZONE_ID
    },

    ssh:{
        host: process.env.SSH_HOST,
        user: process.env.SSH_USER,
        privateKeyPath: process.env.SSH_PRIVATE_KEY_PATH
    },

    caddyApiUrl: process.env.CADDYAPI_URL,

}


 function validateConfig()
{
    const required = [
        'DATABASE_URL',
        'JWT_SECRET',
        'ENCRYPTION_KEY',
        'DATABASE_URL',
        'SSH_PRIVATE_KEY_PATH' ,
        'CADDY_API_URL',
        'CLOUDFARE_API_URL',
        'CLOUDFARE_ZONE_ID',
        'CLOUDFARE_API_TOKEN',
        'BASE_DOMAIN',
           'SSH_HOST' ,
        'SSH_USER' ,
    ]

    const missing = required.filter(key => !process.env(key))

    if(missing.length>0)
    {
        console.log('Missing required environmenet variables')
        missing.forEach(key => console.log(`${key}`))
        process.exit(1);
    }
}



module.exports = {config, validateConfig}