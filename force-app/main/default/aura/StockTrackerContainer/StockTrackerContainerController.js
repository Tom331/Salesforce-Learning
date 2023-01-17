({
    getValueFromLwc : function(component, event, helper) {
        // DEPLOY ALL: 
        // sfdx force:source:deploy -p ".\force-app\main\default\aura\StockTrackerContainer, .\force-app\main\default\lwc\stockTracker_Search, .\force-app\main\default\lwc\stockTracker_Dashboard, .\force-app\main\default\classes\StockTrackerService.cls"
        let companyName = event.getParam('name');
        let stockSymbol = event.getParam('symbol');
        let stockType = event.getParam('type');

        console.log('companyName: ' + companyName);
        console.log('stockSymbol: ' + stockSymbol);
        console.log('stockType: ' + stockType);

		    component.set("v.selectedSymbolValue", stockSymbol);
        let dashboardCmp = component.find("dashboardCmp").getElement();

        dashboardCmp.handleAddToDashboard(companyName, stockSymbol, stockType);
	}
})
