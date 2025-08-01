'use client';

import type React from 'react';

import { useState } from 'react';
import { Header } from '@/components/header';
import { Sidebar } from '@/components/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertTriangle,
  Calendar,
  Database,
  Users,
  Plane,
  Volume2,
  FileText,
  BarChart3,
  Briefcase,
  ExternalLink,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';

interface Integration {
  id: string;
  name: string;
  icon: React.ReactNode;
  badge?: 'Premium' | 'Beta';
  description: string[];
  status: 'connected' | 'disconnected' | 'premium-required';
  category: string;
}

const integrations: Integration[] = [
  {
    id: 'bitrix',
    name: 'Bitrix',
    icon: <Database className='h-6 w-6' />,
    badge: 'Premium',
    description: [
      'Передача диалогов агента в CRM',
      'Подключение чатботов в открытые линии',
      'Использование данных клиентов для помощи в продажах',
      'Автоматизация работы со сделками и лидами (создание, заполнение, перемещение)',
      'Передача данных клиентов из CRM для персонализированных ответов',
    ],
    status: 'premium-required',
    category: 'CRM',
  },
  {
    id: 'amocrm',
    name: 'amoCRM',
    icon: <Users className='h-6 w-6' />,
    badge: 'Premium',
    description: [
      'Интеграция мессенджеров через Nextbot или напрямую с amoCRM',
      'Подключение агентов к любым воронкам и этапам продаж',
      'Использование второго пилота для поддержки продаж',
      'Автоматическое заполнение и перемещение сделок по воронке',
    ],
    status: 'premium-required',
    category: 'CRM',
  },
  {
    id: 'uon-travel',
    name: 'U-ON Travel',
    icon: <Plane className='h-6 w-6' />,
    badge: 'Premium',
    description: [
      'Создание и заполнение карточек туристов',
      'Обработка обращений',
      'Автоматическое внесение данных клиентов и их запросов',
      'Помощь в ведении базы туристов и управлении заявками',
    ],
    status: 'premium-required',
    category: 'Travel',
  },
  {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    icon: <Volume2 className='h-6 w-6' />,
    badge: 'Premium',
    description: [
      'Создание и использование персонализированного голоса для повышения эффективности и привлекательности коммуникации с клиентами',
    ],
    status: 'premium-required',
    category: 'AI',
  },
  {
    id: 'notion',
    name: 'Notion',
    icon: <FileText className='h-6 w-6' />,
    badge: 'Premium',
    description: [
      'Получение информации о товарах и услугах из вашей базы данных Notion по любым запросам клиента',
    ],
    status: 'premium-required',
    category: 'Productivity',
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    icon: <Calendar className='h-6 w-6' />,
    description: [
      'Создание, перенос и отмена записей на услуги и мероприятия',
      'Проверка свободного времени',
      'Напоминания о предстоящих событиях',
    ],
    status: 'disconnected',
    category: 'Calendar',
  },
  {
    id: 'yclients',
    name: 'YClients',
    icon: <Briefcase className='h-6 w-6' />,
    badge: 'Beta',
    description: [
      'Создание, перенос и отмена записей на услуги и мероприятия',
      'Проверка свободного времени',
    ],
    status: 'disconnected',
    category: 'Business',
  },
  {
    id: 'yandex-metrika',
    name: 'Yandex Metrika',
    icon: <BarChart3 className='h-6 w-6' />,
    description: ['Передача данных в Яндекс.Метрику'],
    status: 'disconnected',
    category: 'Analytics',
  },
];

export default function IntegrationsPage() {
  const [selectedIntegration, setSelectedIntegration] =
    useState<Integration | null>(null);
  const [connectionStates, setConnectionStates] = useState<
    Record<string, 'connected' | 'disconnected' | 'premium-required'>
  >({});

  const handleConnect = (integrationId: string) => {
    setConnectionStates((prev) => ({
      ...prev,
      [integrationId]: 'connected',
    }));
    toast.success('Интеграция подключена успешно');
  };

  const handleDisconnect = (integrationId: string) => {
    setConnectionStates((prev) => ({
      ...prev,
      [integrationId]: 'disconnected',
    }));
    toast.success('Интеграция отключена');
  };

  const getIntegrationStatus = (integration: Integration) => {
    return connectionStates[integration.id] || integration.status;
  };

  const renderIntegrationDetail = (integration: Integration) => {
    const status = getIntegrationStatus(integration);

    if (status === 'premium-required') {
      return (
        <div className='space-y-6'>
          <div>
            <h1 className='text-xl md:text-2xl font-bold mb-2'>
              Интеграции / {integration.name}
            </h1>
          </div>

          <Card className='bg-card border-border'>
            <CardHeader>
              <CardTitle className='text-foreground'>Премиум-функции</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className='bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-600'>
                <AlertTriangle className='h-4 w-4 text-amber-600 dark:text-amber-500' />
                <AlertDescription className='text-foreground'>
                  Для доступа к этой функции необходим тариф Премиум. Для
                  получения доступа купите{' '}
                  <a
                    href='#'
                    className='text-purple-400 hover:text-purple-300 underline'
                  >
                    соответствующую подписку.
                  </a>
                  
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className='space-y-6'>
        <div>
          <h1 className='text-xl md:text-2xl font-bold mb-2'>
            Интеграции / {integration.name}
          </h1>
        </div>

        <Card className='bg-card border-border'>
          <CardHeader>
            <CardTitle className='text-foreground'>
              Подключение {integration.name}
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center gap-2'>
              <span className='text-muted-foreground'>Статус подключения:</span>
              {status === 'connected' ? (
                <div className='flex items-center gap-1'>
                  <CheckCircle className='h-4 w-4 text-green-500' />
                  <span className='text-green-400'>Подключено</span>
                </div>
              ) : (
                <div className='flex items-center gap-1'>
                  <XCircle className='h-4 w-4 text-red-500' />
                  <span className='text-red-400'>Не подключено</span>
                </div>
              )}
            </div>

            <div className='flex gap-3'>
              {status === 'connected' ? (
                <Button
                  variant='destructive'
                  onClick={() => handleDisconnect(integration.id)}
                  className='bg-gray-600 hover:bg-gray-700'
                >
                  <XCircle className='mr-2 h-4 w-4' />
                  ОТКЛЮЧИТЬ
                </Button>
              ) : (
                <Button
                  onClick={() => handleConnect(integration.id)}
                  className='bg-purple-600 hover:bg-purple-700'
                >
                  <ExternalLink className='mr-2 h-4 w-4' />
                  ПОДКЛЮЧИТЬ
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderIntegrationGrid = () => (
    <div className='space-y-6'>
      <div>
        <h1 className='text-xl md:text-2xl font-bold mb-2'>Интеграции</h1>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6'>
        {integrations.map((integration) => {
          const status = getIntegrationStatus(integration);

          return (
            <Card
              key={integration.id}
              className='bg-card border-border cursor-pointer hover:bg-muted/50 transition-colors'
              onClick={() => setSelectedIntegration(integration)}
            >
              <CardHeader className='pb-3'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <div className='p-2 bg-muted rounded-lg'>
                      {integration.icon}
                    </div>
                    <CardTitle className='text-foreground text-base md:text-lg'>
                      {integration.name}
                    </CardTitle>
                  </div>
                  {integration.badge && (
                    <Badge
                      variant={
                        integration.badge === 'Premium'
                          ? 'default'
                          : 'secondary'
                      }
                      className={
                        integration.badge === 'Premium'
                          ? 'bg-purple-600 hover:bg-purple-700 text-xs'
                          : 'bg-blue-600 hover:bg-blue-700 text-xs'
                      }
                    >
                      {integration.badge}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ul className='space-y-2 text-sm text-muted-foreground'>
                  {integration.description.map((item, index) => (
                    <li key={index} className='flex items-start gap-2'>
                      <span className='text-purple-400 mt-1'>•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className='flex h-screen bg-background'>
      {/* Desktop Sidebar */}
      <div className='hidden md:block w-68 flex-shrink-0'>
        <Sidebar />
      </div>

      <div className='flex-1 flex flex-col min-w-0'>
        <Header />
        <main className='flex-1 p-4 md:p-6 overflow-auto bg-gray-50 dark:bg-gray-900'>
          <div className='max-w-7xl mx-auto'>
            {selectedIntegration ? (
              <div className='space-y-4'>
                <Button
                  variant='ghost'
                  onClick={() => setSelectedIntegration(null)}
                  className='text-muted-foreground hover:text-foreground mb-4'
                >
                  ← Назад к интеграциям
                </Button>
                {renderIntegrationDetail(selectedIntegration)}
              </div>
            ) : (
              renderIntegrationGrid()
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
