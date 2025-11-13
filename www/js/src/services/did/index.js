import { ApplicationService } from '../../types/application.js';



/**
 * Handles creation, resolution and management of DIDs and DID documents
 * See https://www.w3.org/TR/did-1.0 for info on web standards for decentralized identifiers
 */
export class DIDService extends ApplicationService {
  #cache;
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
    this.#cache = sandbox.my.Cache;
  }

  /**
   * Factory function for creating DIDs for Airlock users
   * @param {String} publicKey - public key provided by the requesting user
   * @returns {{ string: did, object: verifiableCredential }} 
   */
  async create(publicKey) {
    const uuid = this.#sandbox.core.generateUUID();
    const did = `did:web:airlock.io:users:${uuid}`;

    await this.#cache.set({ key: `pubKey:${did}`, value: publicKey });

    return { 
        did,
        verifiableCredential: {
            "@context": ["https://www.w3/org/2018/credentials/v1"],
            type: ["VerifiableCredential", "AirlockClientCredential"],
            issuer: "did:web:airlock.io:airlock-identity-authority",
            issuanceDate: new Date().toISOString(),
            credentialSubject:{
                id: did,
                name: "Airlock Client Application",
                capabalities: ["object.create", "object.read", "policy.read"]
            }
        }
    };
  }

}