import { createVerify } from 'node:crypto';
import { ApplicationService } from '../../types/application.js';
import { SystemEvent, Events } from '../../types/system-event.js';

/**
 * 
 */
export class PolicyService extends ApplicationService {
  #PUBLIC_KEY;
  #DataAccessLayer;
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
    this.#PUBLIC_KEY = sandbox.my.Config.keys.PUBLIC_KEY;
    this.#dbClient = sandbox.my.Database.getClient();
  }

    /**
     * Verifies the policy hash matches the supplied claims
     * @param {Object} options
     * @param {Object} options.policy - a signed SHA256 hash of an Airlocked object's access policy claims
     * @param {Object} options.claims - the plain-text access policy claims
     * @returns {Object}
     */
    async validatePolicy({ policy, claims }) {

      try {
        const verifier = createVerify('RSA-SHA256');
        verifier.update(policy);
        verifier.end();

        const { data, error } = await this.#dbClient.from('policies').select('*').eq('hash', policy);
        
        if (error) {
          throw new Error(error.message);
        }
        
        const [ result ] = data;

        return {
          policy,
          claims,
          signature: result.signature,
          isValid: verifier.verify(this.#PUBLIC_KEY, result.signature, 'base64')
        }

      } catch(ex) {
        this.#logger.error(`INTERNAL_ERROR (PolicyService): **EXCEPTION ENCOUNTERED** during policy validation. See details -> ${ex.message}`);
        return {
          policy: null,
          claims: null,
          signature: null,
          isValid: false
        }
      }
    }

    /**
     * Ensures the access policy claims *ALL* pass
     * @param {Object} options
     * @param {Object} options.claims - the plain-text access policy claims
     * @param {Object} options.signature - the signature associated with the incoming policy hash
     * @param {Object} options.policy - a system-validated policy hash for an Airlocked object
     * @returns {Boolean}
     */
    async verifyClaims({ policy, signature, claims }) {
      // TODO: Create new hash with the incoming claims
      // TODO: Compare new hash with incoming policy hash
      // TODO: Validate each claim on the claims object
      //  

      return true; 
    }

}