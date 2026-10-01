export const PASSWORD_RULE = /^(?=(?:.*\d){2,})(?=.*[^A-Za-z0-9]).{5,}$/;

export const normalizePhone = (value = '') => String(value).replace(/\D/g, '').slice(0, 10);

export const isValidPhone = (value = '') => /^\d{10}$/.test(normalizePhone(value));

export const isStrongPassword = (value = '') => typeof value === 'string' && PASSWORD_RULE.test(value);

export const getPasswordError = (value = '') => {
  if (!value) return 'Password is required';
  if (value.length < 5) return 'Password must be at least 5 characters';
  if ((value.match(/\d/g) || []).length < 2) return 'Password must contain at least 2 digits';
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
    return 'Password must contain at least 1 special character';
  }
  return '';
};
