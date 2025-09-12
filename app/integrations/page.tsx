'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Loader2,
  AlertTriangle,
  CheckCircle,
  Users,
  ExternalLink,
  Settings,
  RefreshCw,
  Shield,
  Zap,
  ArrowRight,
  Link2,
  Database,
  Activity,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api/client';
import { useAuth } from '@/contexts/auth-context';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';

interface AmoCRMIntegration {
  id: number;
  company_id: number;
  is_active: boolean;
  base_domain?: string;
  sync_enabled: boolean;
  auto_create_lead: boolean;
  auto_create_contact: boolean;
  auto_create_task: boolean;
  default_pipeline_id?: number;
  default_status_id?: number;
  last_sync_at?: string;
  created_at: string;
  updated_at: string;
}

export default function AmoCRMIntegrationComponent() {
  const { user } = useAuth();
  const [integration, setIntegration] = useState<AmoCRMIntegration | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showSetupDialog, setShowSetupDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);

  // Проверка статуса интеграции
  const checkIntegrationStatus = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.backend.request({
        method: 'GET',
        url: '/api/v1/integration/amocrm/status',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (response.data) {
        setIntegration(response.data);
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        // Интеграция не настроена
        setIntegration(null);
      } else {
        console.error('Error checking integration:', error);
        toast.error('Ошибка при проверке интеграции');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Начальная настройка интеграции
  const setupIntegration = async () => {
    try {
      setIsConnecting(true);

      const response = await apiClient.backend.request({
        method: 'POST',
        url: '/api/v1/integration/amocrm/setup',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        data: null,
      });

      if (response.data) {
        setIntegration(response.data);
        setShowSetupDialog(false);
        toast.success('Интеграция создана. Теперь авторизуйтесь в AmoCRM');

        // Запускаем OAuth авторизацию
        setTimeout(() => startOAuthFlow(), 1000);
      }
    } catch (error: any) {
      console.error('Setup error:', error);
      toast.error(
        error.response?.data?.detail || 'Ошибка настройки интеграции'
      );
    } finally {
      setIsConnecting(false);
    }
  };

  // OAuth авторизация
  const startOAuthFlow = async () => {
    try {
      setIsConnecting(true);

      const response = await apiClient.backend.request({
        method: 'GET',
        url: '/api/v1/integration/amocrm/oauth/authorize',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (response.data?.authorization_url) {
        // Открываем окно авторизации
        const authWindow = window.open(
          response.data.authorization_url,
          'AmoCRM Authorization',
          'width=600,height=700,toolbar=no,menubar=no'
        );

        // Отслеживаем закрытие окна
        const checkInterval = setInterval(() => {
          if (authWindow?.closed) {
            clearInterval(checkInterval);
            checkIntegrationStatus();
            setIsConnecting(false);
          }
        }, 1000);
      }
    } catch (error: any) {
      console.error('OAuth error:', error);
      toast.error('Ошибка авторизации');
      setIsConnecting(false);
    }
  };

  // Отключение интеграции
  const disconnectIntegration = async () => {
    if (!confirm('Вы уверены что хотите отключить интеграцию с AmoCRM?'))
      return;

    try {
      await apiClient.backend.request({
        method: 'DELETE',
        url: '/api/v1/integration/amocrm',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      setIntegration(null);
      toast.success('Интеграция отключена');
    } catch (error: any) {
      console.error('Disconnect error:', error);
      toast.error('Ошибка при отключении');
    }
  };

  // Синхронизация данных
  const syncData = async () => {
    try {
      const response = await apiClient.backend.request({
        method: 'POST',
        url: '/api/v1/integration/amocrm/sync',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        data: {
          sync_type: 'full',
          entity_types: ['leads', 'contacts'],
        },
      });

      toast.success('Синхронизация запущена');
    } catch (error: any) {
      toast.error('Ошибка синхронизации');
    }
  };

  useEffect(() => {
    checkIntegrationStatus();
  }, []);

  if (isLoading) {
    return (
      <Card className='hover:shadow-lg transition-all duration-300'>
        <CardContent className='flex items-center justify-center py-12'>
          <Loader2 className='h-8 w-8 animate-spin text-purple-600' />
        </CardContent>
      </Card>
    );
  }

  // Если интеграция не настроена
  if (!integration) {
    return (
      <>
        <div className='flex h-screen bg-background'>
          <div className='hidden md:block w-68 flex-shrink-0'>
            <Sidebar />
          </div>
          <div className='flex-1 flex flex-col min-w-0'>
            <Header />
            <main className='flex-1 p-6 overflow-auto'>
              <div className='max-w-4xl mx-auto'>
                <Card className='hover:shadow-lg transition-all duration-300 border-2 hover:border-purple-200 dark:hover:border-purple-800'>
                  <CardHeader className='pb-4'>
                    <div className='flex items-center justify-between mb-3'>
                      <div className='flex items-center gap-3'>
                        <div className='w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg'>
                          <Users className='h-7 w-7 text-white' />
                        </div>
                        <div>
                          <CardTitle className='text-xl font-bold'>
                            AmoCRM
                          </CardTitle>
                          <p className='text-xs text-muted-foreground mt-1'>
                            CRM система
                          </p>
                        </div>
                      </div>
                      <Badge className='bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xs px-3 py-1'>
                        Premium
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className='text-sm text-muted-foreground mb-4'>
                      Интеграция с CRM-системой для автоматизации работы с
                      клиентами и сделками
                    </p>

                    <div className='space-y-3 mb-6'>
                      <div className='flex items-start gap-2'>
                        <Zap className='h-4 w-4 text-purple-600 mt-0.5' />
                        <div>
                          <p className='text-sm font-medium'>
                            Автоматическое создание сделок
                          </p>
                          <p className='text-xs text-muted-foreground'>
                            Каждое обращение создает лид в AmoCRM
                          </p>
                        </div>
                      </div>
                      <div className='flex items-start gap-2'>
                        <Database className='h-4 w-4 text-purple-600 mt-0.5' />
                        <div>
                          <p className='text-sm font-medium'>
                            Синхронизация контактов
                          </p>
                          <p className='text-xs text-muted-foreground'>
                            Автоматический импорт данных клиентов
                          </p>
                        </div>
                      </div>
                      <div className='flex items-start gap-2'>
                        <Activity className='h-4 w-4 text-purple-600 mt-0.5' />
                        <div>
                          <p className='text-sm font-medium'>Воронка продаж</p>
                          <p className='text-xs text-muted-foreground'>
                            Управление этапами сделок из чата
                          </p>
                        </div>
                      </div>
                    </div>

                    <Alert className='bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-600 mb-4'>
                      <AlertTriangle className='h-4 w-4 text-amber-600' />
                      <AlertDescription className='text-amber-800 dark:text-amber-200 text-xs'>
                        Требуется тариф Premium для полного функционала
                      </AlertDescription>
                    </Alert>

                    <Button
                      onClick={() => setShowSetupDialog(true)}
                      className='w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg'
                      disabled={isConnecting}
                    >
                      {isConnecting ? (
                        <>
                          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                          Подключение...
                        </>
                      ) : (
                        <>
                          <Link2 className='mr-2 h-4 w-4' />
                          Подключить AmoCRM
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Диалог настройки */}
                <Dialog
                  open={showSetupDialog}
                  onOpenChange={setShowSetupDialog}
                >
                  <DialogContent className='sm:max-w-md'>
                    <DialogHeader>
                      <DialogTitle>Настройка интеграции AmoCRM</DialogTitle>
                    </DialogHeader>
                    <DialogFooter>
                      <Button
                        variant='outline'
                        onClick={() => setShowSetupDialog(false)}
                      >
                        Отмена
                      </Button>
                      <Button
                        onClick={setupIntegration}
                        disabled={isConnecting}
                        className='bg-purple-600 hover:bg-purple-700 text-white'
                      >
                        {isConnecting ? (
                          <>
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            Настройка...
                          </>
                        ) : (
                          <>
                            <ArrowRight className='mr-2 h-4 w-4' />
                            Продолжить
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </main>
          </div>
        </div>
      </>
    );
  }

  // Если интеграция настроена
  return (
    <>
      <div className='flex h-screen bg-background'>
        <div className='hidden md:block w-68 flex-shrink-0'>
          <Sidebar />
        </div>
        <div className='flex-1 flex flex-col min-w-0'>
          <Header />
          <main className='flex-1 p-6 overflow-auto'>
            <div className='max-w-4xl mx-auto'>
              <Card className='hover:shadow-lg transition-all duration-300 border-2 border-green-200 dark:border-green-800'>
                <CardHeader className='pb-4'>
                  <div className='flex items-center justify-between mb-3'>
                    <div className='flex items-center gap-3'>
                      <div className='w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg'>
                        <CheckCircle className='h-7 w-7 text-white' />
                      </div>
                      <div>
                        <CardTitle className='text-xl font-bold'>
                          AmoCRM
                        </CardTitle>
                        <p className='text-xs text-muted-foreground mt-1'>
                          {integration.base_domain || 'Подключено'}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Badge className='bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'>
                        <CheckCircle className='h-3 w-3 mr-1' />
                        Активно
                      </Badge>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => setShowSettingsDialog(true)}
                        className='h-8 w-8'
                      >
                        <Settings className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    {/* Статистика */}
                    <div className='grid grid-cols-3 gap-3'>
                      <div className='bg-gray-50 dark:bg-gray-800 rounded-lg p-3'>
                        <p className='text-xs text-muted-foreground mb-1'>
                          Pipeline ID
                        </p>
                        <p className='text-sm font-bold'>
                          {integration.default_pipeline_id || 'Не задан'}
                        </p>
                      </div>
                      <div className='bg-gray-50 dark:bg-gray-800 rounded-lg p-3'>
                        <p className='text-xs text-muted-foreground mb-1'>
                          Status ID
                        </p>
                        <p className='text-sm font-bold'>
                          {integration.default_status_id || 'Не задан'}
                        </p>
                      </div>
                      <div className='bg-gray-50 dark:bg-gray-800 rounded-lg p-3'>
                        <p className='text-xs text-muted-foreground mb-1'>
                          Синхронизация
                        </p>
                        <p className='text-sm font-bold'>
                          {integration.sync_enabled ? 'Вкл' : 'Выкл'}
                        </p>
                      </div>
                    </div>

                    {/* Настройки автоматизации */}
                    <div className='space-y-2'>
                      <div className='flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-800 rounded-lg'>
                        <span className='text-sm'>
                          Создавать лиды автоматически
                        </span>
                        <Badge
                          variant={
                            integration.auto_create_lead
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {integration.auto_create_lead ? 'Да' : 'Нет'}
                        </Badge>
                      </div>
                      <div className='flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-800 rounded-lg'>
                        <span className='text-sm'>
                          Создавать контакты автоматически
                        </span>
                        <Badge
                          variant={
                            integration.auto_create_contact
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {integration.auto_create_contact ? 'Да' : 'Нет'}
                        </Badge>
                      </div>
                      <div className='flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-800 rounded-lg'>
                        <span className='text-sm'>
                          Создавать задачи автоматически
                        </span>
                        <Badge
                          variant={
                            integration.auto_create_task
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {integration.auto_create_task ? 'Да' : 'Нет'}
                        </Badge>
                      </div>
                    </div>

                    {/* Последняя синхронизация */}
                    {integration.last_sync_at && (
                      <div className='flex items-center justify-between text-xs text-muted-foreground'>
                        <span>Последняя синхронизация:</span>
                        <span>
                          {new Date(integration.last_sync_at).toLocaleString(
                            'ru-RU'
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Диалог настроек */}
              <Dialog
                open={showSettingsDialog}
                onOpenChange={setShowSettingsDialog}
              >
                <DialogContent className='sm:max-w-lg'>
                  <DialogHeader>
                    <DialogTitle>Настройки интеграции AmoCRM</DialogTitle>
                    <DialogDescription>
                      Управление параметрами синхронизации и автоматизации
                    </DialogDescription>
                  </DialogHeader>

                  <div className='space-y-4 py-4'>
                    <Alert className='bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-600'>
                      <Activity className='h-4 w-4 text-blue-600' />
                      <AlertDescription className='text-blue-800 dark:text-blue-200 text-xs'>
                        Изменения вступят в силу при следующей синхронизации
                      </AlertDescription>
                    </Alert>

                    <div className='space-y-3'>
                      <p className='text-sm font-medium'>
                        Информация об интеграции
                      </p>
                      <div className='space-y-2 text-sm'>
                        <div className='flex justify-between'>
                          <span className='text-muted-foreground'>
                            ID интеграции:
                          </span>
                          <span className='font-mono'>{integration.id}</span>
                        </div>
                        <div className='flex justify-between'>
                          <span className='text-muted-foreground'>Домен:</span>
                          <span>{integration.base_domain}</span>
                        </div>
                        <div className='flex justify-between'>
                          <span className='text-muted-foreground'>
                            Создана:
                          </span>
                          <span>
                            {new Date(
                              integration.created_at
                            ).toLocaleDateString('ru-RU')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      variant='outline'
                      onClick={() => setShowSettingsDialog(false)}
                    >
                      Закрыть
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
