const electron = require('electron/renderer');

/**
 * @param {Object} options
 * @param {Object} options.contextBridge
 * @param {Object} options.ipcRenderer
 */
(function({ contextBridge, ipcRenderer }) {
    try {
        const APP_VERSION = '0.0.1';
        const APP_NAME = 'com.airlock.app.preload'; 
    
        console.log(`${APP_NAME} v${APP_VERSION}`);
    
        contextBridge.exposeInMainWorld('airlock', {
            setTitle: (title) =>  {
              ipcRenderer.send('set-title', title);
            }
        });
    } catch(ex) {
        console.error(`INTERNAL_ERROR(Preload Script): **EXCEPTION ENCOUNTERED** in preload module. See details -> ${ex.message}`);

    }
}(electron));

