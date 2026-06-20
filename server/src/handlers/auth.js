

const bcrypt = require('bcrypt')
const {nanoid} = require('nanoid')
const {createUser, findByUser} = require('../db/queries/users')


const register = async(req,res)=>
{
    const {email,password} = req.body;

    const isExist = await findByUser(email)
    
    if(isExist)
    {
        return res.status(400).send({
            error:'user already exists'
        })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const user = await createUser({
    id:           'user_' + nanoid(12),
    email,
    passwordHash,
    apiKey:       'th_' + nanoid(32),
  })

    logger.info('New user registered', email)


     const token = await res.jwtSign({
    userId: user.id,
    email:  user.email,
  })

   return reply.status(201).send({
    message: 'Account created successfully',
    token,
    apiKey: user.apiKey,
    user: {
      id:    user.id,
      email: user.email,
    }
  })
}

const loginHandler = async(req,res)=>
{
    const{email,password} = req.body

    const isUser = await findByUser(email)
    if(!isUser)
    {
        return res.status(401).send({
            error:"Invalid email or password"
        })
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash)
  if (!passwordMatch) {
    return reply.status(401).send({
      error: 'Invalid email or password'
    })
  }

  logger.info("User logged in", email)

  const token = await res.jwtSign({
    userId: user.id,
    email: user.email
  })

  return res.send({
    message: 'Login sucessful',
    token,
    user:{
        id: user.id,
        email: user.email
    }
  })
}