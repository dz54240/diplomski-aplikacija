import { Outlet, createRootRouteWithContext } from '@tanstack/react-router';
import { type QueryClient } from '@tanstack/react-query';
import { AuthProvider } from '@/lib/auth/context';

interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  ),
});
