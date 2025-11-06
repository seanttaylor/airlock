
import { createVerify, constants, createHash, sign } from 'node:crypto';
import { ApplicationService } from '../../types/application.js';
import { SystemEvent, Events } from '../../types/system-event.js';

/**
 * 
 */
export class PolicyService extends ApplicationService {
  #PUBLIC_KEY;
  #PRIVATE_KEY;
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
    this.#PRIVATE_KEY = sandbox.my.Config.keys.PRIVATE_KEY;
    this.#PUBLIC_KEY = sandbox.my.Config.keys.PUBLIC_KEY;
    this.#dbClient = sandbox.my.Database.getClient();
  }

    /**
     * Verifies the policy hash matches the supplied claims
     * @param {Object} options
     * @param {Object} options.policy - uuid pointing an Airlocked object's access policy claims
     * @param {String} options.claims - stringified access policy claims
     * @returns {Object}
     */
    async validatePolicy({ policy, claims }) {

      try {
        const verifier = createVerify('RSA-SHA256');
        verifier.update(claims);
        verifier.end();

        const { data, error } = await this.#dbClient.from('policies').select('*').eq('id', policy);
        
        if (error) {
          throw new Error(error.message);
        }
        
        const [ result ] = data;

        return {
          policy,
          claims: JSON.parse(claims),
          signature: result.signature,
          isValid: verifier.verify({ 
            key: this.#PRIVATE_KEY,
            padding: constants.RSA_PKCS1_PSS_PADDING 
          }, result.signature, 'base64')
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
     * Creates a hash of an incoming access policy for a new Airlock object
     * @param {Object} options
     * @param {Object} options.claims - the plain-text access policy claims
     * @returns {{ hash: string, policyId: string }}
     */
    async create(claims) {
      try {
        const claimString = JSON.stringify(claims);
        const signature = sign('RSA-SHA256', claimString, {
          key: this.#PRIVATE_KEY,
          padding: constants.RSA_PKCS1_PSS_PADDING,
        }).toString('base64');

        const { data, error } = await this.#dbClient.from('policies').insert([
          { 
            signature,
            debug: claims 
          },
        ]).select();

        if (error) {
          throw new Error(error.message);
        }

        const [policy] = data;
  
        return policy.id;

      } catch(ex) {
        this.#logger.error(`INTENRNAL_ERROR (PolicyService): **EXCEPTION ENCOUNTERED** while creating object policy. See details -> ${ex.message}`);
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

      return; 
    }

}