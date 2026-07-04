const fs = require('fs');
const path = require('path')
const {Client} = require('ssh2')
const {logger} = require('../utils/logger');
const { config } = require('../config/index');


const createConnection = ()=>
{
    return new Promise((resolve,reject)=> {


        if (!config.ssh.host || !config.ssh.privateKeyPath) {
      return reject(new Error(
        'SSH not configured. Set SSH_HOST and SSH_PRIVATE_KEY_PATH in .env'
      ))
    } 
    
    
        const conn = new Client()

        conn.on('ready',()=>
        {
            logger.info('SSH connected to the server')
            resolve(conn);
        })

        conn.on('error',(err)=> {
            logger.error('SSH connection error', err.message);
            reject(err);
        })

        conn.connect({
            host: config.ssh.host,
            port: 22,
            username: config.ssh.user,
            privateKey: fs.readFileSync(config.ssh.privateKeyPath),

            readyTimeout: 30000,
        })
    })
}


const runCommand = (conn,command)=>
{
    return new Promise((resolve,reject)=> {

        logger.debug('SSH exec: ',command);

        conn.exec(command,(err,stream)=> {
            if(err)
            {
                reject(err);
            }

            let stdout = ''
            let stderr = ''

            stream.on('data',(data)=> {
                stdout+=data.toString();
            })

            stream.stderr.on('data', (data)=> {
                stderr+=data.toString();
            })

            stream.on('close',(code)=> {
                if(code !== 0 && stderr)
                {
                    logger.warn('Command stderr: ',stderr);
                }
                resolve(stdout.trim());
            })
        })
    })
}


const uploadFile = (conn,content,remotePath)=>
{
    return new Promise((resolve,reject)=> {
        logger.debug('SSH upload to: ', remotePath);

        conn.sftp((err,sftp)=> {
            if(err) return reject(err);

            const writeStream = sftp.createWriteStream(remotePath)

            writeStream.on('close',()=> {
                logger.debug('File uploaded', remotePath);
                resolve();
            })

            writeStream.on('error', reject);
            writeStream.write(content)
              writeStream.end();
        })
    })
}


const sshService = {
    async deploy(appName, composeContent){
        const conn = await createConnection();


        try
        {
            const appDir = `/apps/${appName}`

            logger.info('Creating app directory', appDir);
            await runCommand(conn, `mkdir -p ${appDir}`)


            logger.info('Uploading docker compose file');
            await uploadFile(conn, composeContent, `${appDir}/docker-compose.yml`)

            logger.info('Pulling docker images')

            await runCommand(conn, `cd ${appDir} && docker compose pull 2>&1 || true`)

            logger.info('starting containers')
            const output = await runCommand(
                conn,
                `cd ${appDir} && docker compose up -d 2>&1`
            )

            logger.info('Docker output', output)

            logger.info('verifying app is running')
            const status = await runCommand(
                conn,
                `docker compose -f ${appDir}/docker-compose.yml ps --format json 2>&1`
            )

            logger.info('Container status:', status)

                  logger.info('App deployed successfully', appName)

        }
        finally{
            conn.close()
        }
    },

    async destroy(appName)
    {
        const conn = await createConnection()

        try
        {
            const appDir = `/apps/${appName}`

            logger.info('stopping containers', appName)

            await runCommand(
                conn,
                `cd ${appDir} && docker compose down -v 2>&1 ||  true`
            )

            logger.info('Removing app Directory', appName);

            await runCommand(conn, `rm -rf ${appDir}`)

            logger.info('App was destroyed', appName);
        }

        finally{
            conn.end()
        }
    },

    async getLogs(appName, lines=100)
    {
        const conn = await createConnection();

        try{
            const appDir = `/apps/${appName}`
            const logs = await runCommand(
                conn, 
                `docker compose -f ${appDir}/docker-compose.yml logs --tail=${lines} 2>&1`
            )
            return logs
        }

        finally{
            conn.end();
        }
    },


    async getStatus(appName)
    {
        const conn = await createConnection()
        try
        {
            const appDir = `/apps/${appName}`
            const output = await runCommand(
                conn,
                `docker compose -f ${appDir}/docker-compose.yml ps 2>&1`
            )
            return output
        }

        finally
        {
            conn.end()
        }
    }

}

module.exports = {sshService}