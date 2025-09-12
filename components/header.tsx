'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Moon,
  Sun,
  Mail,
  User,
  CreditCard,
  LogOut,
  ChevronDown,
  Bell,
  Menu,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAgentStore } from '@/lib/agent-store';
import { NotificationPanel } from './notification-panel';
import { Sidebar } from './sidebar';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';

export function Header() {
  const { theme, setTheme } = useTheme();
  const { agents, selectedAgent, setSelectedAgent } = useAgentStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const [userInfo] = useState({
    name: user?.name,
    plan: 'Тест',
    botcoin: 10,
    reserved: 0,
  });

  // Устанавливаем первого агента как выбранного по умолчанию
  useEffect(() => {
    if (!selectedAgent && agents.length > 0) {
      setSelectedAgent(agents[0]);
    }
  }, [agents, selectedAgent, setSelectedAgent]);

  const getAgentModel = (agent: any) => {
    return (
      agent.llm_model || agent.llmModel || agent.model || 'Модель не указана'
    );
  };

  return (
    <header className='border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='flex h-14 md:h-16 lg:h-[72px] items-center justify-between px-4 md:px-6 lg:px-7'>
        {/* Mobile Menu Button */}
        <div className='flex items-center gap-2 md:hidden'>
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant='ghost' size='icon' className='h-8 w-8'>
                <Menu className='h-5 w-5' />
              </Button>
            </SheetTrigger>
            <SheetContent side='left' className='p-0 w-68'>
              {/* <SheetTitle>Меню</SheetTitle> */}
              <Sidebar onItemClick={() => setIsMobileMenuOpen(false)} />
            </SheetContent>
          </Sheet>
          {/* Mobile Logo */}
          {/* <div className='text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent'>
            NEUROX
          </div> */}
          <div className='h-12 w-32 relative'>
            <Image
              src='/images/logo-light1.png'
              alt='Логотип Neurox'
              fill
              className='object-contain dark:hidden'
            />
            <Image
              src='/images/logo-dark1.png'
              alt='Логотип Neurox'
              fill
              className='object-contain hidden dark:block'
            />
          </div>
        </div>

        {/* Desktop Left Section */}
        <div className='hidden md:flex items-center gap-3 lg:gap-5'>
          {/* Селектор агентов */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='ghost'
                className='flex items-center gap-2 text-sm h-8 lg:h-10 max-w-[200px] lg:max-w-none'
              >
                <span className='truncate'>
                  {selectedAgent?.name || 'Выберите агента'}
                </span>
                <ChevronDown className='h-4 w-4 flex-shrink-0' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='start' className='w-64 lg:w-72'>
              {agents.map((agent) => (
                <DropdownMenuItem
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent)}
                  className={`flex items-center gap-3 p-3 ${
                    selectedAgent?.id === agent.id
                      ? 'bg-purple-50 dark:bg-purple-950'
                      : ''
                  }`}
                >
                  <Avatar className='h-6 w-6 lg:h-8 lg:w-8'>
                    <AvatarImage
                      src={agent.avatar || '/placeholder.svg'}
                      alt={agent.name}
                    />
                    <AvatarFallback>{agent.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className='flex flex-col min-w-0'>
                    <span className='font-medium truncate'>{agent.name}</span>
                    <span className='text-xs text-muted-foreground truncate'>
                      {getAgentModel(agent)}
                    </span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {selectedAgent && (
            <Badge
              variant='secondary'
              className='text-xs hidden lg:inline-flex'
            >
              {getAgentModel(selectedAgent)}
            </Badge>
          )}
        </div>

        {/* Mobile Agent Selector */}
        <div className='flex md:hidden items-center'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='ghost'
                className='flex items-center gap-1 text-xs h-8 px-2'
              >
                <span className='truncate max-w-[100px]'>
                  {selectedAgent?.name || 'Агент'}
                </span>
                <ChevronDown className='h-3 w-3' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='center' className='w-64'>
              {agents.map((agent) => (
                <DropdownMenuItem
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent)}
                  className={`flex items-center gap-3 p-3 ${
                    selectedAgent?.id === agent.id
                      ? 'bg-purple-50 dark:bg-purple-950'
                      : ''
                  }`}
                >
                  <Avatar className='h-6 w-6'>
                    <AvatarImage
                      src={agent.avatar || '/placeholder.svg'}
                      alt={agent.name}
                    />
                    <AvatarFallback>{agent.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className='flex flex-col min-w-0'>
                    <span className='font-medium truncate'>{agent.name}</span>
                    <span className='text-xs text-muted-foreground truncate'>
                      {getAgentModel(agent)}
                    </span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Right Section */}
        <div className='flex items-center gap-2 md:gap-3 lg:gap-5'>
          {/* Desktop User Info */}
          <div className='hidden lg:block text-right text-sm'>
            <div className='flex items-center gap-2'>
              <span className='text-muted-foreground'>Тариф:</span>
              <Badge variant='outline'>{user?.subscription_plan}</Badge>
            </div>
            <div className='text-muted-foreground'>
              NXT:{' '}
              <span className='text-foreground font-medium'>
                {user?.botcoins}
              </span>
            </div>
          </div>

          {/* Mobile User Info */}
          <div className='md:hidden text-xs'>
            <Badge variant='outline' className='text-xs'>
              {user?.subscription_plan}
            </Badge>
          </div>

          {/* Action Buttons */}
          <Button
            variant='ghost'
            size='icon'
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className='h-8 w-8 lg:h-10 lg:w-10'
          >
            <Sun className='h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0' />
            <Moon className='absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100' />
            <span className='sr-only'>Переключить тему</span>
          </Button>

          <Button
            variant='ghost'
            size='icon'
            onClick={() => setShowNotifications(!showNotifications)}
            className={`h-8 w-8 lg:h-10 lg:w-10 ${
              showNotifications ? 'bg-muted' : ''
            }`}
          >
            <Bell className='h-4 w-4' />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='ghost'
                className='relative h-8 w-8 lg:h-10 lg:w-10 rounded-full'
              >
                <Avatar className='h-8 w-8 lg:h-10 lg:w-10'>
                  <AvatarImage
                    src={selectedAgent?.avatar || '/placeholder.svg'}
                    alt='Пользователь'
                  />
                  <AvatarFallback>П</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className='w-72 lg:w-80'
              align='end'
              forceMount
            >
              <div className='flex items-center justify-start gap-2 p-2'>
                <Avatar className='h-8 w-8'>
                  <AvatarImage
                    src={selectedAgent?.avatar || '/placeholder.svg'}
                    alt='Пользователь'
                  />
                  <AvatarFallback>П</AvatarFallback>
                </Avatar>
                <div className='flex flex-col space-y-1 leading-none min-w-0'>
                  <p className='font-medium truncate'>{userInfo.name}</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <div className='p-2'>
                <div className='text-sm text-muted-foreground mb-2'>
                  Ваш тариф
                </div>
                <Badge variant='outline' className='mb-3'>
                  {userInfo.plan}
                </Badge>
                <div className='space-y-1 text-sm'>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>
                      Доступные NXT:
                    </span>
                    <span>{user?.botcoins}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>
                      Резервные NXT:
                    </span>
                    <span>{userInfo.reserved}</span>
                  </div>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href='/account'>
                  <User className='mr-2 h-4 w-4' />
                  <span>Аккаунт</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href='/account?tab=notifications'>
                  <Mail className='mr-2 h-4 w-4' />
                  <span>Уведомления</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href='#' onClick={(e) => e.preventDefault()}>
                  <CreditCard className='mr-2 h-4 w-4' />
                  <span>Партнерская программа</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href='#' onClick={(e) => e.preventDefault()}>
                  <LogOut className='mr-2 h-4 w-4' />
                  <span>Выйти</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Панель уведомлений */}
      <NotificationPanel
        open={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </header>
  );
}
