const fs = require('fs');
const path = require('path');
const {
    LOCKFILE_SIGNALS,
    MANIFEST_SIGNALS,
    FRAMEWORK_SIGNALS,
    NODE_FRAMEWORK_DEPS,
    PYTHON_FRAMEWORK_DEPS,
    GO_FRAMEWORK_DEPS,
    LANGUAGE_DEFAULTS,
    EXTENSION_MAP
} = require('../signals')

const {hasFile, getExtensions} = require('./inventory')
const identifyLanguage = async(files,rootDir)=>
{

    /* console.log('Checking signals against files...')
  console.log('Has package.json:', files.has('package.json'))
  console.log('Has package-lock.json:', files.has('package-lock.json'))
  console.log('Has client/vite.config.js:', files.has('client/vite.config.js'))
  console.log('Has vite.config.js:', files.has('vite.config.js'))
 */
  
    const scores  = {};
    let detectedFramework = null;
    let frameworkWeight=0;

    for(const signal of FRAMEWORK_SIGNALS)
    {
        if(hasFile(files,signal.file))
        {
            scores[signal.language] = Math.max(scores[signal.language] || 0, signal.weight)


            if(signal.framework && signal.weight > frameworkWeight)
            {
                detectedFramework = signal.framework
                frameworkWeight = signal.weight
            }
        }
    }



    for(const signal of LOCKFILE_SIGNALS)
    {
        if(hasFile(files,signal.file))
        {
            scores[signal.language] = Math.max(
        scores[signal.language] || 0,
        signal.weight
      )
        }
    }

    for(const signal of MANIFEST_SIGNALS)
    {
         if(hasFile(files,signal.file))
        {
            scores[signal.language] = Math.max(
        scores[signal.language] || 0,
        signal.weight
      )
        }
    }

    console.log("Scores: ", scores)

      const sorted = Object.entries(scores).sort(([, a], [, b]) => b - a)

      if(sorted.length===0)
      {
        return extensionFallBack(files,rootDir);
      }


      const [language, confidence] = sorted[0];

      
      let framework = detectedFramework
      let buildCmd = null;
      let startCmd = null;
      let runTime = null;
      let port = null;
      let isStatic = null;

      if(language == 'nodejs')
      {
        const result = await detectNodeFrameWork(rootDir,files);
        framework = framework || result.framework
    buildCmd  = result.buildCmd
    startCmd  = result.startCmd
    runtime   = result.runtime
    port      = result.port
    isStatic  = result.static || false
      }


      if(language == 'python')
      {
        const result = await detectPythonFramework(rootDir,files);

        framework = framework || result.framework,
        port= result.port,
        startCmd = result.startCmd,
        runTime = 'python3.11'
      }

    
      if(language == 'go')
      {
        const result = await detectGoFrameWork(rootDir,files);
        framework = framework || result.framework,
        port = result.port || 8080,
        startCmd = result.startCmd || './app',
        runTime = 'go1.22',
        buildCmd = 'go build -o app .'
      }

      if(!framework || framework === 'unknown')
      {
        const defaults = LANGUAGE_DEFAULTS[language]
        if(defaults)
        {
            buildCmd = buildCmd || defaults.buildCmd
      startCmd = startCmd || defaults.startCmd
      runtime  = runtime  || defaults.runtime
      port     = port     || defaults.port
        }
      }
     return {
    language,
    framework:  framework || 'unknown',
    runtime:    runtime   || 'node20',
    buildCmd,
    startCmd,
    port:       port      || 3000,
    isStatic,
    confidence,
  }


}



const detectPythonFramework = async(rootDir,files)=>
{
    let lines = [];

    try
    {
        const content = fs.readFileSync(path.join(rootDir,'requirements.txt'),'utf8')

        lines = content.split('\n').map(l=> l.toLowerCase().trim())
        console.log("packages:         ", lines)
    }

    catch(err)
    {
        console.log(err)
    }

    for(const signal of PYTHON_FRAMEWORK_DEPS)
    {
        const found = lines.some(line => line.startsWith(signal.dep.toLowerCase()))
        if(found)
        {
            return{
                framework: signal.framework,
                startCmd: signal.startCmd,
                port: signal.port
            }
        }

    }
     return {
    framework: 'python',
    startCmd:  'python main.py',
    port:      8000,
  }
}



const detectGoFrameWork = async(rootDir,files)=>
{
    let content = ''

    try
    {
        content = fs.readFileSync(path.join(rootDir,'go.mod'),'utf8')
    }

    catch(err)
    {
        console.log(err);
    }
for (const signal of GO_FRAMEWORK_DEPS) {
    if (content.includes(signal.dep)) {
      return {
        framework: signal.framework,
        startCmd:  signal.startCmd,
        port:      signal.port,
      }
    }
  }

  return {
    framework: 'go',
    startCmd:  './app',
    port:      8080,
  }

}
const detectNodeFrameWork = async(rootDir,files)=>
{

     const possiblePaths = [
    path.join(rootDir, 'package.json'),
    path.join(rootDir, 'client', 'package.json'),
    path.join(rootDir, 'frontend', 'package.json'),
    path.join(rootDir, 'web', 'package.json'),
    path.join(rootDir, 'app', 'package.json'),
  ]


    const pkgPath = path.join(rootDir,'package.json')

    let pkg = {};

     for (const pkgPath of possiblePaths) {
    try {
      const content = fs.readFileSync(pkgPath, 'utf8')
      const parsed  = JSON.parse(content)
      const allDeps = { ...parsed.dependencies, ...parsed.devDependencies }

      // only use this package.json if it has meaningful dependencies
      if (Object.keys(allDeps).length > 0) {
        pkg = parsed
        break
      }
    } catch {}
  }




    /* try
    {
        const content = fs.readFileSync(pkgPath,'utf8');
        pkg = JSON.parse(content)
    }
    catch(err)
    {
        return {msg:"file not found"}
    } */
    

    const allDeps = {
        ...pkg.dependencies,
        ...pkg.devDependencies
    }

    for(const signal of NODE_FRAMEWORK_DEPS)
    {
        if(allDeps[signal.dep])

        {
             console.log('Framework detected:', signal.framework, 'via dep:', signal.dep)
            return  {
           
                framework: 'node',
                buildCmd: pkg.scripts?.build ? 'npm run build' : signal.buildCmd ,
                startCmd: pkg.scripts?.start ? 'npm start' : signal.startCmd ,
                port: signal.port,
                static: signal.static || false,
                runTime: detectNodeVersion(pkg,files,rootDir),
            }
        }
    }

     return {
    framework: 'node',
    buildCmd:  pkg.scripts?.build ? 'npm run build' : null,
    startCmd:  pkg.scripts?.start ? 'npm start'     : 'node index.js',
    port:      3000,
    runtime:   detectNodeVersion(pkg, files, rootDir),
  }
}






function detectNodeVersion(pkg,files,rootDir)
{
    try
    {
        const nvmrc    = fs.readFileSync(
            path.join(rootDir,'.nvmrc   '),'utf8'
        ).trim()
          const version = nvmrc.replace('v', '').split('.')[0]
    return `node${version}`
  } catch {}


  const engineRange = pkg?.engines?.node
  if (engineRange) {
    const match = engineRange.match(/(\d+)/)
    if (match) return `node${match[1]}`
  }

  return 'node20' 
    
}




const extensionFallBack = (files,rootDir)=>
{
    const extCounts = getExtensions(files);

    const sorted = Object.entries(extCounts).sort(([,a],[,b]) => b-a)

    for(const[ext] of sorted)
    {
        const language = EXTENSION_MAP[ext]

        if(language)
        {
            const defaults = LANGUAGE_DEFAULTS[language] || {}
            return {
                language,
                framework: 'unknown',
                runtime: defaults.runtime || 'unknown',
                buildCmd: defaults.buildCmd || null,
                startCmd: defaults.startCmd || null,
                port: defaults.port || 3000,
                isStatic: false,
                confidence: 0.3
            }
        }
    }
     return {
    language:   'unknown',
    framework:  'unknown',
    runtime:    'unknown',
    buildCmd:   null,
    startCmd:   null,
    port:       3000,
    isStatic:   false,
    confidence: 0,
  }
}


module.exports = {identifyLanguage}