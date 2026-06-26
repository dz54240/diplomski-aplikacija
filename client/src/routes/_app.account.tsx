import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { ProfileScreen } from '@/components/screens';
import { useAuth } from '@/lib/auth';

export const Route = createFileRoute('/_app/account')({
  component: AccountRoute,
});

function AccountRoute() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const profileUser = user
    ? {
        name: `${user.first_name} ${user.last_name}`.trim() || user.email,
        first: user.first_name,
        last: user.last_name,
        email: user.email,
      }
    : { name: 'Korisnik', first: 'Korisnik', last: '', email: '' };

  return (
    <ProfileScreen
      user={profileUser}
      onLogout={async () => {
        await logout();
        navigate({ to: '/login' });
      }}
    />
  );
}
