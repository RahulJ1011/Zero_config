const path = require('path')
const {buildInventory,hasFile} = require('./passes/inventory')
const {identifyLanguage} = require('./passes/language')
const { inferServices } = require('./passes/services')



const detect = async(projectDir)=>
{

    const rootDir = path.resolve(projectDir)

    let files = buildInventory(rootDir, false)



    if(hasFile(files,'Dockerfile'))
    {
        return{
            language: 'docker',
            framework: 'dockerfile',
            runtime: 'docker',
            buildCmd: 'docker build',
            startCmd: null,
            port: 3000,
            isStatic: false,
            services: {},
            envVars: {required: [], detected: []},
            confidence: 1.0,
            source: 'dockerfile',
            status: 'confident'
        }
    }

    let stackSignal = await identifyLanguage(files,rootDir);

    if(stackSignal.confidence < 0.5)
    {
         files       = buildInventory(rootDir, true)
    stackSignal = await identifyLanguage(files, rootDir)
    }

    const {services, port, envVars} = inferServices(
        files,rootDir, stackSignal
    )

     const manifest = {
    language:   stackSignal.language,
    framework:  stackSignal.framework,
    runtime:    stackSignal.runtime,
    buildCmd:   stackSignal.buildCmd,
    startCmd:   stackSignal.startCmd,
    port:       port || stackSignal.port || 3000,
    isStatic:   stackSignal.isStatic,
    services,
    envVars,
    confidence: stackSignal.confidence,
    source:     getSource(stackSignal.confidence),
    status:     getStatus(stackSignal),
  }


  return manifest;
}   



function getSource(confidence) {
  if (confidence >= 0.95) return 'framework-config'
  if (confidence >= 0.85) return 'lockfile'
  if (confidence >= 0.7)  return 'manifest'
  if (confidence >= 0.3)  return 'extension-fallback'
  return 'unknown'
}

function getStatus(signal) {
  if (signal.language === 'unknown') return 'unknown'
  if (signal.confidence < 0.5)      return 'low-confidence'
  if (!signal.framework || signal.framework === 'unknown') return 'generic'
  return 'confident'
}