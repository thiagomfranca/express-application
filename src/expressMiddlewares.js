import awsServerlessExpressMiddleware from 'aws-serverless-express/middleware'
import bodyParser from 'body-parser'
import compression from 'compression'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'

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
    this.express.set('json spaces', 4)

    const format = this.stage === 'development' ? 'dev' : 'combined'

    this.express.use(morgan(format, {
      stream: {
        write: (message) => console.info(message),
      },
    }))

    this.express.use(helmet())

    if (this.options.cors.enable) this.express.use(cors())
    if (this.isServerless) this.express.use(awsServerlessExpressMiddleware.eventContext())
    if (this.options.compression) this.express.use(compression())

    this.express.use(bodyParser.json())
    this.express.use(bodyParser.urlencoded({ extended: false, limit: '1mb' }))

    if (this.options.bugsnag.active
      && this.options.bugsnag.key !== null
    ) {
      bugsnag.register(this.options.bugsnag.key)

      this.express.use(bugsnag.requestHandler)
      this.express.use(bugsnag.errorHandler)
    }
  }

  /**
   * @param {String} middleware - Middleware name
   * @param {Function} cb - Function callback
   */
  register(middleware, cb) {
    cb(this.express, require(middleware));
  }
}
