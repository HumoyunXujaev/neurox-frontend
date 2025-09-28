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
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Loader2,
  AlertTriangle,
  Settings,
  RefreshCw,
  ExternalLink,
  Bot,
  Pipette,
  Users,
  Activity,
} from 'lucide-react';
import { toast } from 'sonner';
import { amocrmClient } from '@/lib/api/amocrm-client';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import type {
  AmoCRMIntegration,
  AmoCRMPipelineBinding,
  AmoCRMReferenceData,
  ServiceBot,
} from '@/types/amocrm';
import { PipelineBindingsManager } from '@/components/amocrm/pipeline-bindings-manager';
import { ReferenceDataManager } from '@/components/amocrm/reference-data-manager';
import { LeadActionsManager } from '@/components/amocrm/lead-actions-manager';
import { apiClient } from '@/lib/api/client';

export default function AmoCRMPage() {
  const [integration, setIntegration] = useState<AmoCRMIntegration | null>(
    null
  );
  const [referenceData, setReferenceData] =
    useState<AmoCRMReferenceData | null>(null);
  const [bindings, setBindings] = useState<AmoCRMPipelineBinding[]>([]);
  const [serviceBots, setServiceBots] = useState<ServiceBot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [authUrl, setAuthUrl] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [integrationData, referenceData, bindingsData, botsData] =
        await Promise.all([
          amocrmClient.getIntegrationStatus().catch(() => null),
          amocrmClient.getReferenceData().catch(() => null),
          amocrmClient.getPipelineBindings().catch(() => []),
          apiClient.serviceBot
            .list({ limit: 1000 })
            .catch(() => ({ data: { results: [] } })),
        ]);
      setIntegration(integrationData);
      setReferenceData(referenceData);
      setBindings(bindingsData);
      setServiceBots(botsData.data.results || []);
    } catch (error) {
      console.error('Failed to load AmoCRM data:', error);
      toast.error('Ошибка загрузки данных AmoCRM');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuth = async () => {
    try {
      const { authorization_url } = await amocrmClient.getAuthorizationUrl();
      setAuthUrl(authorization_url);
      setShowAuthDialog(true);
    } catch (error) {
      console.error('Failed to get auth URL:', error);
      toast.error('Ошибка получения ссылки авторизации');
    }
  };

  const handleUpdateIntegration = async (data: Partial<AmoCRMIntegration>) => {
    try {
      setIsUpdating(true);
      const updated = await amocrmClient.updateIntegration(data);
      setIntegration(updated);
      toast.success('Настройки интеграции обновлены');
    } catch (error) {
      console.error('Failed to update integration:', error);
      toast.error('Ошибка обновления интеграции');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCreateBinding = async (data: any) => {
    try {
      const newBinding = await amocrmClient.createPipelineBinding(data);
      setBindings((prev) => [...prev, newBinding]);
      toast.success('Привязка создана');
    } catch (error: any) {
      console.error('Failed to create binding:', error);
      toast.error(error.response?.data?.detail || 'Ошибка создания привязки');
    }
  };

  const handleUpdateBinding = async (id: number, data: any) => {
    try {
      const updated = await amocrmClient.updatePipelineBinding(id, data);
      setBindings((prev) => prev.map((b) => (b.id === id ? updated : b)));
      toast.success('Привязка обновлена');
    } catch (error) {
      console.error('Failed to update binding:', error);
      toast.error('Ошибка обновления привязки');
    }
  };

  const handleDeleteBinding = async (id: number) => {
    try {
      await amocrmClient.deletePipelineBinding(id);
      setBindings((prev) => prev.filter((b) => b.id !== id));
      toast.success('Привязка удалена');
    } catch (error) {
      console.error('Failed to delete binding:', error);
      toast.error('Ошибка удаления привязки');
    }
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  return (
    <div className='flex min-h-screen bg-gray-50'>
      <Sidebar />
      <div className='flex-1 flex flex-col'>
        <Header />
        <main className='flex-1 p-6'>
          <div className='max-w-7xl mx-auto space-y-6'>
            <div className='flex items-center justify-between'>
              <div>
                <h1 className='text-3xl font-bold text-gray-900'>
                  AmoCRM Интеграция
                </h1>
                <p className='text-gray-600 mt-1'>
                  Управление интеграцией с AmoCRM и настройка автоматизации
                </p>
              </div>
              <Button onClick={loadData} variant='outline' size='sm'>
                <RefreshCw className='h-4 w-4 mr-2' />
                Обновить
              </Button>
            </div>
            {!integration ? (
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <AlertTriangle className='h-5 w-5 text-orange-500' />
                    Интеграция не настроена
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='text-gray-600 mb-4'>
                    Для начала работы с AmoCRM необходимо подключить интеграцию.
                  </p>
                  <Button onClick={handleAuth} className='w-full'>
                    <ExternalLink className='h-4 w-4 mr-2' />
                    Подключить AmoCRM
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Tabs defaultValue='overview' className='space-y-6'>
                <TabsList className='grid w-full grid-cols-4'>
                  <TabsTrigger value='overview'>Обзор</TabsTrigger>
                  <TabsTrigger value='bindings'>Привязки</TabsTrigger>
                  <TabsTrigger value='reference'>Справочники</TabsTrigger>
                  <TabsTrigger value='actions'>Действия</TabsTrigger>
                </TabsList>

                <TabsContent value='overview' className='space-y-6'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <Card>
                      <CardHeader>
                        <CardTitle className='flex items-center gap-2'>
                          <Settings className='h-5 w-5' /> Статус интеграции
                        </CardTitle>
                      </CardHeader>
                      <CardContent className='space-y-4'>
                        <div className='flex items-center justify-between'>
                          <span className='text-sm font-medium'>Статус</span>
                          <Badge
                            variant={
                              integration.is_active ? 'default' : 'secondary'
                            }
                          >
                            {integration.is_active ? 'Активна' : 'Неактивна'}
                          </Badge>
                        </div>
                        <div className='flex items-center justify-between'>
                          <span className='text-sm font-medium'>
                            Авторизация
                          </span>
                          <Badge
                            variant={
                              integration.is_authenticated
                                ? 'default'
                                : 'destructive'
                            }
                          >
                            {integration.is_authenticated
                              ? 'Авторизована'
                              : 'Не авторизована'}
                          </Badge>
                        </div>
                        <div className='flex items-center justify-between'>
                          <span className='text-sm font-medium'>Домен</span>
                          <span className='text-sm text-gray-600'>
                            {integration.base_domain || 'Не указан'}
                          </span>
                        </div>
                        {!integration.is_authenticated && (
                          <Button onClick={handleAuth} className='w-full mt-4'>
                            <ExternalLink className='h-4 w-4 mr-2' />{' '}
                            Авторизоваться
                          </Button>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className='flex items-center gap-2'>
                          <Activity className='h-5 w-5' /> Режимы работы
                        </CardTitle>
                      </CardHeader>
                      <CardContent className='space-y-4'>
                        <Alert>
                          <AlertTriangle className='h-4 w-4' />
                          <AlertDescription className='text-xs'>
                            Выберите один основной режим работы.
                            NeuroX-центричный: каналы подключаются в NeuroX.
                            AmoCRM-центричный: каналы подключены в AmoCRM,
                            NeuroX работает как AI-ассистент.
                          </AlertDescription>
                        </Alert>
                        <div className='flex items-center justify-between'>
                          <Label
                            htmlFor='neurox-mode'
                            className='text-sm font-medium'
                          >
                            NeuroX-центричный
                          </Label>
                          <Switch
                            id='neurox-mode'
                            checked={integration.neurox_mode_enabled}
                            onCheckedChange={(checked) =>
                              handleUpdateIntegration({
                                neurox_mode_enabled: checked,
                                amocrm_mode_enabled: !checked,
                              })
                            }
                            disabled={isUpdating}
                          />
                        </div>
                        <div className='flex items-center justify-between'>
                          <Label
                            htmlFor='amocrm-mode'
                            className='text-sm font-medium'
                          >
                            AmoCRM-центричный
                          </Label>
                          <Switch
                            id='amocrm-mode'
                            checked={integration.amocrm_mode_enabled}
                            onCheckedChange={(checked) =>
                              handleUpdateIntegration({
                                amocrm_mode_enabled: checked,
                                neurox_mode_enabled: !checked,
                              })
                            }
                            disabled={isUpdating}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className='flex items-center gap-2'>
                        <Pipette className='h-5 w-5' /> Привязки воронок
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className='space-y-2'>
                        {bindings.length === 0 ? (
                          <p className='text-gray-500 text-sm'>
                            Привязки не настроены
                          </p>
                        ) : (
                          bindings.map((binding) => (
                            <div
                              key={binding.id}
                              className='flex items-center justify-between p-3 border rounded-lg'
                            >
                              <div>
                                <p className='font-medium'>
                                  {binding.pipeline_name ||
                                    `Воронка ${binding.pipeline_id}`}
                                </p>
                                <p className='text-sm text-gray-500'>
                                  Бот ID: {binding.service_bot_id} • Статусов:{' '}
                                  {binding.allowed_status_ids.length}
                                </p>
                              </div>
                              <Badge
                                variant={
                                  binding.active ? 'default' : 'secondary'
                                }
                              >
                                {binding.active ? 'Активна' : 'Неактивна'}
                              </Badge>
                            </div>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value='bindings'>
                  <PipelineBindingsManager
                    bindings={bindings}
                    referenceData={referenceData}
                    serviceBots={serviceBots}
                    onCreate={handleCreateBinding}
                    onUpdate={handleUpdateBinding}
                    onDelete={handleDeleteBinding}
                  />
                </TabsContent>

                <TabsContent value='reference'>
                  <ReferenceDataManager
                    referenceData={referenceData}
                    onRefresh={loadData}
                  />
                </TabsContent>

                <TabsContent value='actions'>
                  <LeadActionsManager />
                </TabsContent>
              </Tabs>
            )}
          </div>
        </main>
      </div>

      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Авторизация в AmoCRM</DialogTitle>
            <DialogDescription>
              Для подключения интеграции необходимо авторизоваться в вашем
              аккаунте AmoCRM
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4'>
            <p className='text-sm text-gray-600'>
              Нажмите на кнопку ниже, чтобы перейти к авторизации в AmoCRM
            </p>
            <Button
              onClick={() => window.open(authUrl, '_blank')}
              className='w-full'
            >
              <ExternalLink className='h-4 w-4 mr-2' />
              Открыть AmoCRM
            </Button>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setShowAuthDialog(false)}>
              Отмена
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
