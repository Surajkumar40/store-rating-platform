import { useAuth, homeFor } from '../context/AuthContext.jsx';
import { Empty, LinkButton, PageHeader } from '../components/ui.jsx';

export default function NotFound() {
  const { user } = useAuth();
  return (
    <>
      <PageHeader title="Page not found" />
      <Empty title="There is nothing at this address" action={<LinkButton to={homeFor(user.role)}>Go to your home page</LinkButton>}>
        The link may be old, or you may not have access to this section.
      </Empty>
    </>
  );
}
