'use client';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Bot, Sparkles, Wand2, FileCode } from 'lucide-react';
import type { Agent } from '@/types/agent';
import { toast } from 'sonner';

interface AddAgentCardProps {
  onAddAgent: (agent: any, isFromCode?: boolean) => void;
  copiedAgentCode: string | null;
}

export function AddAgentCard({
  onAddAgent,
  copiedAgentCode,
}: AddAgentCardProps) {
  const [showOptions, setShowOptions] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'default' | 'template' | 'code'>(
    'default'
  );
  const [agentName, setAgentName] = useState('');
  const [agentDescription, setAgentDescription] = useState('');
  const [agentTemplate, setAgentTemplate] = useState('assistant');
  const [agentCode, setAgentCode] = useState('');

  const templates = {
    assistant: {
      name: 'Универсальный помощник',
      description: 'Помогает с различными задачами и отвечает на вопросы',
      prompt:
        'Ты универсальный AI-помощник. Отвечай дружелюбно и помогай пользователям с их вопросами.',
      temperature: 0.7,
    },
    support: {
      name: 'Служба поддержки',
      description: 'Специализируется на решении проблем клиентов',
      prompt:
        'Ты специалист службы поддержки. Помогай клиентам решать их проблемы вежливо и профессионально.',
      temperature: 0.5,
    },
    sales: {
      name: 'Менеджер по продажам',
      description: 'Помогает с продажами и консультирует клиентов',
      prompt:
        'Ты менеджер по продажам. Консультируй клиентов о продуктах и помогай им сделать выбор.',
      temperature: 0.6,
    },
    creative: {
      name: 'Креативный помощник',
      description: 'Помогает с творческими задачами и генерацией идей',
      prompt:
        'Ты креативный помощник. Помогай с творческими задачами, генерируй идеи и вдохновляй.',
      temperature: 0.9,
    },
  };

  const handlePlusClick = () => {
    setShowOptions(true);
  };

  const handleAddAgent = (type: 'default' | 'template' | 'code') => {
    setDialogType(type);
    setShowDialog(true);
    if (type === 'code' && copiedAgentCode) {
      setAgentCode(copiedAgentCode);
    }
  };

  const createAgent = () => {
    if (!agentName.trim()) {
      toast.error('Пожалуйста, введите имя агента.');
      return;
    }

    let newAgent: Agent;
    let isFromCode = false;

    if (dialogType === 'code' && agentCode) {
      try {
        const decodedAgent = JSON.parse(
          decodeURIComponent(
            atob(agentCode)
              .split('')
              .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          )
        );
        console.log(decodedAgent, 'decoded')

        newAgent = {
          ...decodedAgent,
          id: Math.floor(Date.now() / 100000).toString(),
          name: agentName,
          createdAt: new Date(),
          status: 'active',
          talkativeness: Number(decodedAgent.talkativeness),
          temperature: Number(decodedAgent.temperature),
        };
        isFromCode = true;
      } catch (error) {
        toast.error('Неверный код агента.');
        return;
      }
    } else if (dialogType === 'template') {
      const template = templates[agentTemplate as keyof typeof templates];
      newAgent = {
        id: Math.floor(Date.now() / 100000).toString(),

        name: agentName,
        avatar: '',
        status: 'active',
        createdAt: new Date(),
        expenses: { unavailable: 0, botcoin: 0.0 },
        temperature: template.temperature,
        instructions: template.prompt,
        llmModel: 'gpt-4o-mini',
        // llm_model: "gpt-4o-mini-2024-07-18",
        totalConversations: 0,
        company_id: 1,
        model: '',
        prompt: template.prompt,
        enable_functions: true,
        talkativeness: 50,
        timezone: 'UTC',
        settings: {},
        is_robot_question: 'tell-if-asked',
      };
    } else {
      newAgent = {
        id: Math.floor(Date.now() / 100000).toString(),
        name: agentName,
        avatar: '',
        model: '',
        status: 'active',
        createdAt: new Date(),
        expenses: { unavailable: 0, botcoin: 0.0 },
        temperature: 0.7,
        instructions: agentDescription || 'Ты полезный AI-помощник.',
        llmModel: 'gpt-4o-mini',
        // llm_model: "gpt-4o-mini-2024-07-18",
        totalConversations: 0,
        company_id: 1,
        prompt: agentDescription || 'Ты полезный AI-помощник.',
        enable_functions: true,
        talkativeness: 50,
        timezone: 'UTC',
        settings: {},
        is_robot_question: 'tell-if-asked',
      };
    }

    console.log(newAgent, 'newagent');
    onAddAgent(newAgent, isFromCode);
    setShowDialog(false);
    setAgentName('');
    setAgentDescription('');
    setAgentCode('');
    setShowOptions(false);
    toast.success(`${newAgent.name} был успешно создан.`);
  };

  return (
    <>
      <Card className='group border-2 border-dashed border-purple-300 hover:border-purple-400 dark:border-purple-700 dark:hover:border-purple-600 transition-all duration-300 hover:shadow-lg bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-purple-900/20 dark:to-blue-900/20 min-h-[320px] md:min-h-[380px]'>
        <CardContent className='flex flex-col items-center justify-center h-full p-6 md:p-8'>
          {!showOptions ? (
            <button
              onClick={handlePlusClick}
              className='flex flex-col items-center space-y-4 p-6 md:p-8 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-all duration-300 group-hover:scale-105 w-full'
            >
              <div className='relative'>
                <div className='p-6 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full group-hover:from-purple-600 group-hover:to-blue-600 transition-all duration-300 shadow-lg'>
                  <Plus className='h-8 w-8 md:h-10 md:w-10 text-white' />
                </div>
                <div className='absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center'>
                  <Sparkles className='h-3 w-3 text-yellow-800' />
                </div>
              </div>
              <div className='text-center space-y-2'>
                <span className='text-lg md:text-xl font-semibold text-gray-900 dark:text-white'>
                  Создать агента
                </span>
                <p className='text-sm text-muted-foreground max-w-xs'>
                  Добавьте нового AI-агента для автоматизации задач
                </p>
              </div>
            </button>
          ) : (
            <div className='flex flex-col items-center space-y-6 w-full'>
              <h3 className='text-lg font-semibold text-center text-gray-900 dark:text-white'>
                Выберите способ создания
              </h3>
              <div className='grid grid-cols-1 gap-4 w-full max-w-sm'>
                {/* Default Agent */}
                <button
                  onClick={() => handleAddAgent('default')}
                  className='flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200 group'
                >
                  <div className='p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-800/30 transition-colors'>
                    <Bot className='h-5 w-5 text-blue-600 dark:text-blue-400' />
                  </div>
                  <div className='text-left'>
                    <div className='font-medium text-sm'>Простой агент</div>
                    <div className='text-xs text-muted-foreground'>
                      Базовые настройки
                    </div>
                  </div>
                </button>

                {/* Template Agent */}
                <button
                  onClick={() => handleAddAgent('template')}
                  className='flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200 group'
                >
                  <div className='p-2 bg-green-100 dark:bg-green-900/30 rounded-lg group-hover:bg-green-200 dark:group-hover:bg-green-800/30 transition-colors'>
                    <Wand2 className='h-5 w-5 text-green-600 dark:text-green-400' />
                  </div>
                  <div className='text-left'>
                    <div className='font-medium text-sm'>По шаблону</div>
                    <div className='text-xs text-muted-foreground'>
                      Готовые роли
                    </div>
                  </div>
                </button>

                {/* Code Agent */}
                <button
                  onClick={() => handleAddAgent('code')}
                  disabled={!copiedAgentCode}
                  className='flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  <div className='p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg group-hover:bg-orange-200 dark:group-hover:bg-orange-800/30 transition-colors'>
                    <FileCode className='h-5 w-5 text-orange-600 dark:text-orange-400' />
                  </div>
                  <div className='text-left'>
                    <div className='font-medium text-sm'>Из кода</div>
                    <div className='text-xs text-muted-foreground'>
                      {copiedAgentCode ? 'Код готов' : 'Нет кода'}
                    </div>
                  </div>
                </button>
              </div>
              <Button
                variant='ghost'
                onClick={() => setShowOptions(false)}
                className='text-muted-foreground hover:text-foreground text-sm'
              >
                ← Назад
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className='w-[95vw] max-w-md mx-auto'>
          <DialogHeader>
            <DialogTitle className='text-lg'>
              {dialogType === 'default' && 'Создать простого агента'}
              {dialogType === 'template' && 'Создать агента по шаблону'}
              {dialogType === 'code' && 'Создать агента из кода'}
            </DialogTitle>
            <DialogDescription className='text-sm'>
              {dialogType === 'default' &&
                'Создайте агента с базовыми настройками'}
              {dialogType === 'template' &&
                'Выберите готовый шаблон для быстрого старта'}
              {dialogType === 'code' &&
                'Восстановите агента из сохраненного кода'}
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='agent-name'>Имя агента *</Label>
              <Input
                id='agent-name'
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder='Введите имя агента'
                className='w-full'
              />
            </div>

            {dialogType === 'template' && (
              <div className='space-y-2'>
                <Label htmlFor='agent-template'>Шаблон</Label>
                <Select value={agentTemplate} onValueChange={setAgentTemplate}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(templates).map(([key, template]) => (
                      <SelectItem key={key} value={key}>
                        <div className='flex flex-col'>
                          <span className='font-medium'>{template.name}</span>
                          <span className='text-xs text-muted-foreground'>
                            {template.description}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {dialogType === 'default' && (
              <div className='space-y-2'>
                <Label htmlFor='agent-description'>
                  Описание (опционально)
                </Label>
                <Textarea
                  id='agent-description'
                  value={agentDescription}
                  onChange={(e) => setAgentDescription(e.target.value)}
                  placeholder='Опишите, что должен делать агент...'
                  rows={3}
                />
              </div>
            )}

            {dialogType === 'code' && (
              <div className='space-y-2'>
                <Label htmlFor='agent-code'>Код агента</Label>
                <Textarea
                  id='agent-code'
                  value={agentCode}
                  onChange={(e) => setAgentCode(e.target.value)}
                  placeholder='Вставьте код агента сюда'
                  className='font-mono text-xs resize-none overflow-hidden min-h-[120px] max-h-[200px]'
                  style={{
                    wordBreak: 'break-all',
                    whiteSpace: 'pre-wrap',
                  }}
                />
                <p className='text-xs text-muted-foreground'>
                  Вставьте скопированный код агента для восстановления
                </p>
              </div>
            )}
          </div>
          <DialogFooter className='flex-col sm:flex-row gap-2'>
            <Button variant='outline' onClick={() => setShowDialog(false)}>
              Отмена
            </Button>
            <Button
              onClick={createAgent}
              className='bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
            >
              Создать агента
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
