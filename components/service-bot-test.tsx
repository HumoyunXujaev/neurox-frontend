'use client';

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  Suspense,
} from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Bot,
  AlertCircle,
  Loader2,
  MessageSquare,
  Zap,
  Link,
  RefreshCw,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api/client';
import { tokenManager } from '@/lib/auth/token-manager';
import { cn } from '@/lib/utils';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';

// Types
interface ServiceBot {
  id: number;
  name: string;
  avatar?: string;
  prompt: string;
  llm_model: string;
  temperature: number;
  talkativeness: number;
}

interface InfoFlow {
  id: number;
  name: string;
  type: string;
  data: any;
  company_id?: number;
}

interface ServiceBotRelation {
  service_bot_id: number;
  info_flow_id: number;
  is_active: boolean;
}

interface Appeal {
  id: number;
  chat_id: number;
  status: string;
  created_at: string;
  unread_count?: number;
}

interface Sender {
  id: string;
  type: string | 'user' | 'bot' | 'service';
  name?: string;
  avatar?: string;
}

export default function ServiceBotTestPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const botIdFromUrl = searchParams.get('bot');

  // State
  const [serviceBots, setServiceBots] = useState<ServiceBot[]>([]);
  const [infoFlows, setInfoFlows] = useState<InfoFlow[]>([]);
  const [relations, setRelations] = useState<ServiceBotRelation[]>([]);
  const [selectedBot, setSelectedBot] = useState<ServiceBot | null>(null);
  const [selectedFlow, setSelectedFlow] = useState<InfoFlow | null>(null);
  const [botRelations, setBotRelations] = useState<ServiceBotRelation[]>([]);
  const [appeal, setAppeal] = useState<Appeal | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [showLinkingPrompt, setShowLinkingPrompt] = useState(false);
  const [sender, setSender] = useState<Sender | null>(null);

  // Refs
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      if (!user?.company_id) return;

      try {
        // Load service bots
        const botsResponse = await apiClient.serviceBot.list({
          limit: 100,
        });
        setServiceBots(botsResponse.data.results || []);

        // Load info flows
        apiClient.infoFlow.setAuthHeader(
          process.env.NEXT_PUBLIC_STATS_SERVICE_SECRET_KEY
        );
        const flowsResponse = await apiClient.infoFlow.list({
          company_id: user.company_id,
          limit: 100,
        });
        setInfoFlows(flowsResponse.data.results || []);

        // If bot ID in URL, auto-select it
        if (botIdFromUrl) {
          const bot = botsResponse.data.results?.find(
            (b) => b.id.toString() === botIdFromUrl
          );
          if (bot) {
            setSelectedBot(bot);
            await checkBotRelations(bot.id);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Не удалось загрузить данные');
      }
    };

    loadData();
  }, [user?.company_id, botIdFromUrl]);

  // Check bot relations
  const checkBotRelations = async (botId: number) => {
    try {
      const response = await apiClient.serviceBotRelation.getByBot(botId);
      const relations = response.data || [];
      setBotRelations(relations);
      setRelations(relations);

      // If no relations, show linking prompt
      if (relations.length === 0) {
        setShowLinkingPrompt(true);
      } else {
        setShowLinkingPrompt(false);
      }
    } catch (error) {
      console.error('Error checking bot relations:', error);
    }
  };

  // Link bot to flow
  const linkBotToFlow = async () => {
    if (!selectedBot || !selectedFlow) {
      toast.error('Выберите поток для привязки');
      return;
    }

    setIsLinking(true);
    try {
      apiClient.serviceBot.setAuthHeader(
        process.env.NEXT_PUBLIC_MAIN_SERVICE_API_KEY
      );
      await apiClient.serviceBotRelation.create({
        service_bot_id: selectedBot.id,
        info_flow_id: selectedFlow.id,
        is_active: true,
      });

      toast.success('Бот успешно привязан к потоку');
      setShowLinkingPrompt(false);

      // Refresh relations
      await checkBotRelations(selectedBot.id);
    } catch (error: any) {
      console.error('Error linking bot to flow:', error);
      if (error.response?.status === 409) {
        toast.info('Бот уже привязан к этому потоку');
        setShowLinkingPrompt(false);
      } else {
        toast.error(
          error.response?.data?.detail || 'Не удалось привязать бота к потоку'
        );
      }
    } finally {
      setIsLinking(false);
    }
  };

  // Load data
  const loadServiceBots = useCallback(async () => {
    if (!user?.company_id) return;

    try {
      const response = await apiClient.serviceBot.list({
        limit: 100,
        offset: 0,
      });
      setServiceBots(response.data.results || []);
    } catch (error) {
      console.error('Error loading service bots:', error);
      toast.error('Не удалось загрузить сервисных ботов');
    }
  }, [user]);

  const loadInfoFlows = useCallback(async () => {
    if (!user?.company_id) return;

    try {
      apiClient.infoFlow.setAuthHeader(
        process.env.NEXT_PUBLIC_STATS_SERVICE_SECRET_KEY
      );
      const response = await apiClient.infoFlow.list({ limit: 100 });
      setInfoFlows(response.data.results || []);
    } catch (error) {
      console.error('Error loading info flows:', error);
      toast.error('Не удалось загрузить потоки');
    }
  }, [user]);

  const loadRelations = useCallback(async () => {
    if (!selectedBot) return;

    try {
      const response = await apiClient.serviceBotRelation.getByBot(
        selectedBot.id
      );
      setRelations(response.data || []);
    } catch (error) {
      console.error('Error loading relations:', error);
    }
  }, [selectedBot]);

  // Initialize chat
  const initializeChat = async (botId?: number, flowId?: number) => {
    const bot = botId ? serviceBots.find((b) => b.id === botId) : selectedBot;
    const flow = flowId ? infoFlows.find((f) => f.id === flowId) : selectedFlow;

    if (!bot || !flow || !user) {
      toast.error('Выберите бота и поток для начала тестирования');
      return;
    }

    setIsLoading(true);

    try {
      // First check if there's an existing appeal
      const appealsResponse = await apiClient.appeal.list({
        company_id: user.company_id,
        info_flow_id: flow.id,
        status: 'opened',
        limit: 100,
      });

      let currentAppeal = appealsResponse.data.results?.[0];
      let currentSender = null;

      if (!currentAppeal) {
        apiClient.serviceBot.setAuthHeader(
          process.env.NEXT_PUBLIC_MAIN_SERVICE_API_KEY
        );
        const senderResponse = await apiClient.sender.create({
          id: user.id,
          type: 'user',
          name: `${user.name} User ${user.id}`,
          username: user.name,
          company_id: user.company_id,
          avatar: selectedBot?.avatar,
        });
        console.log(senderResponse);
        currentSender = senderResponse.data;
        setSender(currentSender);

        // Create a new chat first
        // const chatResponse = await apiClient.chat.create({
        //   info_flow_id: flow.id,
        //   type: 'web',
        //   messenger_chat_id: `web_test_${user.id}_${Date.now()}`,
        //   meta: {
        //     name: `Test by ${user.name || user.email}`,
        //     is_test: true,
        //     bot_id: bot.id,
        //     bot_name: bot.name,
        //   },
        // });
        // console.log(chatResponse);
        // currentChat = chatResponse.data;

        // Create a new appeal
        // const appealResponse = await apiClient.appeal.create({
        //   id: Math.floor(Date.now() / 100000),
        //   chat_id: Number(currentChat.id),
        //   company_id: Number(user.company_id),
        //   service_bot_id: bot.id,
        //   status: 'new',
        //   needs_an_operator: true,
        //   is_ruled_by_bot: false,
        //   operator: currentSender.id,
        // });
        // console.log(appealResponse);

        // currentAppeal = appealResponse.data;
      } else {
        // Get the chat info

        // const chatResponse = await apiClient.chat.get(currentAppeal.chat_id);
        // currentChat = chatResponse.data;
        apiClient.serviceBot.setAuthHeader(
          process.env.NEXT_PUBLIC_MAIN_SERVICE_API_KEY
        );
        const senderResponse = await apiClient.sender.create({
          id: user.id,
          type: 'user',
          name: `${user.name} User ${user.id}`,
          username: user.name,
          company_id: user.company_id,
          avatar: selectedBot?.avatar,
        });
        console.log(senderResponse);
        currentSender = senderResponse.data;
        setSender(currentSender);
      }

      // setAppeal(currentAppeal);
      // setChat(currentChat);

      // Load existing messages if any
      // if (currentAppeal.id) {
      //   await loadMessages(currentAppeal.id);
      // }

      // Connect WebSocket
      // connectWebSocket(currentAppeal.id);

      toast.success('Чат инициализирован');
    } catch (error: any) {
      console.error('Error initializing chat:', error);
      toast.error(
        error.response?.data?.detail || 'Не удалось инициализировать чат'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    loadServiceBots();
    loadInfoFlows();
  }, [loadServiceBots, loadInfoFlows]);

  useEffect(() => {
    if (selectedBot) {
      loadRelations();
    }
  }, [selectedBot, loadRelations]);

  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  // Get available flows for selected bot
  const availableFlows = selectedBot
    ? infoFlows.filter((flow) =>
        relations.some(
          (rel) =>
            rel.service_bot_id === selectedBot.id &&
            rel.info_flow_id === flow.id &&
            rel.is_active
        )
      )
    : [];

  return (
    <Suspense>
      <div className={cn('flex h-screen bg-background', 'fixed inset-0 z-50')}>
        {/* Desktop Sidebar */}
        <div className='hidden md:block w-68 flex-shrink-0'>
          <Sidebar />
        </div>

        <div className='flex-1 flex flex-col min-w-0'>
          <Header />

          <main className='flex-1 flex'>
            {/* Left Panel - Configuration */}
            {/* <div className={cn('border-r bg-muted/10', 'w-80')}> */}
            <div className='flex-1'>
              <div className='h-full flex flex-col'>
                <div className='p-6 border-b'>
                  <h2 className='text-2xl font-bold mb-2'>
                    Тестирование ботов
                  </h2>
                  <p className='text-sm text-muted-foreground'>
                    Протестируйте работу ваших сервисных ботов в реальном
                    времени
                  </p>
                </div>

                <ScrollArea className='flex-1'>
                  <div className='p-6 space-y-6'>
                    {/* Bot Selection */}
                    <div className='space-y-2'>
                      <Label className='text-sm font-medium'>
                        Выберите бота
                      </Label>
                      <Select
                        value={selectedBot?.id.toString()}
                        onValueChange={(value) => {
                          const bot = serviceBots.find(
                            (b) => b.id === parseInt(value)
                          );
                          setSelectedBot(bot || null);
                          setSelectedFlow(null);
                          if (bot) {
                            checkBotRelations(bot.id);
                          }
                        }}
                      >
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder='Выберите сервисного бота' />
                        </SelectTrigger>
                        <SelectContent>
                          {serviceBots.map((bot) => (
                            <SelectItem key={bot.id} value={bot.id.toString()}>
                              <div className='flex items-center gap-2'>
                                <Avatar className='h-6 w-6'>
                                  <AvatarImage src={bot.avatar} />
                                  <AvatarFallback>
                                    <Bot className='h-4 w-4' />
                                  </AvatarFallback>
                                </Avatar>
                                <span>{bot.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Bot Linking Alert */}
                    {showLinkingPrompt && selectedBot && (
                      <Alert className='border-orange-200 bg-orange-50'>
                        <AlertCircle className='h-4 w-4 text-orange-600' />
                        <AlertTitle>Бот не привязан к потоку</AlertTitle>
                        <AlertDescription className='mt-2'>
                          <p className='text-sm mb-3'>
                            Для тестирования бота необходимо привязать его к
                            потоку информации.
                          </p>
                          <Select
                            value={selectedFlow?.id.toString()}
                            onValueChange={(value) => {
                              const flow = infoFlows.find(
                                (f) => f.id.toString() === value
                              );
                              setSelectedFlow(flow || null);
                            }}
                          >
                            <SelectTrigger className='w-full mb-3'>
                              <SelectValue placeholder='Выберите поток для привязки' />
                            </SelectTrigger>
                            <SelectContent>
                              {infoFlows.map((flow) => (
                                <SelectItem
                                  key={flow.id}
                                  value={flow.id.toString()}
                                >
                                  {flow?.name} ({flow?.type})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            className='w-full'
                            onClick={linkBotToFlow}
                            disabled={!selectedFlow || isLinking}
                          >
                            {isLinking ? (
                              <>
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                Привязка...
                              </>
                            ) : (
                              <>
                                <Link className='mr-2 h-4 w-4' />
                                Привязать к потоку
                              </>
                            )}
                          </Button>
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Flow Selection */}
                    {selectedBot && !showLinkingPrompt && (
                      <div className='space-y-2'>
                        <Label className='text-sm font-medium'>
                          Выберите поток
                        </Label>
                        <Select
                          value={selectedFlow?.id.toString()}
                          onValueChange={(value) => {
                            const flow = availableFlows.find(
                              (f) => f.id === parseInt(value)
                            );
                            setSelectedFlow(flow || null);
                          }}
                          disabled={availableFlows.length === 0}
                        >
                          <SelectTrigger className='w-full'>
                            <SelectValue
                              placeholder={
                                availableFlows.length === 0
                                  ? 'Нет доступных потоков'
                                  : 'Выберите поток'
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {availableFlows.map((flow) => (
                              <SelectItem
                                key={flow.id}
                                value={flow.id.toString()}
                              >
                                <div className='flex items-center gap-2'>
                                  <MessageSquare className='h-4 w-4 text-muted-foreground' />
                                  <span>{flow?.name}</span>
                                  <Badge variant='outline' className='ml-auto'>
                                    {flow?.type}
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Bot Info */}
                    {selectedBot && (
                      <Card>
                        <CardHeader className='pb-3'>
                          <CardTitle className='text-sm'>
                            Информация о боте
                          </CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-3'>
                          <div className='flex items-center gap-3'>
                            <Avatar className='h-12 w-12'>
                              <AvatarImage src={selectedBot.avatar} />
                              <AvatarFallback>
                                <Bot className='h-6 w-6' />
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className='font-medium'>{selectedBot.name}</p>
                              <p className='text-sm text-muted-foreground'>
                                {selectedBot.llm_model}
                              </p>
                            </div>
                          </div>

                          <div className='space-y-2'>
                            <div className='flex items-center justify-between text-sm'>
                              <span className='text-muted-foreground'>
                                Температура
                              </span>
                              <Badge variant='secondary'>
                                {selectedBot.temperature}
                              </Badge>
                            </div>
                            <div className='flex items-center justify-between text-sm'>
                              <span className='text-muted-foreground'>
                                Разговорчивость
                              </span>
                              <Badge variant='secondary'>
                                {selectedBot.talkativeness}
                              </Badge>
                            </div>
                          </div>

                          <div className='pt-2'>
                            <p className='text-xs text-muted-foreground mb-1'>
                              Промпт
                            </p>
                            <p className='text-xs bg-muted p-2 rounded-md line-clamp-3'>
                              {selectedBot.prompt}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Start Test Button */}
                    <Button
                      onClick={() => initializeChat()}
                      disabled={
                        !selectedBot ||
                        !selectedFlow ||
                        isLoading ||
                        showLinkingPrompt
                      }
                      className='w-full'
                      size='lg'
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                          Инициализация...
                        </>
                      ) : appeal ? (
                        <>
                          <RefreshCw className='mr-2 h-4 w-4' />
                          Перезапустить тест
                        </>
                      ) : (
                        <>
                          <Zap className='mr-2 h-4 w-4' />
                          Начать тестирование
                        </>
                      )}
                    </Button>
                  </div>
                </ScrollArea>
              </div>
            </div>
          </main>
        </div>
      </div>
    </Suspense>
  );
}
