import { ApplicationService } from '../../types/application.js';
import { SystemEvent, Events } from '../../types/system-event.js';
import claimSchema from './claims-schema.json' with { type: 'json' };


/**
 * Manages the policy claims validation process; calls specified methods on
 * `ValidationProvider` corresponding to Airlock policy claim types; tracks
 * the satisfaction of policy claims
 */
export class ClaimService extends ApplicationService {
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

    CLAIM_SCHEMA = claimSchema;

    /**
    * @param {String} policy - uuid pointing to the policy in the database 
    * @param {Object} claims
    * @returns {{ object: { boolean: isValid, string: unsatisfiedClaims[] } }}
    */
    async validate({ policy, claims }) {
        const claimTypes = Object.keys(claims);
        let LAST_SATISFIED_CLAIM_INDEX = 0;
        let hasException = false;
        let message = null;
        // USE everyAsync HERE
        const isValid = claimTypes.every((claimType, idx) => {
            LAST_SATISFIED_CLAIM_INDEX = idx;

            try {
                // policy claims objects will be **AT MOST** two levels deep
                if (typeof(claimType) === 'object') {
                    return Object.keys(claimType).every((nestedClaimType) => {
                        return this.#sandbox.my.ValidationProvider[nestedClaimType]();
                    });
                } 

                return this.#sandbox.my.ValidationProvider[claimType](policy);
            } catch(ex) {
                hasException = true;
                message = ex.message;
                this.#logger.error(`INTERNAL_ERROR (ClaimService): **EXCEPTION ENCOUNTERED** while validating policy claim (${claimType}). See details -> ${ex.message}`);
                
                return false;
            }
        });

        return { 
            hasException,
            isValid, 
            message,
            unsatisfiedClaims: claimTypes.slice(LAST_SATISFIED_CLAIM_INDEX, claimTypes.length)
        }
    }

}