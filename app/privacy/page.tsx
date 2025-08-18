'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Shield,
  Database,
  Eye,
  Lock,
  Users,
  Mail,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Settings,
} from 'lucide-react';
import AnimatedBackground from '@/components/animated-background';
import Image from 'next/image';
export default function PrivacyPage() {
  const router = useRouter();

  return (
    <div className='min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 relative overflow-hidden'>
      <AnimatedBackground />

      {/* Header */}

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
            className='rounded-full h-16 w-16 relative overflow-hidden ring-2 ring-white/20'
          >
            <Image
              src='/images/logo.png'
              alt='Логотип Neurox'
              fill
              className='object-cover'
              priority
            />
          </Link>
        </div>
      </div>

      {/* 

      <div className='absolute top-0 left-0 right-0 z-20 p-4 sm:p-6'>
        <div className='flex items-center justify-between max-w-4xl mx-auto'>
          <Button
            variant='ghost'
            className='text-white/80 hover:text-white hover:bg-white/10'
            onClick={() => router.back()}
          >
            <ArrowLeft className='w-4 h-4 mr-2' />
            Назад
          </Button> */}
      {/* <Link
            href='/'
            className='text-xl sm:text-2xl font-bold bg-gradient-to-r from-white via-purple-100 to-blue-100 bg-clip-text text-transparent'
          >
            NEUROX
          </Link> */}
      {/* <Link href='/' className='h-10 w-28 relative block'>
            <Image
              src='/images/logo.png'
              alt='Логотип Neurox'
              fill
              className='object-contain'
            />
          </Link>
        </div>
      </div> */}

      {/* Main Content */}
      <div className='pt-20 pb-8 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-4xl mx-auto'>
          {/* Page Header */}
          <div className='text-center mb-8 relative z-10'>
            <div className='inline-flex items-center gap-3 mb-4'>
              <div className='p-3 bg-white/20 rounded-xl backdrop-blur-sm'>
                <Shield className='w-8 h-8 text-white' />
              </div>
              <Badge className='bg-white/20 text-white border-white/30'>
                152-ФЗ
              </Badge>
            </div>
            <h1 className='text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4'>
              Политика конфиденциальности
            </h1>
            <p className='text-white/80 text-lg max-w-2xl mx-auto'>
              Мы заботимся о защите ваших данных и объясняем это простыми
              словами
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
                  Мы серьезно относимся к защите ваших персональных данных и
                  соблюдаем все требования российского законодательства.
                </p>
              </div>

              <Separator />

              {/* Main Sections */}
              <div className='space-y-8'>
                {/* What data we collect */}
                <section className='space-y-4'>
                  <div className='flex items-center gap-3'>
                    <div className='p-2 bg-blue-100 rounded-lg'>
                      <Database className='w-5 h-5 text-blue-600' />
                    </div>
                    <h2 className='text-2xl font-bold text-gray-900'>
                      Какие данные мы собираем
                    </h2>
                  </div>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div className='bg-green-50 p-4 rounded-lg'>
                      <div className='flex items-center gap-2 mb-3'>
                        <Users className='w-5 h-5 text-green-600' />
                        <h4 className='font-medium text-green-900'>
                          При регистрации
                        </h4>
                      </div>
                      <ul className='text-sm text-green-800 space-y-1'>
                        <li>• Имя и фамилия</li>
                        <li>• Email адрес</li>
                        <li>• Номер телефона</li>
                        <li>• Название компании</li>
                      </ul>
                    </div>

                    <div className='bg-blue-50 p-4 rounded-lg'>
                      <div className='flex items-center gap-2 mb-3'>
                        <Settings className='w-5 h-5 text-blue-600' />
                        <h4 className='font-medium text-blue-900'>
                          Автоматически
                        </h4>
                      </div>
                      <ul className='text-sm text-blue-800 space-y-1'>
                        <li>• IP-адрес</li>
                        <li>• Тип браузера</li>
                        <li>• Время посещения</li>
                        <li>• Действия в системе</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* How we use data */}
                <section className='space-y-4'>
                  <div className='flex items-center gap-3'>
                    <div className='p-2 bg-green-100 rounded-lg'>
                      <Eye className='w-5 h-5 text-green-600' />
                    </div>
                    <h2 className='text-2xl font-bold text-gray-900'>
                      Как мы используем данные
                    </h2>
                  </div>
                  <div className='space-y-4'>
                    <p className='text-gray-700 leading-relaxed'>
                      Ваши данные используются только для работы платформы:
                    </p>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <div className='flex items-start gap-3 p-4 bg-gray-50 rounded-lg'>
                        <CheckCircle className='w-5 h-5 text-green-600 mt-0.5 flex-shrink-0' />
                        <div>
                          <h4 className='font-medium text-gray-900 mb-1'>
                            Работа аккаунта
                          </h4>
                          <p className='text-gray-700 text-sm'>
                            Вход в систему и доступ к функциям
                          </p>
                        </div>
                      </div>
                      <div className='flex items-start gap-3 p-4 bg-gray-50 rounded-lg'>
                        <CheckCircle className='w-5 h-5 text-green-600 mt-0.5 flex-shrink-0' />
                        <div>
                          <h4 className='font-medium text-gray-900 mb-1'>
                            Поддержка
                          </h4>
                          <p className='text-gray-700 text-sm'>
                            Помощь в решении вопросов
                          </p>
                        </div>
                      </div>
                      <div className='flex items-start gap-3 p-4 bg-gray-50 rounded-lg'>
                        <CheckCircle className='w-5 h-5 text-green-600 mt-0.5 flex-shrink-0' />
                        <div>
                          <h4 className='font-medium text-gray-900 mb-1'>
                            Безопасность
                          </h4>
                          <p className='text-gray-700 text-sm'>
                            Защита от мошенничества
                          </p>
                        </div>
                      </div>
                      <div className='flex items-start gap-3 p-4 bg-gray-50 rounded-lg'>
                        <CheckCircle className='w-5 h-5 text-green-600 mt-0.5 flex-shrink-0' />
                        <div>
                          <h4 className='font-medium text-gray-900 mb-1'>
                            Улучшения
                          </h4>
                          <p className='text-gray-700 text-sm'>
                            Развитие платформы
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Data protection */}
                <section className='space-y-4'>
                  <div className='flex items-center gap-3'>
                    <div className='p-2 bg-purple-100 rounded-lg'>
                      <Lock className='w-5 h-5 text-purple-600' />
                    </div>
                    <h2 className='text-2xl font-bold text-gray-900'>
                      Как мы защищаем данные
                    </h2>
                  </div>
                  <div className='bg-purple-50 p-6 rounded-lg'>
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                      <div className='text-center'>
                        <Lock className='w-8 h-8 text-purple-600 mx-auto mb-2' />
                        <h4 className='font-medium text-gray-900 mb-1'>
                          Шифрование
                        </h4>
                        <p className='text-gray-700 text-sm'>
                          Все данные защищены современным шифрованием
                        </p>
                      </div>
                      <div className='text-center'>
                        <Shield className='w-8 h-8 text-purple-600 mx-auto mb-2' />
                        <h4 className='font-medium text-gray-900 mb-1'>
                          Мониторинг
                        </h4>
                        <p className='text-gray-700 text-sm'>
                          Круглосуточный контроль безопасности
                        </p>
                      </div>
                      <div className='text-center'>
                        <Users className='w-8 h-8 text-purple-600 mx-auto mb-2' />
                        <h4 className='font-medium text-gray-900 mb-1'>
                          Доступ
                        </h4>
                        <p className='text-gray-700 text-sm'>
                          Только авторизованные сотрудники
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Data sharing */}
                <section className='space-y-4'>
                  <div className='flex items-center gap-3'>
                    <div className='p-2 bg-yellow-100 rounded-lg'>
                      <AlertTriangle className='w-5 h-5 text-yellow-600' />
                    </div>
                    <h2 className='text-2xl font-bold text-gray-900'>
                      Передача данных
                    </h2>
                  </div>
                  <div className='space-y-4'>
                    <div className='bg-red-50 p-4 rounded-lg border-l-4 border-red-500'>
                      <h4 className='font-medium text-red-900 mb-2'>
                        ❌ Мы НЕ продаем ваши данные
                      </h4>
                      <p className='text-red-800 text-sm'>
                        Мы никогда не продаем, не сдаем в аренду и не передаем
                        ваши данные для рекламы или маркетинга.
                      </p>
                    </div>
                    <div className='bg-blue-50 p-4 rounded-lg'>
                      <h4 className='font-medium text-blue-900 mb-2'>
                        ✅ Когда мы можем передать данные:
                      </h4>
                      <ul className='text-blue-800 text-sm space-y-1'>
                        <li>• С вашего письменного согласия</li>
                        <li>• По требованию суда или полиции</li>
                        <li>
                          • Техническим партнерам (хостинг, платежи) — только
                          необходимый минимум
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Your rights */}
                <section className='space-y-4'>
                  <div className='flex items-center gap-3'>
                    <div className='p-2 bg-green-100 rounded-lg'>
                      <Eye className='w-5 h-5 text-green-600' />
                    </div>
                    <h2 className='text-2xl font-bold text-gray-900'>
                      Ваши права
                    </h2>
                  </div>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='bg-green-50 p-4 rounded-lg'>
                      <h4 className='font-medium text-green-900 mb-2'>
                        Вы можете:
                      </h4>
                      <ul className='text-sm text-green-800 space-y-1'>
                        <li>• Посмотреть свои данные</li>
                        <li>• Исправить неточности</li>
                        <li>• Удалить аккаунт</li>
                        <li>• Скачать свои данные</li>
                      </ul>
                    </div>
                    <div className='bg-blue-50 p-4 rounded-lg'>
                      <h4 className='font-medium text-blue-900 mb-2'>
                        Как это сделать:
                      </h4>
                      <p className='text-sm text-blue-800 mb-2'>
                        Напишите нам на:
                      </p>
                      <p className='text-sm text-blue-800 font-medium'>
                        privacy@neurox.ru
                      </p>
                      <p className='text-xs text-blue-700 mt-2'>
                        Ответим в течение 30 дней
                      </p>
                    </div>
                  </div>
                </section>

                {/* Cookies */}
                <section className='space-y-4'>
                  <div className='flex items-center gap-3'>
                    <div className='p-2 bg-orange-100 rounded-lg'>
                      <Settings className='w-5 h-5 text-orange-600' />
                    </div>
                    <h2 className='text-2xl font-bold text-gray-900'>
                      Файлы cookie
                    </h2>
                  </div>
                  <div className='bg-orange-50 p-4 rounded-lg'>
                    <p className='text-orange-800 text-sm mb-3'>
                      Мы используем cookie для работы сайта и улучшения вашего
                      опыта:
                    </p>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <div>
                        <h4 className='font-medium text-orange-900 mb-1'>
                          Необходимые
                        </h4>
                        <p className='text-xs text-orange-800'>
                          Для входа и работы сайта (всегда включены)
                        </p>
                      </div>
                      <div>
                        <h4 className='font-medium text-orange-900 mb-1'>
                          Аналитические
                        </h4>
                        <p className='text-xs text-orange-800'>
                          Для улучшения сайта (можно отключить)
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Contact */}
                <section className='space-y-4'>
                  <div className='flex items-center gap-3'>
                    <div className='p-2 bg-gray-100 rounded-lg'>
                      <Mail className='w-5 h-5 text-gray-600' />
                    </div>
                    <h2 className='text-2xl font-bold text-gray-900'>
                      Вопросы о данных
                    </h2>
                  </div>
                  <div className='bg-gray-50 p-6 rounded-lg'>
                    <div className='text-center'>
                      <p className='text-gray-700 mb-4'>
                        Если у вас есть вопросы о том, как мы обрабатываем ваши
                        данные:
                      </p>
                      <div className='space-y-2'>
                        <p className='font-medium text-gray-900'>
                          Email: privacy@neurox.ru
                        </p>
                        <p className='text-gray-600 text-sm'>
                          Ответим в течение 30 дней
                        </p>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              {/* Footer */}
              <div className='bg-gray-50 p-6 rounded-lg text-center'>
                <p className='text-gray-600 text-sm mb-4'>
                  Мы можем обновлять эту политику. Актуальная версия всегда
                  доступна на этой странице.
                </p>
                <div className='flex flex-col sm:flex-row items-center justify-center gap-4'>
                  <Button asChild className='bg-purple-600 hover:bg-purple-700'>
                    <Link href='/register'>
                      <Users className='w-4 h-4 mr-2' />
                      Создать аккаунт
                    </Link>
                  </Button>
                  <Button variant='outline' asChild>
                    <Link href='/terms'>
                      <FileText className='w-4 h-4 mr-2' />
                      Условия использования
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
