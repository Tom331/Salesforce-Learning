import { LightningElement, track } from 'lwc';
import searchStock from '@salesforce/apex/StockTrackerService.searchStock';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';


export default class StockTracker_Search extends LightningElement {

    @track stockSearchResults; 
    @track stockSymbol; 

    searchStockSymbol() {
        console.log('got here 1');
        console.log('final stockSymbol: ' + this.stockSymbol);

        searchStock({ stockSymbol: this.stockSymbol })
            .then(result => {
                this.stockSearchResults = result;

                console.log('this.stockSearchResults: ' + this.stockSearchResults);
                console.log('this.stockSearchResults S: ' + JSON.stringify(this.stockSearchResults));
                console.log('this.stockSearchResults.length: ' + this.stockSearchResults.length);
                

                if(result === null) {
                    console.log('no match found');
                    this.showToast('Symbol Not Found', 'No match was found for the symbol: ' + this.stockSymbol, 'error');
                } else {
                    console.log('sucess!');
                    for(let i = 0; i < this.stockSearchResults.length; i++) {
                        let currentStock = this.stockSearchResults[i];
                        console.log('currentStock.companyName: ' + currentStock.companyName);
                        console.log('currentStock.stockSymbol: ' + currentStock.stockSymbol);
                        console.log('currentStock.stockType: ' + currentStock.stockType);
                    }
                }
            })
            .catch(error => {
                this.error = error;
                console.error(error);
            });
    }

    handleStockSymbolChange(event) {
        this.stockSymbol = event.target.value; 
        console.log('stockSymbol: ' + this.stockSymbol);
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