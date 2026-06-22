

const errorHandler = (error,req,res)=>
{
    console.error('[ERROR]',error)

    if (error.validation) {
    return reply.status(400).send({
      error: 'Validation Error',
      message: error.message,
      details: error.validation
    })
  }

  if (error.statusCode === 404) {
    return reply.status(404).send({
      error: 'Not Found',
      message: error.message
    })
  }
 return reply.status(500).send({
    error: 'Internal Server Error',
    message: 'Something went wrong on our end'
  })

}

module.exports = {errorHandler}