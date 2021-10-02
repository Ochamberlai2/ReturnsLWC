import { LightningElement, api } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { NavigationMixin } from "lightning/navigation";
//Methods
import ContactOwnsAsset from "@salesforce/apex/RefundsConsoleController.ContactOwnsAsset";

//Fields
import REFUND_REQUEST_CONTACT_FIELD from "@salesforce/schema/Refund_Request__c.Contact__c";
import REFUND_REQUEST_ITEM_NAME_FIELD from "@salesforce/schema/Refund_Request__c.Item_name__c";
import REFUND_REQUEST_RETURN_DATE_FIELD from "@salesforce/schema/Refund_Request__c.Return_Date__c";
import REFUND_REQUEST_ADDITIONAL_NOTES_FIELD from "@salesforce/schema/Refund_Request__c.Additional_Notes__c";
export default class ReturnsLWC extends NavigationMixin(LightningElement) {
  @api recordId;
  @api objectApiName;

  //expose object fields
  fields = [
    REFUND_REQUEST_CONTACT_FIELD,
    REFUND_REQUEST_ITEM_NAME_FIELD,
    REFUND_REQUEST_RETURN_DATE_FIELD,
    REFUND_REQUEST_ADDITIONAL_NOTES_FIELD
  ];

  async handleSuccess() {
    const createdRecordId = this.template.querySelector(
      "lightning-record-form"
    ).recordId;

    //Use NavigationMixin to generate a navlink for the toast
    const navigationURL = await this[NavigationMixin.GenerateUrl]({
      type: "standard__recordPage",
      attributes: {
        recordId: createdRecordId,
        actionName: "view"
      }
    });

    //Create toast
    const evt = new ShowToastEvent({
      title: "Success!",
      message: "Refund request created! Click {0} to see it.",
      variant: "success",
      messageData: [
        {
          url: navigationURL,
          label: "here"
        }
      ]
    });
    this.dispatchEvent(evt);

    //TODO: Use this code on completion of the whole form
    //Reset the form
    // this.template.querySelector("lightning-record-form").recordId = null;
  }

  async handleSubmit(event) {
    event.preventDefault();
    const { Contact__c, Item_Name__c } = event.detail.fields;
    try {
      const ownsAsset = await ContactOwnsAsset({
        contactId: Contact__c,
        productId: Item_Name__c
      });

      if (!ownsAsset) {
        const evt = new ShowToastEvent({
          title: "Error!",
          message: "This contact does not own the selected product!",
          variant: "error"
        });
        this.dispatchEvent(evt);
        return;
      }
      //Submit the form
      this.template
        .querySelector("lightning-record-form")
        .submit(event.detail.fields);
    } catch (e) {
      console.error(e.body);
    }
  }
}
