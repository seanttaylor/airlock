import { app, BrowserWindow, ipcMain } from 'electron/main';
import { ApplicationService } from '../../types/application.js';
import { SystemEvent, Events } from '../../types/system-event.js';

/**
 * This service provides access to Electron APIs
 */
export class ElectronProvider extends ApplicationService {
  #logger;
  #sandbox;

  /**
   * @param {ISandbox} sandbox
   */
  constructor(sandbox) {
    super();
    this.#sandbox = sandbox;
    this.#logger = sandbox.core.logger.getLoggerInstance();
  } 
  
  get App() {
    // We use Proxy here to ensure that the context is preserved on 
    // all methods of the Electon `app` instance
    return new Proxy(app, {
      get(target, prop) {
        if (prop === 'addEventListener') {
          return (name, callback) => target.on(name, callback);
        }
        const value = target[prop];
        return typeof value === 'function' ? value.bind(target) : value;
      }
    });
  }

  BrowserWindow = BrowserWindow;

  Ipc = {
    /**
     * Used to register handlers for UI events from the renderer; triggered by the
     * `ipcRenderer.send` API  
     * @param {String} name
     * @param {()=> void} callback
     */
    addEventListener(name, callback) {
      ipcMain.on(name, callback);
    }
  }

}