'use client';
import { Header } from '@/components/header';
import { Sidebar } from '@/components/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Users, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export default function IntegrationsPage() {
  const handleConnect = () => {
    toast.info('Функция находится в разработке');
  };

  return (
    <div className='flex h-screen bg-background'>
      <div className='hidden md:block w-68 flex-shrink-0'>
        <Sidebar />
      </div>
      <div className='flex-1 flex flex-col min-w-0'>
        <Header />
        <main className='flex-1 p-4 md:p-6 overflow-auto'>
          <div className='max-w-7xl mx-auto space-y-6'>
            <div>
              <h1 className='text-2xl md:text-3xl font-bold mb-2'>
                Интеграции
              </h1>
              <p className='text-muted-foreground'>
                Подключайте внешние сервисы для расширения возможностей ваших
                агентов
              </p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              <Card className='hover:shadow-lg transition-shadow cursor-pointer'>
                <CardHeader className='pb-4'>
                  <div className='flex items-center justify-between mb-3'>
                    <div className='flex items-center gap-3'>
                      <div className='w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center'>
                        <Users className='h-6 w-6 text-white' />
                      </div>
                      <CardTitle className='text-lg'>amoCRM</CardTitle>
                    </div>
                    <Badge className='bg-purple-600 hover:bg-purple-700 text-white text-xs'>
                      Premium
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className='text-sm text-muted-foreground mb-4'>
                    Интеграция с CRM-системой для автоматизации работы с
                    клиентами и сделками
                  </p>
                  <ul className='text-xs text-muted-foreground space-y-1 mb-4'>
                    <li>• Создание и обновление сделок</li>
                    <li>• Работа с контактами</li>
                    <li>• Автоматизация воронки продаж</li>
                  </ul>

                  <Alert className='bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-600 mb-4'>
                    <AlertTriangle className='h-4 w-4 text-amber-600' />
                    <AlertDescription className='text-amber-800 dark:text-amber-200 text-xs'>
                      Требуется тариф Premium
                    </AlertDescription>
                  </Alert>

                  <Button
                    onClick={handleConnect}
                    className='w-full bg-blue-600 hover:bg-blue-700 text-white'
                  >
                    <ExternalLink className='mr-2 h-4 w-4' />
                    Подключить
                  </Button>
                </CardContent>
              </Card>

              {[
                {
                  name: 'Bitrix24',
                  icon: '🏢',
                  desc: 'CRM и управление проектами',
                },
                {
                  name: 'Telegram',
                  icon: '📱',
                  desc: 'Мессенджер для бизнеса',
                },
                { name: 'WhatsApp', icon: '💬', desc: 'Популярный мессенджер' },
                { name: 'Instagram', icon: '📷', desc: 'Социальная сеть' },
                {
                  name: 'VKontakte',
                  icon: '🔵',
                  desc: 'Российская социальная сеть',
                },
                { name: 'Авито', icon: '🏠', desc: 'Доска объявлений' },
                {
                  name: 'Google Sheets',
                  icon: '📊',
                  desc: 'Электронные таблицы',
                },
                { name: 'Notion', icon: '📝', desc: 'База знаний и заметки' },
              ].map((integration, index) => (
                <Card
                  key={index}
                  className='opacity-60 cursor-not-allowed relative overflow-hidden'
                >
                  <div className='absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-[1px] z-10 flex items-center justify-center'>
                    <div className='bg-background/90 backdrop-blur-sm border border-border rounded-lg px-4 py-2 shadow-lg'>
                      <span className='text-sm font-medium text-foreground'>
                        Скоро доступно
                      </span>
                    </div>
                  </div>
                  <CardHeader className='pb-4'>
                    <div className='flex items-center gap-3 mb-3'>
                      <div className='w-10 h-10 bg-gray-500 rounded-lg flex items-center justify-center text-xl'>
                        {integration.icon}
                      </div>
                      <CardTitle className='text-lg'>
                        {integration.name}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className='text-sm text-muted-foreground mb-4'>
                      {integration.desc}
                    </p>
                    <Button disabled className='w-full'>
                      Скоро доступно
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
