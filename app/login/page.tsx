'use client';

import type React from 'react';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Loader2, Mail, Lock, ArrowLeft } from 'lucide-react';
import AnimatedBackground from '@/components/animated-background';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';
import Image from 'next/image';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Заполните все поля');
      return;
    }

    setIsLoading(true);
    try {
      await login({ email, password });
    } catch (error: any) {
      toast.error(error.message || 'Ошибка входа');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 relative overflow-hidden'>
      <AnimatedBackground />

      {/* Header */}

      <div className='absolute top-0 left-0 right-0 z-20 p-4 sm:p-6'>
        <div className='flex items-center justify-between max-w-7xl mx-auto'>
          <Button
            variant='ghost'
            className='text-white/80 hover:text-white hover:bg-white/10'
            onClick={() => router.push('/')}
          >
            <ArrowLeft className='w-4 h-4 mr-2' />
            На главную
          </Button>

          <div className='rounded-full h-16 w-16 relative overflow-hidden ring-2 ring-white/20'>
            <Image
              src='/images/logo.png'
              alt='Логотип Neurox'
              fill
              className='object-cover'
              priority
            />
          </div>
        </div>
      </div>

      {/* <div className='absolute top-0 left-0 right-0 z-20 p-4 sm:p-6'>
        <div className='flex items-center justify-between max-w-7xl mx-auto'>
          <Button
            variant='ghost'
            className='text-white/80 hover:text-white hover:bg-white/10'
            onClick={() => router.push('/')}
          >
            <ArrowLeft className='w-4 h-4 mr-2' />
            На главную
          </Button> */}
      {/* <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white via-purple-100 to-blue-100 bg-clip-text text-transparent">
            NEUROX
          </div> */}

      {/* <div className='rounded-md h-16 w-46 relative'>
            {' '}
            {/* Подберите подходящие размеры */}
      {/* <Image
              src='/images/logo.png'
              alt='Логотип Neurox'
              fill
              className='rounded-md object-contain'
            />
          </div> */}
      {/* </div> */}
      {/* </div> */}

      {/* Main Content */}
      <div className='flex items-center justify-center min-h-screen p-4 pt-20'>
        <div className='w-full max-w-md relative z-10'>
          <Card className='bg-white/95 backdrop-blur-sm border-0 shadow-2xl'>
            <CardHeader className='space-y-2 text-center pb-6'>
              <div className='mx-auto w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mb-4'>
                <Lock className='w-8 h-8 text-white' />
              </div>
              <CardTitle className='text-2xl sm:text-3xl font-bold text-gray-900'>
                Добро пожаловать
              </CardTitle>
              <CardDescription className='text-gray-600 text-base'>
                Войдите в свой аккаунт для продолжения
              </CardDescription>
            </CardHeader>

            <CardContent className='space-y-6'>
              <form onSubmit={handleSubmit} className='space-y-5'>
                <div className='space-y-2'>
                  <Label
                    htmlFor='email'
                    className='text-sm font-medium text-gray-700'
                  >
                    Email адрес
                  </Label>
                  <div className='relative'>
                    <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
                    <Input
                      id='email'
                      type='email'
                      placeholder='example@email.com'
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className='pl-10 h-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500'
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label
                    htmlFor='password'
                    className='text-sm font-medium text-gray-700'
                  >
                    Пароль
                  </Label>
                  <div className='relative'>
                    <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
                    <Input
                      id='password'
                      type={showPassword ? 'text' : 'password'}
                      placeholder='Введите пароль'
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className='pl-10 pr-12 h-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500'
                      disabled={isLoading}
                      required
                    />
                    <button
                      type='button'
                      onClick={() => setShowPassword(!showPassword)}
                      className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors'
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className='h-5 w-5' />
                      ) : (
                        <Eye className='h-5 w-5' />
                      )}
                    </button>
                  </div>
                </div>

                <div className='flex items-center justify-between'>
                  <Link
                    href='/reset-password'
                    className='text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors'
                  >
                    Забыли пароль?
                  </Link>
                </div>

                <Button
                  type='submit'
                  className='w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium text-base shadow-lg hover:shadow-xl transition-all duration-200'
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className='mr-2 h-5 w-5 animate-spin' />
                      Вход...
                    </>
                  ) : (
                    'Войти в аккаунт'
                  )}
                </Button>
              </form>

              <div className='relative'>
                <div className='absolute inset-0 flex items-center'>
                  <span className='w-full border-t border-gray-200' />
                </div>
                <div className='relative flex justify-center text-xs uppercase'>
                  <span className='bg-white px-2 text-gray-500'>или</span>
                </div>
              </div>

              <div className='text-center'>
                <span className='text-gray-600'>Нет аккаунта? </span>
                <Link
                  href='/register'
                  className='text-purple-600 hover:text-purple-700 font-medium transition-colors'
                >
                  Зарегистрироваться
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <div className='mt-8 text-center'>
            <p className='text-white/80 text-sm'>
              Используя NEUROX, вы соглашаетесь с нашими{' '}
              <Link
                href='/terms'
                className='text-white underline hover:text-purple-200'
              >
                условиями использования
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
