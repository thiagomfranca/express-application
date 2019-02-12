import bodyParser from 'body-parser'
import compression from 'compression'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import path from 'path'
import { prop } from 'ramda'

/**
 * @class ExpressMiddlewares
 */
export default class ExpressMiddlewares {
  /**
   * @param {Object} app - Express
   */
  constructor(app) {
    this.app = app
    this.express = app.express
    this.options = app.options
  }

  /**
   * Configure default middlewares
   */
  config() {
    this.express.set('json spaces', this.options.jsonSpaces)

    const { format, ...morganOptions } = this.options.morgan
    this.register(morgan, format, morganOptions)

    this.register(helmet, this.options.helmet || {})

    if (Object.keys(this.options.cors)) this.register(cors, this.options.cors)
    if (this.options.compression) this.register(compression)

    let jsonOpts = { limit: '1mb', extended: true }

    if (prop('json', this.options.bodyParser)) {
      jsonOpts = { ...jsonOpts, ...this.options.bodyParser.json }
    }

    this.register(bodyParser.json, jsonOpts)
    this.register(bodyParser.urlencoded, { extended: false, limit: '1mb' })

    if (prop('key', this.options.bugsnag)) {
      const { key, reportOnlyKnowedErrors, ...bugsnagOptions } = this.options.bugsnag

      bugsnag.register(key, bugsnagOptions)

      this.register(bugsnag.requestHandler)
      this.register(bugsnag.errorHandler)
    }
  }

  /**
   * @param {String|Function} middleware - Function or package name
   * @param {Any} opts - Options to configure middleware
   */
  register(middleware, ...opts) {
    let fn = middleware

    if (typeof fn !== 'function') fn = require(path.resolve(middleware))

    this.express.use(fn(...opts))
  }
}
