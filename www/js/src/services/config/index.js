import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { ISandbox } from '../../interfaces.js';
import { ApplicationService } from '../../types/application.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


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
   
   dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
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
      SUPABASE_KEY: process.env.SUPABASE_KEY,
      UPSTASH_TOKEN: process.env.UPSTASH_TOKEN
    }
  }

  /**
   * @returns {Object}
   */
  get vars() {
    return {
      APP_VERSION: '0.0.1',
      APP_NAME: 'airlock',
      DAEMON_MODE_ENABLED: process.env.DAEMON_MODE_ENABLED,
      PORT: 8080,
      SUPABASE_URL: process.env.SUPABASE_URL,
      UPSTASH_URL: process.env.UPSTASH_URL,
    };
  }
}