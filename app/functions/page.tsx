'use client';
import { Header } from '@/components/header';
import { Sidebar } from '@/components/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Zap, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function FunctionsPage() {
  return (
    <div className='flex h-screen bg-background'>
      <div className='hidden md:block w-68 flex-shrink-0'>
        <Sidebar />
      </div>
      <div className='flex-1 flex flex-col min-w-0'>
        <Header />
        <main className='flex-1 p-4 md:p-6 overflow-auto'>
          <div className='max-w-4xl mx-auto space-y-6'>
            <Alert className='bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-600'>
              <AlertTriangle className='h-4 w-4 text-amber-600' />
              <AlertDescription className='text-amber-800 dark:text-amber-200'>
                <strong>Премиум-функции</strong>
                <br />
                Для доступа к этой функции необходим тариф Премиум. Для
                получения доступа купите{' '}
                <Link
                  href='/account?tab=subscription'
                  className='text-purple-600 hover:text-purple-700 underline'
                >
                  соответствующую подписку.
                </Link>
              </AlertDescription>
            </Alert>

            <Card className='border-0 shadow-lg'>
              <CardHeader className='text-center pb-8 pt-12'>
                <div className='w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg'>
                  <Zap className='w-10 h-10 text-white' />
                </div>
                <CardTitle className='text-3xl font-bold text-foreground mb-4'>
                  Функции
                </CardTitle>
                <p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
                  Создавайте пользовательские функции для расширения
                  возможностей ваших агентов
                </p>
              </CardHeader>
              <CardContent className='text-center pb-12'>
                <div className='bg-muted/50 rounded-xl p-8 mb-8'>
                  <h3 className='text-xl font-semibold mb-4'>Скоро доступно</h3>
                  <p className='text-muted-foreground mb-6'>
                    Мы работаем над системой пользовательских функций, которая
                    позволит создавать собственные инструменты для ваших
                    агентов.
                  </p>
                  <div className='flex justify-center space-x-8 text-sm text-muted-foreground'>
                    <div className='text-center'>
                      <div className='font-semibold text-foreground'>Код</div>
                      <div>Любой язык</div>
                    </div>
                    <div className='text-center'>
                      <div className='font-semibold text-foreground'>API</div>
                      <div>Интеграции</div>
                    </div>
                    <div className='text-center'>
                      <div className='font-semibold text-foreground'>
                        Библиотека
                      </div>
                      <div>Готовые решения</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
