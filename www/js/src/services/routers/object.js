import express from 'express';

/**
 * Router exposing endpoints for managing airlocked objects
 */
export class ObjectRouter {

  /**
   * @param {Object} options - dependent services and optionsuration options
   * @param {Object} options.MiddlewareProvider 
   * @param {Object} options.events - an instance of the events interface
   * @param {Object} options.logger - an instance of the logger interface
   */ 
  constructor(options) {
    const router = express.Router();

    /**
     * Unlocks an airlocked object
     */
    router.get('/objects/unlock', (req, res) => {

      res.set('X-Count', 1);
      res.json([{
        timestamp: new Date().toISOString(),
      }]);
    });

    return router;
  }
}