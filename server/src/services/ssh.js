const fs = require('fs');
const path = require('path')
const {Client} = require('ssh2')
const {logger} = require('../utils/logger');
const { config } = require('../config/index');


const createConnection = ()=>
{
    return new Promise((resolve,reject)=> {
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
        })
    })
}