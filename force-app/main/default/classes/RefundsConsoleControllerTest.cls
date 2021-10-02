@IsTest
public with sharing class RefundsConsoleControllerTest {


    /*
     * Input: A contact Id and a product which is linked to an asset 
     * Expected output: True
     */
    @IsTest
    static void contactOwnsAsset(){
        //Setup
        Contact contact = [SELECT Id FROM Contact LIMIT 1];
        Product2 product1 = [SELECT Id FROM Product2 WHERE Name='Product 1' LIMIT 1];
        //Execution
        Boolean hasProduct = RefundsConsoleController.ContactOwnsAsset(contact.Id, product1.Id);

        //Assertions
        System.assertEquals(true, hasProduct, 'The contact does not own the specified product');
    }

    /*
     * Input: A contact Id and a product which is not linked to an asset 
     * Expected output: False
     */
    @IsTest
    static void contactDoesntOwnAsset(){
        //Setup
        Contact contact = [SELECT Id FROM Contact LIMIT 1];
        Product2 product2 = [SELECT Id FROM Product2 WHERE Name='Product 2' LIMIT 1];
        //Execution
        Boolean hasProduct = RefundsConsoleController.ContactOwnsAsset(contact.Id, product2.Id);
        
        //Assertions
        System.assertEquals(false, hasProduct, 'The contact owns the specified product');
    }

    @TestSetup
    static void testSetup(){

        //Create account
        Account account = new Account(Name='Test Account');
        insert account;

        //Create contact
        Contact contact = new Contact(FirstName='John', LastName='Doe', AccountId=account.Id);
        insert contact;

        //Create two products
        Product2 product1 = new Product2(Name='Product 1', IsActive=true);
        insert product1;
        Product2 product2 = new Product2(Name='Product 2', IsActive=true);
        insert product2;

        //Create one asset
        Asset asset1 = new Asset(Name='Asset 1', Product2Id=product1.Id, ContactId=contact.Id);
        insert asset1;
    }

}
