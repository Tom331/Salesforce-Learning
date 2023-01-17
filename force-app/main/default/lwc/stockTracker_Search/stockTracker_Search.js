import { LightningElement, track } from 'lwc';
import searchStock from '@salesforce/apex/StockTrackerService.searchStock';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';


export default class StockTracker_Search extends LightningElement {

    @track stockSearchResults; 
    @track stockSymbol; 
    @track isResultsFound = false; 
    @track isSymbolTooShort = true; 

    searchStockSymbol() {
        console.log('Search: searchStockSymbol()');

        searchStock({ stockSymbol: this.stockSymbol })
            .then(result => {
                this.stockSearchResults = result;
                if(this.stockSearchResults.length == 0) {
                    this.isResultsFound = false; 
                    console.log('no match found');
                    this.showToast('Symbol Not Found', 'No match for: ' + this.stockSymbol, 'error');
                } else {
                    console.log('success1!');
                    this.stockSearchResults = result;
                    this.isResultsFound = true; 
                }
            })
            .catch(error => {
                this.error = error;
                console.error(error);
            });
    }

    handleStockSymbolChange(event) {
        this.stockSymbol = event.target.value; 
        if(this.stockSymbol.length >= 2) {
            this.isSymbolTooShort = false; 
        } else {
            this.isSymbolTooShort = true; 
        }

        if(event.which == 13) { // enter key pressed
            this.searchStockSymbol(this.stockSymbol);
        }
    }

    handleAddToDashboard(event) {
        let name = event.target.dataset.name;
        let symbol = event.target.dataset.symbol;
        let type = event.target.dataset.type;

        const addToDashboardEvent = new CustomEvent("addtodashboard", {
            detail: { 
                name: name,
                symbol: symbol,
                type: type
             }
          });
          // Fire the custom event
          this.dispatchEvent(addToDashboardEvent);
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }

}