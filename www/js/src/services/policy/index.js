import Ajv from 'ajv';
import { createVerify, constants, createHash, sign } from 'node:crypto';
import { ApplicationService } from '../../types/application.js';
import { SystemEvent, Events } from '../../types/system-event.js';

const ajv = new Ajv();

/**
 * 
*/
export class PolicyService extends ApplicationService {
  #PUBLIC_KEY;
  #PRIVATE_KEY;
  #ClaimService;
  #dbClient;
  #logger;
  #sandbox;

  static bootstrap = true;

  /**
   * @param {ISandbox} sandbox
  */
 constructor(sandbox) {
   super();
   this.#PRIVATE_KEY = sandbox.my.Config.keys.PRIVATE_KEY;
   this.#PUBLIC_KEY = sandbox.my.Config.keys.PUBLIC_KEY;
   this.#dbClient = sandbox.my.Database.getClient();
   this.#logger = sandbox.core.logger.getLoggerInstance();
   
   this.#ClaimService = sandbox.my.ClaimService;
   this.#sandbox = sandbox;
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
   * @param {Object} options.policy - a uuid pointing to the policy in the database
   * @returns {Boolean}
   */
  async verifyClaims({ policy, claims }) {
    try {
      const isValid = ajv.validate(this.#ClaimService.CLAIM_SCHEMA, claims);
      if (!isValid) {
        this.#logger.error(`INTERNAL_ERROR (PolicyService): Could not validate all policy claim structure. See details -> ${JSON.stringify(ajv.errors)} `);
        return false;
      }

      const claimValidationResult = await this.#ClaimService.validate({ policy, claims });

      if (!claimValidationResult.isValid) {
        this.#sandbox.my.Events.dispatchEvent(new SystemEvent(Events.POLICY_VALIDATION_FAILURE, {
          policy,
          ...claimValidationResult
        }));
      }

    } catch(ex) {
      this.#logger.error(`INTERNAL_ERROR (PolicyService): **EXCEPTION ENCOUNTERED** while verifying policy claims. See details -> ${ex.message} `);
      return false;
    }
    
    return; 
  }

}