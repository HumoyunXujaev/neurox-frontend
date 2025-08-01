'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from '@/components/header';
import { Sidebar } from '@/components/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Filter,
  RefreshCw,
  Settings,
  MessageCircle,
  Send,
  Mic,
  Paperclip,
  ChevronDown,
  Check,
  Clock,
  X,
  AlertCircle,
  User,
} from 'lucide-react';
import { useAgentStore } from '@/lib/agent-store';
import {
  apiClient,
  type Appeal,
  type Message,
  type Chat,
} from '@/lib/api/client';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';
import { tokenManager } from '@/lib/auth/token-manager';
import { getWebSocketUrl } from '@/lib/api/config';

interface ExtendedAppeal extends Appeal {
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  clientName?: string;
  clientAvatar?: string;
}

interface WSMessage {
  type: string;
  data: any;
}

const statusConfig: any = {
  new: { label: 'Новый', color: 'bg-blue-500', icon: AlertCircle },
  in_work: { label: 'В работе', color: 'bg-yellow-500', icon: Clock },
  on_pause: { label: 'На паузе', color: 'bg-gray-500', icon: Clock },
  closed: { label: 'Закрыт', color: 'bg-green-500', icon: Check },
};

export default function DialogsPage() {
  const { user } = useAuth();
  const { selectedAgent } = useAgentStore();
  const [appeals, setAppeals] = useState<ExtendedAppeal[]>([]);
  const [selectedAppeal, setSelectedAppeal] = useState<ExtendedAppeal | null>(
    null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
  });
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // WebSocket connection
  const connectWebSocket = useCallback(() => {
    if (!user || wsRef.current?.readyState === WebSocket.OPEN) return;

    const token = tokenManager.getAccessToken();
    if (!token) return;

    const wsUrl = getWebSocketUrl('/api/v1/ws/crm/', token);

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);

        if (user.company_id) {
          ws.send(
            JSON.stringify({
              type: 'subscribe',
              data: {
                company_id: user.company_id,
                event_types: ['new_appeal', 'appeal_update', 'new_message'],
              },
            })
          );
        }
      };

      ws.onmessage = (event) => {
        try {
          const message: WSMessage = JSON.parse(event.data);
          handleWebSocketMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        wsRef.current = null;

        setTimeout(() => {
          connectWebSocket();
        }, 3000);
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      setIsConnected(false);
    }
  }, [user]);

  const handleWebSocketMessage = (message: WSMessage) => {
    switch (message.type) {
      case 'new_appeal':
        loadAppeals();
        break;

      case 'appeal_update':
        setAppeals((prev) =>
          prev.map((appeal) =>
            appeal.id === message.data.id
              ? { ...appeal, ...message.data }
              : appeal
          )
        );

        if (selectedAppeal?.id === message.data.id) {
          setSelectedAppeal((prev) =>
            prev ? { ...prev, ...message.data } : null
          );
        }
        break;

      case 'new_message':
        if (selectedAppeal?.id === message.data.appeal_id) {
          setMessages((prev) => [...prev, message.data]);
          scrollToBottom();
        }

        // Update last message in appeals list
        setAppeals((prev) =>
          prev.map((appeal) => {
            if (appeal.id === message.data.appeal_id) {
              return {
                ...appeal,
                lastMessage: message.data.text,
                lastMessageTime: message.data.created_at,
                unreadCount:
                  appeal.id === selectedAppeal?.id
                    ? 0
                    : (appeal.unreadCount || 0) + 1,
              };
            }
            return appeal;
          })
        );
        break;
    }
  };

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connectWebSocket]);

  useEffect(() => {
    if (user?.company_id) {
      loadAppeals();
    }
  }, [user, filters]);

  const loadAppeals = async () => {
    if (!user?.company_id) return;

    setIsLoading(true);
    try {
      const params: any = {
        company_id: user.company_id,
        limit: 100,
        offset: 0,
      };

      if (filters.status !== 'all') {
        params.status = filters.status;
      }

      const response = await apiClient.appeal.list(params);
      const appealsList = response.data.results;

      // Enrich appeals with additional data
      const enrichedAppeals: ExtendedAppeal[] = await Promise.all(
        appealsList.map(async (appeal) => {
          try {
            // Get chat info to extract client data
            const chatResponse = await apiClient.backend.get(
              `/api/v1/chat/${appeal.chat_id}`
            );
            const chat = chatResponse.data;

            // Get last message
            const messagesResponse = await apiClient.chat.getMessages(
              appeal.id,
              {
                limit: 1,
                offset: 0,
              }
            );

            const lastMsg = messagesResponse.data.results[0];

            return {
              ...appeal,
              clientName: chat.meta?.name || 'Клиент',
              clientAvatar: chat.meta?.avatar,
              lastMessage: lastMsg?.text || 'Нет сообщений',
              lastMessageTime: lastMsg?.created_at || appeal.created_at,
              unreadCount: 0,
            };
          } catch (error) {
            console.error(`Failed to enrich appeal ${appeal.id}:`, error);
            return {
              ...appeal,
              clientName: 'Клиент',
              lastMessage: 'Нет сообщений',
              lastMessageTime: appeal.created_at,
              unreadCount: 0,
            };
          }
        })
      );

      // Filter by search
      const filtered = filters.search
        ? enrichedAppeals.filter(
            (appeal) =>
              appeal.clientName
                ?.toLowerCase()
                .includes(filters.search.toLowerCase()) ||
              appeal.lastMessage
                ?.toLowerCase()
                .includes(filters.search.toLowerCase())
          )
        : enrichedAppeals;

      // Sort by last message time
      filtered.sort(
        (a, b) =>
          new Date(b.lastMessageTime || 0).getTime() -
          new Date(a.lastMessageTime || 0).getTime()
      );

      setAppeals(filtered);

      // Select first appeal if none selected
      if (!selectedAppeal && filtered.length > 0) {
        handleSelectAppeal(filtered[0]);
      }
    } catch (error) {
      console.error('Failed to load appeals:', error);
      toast.error('Ошибка загрузки диалогов');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAppeal = async (appeal: ExtendedAppeal) => {
    setSelectedAppeal(appeal);
    setIsLoadingMessages(true);

    try {
      const response = await apiClient.chat.getMessages(appeal.id, {
        limit: 100,
        offset: 0,
      });

      console.log(response, 'res');
      setMessages(response.data.results.reverse());

      // Mark as read
      if (appeal.unreadCount && appeal.unreadCount > 0) {
        setAppeals((prev) =>
          prev.map((a) => (a.id === appeal.id ? { ...a, unreadCount: 0 } : a))
        );
      }

      scrollToBottom();
    } catch (error) {
      console.error('Failed to load messages:', error);
      toast.error('Ошибка загрузки сообщений');
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedAppeal || isSending) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setIsSending(true);

    try {
      const response = await apiClient.chat.sendMessage({
        appeal_id: selectedAppeal.id,
        text: messageText,
        type: 'text',
      });

      setMessages((prev) => [...prev, response.data]);

      // Update last message in appeals list
      setAppeals((prev) =>
        prev.map((appeal) =>
          appeal.id === selectedAppeal.id
            ? {
                ...appeal,
                lastMessage: messageText,
                lastMessageTime: response.data.created_at,
              }
            : appeal
        )
      );

      scrollToBottom();
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Ошибка отправки сообщения');
      setNewMessage(messageText);
    } finally {
      setIsSending(false);
    }
  };

  const handleStatusChange = async (appealId: number, newStatus: string) => {
    try {
      await apiClient.appeal.update(appealId, { status: newStatus });

      setAppeals((prev) =>
        prev.map((appeal) =>
          appeal.id === appealId ? { ...appeal, status: newStatus } : appeal
        )
      );

      if (selectedAppeal?.id === appealId) {
        setSelectedAppeal((prev) =>
          prev ? { ...prev, status: newStatus } : null
        );
      }

      toast.success('Статус обновлен');
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Ошибка обновления статуса');
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (days === 1) {
      return 'Вчера';
    } else if (days < 7) {
      return `${days} дн. назад`;
    } else {
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getFilteredCount = () => {
    if (filters.status === 'all') return appeals.length;
    return appeals.filter((a) => a.status === filters.status).length;
  };

  return (
    <div className='flex h-screen bg-background'>
      <div className='hidden md:block w-68 flex-shrink-0'>
        <Sidebar />
      </div>

      <div className='flex-1 flex flex-col min-w-0'>
        <Header />

        <main className='flex-1 flex overflow-hidden'>
          {/* Left Panel - Dialog List */}
          <div className='w-full md:w-80 border-r bg-background flex flex-col'>
            {/* Filters */}
            <div className='p-4 md:p-5 border-b space-y-3'>
              <div className='flex gap-2'>
                <Button
                  className='bg-purple-600 hover:bg-purple-700 text-white flex-1'
                  onClick={() => setShowFilterDialog(true)}
                >
                  <Filter className='mr-2 h-4 w-4' />
                  ФИЛЬТРЫ
                  <ChevronDown className='ml-2 h-4 w-4' />
                </Button>
                <Button
                  variant='outline'
                  size='icon'
                  onClick={loadAppeals}
                  disabled={isLoading}
                >
                  <RefreshCw
                    className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
                  />
                </Button>
              </div>

              <Input
                placeholder='Поиск по диалогам...'
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
                className='w-full'
              />
            </div>

            {/* Dialog Count */}
            <div className='px-4 md:px-5 py-3 text-sm text-muted-foreground border-b'>
              Показано: {getFilteredCount()} из {appeals.length} диалогов
            </div>

            {/* Dialog List */}
            <div className='flex-1 overflow-auto'>
              {isLoading ? (
                <div className='flex items-center justify-center h-32'>
                  <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600'></div>
                </div>
              ) : appeals.length === 0 ? (
                <div className='text-center py-8 px-4'>
                  <MessageCircle className='h-12 w-12 mx-auto text-muted-foreground mb-2' />
                  <p className='text-muted-foreground'>Нет диалогов</p>
                </div>
              ) : (
                appeals.map((appeal) => {
                  const status =
                    statusConfig[appeal.status] || statusConfig.new;
                  return (
                    <div
                      key={appeal.id}
                      className={`p-4 md:p-5 border-b cursor-pointer transition-colors ${
                        selectedAppeal?.id === appeal.id
                          ? 'bg-purple-50 dark:bg-purple-950'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => handleSelectAppeal(appeal)}
                    >
                      <div className='flex items-start gap-3'>
                        <Avatar className='h-10 w-10 flex-shrink-0'>
                          <AvatarImage src={appeal.clientAvatar} />
                          <AvatarFallback>
                            <User className='h-5 w-5' />
                          </AvatarFallback>
                        </Avatar>
                        <div className='flex-1 min-w-0'>
                          <div className='flex items-center justify-between mb-1'>
                            <h4 className='font-medium truncate'>
                              {appeal.clientName}
                            </h4>
                            <span className='text-xs text-muted-foreground flex-shrink-0'>
                              {formatTime(appeal.lastMessageTime)}
                            </span>
                          </div>
                          <p className='text-sm text-muted-foreground truncate mb-2'>
                            {appeal.lastMessage}
                          </p>
                          <div className='flex items-center justify-between'>
                            <Badge
                              variant='secondary'
                              className={`text-xs ${status.color} text-white`}
                            >
                              <status.icon className='h-3 w-3 mr-1' />
                              {status.label}
                            </Badge>
                            {appeal.unreadCount ? (
                              <Badge className='bg-purple-600 text-white text-xs'>
                                {appeal.unreadCount}
                              </Badge>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Panel - Messages */}
          <div className='flex-1 flex flex-col bg-background'>
            {selectedAppeal ? (
              <>
                {/* Chat Header */}
                <div className='border-b px-4 py-3 flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <Avatar className='h-10 w-10'>
                      <AvatarImage src={selectedAppeal.clientAvatar} />
                      <AvatarFallback>
                        <User className='h-5 w-5' />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className='font-semibold'>
                        {selectedAppeal.clientName}
                      </h3>
                      <p className='text-xs text-muted-foreground'>
                        ID: #{selectedAppeal.id}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Select
                      value={selectedAppeal.status}
                      onValueChange={(value) =>
                        handleStatusChange(selectedAppeal.id, value)
                      }
                    >
                      <SelectTrigger className='w-[140px]'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusConfig).map(([value, config]) => {
                          const typedConfig = config as {
                            label: string;
                            color: string;
                            icon: React.ElementType;
                          };
                          return (
                            <SelectItem key={value} value={value}>
                              <div className='flex items-center'>
                                <typedConfig.icon className='h-4 w-4 mr-2' />
                                {typedConfig.label}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <Button variant='ghost' size='icon'>
                      <Settings className='h-4 w-4' />
                    </Button>
                  </div>
                </div>

                {/* Messages Area */}
                <div className='flex-1 overflow-y-auto p-4'>
                  {isLoadingMessages ? (
                    <div className='flex items-center justify-center h-full'>
                      <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600'></div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className='text-center text-muted-foreground'>
                      Нет сообщений
                    </div>
                  ) : (
                    <div className='space-y-4'>
                      {messages.map((message) => {
                        const isUser = message.sender.type === 'user';
                        const isBot = message.sender.type === 'bot';

                        return (
                          <div
                            key={message.id}
                            className={`flex gap-3 ${
                              isUser ? 'justify-end' : ''
                            }`}
                          >
                            {!isUser && (
                              <Avatar className='h-8 w-8 flex-shrink-0'>
                                <AvatarImage
                                  src={
                                    isBot
                                      ? selectedAgent?.avatar ||
                                        '/avatars/bot1.png'
                                      : message.sender.avatar
                                  }
                                />
                                <AvatarFallback>
                                  {message.sender.name?.[0] ||
                                    (isBot ? 'B' : 'U')}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <div
                              className={`max-w-[70%] ${
                                isUser ? 'order-1' : 'order-2'
                              }`}
                            >
                              <div
                                className={`rounded-2xl px-4 py-2 ${
                                  isUser
                                    ? 'bg-purple-600 text-white'
                                    : isBot
                                    ? 'bg-blue-100 dark:bg-blue-900'
                                    : 'bg-muted'
                                }`}
                              >
                                <p className='text-sm whitespace-pre-wrap break-words'>
                                  {message?.message}
                                </p>
                              </div>
                              <div className='flex items-center gap-2 mt-1'>
                                <p
                                  className={`text-xs text-muted-foreground ${
                                    isUser ? 'text-right' : ''
                                  }`}
                                >
                                  {formatTime(message.created_at)}
                                </p>
                                {message.sender.name && (
                                  <p className='text-xs text-muted-foreground'>
                                    • {message.sender.name}
                                  </p>
                                )}
                              </div>
                            </div>
                            {isUser && (
                              <Avatar className='h-8 w-8 flex-shrink-0 order-2'>
                                <AvatarImage
                                  src={selectedAppeal.clientAvatar}
                                />
                                <AvatarFallback>
                                  <User className='h-4 w-4' />
                                </AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                {/* Input Area */}
                <div className='border-t p-4'>
                  <div className='flex items-end gap-2'>
                    <div className='flex-1'>
                      <div className='relative'>
                        <Input
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder='Введите сообщение...'
                          className='pr-20'
                          disabled={
                            isSending || selectedAppeal.status === 'closed'
                          }
                        />
                        <div className='absolute right-2 bottom-2 flex gap-1'>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-6 w-6'
                          >
                            <Mic className='h-4 w-4' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-6 w-6'
                          >
                            <Paperclip className='h-4 w-4' />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={handleSendMessage}
                      disabled={
                        !newMessage.trim() ||
                        isSending ||
                        selectedAppeal.status === 'closed'
                      }
                      className='bg-purple-600 hover:bg-purple-700'
                      size='icon'
                    >
                      <Send className='h-4 w-4' />
                    </Button>
                  </div>
                  {selectedAppeal.status === 'closed' && (
                    <p className='text-xs text-muted-foreground mt-2'>
                      Диалог закрыт. Откройте его для отправки сообщений.
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className='flex-1 flex items-center justify-center text-muted-foreground'>
                <div className='text-center'>
                  <MessageCircle className='h-12 w-12 mx-auto mb-4' />
                  <p>Выберите диалог для просмотра сообщений</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Filter Dialog */}
      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Фильтры диалогов</DialogTitle>
            <DialogDescription>
              Настройте параметры отображения диалогов
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4'>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Статус</label>
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>Все статусы</SelectItem>
                  {Object.entries(statusConfig).map(([value, config]) => {
                    const typedConfig = config as {
                      label: string;
                      color: string;
                      icon: React.ElementType;
                    };
                    return (
                      <SelectItem key={value} value={value}>
                        <div className='flex items-center'>
                          <typedConfig.icon className='h-4 w-4 mr-2' />
                          {typedConfig.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                setFilters({ status: 'all', search: '' });
                setShowFilterDialog(false);
              }}
            >
              Сбросить
            </Button>
            <Button
              onClick={() => setShowFilterDialog(false)}
              className='bg-purple-600 hover:bg-purple-700'
            >
              Применить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
