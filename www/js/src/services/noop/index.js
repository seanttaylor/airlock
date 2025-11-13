import { ApplicationService } from '../../types/application.js';

/**
 * This service is just used as a sanity check to ensure the module system is working
 */
export class NOOPService extends ApplicationService {
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

}