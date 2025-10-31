import express from 'express';

/**
 * Router exposing endpoints for managing airlock keys
 */
export class KeyRouter {
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
     * Unlocks an airlocked object
     */
    router.get('/keys/:id', async (req, res, next) => {
      try { 
        const policy = req.headers['x-airlock-policy'];
        const format = req.headers['x-airlock-format'];
        const claims = JSON.parse(atob(req.headers['x-airlock-claims']));
        const policyValidationResult = await PolicyService.validatePolicy({ policy, claims });

        if (!policyValidationResult.isValid) {
          // TODO: ENSURE A SYSTEM EVENT IS DISPATCHED BEFORE SENDING RESPONSE
          res.status(403);
          res.json([{
            type: "/example.com/probs/policy-validation",
            title: "The Airlock policy cannot be validated",
            detail: "Airlocked files *REQUIRE* a valid access policy. Ensure you have the correct file. Invalid policies *MAY* indicate tampering.",
            instance: "/events/64ea355a-ebee-4a51-8526-6eb995df5bfa",
          }]);
          return;
        };

        if (!await PolicyService.verifyClaims(policyValidationResult)) {
          // TODO: ENSURE A SYSTEM EVENT IS DISPATCHED BEFORE SENDING RESPONSE
          res.status(401);
          res.json([{
            type: "/example.com/probs/policy-claim-verification",
            title: "The Airlock policy claims cannot be verified",
            detail: "Airlocked files require *ALL* plociy access claims to pass. Ensure you have the correct permissions.",
            instance: "/events/f0b4945a-987c-4676-ad95-cc7c63e70165",
          }]);
          return;
        };

        //console.log({ policy, format, claims });

        res.set('X-Count', 1);
        res.json([{
          timestamp: new Date().toISOString(),
        }]);
      } catch(ex) {
        this.#logger.error(`INTERNAL_ERROR (PolicyService): **EXCEPTION ENCOUNTERED** on route (${req.url}). See details -> ${ex.message}`);
        next(ex);
      }
    });

    return router;
  }
}