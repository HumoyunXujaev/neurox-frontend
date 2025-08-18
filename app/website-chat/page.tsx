'use client';
import { Header } from '@/components/header';
import { Sidebar } from '@/components/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';

export default function WebsiteChatPage() {
  return (
    <div className='flex h-screen bg-background'>
      <div className='hidden md:block w-68 flex-shrink-0'>
        <Sidebar />
      </div>
      <div className='flex-1 flex flex-col min-w-0'>
        <Header />
        <main className='flex-1 p-4 md:p-6 overflow-auto'>
          <div className='max-w-4xl mx-auto'>
            <Card className='border-0 shadow-lg'>
              <CardHeader className='text-center pb-8 pt-12'>
                <div className='w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg'>
                  <MessageSquare className='w-10 h-10 text-white' />
                </div>
                <CardTitle className='text-3xl font-bold text-foreground mb-4'>
                  Чат на сайте
                </CardTitle>
                <p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
                  Встраивайте умных чат-ботов на ваш сайт для автоматизации
                  поддержки клиентов
                </p>
              </CardHeader>
              <CardContent className='text-center pb-12'>
                <div className='bg-muted/50 rounded-xl p-8 mb-8'>
                  <h3 className='text-xl font-semibold mb-4'>Скоро доступно</h3>
                  <p className='text-muted-foreground mb-6'>
                    Разрабатываем виджет чата для сайтов с полной кастомизацией
                    дизайна и интеграцией с вашими агентами.
                  </p>
                  <div className='flex justify-center space-x-8 text-sm text-muted-foreground'>
                    <div className='text-center'>
                      <div className='font-semibold text-foreground'>
                        Виджет
                      </div>
                      <div>Настраиваемый</div>
                    </div>
                    <div className='text-center'>
                      <div className='font-semibold text-foreground'>
                        Интеграция
                      </div>
                      <div>Один код</div>
                    </div>
                    <div className='text-center'>
                      <div className='font-semibold text-foreground'>
                        Дизайн
                      </div>
                      <div>Под ваш бренд</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
