


// to check a free port on the server for the new containers

const net = require('net')

const isPortFree = (port)=>
{

   return new Promise((resolve)=> {

     const server =  net.createServer()

    server.once('error', () => {
      resolve(false)  
    })

    server.once('listening', () => {
      server.close()
      resolve(true)  
    })

    server.listen(port)
   })
}

const findFreePort = async(initialPort = 3000)=>
{
    let port = initialPort;

    while(port < 9000)
    {
        const free = await isPortFree(port);
        if(free) return port;

        port++;
    }

    throw new Error('No free ports available')
}