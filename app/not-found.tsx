'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home, ArrowLeft, Bot, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 flex items-center justify-center p-4'>
      <Card className='w-full max-w-2xl shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm'>
        <CardContent className='p-12 text-center space-y-8'>
          {/* Logo */}
          <div className='text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent'>
            NEUROX
          </div>

          {/* 404 Animation */}
          <div className='relative'>
            <div className='text-8xl font-bold text-purple-600 dark:text-purple-400 opacity-20'>
              404
            </div>
            <div className='absolute inset-0 flex items-center justify-center'>
              <Bot className='h-16 w-16 text-purple-600 dark:text-purple-400 animate-bounce' />
            </div>
          </div>

          {/* Error Message */}
          <div className='space-y-4'>
            <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
              Страница не найдена
            </h1>
            <p className='text-lg text-gray-600 dark:text-gray-300 max-w-md mx-auto'>
              Похоже, что страница, которую вы ищете, не существует или была
              перемещена.
            </p>
          </div>

          {/* Suggestions */}
          <div className='bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6 space-y-3'>
            <h3 className='font-semibold text-gray-900 dark:text-white'>
              Возможные причины:
            </h3>
            <ul className='text-sm text-gray-600 dark:text-gray-300 space-y-1'>
              <li>• Неправильно введен адрес страницы</li>
              <li>• Страница была удалена или перемещена</li>
              <li>• Ссылка устарела или повреждена</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Button
              asChild
              className='bg-purple-600 hover:bg-purple-700 text-white'
            >
              <Link href='/'>
                <Home className='mr-2 h-4 w-4' />
                На главную
              </Link>
            </Button>
            <Button
              asChild
              variant='outline'
              className='border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 bg-transparent'
            >
              <Link href='javascript:history.back()'>
                <ArrowLeft className='mr-2 h-4 w-4' />
                Назад
              </Link>
            </Button>
            <Button asChild variant='outline'>
              <Link href='/support'>
                <Search className='mr-2 h-4 w-4' />
                Поддержка
              </Link>
            </Button>
          </div>

          {/* Additional Help */}
          <div className='text-sm text-gray-500 dark:text-gray-400'>
            Если проблема повторяется, обратитесь в{' '}
            <Link
              href='/support'
              className='text-purple-600 hover:text-purple-700 underline'
            >
              службу поддержки
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
