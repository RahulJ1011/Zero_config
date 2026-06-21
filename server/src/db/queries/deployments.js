const {eq,desc} = require('drizzle-orm')
const {db} = require('../index')
const {deployments} = require('../schema/deployments')


const createDeployment = async(data)=>
{
    const result = await db
    .insert(deployments)
    .values(data)
    .returning();


    return result[0];
}


const getDeploymentId = async(id)=>
{
    const result = await db
    .select()
    .from(deployments)
    .where(eq(deployments.id, id))
    .limit(1);

    return result[0] || null;
}

const updateDeploymentStatus = async(id,status, extra={})=>
{
    const result = await db
    .update(deployments)
    .set({
        status,
        updatedAt: Date.now(),
        ...extra
    })
    .where(eq(deployments.id,id))

    return result[0];
}

const getDeploymentsByApp = (appId)=>
{
    return db
    .select()
    .from(deployments)
    .where(eq(deployments.id,id))
    .orderBy(desc(deployments.createdAt))
}

module.exports = {getDeploymentsByApp,getDeploymentId,updateDeploymentStatus,createDeployment}