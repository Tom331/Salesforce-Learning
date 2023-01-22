public with sharing class ContactController {
    
    @AuraEnabled(cacheable=true)
    public static List<Contact> getContacts() {
        List<Contact> cons = [SELECT FirstName, LastName, Email FROM Contact]; 
        System.debug('cons: ' + cons);
        return cons; 
    }
}