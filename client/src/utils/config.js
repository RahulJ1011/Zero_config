const fs = require('fs')
const path = require('path')
const os = require('os')


const CONFIG_DIR = path.join(os.homedir(), 'ASRKing')
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');


function readConfig()
{
    try
    {
        if(!fs.existsSync(CONFIG_FILE)) return{}
        const content = fs.readFileSync(CONFIG_FILE, "utf8")
        return JSON.parse(content);
    }

    catch(err)
    {
        console.log(err);
        return {}
    }
}


function writeConfig(data)
{
    if(!fs.existsSync(CONFIG_DIR))
    {
        fs.mkdirSync(CONFIG_DIR, {recursive:true})
    }
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(data,null,2))
}


export const config =
{
    get: (key)=> {
        const data = readConfig();
        return data[key]
    },

    set: (key,value)=>
    {
        const data = readConfig()
        data[key]=value;
        writeConfig(data)
    },

    delete: (key)=>
    {
        const data = readConfig();
        delete data[key];
        writeConfig(data)
    },

    getAll: ()=> readConfig(),

    clear: ()=> writeConfig({}),

    isLoggedIn: ()=> 
    {
        const data = readConfig();
        return !!data.apikey
    }





}

