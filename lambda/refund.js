const axios = require('axios');

const key = process.env.VTEX_KEY;
const token =  process.env.VTEX_TOKEN;
const baseURL = process.env.BASE_URL;
const invoiceUrl = process.env.LINKEDIN_MARI;
const errorRefund = process.env.ERROR_REFUND;
const errorNotInvoiced = process.env.ERROR_NOT_INVOICED;

const headers = {
  accept: 'application/json',
  'content-type': 'application/json',
  'x-vtex-api-appkey': key,
  'x-vtex-api-apptoken': token
};

const instance = axios.create({
  baseURL,
  headers,
  timeout: 1000
});
  
module.exports.handler = async (event) => {
  const slots = event.currentIntent.slots
  const intentName = event.currentIntent.name;
  const id = slots['OrderID'];
  const confirmation = slots['Confirmation'];
  
  if (confirmation === "no" || id === 'exit') {
    const message = "Ok, I'm cancelling your request. I'll be here if you need me! :)";
    return close(message, "Fulfilled");
  }
  else {
    try {
      const { data } = await instance.get(`/orders/${id}`);
      const item = data.items[0];
      
      await instance.post(
        `/orders/${id}/invoice`,
        {
          type: "Input",
          issuanceDate: new Date().toISOString().split('.')[0],
          invoiceNumber: `NFe-0${Date.now().toString().slice(0, 8)}`,
          invoiceValue: data.value.toString(),
          invoiceUrl,
          items: [
            {
              id: item.uniqueId,
              price: item.price,
              quantity: item.quantity
            }
          ]
        }
      );
        
      const message = "Successfully refunded! Sorry for the inconvenience and have a nice day!";
      return close(message, "Fulfilled");
      
    } catch (error) {
      let message = "Refunded failed. Sorry for the inconvenience, please contact the support!";
      if(error.response) {
        const errorMessage = error.response.data.error.message;
        const errorStatus = error.response.status;
        message = errorMessage === errorRefund ? "Hmm... It seems that this order has already been refunded :)" : message;
        message = errorMessage === errorNotInvoiced ? "Sorry, this order hasn`t been invoiced yet. Try again later :/" : message;
        
        if (errorStatus === 404) {
          const message = "I'm not able to find your Order ID. Did you typed it correctly? Try again or type 'exit' to cancel.";
          return elicit_slot(message, intentName, slots, "OrderID");
        }
      }
      
      return close(message, "Failed");
    }
  }
};

function close(message, fulfillmentState) {
  return {
    dialogAction: {
      type: "Close",
      fulfillmentState,
      message: {
        contentType: "PlainText",
        content: message
      }
    }
  };
}

function elicit_slot(message, intentName, slots, slotToElicit) {
  return {
    dialogAction: {
      type: "ElicitSlot",
      message: {
        contentType: "PlainText",
        content: message
      },
      intentName,
      slots,
      slotToElicit
    }
  };
}