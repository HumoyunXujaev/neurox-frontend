'use client';
import type React from 'react';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Power,
  Settings,
  Trash2,
  MoreHorizontal,
  Copy,
  Check,
} from 'lucide-react';
import { AvatarSelector } from './avatar-selector';
import { toast } from 'sonner';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { useAgentStore } from '@/lib/agent-store';

interface AgentCardProps {
  agent: any;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (agent: any) => void;
  onDelete: (agentId: any) => void;
  onCopyCode: (agent: any) => void;
}

export function AgentCard({
  agent,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onCopyCode,
}: AgentCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const { user } = useAuth();
  const { toggleAgentStatus, getAgentStatus } = useAgentStore();

  // Получаем актуальный статус из store
  const agentStatus = getAgentStatus(agent.id);

  const handlePowerToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleAgentStatus(agent.id);

    const newStatus = agentStatus === 'active' ? 'inactive' : 'active';
    toast.success(
      newStatus === 'active' ? 'Агент активирован' : 'Агент выключен',
      {
        description: `${agent.name} теперь ${
          newStatus === 'active' ? 'активен' : 'выключен'
        }.`,
      }
    );
  };

  const handleDelete = () => {
    onDelete(agent.id);
    setShowDeleteDialog(false);
    toast.error('Агент удален', {
      description: `${agent.name} был удален.`,
    });
  };

  const handleAvatarChange = (newAvatar: string) => {
    onUpdate({ ...agent, avatar: newAvatar, company_id: user?.company_id });
    setShowAvatarSelector(false);
    toast.success('Аватар обновлен', {
      description: 'Аватар агента был успешно изменен.',
    });
  };

  const handleCopyCode = () => {
    onCopyCode(agent);
    toast.success('Код скопирован', {
      description: 'Код агента скопирован в буфер обмена.',
    });
  };

  const handleSettingsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isSelected) {
      toast.error('Сначала выберите агента', {
        description: 'Для доступа к настройкам необходимо выбрать агента.',
      });
      return;
    }
  };

  return (
    <>
      <Card
        className={`cursor-pointer transition-all hover:shadow-md min-h-[280px] sm:min-h-[320px] md:min-h-[350px] ${
          isSelected ? 'ring-2 ring-purple-500' : ''
        }`}
        onClick={onSelect}
      >
        <CardContent className='p-2 sm:p-3 md:p-4 flex flex-col h-full'>
          {/* Avatar Section */}
          <div className='flex justify-center mb-2 sm:mb-3 md:mb-4 relative'>
            <Avatar
              className='h-20 w-20 sm:h-24 sm:w-24 md:h-26 md:w-26 cursor-pointer hover:opacity-80 transition-opacity relative z-0'
              onClick={(e) => {
                e.stopPropagation();
                setShowAvatarSelector(true);
              }}
            >
              <AvatarImage
                src={agent.avatar || '/placeholder.svg'}
                alt={agent.name}
              />
              <AvatarFallback className='text-sm sm:text-base md:text-lg'>
                {agent.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            {/* Menu button positioned over avatar */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-background/80 backdrop-blur-sm hover:bg-background/90 border border-border/50 z-0'
                >
                  <MoreHorizontal className='h-3 w-3 sm:h-4 sm:w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem onClick={handleCopyCode}>
                  <Copy className='mr-2 h-4 w-4' />
                  Создать код для копирования
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteDialog(true);
                  }}
                  className='text-red-600'
                >
                  <Trash2 className='mr-2 h-4 w-4' />
                  Удалить
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Agent Info */}
          <div className='space-y-1 sm:space-y-2 mb-2 sm:mb-3 md:mb-4 flex-1 text-center'>
            <h3 className='font-semibold text-sm sm:text-base md:text-lg line-clamp-2'>
              {agent.name}
            </h3>
            <p className='text-xs sm:text-sm text-muted-foreground truncate'>
              {agent.llm_model ||
                agent.llmModel ||
                agent.model ||
                'Модель не указана'}
            </p>
            <div className='flex justify-center'>
              <Badge
                variant={agentStatus === 'active' ? 'default' : 'secondary'}
                className={`text-xs px-2 py-1 transition-all ${
                  agentStatus === 'active'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
                }`}
              >
                {agentStatus === 'active' ? 'Активный агент' : 'Агент выключен'}
              </Badge>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex justify-center gap-1 sm:gap-2 mb-2 sm:mb-3 md:mb-4'>
            <Button
              variant='ghost'
              size='icon'
              onClick={handlePowerToggle}
              className={`h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 transition-colors ${
                agentStatus === 'active'
                  ? 'text-green-600 hover:text-green-700'
                  : 'text-gray-400 hover:text-gray-500'
              }`}
            >
              <Power className='h-4 w-4 sm:h-5 sm:w-5' />
            </Button>
            {/* Settings button - disabled if not selected */}
            {isSelected ? (
              <Button
                asChild
                variant='ghost'
                size='icon'
                className='h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10'
              >
                <Link href='/settings' onClick={handleSettingsClick}>
                  <Settings className='h-4 w-4 sm:h-5 sm:w-5' />
                </Link>
              </Button>
            ) : (
              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 opacity-50 cursor-not-allowed'
                onClick={handleSettingsClick}
                disabled
              >
                <Settings className='h-4 w-4 sm:h-5 sm:w-5' />
              </Button>
            )}
            <Button
              variant='ghost'
              size='icon'
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteDialog(true);
              }}
              className='text-red-600 h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10'
            >
              <Trash2 className='h-4 w-4 sm:h-5 sm:w-5' />
            </Button>
          </div>

          {/* Expenses Section */}
          <div className='border-t pt-2 sm:pt-3 mt-auto'>
            <div className='space-y-1 text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3'>
              <div className='text-xs sm:text-sm font-medium text-foreground mb-1 sm:mb-2'>
                Расходы
              </div>
              <div className='flex justify-between text-xs'>
                <span>За: недоступно</span>
              </div>
              <div className='flex justify-between text-xs'>
                <span>
                  Расход NXT: {agent?.expenses?.botcoin?.toFixed(2) || 0}
                </span>
              </div>
            </div>
            {/* Selection Status */}
            <div className='flex items-center justify-center h-6 sm:h-8'>
              {isSelected ? (
                <div className='flex items-center gap-2 text-green-600'>
                  <Check className='h-3 w-3 sm:h-4 sm:w-4' />
                  <span className='font-medium text-xs sm:text-sm'>
                    ВЫБРАНО
                  </span>
                </div>
              ) : (
                <span className='text-muted-foreground font-medium text-xs sm:text-sm'>
                  ВЫБРАТЬ
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <AvatarSelector
        open={showAvatarSelector}
        onOpenChange={setShowAvatarSelector}
        onSelect={handleAvatarChange}
        currentAvatar={agent.avatar}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Агент "{agent.name}" будет удален
              навсегда.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className='bg-red-600 hover:bg-red-700'
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
