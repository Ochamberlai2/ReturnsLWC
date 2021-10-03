import { LightningElement, api } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { NavigationMixin } from "lightning/navigation";
import { createRecord } from "lightning/uiRecordApi";
import LANG from "@salesforce/i18n/lang";
import DIR from "@salesforce/i18n/dir";
//Methods
import ContactOwnsAsset from "@salesforce/apex/RefundsConsoleController.ContactOwnsAsset";
import ContactHasRefundedProduct from "@salesforce/apex/RefundsConsoleController.ContactHasRefundedProduct";
import GetRefundAmount from "@salesforce/apex/RefundsConsoleController.GetRefundAmount";

//Utils
import { addDays } from "./utils";

//Objects
import REFUND_PAYMENT_OBJECT from "@salesforce/schema/Refund_Payment__c";

//Fields
import REFUND_REQUEST_CONTACT_FIELD from "@salesforce/schema/Refund_Request__c.Contact__c";
import REFUND_REQUEST_ITEM_NAME_FIELD from "@salesforce/schema/Refund_Request__c.Item_name__c";
import REFUND_REQUEST_RETURN_DATE_FIELD from "@salesforce/schema/Refund_Request__c.Return_Date__c";
import REFUND_REQUEST_RETURN_REASON_FIELD from "@salesforce/schema/Refund_Request__c.Return_Reason__c";
import REFUND_REQUEST_ADDITIONAL_NOTES_FIELD from "@salesforce/schema/Refund_Request__c.Additional_Notes__c";
import REFUND_PAYMENT_AMOUNT_FIELD from "@salesforce/schema/Refund_Payment__c.Amount__c";
import REFUND_PAYMENT_REFUND_DATE_FIELD from "@salesforce/schema/Refund_Payment__c.Refund_Date__c";
import REFUND_PAYMENT_REFUND_REQUEST_FIELD from "@salesforce/schema/Refund_Payment__c.Refund_Request__c";

export default class ReturnsLWC extends NavigationMixin(LightningElement) {
  @api recordId;
  @api objectApiName;

  //Configuration Props
  @api refundDelayTime;

  //local variables
  recordHasBeenSaved = false;
  refundRequestFields;
  refundRequestId;
  lang = LANG;
  dir = DIR;

  //expose object fields
  fields = [
    REFUND_REQUEST_CONTACT_FIELD,
    REFUND_REQUEST_ITEM_NAME_FIELD,
    REFUND_REQUEST_RETURN_DATE_FIELD,
    REFUND_REQUEST_RETURN_REASON_FIELD,
    REFUND_REQUEST_ADDITIONAL_NOTES_FIELD
  ];

  async handleSuccess(event) {
    const { Contact__c, Item_Name__c } = event.detail.fields;
    console.log(Contact__c, Item_Name__c);
    const createdRecordId = this.template.querySelector(
      "lightning-record-form"
    ).recordId;
    this.refundRequestId = createdRecordId;

    try {
      const refundRecord = await this.createRefundRecord(createdRecordId);

      //Use NavigationMixin to generate a navlink for the toast
      const refundRequestNavURL = await this.getNavURL(createdRecordId);
      const refundPaymentNavURL = await this.getNavURL(refundRecord?.id);

      //Create toast
      const evt = new ShowToastEvent({
        title: "Success!",
        message:
          "Refund request created! Click {0} to see the refund request or {1} to see the refund payment.",
        variant: "success",
        messageData: [
          {
            url: refundRequestNavURL,
            label: "here"
          },
          {
            url: refundPaymentNavURL,
            label: "here"
          }
        ]
      });
      this.dispatchEvent(evt);

      //Reset the form
      this.template.querySelector("lightning-record-form").recordId = null;
      this.recordHasBeenSaved = true;
    } catch (e) {
      console.error(e.body);
    }
  }

  async handleSubmit(event) {
    event.preventDefault();
    const { Contact__c, Item_Name__c } = event.detail.fields;
    try {
      const validInput = await this.validateInput(Contact__c, Item_Name__c);

      if (!validInput) return;

      this.refundRequestFields = event.detail.fields;
      //Submit the form
      this.template
        .querySelector("lightning-record-form")
        .submit(event.detail.fields);
    } catch (e) {
      console.error(e.body);
      throw e;
    }
  }

  async validateInput(contactId, itemName) {
    const ownsAsset = await ContactOwnsAsset({
      contactId: contactId,
      productId: itemName
    });

    if (!ownsAsset) {
      const evt = new ShowToastEvent({
        title: "Error!",
        message: "This contact does not own the selected product!",
        variant: "error"
      });
      this.dispatchEvent(evt);
      return false;
    }

    const hasRefunded = await ContactHasRefundedProduct({
      contactId: contactId,
      productId: itemName
    });

    if (hasRefunded) {
      const evt = new ShowToastEvent({
        title: "Error!",
        message: "This contact has already refunded this product!",
        variant: "error"
      });
      this.dispatchEvent(evt);
      return false;
    }
    return true;
  }

  async getNavURL(recordId) {
    return this[NavigationMixin.GenerateUrl]({
      type: "standard__recordPage",
      attributes: {
        recordId: recordId,
        actionName: "view"
      }
    });
  }

  async createRefundRecord(refundRequestId) {
    //Get the data required to create the field
    const { Return_Date__c, Contact__c, Item_Name__c } =
      this.refundRequestFields;
    const refundAmount = await GetRefundAmount({
      contactId: Contact__c,
      productId: Item_Name__c
    });
    try {
      //set the field values
      const fields = {};
      fields[REFUND_PAYMENT_REFUND_DATE_FIELD.fieldApiName] = addDays(
        new Date(Return_Date__c),
        this.refundDelayTime
      );
      fields[REFUND_PAYMENT_AMOUNT_FIELD.fieldApiName] = refundAmount;
      fields[REFUND_PAYMENT_REFUND_REQUEST_FIELD.fieldApiName] =
        refundRequestId;
      const recordInput = {
        apiName: REFUND_PAYMENT_OBJECT.objectApiName,
        fields
      };

      //Create the records
      const refundPaymentRecord = await createRecord(recordInput);
      return refundPaymentRecord;
    } catch (e) {
      console.error(e.body);
    }
    return null;
  }

  handleRatingCompletion() {
    //Completion event returns true when completed.
    //We want the inverse of this to reset the form
    this.recordHasBeenSaved = false;
    this.refundRequestId = null;
  }
}
