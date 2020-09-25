const axios = require('axios');

const KEY = process.env.VTEX_KEY;
const TOKEN =  process.env.VTEX_TOKEN;
const baseURL = process.env.BASE_URL;
const invoiceUrl = process.env.LINKEDIN_MARI;
const errorRefund = process.env.ERROR_REFUND;
const errorNotInvoiced = process.env.ERROR_NOT_INVOICED;
const potatoLogUrl = process.env.POTATO_LOG_URL;

const headers = {
  accept: 'application/json',
  'content-type': 'application/json',
  'x-vtex-api-appkey': KEY,
  'x-vtex-api-apptoken': TOKEN
};

const instance = axios.create({
  baseURL,
  headers
});

const potatoLog = axios.create({
  baseURL: potatoLogUrl
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
      
      const dataPotatoLog = await potatoLog.post('/gerar', {
        transaction_id: data.paymentData.transactions[0].transactionId,
        order_id: id,
        name: item.uniqueId,
        price: item.price,
        quantity: item.quantity
      });
      
      
      const post_auth_number = dataPotatoLog.data.numero_coleta;
      const message = `Keep this number ${post_auth_number} so you can present it when shipping the products back to us. Therefore, you will have no extra cost returning them. It is all on us :) Sorry for the inconvenience and I hope to see you back around here ;)!`;
      
      return close(message, "Fulfilled");
      
    } catch (error) {
      if(error.response && error.response.status === 404) {
        const message = "I'm not able to find your Order ID. Did you typed it correctly? Try again or type 'exit' to cancel.";
        return elicit_slot(message, intentName, slots, "OrderID");
      }
      
      return close("Refunded failed. Sorry for the inconvenience, please contact the support!", "Failed");
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