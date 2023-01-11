public with sharing class StockTrackerService {

    public static final String FINNHUB_SEARCH_ENDPOINT = 'https://finnhub.io/api/v1/search'; 

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

    public class StockQuoteResult {
        String stockName;
        String stockSymbol; 
        Decimal stockPrice; 

        public StockQuoteResult(String stockName, String stockSymbol, Decimal stockPrice) {
            this.stockName = stockName;
            this.stockSymbol = stockSymbol;
            this.stockPrice = stockPrice;
        }
    }
    
    @AuraEnabled(cacheable=true)
    public static List<StockSearchResult> searchStock(String stockSymbol){
        try {
            System.debug('stockSymbol: ' + stockSymbol);
            StockTrackerSettings__mdt stockTrackerSetting = StockTrackerSettings__mdt.getInstance('StockTrackerCreds');
            String token = stockTrackerSetting.token__c; 
            String stockSymbolEndpoint = FINNHUB_SEARCH_ENDPOINT;
            stockSymbolEndpoint += '?q=' + stockSymbol; 
            stockSymbolEndpoint += '&token=' + token; 
            System.debug('stockSymbolEndpoint: ' + stockSymbolEndpoint);

            HttpRequest req = new HttpRequest();
            req.setEndpoint(stockSymbolEndpoint);
            
            req.setMethod('GET');
            Http http = new Http();
            HTTPResponse res = http.send(req);
            System.debug(res.getBody());

            Map<String, Object> result = (Map<String, Object>)JSON.deserializeUntyped(res.getBody()); 
            System.debug('result: ' + result);
            List<Object> stockObjects = (List<Object>)result.get('result');
            System.debug('stockObjects: ' + stockObjects);

            List<StockSearchResult> SSRs = new List<StockSearchResult>(); 
            for(Object stockObj : stockObjects) {
                System.debug('stockObj: ' + stockObj);
                Map<String, Object> stock = (Map<String, Object>)stockObj;
                System.debug('stock.get("symbol"): ' + stock.get('symbol'));
                String currentSymbol = (String)stock.get('symbol');
                // if(currentSymbol.equalsIgnoreCase(stockSymbol)) {
                StockSearchResult ssr = new StockSearchResult((String)stock.get('description'), (String)stock.get('symbol'), (String)stock.get('type')); 
                System.debug('ssr: ' + ssr);
                SSRs.add(ssr); 
                //}
            }

            return SSRs; 

            
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}
