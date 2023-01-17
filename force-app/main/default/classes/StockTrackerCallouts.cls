public with sharing class StockTrackerCallouts {

    public static final String FINNHUB_SEARCH_ENDPOINT = 'https://finnhub.io/api/v1/search'; 
    public static final String FINNHUB_PRICE_ENDPOINT = 'https://finnhub.io/api/v1/quote'; 
    
    public static List<StockTrackerService.StockSearchResult> getStockInfoCallout(String stockSymbol) {
        StockTrackerSettings__mdt stockTrackerSetting = StockTrackerSettings__mdt.getInstance('StockTrackerCreds');
        String token = stockTrackerSetting.token__c; 
        String stockSymbolEndpoint = FINNHUB_SEARCH_ENDPOINT;
        stockSymbolEndpoint += '?q=' + stockSymbol; 
        stockSymbolEndpoint += '&token=' + token; 

        HttpRequest req = new HttpRequest();
        req.setEndpoint(stockSymbolEndpoint);
        req.setMethod('GET');
        Http http = new Http();
        HTTPResponse res = http.send(req);

        Map<String, Object> result = (Map<String, Object>)JSON.deserializeUntyped(res.getBody()); 
        List<Object> stockObjects = (List<Object>)result.get('result');

        List<StockTrackerService.StockSearchResult> SSRs = new List<StockTrackerService.StockSearchResult>(); 
        for(Object stockObj : stockObjects) {
            Map<String, Object> stock = (Map<String, Object>)stockObj;
            String currentSymbol = (String)stock.get('symbol');
            if(!currentSymbol.contains('.')) {
                StockTrackerService.StockSearchResult ssr = new StockTrackerService.StockSearchResult((String)stock.get('description'), (String)stock.get('symbol'), (String)stock.get('type')); 
            SSRs.add(ssr); 
            }
        }

        return SSRs; 
    }

    public static Decimal getStockPriceCallout(String stockSymbol) {
        StockTrackerSettings__mdt stockTrackerSetting = StockTrackerSettings__mdt.getInstance('StockTrackerCreds'); 
        String token = stockTrackerSetting.token__c; 
        String stockSymbolEndpoint = FINNHUB_PRICE_ENDPOINT; 
        stockSymbolEndpoint += '?symbol=' + stockSymbol; 
        stockSymbolEndpoint += '&token=' + token; 

        HttpRequest req = new HttpRequest();
        req.setEndpoint(stockSymbolEndpoint);
        req.setMethod('GET');
        Http http = new Http();
        HTTPResponse res = http.send(req);

        Map<String, Object> result = (Map<String, Object>)JSON.deserializeUntyped(res.getBody()); 
        Decimal price = (Decimal)result.get('c');

        return price; 
    }

    
}