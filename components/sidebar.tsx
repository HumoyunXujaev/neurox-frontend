'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Bot,
  MessageCircle,
  Settings,
  Database,
  Zap,
  Plus,
  BarChart3,
  Webhook,
  MessageSquare,
  HelpCircle,
  CableIcon as Channels,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const sidebarItems = [
  {
    title: 'ТЕСТЫ',
    items: [{ name: 'Агенты', href: '/agents', icon: Bot, active: true }],
  },
  {
    title: 'НАСТРОЙКИ',
    items: [
      { name: 'Чат', href: '/chat', icon: MessageCircle },
      { name: 'Настройка агента', href: '/settings', icon: Settings },
      { name: 'Источники знаний', href: '/knowledge', icon: Database },
      { name: 'Функции', href: '/functions', icon: Zap },
      { name: 'Дообучение', href: '/training', icon: Plus },
    ],
  },
  {
    title: 'СЕРВИС',
    items: [
      { name: 'Каналы', href: '/channels', icon: Channels },
      { name: 'Интеграции', href: '/integrations', icon: Webhook },
      { name: 'Чат на сайт', href: '/website-chat', icon: MessageSquare },
    ],
  },
  {
    title: 'МОНИТОРИНГ',
    items: [
      { name: 'Диалоги', href: '/dialogs', icon: MessageCircle },
      { name: 'Аналитика', href: '/analytics', icon: BarChart3 },
    ],
  },
];

const helpItems = [
  {
    title: 'ПОМОЩЬ',
    items: [{ name: 'Поддержка', href: '/support', icon: HelpCircle }],
  },
];

interface SidebarProps {
  onItemClick?: () => void;
}

export function Sidebar({ onItemClick }: SidebarProps) {
  const pathname = usePathname();

  const handleItemClick = () => {
    if (onItemClick) {
      onItemClick();
    }
  };

  return (
    <div className='pb-12 w-full bg-background border-r flex flex-col h-full'>
      {/* Логотип в сайдбаре - только на десктопе */}
      <div className='hidden md:block px-7 py-[20px] border-b'>
        <div className='text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent'>
          NEUROX
        </div>
      </div>

      {/* Мобильный заголовок */}
      <div className='md:hidden px-4 py-4 border-b'>
        <div className='text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent'>
          NEUROX
        </div>
      </div>

      <div className='flex-1 space-y-4 py-5'>
        <div className='px-3 py-2'>
          <div className='space-y-1'>
            <ScrollArea className='h-[calc(100vh-12rem)] md:h-[calc(100vh-17rem)]'>
              <div className='space-y-6 p-2'>
                {sidebarItems.map((section) => (
                  <div key={section.title}>
                    <h3 className='mb-2 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                      {section.title}
                    </h3>
                    <div className='space-y-1'>
                      {section.items.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={handleItemClick}
                        >
                          <Button
                            variant={
                              pathname === item.href ? 'secondary' : 'ghost'
                            }
                            className={cn(
                              'w-full justify-start h-10 text-sm',
                              pathname === item.href &&
                                'bg-purple-100 text-purple-900 dark:bg-purple-900 dark:text-purple-100'
                            )}
                          >
                            <item.icon className='mr-2 h-4 w-4' />
                            {item.name}
                          </Button>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* Зафиксированная секция помощи внизу */}
      <div className='border-t p-3'>
        {helpItems.map((section) => (
          <div key={section.title}>
            <h3 className='mb-2 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
              {section.title}
            </h3>
            <div className='space-y-1'>
              {section.items.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={handleItemClick}
                >
                  <Button
                    variant={pathname === item.href ? 'secondary' : 'ghost'}
                    className={cn(
                      'w-full justify-start h-10 text-sm',
                      pathname === item.href &&
                        'bg-purple-100 text-purple-900 dark:bg-purple-900 dark:text-purple-100'
                    )}
                  >
                    <item.icon className='mr-2 h-4 w-4' />
                    {item.name}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
