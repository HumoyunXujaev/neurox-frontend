'use client';

import { Suspense } from 'react';
import ServiceBotTestPage from '@/components/service-bot-test';

export default function TestPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ServiceBotTestPage />
    </Suspense>
  );
}
