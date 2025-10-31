import { ISandbox } from '../../interfaces.js';
import { ApplicationService } from '../../types/application.js';

/**
 *
 */
export class Configuration extends ApplicationService {
  #sandbox;

  static bootstrap = true;

  /**
   * @param {ISandbox}
   */
  constructor(sandbox) {
    super();
    this.#sandbox = sandbox;
  }

  /**
   * @returns {Object}
   */
  get featureFlags() {
    return {
     
    }
  }

  /**
   * @returns {Object}
   */
  get keys() {
    return {
      PUBLIC_KEY: process.env.PUBLIC_KEY,
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_KEY: process.env.SUPABASE_KEY,
      UPSTASH_URL: process.env.UPSTASH_URL,
      UPSTASH_TOKEN: process.env.UPSTASH_TOKEN
    }
  }

  /**
   * @returns {Object}
   */
  get vars() {
    return {
      PORT: 8080,
    };
  }
}