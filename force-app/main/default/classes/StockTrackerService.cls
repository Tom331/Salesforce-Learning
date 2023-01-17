public with sharing class StockTrackerService {

    public class StockSearchResult {
        @auraEnabled
        public String companyName;
        @auraEnabled
        public String stockSymbol; 
        @auraEnabled
        public String stockType; 

        public StockSearchResult(String companyName, String stockSymbol, String stockType) {
            this.companyName = companyName;
            this.stockSymbol = stockSymbol;
            this.stockType = stockType;
        }
    }
    
    @AuraEnabled(cacheable=true)
    public static List<StockSearchResult> searchStock(String stockSymbol) {
        try {
            List<StockSearchResult> SSRs = StockTrackerCallouts.getStockInfoCallout(stockSymbol); //callout to Finhubb 'Symbol' endpoint
            return SSRs; 
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static String subscribeStock(String companyName, String stockSymbol, String stockType) {
        try {    
            String result = 'unknown'; 

            //SOQL Injection prevented by using a bind variable. documentation: https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/pages_security_tips_soql_injection.htm
            List<Stock__c> stocks = [SELECT Name, Symbol__c, Price__c FROM Stock__c WHERE Symbol__c = :stockSymbol LIMIT 1];
            
            Stock__c stockToSubscribe; 
            if(stocks.isEmpty()) {
                Decimal price = StockTrackerCallouts.getStockPriceCallout(stockSymbol); //callout to Finhubb 'Quote' endpoint
                Stock__c newStock = new Stock__c ( 
                    Name = companyName,
                    Price__c = price,
                    Symbol__c = stockSymbol,
                    Type__c = stockType
                );
                insert newStock; 
                stockToSubscribe = newStock;
            } else {
                stockToSubscribe = stocks[0];
            }

            Watch_List__c currentUserWatchlist = [SELECT Id, Name FROM Watch_List__c WHERE User__c = :UserInfo.getUserId() LIMIT 1]; //todo: allow multiple watch lists

            List<Stock_Subscription__c> duplicateSubscriptions = [SELECT Stock__r.Symbol__c FROM Stock_Subscription__c 
                WHERE Watch_List__r.User__c = :UserInfo.getUserId() AND Stock__r.Symbol__c = :stockToSubscribe.Symbol__c];
            if(!duplicateSubscriptions.isEmpty()) {
                throw new AlreadySubscribedException('You have already subscribed to this stock');
            }

            Stock_Subscription__c stockSub = new Stock_Subscription__c(
                Name = UserInfo.getName() + '->' + stockToSubscribe.Name.abbreviate(35),
                Stock__c = stockToSubscribe.Id,
                Watch_List__c = currentUserWatchlist.Id
            );
            insert stockSub;
            
            result = 'success';
            return result; 
            
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static List<Stock_Subscription__c> loadDashboard(){
        try {
            List<Stock_Subscription__c> subscribedStocks = [SELECT Id, Stock__r.Name, Stock__r.Price__c, Stock__r.Symbol__c, Buy_Price__c, Sell_Price__c 
                FROM Stock_Subscription__c WHERE Watch_List__r.User__c = :UserInfo.getUserId()];
            return subscribedStocks; 
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    public class AlreadySubscribedException extends Exception {}

}