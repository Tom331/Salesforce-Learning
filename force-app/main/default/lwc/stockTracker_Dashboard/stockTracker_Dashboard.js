import { LightningElement, track, api, wire } from 'lwc';
import subscribeStock from '@salesforce/apex/StockTrackerService.subscribeStock';
import loadDashboard from '@salesforce/apex/StockTrackerService.loadDashboard';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { updateRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';

import ID_FIELD from '@salesforce/schema/Stock_Subscription__c.Id';
import BUY_PRICE_FIELD from '@salesforce/schema/Stock_Subscription__c.Buy_Price__c';
import SELL_PRICE_FIELD from '@salesforce/schema/Stock_Subscription__c.Sell_Price__c';


export default class StockTracker_Dashboard extends LightningElement {
    @track data = [];
    //columns = columns;
    rowOffset = 0; 
    saveDraftValues = {}; //temporarily hold the new buy/sell price values
    columns = [
        { label: 'Company Name', fieldName: 'companyname'},
        { label: 'Symbol', fieldName: 'symbol' },
        { label: 'Price', fieldName: 'price', type: 'currency' },
        { label: 'Your Buy Price', fieldName: 'Buy_Price__c', type: 'currency', editable: true, cellAttributes: {class: 'sellOrBuy', iconName: { fieldName: 'buyIcon' }, iconPosition: 'right',} },
        { label: 'Your Sell Price', fieldName: 'Sell_Price__c', type: 'currency', editable: true, cellAttributes: { iconName: { fieldName: 'sellIcon' }} },
    ];
    

    // fires when a component is inserted into the DOM
    connectedCallback() {
        console.log('dashboard: connectedCallback()');
        this.loadDashboardData(); 
    }

    //load dashboard data for current user. 
    loadDashboardData() {
        console.log('dashboard: loadDashboardData()');
        loadDashboard()
            .then(result => {
                //console.log('result stringified: ' + JSON.stringify(result));
                let tempData = []; 
                for(let i = 0; i < result.length; i++) {
                    let currentResult = result[i]; 
                    // console.log('currentResult.Buy_Price__c: ' + currentResult.Buy_Price__c);
                    // console.log('currentResult.Stock__r.Price__c: ' + currentResult.Stock__r.Price__c);
                    // console.log('currentResult.Stock__r.Price__c < currentResult.Buy_Price__c ? action:approval : ' + (currentResult.Stock__r.Price__c < currentResult.Buy_Price__c ? 'action:approval' : ''));
                    let subscriptionObject = {
                        "id": currentResult.Id,
                        "companyname": currentResult.Stock__r.Name,
                        "symbol": currentResult.Stock__r.Symbol__c,
                        "price": currentResult.Stock__r.Price__c,
                        "Buy_Price__c": currentResult.Buy_Price__c ? currentResult.Buy_Price__c : '',
                        "Sell_Price__c": currentResult.Sell_Price__c ? currentResult.Sell_Price__c : '',
                        "buyIcon": currentResult.Stock__r.Price__c < currentResult.Buy_Price__c ? 'utility:check' : '',
                        "sellIcon": currentResult.Stock__r.Price__c > currentResult.Sell_Price__c ? 'action:check' : ''
                    };
                    console.log('subscriptionObject stringified: ' + JSON.stringify(subscriptionObject));
                    console.log('currentResult stringified: ' + JSON.stringify(currentResult));
                    tempData.push(subscriptionObject); 
                    
                }
                this.data = tempData; 
                // console.log('this.data: ' + this.data);
                // console.log('this.data stringified: ' + JSON.stringify(this.data)); 
                
            })
            .catch(error => {
                this.error = error;
                console.error(error);
                this.showToast('Error', error.body.message, 'error');
            })
    }

    handleSave(event) {
        console.log('event.detail.draftValues stringified: ' + JSON.stringify(event.detail.draftValues));
        console.log('event.detail.draftValues[0] stringified: ' + JSON.stringify(event.detail.draftValues[0]));
        let draftValues = event.detail.draftValues[0];
        console.log('draftValues stringified: ' + JSON.stringify(draftValues));
        // const recordInputs = this.saveDraftValues.slice().map(draft => {
        //     const fields = Object.assign({}, draft);
        //     return { fields };
        // });
        let fields = {};
        console.log('got here 1');
        fields[ID_FIELD.fieldApiName] = draftValues.id;
        console.log('got here 2');
        fields[BUY_PRICE_FIELD.fieldApiName] = draftValues.Buy_Price__c;
        console.log('got here 3');
        fields[SELL_PRICE_FIELD.fieldApiName] = draftValues.Sell_Price__c;
        console.log('fields: ' + fields);
        console.log('fields stringified: ' + JSON.stringify(fields));

        let recordInput = { fields };
        //console.log('recordInputs stringified: ' + JSON.stringify(recordInputs));
        console.log('got here 4');

        //SF docs way:
        updateRecord(recordInput)
                .then(() => {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Success',
                            message: 'Subscription updated',
                            variant: 'success'
                        })
                    );
                    // Display fresh data in the form
                    return refreshApex(this.data);
                })
                .catch(error => {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error updating record',
                            message: error.body.message,
                            variant: 'error'
                        })
                    );
                });
            }

 
        // Updating the records using the UiRecordAPi
        // const promises = recordInputs.map(recordInput => updateRecord(recordInput));
        // console.log('got here 2');
        // Promise.all(promises).then(res => {
        //     this.showToast('Success', 'Records Updated Successfully!', 'success', 'dismissable');
        //     this.saveDraftValues = [];
        //     return this.refresh();
        // }).catch(error => {
        //     this.showToast('Error', 'An error occured during save', 'error', 'dismissable');
        //     console.error(error);
        //     console.log('error: ' + error);
        // }).finally(() => {
        //     this.saveDraftValues = [];
        // });
        //}

    // Refresh the table once data updated
    async refresh() {
        await refreshApex(this.data);
    }

    //@api allows parent aura cmp to access methods and properties on this child LWC
    //async allows us to synchronously insert a new stock subscription, and reload the dashboard AFTER it's saved using await
    @api async handleAddToDashboard(companyName, stockSymbol, stockType) {
        console.log('handleAddToDashboard()');
        try {
            //await causes this js to run synchronously, waiting for the server response before continuing
            const result = await subscribeStock({ companyName: companyName, stockSymbol:stockSymbol, stockType:stockType}); 
            if(result == 'success') { //todo: ?
                console.log('success2!');
                this.loadDashboardData(); // retreive updated Stock_Subscription__c data
                
            } else {
                console.log('error');
                this.showToast('Error', 'Stock was not added', 'error');
            }
        } catch(error) {
            this.error = error;
                console.error(error);
                this.showToast('Error', error.body.message, 'error');
        } finally {
            console.log('handleAddToDashboard finally()');
        }
    }

    //OLD ASYNCHRONOUS VERSION OF handleAddToDashboard():
    //@api allows parent aura cmp to access methods and properties on this child LWC
    // @api handleAddToDashboard(companyName, stockSymbol, stockType) {
    //     console.log('handleAddToDashboard()');
    //     subscribeStock({ companyName: companyName, stockSymbol:stockSymbol, stockType:stockType})
    //         .then(result => {
    //             if(result == 'success') { //todo: ?
    //                 console.log('success2!');
    //                 //this.loadDashboardData(); // retreive updated Stock_Subscription__c data
                    
    //             } else {
    //                 console.log('error');
    //                 this.showToast('Error', 'Stock was not added', 'error');
    //             }
    //         })
    //         .catch(error => {
    //             this.error = error;
    //             console.error(error);
    //             this.showToast('Error', error.body.message, 'error');
    //         });
    //}

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }
}