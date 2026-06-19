const {findUserByApiKey} = require('../db/queries/users')


const authMiddleware = async(req,res)=>
{
    const authHeader = req.headers.authorization

    if(!authHeader)
    {
        return res.status(401)
        .send({
            error: 'Unauthorized',
            'message': 'No authorization header provided'
        })
    }


    const tokenSplit = authHeader.trim().split(' ')
    const token = tokenSplit[1]


    if(!token)
    {
        return res.status(401).send({
            error: 'Unauthorized',
            'message': "No token provided"
        })
    }

    try
    {
        const decod = await req.jwtVerify()

        req.userId = decod.userId
        req.userEmail = decod.userEmail

    }

    catch(err)
    {
        console.log(err)
        return res.status(401).send({
            error:'Unauthorized',
            message: 'Invalid or expired token'
        })
    }
}