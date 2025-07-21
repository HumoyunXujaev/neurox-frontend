'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Settings, Bell } from 'lucide-react';
import { useState } from 'react';

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationPanel({ open, onClose }: NotificationPanelProps) {
  const [activeTab, setActiveTab] = useState<
    'updates' | 'news' | 'notifications'
  >('updates');

  if (!open) return null;

  const updates = [
    {
      id: 1,
      date: '19 июня 2025',
      title: 'Настройки агента',
      items: [
        {
          title: 'Очистка markdown разметки',
          description:
            'Добавили опцию для автоматической очистки текста от Markdown-разметки. Теперь нет необходимости указывать в промпте «НЕ ИСПОЛЬЗУЙ MARKDOWN» — текст очистится от форматирования при отправке.',
        },
        {
          title: 'Отправка изображений ИИ-агентом',
          description:
            'Добавили опцию отправлять изображения в мессенджеры, ссылка будет отправлена в виде изображения. Реализовали возможность автоматически удалять ссылки на изображения из сообщения.',
        },
        {
          title: 'Работа с файлами',
          description:
            'Разделили настройку стандартного ответа: голосовые сообщения, изображения, прочие файлы',
        },
      ],
    },
    {
      id: 2,
      date: '11 июня 2025',
      title: 'Снижение цены',
      description: 'Модель GPT-4o',
    },
  ];

  return (
    <div className='fixed inset-0 z-[100000] bg-black/20' onClick={onClose}>
      <div
        className='absolute right-0 top-14 md:top-16 lg:top-16 h-[calc(100vh-3.5rem)] md:h-[calc(100vh-4rem)] lg:h-[calc(100vh-4rem)] w-full sm:w-120 bg-background border-l shadow-lg'
        onClick={(e) => e.stopPropagation()}
      >
        <div className='flex h-full flex-col'>
          <div className='flex items-center justify-between p-3 md:p-4 border-b'>
            <div className='flex gap-1 sm:gap-2 overflow-x-auto'>
              <Button
                variant={activeTab === 'updates' ? 'default' : 'ghost'}
                size='sm'
                onClick={() => setActiveTab('updates')}
                className={`text-xs whitespace-nowrap ${
                  activeTab === 'updates'
                    ? 'bg-purple-600 hover:bg-purple-700'
                    : ''
                }`}
              >
                ОБНОВЛЕНИЯ
              </Button>
              <Button
                variant={activeTab === 'news' ? 'default' : 'ghost'}
                size='sm'
                onClick={() => setActiveTab('news')}
                className='text-xs whitespace-nowrap'
              >
                <Settings className='h-3 w-3 mr-1' />
                НОВОСТИ
              </Button>
              <Button
                variant={activeTab === 'notifications' ? 'default' : 'ghost'}
                size='sm'
                onClick={() => setActiveTab('notifications')}
                className='text-xs whitespace-nowrap'
              >
                <Bell className='h-3 w-3 mr-1' />
                УВЕДОМЛЕНИЯ
              </Button>
            </div>
            <Button
              variant='ghost'
              size='icon'
              onClick={onClose}
              className='h-8 w-8 flex-shrink-0'
            >
              <X className='h-4 w-4' />
            </Button>
          </div>

          <ScrollArea className='flex-1 p-3 md:p-4'>
            {activeTab === 'updates' && (
              <div className='space-y-4 md:space-y-6'>
                {updates.map((update) => (
                  <div key={update.id} className='space-y-3 md:space-y-4'>
                    <div className='flex items-center gap-2'>
                      <Badge
                        variant='outline'
                        className='text-purple-600 border-purple-600 text-xs'
                      >
                        Обновление от {update.date}
                      </Badge>
                    </div>

                    <Card>
                      <CardHeader className='pb-2 md:pb-3'>
                        <CardTitle className='text-sm md:text-base'>
                          {update.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className='space-y-3 md:space-y-4'>
                        {update.items?.map((item, index) => (
                          <div key={index} className='space-y-1 md:space-y-2'>
                            <h4 className='font-medium text-xs md:text-sm'>
                              {item.title}
                            </h4>
                            <p className='text-xs leading-relaxed text-muted-foreground'>
                              {item.description}
                            </p>
                          </div>
                        ))}
                        {update.description && (
                          <p className='text-xs md:text-sm text-muted-foreground'>
                            {update.description}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'news' && (
              <div className='space-y-4'>
                <Card>
                  <CardHeader>
                    <CardTitle className='text-sm md:text-base'>
                      Новости платформы
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className='text-xs md:text-sm text-muted-foreground'>
                      Здесь будут отображаться последние новости и анонсы
                      платформы.
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className='space-y-4'>
                <Card>
                  <CardHeader>
                    <CardTitle className='text-sm md:text-base'>
                      Уведомления
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className='text-xs md:text-sm text-muted-foreground'>
                      У вас нет новых уведомлений.
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
