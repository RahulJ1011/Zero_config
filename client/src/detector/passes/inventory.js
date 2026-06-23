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
            const relativePath = path.relative(rootDir, fullPath)

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


