import api from '../../api/client.js';
import useForm from '../../hooks/useForm.js';
import { useList } from '../../hooks/useList.js';
import { rules } from '../../utils/validators.js';
import { useToast } from '../../components/Toast.jsx';
import { Alert, Button, Card, Field, LinkButton, PageHeader } from '../../components/ui.jsx';

export default function AddStore() {
  const toast = useToast();
  const { data: owners, reload } = useList('/admin/owners/available');
  const form = useForm({ name: '', email: '', address: '', ownerId: '' }, { name: rules.name, email: rules.email, address: rules.address }, async (v, reset) => {
    const body = { name: v.name.trim(), email: v.email.trim(), address: v.address.trim(), ownerId: v.ownerId ? Number(v.ownerId) : null };
    const { data } = await api.post('/admin/stores', body);
    toast.success(`${data.name} was added`);
    reset();
    reload();
  });
  const none = owners && owners.length === 0;
  return (
    <div className="max-w-2xl">
      <PageHeader title="Add store" subtitle="Register a store so users can rate it." />
      <Card>
        <form onSubmit={form.handleSubmit} noValidate className="space-y-5">
          <Alert>{form.formError}</Alert>
          <Field label="Store name" max={60} hint="20 to 60 characters" value={form.values.name} onChange={form.set('name')} error={form.errors.name} />
          <Field label="Store email" type="email" value={form.values.email} onChange={form.set('email')} error={form.errors.email} />
          <Field label="Address" as="textarea" rows={3} max={400} value={form.values.address} onChange={form.set('address')} error={form.errors.address} />
          <Field label="Owner" as="select" value={form.values.ownerId} onChange={form.set('ownerId')} error={form.errors.ownerId}
            hint={none ? 'No unassigned owners yet. Add a user with the Store owner role first.' : 'Optional. Only owners who do not have a store yet are listed.'}>
            <option value="">No owner yet</option>
            {(owners ?? []).map((o) => <option key={o.id} value={o.id}>{o.name} ({o.email})</option>)}
          </Field>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" loading={form.submitting}>Add store</Button>
            {none && <LinkButton to="/admin/users/new" variant="ghost">Add a store owner</LinkButton>}
          </div>
        </form>
      </Card>
    </div>
  );
}
