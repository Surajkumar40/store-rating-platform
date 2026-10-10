// Mirrors the backend rules so users get instant feedback. The server is still the source of truth.
export const rules = {
  name: (v) => (v.trim().length < 20 ? 'Name must be at least 20 characters' : v.trim().length > 60 ? 'Name must be at most 60 characters' : ''),
  email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Enter a valid email address'),
  address: (v) => (!v.trim() ? 'Address is required' : v.length > 400 ? 'Address must be at most 400 characters' : ''),
  password: (v) =>
    v.length < 8 || v.length > 16 ? 'Password must be 8 to 16 characters'
    : !/[A-Z]/.test(v) ? 'Password must include an uppercase letter'
    : !/[^A-Za-z0-9]/.test(v) ? 'Password must include a special character' : '',
  required: (label) => (v) => (v ? '' : `${label} is required`),
};

export function validate(values, schema) {
  const errors = {};
  for (const [key, fn] of Object.entries(schema)) {
    const msg = fn(values[key] ?? '');
    if (msg) errors[key] = msg;
  }
  return errors;
}
