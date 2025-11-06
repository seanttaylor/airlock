import crypto from 'node:crypto';
import { ApplicationService } from '../../types/application.js';
import { SystemEvent, Events } from '../../types/system-event.js';

/**
 * @description Enum of encryption algorithms
 */
const ALGO = {
    AES256: 'AES-256-GCM'
};

/**
 * Manages encryption of Airlock objects
 */
export class ObjectService extends ApplicationService {
  #Config;
  #logger;
  #sandbox;
  #dbClient;

  static bootstrap = true;

  /**
   * @param {ISandbox} sandbox
   */
  constructor(sandbox) {
    super();
    this.#sandbox = sandbox;
    this.#Config = sandbox.my.Config;
    this.#logger = sandbox.core.logger.getLoggerInstance();
    this.#dbClient = sandbox.my.Database.getClient();
  }

  /**
   * Creates an encrypted Airlock object
   * @param {Object} payload
   * @returns {{ keyId: string, data: object }}
   */
  async create(payload) {
    try {

        if (!payload) {
            throw new Error('Cannot create Airlock object. Payload is missing or undefined');
        }

        const key = crypto.randomBytes(32);
        const iv = crypto.randomBytes(12); 
        const plaintext = typeof payload === 'string'
          ? Buffer.from(payload, 'utf8')
          : Buffer.from(payload);
        
        const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
        const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
        const authTag = cipher.getAuthTag();

        const authTagBase64 = authTag.toString('base64');
        const ivBase64 = iv.toString('base64');
        const { data, error } = await this.#dbClient.from('keys').insert([{
            key: key.toString('base64'),
            algo: 'AES-256-GCM',
            // algo: ALGO.AES256
        }])
        .select();

        if (error) {
            throw new Error(error.message);
        }

        const [result] = data;

        return {
            uri: `${this.#Config.vars.KEY_SERVER}/keys/${result.id}`,
            data: ciphertext.toString('base64'),
            meta: {
                format: this.#Config.vars.FORMAT_VERSION,
                iv: ivBase64,
                tag: authTagBase64,
                algo: 'AES-256-GCM',
                created_at: data.created_at   
            }
        }
    } catch(ex) {
        this.#logger.error(`INTERNAL_ERROR (ObjectService): **EXCEPTION ENCOUNTERED** while creating Airlock object. See details -> ${ex.message}`);
    }
  }

}