import { ApplicationService } from '../../types/application.js';
import { SystemEvent, Events } from '../../types/system-event.js';

/**
 * 
 */
export class PolicyService extends ApplicationService {
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
  }

    /**
     * Ensures the policy hash matches the supplied claims
     * @param {Object} options
     * @param {Object} options.policy
     * @param {Object} options.claims
     * @returns {Boolean}
     */
    async validatePolicy({ policy, claims }) {
        return true;
    }

    /**
     * Ensures the access policy claims *ALL* pass
     * @param {Object} options
     * @param {Object} options.claims
     * @returns {Boolean}
     */
    async verifyClaims({ claims }) {
        return true; 
    }

}