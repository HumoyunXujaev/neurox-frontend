'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, Search, Pipette, Users, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { AmoCRMReferenceData } from '@/types/amocrm';

interface ReferenceDataManagerProps {
  referenceData: AmoCRMReferenceData | null;
  onRefresh: () => Promise<void>;
}

export function ReferenceDataManager({
  referenceData,
  onRefresh,
}: ReferenceDataManagerProps) {
  const [pipelineSearch, setPipelineSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await onRefresh();
      toast.success('Справочники обновлены');
    } catch (error) {
      console.error('Failed to refresh reference data:', error);
      toast.error('Ошибка обновления справочников');
    } finally {
      setIsRefreshing(false);
    }
  };

  const filteredPipelines =
    referenceData?.pipelines.filter((pipeline) =>
      pipeline.name.toLowerCase().includes(pipelineSearch.toLowerCase())
    ) || [];
  const filteredUsers =
    referenceData?.users.filter(
      (user) =>
        user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        user.email.toLowerCase().includes(userSearch.toLowerCase())
    ) || [];

  if (!referenceData) {
    return (
      <Card>
        <CardContent className='p-6 text-center'>
          <AlertCircle className='h-12 w-12 text-gray-400 mx-auto mb-4' />
          <h3 className='text-lg font-medium text-gray-900 mb-2'>
            Справочники не загружены
          </h3>
          <p className='text-gray-600 mb-4'>
            Нажмите кнопку "Обновить" для загрузки данных из AmoCRM
          </p>
          <Button onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`}
            />
            Загрузить справочники
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold'>Справочники AmoCRM</h2>
          <p className='text-gray-600'>
            Воронки, статусы и пользователи из вашего аккаунта AmoCRM
          </p>
        </div>
        <Button onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`}
          />
          Обновить
        </Button>
      </div>

      <Tabs defaultValue='pipelines' className='space-y-4'>
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value='pipelines' className='flex items-center gap-2'>
            <Pipette className='h-4 w-4' /> Воронки (
            {referenceData.pipelines.length})
          </TabsTrigger>
          <TabsTrigger value='users' className='flex items-center gap-2'>
            <Users className='h-4 w-4' /> Пользователи (
            {referenceData.users.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value='pipelines' className='space-y-4'>
          <div className='flex items-center gap-4'>
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
              <Input
                placeholder='Поиск воронок...'
                value={pipelineSearch}
                onChange={(e) => setPipelineSearch(e.target.value)}
                className='pl-10'
              />
            </div>
          </div>
          <div className='grid gap-4'>
            {filteredPipelines.map((pipeline) => (
              <Card key={pipeline.id}>
                <CardHeader>
                  <div className='flex items-center justify-between'>
                    <CardTitle className='text-lg'>{pipeline.name}</CardTitle>
                    <div className='flex items-center gap-2'>
                      {pipeline.is_main && (
                        <Badge variant='default'>Основная</Badge>
                      )}
                      {pipeline.is_unsorted_on && (
                        <Badge variant='secondary'>Неразобранное</Badge>
                      )}
                      {pipeline.is_archive && (
                        <Badge variant='outline'>Архив</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='space-y-3'>
                    <div className='text-sm text-gray-600'>
                      ID: {pipeline.id} • Сортировка: {pipeline.sort}
                    </div>
                    <div>
                      <h4 className='font-medium text-sm mb-2'>
                        Статусы ({pipeline.statuses.length}):
                      </h4>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
                        {pipeline.statuses.map((status) => (
                          <div
                            key={status.id}
                            className='flex items-center gap-2 p-2 border rounded-md'
                          >
                            <div
                              className='w-3 h-3 rounded-full'
                              style={{ backgroundColor: status.color }}
                            />
                            <span className='text-sm'>{status.name}</span>
                            <Badge variant='outline' className='text-xs'>
                              {status.id}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredPipelines.length === 0 && pipelineSearch && (
              <Card>
                <CardContent className='p-6 text-center'>
                  <Pipette className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                  <h3 className='text-lg font-medium text-gray-900 mb-2'>
                    Воронки не найдены
                  </h3>
                  <p className='text-gray-600'>
                    Попробуйте изменить поисковый запрос
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
        <TabsContent value='users' className='space-y-4'>
          <div className='flex items-center gap-4'>
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
              <Input
                placeholder='Поиск пользователей...'
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className='pl-10'
              />
            </div>
          </div>
          <div className='grid gap-4'>
            {filteredUsers.map((user) => (
              <Card key={user.id}>
                <CardContent className='p-4'>
                  <div className='flex items-center justify-between'>
                    <div className='space-y-1'>
                      <h3 className='font-medium'>{user.name}</h3>
                      <p className='text-sm text-gray-600'>{user.email}</p>
                      <div className='text-xs text-gray-500'>
                        ID: {user.id} {user.lang && ` • Язык: ${user.lang}`}
                      </div>
                    </div>
                    <div className='text-right'>
                      <Badge variant='outline' className='text-xs'>
                        {user.id}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredUsers.length === 0 && userSearch && (
              <Card>
                <CardContent className='p-6 text-center'>
                  <Users className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                  <h3 className='text-lg font-medium text-gray-900 mb-2'>
                    Пользователи не найдены
                  </h3>
                  <p className='text-gray-600'>
                    Попробуйте изменить поисковый запрос
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
