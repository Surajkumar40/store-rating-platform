import { useState } from 'react';
import { validate } from '../utils/validators.js';
import { parseError } from '../api/client.js';

// Handles values, client validation, submit state and server errors for a form.
export default function useForm(initial, schema, onSubmit) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const set = (name) => (e) => {
    setValues((v) => ({ ...v, [name]: e.target.value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    const errs = validate(values, schema);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSubmitting(true);
    try {
      await onSubmit(values, () => setValues(initial));
    } catch (err) {
      const { message, fields } = parseError(err);
      setErrors(fields);
      setFormError(Object.keys(fields).length ? '' : message);
    } finally {
      setSubmitting(false);
    }
  };

  return { values, errors, formError, submitting, set, handleSubmit };
}
