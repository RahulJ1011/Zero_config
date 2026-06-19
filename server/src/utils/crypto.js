

const crypto = require('crypto');

const {config} = require('../index')

const ALGORITHM = 'aes-256-cbc'
const KEY = Buffer.from(config.encryptionKey, 'utf8')

const encrypt = (text)=>
{
    const iv = crypto.randomBytes(16)

    const cipher = crypto.createCipheriv(ALGORITHM,KEY,iv)

    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted+=cipher.final('hex')

    return iv.toString('hex')+ ':' + encrypted
}


const decrypt = (encryptedText)=>
{
    const parts = encryptedText.split(':')
    const iv = Buffer.from(parts[0],'hex')
    const encrypted = parts[1]

    const decipher = crypto.createDecipheriv(ALGORITHM,KEY,iv)

    let decrypted = decipher.update(encrypted,'hex','utf8')

    decrypted+= decipher.final('utf8')

    return decrypted;
}