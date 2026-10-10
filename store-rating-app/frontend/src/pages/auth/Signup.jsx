import { useEffect } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth, homeFor } from '../../context/AuthContext.jsx';
import useForm from '../../hooks/useForm.js';
import { rules } from '../../utils/validators.js';
import { Alert, Button, Field, PasswordRules } from '../../components/ui.jsx';
import AuthShell from './AuthShell.jsx';

export default function Signup() {
  const { user, signup } = useAuth();
  const navigate = useNavigate();
  useEffect(() => { document.title = 'Sign up · Storefront'; }, []);
  const form = useForm(
    { name: '', email: '', address: '', password: '' },
    { name: rules.name, email: rules.email, address: rules.address, password: rules.password },
    async (v) => {
      const u = await signup({ ...v, name: v.name.trim(), email: v.email.trim(), address: v.address.trim() });
      navigate(homeFor(u.role), { replace: true });
    }
  );
  if (user) return <Navigate to={homeFor(user.role)} replace />;

  return (
    <AuthShell title="Create your account" subtitle="It takes a minute. Then you can start rating." footer={<>Already registered? <Link className="font-semibold text-brand hover:underline" to="/login">Log in</Link></>}>
      <form onSubmit={form.handleSubmit} noValidate className="space-y-5">
        <Alert>{form.formError}</Alert>
        <Field label="Full name" autoComplete="name" max={60} hint="20 to 60 characters" value={form.values.name} onChange={form.set('name')} error={form.errors.name} />
        <Field label="Email" type="email" autoComplete="email" value={form.values.email} onChange={form.set('email')} error={form.errors.email} />
        <Field label="Address" as="textarea" rows={3} max={400} autoComplete="street-address" value={form.values.address} onChange={form.set('address')} error={form.errors.address} />
        <div>
          <Field label="Password" type="password" autoComplete="new-password" value={form.values.password} onChange={form.set('password')} error={form.errors.password} />
          <PasswordRules value={form.values.password} />
        </div>
        <Button type="submit" loading={form.submitting} className="w-full">Create account</Button>
      </form>
    </AuthShell>
  );
}
