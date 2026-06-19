const {eq} = require('drizzle-orm')
const {db} = require('../index')
const {users} = require('../schema/user')


const  findByUser = async(email)=>
{
    const result = await db
    .select()
    .from(users)
    .where(eq(users.email,email))
    .limit(1)

    return result[0] || null
}


const  findUserById = async(id)=>
{
    const result = await db
    .select()
    .from(users)
    .where(eq(users.id,id))
    .limit(1)

    return result[0] || null
}


const  findUserByApiKey = async(apiKey)=>
{
  const result = await db
    .select()
    .from(users)
    .where(eq(users.apiKey, apiKey))
    .limit(1)

  return result[0] || null
}

const updateUserApiKey = async(userId, apiKey)=> {
  await db
    .update(users)
    .set({ apiKey })
    .where(eq(users.id, userId))
}


module.exports = {updateUserApiKey, findByUser, findUserByApiKey, findUserById,}

