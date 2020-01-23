import bugsnag from '@bugsnag/js'
import bugsnagExpress from '@bugsnag/plugin-express'

import bodyParser from 'body-parser'
import compression from 'compression'
import cors from 'cors'
import helmet from 'helmet'
import csp from 'helmet-csp'
import morgan from 'morgan'
import path from 'path'

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

    if (this.options.csp.hasOwnProperty('directives')) this.register(csp, this.options.csp)
    this.register(helmet, this.options.helmet || {})

    if (Object.keys(this.options.cors)) this.register(cors, this.options.cors)
    if (this.options.compression) this.register(compression)

    let jsonOpts = { limit: '1mb', extended: true }

    if (this.options.bodyParser.hasOwnProperty('json')) {
      jsonOpts = { ...jsonOpts, ...this.options.bodyParser.json }
    }

    this.register(bodyParser.json, jsonOpts)
    this.register(bodyParser.urlencoded, { extended: false, limit: '1mb' })

    if (this.options.bugsnag.hasOwnProperty('key')) {
      const { key, ...bugsnagOptions } = this.options.bugsnag

      const bugsnagClient = bugsnag({ apiKey: key, ...bugsnagOptions })
      bugsnagClient.use(bugsnagExpress)

      const bugsnagMiddlewares = bugsnagClient.getPlugin('express')
      this.register(() => bugsnagMiddlewares.requestHandler)
      this.register(() => bugsnagMiddlewares.errorHandler)
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
