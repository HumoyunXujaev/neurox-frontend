'use client';

import { Header } from '@/components/header';
import { Sidebar } from '@/components/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';

export default function WebsiteChatPage() {
  return (
    <div className='flex h-screen bg-background'>
      {/* Desktop Sidebar */}
      <div className='hidden md:block w-68 flex-shrink-0'>
        <Sidebar />
      </div>

      <div className='flex-1 flex flex-col min-w-0'>
        <Header />
        <main className='flex-1 p-4 md:p-6 overflow-auto'>
          <div className='max-w-4xl mx-auto'>
            <Card>
              <CardHeader className='text-center'>
                <MessageSquare className='h-12 w-12 md:h-16 md:w-16 mx-auto text-purple-600 mb-4' />
                <CardTitle className='text-xl md:text-2xl'>
                  Чат на сайт
                </CardTitle>
              </CardHeader>
              <CardContent className='text-center'>
                <p className='text-muted-foreground text-sm md:text-base'>
                  Эта страница находится в разработке. Здесь будет возможность
                  настройки чата для сайта.
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
