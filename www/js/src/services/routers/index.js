// import { IEvent, ISandbox } from '../../interfaces.js';
// import { SystemEvent, Events } from '../../types/system-event.js';

import { ApplicationService } from '../../types/application.js';
import { StatusRouter } from './status.js';
import { EventsRouter } from './events.js';
import { ObjectRouter } from './object.js';


/**
 * @typedef {Object} DependentServices
 */

export class RouteService extends ApplicationService {
  #sandbox;
  Status;

  static bootstrap = true;

  /**
   * @param {ISandbox & {my: DependentServices}} sandbox
   */
  constructor(sandbox) {
    super();
    this.#sandbox = sandbox;
    //this.#sandbox.my.MiddlewareProvider;

    //const MiddlewareProvider = this.#sandbox.my.MiddlewareProvider;
    //const dataAccessLayer = this.#sandbox.my.DataAccessLayer;
    const events = this.#sandbox.my.Events;
    const config = this.#sandbox.my.Config;
    //const cache = this.#sandbox.my.Cache;
    const logger = this.#sandbox.core.logger.getLoggerInstance();

    this.Object = new ObjectRouter({ /*MiddlewareProvider,*/ events, logger });
    this.Events = new EventsRouter({ /*MiddlewareProvider,*/ events, logger });
    this.Status = new StatusRouter(/*this.#sandbox.my.MiddlewareProvider*/);
  }
}