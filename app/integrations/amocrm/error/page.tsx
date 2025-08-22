'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AmoCrmErrorPage() {
  return (
    <div className='flex justify-center items-center min-h-screen bg-gray-50 p-4'>
      <Card className='w-full max-w-md shadow-xl rounded-2xl'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-red-600'>
            <AlertCircle className='w-6 h-6' />
            Ошибка интеграции
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <p className='text-gray-600'>
            Произошла ошибка при подключении amoCRM. Попробуйте снова или
            свяжитесь с поддержкой.
          </p>
          <div className='flex justify-between'>
            <Link href='/integrations'>
              <Button variant='outline'>Назад</Button>
            </Link>
            <Button onClick={() => window.location.reload()}>Повторить</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
