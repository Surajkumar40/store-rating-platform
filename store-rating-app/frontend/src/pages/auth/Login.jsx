import { useEffect } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth, homeFor } from '../../context/AuthContext.jsx';
import useForm from '../../hooks/useForm.js';
import { rules } from '../../utils/validators.js';
import { Alert, Button, Field } from '../../components/ui.jsx';
import AuthShell from './AuthShell.jsx';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  useEffect(() => { document.title = 'Log in · Storefront'; }, []);
  const form = useForm({ email: '', password: '' }, { email: rules.email, password: rules.required('Password') }, async (v) => {
    const u = await login({ email: v.email.trim(), password: v.password });
    navigate(homeFor(u.role), { replace: true });
  });
  if (user) return <Navigate to={homeFor(user.role)} replace />;

  return (
    <AuthShell title="Welcome back" subtitle="Log in to rate stores or manage your account." footer={<>New here? <Link className="font-semibold text-brand hover:underline" to="/signup">Create an account</Link></>}>
      <form onSubmit={form.handleSubmit} noValidate className="space-y-5">
        <Alert>{form.formError}</Alert>
        <Field label="Email" type="email" autoComplete="email" value={form.values.email} onChange={form.set('email')} error={form.errors.email} />
        <Field label="Password" type="password" autoComplete="current-password" value={form.values.password} onChange={form.set('password')} error={form.errors.password} />
        <Button type="submit" loading={form.submitting} className="w-full">Log in</Button>
      </form>
    </AuthShell>
  );
}
