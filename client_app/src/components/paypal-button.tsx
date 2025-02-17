import React from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { paymentService } from '@/services/api';
import { toast } from 'sonner';

interface PayPalComponentProps {
  amount: number;
  appointmentId: string;
  onSuccess?: () => void;
}

const PayPalComponent = ({
  amount,
  appointmentId,
  onSuccess
}: PayPalComponentProps) => {
  console.log({ amount });
  return (
    <PayPalScriptProvider
      options={{
        clientId:
          'AeOyoU1R7DSdegMaH-XLmmcOYywR83M3oMowvQE1-l3es9zbVfifqLodpD44m0uPCEgk3PLXu7DleiHw',
        currency: 'PHP'
      }}>
      <div className="w-full">
        <PayPalButtons
          style={{
            layout: 'horizontal',
            color: 'gold',
            shape: 'rect',
            label: 'pay'
          }}
          createOrder={async (data, actions) => {
            return actions.order.create({
              purchase_units: [
                {
                  amount: {
                    value: amount.toString()
                  }
                }
              ]
            });
          }}
          onApprove={async (data, actions) => {
            if (!actions.order) return;

            try {
              const details = await actions.order.capture();

              // Create payment record
              await paymentService.create({
                appointmentId: parseInt(appointmentId),
                payment_method: 'paypal',
                transaction_id: details.id,
                amount: amount,
                status: 'completed'
              });

              toast.success('Payment successful!');
              onSuccess?.();
            } catch (error) {
              console.error('Payment error:', error);
              toast.error('Payment failed. Please try again.');
            }
          }}
          onError={err => {
            console.error('PayPal error:', err);
            toast.error('Payment failed. Please try again.');
          }}
        />
      </div>
    </PayPalScriptProvider>
  );
};

export default PayPalComponent;
