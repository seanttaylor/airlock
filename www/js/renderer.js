import { Events } from './src/types/system-event.js';

/**
 * Launches the control layer of the application UI
 */
(async function(window) {
    try {
        const { document } = window;
        const $ = document.querySelector.bind(document);
        const setButton = $('#btn');
        const titleInput = $('#title');
    
        const APP_NAME = 'com.airlock.app.renderer';
        const APP_VERSION = '0.0.1';
        const HTTPProxy = window.Airlock.HTTP.proxy;
        
        setButton.addEventListener('click', onClickSetTitle);
    
        /**
         * @param {Object} e - DOM event object
         */
        function onClickSetTitle(e) {
            try {
                e.preventDefault();
                const title = titleInput.value;
                window.Airlock.setTitle({title});
            } catch(ex) {
                console.error(`INTERNAL_ERROR(App Renderer): **EXCEPTION ENCOUNTERED** in rendering module. See details -> ${ex.message} `)
            }
        }

        console.log(`${APP_NAME} v${APP_VERSION}`);
        
        //verify Airlock daemon is up and running
        const response = await HTTPProxy('http://localhost:8080/status');
        
        console.log(response);
    } catch(ex) {
        console.error(`INTERNAL_ERROR(App Renderer): **EXCEPTION ENCOUNTERED** in rendering module. See details -> ${ex.message} `)
    }
  
}(window));

