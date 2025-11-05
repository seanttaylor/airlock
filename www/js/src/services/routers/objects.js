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
   * @param {Object} options.PolicyService - an instance of the PolicyService interface
   * @param {Object} options.ObjectService - an instance of the ObjectService interface
   */ 
  constructor(options) {
    const router = express.Router();
    const { PolicyService, ObjectService, logger } = options;
    this.#logger = logger;
    
    /**
     * Creates an Airlock object
     */
    router.post('/objects', async (req, res, next) => {
      try { 
        const policyClaims = req.body.claims;
        const payload = req.body.payload;

        const { hash, policyId } = await PolicyService.create(policyClaims);
        const object  = await ObjectService.create(payload);

        res.status(201);
        res.set('X-Count', 1);
        res.json([{
          keyURI: object.keyURI,
          claims: policyClaims,
          object,
          metadata: {
            name: 'avatar.png',
            size: 21845,
            created_at: '2025-10-22T14:00:00Z',
            mime: 'image/png'
          },
        }]);
      } catch(ex) {
        this.#logger.error(`INTERNAL_ERROR (ObjectService): **EXCEPTION ENCOUNTERED** while creating object. See details -> ${ex.message}`);
        next(ex);
      }
    });

    return router;
  }
}