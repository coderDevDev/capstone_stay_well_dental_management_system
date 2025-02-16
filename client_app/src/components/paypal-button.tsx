import React from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import axios from 'axios';
const PayPalComponent = ({ amount }) => {
  return (
    <PayPalScriptProvider
      options={{
        'client-id':
          'AeOyoU1R7DSdegMaH-XLmmcOYywR83M3oMowvQE1-l3es9zbVfifqLodpD44m0uPCEgk3PLXu7DleiHw',
        currency: 'PHP'
      }}>
      <div className="w-full max-w-sm h-16">
        {' '}
        {/* Adjust max width */}
        <PayPalButtons
          style={{
            layout: 'horizontal', // Options: "vertical" or "horizontal"
            color: 'gold', // Options: "blue", "gold", "silver", "black"
            shape: 'rect', // Options: "rect" or "pill"
            label: 'paypal' // Options: "paypal", "checkout", "pay", "buynow"
          }}
          fundingSource="paypal" // Restrict to only PayPal as a funding s
          createOrder={async (data, actions) => {
            // Call the back-end to create the order
            // const response = await axios.post('/create-order', {
            //   amount: '500.00'
            // });
            // return response.data.id; // Order ID from the server
            return actions.order.create({
              purchase_units: [
                {
                  amount: {
                    value: `${amount.toFixed(2).toString()}` // Replace with the actual amount
                  }
                }
              ]
            });
          }}
          onApprove={(data, actions) => {
            return actions.order.capture().then(async details => {
              // create the order and set the status to paid
              console.log({ details });
              // await createOrder(details);
              // alert(`Transaction completed by ${details.payer.name.given_name}`);
            });
          }}
          onError={err => {
            console.error('PayPal Checkout onError', err);
          }}
        />
      </div>
    </PayPalScriptProvider>
  );
};

export default PayPalComponent;
