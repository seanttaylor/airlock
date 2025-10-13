import { ApplicationService } from '../../types/application.js';

/**
 * Provides access to Node.js process 
 */
export class ProcessProvider extends ApplicationService {
    #logger;
    #sandbox;
  
    constructor(sandbox) {
      super();
      this.#sandbox = sandbox;
      this.#logger = sandbox.core.logger.getLoggerInstance();
    }
  
    get Process() {
      return new Proxy(process, {
        get(target, prop) {
          const value = target[prop];
          
          if (prop === 'isWindows') {
            return () => target.platform === 'win32';
          }
          if (prop === 'isMac') {
            return () => target.platform === 'darwin';
          }
          if (prop === 'isLinux') {
            return () => target.platform === 'linux';
          }
          
          // Bind methods to preserve context
          return typeof value === 'function' ? value.bind(target) : value;
        }
      });
    }
  }