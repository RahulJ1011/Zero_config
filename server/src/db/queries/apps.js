const {eq} = require('drizzle-orm')
const {db} = require('../index')
const {apps} = require('../schema/app')


const getAppsByUser = async(userId)=>
{
    const result = await db
    .select()
    .from(apps)
    .where(eq(apps.userId, userId))
    return result;
}



const getAppById = async(id)=>
{
    const result = await db
    .select()
    .from(apps)
    .where(eq(apps.id, id))
    return result[0] || null;
}


const getAppByName =  async(name)=>
{
  const result = await db
    .select()
    .from(apps)
    .where(eq(apps.name, name))
    .limit(1)

  return result[0] || null
}


const createApp = async(data)=>
{
    const result = await db
    .insert(apps)
    .values(data)
    .returning()

    return result[0];
}

const updateAppStatus = async(id, status, url = null)=>
{
    const result = await db
    .update(apps)
    .set({
        status,
        url,
        updatedAt: new Date()
    })
    .where(eq(apps.id,id))
}


const deleteApp = async(id)=>
{
    await db.delete(apps)
    .where(eq(apps.id,id))
}


module.exports={deleteApp,updateAppStatus,getAppById,getAppByName,getAppsByUser,createApp}