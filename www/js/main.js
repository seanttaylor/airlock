import path from 'path';
import { fileURLToPath } from 'url';
import { Sandbox } from './src/sandbox.js';
import { SystemEvent, Events } from './src/types/system-event.js';
import { core, services, providers } from './src/services.js';

/******** INTERFACES ********/

/* eslint-disable no-unused-vars */
import { ISandbox, IEvent } from './src/interfaces.js';

/* eslint-enable no-unused-vars */

/******** SERVICES ********/
import { Configuration } from './src/services/config/index.js';
//import { HTTPService } from './src/services/http.js';

import { ElectronProvider } from './src/services/electron/index.js';
import { NOOPService } from './src/services/noop/index.js';
import { Xevents } from './src/services/event/index.js';

//Sandbox.modules.of('HTTPService', HTTPService);
Sandbox.modules.of('Config', Configuration);
Sandbox.modules.of('Events', Xevents);
Sandbox.modules.of('NOOPService', NOOPService);
Sandbox.modules.of('ElectronProvider', ElectronProvider);

const APP_NAME = 'com.airlock.app';
const APP_VERSION = '0.0.1';
const FILENAME = fileURLToPath(import.meta.url);
const DIRNAME = path.dirname(FILENAME);

const FILE_PATH = path.join(DIRNAME, '../index.html');
const GLOBALS = {};

/******** ENSURE DESIRED SERVICES ARE DEFINED IN EITHER `services` or `providers` ********/
const MY_SERVICES = [...core, ...services, ...providers];

new Sandbox(MY_SERVICES, async function(/** @type {ISandbox} **/box) {
  try {
    await box.my.ElectronProvider.App.whenReady();
    createBrowserWindow();
    box.my.ElectronProvider.App.on(Events.APP_ACTIVATED_MAC_OS, onMacAppActivation);
    box.my.ElectronProvider.App.on(Events.APP_WINDOWS_CLOSED, onAppWindowsClosed);
    box.my.Events.addEventListener(Events.APP_INITIALIZED, wrapAsyncEventHandler(logEvent));    
    
    console.log(`${APP_NAME} v${APP_VERSION}`);
    bootstrapStartupServices();
    //box.my.HTTPService.start(); 

    /**
     * Wrapper function for convenience
     * @returns {void}
     */
    function createBrowserWindow() {
      const win = new box.my.ElectronProvider.BrowserWindow({
        width: 800,
        height: 600
      });
    
      win.loadFile(FILE_PATH);
    }
    

    /**
     * MACOS-specific handler for launching apps without open windows
     * @returns {void}
     */
    function onMacAppActivation() {
      if (box.my.ElectronProvider.BrowserWindow.getAllWindows().length === 0) {
        createBrowserWindow();
      }
    } 

    /**
     * Triggered by Electron's window management system when all browser windows are closed
     * @returns {void}
     */
    function onAppWindowsClosed() {
      if (process.platform !== 'darwin') {
        box.my.ElectronProvider.App.quit();
      }
    }

    function logEvent(event) {
      console.log(event);
    }

    /**
     * Bootstraps specific services at startup to ensure their APIs are available to the application when needed
     * @param {Object[]} services - services which *REQUIRE* a manual start by the application
     */
    function bootstrapStartupServices(services) {
      const activeServices = [
        { ...box.my.Config.status },
        { ...box.my.NOOPService.status },
        { ...box.my.ElectronProvider.status },

      ];
      console.table(activeServices, ['name', 'timestamp']);
    }

    /**
     * Wraps async functions used as handlers for an
     * `EventTarget` instance; ensures any thrown exceptions are
     * caught by the main application
     * @param {Function} fn
     * @returns {Function}
     */
    function wrapAsyncEventHandler(fn) {
      return async function ({ detail: event }) {
        try {
          await fn(event);
        } catch (ex) {
          console.error(
            `INTERNAL_ERROR (Main): Exception encountered during async event handler (${fn.name}) See details -> ${ex.message}`
          );
        }
      };
    }

    setTimeout(() => {
        box.my.Events.dispatchEvent(new SystemEvent(Events.APP_INITIALIZED), {});
    }, 0);

  } catch(ex) {
    console.error(`INTERNAL_ERROR (Main): Exception encountered during startup. See details -> ${ex.message}`);
  }
});