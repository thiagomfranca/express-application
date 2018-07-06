import bugsnag from 'bugsnag';
import express from 'express';
import ExpressServiceDiscovery from './src/expressServiceDiscovery';
import ExpressMiddlewares from './src/expressMiddlewares';

const defaultOptions = {
  name: 'Project Name',
  port: 3000,
  services: {
    container: []
  },
  environment: 'development',
  serverless: false,
  bugsnag: {
    active: false,
    key: null
  },
  cors: {
    enable: true
  },
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
    this.isServerless = options.serverless
    this.stage = options.environment

    const middlewares = new ExpressMiddlewares(this)
    middlewares.config()

    const serviceDiscovery = new ExpressServiceDiscovery(this.express)
    serviceDiscovery.discovery(options.services.container)
  }

  /**
   * Init Application
   */
  init() {
    if (!this.isServerless) {
      this.express.listen(this.options.port, () => {
        console.log(`${this.options.name} listen on ${this.options.port}`)
      })
    }
  }

  /**
   * Error Handling
   */
  errorHandling(registeredErrors = []) {
    this.express.use((err, request, response, next) => {
      if (this.stage === 'production') {
        bugsnag.notify(err)
      }

      if (err instanceof ValidationError) {
        return response.status(err.status).json(err)
      }

      if (registeredErrors.includes(err.name)) {
        return response.status(err.errorCode || 400).json({ message: err.message })
      }

      return response.status(500).json({ message: 'Unexpected error.' })
    })
  }
}
