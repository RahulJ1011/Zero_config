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
const identifyLanguage = (files,rootDir)=>
{


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






const detectNodeFrameWork = async(rootDir,files)=>
{
    const pkgPath = path.join(rootDir,'package.json')

    let pkg = {};


    try
    {
        const content = fs.readFileSync(pkgPath,'utf8');
        pkg = JSON.parse(content)
    }
    catch(err)
    {
        return {msg:"file not found"}
    }
    

    const allDeps = {
        ...pkg.dependencies,
        ...pkg.devDependencies
    }

    for(const signal of NODE_FRAMEWORK_DEPS)
    {
        if(allDeps[signal.dep])
        {
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
        const nvrmc = fs.readFileSync(
            path.join(rootDir,'.nvrmc'),'utf8'
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




const extensionFallBack = (Files,rootDir)=>
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