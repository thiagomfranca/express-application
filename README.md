# Express Application
> The easy way to make robust apis

The *express application* gives you a simple way to start the development of your services,
with some configurations, you have your services disponible to the web.

*Express application* comes with popular preconfigured middlewares like logging, cors,
compression, bugs trace, personalized errors and security for your apis.

## Installation

```sh
npm install express-application --save
```

## Usage example with ES6

```
import ExpressApplication from 'express-application'

const app = new ExpressApplication({
  name: 'My Awesome API',
  services: {
    container: ['./src/services'] // service discovery path list
  },
  port: process.env.PORT || 8000,
  debug: process.env.NODE_ENV === 'development',
  environment: process.env.NODE_ENV || 'development',
  bugsnag: {
    key: process.env.BUGSNAG_KEY || null,
	releaseStage: process.env.NODE_ENV
  },
  cors: {
    enable: process.env.CORS || true
  },
  compression: process.env.COMPRESSION || true,
  morgan: {
	format: 'combined' // default is combined
  },
  http2: { // only works in HTTPS
	key: '-----BEGIN PRIVATE KEY-----\nMIIEvQIB...', // path or string with private key
	cert: '-----BEGIN CERTIFICATE-----\nMIIDqDCCApAC' // path or string with certificate
  },
  csp: { // all configurations and directives from helmet-csp
	directives: {
		defaultSrc: ["'self'"]
	}
  }
})

// start to listen requests
app.init()
app.errorHandling()

export default app
```

After bootstraping the application you only need to define your own services.

*Express Application* will discover all your services in paths that you've specified in the services.container
configuration and inject the express router in the service class constructor. All you've to do now is define your endpoints.

```
export default class ExampleService {
  /**
   * @param {*} router
   */
  constructor(router) {
    router.get('/', this.get.bind(this)) // or router.get('/', this.get) // without preserve context
  }

  /**
   *
   * @param {*} request
   * @param {*} response
   * @param {*} next
   */
  get(request, response, next) {
    response.status(200).json({ message: 'Hallo Welt!' })
  }
}
```

## Dependencies

[express](https://www.npmjs.com/package/express)

[body-parser](https://www.npmjs.com/package/body-parser)

[bugsnag](https://www.npmjs.com/package/bugsnag)

[compression](https://www.npmjs.com/package/compression)

[cors](https://www.npmjs.com/package/cors)

[helmet](https://www.npmjs.com/package/helmet)

[morgan](https://www.npmjs.com/package/morgan)

[spdy](https://www.npmjs.com/package/spdy)

[helmet-csp](https://www.npmjs.com/package/helmet-csp)

## Release History

* 2.4.0
  * show routes list in console on debug mode (development environment)

* 2.3.0
  * add http/2 support using spdy module

* 2.2.0
  * add csp using helmet content security policy
  * upgrade packs

* 2.0.4
  * npm cache in tgz file

* 2.0.3
  * problems with npm cache

* 2.0.2
  * improve response error

* 2.0.1
  * fix error handler

* 2.0.0
    * remove aws serverless express
    * remove errors register
    * added debug flag
    * remove active flag from bugsnag
    * added release stage to bugsnag options

* 1.0.5
	* Keywords and github repo
* 1.0.4
	* Usage example
* 1.0.3
	* Readme dependencies
* 1.0.3
	* Readme
* 1.0.2
    * Bugfix
* 1.0.1
    * The first proper release
* 1.0.0
    * Work in progress

## Meta

Thiago França – eu@thiagofranca.com

Distributed under the ISC license.
