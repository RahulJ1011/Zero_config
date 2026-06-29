const handleUnknown = (manifest)=>
{


    if(manifest.status === 'unknown')
    {
        return{
            canProceed:   false,
      userMessage:  `Could not detect your project's language.\n` +
                    `Run: thaking deploy --lang=nodejs to specify manually.\n` +
                    `Or add a Dockerfile to deploy any project.`,
        }
    }

    if(manifest.status === 'low-confidence')
    {
        return {
      ...manifest,
      canProceed:   true,
      needsConfirm: true,
      userMessage:  `Detected ${manifest.language} with low confidence (${Math.round(manifest.confidence * 100)}%).\n` +
                    `Please confirm this is correct before deploying.`,
    }
    }


    if(manifest.status === 'generic')
    {
        return {
            ...manifest,
            canProceed:  true,
      userMessage: `Detected ${manifest.language} but could not identify the framework.\n` +
                   `Using generic defaults. Add a Dockerfile for more control.`,
        }
    }

    return {
        ...manifest,
        canProceed: true,
    }
}


module.exports = {handleUnknown}