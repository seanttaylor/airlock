import { Events, SystemEvent } from './src/types/system-event.js';
import { IEvent } from '../js/src/interfaces.js';

/**
 * @readonly
 * @enum {string}
 */
export const Endpoints = Object.freeze({
    STATUS: 'http://localhost:8080/status',
});

/**
 * Controls the display of a specified alert banner in the application window
 */ 

class AlertBanner {

    #selector;
    #timeoutMillis;

    /** 
    * @param {Object} options
    * @param {String} options.selector - CSS selector for the element
    * @param {Number} [options.timeoutMillis] - number of milliseconds display the alert before automatically hiding it
    * @param {Boolean} [options.dismissOnly] - indicates the alert banner can **ONLY** be hidden by clicking a dismiss button
    * @param {String} [option.dismissSelector] - if `dismissOnly` is `true` a CSS selector for the dissmiss button **MUST** be provided
    */
    constructor(options) {
        this.#selector = options.selector;
        this.#timeoutMillis = options.timeoutMillis;
    }

    /**
     * 
     */
    show() {
       document.querySelector(this.#selector).classList.add('show');
    }

    /**
     * @param {Number} timeout
     */
    hide(timeout) {
        if (timeout) {
            setTimeout(() => {
                document.querySelector(this.#selector).classList.add('show'); 
            }, timeout);
            return;
        }
        document.querySelector(this.#selector).classList.add('show');

    }
}

const DOM = {
    AlertBanner
};

/**
 * Launches the control layer of the application UI
 */
(async function(window) {
    try {
        const { document } = window;
        
        const $ = document.querySelector.bind(document);
        const app = new EventTarget();
        
        const openFileButton = $('#open-file-btn');
        const unlockFileButton = $('#unlock-file-btn');
        
        const APP_NAME = 'com.airlock.app.renderer';
        const APP_VERSION = '0.0.1';
        const HTTPProxy = window.Airlock.HTTP.proxy;
        
        //const alertBanner = new DOM.AlertBanner({ el: $('#alert-banner'), timeout: 8000 });

        //unlockFileButton.addEventListener('click', onUnlockFile);
        //openFileButton.addEventListener('click', onOpenFile);

        app.addEventListener(Events.APP_INITIALIZED, onAppInitialized);
        app.addEventListener(Events.HEALTH_CHECK_FAILED, wrapAsyncEventHandler(onHealthCheckFailed));

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

        /**
         * 
         * @param {Object} e 
         */
        async function onUnlockFile(e) {
            try {
                const response = await HTTPProxy(Endpoints.UNLOCK, {
                    method: 'POST',
                    headers: {},
                    body: JSON.stringify({})
                });

                //app.dispatchEvent(new SystemEvent(Events.AIRLOCK_KEY_VALIDATED, {...response.body}));
                //app.dispatchEvent(new SystemEvent(Events.AIRLOCK_KEY_VALIDATION_FAILED));

            } catch(ex) {
                console.error(`INTERNAL_ERROR (App Renderer): **EXCEPTION ENCOUNTERED** while unlocking file. See details -> ${ex.message}`);
            }

        }

        /**
         * 
         * @param {IEvent<Object>} event 
         */
        function onKeyValidated(event) {

        }

        /**
         * 
         * @param {Object} e 
         */
        function onOpenFile(e) {

        }

        /**
         * 
         * @param {IEvent<Object>} event 
         */
        function onHealthCheckFailed(event) {
            // alertBanner.show(Messages.HEALTH_CHECK_FAILED);
        }

        /**
         * @param {IEvent<Object>} event
         */
        function onAppInitialized(event) {
            console.log(`${APP_NAME} v${APP_VERSION}`);
            
            setInterval(async () => {
                try {
                    const response = await HTTPProxy(Endpoints.STATUS);
                    const CANNOT_REACH_DAEMON = Boolean(response);
                    const RESPONSE_NOT_OK = Boolean(response?.status === 200);
    
                    if (CANNOT_REACH_DAEMON || RESPONSE_NOT_OK) {
                        app.dispatchEvent(new SystemEvent(Events.HEALTH_CHECK_FAILED));
                    }
                } catch(ex) {
                    console.error(`INTERNAL_ERROR (App Renderer): **EXCEPTION ENCOUNTERED** during health check. See details -> ${ex.message} `)
                }

            }, 5000);
        }
                
        app.dispatchEvent(new SystemEvent(Events.APP_INITIALIZED));
    } catch(ex) {
        console.error(`INTERNAL_ERROR (App Renderer): **EXCEPTION ENCOUNTERED** in rendering module. See details -> ${ex.message} `)
    }
  
}(window));

