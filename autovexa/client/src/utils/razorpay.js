export function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve(true);

  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export async function openRazorpayCheckout({ paymentOrder, booking, onSuccess, onFailure }) {
  const loaded = await loadRazorpay();
  if (!loaded) {
    onFailure('Razorpay Checkout could not be loaded. Check your internet connection.');
    return;
  }

  const checkout = new window.Razorpay({
    key: paymentOrder.keyId,
    amount: paymentOrder.amount,
    currency: paymentOrder.currency,
    name: 'AutoVexa',
    description: `${booking.vehicle?.brand || ''} ${booking.vehicle?.model || ''}`.trim(),
    order_id: paymentOrder.id,
    prefill: {
      name: booking.customer?.name,
      email: booking.customer?.email,
      contact: booking.customer?.phone,
    },
    notes: { bookingId: booking.id },
    handler: onSuccess,
    modal: { ondismiss: () => onFailure('Payment was cancelled.') },
  });

  checkout.on('payment.failed', (response) => {
    onFailure(response.error?.description || 'Razorpay payment failed.');
  });
  checkout.open();
}
