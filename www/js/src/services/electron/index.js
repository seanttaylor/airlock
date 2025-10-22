import { app, BrowserWindow, dialog, ipcMain } from 'electron/main';
import { ApplicationService } from '../../types/application.js';
import { SystemEvent, Events } from '../../types/system-event.js';

/**
 * This service provides access to Electron APIs
 */
export class ElectronProvider extends ApplicationService {
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
  Dialog = dialog;

  Ipc = {
    /**
     * Used to register handlers for UI events from the renderer; triggered by the
     * `ipcRenderer.send` API  
     * @param {String} name
     * @param {()=> void} callback
     * @param {Object} options
     * @param {Boolean} options.hasReply - indicates whether the event was triggered with Electron's `invoke` API or its
     * `on` API. In the first case the event can return data to the caller.
     */
    addEventListener(name, callback, options={ hasReply: false }) {
      if (options.hasReply) {
        ipcMain.handle(name, callback);
        return;
      }
      ipcMain.on(name, callback);
    }
  }

}