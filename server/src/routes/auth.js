
const {register, loginHandler} = require("../handlers/auth")

const authRoutes = async(fastify)=>
{
    fastify.post('/auth/register',{
        schema:{
            body:{
                type: 'object',
                required: ['email','password'],
                properties: {
                    email:{type:'string', format:'email'},
                    password: {type: 'string',minLength:10}
                }
            }
        }
    }, register)


    fastify.post('/auth/login',{
         schema:{
            body:{
                type: 'object',
                required: ['email','password'],
                properties: {
                    email:{type:'string', format:'email'},
                    password: {type: 'string',minLength:10}
                }
            }
        }
    },loginHandler)
}

module.exports = {authRoutes}