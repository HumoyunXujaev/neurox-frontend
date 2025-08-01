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
  Search,
  Bot,
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  Circle,
  CheckCheck,
  Clock,
  AlertCircle,
  Loader2,
  Settings,
  X,
  User,
  MessageSquare,
  Zap,
  Brain,
  Sparkles,
  Link,
  ArrowRight,
  RefreshCw,
  Trash2,
  Volume2,
  VolumeX,
  Copy,
  Download,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api/client';
import { getWebSocketUrl } from '@/lib/api/config';
import { tokenManager } from '@/lib/auth/token-manager';
import { cn } from '@/lib/utils';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { motion, AnimatePresence } from 'framer-motion';

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

interface Message {
  id: number;
  appeal_id: number;
  sender: Sender;
  text: string;
  type: string;
  created_at: string;
  is_read?: boolean;
  status?: string | 'sending' | 'sent' | 'error';
  localId?: string;
}

interface Chat {
  id: number;
  type: string;
  messenger_chat_id: string;
  meta?: {
    name?: string;
    username?: string;
    avatar?: string;
  };
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
  const [chat, setChat] = useState<any | Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showLinkingPrompt, setShowLinkingPrompt] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [testStartTime, setTestStartTime] = useState<Date | null>(null);
  const [sender, setSender] = useState<Sender | null>(null);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const access_token = tokenManager.getAccessToken();

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  }, [soundEnabled]);

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

  // WebSocket connection
  const connectWebSocket = useCallback(
    (appealId: number) => {
      if (!access_token) return;

      // Close existing connection
      if (wsRef.current) {
        wsRef.current.close();
      }

      const wsUrl = getWebSocketUrl('/api/v1/ws/crm/', access_token);
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;

        // Subscribe to appeal updates
        ws.send(
          JSON.stringify({
            cmd: 'subscribe',
            channel: 'appeal',
            channel_required_data: appealId,
          })
        );
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message:', data);

          switch (data.type) {
            case 'NEW_MESSAGE':
              if (data.message && data.message.appeal_id === appealId) {
                setMessages((prev) => {
                  const exists = prev.some(
                    (msg) =>
                      msg.id === data.message.id ||
                      msg.localId === data.message.localId
                  );
                  if (!exists) {
                    playNotificationSound();
                    return [...prev, data.message];
                  }
                  return prev;
                });
                setIsTyping(false);
              }
              break;

            case 'TYPING':
              if (data.appeal_id === appealId && data.sender_type === 'bot') {
                setIsTyping(true);
                if (typingTimeoutRef.current) {
                  clearTimeout(typingTimeoutRef.current);
                }
                typingTimeoutRef.current = setTimeout(() => {
                  setIsTyping(false);
                }, 3000);
              }
              break;

            case 'UPDATE_APPEAL':
              if (data.appeal && data.appeal.id === appealId) {
                setAppeal(data.appeal);
              }
              break;

            case 'ERROR':
              console.error('WebSocket error:', data.error);
              toast.error(data.error || 'Ошибка WebSocket соединения');
              break;
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);

        // Attempt to reconnect
        if (reconnectAttemptsRef.current < 5) {
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connectWebSocket(appealId);
          }, 3000 * reconnectAttemptsRef.current);
        }
      };

      wsRef.current = ws;
    },
    [user, playNotificationSound]
  );

  // Initialize chat
  const initializeChat = async (botId?: number, flowId?: number) => {
    const bot = botId ? serviceBots.find((b) => b.id === botId) : selectedBot;
    const flow = flowId ? infoFlows.find((f) => f.id === flowId) : selectedFlow;

    if (!bot || !flow || !user) {
      toast.error('Выберите бота и поток для начала тестирования');
      return;
    }

    setIsLoading(true);
    setTestStartTime(new Date());

    try {
      // First check if there's an existing appeal
      const appealsResponse = await apiClient.appeal.list({
        company_id: user.company_id,
        info_flow_id: flow.id,
        status: 'opened',
        limit: 100,
      });

      let currentAppeal = appealsResponse.data.results?.[0];
      let currentChat = null;
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
        currentSender = senderResponse.data;
        setSender(currentSender);

        // Create a new chat first
        const chatResponse = await apiClient.chat.create({
          info_flow_id: flow.id,
          type: 'web',
          messenger_chat_id: `web_test_${user.id}_${Date.now()}`,
          meta: {
            name: `Test by ${user.name || user.email}`,
            is_test: true,
            bot_id: bot.id,
            bot_name: bot.name,
          },
        });
        currentChat = chatResponse.data;

        // Create a new appeal
        const appealResponse = await apiClient.appeal.create({
          id: Math.floor(Date.now() / 100000),
          chat_id: Number(currentChat.id),
          company_id: Number(user.company_id),
          service_bot_id: bot.id,
          status: 'new',
          needs_an_operator: true,
          is_ruled_by_bot: false,
          operator: currentSender.id,
        });

        currentAppeal = appealResponse.data;
      } else {
        // Get the chat info
        const chatResponse = await apiClient.chat.get(currentAppeal.chat_id);
        currentChat = chatResponse.data;
      }

      setAppeal(currentAppeal);
      setChat(currentChat);

      // Load existing messages if any
      if (currentAppeal.id) {
        await loadMessages(currentAppeal.id);
      }

      // Connect WebSocket
      connectWebSocket(currentAppeal.id);

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

  // Load messages
  const loadMessages = async (appealId: number) => {
    try {
      const response = await apiClient.chat.getMessages(appealId, {
        limit: 100,
        offset: 0,
      });
      console.log(response, 'messages load');
      setMessages(response.data.results || []);

      // Scroll to bottom
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!appeal || !newMessage.trim() || isSending) return;

    const localId = `local-${Date.now()}`;
    const tempMessage: Message = {
      id: 0,
      localId,
      appeal_id: appeal.id,
      sender: {
        id: user?.id.toString() || 'user',
        type: 'user',
        name: user?.name || user?.email,
        avatar: selectedBot?.avatar,
      },
      text: newMessage.trim(),
      type: 'text',
      created_at: new Date().toISOString(),
      status: 'sending',
    };

    // Add temporary message
    setMessages((prev) => [...prev, tempMessage]);
    setNewMessage('');
    setIsSending(true);

    try {
      const response = await apiClient.chat.sendMessage({
        appeal_id: appeal.id,
        text: tempMessage.text,
        type: 'text',
      });
      console.log(response, 'response');

      // Update with real message
      setMessages((prev) =>
        prev.map((msg) =>
          msg.localId === localId
            ? { ...response.data, status: 'sent' as const }
            : msg
        )
      );

      // Scroll to bottom
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error: any) {
      console.error('Error sending message:', error);
      // Mark message as error
      setMessages((prev) =>
        prev.map((msg) =>
          msg.localId === localId ? { ...msg, status: 'error' as const } : msg
        )
      );
      toast.error(
        error.response?.data?.detail || 'Не удалось отправить сообщение'
      );
    } finally {
      setIsSending(false);
    }
  };

  // Clear chat
  const clearChat = useCallback(async () => {
    if (!appeal) return;

    try {
      // Close the appeal
      await apiClient.appeal.update(appeal.id, {
        status: 'closed',
      });

      // Reset state
      setAppeal(null);
      setChat(null);
      setMessages([]);
      setTestStartTime(null);

      // Close WebSocket
      if (wsRef.current) {
        wsRef.current.close();
      }

      toast.success('Чат очищен');
    } catch (error) {
      console.error('Error clearing chat:', error);
      toast.error('Не удалось очистить чат');
    }
  }, [appeal]);

  // Copy conversation
  const copyConversation = useCallback(() => {
    const text = messages
      .map((msg) => {
        const sender =
          msg.sender.type === 'user' ? 'Вы' : selectedBot?.name || 'Бот';
        const time = new Date(msg.created_at).toLocaleTimeString();
        return `[${time}] ${sender}: ${msg.text}`;
      })
      .join('\n');

    navigator.clipboard.writeText(text);
    toast.success('Диалог скопирован в буфер обмена');
  }, [messages, selectedBot]);

  // Export conversation
  const exportConversation = useCallback(() => {
    const data = {
      bot: selectedBot,
      flow: selectedFlow,
      messages: messages,
      startTime: testStartTime,
      endTime: new Date(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-test-${
      selectedBot?.name
    }-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [selectedBot, selectedFlow, messages, testStartTime]);

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
    // Initialize audio
    audioRef.current = new Audio('/notification.mp3');
    audioRef.current.volume = 0.5;

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
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
      <div
        className={cn(
          'flex h-screen bg-background',
          isFullscreen && 'fixed inset-0 z-50'
        )}
      >
        {/* Desktop Sidebar */}
        {!isFullscreen && (
          <div className='hidden md:block w-68 flex-shrink-0'>
            <Sidebar />
          </div>
        )}

        <div className='flex-1 flex flex-col min-w-0'>
          {!isFullscreen && <Header />}

          <main className='flex-1 flex overflow-hidden'>
            {/* Left Panel - Configuration */}
            <div
              className={cn(
                'border-r bg-muted/10',
                isFullscreen ? 'w-80' : 'w-96'
              )}
            >
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
                                  {flow.name} ({flow.type})
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
                                  <span>{flow.name}</span>
                                  <Badge variant='outline' className='ml-auto'>
                                    {flow.type}
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

                    {/* Test Statistics */}
                    {appeal && testStartTime && (
                      <Card>
                        <CardHeader className='pb-3'>
                          <CardTitle className='text-sm'>
                            Статистика теста
                          </CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-2'>
                          <div className='flex items-center justify-between text-sm'>
                            <span className='text-muted-foreground'>
                              Сообщений
                            </span>
                            <Badge variant='secondary'>{messages.length}</Badge>
                          </div>
                          <div className='flex items-center justify-between text-sm'>
                            <span className='text-muted-foreground'>
                              Длительность
                            </span>
                            <Badge variant='secondary'>
                              {Math.floor(
                                (new Date().getTime() -
                                  testStartTime.getTime()) /
                                  1000 /
                                  60
                              )}{' '}
                              мин
                            </Badge>
                          </div>
                          <div className='flex items-center justify-between text-sm'>
                            <span className='text-muted-foreground'>
                              Статус
                            </span>
                            <Badge
                              variant={isConnected ? 'default' : 'destructive'}
                              className='gap-1'
                            >
                              <Circle
                                className={cn(
                                  'h-2 w-2',
                                  isConnected
                                    ? 'fill-green-500'
                                    : 'fill-red-500'
                                )}
                              />
                              {isConnected ? 'Подключен' : 'Отключен'}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>

            {/* Right Panel - Chat */}
            <div className='flex-1 flex flex-col bg-background'>
              {/* Chat Header */}
              <div className='border-b p-4 flex items-center justify-between bg-card'>
                <div className='flex items-center gap-3'>
                  {selectedBot ? (
                    <>
                      <Avatar className='h-10 w-10'>
                        <AvatarImage src={selectedBot.avatar} />
                        <AvatarFallback>
                          <Bot className='h-5 w-5' />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className='font-semibold'>{selectedBot.name}</h3>
                        <p className='text-sm text-muted-foreground'>
                          {selectedFlow?.name || 'Выберите поток'}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div>
                      <h3 className='font-semibold'>Тестовый чат</h3>
                      <p className='text-sm text-muted-foreground'>
                        Выберите бота и поток для начала
                      </p>
                    </div>
                  )}
                  {isTyping && (
                    <Badge
                      variant='secondary'
                      className='ml-auto animate-pulse'
                    >
                      <Bot className='h-3 w-3 mr-1' />
                      печатает...
                    </Badge>
                  )}
                </div>

                <div className='flex items-center gap-2'>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => setSoundEnabled(!soundEnabled)}
                        >
                          {soundEnabled ? (
                            <Volume2 className='h-4 w-4' />
                          ) : (
                            <VolumeX className='h-4 w-4' />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {soundEnabled ? 'Выключить звук' : 'Включить звук'}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={copyConversation}
                          disabled={messages.length === 0}
                        >
                          <Copy className='h-4 w-4' />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Копировать диалог</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={exportConversation}
                          disabled={messages.length === 0}
                        >
                          <Download className='h-4 w-4' />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Экспортировать диалог</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={clearChat}
                          disabled={!appeal}
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Очистить чат</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => setIsFullscreen(!isFullscreen)}
                        >
                          {isFullscreen ? (
                            <Minimize2 className='h-4 w-4' />
                          ) : (
                            <Maximize2 className='h-4 w-4' />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {isFullscreen
                          ? 'Выйти из полноэкранного режима'
                          : 'Полноэкранный режим'}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              {/* Messages Area */}
              <ScrollArea className='flex-1 p-4'>
                {!appeal ? (
                  <div className='flex flex-col items-center justify-center h-full text-center'>
                    <div className='mb-6 relative'>
                      <div className='absolute inset-0 bg-purple-500/20 blur-3xl rounded-full' />
                      <Bot className='h-24 w-24 text-purple-500 relative' />
                    </div>
                    <h3 className='text-xl font-semibold mb-2'>
                      Готов к тестированию
                    </h3>
                    <p className='text-muted-foreground max-w-md'>
                      Выберите сервисного бота и поток, затем нажмите "Начать
                      тестирование", чтобы начать диалог
                    </p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className='flex flex-col items-center justify-center h-full text-center'>
                    <Sparkles className='h-12 w-12 text-purple-500 mb-4' />
                    <h3 className='text-lg font-semibold mb-2'>
                      Чат инициализирован
                    </h3>
                    <p className='text-muted-foreground'>
                      Напишите первое сообщение, чтобы начать диалог
                    </p>
                  </div>
                ) : (
                  <div className='space-y-4'>
                    <AnimatePresence>
                      {messages.map((message) => (
                        <motion.div
                          key={message.id || message.localId}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.2 }}
                          className={cn(
                            'flex gap-3',
                            message?.sender?.type === 'user'
                              ? 'justify-end'
                              : 'justify-start'
                          )}
                        >
                          {message?.sender?.type !== 'user' && (
                            <Avatar className='h-8 w-8 flex-shrink-0'>
                              <AvatarImage src={message?.sender?.avatar} />
                              <AvatarFallback>
                                <Bot className='h-4 w-4' />
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div
                            className={cn(
                              'max-w-[70%] space-y-1',
                              message?.sender?.type === 'user' && 'items-end'
                            )}
                          >
                            <div
                              className={cn(
                                'rounded-2xl px-4 py-2 break-words',
                                message?.sender?.type === 'user'
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted'
                              )}
                            >
                              <p className='text-sm whitespace-pre-wrap'>
                                {message.text}
                              </p>
                            </div>
                            <div
                              className={cn(
                                'flex items-center gap-1 text-xs text-muted-foreground px-2',
                                message?.sender?.type === 'user' &&
                                  'justify-end'
                              )}
                            >
                              <span>
                                {new Date(
                                  message.created_at
                                ).toLocaleTimeString('ru-RU', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                              {message?.sender?.type === 'user' && (
                                <>
                                  {message.status === 'sending' && (
                                    <Clock className='h-3 w-3' />
                                  )}
                                  {message.status === 'sent' && (
                                    <CheckCheck className='h-3 w-3' />
                                  )}
                                  {message.status === 'error' && (
                                    <AlertCircle className='h-3 w-3 text-destructive' />
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                          {message?.sender?.type === 'user' && (
                            <Avatar className='h-8 w-8 flex-shrink-0'>
                              <AvatarImage src={selectedBot?.avatar} />
                              <AvatarFallback>
                                <User className='h-4 w-4' />
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className='flex gap-3'
                      >
                        <Avatar className='h-8 w-8'>
                          <AvatarImage src={selectedBot?.avatar} />
                          <AvatarFallback>
                            <Bot className='h-4 w-4' />
                          </AvatarFallback>
                        </Avatar>
                        <div className='bg-muted rounded-2xl px-4 py-2'>
                          <div className='flex gap-1'>
                            <motion.div
                              className='w-2 h-2 bg-muted-foreground rounded-full'
                              animate={{ opacity: [0.4, 1, 0.4] }}
                              transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                delay: 0,
                              }}
                            />
                            <motion.div
                              className='w-2 h-2 bg-muted-foreground rounded-full'
                              animate={{ opacity: [0.4, 1, 0.4] }}
                              transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                delay: 0.2,
                              }}
                            />
                            <motion.div
                              className='w-2 h-2 bg-muted-foreground rounded-full'
                              animate={{ opacity: [0.4, 1, 0.4] }}
                              transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                delay: 0.4,
                              }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              {/* Input Area */}
              {appeal && (
                <div className='border-t p-4 bg-card'>
                  <div className='flex gap-2'>
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      placeholder='Введите сообщение...'
                      className='min-h-[44px] max-h-32 resize-none'
                      disabled={isSending}
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || isSending}
                      size='icon'
                      className='h-11 w-11'
                    >
                      {isSending ? (
                        <Loader2 className='h-4 w-4 animate-spin' />
                      ) : (
                        <Send className='h-4 w-4' />
                      )}
                    </Button>
                  </div>
                  <div className='flex items-center justify-between mt-2'>
                    <div className='flex items-center gap-2'>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='h-8 px-2'
                        onClick={() => fileInputRef.current?.click()}
                        disabled
                      >
                        <Paperclip className='h-3.5 w-3.5 mr-1' />
                        Файл
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='h-8 px-2'
                        disabled
                      >
                        <Smile className='h-3.5 w-3.5 mr-1' />
                        Эмодзи
                      </Button>
                    </div>
                    <p className='text-xs text-muted-foreground'>
                      {newMessage.length}/1000
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type='file'
                    className='hidden'
                    accept='image/*,.pdf,.doc,.docx'
                  />
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </Suspense>
  );
}
