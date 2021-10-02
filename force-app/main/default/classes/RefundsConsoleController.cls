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
       
        //Write into a list of assets to avoid an exception if no results are returned
        List<Asset> queriedAssets = new List<Asset>();
        queriedAssets = [SELECT Id FROM Asset WHERE Product2Id =: productId AND ContactId =: contactId];

        return !queriedAssets.isEmpty();

   }

    /*
    * Returns the value to be refunded based on the purchase price listed on the asset
    *
    * @param   contactId   Represents the contact owning an asset
    * @param   productId   Represents the product  related to an asset
    */
    @AuraEnabled(cacheable=true)
    public static Decimal GetRefundAmount(Id contactId, Id productId){

        //Write into a list of assets to avoid an exception if no results are returned
        List<Asset> queriedAssets = new List<Asset>();
        queriedAssets = [SELECT Id, Price FROM Asset WHERE Product2Id =: productId AND ContactId =: contactId];

        return queriedAssets.isEmpty() ? null : queriedAssets[0].Price;
   }
}
