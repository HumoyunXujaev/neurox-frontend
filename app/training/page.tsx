'use client';
import { Header } from '@/components/header';
import { Sidebar } from '@/components/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain } from 'lucide-react';

export default function TrainingPage() {
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
                <div className='w-20 h-20 bg-gradient-to-br from-emerald-600 to-blue-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg'>
                  <Brain className='w-10 h-10 text-white' />
                </div>
                <CardTitle className='text-3xl font-bold text-foreground mb-4'>
                  Дообучение
                </CardTitle>
                <p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
                  Обучайте агентов на ваших данных для повышения качества
                  ответов
                </p>
              </CardHeader>
              <CardContent className='text-center pb-12'>
                <div className='bg-muted/50 rounded-xl p-8 mb-8'>
                  <h3 className='text-xl font-semibold mb-4'>Скоро доступно</h3>
                  <p className='text-muted-foreground mb-6'>
                    Разрабатываем систему дообучения агентов на ваших данных для
                    создания экспертных ботов в любой области.
                  </p>
                  <div className='flex justify-center space-x-8 text-sm text-muted-foreground'>
                    <div className='text-center'>
                      <div className='font-semibold text-foreground'>
                        Данные
                      </div>
                      <div>Ваши файлы</div>
                    </div>
                    <div className='text-center'>
                      <div className='font-semibold text-foreground'>
                        Модель
                      </div>
                      <div>Fine-tuning</div>
                    </div>
                    <div className='text-center'>
                      <div className='font-semibold text-foreground'>
                        Качество
                      </div>
                      <div>Экспертность</div>
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
