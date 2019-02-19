import bugsnag from 'bugsnag'
import express from 'express'
import { prop } from 'ramda'
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
  compression: true
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

    const middlewares = new ExpressMiddlewares(this)
    middlewares.config()

    const serviceDiscovery = new ExpressServiceDiscovery(this.express)
    serviceDiscovery.discovery(options.services.container)
  }

  /**
   * Init Application
   */
  init() {
    this.express.listen(this.options.port, () => {
      console.log(`${this.options.name} listen on ${this.options.port}`)
    })
  }

  /**
   * Error Handling
   */
  errorHandling() {
    this.express.use((err, request, response, next) => {
      this.notify(err)

      if (this.options.debug) console.log(err)

      if (err instanceof Error) {
        const { name, errorCode, message } = err

        return response.status(err.errorCode).json({ errorCode, name, message })
      }

      response.status(500).json({ message: 'unexpected error.' })
    })
  }

  /**
   *
   * @param {Object} err - Error throwed
   */
  notify(err) {
    if (prop('key', this.options.bugsnag)) {
      bugsnag.notify(err)
    }
  }
}
