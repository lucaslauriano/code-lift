'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  // One client per browser session, created lazily so it is never shared across server requests.
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: (failureCount, error) =>
              // Retrying a 401 just delays the redirect to /login.
              !(error instanceof Error && 'status' in error && error.status === 401) &&
              failureCount < 2,
          },
        },
      }),
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
