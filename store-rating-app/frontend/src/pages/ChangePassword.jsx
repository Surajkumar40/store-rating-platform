import api from '../api/client.js';
import useForm from '../hooks/useForm.js';
import { rules } from '../utils/validators.js';
import { useToast } from '../components/Toast.jsx';
import { Alert, Button, Card, Field, PageHeader, PasswordRules } from '../components/ui.jsx';

export default function ChangePassword() {
  const toast = useToast();
  const form = useForm(
    { currentPassword: '', newPassword: '' },
    { currentPassword: rules.required('Current password'), newPassword: rules.password },
    async (v, reset) => {
      await api.patch('/auth/password', v);
      reset();
      toast.success('Password updated');
    }
  );
  return (
    <div className="max-w-lg">
      <PageHeader title="Change password" subtitle="Use a password you don't use anywhere else." />
      <Card>
        <form onSubmit={form.handleSubmit} noValidate className="space-y-5">
          <Alert>{form.formError}</Alert>
          <Field label="Current password" type="password" autoComplete="current-password" value={form.values.currentPassword} onChange={form.set('currentPassword')} error={form.errors.currentPassword} />
          <div>
            <Field label="New password" type="password" autoComplete="new-password" value={form.values.newPassword} onChange={form.set('newPassword')} error={form.errors.newPassword} />
            <PasswordRules value={form.values.newPassword} />
          </div>
          <Button type="submit" loading={form.submitting}>Update password</Button>
        </form>
      </Card>
    </div>
  );
}
