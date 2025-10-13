import { randomUUID } from 'node:crypto';

/******** EVENT IDENTIFIERS ********/

/**
 * @readonly
 * @enum {string}
 */
export const Events = Object.freeze({
  APP_INITIALIZED: 'evt.system.app_initialized',
  // A macOS-specific event, when user clicks the dock icon and there are no windows open
  APP_ACTIVATED_MAC_OS: 'activate',
  // Fired when all application windows have been closed
  APP_WINDOWS_CLOSED: 'window-all-closed',
  // Generic wrapper event for all events emitted via the `ipcRenderer.send` API
  IPC_WRAPPER_EVENT: 'evt.electron.ipc',
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