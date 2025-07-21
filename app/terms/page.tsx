'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  FileText,
  Shield,
  Users,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Clock,
  Mail,
  Phone,
} from 'lucide-react';
import AnimatedBackground from '@/components/animated-background';

export default function TermsPage() {
  const router = useRouter();

  return (
    <div className='min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 relative overflow-hidden'>
      <AnimatedBackground />

      {/* Header */}
      <div className='absolute top-0 left-0 right-0 z-20 p-4 sm:p-6'>
        <div className='flex items-center justify-between max-w-4xl mx-auto'>
          <Button
            variant='ghost'
            className='text-white/80 hover:text-white hover:bg-white/10'
            onClick={() => router.back()}
          >
            <ArrowLeft className='w-4 h-4 mr-2' />
            Назад
          </Button>
          <Link
            href='/'
            className='text-xl sm:text-2xl font-bold bg-gradient-to-r from-white via-purple-100 to-blue-100 bg-clip-text text-transparent'
          >
            NEUROX
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className='pt-20 pb-8 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-4xl mx-auto'>
          {/* Page Header */}
          <div className='text-center mb-8 relative z-10'>
            <div className='inline-flex items-center gap-3 mb-4'>
              <div className='p-3 bg-white/20 rounded-xl backdrop-blur-sm'>
                <FileText className='w-8 h-8 text-white' />
              </div>
              <Badge className='bg-white/20 text-white border-white/30'>
                Версия 1.0
              </Badge>
            </div>
            <h1 className='text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4'>
              Условия использования
            </h1>
            <p className='text-white/80 text-lg max-w-2xl mx-auto'>
              Простые и понятные правила использования платформы NEUROX
            </p>
            <div className='flex items-center justify-center gap-4 mt-6 text-white/60 text-sm'>
              <div className='flex items-center gap-2'>
                <Clock className='w-4 h-4' />
                <span>Обновлено: 15 января 2025</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <Card className='bg-white/95 backdrop-blur-sm border-0 shadow-xl relative z-10'>
            <CardContent className='p-8 space-y-8'>
              {/* Introduction */}
              <div className='text-center'>
                <p className='text-gray-700 text-lg leading-relaxed'>
                  Добро пожаловать в NEUROX! Эти условия описывают правила
                  использования нашей платформы для создания AI-агентов.
                </p>
              </div>

              <Separator />

              {/* Main Sections */}
              <div className='space-y-8'>
                {/* What is NEUROX */}
                <section className='space-y-4'>
                  <div className='flex items-center gap-3'>
                    <div className='p-2 bg-blue-100 rounded-lg'>
                      <Shield className='w-5 h-5 text-blue-600' />
                    </div>
                    <h2 className='text-2xl font-bold text-gray-900'>
                      Что такое NEUROX
                    </h2>
                  </div>
                  <div className='bg-blue-50 p-6 rounded-lg'>
                    <p className='text-gray-700 leading-relaxed'>
                      NEUROX — это платформа для создания умных AI-агентов,
                      которые помогают автоматизировать общение с клиентами. Вы
                      можете создавать ботов для Telegram, WhatsApp, Instagram и
                      других мессенджеров.
                    </p>
                  </div>
                </section>

                {/* Registration */}
                <section className='space-y-4'>
                  <div className='flex items-center gap-3'>
                    <div className='p-2 bg-green-100 rounded-lg'>
                      <Users className='w-5 h-5 text-green-600' />
                    </div>
                    <h2 className='text-2xl font-bold text-gray-900'>
                      Регистрация и аккаунт
                    </h2>
                  </div>
                  <div className='space-y-4'>
                    <p className='text-gray-700 leading-relaxed'>
                      Для использования NEUROX вам нужно создать аккаунт. При
                      регистрации укажите:
                    </p>
                    <ul className='space-y-2 text-gray-700 ml-6'>
                      <li className='flex items-start gap-2'>
                        <CheckCircle className='w-4 h-4 text-green-500 mt-1 flex-shrink-0' />
                        <span>Ваше имя и email</span>
                      </li>
                      <li className='flex items-start gap-2'>
                        <CheckCircle className='w-4 h-4 text-green-500 mt-1 flex-shrink-0' />
                        <span>Номер телефона</span>
                      </li>
                      <li className='flex items-start gap-2'>
                        <CheckCircle className='w-4 h-4 text-green-500 mt-1 flex-shrink-0' />
                        <span>Надежный пароль</span>
                      </li>
                    </ul>
                    <div className='bg-amber-50 p-4 rounded-lg border-l-4 border-amber-500'>
                      <p className='text-amber-800 text-sm'>
                        <strong>Важно:</strong> Вы отвечаете за безопасность
                        своего аккаунта. Не передавайте пароль другим людям.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Pricing */}
                <section className='space-y-4'>
                  <div className='flex items-center gap-3'>
                    <div className='p-2 bg-purple-100 rounded-lg'>
                      <CreditCard className='w-5 h-5 text-purple-600' />
                    </div>
                    <h2 className='text-2xl font-bold text-gray-900'>
                      Тарифы и оплата
                    </h2>
                  </div>
                  <div className='space-y-4'>
                    <p className='text-gray-700 leading-relaxed'>
                      NEUROX предлагает несколько тарифных планов:
                    </p>
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                      <div className='border rounded-lg p-4 text-center'>
                        <h4 className='font-semibold text-gray-900 mb-2'>
                          Тест
                        </h4>
                        <p className='text-2xl font-bold text-green-600 mb-2'>
                          Бесплатно
                        </p>
                        <p className='text-sm text-gray-600'>7 дней</p>
                      </div>
                      <div className='border rounded-lg p-4 text-center border-purple-200 bg-purple-50'>
                        <h4 className='font-semibold text-gray-900 mb-2'>
                          Бизнес
                        </h4>
                        <p className='text-2xl font-bold text-purple-600 mb-2'>
                          ₽2,900
                        </p>
                        <p className='text-sm text-gray-600'>в месяц</p>
                      </div>
                      <div className='border rounded-lg p-4 text-center'>
                        <h4 className='font-semibold text-gray-900 mb-2'>
                          Премиум
                        </h4>
                        <p className='text-2xl font-bold text-blue-600 mb-2'>
                          ₽4,000
                        </p>
                        <p className='text-sm text-gray-600'>в месяц</p>
                      </div>
                    </div>
                    <div className='bg-blue-50 p-4 rounded-lg'>
                      <p className='text-blue-800 text-sm'>
                        <strong>BotCoin</strong> — это внутренняя валюта для
                        дополнительных функций. 1 BotCoin = ₽1.40. BotCoin не
                        сгорают и не возвращаются.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Rules */}
                <section className='space-y-4'>
                  <div className='flex items-center gap-3'>
                    <div className='p-2 bg-red-100 rounded-lg'>
                      <AlertTriangle className='w-5 h-5 text-red-600' />
                    </div>
                    <h2 className='text-2xl font-bold text-gray-900'>
                      Правила использования
                    </h2>
                  </div>
                  <div className='space-y-4'>
                    <div className='bg-green-50 p-4 rounded-lg'>
                      <h4 className='font-medium text-green-900 mb-2'>
                        ✅ Можно:
                      </h4>
                      <ul className='text-sm text-green-800 space-y-1'>
                        <li>• Создавать AI-агентов для бизнеса</li>
                        <li>• Интегрировать с мессенджерами</li>
                        <li>• Использовать для автоматизации</li>
                        <li>• Получать техническую поддержку</li>
                      </ul>
                    </div>
                    <div className='bg-red-50 p-4 rounded-lg'>
                      <h4 className='font-medium text-red-900 mb-2'>
                        ❌ Нельзя:
                      </h4>
                      <ul className='text-sm text-red-800 space-y-1'>
                        <li>• Использовать для спама</li>
                        <li>• Нарушать законы</li>
                        <li>• Передавать аккаунт другим</li>
                        <li>• Мешать работе системы</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Support */}
                <section className='space-y-4'>
                  <div className='flex items-center gap-3'>
                    <div className='p-2 bg-green-100 rounded-lg'>
                      <Mail className='w-5 h-5 text-green-600' />
                    </div>
                    <h2 className='text-2xl font-bold text-gray-900'>
                      Поддержка
                    </h2>
                  </div>
                  <div className='bg-gray-50 p-6 rounded-lg'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                      <div className='space-y-3'>
                        <div className='flex items-center gap-3'>
                          <Mail className='w-5 h-5 text-gray-600' />
                          <div>
                            <p className='font-medium text-gray-900'>Email</p>
                            <p className='text-gray-700 text-sm'>
                              support@neurox.ru
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className='space-y-3'>
                        <div className='flex items-center gap-3'>
                          <Phone className='w-5 h-5 text-gray-600' />
                          <div>
                            <p className='font-medium text-gray-900'>Телефон</p>
                            <p className='text-gray-700 text-sm'>
                              +7 (495) 123-45-67
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              {/* Footer */}
              <div className='bg-gray-50 p-6 rounded-lg text-center'>
                <p className='text-gray-600 text-sm mb-4'>
                  Используя NEUROX, вы соглашаетесь с этими условиями. Мы можем
                  обновлять их время от времени.
                </p>
                <div className='flex flex-col sm:flex-row items-center justify-center gap-4'>
                  <Button asChild className='bg-purple-600 hover:bg-purple-700'>
                    <Link href='/register'>
                      <Users className='w-4 h-4 mr-2' />
                      Создать аккаунт
                    </Link>
                  </Button>
                  <Button variant='outline' asChild>
                    <Link href='/privacy'>
                      <Shield className='w-4 h-4 mr-2' />
                      Политика конфиденциальности
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
