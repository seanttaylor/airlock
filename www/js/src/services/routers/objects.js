import express from 'express';

/**
 * Router exposing endpoints for creating airlocked objects
 */
export class ObjectRouter {
  #logger;

  /**
   * @param {Object} options - dependent services and optionsuration options
   * @param {Object} options.MiddlewareProvider 
   * @param {Object} options.events - an instance of the events interface
   * @param {Object} options.logger - an instance of the logger interface
   * @param {Object} options.PolicyService - an API for managing Airlock policies
   */ 
  constructor(options) {
    const router = express.Router();
    const { PolicyService, logger } = options;
    this.#logger = logger;
    
    /**
     * Creates an Airlock object
     */
    router.post('/objects', async (req, res, next) => {
      try { 
        const policy = req.body.claims;
        const payload = req.body.payload;

        console.log({ policy, payload });

        res.set('X-Count', 1);
        res.json([{
          timestamp: new Date().toISOString(),
        }]);
      } catch(ex) {
        this.#logger.error(`INTERNAL_ERROR (ObjectService): **EXCEPTION ENCOUNTERED** while creating object. See details -> ${ex.message}`);
        next(ex);
      }
    });

    return router;
  }
}