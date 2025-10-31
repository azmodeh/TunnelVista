'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TunnelsView from './tunnels-view';

const queryClient = new QueryClient();

export default function TunnelsPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <TunnelsView />
    </QueryClientProvider>
  );
}
