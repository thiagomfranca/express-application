import express from 'express'
import ExpressServiceDiscovery from './src/expressServiceDiscovery'
import ExpressMiddlewares from './src/expressMiddlewares'

const defaultOptions = {
  name: 'ExpressApplication API',
  port: 3000,
  services: {
    container: []
  },
  debug: false,
  jsonSpaces: 4,
  morgan: {
    format: 'combined'
  },
  bugsnag: {
    key: null,
    releaseStage: 'development'
  },
  cors: {},
  compression: true,
  error: {
    defaultErrorCode: 500,
    channels: []
  }
}

/**
 * @class ExpressApplication
 */
export default class ExpressApplication {
  /**
   * @param {Object} _options - Configuration options
   */
  constructor(opts = {}) {
    const options = { ...defaultOptions, ...opts }
    const app = express()

    this.express = app
    this.options = options
    this.channels = options.error.channels || []

    const middlewares = new ExpressMiddlewares(this)
    middlewares.config()
  }

  /**
   * Init Application
   */
  init() {
    const serviceDiscovery = new ExpressServiceDiscovery(this.express)
    serviceDiscovery.discovery(this.options.services.container)

    this.express.listen(this.options.port, () => {
      console.log(`${this.options.name} listen on ${this.options.port}`)
    })
  }

  /**
   * Error Handling
   */
  errorHandling(cb = null) {
    if (typeof cb === 'function') {
      this.express.use(cb)
      return
    }

    this.express.use(this.errorDispatcher.bind(this))
  }

  /**
   * Dispatch errors
   * @param {*} err
   * @param {*} request
   * @param {*} response
   * @param {*} next
   */
  errorDispatcher (err, request, response, next) {
    const metaData = err.metaData || {}
    const errorCode = err.errorCode || this.options.error.defaultErrorCode

    this.notify(err, metaData)
    if (request.bugsnag) request.bugsnag.notify(err, { metaData })

    if (this.options.debug) console.debug(err)

    if (err instanceof Error) {
      const { name, message } = err
      return response.status(errorCode).json({ errorCode, name, message })
    }

    response.status(errorCode).json({ message: 'unexpected error.' })
  }

  /**
   *
   * @param {Object} err - Error throwed
   */
  notify(err, metaData = {}) {
    return this.channels
      .reduce((acc, channel) => {
        acc.push(channel.notify(err, { metaData }))
        return acc;
      }, [])
  }
}
