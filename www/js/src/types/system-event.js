//import { randomUUID } from 'node:crypto';

function randomUUID() {
  var temp_url = URL.createObjectURL(new Blob());
  var uuid = temp_url.toString();
  URL.revokeObjectURL(temp_url);
  return uuid.slice(uuid.lastIndexOf(':') + 1); // remove prefix (e.g. blob:null/, blob:www.test.com/, ...)
}

/******** EVENT IDENTIFIERS ********/

/**
 * @readonly
 * @enum {string}
 */
export const Events = Object.freeze({
  APP_INITIALIZED: 'evt.system.app_initialized',
  // Fires when the frontend application has rendered onscreen and is fully interactive
  APP_INITIALIZED_DAEMON_ACTIVATION_REQUIRED: 'evt.airlock.initialized.daemon_activation_required',
  // A macOS-specific event, when user clicks the dock icon and there are no windows open
  APP_ACTIVATED_MAC_OS: 'activate',
  // Fired when all application windows have been closed
  APP_WINDOWS_CLOSED: 'window-all-closed',
  // Fired when the user wants to open a file in the UI
  FILE_DIALOG_ACTIVATED: 'evt.electron.ipc.file_dialog_activated',
  // Fired when the user has selected a file from the file dialog
  FILE_DIALOG_DEACTIVATED: 'evt.electron.ipc.file_dialog_deactivated',
  // Fires when a filename selected for opening is received from the UI
  FILE_NAME_RECEIVED: 'evt.electron.ipc.file_name_received',
  // Fired when the renderer process makes an HTTP request
  HTTP_PROXY_REQUEST: 'evt.electron.ipc.http_proxy_request',
  // Fired when the application fails to query the status of the Airlock daemon
  HEALTH_CHECK_FAILED: 'evt.electron.health_check_failed',
  // Generic wrapper event for all events emitted via the `ipcRenderer.send` API
  IPC_WRAPPER_EVENT: 'evt.electron.ipc',
  // Fired when Airlock object access policy claims are **NOT** satisfied
  POLICY_VALIDATION_FAILURE: 'evt.policy.claims.validation_failure',
  SET_TITLE: 'set-title'
});

/**
 * 
 */
class CustomEvent extends Event {
  constructor(type, eventInitDict = {}) {
    super(type);
    this.detail = eventInitDict.detail || null;
  }
}


/**
 *
 */
export class SystemEvent {
  header = {
    id: randomUUID(),
    timestamp: new Date().toISOString(),
    meta: { _open: { rel: null, type: null } },
    name: null,
    
  };
  payload;

  /**
   * @param {String} name
   * @param {Object} payload
   * @param {Object} metadata
   */
  constructor(name, payload = {}, metadata = {}) {
    this.header.meta = { ...metadata };
    this.header.name = name;
    this.payload = payload;

    return new CustomEvent(name, {
      detail: this,
    });
  }
}