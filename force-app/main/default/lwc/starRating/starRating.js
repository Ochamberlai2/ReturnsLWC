import { LightningElement, api } from "lwc";
import { createRecord } from "lightning/uiRecordApi";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import UID from "@salesforce/user/Id";
import LANG from "@salesforce/i18n/lang";
import DIR from "@salesforce/i18n/dir";

//Objects
import AGENT_REVIEW_OBJECT from "@salesforce/schema/Agent_Review__c";

//Fields
import AGENT_REVIEW_AGENT_FIELD from "@salesforce/schema/Agent_Review__c.Agent__c";
import AGENT_REVIEW_STAR_RATING_FIELD from "@salesforce/schema/Agent_Review__c.Star_Rating__c";
import AGENT_REVIEW_REFUND_REQUEST_FIELD from "@salesforce/schema/Agent_Review__c.Refund_Request__c";

export default class StarRating extends LightningElement {
  starRating;
  @api refundRequest;

  lang = LANG;
  dir = DIR;

  handleRatingChange(event) {
    this.starRating = event.target.value;
    console.log(this.starRating);
  }

  async createReview() {
    const fields = {};
    const recordInput = { apiName: AGENT_REVIEW_OBJECT.objectApiName, fields };
    fields[AGENT_REVIEW_AGENT_FIELD.fieldApiName] = UID;
    fields[AGENT_REVIEW_STAR_RATING_FIELD.fieldApiName] = this.starRating;
    fields[AGENT_REVIEW_REFUND_REQUEST_FIELD.fieldApiName] = this.refundRequest;

    const reviewRecord = await createRecord(recordInput);

    //Report the status of the create call
    if (reviewRecord === undefined || reviewRecord === null) {
      const evt = new ShowToastEvent({
        title: "Error!",
        message:
          "An error occurred. Please contact your administrator if this issue persists.",
        variant: "error"
      });
      this.dispatchEvent(evt);
      return;
    }
    const evt = new ShowToastEvent({
      title: "Success!",
      message: "Customer review has been created!",
      variant: "success"
    });
    this.dispatchEvent(evt);

    //Propogate event to parent in order to reset the lwc
    const completionEvent = new CustomEvent("completionevent");
    this.dispatchEvent(completionEvent);
  }

  handleKeypress(event) {
    if (event.keycode === 13) {
      this.createReview();
    }
  }
}
