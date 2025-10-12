
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

import { NOOPService } from './src/services/noop/index.js';
import { Xevents } from './src/services/event/index.js';

//Sandbox.modules.of('HTTPService', HTTPService);
Sandbox.modules.of('Config', Configuration);
Sandbox.modules.of('Events', Xevents);
Sandbox.modules.of('NOOPService', NOOPService);

const APP_NAME = 'com.airlock.backend';
const APP_VERSION = '0.0.1';
const GLOBALS = {};

/******** ENSURE DESIRED SERVICES ARE DEFINED IN EITHER `services` or `providers` ********/
const MY_SERVICES = [...core, ...services, ...providers];

new Sandbox(MY_SERVICES, async function(/** @type {ISandbox} **/box) {
  try {
    console.log(`${APP_NAME} v${APP_VERSION}`);
    bootstrapStartupServices();
    
    box.my.Events.addEventListener(Events.APP_INITIALIZED, wrapAsyncEventHandler(logEvent));    
    //box.my.HTTPService.start(); 

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