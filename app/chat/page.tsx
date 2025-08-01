'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  Send,
  Bot,
  User,
  Settings,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Download,
  Copy,
  Trash2,
  ChevronLeft,
  MessageSquare,
  Clock,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Brain,
  Activity,
  Play,
  Pause,
  TrendingUp,
  Timer,
  Wifi,
  WifiOff,
  Star,
  MessageCircle,
  Eye,
  Paperclip,
  Smile,
} from 'lucide-react';

import { useAuth } from '@/contexts/auth-context';
import {
  apiClient,
  type ServiceBot,
  type ServiceBotRelation,
} from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';

interface ChatMessage {
  id: number;
  type: string | 'text' | 'image' | 'audio';
  date: string;
  sender: {
    id: string;
    type: string | 'user' | 'bot' | 'service';
    name?: string;
    avatar?: string;
  };
  is_sent_by_service: boolean;
  is_sent_by_bot: boolean;
  image?: string | null;
  message: string;
  status?: string | 'sending' | 'sent' | 'error';
  localId?: string;
}

interface ChatStats {
  messageCount: number;
  sessionDuration: number;
  avgResponseTime: number;
  lastResponseTime?: number;
  botAccuracy: number;
  userSatisfaction: number;
}

function ChatPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const botIdFromUrl = searchParams.get('bot');

  // State
  const [serviceBots, setServiceBots] = useState<ServiceBot[]>([]);
  const [selectedBot, setSelectedBot] = useState<ServiceBot | null>(null);
  const [botRelations, setBotRelations] = useState<ServiceBotRelation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    'connected' | 'connecting' | 'disconnected'
  >('disconnected');
  const [botcoinBalance, setBotcoinBalance] = useState<number>(0);
  const [sessionBotcoinsUsed, setSessionBotcoinsUsed] = useState<number>(0);
  const [messageCount, setMessageCount] = useState<number>(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  const [stats, setStats] = useState<ChatStats>({
    messageCount: 0,
    sessionDuration: 0,
    avgResponseTime: 0,
    botAccuracy: 95,
    userSatisfaction: 4.8,
  });

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const statsIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const responseTimeRef = useRef<number>(0);

  const BOTCOIN_COSTS = {
    'gpt-3.5-turbo': 0.5,
    'gpt-4': 2.0,
    'gpt-4-turbo': 1.5,
    'claude-2': 1.5,
    'claude-3': 2.0,
    'gpt-4o-mini': 1,
    // Добавьте другие модели по необходимости
  };

  const fetchBotcoinBalance = async () => {
    try {
      setIsLoadingBalance(true);
      const response = await apiClient.subscription.getBalance();
      setBotcoinBalance(response.data.total_balance);
    } catch (error) {
      console.error('Failed to fetch botcoin balance:', error);
      toast.error('Не удалось загрузить баланс боткоинов');
    } finally {
      setIsLoadingBalance(false);
    }
  };

  // Функция для расчета стоимости сообщения
  const calculateMessageCost = (model: string): number => {
    return BOTCOIN_COSTS[model as keyof typeof BOTCOIN_COSTS] || 1.0;
  };

  const useBotcoins = async (amount: number, description: string) => {
    try {
      const response = await apiClient.subscription.useBotcoins({
        amount,
        description,
      });

      // Обновляем локальный баланс
      setBotcoinBalance(response.data.new_balance);
      setSessionBotcoinsUsed((prev) => prev + amount);

      return true;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail || 'Недостаточно боткоинов';
      toast.error(errorMessage);
      return false;
    }
  };

  // Добавьте useEffect для загрузки баланса при монтировании компонента:
  useEffect(() => {
    if (user) {
      fetchBotcoinBalance();
    }
  }, [user]);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio('/notification.ogg');
    audioRef.current.volume = 0.5;
  }, []);

  // Load service bots and info flows
  useEffect(() => {
    const loadData = async () => {
      if (!user?.company_id) return;

      try {
        // Load service bots
        const botsResponse = await apiClient.serviceBot.list({ limit: 100 });
        setServiceBots(botsResponse.data.results || []);

        // Auto-select bot from URL
        if (botIdFromUrl) {
          const bot = botsResponse.data.results?.find(
            (b: any) => b.id.toString() === botIdFromUrl
          );
          if (bot) {
            setSelectedBot(bot);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Не удалось загрузить данные');
      }
    };

    loadData();
  }, [user?.company_id, botIdFromUrl]);

  // Load chat history
  const loadChatHistory = async (botId: number, pageNum = 1) => {
    if (!user || isLoadingHistory) return;

    setIsLoadingHistory(true);
    try {
      console.log(botId, 'botid');
      const response = await apiClient.serviceBot.testChat.getHistory(
        Number(botId),
        pageNum,
        50
      );
      console.log(response, 'res');

      if (pageNum === 1) {
        setMessages(response.data.results.reverse());
      } else {
        setMessages((prev) => [...response.data.results.reverse(), ...prev]);
      }

      setPage(pageNum);
      setHasMore(response.data.page < response.data.total_pages);

      // Update stats
      setStats((prev) => ({
        ...prev,
        messageCount: response.data.total_count,
      }));

      // Scroll to bottom on first load
      if (pageNum === 1) {
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      if (pageNum === 1) {
        toast.error('Не удалось загрузить историю чата');
      }
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Start chat session
  const startChatSession = async () => {
    if (!selectedBot || !user) {
      toast.error('Выберите бота для начала тестирования');
      return;
    }

    setIsLoading(true);
    setSessionStartTime(new Date());
    setIsSessionActive(true);
    setConnectionStatus('connecting');

    try {
      // Load existing chat history
      await loadChatHistory(Number(selectedBot.id));

      // Simulate connection
      setTimeout(() => {
        setConnectionStatus('connected');
      }, 1500);

      // Start stats tracking
      if (statsIntervalRef.current) {
        clearInterval(statsIntervalRef.current);
      }

      statsIntervalRef.current = setInterval(() => {
        if (sessionStartTime) {
          const duration = Math.floor(
            (Date.now() - sessionStartTime.getTime()) / 1000
          );
          setStats((prev) => ({
            ...prev,
            sessionDuration: duration,
          }));
        }
      }, 1000);

      toast.success('Чат-сессия начата', {
        description: 'Готов к общению с AI-агентом',
      });
    } catch (error) {
      console.error('Error starting chat session:', error);
      toast.error('Не удалось начать чат-сессию');
      setConnectionStatus('disconnected');
      setIsSessionActive(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!selectedBot || !newMessage.trim() || isSending || !user) return;
    const messageCost = calculateMessageCost(selectedBot.llm_model);

    const localId = `local-${Date.now()}`;
    const tempMessage: ChatMessage = {
      id: 0,
      localId,
      type: 'text',
      date: new Date().toISOString(),
      sender: {
        id: user.id.toString(),
        type: 'user',
        name: user.name || user.email,
        avatar: selectedBot.avatar,
      },
      is_sent_by_service: true,
      is_sent_by_bot: false,
      message: newMessage.trim(),
      status: 'sending',
    };

    // Add temporary message
    setMessages((prev) => [...prev, tempMessage]);
    setNewMessage('');
    setIsSending(true);
    setIsTyping(true);
    responseTimeRef.current = Date.now();

    // Focus input
    inputRef.current?.focus();

    try {
      const response = await apiClient.serviceBot.testChat.sendMessage(
        selectedBot.id,
        {
          date: new Date().toISOString(),
          message: tempMessage.message,
          type: 'text',
          image: null,
          messenger_chat_id: `test_${user.id}_${selectedBot.id}`,
        }
      );

      // Calculate response time
      const responseTime = Date.now() - responseTimeRef.current;
      setStats((prev) => ({
        ...prev,
        lastResponseTime: responseTime,
        avgResponseTime: prev.avgResponseTime
          ? (prev.avgResponseTime + responseTime) / 2
          : responseTime,
        messageCount: prev.messageCount + 2, // User message + bot response
      }));

      // Update user message status
      setMessages((prev) =>
        prev.map((msg) =>
          msg.localId === localId
            ? { ...msg, status: 'sent' as const, id: Date.now() }
            : msg
        )
      );

      // Add bot response
      setMessages((prev) => [...prev, response.data]);

      // Play notification sound
      if (soundEnabled && audioRef.current) {
        audioRef.current.play().catch(() => {});
      }

      try {
        // Списание боткоинов
        await useBotcoins(
          messageCost,
          `Чат с ботом ${selectedBot.name} (модель: ${selectedBot.llm_model})`
        );
        // Увеличиваем счетчик сообщений
        setMessageCount((prev) => prev + 1);
      } catch (error) {
        console.error('Error botcoin message:', error);
        toast.error('Ошибка при отправке сообщения');
      }
      // Scroll to bottom
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error: any) {
      console.error('Error sending message:', error);

      // Update message status to error
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
      setIsTyping(false);
    }
  };

  // Clear chat
  const clearChat = () => {
    setMessages([]);
    setStats({
      messageCount: 0,
      sessionDuration: 0,
      avgResponseTime: 0,
      botAccuracy: 95,
      userSatisfaction: 4.8,
    });
    setIsSessionActive(false);
    setConnectionStatus('disconnected');
    if (statsIntervalRef.current) {
      clearInterval(statsIntervalRef.current);
    }
    toast.success('История чата очищена');
  };

  // Copy conversation
  const copyConversation = () => {
    const text = messages
      .map((msg) => {
        const sender = msg.is_sent_by_bot ? selectedBot?.name || 'Бот' : 'Вы';
        const time = format(new Date(msg.date), 'HH:mm', { locale: ru });
        return `[${time}] ${sender}: ${msg.message}`;
      })
      .join('\n');

    navigator.clipboard.writeText(text);
    toast.success('Диалог скопирован в буфер обмена');
  };

  // Export conversation
  const exportConversation = () => {
    const data = {
      bot: selectedBot,
      messages: messages,
      stats: stats,
      sessionStart: sessionStartTime,
      sessionEnd: new Date(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${selectedBot?.name}-${format(
      new Date(),
      'yyyy-MM-dd-HH-mm'
    )}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Чат экспортирован');
  };

  // Stop session
  const stopSession = () => {
    setIsSessionActive(false);
    setConnectionStatus('disconnected');
    if (statsIntervalRef.current) {
      clearInterval(statsIntervalRef.current);
    }
    toast.success('Сессия остановлена');
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (statsIntervalRef.current) {
        clearInterval(statsIntervalRef.current);
      }
    };
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey && !isSending) {
        e.preventDefault();
        sendMessage();
      }
    };

    const textarea = inputRef.current;
    if (textarea) {
      textarea.addEventListener('keydown', handleKeyPress);
      return () => textarea.removeEventListener('keydown', handleKeyPress);
    }
  }, [newMessage, isSending, selectedBot]);

  // Parse message HTML
  const parseMessageHTML = (html: string) => {
    const allowedTags = [
      'b',
      'strong',
      'i',
      'em',
      'u',
      's',
      'code',
      'pre',
      'br',
      'a',
      'blockquote',
    ];

    let sanitized = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');

    // Convert Telegram-specific tags
    sanitized = sanitized
      .replace(/\`\`\`([\s\S]*?)\`\`\`/g, '<pre>$1</pre>') // code blocks
      .replace(/`([^`]+)`/g, '<code>$1</code>') // inline code
      .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>') // bold text
      .replace(/__([^_]+)__/g, '<i>$1</i>') // italic
      .replace(/~~([^~]+)~~/g, '<s>$1</s>'); // strikethrough

    return sanitized;
  };

  return (
    // <ChatLayout isFullscreen={isFullscreen}>
    //   <>
    <Suspense>
      <div className='flex flex-col h-full bg-gradient-to-br from-gray-50 via-white to-purple-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900/20'>
        <div className='flex h-screen bg-background'>
          <div className='hidden md:block w-68 flex-shrink-0'>
            <Sidebar />
          </div>
          <div className='flex-1 flex flex-col min-w-0'>
            <Header />
            {/* Enhanced Header - only show in fullscreen or as page header */}
            <motion.div
              className='bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border-b border-gray-200/60 dark:border-gray-700/60 px-4 sm:px-6 py-4 shadow-sm'
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-4'>
                  {/* Show back button only in fullscreen mode */}
                  {isFullscreen && (
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => router.push('/agents')}
                      className='flex items-center text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors'
                    >
                      <ChevronLeft className='w-4 h-4 mr-1' />
                      <span className='hidden sm:inline'>Назад</span>
                    </Button>
                  )}

                  <div className='flex items-center space-x-3'>
                    <motion.div
                      className='p-3 bg-gradient-to-br from-purple-500 via-purple-600 to-blue-600 rounded-2xl shadow-lg'
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <MessageSquare className='w-6 h-6 text-white' />
                    </motion.div>
                    <div>
                      <h1 className='text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent'>
                        Тестирование AI-агента
                      </h1>
                      <p className='text-sm text-gray-500 dark:text-gray-400'>
                        Интерактивная проверка работы бота
                      </p>
                    </div>
                  </div>
                </div>

                <div className='flex items-center space-x-2'>
                  {/* Connection Status */}
                  <motion.div
                    className='flex items-center space-x-2'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {connectionStatus === 'connected' && (
                      <Badge
                        variant='outline'
                        className='border-green-200 text-green-700 bg-green-50 dark:border-green-700 dark:text-green-300 dark:bg-green-900/20'
                      >
                        <Wifi className='w-3 h-3 mr-1' />
                        Подключен
                      </Badge>
                    )}
                    {connectionStatus === 'connecting' && (
                      <Badge
                        variant='outline'
                        className='border-yellow-200 text-yellow-700 bg-yellow-50 dark:border-yellow-700 dark:text-yellow-300 dark:bg-yellow-900/20'
                      >
                        <Loader2 className='w-3 h-3 mr-1 animate-spin' />
                        Подключение
                      </Badge>
                    )}
                    {connectionStatus === 'disconnected' && (
                      <Badge
                        variant='outline'
                        className='border-gray-200 text-gray-700 bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:bg-gray-900/20'
                      >
                        <WifiOff className='w-3 h-3 mr-1' />
                        Отключен
                      </Badge>
                    )}
                  </motion.div>

                  {/* Action Buttons - hide fullscreen button since we have floating one */}
                  <TooltipProvider>
                    <div className='flex items-center space-x-1'>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => setSoundEnabled(!soundEnabled)}
                            className='h-9 w-9'
                          >
                            {soundEnabled ? (
                              <Volume2 className='w-4 h-4' />
                            ) : (
                              <VolumeX className='w-4 h-4' />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {soundEnabled ? 'Выключить звук' : 'Включить звук'}
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => setShowSettings(!showSettings)}
                            className='h-9 w-9'
                          >
                            <Settings className='w-4 h-4' />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Настройки</TooltipContent>
                      </Tooltip>
                    </div>
                  </TooltipProvider>
                </div>
              </div>

              {/* Bot Selection & Controls */}
              <motion.div
                className='mt-6 flex flex-wrap gap-4 items-center'
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <div className='flex-1 min-w-[250px]'>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                    Выберите AI-агента
                  </label>
                  <div className='relative'>
                    <Select
                      value={selectedBot?.id.toString() || ''}
                      onValueChange={(value) => {
                        const bot = serviceBots.find(
                          (b) => b.id === Number.parseInt(value)
                        );
                        setSelectedBot(bot || null);
                        if (bot) {
                          setMessages([]);
                          setStats({
                            messageCount: 0,
                            sessionDuration: 0,
                            avgResponseTime: 0,
                            botAccuracy: 95,
                            userSatisfaction: 4.8,
                          });
                        }
                      }}
                    >
                      <SelectTrigger className='w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600'>
                        <SelectValue placeholder='Выберите бота для тестирования' />
                      </SelectTrigger>
                      <SelectContent>
                        {serviceBots.map((bot) => (
                          <SelectItem key={bot.id} value={bot.id.toString()}>
                            <div className='flex items-center gap-3'>
                              <Avatar className='h-6 w-6'>
                                <AvatarImage
                                  src={bot.avatar || '/placeholder.svg'}
                                />
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
                </div>

                {selectedBot && (
                  <motion.div
                    className='flex items-center gap-3'
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {!isSessionActive ? (
                      <Button
                        onClick={startChatSession}
                        disabled={!selectedBot || isLoading}
                        className='bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200'
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                            Подключение...
                          </>
                        ) : (
                          <>
                            <Play className='w-4 h-4 mr-2' />
                            Начать тест
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        onClick={stopSession}
                        variant='outline'
                        className='border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 bg-transparent'
                      >
                        <Pause className='w-4 h-4 mr-2' />
                        Остановить
                      </Button>
                    )}
                  </motion.div>
                )}
              </motion.div>

              {/* Bot Info Panel */}
              {selectedBot && (
                <motion.div
                  className='mt-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl border border-purple-100 dark:border-purple-800'
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <div className='flex items-start space-x-4'>
                    <Avatar className='h-16 w-16 ring-4 ring-white dark:ring-gray-700 shadow-lg'>
                      <AvatarImage
                        src={selectedBot.avatar || '/placeholder.svg'}
                      />
                      <AvatarFallback className='bg-gradient-to-br from-purple-500 to-blue-500 text-white'>
                        <Bot className='h-8 w-8' />
                      </AvatarFallback>
                    </Avatar>

                    <div className='flex-1'>
                      <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                        {selectedBot.name}
                      </h3>
                      <p className='text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2'>
                        {selectedBot.prompt?.substring(0, 150)}
                        {selectedBot.prompt &&
                          selectedBot.prompt.length > 150 &&
                          '...'}
                      </p>

                      <div className='flex items-center space-x-4 mt-3'>
                        <Badge
                          variant='secondary'
                          className='bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                        >
                          <Brain className='w-3 h-3 mr-1' />
                          {selectedBot.llm_model}
                        </Badge>
                        <Badge
                          variant='secondary'
                          className='bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        >
                          <Activity className='w-3 h-3 mr-1' />
                          Температура: {selectedBot.temperature}
                        </Badge>
                        <Badge
                          variant='secondary'
                          className='bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                        >
                          <MessageSquare className='w-3 h-3 mr-1' />
                          Разговорчивость: {selectedBot.talkativeness}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Main Content */}
            <div className='flex-1 flex overflow-hidden'>
              {/* Chat Area */}
              <div className='flex-1 flex flex-col'>
                {/* Messages */}
                <div
                  ref={chatContainerRef}
                  className='flex-1 overflow-y-auto p-4 space-y-4'
                  onScroll={(e) => {
                    const target = e.target as HTMLDivElement;
                    if (
                      target.scrollTop === 0 &&
                      hasMore &&
                      !isLoadingHistory
                    ) {
                      loadChatHistory(selectedBot!.id, page + 1);
                    }
                  }}
                >
                  {isLoadingHistory && page === 1 && (
                    <div className='flex justify-center py-8'>
                      <Loader2 className='w-8 h-8 animate-spin text-purple-600' />
                    </div>
                  )}

                  {messages.length === 0 &&
                    !isLoadingHistory &&
                    !isSessionActive && (
                      <motion.div
                        className='flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400'
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <div className='relative mb-6'>
                          <motion.div
                            className='absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 blur-3xl opacity-20 rounded-full'
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{
                              duration: 4,
                              repeat: Number.POSITIVE_INFINITY,
                            }}
                          />
                          <MessageSquare className='w-24 h-24 text-purple-400 relative' />
                        </div>
                        <motion.h3
                          className='text-2xl font-semibold mb-3 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent'
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          Готов к диалогу
                        </motion.h3>
                        <motion.p
                          className='text-center max-w-md leading-relaxed'
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          Выберите AI-агента и начните тестирование для проверки
                          работы бота в реальном времени
                        </motion.p>

                        {selectedBot && (
                          <motion.div
                            className='mt-8 flex flex-col items-center space-y-4'
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                          >
                            <div className='flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400'>
                              <Sparkles className='w-4 h-4' />
                              <span>Бот {selectedBot.name} готов к работе</span>
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    )}

                  <AnimatePresence>
                    {messages.map((message, index) => (
                      <motion.div
                        key={message.localId || `msg-${message.id}-${index}`}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className={`flex ${
                          message.is_sent_by_bot
                            ? 'justify-start'
                            : 'justify-end'
                        }`}
                      >
                        <div
                          className={`flex ${
                            message.is_sent_by_bot
                              ? 'flex-row'
                              : 'flex-row-reverse'
                          } items-start space-x-3 max-w-[85%] sm:max-w-[75%]`}
                        >
                          {/* Avatar */}
                          <motion.div
                            className='flex-shrink-0'
                            whileHover={{ scale: 1.05 }}
                            transition={{
                              type: 'spring',
                              stiffness: 400,
                              damping: 17,
                            }}
                          >
                            {message.is_sent_by_bot ? (
                              selectedBot?.avatar ? (
                                <Avatar className='h-10 w-10 ring-2 ring-purple-100 dark:ring-purple-900'>
                                  <AvatarImage
                                    src={
                                      selectedBot.avatar || '/placeholder.svg'
                                    }
                                  />
                                  <AvatarFallback>
                                    <Bot className='w-5 h-5' />
                                  </AvatarFallback>
                                </Avatar>
                              ) : (
                                <div className='w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center ring-2 ring-purple-100 dark:ring-purple-900'>
                                  <Bot className='w-5 h-5 text-white' />
                                </div>
                              )
                            ) : (
                              <div className='w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-500 dark:from-gray-600 dark:to-gray-700 rounded-full flex items-center justify-center ring-2 ring-gray-100 dark:ring-gray-800'>
                                <User className='w-5 h-5 text-white' />
                              </div>
                            )}
                          </motion.div>

                          {/* Message bubble */}
                          <div
                            className={`relative group ${
                              message.is_sent_by_bot ? 'mr-3' : 'ml-3'
                            }`}
                          >
                            <motion.div
                              className={`px-4 py-3 rounded-2xl shadow-sm ${
                                message.is_sent_by_bot
                                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600'
                                  : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                              } ${
                                message.status === 'error'
                                  ? 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-700'
                                  : ''
                              }`}
                              whileHover={{
                                scale: 1.02,
                                boxShadow: message.is_sent_by_bot
                                  ? '0 8px 25px rgba(0,0,0,0.1)'
                                  : '0 8px 25px rgba(139, 92, 246, 0.3)',
                              }}
                              transition={{
                                type: 'spring',
                                stiffness: 400,
                                damping: 17,
                              }}
                            >
                              {message.is_sent_by_bot ? (
                                <div
                                  className='whitespace-pre-wrap break-words text-sm leading-relaxed'
                                  dangerouslySetInnerHTML={{
                                    __html: parseMessageHTML(message.message),
                                  }}
                                />
                              ) : (
                                <p className='whitespace-pre-wrap break-words text-sm leading-relaxed'>
                                  {message.message}
                                </p>
                              )}

                              {/* Message metadata */}
                              <div
                                className={`flex items-center justify-end mt-2 space-x-2 text-xs ${
                                  message.is_sent_by_bot
                                    ? 'text-gray-500 dark:text-gray-400'
                                    : 'text-white/70'
                                }`}
                              >
                                <span>
                                  {format(new Date(message.date), 'HH:mm', {
                                    locale: ru,
                                  })}
                                </span>
                                {!message.is_sent_by_bot && (
                                  <>
                                    {message.status === 'sending' && (
                                      <Loader2 className='w-3 h-3 animate-spin' />
                                    )}
                                    {message.status === 'sent' && (
                                      <CheckCircle2 className='w-3 h-3' />
                                    )}
                                    {message.status === 'error' && (
                                      <AlertCircle className='w-3 h-3 text-red-400' />
                                    )}
                                  </>
                                )}
                              </div>
                            </motion.div>

                            {/* Message actions */}
                            <div
                              className={`absolute top-0 ${
                                message.is_sent_by_bot
                                  ? '-right-20'
                                  : '-left-20'
                              } opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center space-x-1`}
                            >
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant='ghost'
                                      size='sm'
                                      className='h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-700'
                                      onClick={() => {
                                        navigator.clipboard.writeText(
                                          message.message
                                        );
                                        toast.success('Сообщение скопировано');
                                      }}
                                    >
                                      <Copy className='w-3 h-3' />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Копировать</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className='flex justify-start'
                    >
                      <div className='flex items-start space-x-3 max-w-[75%]'>
                        <Avatar className='h-10 w-10 ring-2 ring-purple-100 dark:ring-purple-900'>
                          <AvatarImage
                            src={selectedBot?.avatar || '/placeholder.svg'}
                          />
                          <AvatarFallback>
                            <Bot className='w-5 h-5' />
                          </AvatarFallback>
                        </Avatar>
                        <div className='bg-white dark:bg-gray-700 px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-600 shadow-sm'>
                          <div className='flex space-x-1'>
                            <motion.div
                              className='w-2 h-2 bg-purple-400 rounded-full'
                              animate={{ opacity: [0.4, 1, 0.4] }}
                              transition={{
                                duration: 1.5,
                                repeat: Number.POSITIVE_INFINITY,
                                delay: 0,
                              }}
                            />
                            <motion.div
                              className='w-2 h-2 bg-purple-400 rounded-full'
                              animate={{ opacity: [0.4, 1, 0.4] }}
                              transition={{
                                duration: 1.5,
                                repeat: Number.POSITIVE_INFINITY,
                                delay: 0.2,
                              }}
                            />
                            <motion.div
                              className='w-2 h-2 bg-purple-400 rounded-full'
                              animate={{ opacity: [0.4, 1, 0.4] }}
                              transition={{
                                duration: 1.5,
                                repeat: Number.POSITIVE_INFINITY,
                                delay: 0.4,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Enhanced Input Area */}
                {isSessionActive && (
                  <motion.div
                    className='border-t border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-4'
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className='flex items-end space-x-3'>
                      <div className='flex-1 relative'>
                        <textarea
                          ref={inputRef}
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder={
                            selectedBot
                              ? 'Введите сообщение для тестирования...'
                              : 'Сначала выберите бота'
                          }
                          disabled={!selectedBot || isSending}
                          rows={1}
                          className='w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-all duration-200'
                          style={{
                            minHeight: '48px',
                            maxHeight: '120px',
                          }}
                          onInput={(e) => {
                            const target = e.target as HTMLTextAreaElement;
                            target.style.height = 'auto';
                            target.style.height = target.scrollHeight + 'px';
                          }}
                        />

                        {/* Input accessories */}
                        <div className='absolute right-3 bottom-3 flex items-center space-x-1'>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  className='h-7 w-7 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                                  disabled
                                >
                                  <Paperclip className='w-4 h-4' />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Прикрепить файл</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  className='h-7 w-7 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                                  disabled
                                >
                                  <Smile className='w-4 h-4' />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Эмодзи</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>

                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          onClick={sendMessage}
                          disabled={
                            !selectedBot ||
                            !newMessage.trim() ||
                            isSending ||
                            (selectedBot &&
                              botcoinBalance <
                                calculateMessageCost(selectedBot.llm_model))
                          }
                          className='h-12 w-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                          {isSending ? (
                            <Loader2 className='w-5 h-5 animate-spin' />
                          ) : (
                            <Send className='w-5 h-5' />
                          )}
                        </Button>
                      </motion.div>
                    </div>

                    {/* Character count and shortcuts */}
                    <div className='flex items-center justify-between mt-3 text-xs text-gray-500 dark:text-gray-400'>
                      <div className='flex items-center space-x-4'>
                        <span className='opacity-75'>Enter - отправить</span>
                        <span className='opacity-75'>
                          Shift+Enter - новая строка
                        </span>
                      </div>
                      <span
                        className={`${
                          newMessage.length > 1000 ? 'text-red-500' : ''
                        }`}
                      >
                        {newMessage.length}/1000
                      </span>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Enhanced Stats Sidebar */}
              {showSettings && (
                <motion.div
                  className='w-80 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border-l border-gray-200 dark:border-gray-700 overflow-y-auto'
                  initial={{ x: 320, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 320, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  <div className='p-6'>
                    <div className='flex items-center justify-between mb-6'>
                      <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                        Статистика сессии
                      </h3>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => setShowSettings(false)}
                        className='h-8 w-8'
                      >
                        <Eye className='w-4 h-4' />
                      </Button>
                    </div>

                    <div className='space-y-6'>
                      {/* Session Status */}
                      <Card className='border-gray-200 dark:border-gray-700'>
                        <CardHeader className='pb-3'>
                          <CardTitle className='text-sm font-medium flex items-center'>
                            <Activity className='w-4 h-4 mr-2 text-purple-500' />
                            Состояние сессии
                          </CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-3'>
                          <div className='flex items-center justify-between'>
                            <span className='text-sm text-gray-600 dark:text-gray-400'>
                              Статус
                            </span>
                            <Badge
                              variant={
                                isSessionActive ? 'default' : 'secondary'
                              }
                              className={
                                isSessionActive
                                  ? 'bg-green-500 hover:bg-green-600'
                                  : ''
                              }
                            >
                              {isSessionActive ? 'Активна' : 'Неактивна'}
                            </Badge>
                          </div>

                          <div className='flex items-center justify-between'>
                            <span className='text-sm text-gray-600 dark:text-gray-400'>
                              Подключение
                            </span>
                            <div className='flex items-center space-x-2'>
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  connectionStatus === 'connected'
                                    ? 'bg-green-500'
                                    : connectionStatus === 'connecting'
                                    ? 'bg-yellow-500'
                                    : 'bg-gray-400'
                                }`}
                              />
                              <span className='text-sm capitalize'>
                                {connectionStatus === 'connected'
                                  ? 'Подключен'
                                  : connectionStatus === 'connecting'
                                  ? 'Подключение'
                                  : 'Отключен'}
                              </span>
                            </div>
                          </div>

                          {sessionStartTime && (
                            <div className='flex items-center justify-between'>
                              <span className='text-sm text-gray-600 dark:text-gray-400'>
                                Начало
                              </span>
                              <span className='text-sm font-mono'>
                                {format(sessionStartTime, 'HH:mm:ss')}
                              </span>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Performance Metrics */}
                      <Card className='border-gray-200 dark:border-gray-700'>
                        <CardHeader className='pb-3'>
                          <CardTitle className='text-sm font-medium flex items-center'>
                            <TrendingUp className='w-4 h-4 mr-2 text-blue-500' />
                            Метрики производительности
                          </CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-4'>
                          <div className='space-y-3'>
                            <div className='flex items-center justify-between'>
                              <span className='text-sm text-gray-600 dark:text-gray-400'>
                                Сообщений
                              </span>
                              <div className='flex items-center space-x-2'>
                                <MessageCircle className='w-4 h-4 text-blue-500' />
                                <span className='font-semibold'>
                                  {stats.messageCount}
                                </span>
                              </div>
                            </div>

                            <div className='flex items-center justify-between'>
                              <span className='text-sm text-gray-600 dark:text-gray-400'>
                                Длительность
                              </span>
                              <div className='flex items-center space-x-2'>
                                <Timer className='w-4 h-4 text-green-500' />
                                <span className='font-semibold font-mono'>
                                  {Math.floor(stats.sessionDuration / 60)}:
                                  {(stats.sessionDuration % 60)
                                    .toString()
                                    .padStart(2, '0')}
                                </span>
                              </div>
                            </div>

                            <div className='flex items-center justify-between'>
                              <span className='text-sm text-gray-600 dark:text-gray-400'>
                                Среднее время ответа
                              </span>
                              <div className='flex items-center space-x-2'>
                                <Clock className='w-4 h-4 text-orange-500' />
                                <span className='font-semibold'>
                                  {stats.avgResponseTime
                                    ? (stats.avgResponseTime / 1000).toFixed(1)
                                    : '0.0'}
                                  с
                                </span>
                              </div>
                            </div>

                            {stats.lastResponseTime && (
                              <div className='flex items-center justify-between'>
                                <span className='text-sm text-gray-600 dark:text-gray-400'>
                                  Последний ответ
                                </span>
                                <span className='font-semibold text-purple-600'>
                                  {(stats.lastResponseTime / 1000).toFixed(1)}с
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Quality Metrics */}
                          <div className='pt-3 border-t border-gray-200 dark:border-gray-700'>
                            <div className='space-y-3'>
                              <div>
                                <div className='flex items-center justify-between mb-2'>
                                  <span className='text-sm text-gray-600 dark:text-gray-400'>
                                    Точность бота
                                  </span>
                                  <span className='text-sm font-semibold text-green-600'>
                                    {stats.botAccuracy}%
                                  </span>
                                </div>
                                <Progress
                                  value={stats.botAccuracy}
                                  className='h-2'
                                />
                              </div>

                              <div>
                                <div className='flex items-center justify-between mb-2'>
                                  <span className='text-sm text-gray-600 dark:text-gray-400'>
                                    Удовлетворенность
                                  </span>
                                  <div className='flex items-center space-x-1'>
                                    <Star className='w-4 h-4 text-yellow-500 fill-current' />
                                    <span className='text-sm font-semibold'>
                                      {stats.userSatisfaction}/5
                                    </span>
                                  </div>
                                </div>
                                <Progress
                                  value={stats.userSatisfaction * 20}
                                  className='h-2'
                                />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Actions */}
                      <Card className='border-gray-200 dark:border-gray-700'>
                        <CardHeader className='pb-3'>
                          <CardTitle className='text-sm font-medium'>
                            Действия
                          </CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-3'>
                          <Button
                            onClick={copyConversation}
                            variant='outline'
                            className='w-full justify-start bg-transparent'
                            disabled={messages.length === 0}
                          >
                            <Copy className='w-4 h-4 mr-2' />
                            Копировать диалог
                          </Button>

                          <Button
                            onClick={exportConversation}
                            variant='outline'
                            className='w-full justify-start bg-transparent'
                            disabled={messages.length === 0}
                          >
                            <Download className='w-4 h-4 mr-2' />
                            Экспортировать чат
                          </Button>

                          <Button
                            onClick={clearChat}
                            variant='outline'
                            className='w-full justify-start border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 bg-transparent'
                            disabled={messages.length === 0}
                          >
                            <Trash2 className='w-4 h-4 mr-2' />
                            Очистить чат
                          </Button>

                          <Button
                            onClick={() => {
                              if (selectedBot) {
                                loadChatHistory(selectedBot.id);
                              }
                            }}
                            variant='outline'
                            className='w-full justify-start'
                            disabled={!selectedBot || isLoadingHistory}
                          >
                            <RefreshCw
                              className={`w-4 h-4 mr-2 ${
                                isLoadingHistory ? 'animate-spin' : ''
                              }`}
                            />
                            Обновить
                          </Button>
                        </CardContent>
                      </Card>

                      <Card className='border-gray-200 dark:border-gray-700'>
                        <CardHeader className='pb-3'>
                          <CardTitle className='text-sm font-medium flex items-center justify-between'>
                            <div className='flex items-center'>
                              <Activity className='w-4 h-4 mr-2' />
                              Использование BotCoin
                            </div>
                            <Button
                              size='sm'
                              variant='ghost'
                              onClick={fetchBotcoinBalance}
                              disabled={isLoadingBalance}
                            >
                              <RefreshCw
                                className={`h-3 w-3 ${
                                  isLoadingBalance ? 'animate-spin' : ''
                                }`}
                              />
                            </Button>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-3'>
                          <div className='space-y-2'>
                            <div className='flex justify-between items-center'>
                              <span className='text-sm text-gray-600 dark:text-gray-400'>
                                Текущий баланс
                              </span>
                              <span className='text-sm font-bold text-purple-600'>
                                {botcoinBalance.toFixed(2)}
                              </span>
                            </div>
                            <div className='flex justify-between items-center'>
                              <span className='text-sm text-gray-600 dark:text-gray-400'>
                                Использовано в сессии
                              </span>
                              <span className='text-sm font-medium text-orange-600'>
                                -{sessionBotcoinsUsed.toFixed(2)}
                              </span>
                            </div>
                            <div className='flex justify-between items-center'>
                              <span className='text-sm text-gray-600 dark:text-gray-400'>
                                Сообщений отправлено
                              </span>
                              <span className='text-sm font-medium'>
                                {messageCount}
                              </span>
                            </div>
                            {selectedBot && (
                              <div className='flex justify-between items-center'>
                                <span className='text-sm text-gray-600 dark:text-gray-400'>
                                  Стоимость за сообщение
                                </span>
                                <Badge variant='secondary' className='text-xs'>
                                  {calculateMessageCost(selectedBot.llm_model)}{' '}
                                  BC
                                </Badge>
                              </div>
                            )}
                          </div>

                          {botcoinBalance < 10 && (
                            <Alert className='bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-600'>
                              <AlertCircle className='h-4 w-4 text-amber-600' />
                              <AlertDescription className='text-xs text-amber-800 dark:text-amber-200'>
                                Низкий баланс боткоинов!
                                <a
                                  href='/account?tab=purchase'
                                  className='underline ml-1 font-medium'
                                >
                                  Пополнить
                                </a>
                              </AlertDescription>
                            </Alert>
                          )}
                        </CardContent>
                      </Card>

                      {/* Bot Configuration */}
                      {selectedBot && (
                        <Card className='border-gray-200 dark:border-gray-700'>
                          <CardHeader className='pb-3'>
                            <CardTitle className='text-sm font-medium flex items-center'>
                              <Settings className='w-4 h-4 mr-2' />
                              Конфигурация бота
                            </CardTitle>
                          </CardHeader>
                          <CardContent className='space-y-3'>
                            <div className='text-sm space-y-2'>
                              <div className='flex justify-between items-center'>
                                <span className='text-gray-600 dark:text-gray-400'>
                                  Модель
                                </span>
                                <Badge variant='secondary' className='text-xs'>
                                  {selectedBot.llm_model}
                                </Badge>
                              </div>
                              <div className='flex justify-between items-center'>
                                <span className='text-gray-600 dark:text-gray-400'>
                                  Температура
                                </span>
                                <span className='font-mono text-xs'>
                                  {selectedBot.temperature}
                                </span>
                              </div>
                              <div className='flex justify-between items-center'>
                                <span className='text-gray-600 dark:text-gray-400'>
                                  Разговорчивость
                                </span>
                                <span className='font-mono text-xs'>
                                  {selectedBot.talkativeness}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Suspense>
  );
}
export default function ChatPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChatPageContent />
    </Suspense>
  );
}
