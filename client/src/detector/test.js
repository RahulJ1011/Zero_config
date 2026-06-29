const { detect } = require("./index")
const { handleUnknown } = require("./providers/unknown")




async function main()
{
    const projectPath = process.argv[2] || '.'


console.log(`\nDetecting stack in: ${projectPath}\n`)

const manifest = await detect(projectPath)

const result = await handleUnknown(manifest)


console.log('─────────────────────────────────')
console.log('DETECTION RESULT:')
console.log('─────────────────────────────────')
console.log(`Language:    ${result.language}`)
console.log(`Framework:   ${result.framework}`)
console.log(`Runtime:     ${result.runtime}`)
console.log(`Build cmd:   ${result.buildCmd || 'none'}`)
console.log(`Start cmd:   ${result.startCmd}`)
console.log(`Port:        ${result.port}`)
console.log(`Confidence:  ${Math.round(result.confidence * 100)}%`)
console.log(`Status:      ${result.status}`)
console.log(`Can proceed: ${result.canProceed}`)


if (Object.keys(result.services).length > 0) {
  console.log('\nServices needed:')
  for (const [name, info] of Object.entries(result.services)) {
    console.log(`  ${name}: ${info.type} ${info.version || ''}`)
  }
}


if (result.envVars.required.length > 0) {
  console.log('\nSecrets needed from user:')
  result.envVars.required.forEach(k => console.log(`  ${k}`))
}


if (result.userMessage) {
  console.log(`\nMessage: ${result.userMessage}`)
}


console.log('─────────────────────────────────\n')

}


main().catch(console.error)