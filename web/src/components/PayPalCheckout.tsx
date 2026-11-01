import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { useRef } from 'react';
import { authorizePayment, createPayment, type PaymentView } from '../api';

type PayPalCheckoutProps = {
  clientId: string;
  payeeName: string;
  amount: number;
  note: string;
  onDone: (payment: PaymentView) => void;
  onError: (message: string) => void;
};

export function PayPalCheckout({
  clientId,
  payeeName,
  amount,
  note,
  onDone,
  onError,
}: PayPalCheckoutProps) {
  const paymentId = useRef<string | null>(null);
  return (
    <PayPalScriptProvider options={{ clientId, currency: 'USD', intent: 'authorize' }}>
      <PayPalButtons
        style={{ layout: 'vertical', shape: 'rect', label: 'pay', height: 55 }}
        createOrder={async () => {
          const created = await createPayment({
            payeeName,
            amount,
            note,
            idempotencyKey: crypto.randomUUID(),
          });
          paymentId.current = created.payment.id;
          if (!created.payment.paypalOrderId) {
            throw new Error('PayPal did not start this payment.');
          }
          return created.payment.paypalOrderId;
        }}
        onApprove={async () => {
          if (!paymentId.current) return;
          const authorized = await authorizePayment(paymentId.current);
          onDone(authorized.payment);
        }}
        onCancel={() => onError('That was cancelled. No money was sent.')}
        onError={() => onError('PayPal could not open. No money was sent.')}
      />
    </PayPalScriptProvider>
  );
}
