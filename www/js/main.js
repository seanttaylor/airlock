import path from 'path';
import fs from 'node:fs';
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
import { HTTPService } from './src/services/http.js';
import { RouteService } from './src/services/routers/index.js';

import { ElectronProvider } from './src/services/electron/index.js';
import { ProcessProvider } from './src/services/process/index.js';
import { NOOPService } from './src/services/noop/index.js';
import { Xevents } from './src/services/event/index.js';

import { PolicyService } from './src/services/policy/index.js';

Sandbox.modules.of('HTTPService', HTTPService);
Sandbox.modules.of('Config', Configuration);
Sandbox.modules.of('RouteService', RouteService);
Sandbox.modules.of('Events', Xevents);

Sandbox.modules.of('PolicyService', PolicyService);
Sandbox.modules.of('NOOPService', NOOPService);
Sandbox.modules.of('ElectronProvider', ElectronProvider);
Sandbox.modules.of('ProcessProvider', ProcessProvider);

const APP_NAME = 'com.airlock.app';
const APP_VERSION = '0.0.1';
const FILENAME = fileURLToPath(import.meta.url);
const DIRNAME = path.dirname(FILENAME);

const FILE_PATH = path.join(DIRNAME, '../index.html');
const GLOBALS = {
  ui: {
    window: {
      main: {
        width: 800,
        height: 600,
        webPreferences: {
          preload: path.join(DIRNAME, 'preload.js')
        }
      },
      loadingDialog: {
        width: 300,
        height: 150,
        frame: false,
        //transparent: true,
        resizable: false,
        modal: true,
        //parent: mainWindow,
        alwaysOnTop: false,
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: false,
        },
        html: path.join(DIRNAME, '../dialog-loading.html')
      }
    }
  }
};

/******** ENSURE DESIRED SERVICES ARE DEFINED IN EITHER `services` or `providers` ********/
const MY_SERVICES = [...core, ...services, ...providers];

new Sandbox(MY_SERVICES, async function(/** @type {ISandbox} **/box) {
  try {
    //box.my.Events.addEventListener(Events.DAEMON_OFFLINE, onDaemonOffline);
    //box.my.Events.addEventListener(Events.APP_INITIALIZED, wrapAsyncEventHandler(logEvent));
    
    await box.my.ElectronProvider.App.whenReady();
    const mainWindow = createBrowserWindow(GLOBALS.ui.window.main);
    const createDialog = (options) => createBrowserWindow(options);
    
    mainWindow.loadFile(FILE_PATH);

    box.my.ElectronProvider.App.on(Events.APP_ACTIVATED_MAC_OS, onMacAppActivation);
    box.my.ElectronProvider.App.on(Events.APP_WINDOWS_CLOSED, onAppWindowsClosed);
    box.my.ElectronProvider.Ipc.addEventListener(Events.SET_TITLE, wrapElectronIpcEventHandler(onSetTitle));
    box.my.ElectronProvider.Ipc.addEventListener(Events.APP_INITIALIZED, wrapElectronIpcEventHandler(onAppInitialized));
   
    box.my.ElectronProvider.Ipc.addEventListener(
      Events.HTTP_PROXY_REQUEST, 
      wrapElectronIpcEventHandler(onHTTPProxyRequest), 
      { 
        hasReply: true 
      }
    );
    box.my.ElectronProvider.Ipc.addEventListener(
      Events.FILE_DIALOG_ACTIVATED, 
      wrapElectronIpcEventHandler(onOpenFileDialog),
      {
        hasReply: true
      }
    );
    box.my.ElectronProvider.Ipc.addEventListener(
      Events.FILE_NAME_RECEIVED, 
      wrapElectronIpcEventHandler(onFilenameReceived),
      {
        hasReply: true
      }
    );
    box.my.ElectronProvider.Ipc.addEventListener(
      Events.FILE_DIALOG_DEACTIVATED, 
      wrapElectronIpcEventHandler(onOpenFileDialogDeactivated)
    );

    // Detect if a file was passed on launch (e.g., foo.pdf.alock)
    const LAUNCH_ARGS = box.my.ProcessProvider.Process.argv.slice(1);
    const OPENED_FILE = LAUNCH_ARGS.find(arg => arg.endsWith('.alock'));

    GLOBALS.LAUNCH_ARGS = LAUNCH_ARGS;
    GLOBALS.OPENED_FILE = OPENED_FILE;
    
    console.log(`${APP_NAME} v${APP_VERSION}`);

    /**
     * Wrapper covenience function for creating browser windows
     * @param {Object} options
     * @returns {Object} an Electron BrowserWindow instance
     */
    function createBrowserWindow(options) {
      return new box.my.ElectronProvider.BrowserWindow(options);
    }

    /**
     * Pushes a notification to the renderer process when the Airlock 
     * daemon does **not** send a heartbeat
     * @param {IEvent<Object>} event 
     */
    function onDaemonOffline(event) {
      
    } 

    /**
     * Returns metadata for a specified Airlock file; triggers the loading dialog
     * @param {IEvent<Object>} event 
     * @returns {Object|undefined}
     */
    async function onFilenameReceived(event) {
      const loadingDialog = createDialog(GLOBALS.ui.window.loadingDialog);
      loadingDialog.loadFile(GLOBALS.ui.window.loadingDialog.html);
      GLOBALS.ui.window.loadingDialog.self = loadingDialog;

      const { payload } = event;
      const file = await fs.promises.readFile(payload.filePath);
      const json = JSON.parse(file.toString('utf-8'));
      return json;
    }

    /**
     * Returns metadata for a specified Airlock file; triggers the loading dialog
     * @param {IEvent<Object>} event 
     */
    async function onOpenFileDialogDeactivated(event) {
      GLOBALS.ui.window.loadingDialog.self.close();
      GLOBALS.ui.window.loadingDialog.self = null; 
    }


    /**
     * @param {IEvent<Object>} event 
     * @returns {String|undefined}
     */
    async function onOpenFileDialog(event) {
      const { canceled, filePaths } = await box.my.ElectronProvider.Dialog.showOpenDialog({});
      if (!canceled) {
        return filePaths[0];
      }
    }

    /**
     * Issues an HTTP request in response on behalf of the renderer process
     * @param {IEvent<Object>} event
     * @returns {Object}
     */
    async function onHTTPProxyRequest(event) {

      try { 
        const { ipc, ..._payload } = event.payload;
        const { url, options } = _payload;
  
        const response = await fetch(url, options);
        const body = await response.json();
  
        // Handlers returning data in reply to an Electron IPC event **MUST** serialize 
        // the data before returning or Electron will convert the return data to 
        // an empty object
        return {
          body,
          ok: response.ok,
          status: response.status,
          headers: Object.fromEntries(response.headers.entries())
        };

      } catch(ex) {
        console.error(`INTERNAL_ERROR (App Renderer): Exception encountered during proxy HTTP request. See details -> ${ex.message}`);
        // The only reason an exception should be thrown here is if we can't connect 
        // to the daemon, hence the hardcoded 503 status
        return {
          body: null,
          ok: false,
          status: 503,
          headers: null
        };
      }
     
    }

    /**
     * @param {IEvent<Object>} event
     */
    function onAppInitialized(event) {
      console.log(event);
    }

    /**
     * @param {IEvent<Object>} event 
     */
    function onSetTitle(event) {
      const { payload } = event;
      const webContents = payload.ipc.sender;
      const win = box.my.ElectronProvider.BrowserWindow.fromWebContents(webContents);
      win.setTitle(payload.title);
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
      const activeServices = [];
      console.table(activeServices, ['name', 'timestamp']);
    }

    /**
     * Wraps functions used as handlers for an
     * event emitted via Electron's `ipcRenderer.send` API; ensures any thrown exceptions are
     * caught by the main application and that event objects passed to handlers have a consistent API
     * @param {()=> void} fn
     * @returns {Function}
     */
    function wrapElectronIpcEventHandler(fn) {
      /**
       * @param {Object} ipcEvent - contains metadata and APIs for the Electron event
       * @param {Any} payload - program data emitted with the event
       * @returns {Object}
       */
      return async function (ipcEvent, payload) {
        try {
          const { rel, ...props } = payload;
          const _payload = { ipc: ipcEvent, ...props };
          const event = new SystemEvent(Events.IPC_WRAPPER_EVENT, _payload, { rel });
          
          // Return values MUST be serializable or the renderer process will receive an empty object
          return await fn(event.detail);
        } catch (ex) {
          console.error(
            `INTERNAL_ERROR (Main): Exception encountered during IPC event handler (${fn.name}) See details -> ${ex.message}`
          );
          return {};
        }
      };
    }

    /**
     * Wraps async functions used as handlers for an
     * `EventTarget` instance; ensures any thrown exceptions are
     * caught by the main application
     * @param {()=> void} fn
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


  } catch(ex) {
    console.error(`INTERNAL_ERROR (Main): Exception encountered during startup. See details -> ${ex.message}`);
  }
});