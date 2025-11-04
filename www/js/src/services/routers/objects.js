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
        const policyClaims = req.body.claims;
        const payload = req.body.payload;

        const { hash, policyId } = await PolicyService.create(policyClaims);
        //const { keyId, object } = await ObjectService.create(payload);
        //TODO: combine object data with ids and policy hash and return to client

        res.set('X-Count', 1);
        res.json([{
          format: 'airlock.v.1',
          keyURI: '/keys/foo-bar-baz',
          claims: policyClaims,
          metadata: {
            name: 'avatar.png',
            size: 21845,
            created: '2025-10-22T14:00:00Z',
            mime: 'image/png'
          },
          payload: {}
        }]);
      } catch(ex) {
        this.#logger.error(`INTERNAL_ERROR (ObjectService): **EXCEPTION ENCOUNTERED** while creating object. See details -> ${ex.message}`);
        next(ex);
      }
    });

    return router;
  }
}