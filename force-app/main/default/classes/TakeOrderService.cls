public with sharing class TakeOrderService {
    
    @InvocableMethod(label='Get Menu Item Info')
    public static List<Customer_Order__c> getMenuItemInfo(List<Menu_Item__c> menuItems) { // We're only expecting 1 menuItem, but Flows require a List param type
        Menu_Item__c menuItem = menuItems[0];
        System.debug('menuItem.Name ' + menuItem.Name);
        List<Menu_Item_Ingredient_Participation__c> MIIPs = [SELECT Menu_Item__c, Menu_Item__r.Name, Menu_Item_Ingredient__c, Menu_Item_Ingredient__r.Name FROM Menu_Item_Ingredient_Participation__c WHERE Menu_Item__c = :menuItem.Id]; 

        Set<Id> menuItemIngredientIds = new Set<Id>(); 
        for(Menu_Item_Ingredient_Participation__c miip : MIIPs) {
            System.debug('Menu item name: ' + miip.Menu_Item__r.Name + '; ing: ' + miip.Menu_Item_Ingredient__r.Name);
            menuItemIngredientIds.add(miip.Menu_Item_Ingredient__c); 
        }

        //could have just queried Alergen warnings, but wanted to practice a sub-query:
        List<Menu_Item_Ingredient__c> MIIs = [SELECT Name, (SELECT Name FROM Alergen_Warnings__r) FROM Menu_Item_Ingredient__c WHERE Id IN :menuItemIngredientIds]; 

        // combined query: 
        List<Menu_Item_Ingredient__c> menuItemIngredients = [SELECT Name,
                (SELECT Name FROM Alergen_Warnings__r),
                (SELECT Menu_Item_Ingredient__c FROM Menu_Item_Ingredient_Participations__r)
                FROM Menu_Item_Ingredient__c 
                WHERE Id IN 
                (
                    SELECT Menu_Item_Ingredient__c 
                    FROM Menu_Item_Ingredient_Participation__c 
                    WHERE Menu_Item__c = :menuItem.Id
                )
       ];

        String awText = '';
        String ingredientsText = '';

       System.debug('~~~Combined query result~~~\n\n');
       for(Menu_Item_Ingredient__c mii : menuItemIngredients) {
            System.debug('ingredient name: ' + mii.Name); 
            if(mii.Alergen_Warnings__r.size() > 0) { //access alergen warnings for each ingredient via subquery
                for(Alergen_Warning__c aw : mii.Alergen_Warnings__r) {
                    System.debug('alergen warning: ' + aw.Name); 
                    awText += mii.Name + ': ' + aw.Name + '\n';
                }
            }
            ingredientsText += '- ' + mii.Name + '\n';
       }


        
        
        //inefficient but practicing accessing subquery variables:
        // for(Menu_Item_Ingredient__c mii : MIIs) { //access ingredients
        //     if(mii.Alergen_Warnings__r.size() > 0) { //access alergen warnings for each ingredient via subquery
        //         for(Alergen_Warning__c aw : mii.Alergen_Warnings__r) {
        //             awText += mii.Name + ': ' + aw.Name + '; ';
        //         }
        //     }
        //     ingredientsText += '- ' + mii.Name + '\n';
        // }
        
        Customer_Order__c co = new Customer_Order__c(
            Menu_Item__c = menuItem.Id, 
            Alergen_Warnings__c = awText, 
            Ingredients__c = ingredientsText
        );

        //insert co; 

        return new List<Customer_Order__c> {co}; // Flow requires a List return type
    }

}
