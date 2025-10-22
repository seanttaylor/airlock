const electron = require('electron/renderer');

/**
 * @readonly
 * @enum {string}
 */
const Events = Object.freeze({
    // Fired when the renderer process makes an HTTP request
    HTTP_PROXY_REQUEST: 'evt.electron.ipc.http_proxy_request',
    // Fired when the user wants to open a file
    FILE_DIALOG_ACTIVATED: 'evt.electron.ipc.file_dialog_activated'
});

/**
 * @param {Object} options
 * @param {Object} options.contextBridge
 * @param {Object} options.ipcRenderer
 */
(function({ contextBridge, ipcRenderer }) {
    try {
        const APP_VERSION = '0.0.1';
        const APP_NAME = 'com.airlock.app.preload'; 
        
        const UI = {
            /**
             * Updates the title bar in the main application window
             * @param {Object} options
             * @param {String} options.title
            */
            setTitle: ({ title }) =>  {
                ipcRenderer.send('set-title', { title, rel: 'set-title' });
            },
            /**
             * Launches the file dialog in the UI
             * @param {Object} options
             * @returns {String} the path of the selected file
            */
            openFileDialog: async () =>  {
                return ipcRenderer.invoke(Events.FILE_DIALOG_ACTIVATED, {
                    rel: Events.FILE_DIALOG_ACTIVATED
                });
            },

        }; 

        const HTTP = {
             /**
             * Forwards metadata for an HTTP fetch call to the main process via `ipcRenderer.invoke`; the
             * listener for the `Events.HTTP_PROXY_REQUEST` event (registered in the main process) returns the response data from 
             * the proxied request
             * @param {String} url
             * @param {Object} options - configuration options for the fetch request
             * @returns {Response}
             */
            proxy: async (url, options={}) => {
                try {
                    const response = await ipcRenderer.invoke(Events.HTTP_PROXY_REQUEST, { 
                    rel: Events.HTTP_PROXY_REQUEST,
                    url, 
                    options 
                });

                return response;

                } catch(ex) {
                    console.error(`INTERNAL_ERROR (Preload): Exception encountered during proxy HTTP call. See details -> ${ex.message}`);
                }
                

                // return new Response(res.body, {
                //     status: res.status,
                //     headers: res.headers
                // });
            }
        };
        
        contextBridge.exposeInMainWorld('Airlock', {
            UI,
            HTTP
        });
        
        console.log(`${APP_NAME} v${APP_VERSION}`);
    } catch(ex) {
        console.error(`INTERNAL_ERROR(Preload Script): **EXCEPTION ENCOUNTERED** in preload module. See details -> ${ex.message}`);

    }
}(electron));

