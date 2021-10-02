/*
    This class contains apex helper methods for the returnsLWC component
*/
public with sharing class RefundsConsoleController {
   
    /*
    * Returns true if the specified contact owns the specified product
    * Ownership is represented via asset
    *
    * @param   contactId   Represents the contact owning an asset
    * @param   productId   Represents the product  related to an asset
    */
    @AuraEnabled(cacheable=true)
    public static Boolean ContactOwnsAsset(Id contactId, Id productId){
        try {
            List<Asset> queriedAssets = new List<Asset>();
            queriedAssets = [SELECT Id FROM Asset WHERE Product2Id =: productId AND ContactId =: contactId];

            return !queriedAssets.isEmpty();
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
   }
}
