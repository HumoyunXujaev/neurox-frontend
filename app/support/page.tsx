'use client';

import { Header } from '@/components/header';
import { Sidebar } from '@/components/sidebar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, Users, BookOpen, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function SupportPage() {
  return (
    <div className='flex h-screen bg-background'>
      {/* Desktop Sidebar */}
      <div className='hidden md:block w-68 flex-shrink-0'>
        <Sidebar />
      </div>

      <div className='flex-1 flex flex-col min-w-0'>
        <Header />
        <main className='flex-1 p-4 md:p-8 overflow-auto'>
          <div className='max-w-7xl mx-auto'>
            <div className='mb-6 md:mb-10'>
              <h1 className='text-2xl md:text-4xl font-bold mb-3'>Поддержка</h1>
              <p className='text-muted-foreground text-sm md:text-lg'>
                Выберите подходящий способ обращения за поддержкой или получения
                информации.
              </p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8'>
              {/* Техническая поддержка */}
              <Card className='h-full'>
                <CardHeader className='text-center pb-6'>
                  <div className='mx-auto mb-6 p-4 bg-purple-100 dark:bg-purple-900 rounded-full w-fit'>
                    <MessageCircle className='h-8 w-8 md:h-10 md:w-10 text-purple-600 dark:text-purple-400' />
                  </div>
                  <CardTitle className='text-xl md:text-2xl'>
                    Техническая поддержка
                  </CardTitle>
                  <CardDescription className='text-center text-sm md:text-base'>
                    Если вы столкнулись с ошибками или неработающим
                    функционалом, свяжитесь с нашей службой поддержки через
                    Telegram-бот.
                  </CardDescription>
                </CardHeader>
                <CardContent className='pt-0'>
                  <Button
                    asChild
                    className='w-full bg-purple-600 hover:bg-purple-700 text-white h-12 md:h-14 text-sm md:text-base'
                  >
                    <Link
                      href='https://t.me/neurox_support_bot'
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      <MessageCircle className='mr-3 h-4 w-4 md:h-5 md:w-5' />К
                      TELEGRAM-БОТУ
                      <ExternalLink className='ml-3 h-4 w-4 md:h-5 md:w-5' />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Сообщество пользователей */}
              <Card className='h-full'>
                <CardHeader className='text-center pb-6'>
                  <div className='mx-auto mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-full w-fit'>
                    <Users className='h-8 w-8 md:h-10 md:w-10 text-gray-600 dark:text-gray-400' />
                  </div>
                  <CardTitle className='text-xl md:text-2xl'>
                    Сообщество пользователей
                  </CardTitle>
                  <CardDescription className='text-center text-sm md:text-base'>
                    Задавайте вопросы другим пользователям и обменивайтесь
                    опытом в нашем сообществе в Telegram.
                  </CardDescription>
                </CardHeader>
                <CardContent className='pt-0'>
                  <Button
                    asChild
                    variant='secondary'
                    className='w-full bg-gray-500 hover:bg-gray-600 text-white h-12 md:h-14 text-sm md:text-base'
                  >
                    <Link
                      href='https://t.me/neurox_community'
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      <Users className='mr-3 h-4 w-4 md:h-5 md:w-5' />В
                      СООБЩЕСТВО
                      <ExternalLink className='ml-3 h-4 w-4 md:h-5 md:w-5' />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Документация */}
              <Card className='h-full'>
                <CardHeader className='text-center pb-6'>
                  <div className='mx-auto mb-6 p-4 bg-blue-100 dark:bg-blue-900 rounded-full w-fit'>
                    <BookOpen className='h-8 w-8 md:h-10 md:w-10 text-blue-600 dark:text-blue-400' />
                  </div>
                  <CardTitle className='text-xl md:text-2xl'>
                    Документация
                  </CardTitle>
                  <CardDescription className='text-center text-sm md:text-base'>
                    Ознакомьтесь с официальной документацией, чтобы лучше понять
                    функционал нашего сервиса.
                  </CardDescription>
                </CardHeader>
                <CardContent className='pt-0'>
                  <Button
                    asChild
                    variant='outline'
                    className='w-full border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950 bg-transparent h-12 md:h-14 text-sm md:text-base'
                  >
                    <Link
                      href='https://docs.neurox.ru'
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      <BookOpen className='mr-3 h-4 w-4 md:h-5 md:w-5' />
                      ОТКРЫТЬ ДОКУМЕНТАЦИЮ
                      <ExternalLink className='ml-3 h-4 w-4 md:h-5 md:w-5' />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Дополнительная информация */}
            <div className='mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8'>
              <Card>
                <CardHeader>
                  <CardTitle className='text-lg md:text-xl'>
                    Часто задаваемые вопросы
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    <div>
                      <h4 className='font-medium text-sm md:text-base mb-2'>
                        Как создать нового агента?
                      </h4>
                      <p className='text-xs md:text-sm text-muted-foreground'>
                        Нажмите на кнопку "+" на главной странице и выберите
                        способ создания агента.
                      </p>
                    </div>
                    <div>
                      <h4 className='font-medium text-sm md:text-base mb-2'>
                        Как изменить модель GPT?
                      </h4>
                      <p className='text-xs md:text-sm text-muted-foreground'>
                        Перейдите в настройки агента и выберите нужную модель в
                        разделе "Выбор языковой модели".
                      </p>
                    </div>
                    <div>
                      <h4 className='font-medium text-sm md:text-base mb-2'>
                        Что такое температура?
                      </h4>
                      <p className='text-xs md:text-sm text-muted-foreground'>
                        Температура контролирует случайность ответов. Низкие
                        значения делают ответы более предсказуемыми.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className='text-lg md:text-xl'>
                    Контактная информация
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    <div>
                      <h4 className='font-medium text-sm md:text-base mb-2'>
                        Техническая поддержка
                      </h4>
                      <p className='text-xs md:text-sm text-muted-foreground'>
                        Доступна 24/7 через Telegram-бот
                      </p>
                    </div>
                    <div>
                      <h4 className='font-medium text-sm md:text-base mb-2'>
                        Время ответа
                      </h4>
                      <p className='text-xs md:text-sm text-muted-foreground'>
                        Обычно отвечаем в течение 2-4 часов
                      </p>
                    </div>
                    <div>
                      <h4 className='font-medium text-sm md:text-base mb-2'>
                        Языки поддержки
                      </h4>
                      <p className='text-xs md:text-sm text-muted-foreground'>
                        Русский, English
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
