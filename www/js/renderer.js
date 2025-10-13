(async function(window) {

    try {
        const { document } = window;
        const $ = document.querySelector.bind(document);
        const setButton = $('#btn');
        const titleInput = $('#title');
    
        const APP_NAME = 'com.airlock.app.renderer';
        const APP_VERSION = '0.0.1';
    
        /**
         * @param {Object} e 
         */
        function onClickSetTitle(e) {
            try {
                e.preventDefault();
                const title = titleInput.value;
                window.airlock.setTitle({title});
            } catch(ex) {
                console.error(`INTERNAL_ERROR(App Renderer): **EXCEPTION ENCOUNTERED** in rendering module. See details -> ${ex.message} `)
            }
        }
    
        console.log(`${APP_NAME} v${APP_VERSION}`);
        setButton.addEventListener('click', onClickSetTitle);
    } catch(ex) {
        console.error(`INTERNAL_ERROR(App Renderer): **EXCEPTION ENCOUNTERED** in rendering module. See details -> ${ex.message} `)
    }
  
}(window));

