export const ClaimsValidationProvider = {
    claims: {
        'max_uses'(usesCount) {
            return false;
        }
    },
    /**
     * @param {Object} policyClaims
     * @returns {Boolean}
     */
    async validate(policyClaims) {
        return Object.keys(policyClaims).every((claimType) => {
            // policy claims objects will be **AT MOST** two levels deep
            if (typeof(claimType) === 'object') {
                return Object.keys(claimType).every((nestedClaimType) => {
                    return this.claims[nestedClaimType](policyClaims[nestedClaimType]);
                });
            } 
            return this.claims[claimType](policyClaims[claimType]);
        });
    }
  
}