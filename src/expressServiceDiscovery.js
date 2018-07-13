import fs from 'fs'
import { resolve } from 'path'

/**
 * @class ServiceDiscovery
 * @ignore
 */
export default class ExpressServiceDiscovery {
  /**
   * @param {Object} router - Express Router
   */
  constructor(router) {
    this.router = router
  }

  /**
   * @param {Array} paths - Array of paths to load services from
   */
  discovery(paths) {
    if (!Array.isArray(paths)) {
      paths = [paths]
    }

    paths.forEach((routePath) => {
      const modulePath = resolve(routePath)
      const files = fs.readdirSync(routePath)

      if (files.length === 0) {
        return
      }

      files.forEach((file) => {
        const module = require(`${modulePath}/${file.replace('.js', '')}`)

        if (module.hasOwnProperty('default')) {
          new module.default(this.router)
        }
      })
    })
  }
}
