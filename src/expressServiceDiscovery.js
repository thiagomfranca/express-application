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
   * Read all files from a directory in recursive mode.
   * @param {Array<string>} dir Files path
   */
  recursiveRead(dir) {
    var results = []
    var list = fs.readdirSync(dir);
    // iterate in root folder and get files
    list.forEach(function (file) {
      file = dir + '/' + file;
      var stat = fs.statSync(file)
      if (stat && stat.isDirectory()) {
        /* Recurse into a subdirectory */
        results = results.concat(walk(file));
      } else {
        // We have a file path so push to results
        results.push(module)
      }
    })
    return results
  }

  /**
   * @param {Array} paths - Array of paths to load services from
   */
  discovery(paths) {
    files = recursiveRead(paths)

    if (files.length === 0) {
      return
    }

    files.forEach((file) => {
      const module = require(`${file.replace('.js', '')}`)
      if (module.hasOwnProperty('default')) {
        new module.default(router)
      }
    })
  }
}
