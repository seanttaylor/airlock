import express from 'express';

/**
 * Router exposing endpoints for registering Airlock users with DIDs
 */
export class ClientRouter {

  /**
   * @param {Object} options
   * @param {Object} options.logger - an instance of the logger interface
   * @param {Object} options.DIDService - an instance of the DIDService interface
   */
  constructor({ DIDService, logger }) {
    const router = express.Router();

    /**
     * Creates a DID for an Airlock client and saves to the registry
     */
    router.post('/clients', async (req, res, next) => {

        try {
            const clientPublicKey = req.body.publicKeyBase64;
            const credential = await DIDService.create(clientPublicKey);

            res.set('X-Count', 1);
            res.json([{
                ...credential
            }]);
        } catch(ex) {
            logger.error(`INTERNAL_ERROR (ClientRouter): **EXCEPTION ENCOUNTERED** while registering Airlock client. See details -> ${ex.message}`);
            next(ex);
        }
    
    });

    return router;
  }
}