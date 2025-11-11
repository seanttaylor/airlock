import { ApplicationService } from '../../types/application.js';

/**
 * Houses handy helper functions
 */
export class UtilityProvider extends ApplicationService {
  #logger;
  #sandbox;

  /**
   * @param {ISandbox} sandbox
   */
  constructor(sandbox) {
    super();
    this.#sandbox = sandbox;
    this.#logger = sandbox.core.logger.getLoggerInstance();
  }

  /**
   * @param {Any[]} arr - a Javascript array
   * @returns {Object} a set of async `Array` API implementations
   */
  Array(arr) {
    if (!Array.isArray(arr)) {
      throw new TypeError("Utils.Array expects an array");
    }

    return {
      /**
       * An async implementation of `Array.every`
       * @param {() => Boolean} callback 
       * @returns {Boolean}
       */
      async everyAsync(callback) {
        for (let i = 0; i < arr.length; i++) {
          if (!(await callback(arr[i], i, arr))) {
            return false;
          }
        }
        return true;
      },
       /**
       * An async implementation of `Array.map`
       * @param {() => Any} callback 
       * @returns {Any[]}
       */
      async mapAsync(callback) {
        const results = [];
        for (let i = 0; i < arr.length; i++) {
          results.push(await callback(arr[i], i, arr));
        }
        return results;
      },
      /**
       * An async implementation of `Array.filter`
       * @param {() => Any} callback 
       * @returns {Any[]}
       */
      async filterAsync(callback) {
        const results = [];
        for (let i = 0; i < arr.length; i++) {
          if (await callback(arr[i], i, arr)) {
            results.push(arr[i]);
          }
        }
        return results;
      },
    };
  }

}