import { ApplicationService } from '../../types/application.js';

/**
 * Houses policy claim validation logic for all supported claim types
 */
export class ClaimValidationProvider extends ApplicationService {
  #dbClient;
  #logger;
  #sandbox;

  static bootstrap = true;

  /**
   * @param {ISandbox} sandbox
   */
  constructor(sandbox) {
    super();
    this.#sandbox = sandbox;
    this.#logger = sandbox.core.logger.getLoggerInstance();
    this.#dbClient = sandbox.my.Database.getClient();
  }

  claims = {
  /**
   * Airlock policy claim that tests whether there any available access requests
   * left for the airlocked resource
   * @param {Object} policy - the canoncial policy for a specified Airlock resource fetched from the policy authority associated with the resource
   * @returns {Boolean}
   */
    async max_uses(policy) {
      //const { data, error } = await this.#dbClient.from('policies').select('*').eq('id', policy);
      return true;
    }
  }
  
}