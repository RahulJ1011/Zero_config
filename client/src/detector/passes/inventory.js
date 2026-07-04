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

const absoluteRoot = path.resolve(rootDir);

console.log("absoluteRoot:", absoluteRoot)
console.log("rootDir input: ", rootDir)

console.log('rootDir passed to build Inventory', absoluteRoot)

     function walk(dir, depth = 0) {
    if (!recursive && depth > 2) return

    let entries
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true })
    } catch {
      return
    }

    for (const entry of entries) {
      if (SKIP_FOLDERS.has(entry.name)) continue
      if (entry.name.startsWith('.') && entry.isDirectory()) continue

      const fullPath    = path.join(dir, entry.name)

      const relativePath = path.relative(absoluteRoot,fullPath)

      // relative to absoluteRoot — not the parent
      const normalizedPath = relativePath.replace(/\\/g, '/')

    
      if(files.size < 3)
      {
        console.log('fullPath:', fullPath)
        console.log('relativePath:', relativePath)
        console.log('normalized:', normalizedPath)
      }

      if (entry.isDirectory()) {
        walk(fullPath, depth + 1)
      } else {
        // normalize backslashes to forward slashes
        // so signals.js checks work on Windows
        
        files.set(normalizedPath, true)
      }
    }
  }
    walk(absoluteRoot)
    console.log('Files found: ', files.size)
  console.log('files:', [...files.keys()])
    return files
}

const hasFile = (files,fileName)=>
{
    if (files.has(fileName)) return true

  // check in common monorepo subfolders
  const subfolders = ['client', 'frontend', 'web', 'app', 'src']
  for (const folder of subfolders) {
    if (files.has(`${folder}/${fileName}`)) return true
  }
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