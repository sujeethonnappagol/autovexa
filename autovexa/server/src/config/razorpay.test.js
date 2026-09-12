import test from 'node:test';
import assert from 'node:assert/strict';
import { isRealCredential } from './razorpay.js';

test('rejects missing and placeholder Razorpay credentials', () => {
  assert.equal(isRealCredential('', 'placeholder'), false);
  assert.equal(isRealCredential('placeholder', 'placeholder'), false);
  assert.equal(isRealCredential('  placeholder  ', 'placeholder'), false);
});

test('accepts a real-looking Razorpay credential', () => {
  assert.equal(isRealCredential('rzp_test_abc123', 'rzp_test_your_key_id'), true);
  assert.equal(isRealCredential('secret-value', 'your_razorpay_key_secret'), true);
});