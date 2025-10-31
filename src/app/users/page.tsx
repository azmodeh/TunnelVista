'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import UsersView from './users-view';

const queryClient = new QueryClient();

export default function UsersPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <UsersView />
    </QueryClientProvider>
  );
}
