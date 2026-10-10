import api from '../../api/client.js';
import useForm from '../../hooks/useForm.js';
import { rules } from '../../utils/validators.js';
import { useToast } from '../../components/Toast.jsx';
import { Alert, Button, Card, Field, PageHeader, PasswordRules } from '../../components/ui.jsx';

const ROLES = [
  ['USER', 'Normal user', 'Can browse and rate stores.'],
  ['OWNER', 'Store owner', 'Sees ratings for their own store.'],
  ['ADMIN', 'Administrator', 'Full access to manage the platform.'],
];

export default function AddUser() {
  const toast = useToast();
  const form = useForm(
    { name: '', email: '', address: '', password: '', role: 'USER' },
    { name: rules.name, email: rules.email, address: rules.address, password: rules.password },
    async (v, reset) => {
      const { data } = await api.post('/admin/users', { ...v, name: v.name.trim(), email: v.email.trim(), address: v.address.trim() });
      toast.success(`${data.name} was added`);
      reset();
    }
  );
  return (
    <div className="max-w-2xl">
      <PageHeader title="Add user" subtitle="Create a normal user, a store owner or another administrator." />
      <Card>
        <form onSubmit={form.handleSubmit} noValidate className="space-y-5">
          <Alert>{form.formError}</Alert>
          <fieldset>
            <legend className="mb-1.5 text-sm font-medium">Role</legend>
            <div className="grid gap-3 sm:grid-cols-3">
              {ROLES.map(([value, label, text]) => (
                <label key={value} className="cursor-pointer">
                  <input type="radio" name="role" value={value} checked={form.values.role === value} onChange={form.set('role')} className="peer sr-only" />
                  <span className="block h-full rounded-xl border border-line bg-surface p-3 transition-colors peer-checked:border-brand peer-checked:bg-brand-soft peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-brand">
                    <span className="block text-sm font-semibold">{label}</span><span className="mt-0.5 block text-xs text-muted">{text}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <Field label="Full name" max={60} hint="20 to 60 characters" value={form.values.name} onChange={form.set('name')} error={form.errors.name} />
          <Field label="Email" type="email" value={form.values.email} onChange={form.set('email')} error={form.errors.email} />
          <Field label="Address" as="textarea" rows={3} max={400} value={form.values.address} onChange={form.set('address')} error={form.errors.address} />
          <div>
            <Field label="Password" type="password" autoComplete="new-password" value={form.values.password} onChange={form.set('password')} error={form.errors.password} />
            <PasswordRules value={form.values.password} />
          </div>
          <Button type="submit" loading={form.submitting}>Add user</Button>
        </form>
      </Card>
    </div>
  );
}
