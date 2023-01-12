import { LightningElement, track } from 'lwc';
import searchStock from '@salesforce/apex/StockTrackerService.searchStock';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';


export default class StockTracker_Search extends LightningElement {

    @track stockSearchResults; 
    @track stockSymbol; 
    @track isResultsFound = false; 
    @track isSymbolTooShort = true; 

    searchStockSymbol() {
        console.log('final stockSymbol: ' + this.stockSymbol);

        searchStock({ stockSymbol: this.stockSymbol })
            .then(result => {
                this.stockSearchResults = result;

                if(this.stockSearchResults.length == 0) {
                    this.isResultsFound = false; 
                    console.log('no match found');
                    this.showToast('Symbol Not Found', 'No match for: ' + this.stockSymbol, 'error');
                } else {
                    console.log('sucess!');
                    this.isResultsFound = true; 
                    for(let i = 0; i < this.stockSearchResults.length; i++) {
                        let currentStock = this.stockSearchResults[i];
                    }
                }
            })
            .catch(error => {
                this.error = error;
                console.error(error);
            });
    }

    handleStockSymbolChange(event) {
        console.log('event.target.value: ' + event.target.value);
        this.stockSymbol = event.target.value; 
        console.log('this.stockSymbol: ' + this.stockSymbol);
        console.log('this.stockSymbol.length: ' + this.stockSymbol.length);
        if(this.stockSymbol.length >= 2) {
            this.isSymbolTooShort = false; 
        } else {
            this.isSymbolTooShort = true; 
        }

        if(event.which == 13 && !this.isSymbolTooShort) { // enter key pressed
            console.log('enter key pressed');
            this.searchStockSymbol(this.stockSymbol);
        }
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