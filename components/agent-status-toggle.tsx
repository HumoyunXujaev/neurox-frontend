'use client';

import type React from 'react';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Power } from 'lucide-react';
import { toast } from 'sonner';
import { useAgentStore } from '@/lib/agent-store';

interface AgentStatusToggleProps {
  agentId: string;
  initialStatus: 'active' | 'inactive';
  onStatusChange?: (status: 'active' | 'inactive') => void;
}

export function AgentStatusToggle({
  agentId,
  initialStatus,
  onStatusChange,
}: AgentStatusToggleProps) {
  const [status, setStatus] = useState<'active' | 'inactive'>(initialStatus);
  const { toggleAgentStatus } = useAgentStore();

  // Синхронизируем локальное состояние с props
  useEffect(() => {
    setStatus(initialStatus);
  }, [initialStatus]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Немедленно обновляем локальное состояние для мгновенной обратной связи
    const newStatus = status === 'active' ? 'inactive' : 'active';
    setStatus(newStatus);

    // Обновляем глобальное состояние
    toggleAgentStatus(agentId);

    // Вызываем callback если он предоставлен
    if (onStatusChange) {
      onStatusChange(newStatus);
    }

    toast.success(
      newStatus === 'active' ? 'Агент активирован' : 'Агент выключен',
      {
        description: `Агент теперь ${
          newStatus === 'active' ? 'активен' : 'выключен'
        }.`,
      }
    );
  };

  return (
    <Button
      variant='ghost'
      size='icon'
      onClick={handleToggle}
      className={`h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 transition-colors ${
        status === 'active'
          ? 'text-green-600 hover:text-green-700'
          : 'text-gray-400 hover:text-gray-500'
      }`}
    >
      <Power className='h-4 w-4 sm:h-5 sm:w-5' />
    </Button>
  );
}
