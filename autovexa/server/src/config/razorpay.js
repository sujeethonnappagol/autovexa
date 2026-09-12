import Razorpay from 'razorpay';

export function isRealCredential(value, placeholder) {
  return Boolean(value && value.trim() && value.trim() !== placeholder);
}

export const razorpayConfigured =
  isRealCredential(process.env.RAZORPAY_KEY_ID, 'rzp_test_your_key_id') &&
  isRealCredential(process.env.RAZORPAY_KEY_SECRET, 'your_razorpay_key_secret');

const razorpay = razorpayConfigured
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  : null;

export default razorpay;
