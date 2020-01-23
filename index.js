import fs from 'fs'
import express from 'express'
import spdy from 'spdy'
import ExpressServiceDiscovery from './src/expressServiceDiscovery'
import ExpressMiddlewares from './src/expressMiddlewares'

const defaultOptions = {
  name: 'ExpressApplication API',
  port: 3000,
  http2: {},
  csp: {},
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

    if (typeof this.options.http2 === 'object'
      && process.versions.node.substring(0, 2) < 11 // spdy doesnt work with node >= 11
      && (this.options.http2.key && this.options.http2.cert)) {
      return this.createHttp2Server()
    }

    this.express.listen(this.options.port, () => {
      console.log(`${this.options.name} listen on ${this.options.port}`)
    })
  }

  /**
   *
   */
  createHttp2Server () {
    const { http2: { key, cert } } = this.options

    spdy
      .createServer({
        key: fs.existsSync(key) ? fs.readFileSync(key) : key,
        cert: fs.existsSync(cert) ? fs.readFileSync(cert) : cert
      }, this.express).listen(
        this.options.port,
        error => {
          if (error) {
            console.error(error)
            return process.exit(1)
          }

          console.log(`${this.options.name} listen on ${this.options.port} with HTTP/2 support`)
        }
      )
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
      .every(channel => channel.notify(err, { metaData }))
  }
}
