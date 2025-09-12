'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/header';
import { Sidebar } from '@/components/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronDown, ChevronUp, Settings2, HelpCircle } from 'lucide-react';
import { useAgentStore } from '@/lib/agent-store';
import { useAgents } from '@/hooks/use-agents';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { FunctionsManager } from '@/components/functions-manager';
export default function SettingsPage() {
  const router = useRouter();
  const { selectedAgent, updateAgent: updateStoreAgent } = useAgentStore();
  const { updateAgent: updateBackendAgent } = useAgents({ autoLoad: false });
  const { user } = useAuth();

  const [temperature, setTemperature] = useState([0.7]);
  const [agentName, setAgentName] = useState('');
  const [instructions, setInstructions] = useState('');
  const [isDialogManagementOpen, setIsDialogManagementOpen] = useState(false);
  const [isKnowledgeBaseOpen, setIsKnowledgeBaseOpen] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isGuardrailsOpen, setIsGuardrailsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [functions, setFunctions] = useState<any[]>([]);

  // Настройки агента из бэкенда
  const [enableFunctions, setEnableFunctions] = useState(true);
  const [talkativeness, setTalkativeness] = useState([50]);
  const [isRobotQuestion, setIsRobotQuestion] = useState('');
  const [llmModel, setLlmModel] = useState('gpt-4o-mini');
  const [timezone, setTimezone] = useState('UTC');

  // Синхронизация с выбранным агентом - обновлено для правильной работы
  useEffect(() => {
    if (selectedAgent) {
      setAgentName(selectedAgent.name || '');
      setInstructions(selectedAgent.instructions || selectedAgent.prompt || '');
      setTemperature([selectedAgent.temperature || 0.7]);
      setEnableFunctions(selectedAgent.enable_functions ?? true);
      setTalkativeness([selectedAgent.talkativeness || 50]);
      setIsRobotQuestion(selectedAgent.is_robot_question || 'tell-if-asked');
      setFunctions(selectedAgent.settings || []);

      // Исправление для модели - проверяем все возможные поля
      const model = selectedAgent.llmModel || 'gpt-4o-mini';
      setLlmModel(model);

      setTimezone(selectedAgent.timezone || 'UTC');
    }
  }, [selectedAgent]);

  const handleSave = async () => {
    if (!selectedAgent) {
      toast.error('Выберите агента для настройки');
      return;
    }

    try {
      setIsLoading(true);

      const updatedAgent = {
        ...selectedAgent,
        name: agentName,
        company_id: user?.company_id,
        temperature: temperature[0],
        talkativeness: talkativeness[0],
        is_robot_question: isRobotQuestion,
        llmModel: llmModel,
        // llm_model: llmModel, // Дублируем для совместимости
        timezone: timezone,
        prompt: instructions,
        settings: functions,
        // instructions: instructions, // Дублируем для совместимости
        // enable_functions: enableFunctions,
      };

      const result = await updateBackendAgent(selectedAgent.id, updatedAgent);

      if (result) {
        updateStoreAgent(result);
        toast.success('Настройки сохранены');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Ошибка при сохранении настроек');
    } finally {
      setIsLoading(false);
    }
  };

  if (!selectedAgent) {
    return (
      <div className='flex h-screen bg-background'>
        <div className='hidden md:block w-68 flex-shrink-0'>
          <Sidebar />
        </div>
        <div className='flex-1 flex flex-col min-w-0'>
          <Header />
          <main className='flex-1 p-4 md:p-6 overflow-auto'>
            <div className='max-w-4xl mx-auto'>
              <Card>
                <CardContent className='flex flex-col items-center justify-center py-12'>
                  <Settings2 className='h-12 w-12 text-muted-foreground mb-4' />
                  <p className='text-lg text-muted-foreground text-center'>
                    Выберите агента для настройки
                  </p>
                  <Button
                    className='mt-4'
                    onClick={() => router.push('/agents')}
                  >
                    Перейти к агентам
                  </Button>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className='flex h-screen bg-background'>
      <div className='hidden md:block w-68 flex-shrink-0'>
        <Sidebar />
      </div>
      <div className='flex-1 flex flex-col min-w-0'>
        <Header />
        <main className='flex-1 p-4 md:p-6 overflow-auto'>
          <div className='max-w-4xl mx-auto space-y-6'>
            {/* Basic Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Основные настройки</CardTitle>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div className='space-y-2'>
                  <Label htmlFor='agent-name'>Имя агента</Label>
                  <Input
                    id='agent-name'
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    placeholder='Введите имя агента'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='model'>Модель</Label>
                  <Select value={llmModel} onValueChange={setLlmModel}>
                    <SelectTrigger id='model'>
                      <SelectValue placeholder='Выберите модель' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='gpt-3.5-turbo-0125'>
                        GPT-3.5 Turbo (0125)
                      </SelectItem>
                      <SelectItem value='gpt-4-turbo-2024-04-09'>
                        GPT-4 Turbo (2024-04-09)
                      </SelectItem>
                      <SelectItem value='gpt-4o-2024-08-06'>
                        GPT-4o (2024-08-06)
                      </SelectItem>
                      <SelectItem value='gpt-4o-mini'>
                        GPT-4o Mini (2024-07-18)
                      </SelectItem>
                      <SelectItem value='gpt-4o-search-preview-2025-03-11'>
                        GPT-4o Search Preview (2025-03-11)
                      </SelectItem>
                      <SelectItem value='gpt-4.5-preview-2025-02-27'>
                        GPT-4.5 Preview (2025-02-27)
                      </SelectItem>
                      <SelectItem value='o4-mini-2025-04-16'>
                        O4 Mini (2025-04-16)
                      </SelectItem>
                      <SelectItem value='gpt-4.1-nano-2025-04-14'>
                        GPT-4.1 Nano (2025-04-14)
                      </SelectItem>
                      <SelectItem value='gpt-4.1-mini-2025-04-14'>
                        GPT-4.1 Mini (2025-04-14)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='instructions'>Инструкции</Label>
                  <Textarea
                    id='instructions'
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder='Опишите, как должен вести себя агент...'
                    className='min-h-[150px]'
                  />
                  <p className='text-sm text-muted-foreground'>
                    Подробные инструкции помогут агенту лучше понимать свою роль
                  </p>
                </div>

                <div className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <Label htmlFor='temperature'>
                      Температура: {temperature[0]}
                    </Label>
                    <HelpCircle className='h-4 w-4 text-muted-foreground' />
                  </div>
                  <Slider
                    id='temperature'
                    min={0}
                    max={2}
                    step={0.1}
                    value={temperature}
                    onValueChange={setTemperature}
                  />
                  <p className='text-sm text-muted-foreground'>
                    Контролирует креативность ответов (0 = точные, 2 =
                    креативные)
                  </p>
                </div>

                <div className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <Label htmlFor='talkativeness'>
                      Разговорчивость: {talkativeness[0]}%
                    </Label>
                  </div>
                  <Slider
                    id='talkativeness'
                    min={0}
                    max={100}
                    step={10}
                    value={talkativeness}
                    onValueChange={setTalkativeness}
                  />
                  <p className='text-sm text-muted-foreground'>
                    Насколько подробными будут ответы агента
                  </p>
                </div>

                <div className='flex items-center space-x-2'>
                  <Switch
                    id='enable-functions'
                    checked={enableFunctions}
                    onCheckedChange={setEnableFunctions}
                  />
                  <Label htmlFor='enable-functions'>Включить функции</Label>
                </div>

                {/* <div className='flex items-center space-x-2'>
                  <Switch
                    id='robot-question'
                    checked={isRobotQuestion}
                    onCheckedChange={setIsRobotQuestion}
                  />
                  <Label htmlFor='robot-question'>
                    Спрашивать "Вы робот?" при первом контакте
                  </Label>
                </div> */}

                <div className='space-y-2'>
                  <Label htmlFor='is_robot_question'>Дать знать что бот</Label>
                  <Select
                    value={isRobotQuestion}
                    onValueChange={setIsRobotQuestion}
                  >
                    <SelectTrigger id='is_robot_question'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='tell-that-bot'>
                        сказать что бот
                      </SelectItem>
                      <SelectItem value='dont-tell_that-bot'>
                        не говорить что бот
                      </SelectItem>
                      <SelectItem value='tell-if-asked'>
                        сказать если спросят
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='timezone'>Часовой пояс</Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger id='timezone'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='UTC'>UTC</SelectItem>
                      <SelectItem value='Europe/Moscow'>Москва</SelectItem>
                      <SelectItem value='Asia/Tashkent'>Ташкент</SelectItem>
                      <SelectItem value='America/New_York'>Нью-Йорк</SelectItem>
                      <SelectItem value='Europe/London'>Лондон</SelectItem>
                      <SelectItem value='Asia/Tokyo'>Токио</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Dialog Management */}
            <Collapsible
              open={isDialogManagementOpen}
              onOpenChange={setIsDialogManagementOpen}
            >
              <Card>
                <CollapsibleTrigger asChild>
                  <CardHeader className='cursor-pointer'>
                    <div className='flex items-center justify-between'>
                      <CardTitle>Управление диалогом</CardTitle>
                      {isDialogManagementOpen ? (
                        <ChevronUp className='h-5 w-5' />
                      ) : (
                        <ChevronDown className='h-5 w-5' />
                      )}
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className='space-y-4'>
                    <div className='space-y-4'>
                      <div className='flex items-center space-x-2'>
                        <Switch id='greeting' defaultChecked />
                        <Label htmlFor='greeting'>Приветствие</Label>
                      </div>
                      <Textarea
                        placeholder='Привет! Я ваш виртуальный помощник. Как я могу вам помочь?'
                        className='min-h-[100px]'
                      />
                    </div>

                    <div className='space-y-4'>
                      <div className='flex items-center space-x-2'>
                        <Switch id='suggested-replies' />
                        <Label htmlFor='suggested-replies'>
                          Предлагаемые ответы
                        </Label>
                      </div>
                      <p className='text-sm text-muted-foreground'>
                        Показывать пользователям кнопки с вариантами ответов
                      </p>
                    </div>

                    <div className='space-y-4'>
                      <Label>Длина контекста</Label>
                      <RadioGroup defaultValue='auto'>
                        <div className='flex items-center space-x-2'>
                          <RadioGroupItem value='auto' id='context-auto' />
                          <Label htmlFor='context-auto'>Автоматически</Label>
                        </div>
                        <div className='flex items-center space-x-2'>
                          <RadioGroupItem value='short' id='context-short' />
                          <Label htmlFor='context-short'>
                            Короткий (5 сообщений)
                          </Label>
                        </div>
                        <div className='flex items-center space-x-2'>
                          <RadioGroupItem value='medium' id='context-medium' />
                          <Label htmlFor='context-medium'>
                            Средний (10 сообщений)
                          </Label>
                        </div>
                        <div className='flex items-center space-x-2'>
                          <RadioGroupItem value='long' id='context-long' />
                          <Label htmlFor='context-long'>
                            Длинный (20 сообщений)
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Knowledge Base */}
            <Collapsible
              open={isKnowledgeBaseOpen}
              onOpenChange={setIsKnowledgeBaseOpen}
            >
              <Card>
                <CollapsibleTrigger asChild>
                  <CardHeader className='cursor-pointer'>
                    <div className='flex items-center justify-between'>
                      <CardTitle>База знаний</CardTitle>
                      {isKnowledgeBaseOpen ? (
                        <ChevronUp className='h-5 w-5' />
                      ) : (
                        <ChevronDown className='h-5 w-5' />
                      )}
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent>
                    <div className='flex items-center justify-center py-8'>
                      <Button
                        variant='outline'
                        onClick={() => router.push('/knowledge')}
                      >
                        Перейти к настройке базы знаний
                      </Button>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            <FunctionsManager
              functions={functions}
              setFunctions={setFunctions}
            />

            {/* Tools */}
            <Collapsible open={isToolsOpen} onOpenChange={setIsToolsOpen}>
              <Card>
                <CollapsibleTrigger asChild>
                  <CardHeader className='cursor-pointer'>
                    <div className='flex items-center justify-between'>
                      <CardTitle>Инструменты</CardTitle>
                      {isToolsOpen ? (
                        <ChevronUp className='h-5 w-5' />
                      ) : (
                        <ChevronDown className='h-5 w-5' />
                      )}
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className='space-y-4'>
                    <div className='space-y-2'>
                      <div className='flex items-center space-x-2'>
                        <Checkbox id='web-search' disabled={!enableFunctions} />
                        <Label htmlFor='web-search'>Поиск в интернете</Label>
                      </div>
                      <p className='text-sm text-muted-foreground ml-6'>
                        Позволяет агенту искать актуальную информацию
                      </p>
                    </div>

                    <div className='space-y-2'>
                      <div className='flex items-center space-x-2'>
                        <Checkbox
                          id='calculations'
                          disabled={!enableFunctions}
                        />
                        <Label htmlFor='calculations'>Вычисления</Label>
                      </div>
                      <p className='text-sm text-muted-foreground ml-6'>
                        Выполнение математических расчетов
                      </p>
                    </div>

                    <div className='space-y-2'>
                      <div className='flex items-center space-x-2'>
                        <Checkbox
                          id='image-generation'
                          disabled={!enableFunctions}
                        />
                        <Label htmlFor='image-generation'>
                          Генерация изображений
                        </Label>
                      </div>
                      <p className='text-sm text-muted-foreground ml-6'>
                        Создание изображений по текстовому описанию
                      </p>
                    </div>

                    {!enableFunctions && (
                      <p className='text-sm text-yellow-600 mt-2'>
                        Включите функции в основных настройках для использования
                        инструментов
                      </p>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Guardrails */}
            <Collapsible
              open={isGuardrailsOpen}
              onOpenChange={setIsGuardrailsOpen}
            >
              <Card>
                <CollapsibleTrigger asChild>
                  <CardHeader className='cursor-pointer'>
                    <div className='flex items-center justify-between'>
                      <CardTitle>Ограничения</CardTitle>
                      {isGuardrailsOpen ? (
                        <ChevronUp className='h-5 w-5' />
                      ) : (
                        <ChevronDown className='h-5 w-5' />
                      )}
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className='space-y-4'>
                    <div className='flex items-center space-x-2'>
                      <Switch id='content-filter' defaultChecked />
                      <Label htmlFor='content-filter'>Фильтр контента</Label>
                    </div>

                    <div className='flex items-center space-x-2'>
                      <Switch id='personal-data' defaultChecked />
                      <Label htmlFor='personal-data'>
                        Защита персональных данных
                      </Label>
                    </div>

                    <div className='space-y-2'>
                      <Label>Запрещенные темы</Label>
                      <Textarea
                        placeholder='Введите темы через запятую...'
                        className='min-h-[100px]'
                      />
                    </div>

                    <div className='space-y-2'>
                      <Label>Максимальная длина ответа</Label>
                      <Select defaultValue='medium'>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='short'>
                            Короткий (до 500 символов)
                          </SelectItem>
                          <SelectItem value='medium'>
                            Средний (до 1500 символов)
                          </SelectItem>
                          <SelectItem value='long'>
                            Длинный (до 3000 символов)
                          </SelectItem>
                          <SelectItem value='unlimited'>
                            Без ограничений
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Save Button */}
            <div className='flex justify-end'>
              <Button
                size='lg'
                className='bg-purple-600 hover:bg-purple-700'
                onClick={handleSave}
                disabled={isLoading}
              >
                {isLoading ? 'Сохранение...' : 'СОХРАНИТЬ ИЗМЕНЕНИЯ'}
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
