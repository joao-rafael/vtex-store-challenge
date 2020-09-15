const axios = require('axios');

const key = process.env.VTEX_KEY;
const token =  process.env.VTEX_TOKEN;
const baseUrl = process.env.BASE_URL;
const invoiceUrl = process.env.LINKEDIN_MARI;
const errorRefund = process.env.ERROR;

const headers = {
  accept: 'application/json',
  'content-type': 'application/json',
  'x-vtex-api-appkey': key,
  'x-vtex-api-apptoken': token
}
  
module.exports.handler = async (event) => {
  const id = event.currentIntent.slots['OrderID'];
  const confirmation = event.currentIntent.slots['Confirmation'];
  
  if (confirmation === "no") {
    return {
      dialogAction: {
        type: "Close",
        fulfillmentState: "Fulfilled",
          message: {
              contentType: "PlainText",
              content: "Ok, I'm canceling your request. I'll be here if you need me! :)"
          }
      }
    }
  }
  else {
    try {
      const { data } = await axios.get(`${baseUrl}/oms/pvt/orders/${id}`, { headers });
      const item = data.items[0];
      
      await axios.post(
        `${baseUrl}/oms/pvt/orders/${id}/invoice`,
        {
          type: "Input",
          issuanceDate: new Date().toISOString().split('.')[0],
          invoiceNumber: `NFe-0${Date.now().toString().slice(0, 8)}`,
          invoiceValue: data.value.toString(),
          invoiceUrl,
          items: [
            {
              id: item.uniqueId,
              price: parseInt(item.price),
              quantity: parseInt(item.quantity)
            }
          ]
        },
        { headers }
      );
        
      return {
        dialogAction: {
          type: "Close",
          fulfillmentState: "Fulfilled",
            message: {
                contentType: "PlainText",
                content: "Successfully refunded! Sorry for the inconvenience and have a nice day!"
            }
        }
      }
    } catch (error) {
      let message = "Refunded failed. Sorry for the inconvenience, please contact the support!";
      if(error.response) {
        const errorMessage = error.response.data.error.message
        message = errorMessage === errorRefund ? "Hmm... It seems that this order has already been refunded :)" : message
        message = error.response.status === 404 ? "I'm not able to find your Order ID. Did you typed it correctly?": message
      }
      
      return {
        dialogAction: {
          type: "ElicitSlot",
          fulfillmentState: "Failed",
            message: {
                contentType: "PlainText",
                content: message
            }
        }
      }
    }
  }
};