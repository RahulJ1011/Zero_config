const fs = require('fs')
const path = require('path')
const {DATABASE_SIGNALS} = require('../signals')
const {hasFile} =  require('./inventory')



const inferServices = async(files,rootDir,stackSignal)=>
{

    const services = {}
    const envVars = {required:[], detected:[]}
    let port = stackSignal.port || 3000


    const db = await detectDatabase(files,rootDir,stackSignal)

    if(db)
    {
        services.database = db;
    }

    const cache = await detectCache(files, rootDir, stackSignal)
    if(cache)
    {
        services.cache = cache;
    }

    const envResult = await extractEnvVars(files,rootDir);
    envVars.detected = envResult.detected
    envVars.required = envResult.required


    const detectedPort = await detectPort(files,rootDir)
    if(detectedPort)
    {
        port = detectPort
    }


    return {services, envVars, port}
}



const detectCache = async(files,rootDir,stackSignal)=>
{

    if (stackSignal.language === 'nodejs') {
    const pkg = readJson(path.join(rootDir, 'package.json'))
    if (pkg) {
      const allDeps = { ...pkg.dependencies, ...pkg.devDependencies }
      if (allDeps['redis'] || allDeps['ioredis'] || allDeps['@upstash/redis']) {
        return { type: 'redis', version: '7', required: false, source: 'npm-deps' }
      }
    }
  }

  const envVars = parseEnvFile(rootDir)

  if(envVars.REDIS_URL || envVars.UPSTASH_REDIS_REST_URL)
  {
    return {
        type: 'redis',
        version: '7',
        required: false,
        source: 'env-url'
    }
  }

  return null;
}

const INFRA_VARS = new Set([
  'DATABASE_URL', 'REDIS_URL', 'MONGODB_URI',
  'MYSQL_URL', 'DATABASE_HOST'
])


const SECRET_VARS = new Set([
  'STRIPE_SECRET_KEY', 'STRIPE_PUBLISHABLE_KEY',
  'SENDGRID_API_KEY', 'MAILGUN_API_KEY',
  'NEXTAUTH_SECRET', 'JWT_SECRET', 'AUTH_SECRET',
  'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET',
  'GITHUB_CLIENT_ID', 'GITHUB_CLIENT_SECRET',
  'OPENAI_API_KEY', 'ANTHROPIC_API_KEY',
  'CLOUDINARY_URL', 'AWS_ACCESS_KEY_ID',
])

const extractEnvVars = async(files,rootDir)=>
{
    let envPath = null;

    if(hasFile(files, '.env.example'))
    {
        envPath = path.join(rootDir, '.env.example')
    }
    else if(hasFile(files, '.env'))
    {
        envPath = path.join(rootDir, '.env')
    }

    if(!envPath)
    {
        return{
            msg: ".env file not found....",
            required: [],
            detected: []
        }
    }

    const envVars = parseEnvFile(rootDir,envPath)
    const keys = Object.keys(envVars);

    return {
        required: keys.filter(k => SECRET_VARS.has(k)),
        detected: keys.filter(k => INFRA_VARS.has(k))
    }
}



const detectDatabase = async(files,rootDir, signal) =>
{
    const prismaSchema = path.join(rootDir, 'prisma', 'schema.prisma')


    if(hasFile(files, 'prisma/schema.prisma'))
    {
        try
        {
            const content = fs.readFileSync(prismaSchema,'utf8')
            const match = content.match(/provider\s*=\s*"(\w+)"/)
            const provider = match?.[1]
            return {
                type:    provider === 'postgresql' ? 'postgres'
                        : provider === 'mysql' ? 'mysql'
                        : provider === 'sqlite' ? 'sqlite'
                        : 'postgres',
                
                version : '15',
                required: true,
                source: 'prisma-schema'
            }

        }
        catch(err)
        {
            console.log(err);
        }

    }


    if(signal.language === 'nodejs')
    {
        const pkg = readJson(path.join(rootDir, 'package.json'))
        if(pkg)
        {
            const allDeps = {...pkg.dependencies, ...pkg.devDependencies}
            const dbSignals = DATABASE_SIGNALS.nodejs

            for(const s of dbSignals)
            {
                if(allDeps[s.dep])
                {
                    return{
                        type: s.db,
                        version: s.db === 'postgres' ? '15'
                                    : s.db === 'mongodb' ? '7'
                                    : s.db === 'mysql' ? '8'
                                    : null,
                        required: s.db!== 'redis',
                        source: 'npm-deps'
                    }
                }
            }
        }
    }


    if(signal.language === 'python')
    {
        const lines = readLines(path.join(rootDir,'requirements.txt'))

        const dbSignals = DATABASE_SIGNALS.python;

        for(const s of dbSignals)
        {
            if(lines.some(line => l.toLowerCase().startsWith(s.dep)))
            {
                return {
                    type: s.db,
                    version: '15',
                    required: true,
                    source: 'requirements.txt'
                }
            }
        }
    }

    const envVars = parseEnvFile(rootDir)
    if(envVars.DATABASE_URL)
    {
        const url = envVars.DATABASE_URL
        if(url.startsWith('postgres') || url.startsWith('postgresql'))
        {
            return {
                type: 'postgres',
                version: '15',
                required: true,
                source: 'env-url'
            }
        }

        if(url.startsWith('mysql'))
        {
             return {
                type: 'mysql',
                version: '8',
                required: true,
                source: 'env-url'
            }
        }

        if(url.startsWith('mongodb'))
        {
             return {
                type: 'mongodb',
                version: '7',
                required: true,
                source: 'env-url'
            }
        }
    }


    return null;


}    




const detectPort = async(files,rootDir)=>
{
    const envVars = parseEnvFile(rootDir)
    if(!envVars.PORT) return null;
    return parseInt(envVars.PORT)
}



function readJson(filePath)
{
    try
    {
        return JSON.parse(fs.readFileSync(filePath,'utf8'))
    }
    catch(err)
    {
        return null;
    }
}


function readLines(filePath)
{
    try
    {
        return fs.readFileSync(filePath,'utf8').split('\n')
    }
    catch(err)
    {
        console.log(err);
        return null;
    }
}

function parseEnvFile(rootDir, filePath)
{
    const target = filePath || path.join(rootDir,'.env')

    if(!target)
    {
        return {
            msg: "Env file not found"
        }


    }

    try
    {
        const content = fs.readFileSync(target,'utf8')
        return Object.fromEntries(
            content.split('\n')
            .filter(line=> line.includes('#') && !line.startsWith('#'))
            .map(line => {
                const[key,...rest] = line.split('=')
                return [key.trim(), rest.join('=').trim()]
            })
        )
    }

    catch(err)
    {
        return{}
    }
}

module.exports = {inferServices}