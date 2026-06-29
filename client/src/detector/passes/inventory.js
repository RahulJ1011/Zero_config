const fs = require('fs')
const path = require('path')


const SKIP_FOLDERS = new Set([
    'node_modules',
  '.git',
  '.next',
  '.nuxt',
  'dist',
  'build',
  '__pycache__',
  '.venv',
  'venv',
  'target',
  'vendor',
  '.turbo',
  'out',
  '.cache',
])


const buildInventory = (rootDir, recursive = false)=>
{
     rootDir = path.resolve(rootDir).toLowerCase()
    const files = new Map();

    function walk(dir,depth=0)
    {
        if(!recursive && depth>2)
            return;


        let entries

        try
        {
            entries = fs.readdirSync(dir,{withFileTypes: true})

        }
        catch(err)
        {
            console.log(err);
            return {msg: "can't read this directory"}
        }

        for(const entry of entries)
        {
            if(SKIP_FOLDERS.has(entry.name)) continue;

            if(entry.name.startsWith('.') && entry.isDirectory()) continue;


            const fullPath = path.join(dir,entry.name)
            const normalizedRoot = rootDir.toLowerCase()
const normalizedFull = fullPath.toLowerCase()
const relativePath = path.relative(normalizedRoot, fullPath.toLowerCase())


            if(entry.isDirectory())
            {
                walk(fullPath,depth+1);
            }
            else
            {
                files.set(relativePath,true)
            }
        }
    }
    walk(rootDir)
    return files
}

const hasFile = (files,fileName)=>
{
    return files.has(fileName)
}

const getExtensions = (files)=>
{
    const counts = {};
    for(const [filepath] of files)
    {
        const ext = path.extname(filepath).replace('.','')
        if(ext)
        {
            counts[ext] = (counts[ext] || 0)+1;
        }
        return counts;
    }
}


const hasFileMatching = (files,pattern)=>
{
    const regex = new RegExp(
        '^' + pattern.replace('.','\\.').replace('*','.*')+'$'
    )


    for(const [filepath] of files)
    {
        const baseName = path.basename(filepath)

        if(regex.test(baseName))
        {
            return true;
        }
    }
    return false;
}


module.exports = {hasFile,hasFileMatching,getExtensions,buildInventory}