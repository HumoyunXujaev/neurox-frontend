'use client';

import { useState, useRef, useEffect } from 'react';
import { Header } from '@/components/header';
import { Sidebar } from '@/components/sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Mic, Paperclip, RotateCcw } from 'lucide-react';
import { useAgentStore } from '@/lib/agent-store';
import { toast } from 'sonner';

interface Message {
  id: string;
  sender: 'user' | 'agent';
  content: string;
  timestamp: Date;
  tokens?: number;
  cost?: number;
}

export default function ChatPage() {
  const { selectedAgent } = useAgentStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'user',
      content: 'hi!',
      timestamp: new Date('2025-07-01T12:48:30'),
    },
    {
      id: '2',
      sender: 'agent',
      content: 'Hello! 😊 How can I assist you today?',
      timestamp: new Date('2025-07-01T12:48:31'),
      tokens: 11,
      cost: 18,
    },
    {
      id: '3',
      sender: 'user',
      content: 'test question?',
      timestamp: new Date('2025-07-01T12:49:42'),
    },
    {
      id: '4',
      sender: 'agent',
      content: "What's your test question? 😊",
      timestamp: new Date('2025-07-01T12:49:43'),
      tokens: 9,
      cost: 40,
    },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: newMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setNewMessage('');
    setIsLoading(true);

    // Simulate agent response
    setTimeout(() => {
      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'agent',
        content: `I received your message: "${newMessage}". How can I help you further?`,
        timestamp: new Date(),
        tokens: Math.floor(Math.random() * 20) + 5,
        cost: Math.floor(Math.random() * 50) + 10,
      };
      setMessages((prev) => [...prev, agentMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleRestartDialog = () => {
    setMessages([]);
    toast.success('Диалог перезапущен');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const totalCost = messages
    .filter((m) => m.sender === 'agent' && m.cost)
    .reduce((sum, m) => sum + (m.cost || 0), 0);

  const totalTokens = messages
    .filter((m) => m.sender === 'agent' && m.tokens)
    .reduce((sum, m) => sum + (m.tokens || 0), 0);

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = formatDate(message.timestamp);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, Message[]>);

  if (!selectedAgent) {
    return (
      <div className='flex h-screen bg-background'>
        {/* Desktop Sidebar */}
        <div className='hidden md:block w-68 flex-shrink-0'>
          <Sidebar />
        </div>

        <div className='flex-1 flex flex-col min-w-0'>
          <Header />
          <main className='flex-1 p-4 md:p-6 overflow-auto'>
            <div className='max-w-4xl mx-auto'>
              <Card>
                <CardContent className='p-6 text-center'>
                  <p className='text-muted-foreground'>
                    Выберите агента для начала чата
                  </p>
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
      {/* Desktop Sidebar */}
      <div className='hidden md:block w-68 flex-shrink-0'>
        <Sidebar />
      </div>

      <div className='flex-1 flex flex-col min-w-0'>
        <Header />
        <main className='flex-1 flex flex-col'>
          {/* Chat Header */}
          <div className='border-b p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
            <div>
              <h1 className='text-lg md:text-xl font-semibold'>
                Тестовый чат с агентом
              </h1>
            </div>
            <div className='flex flex-col sm:flex-row items-start sm:items-center gap-4'>
              <div className='text-right text-xs md:text-sm text-muted-foreground'>
                <div>Расход BotCoin: {(totalCost * 0.03).toFixed(3)}</div>
                <div>Входящие токены: {totalTokens}</div>
                <div>Исходящие: {Math.floor(totalTokens * 1.5)}</div>
              </div>
              <Button
                onClick={handleRestartDialog}
                className='bg-purple-600 hover:bg-purple-700 text-sm'
              >
                <RotateCcw className='mr-2 h-4 w-4' />
                РЕСТАРТ ДИАЛОГА
              </Button>
            </div>
          </div>

          {/* Messages Area */}
          <div className='flex-1 overflow-auto p-4'>
            <div className='max-w-4xl mx-auto space-y-6'>
              {Object.entries(groupedMessages).map(([date, dateMessages]) => (
                <div key={date}>
                  {/* Date Separator */}
                  <div className='flex justify-center mb-4'>
                    <div className='bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground'>
                      {date}
                    </div>
                  </div>

                  {/* Messages for this date */}
                  <div className='space-y-4'>
                    {dateMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender === 'user'
                            ? 'justify-end'
                            : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[85%] sm:max-w-md rounded-2xl px-4 py-3 ${
                            message.sender === 'user'
                              ? 'bg-purple-600 text-white ml-4 sm:ml-12'
                              : 'bg-muted text-foreground mr-4 sm:mr-12'
                          }`}
                        >
                          {message.sender === 'agent' && (
                            <div className='flex items-center gap-2 mb-2'>
                              <Avatar className='h-6 w-6'>
                                <AvatarImage
                                  src={
                                    selectedAgent.avatar || '/placeholder.svg'
                                  }
                                  alt={selectedAgent.name}
                                />
                                <AvatarFallback>
                                  {selectedAgent.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <span className='text-sm font-medium'>
                                {selectedAgent.name}
                              </span>
                            </div>
                          )}
                          <div className='text-sm'>{message.content}</div>
                          <div className='flex items-center justify-between mt-2 text-xs opacity-70'>
                            <span>
                              {message.sender === 'agent' && message.tokens && (
                                <>
                                  Ответ из: {message.tokens} токенов |
                                  Количество: {message.cost} токенов
                                </>
                              )}
                            </span>
                            <span>{formatTime(message.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className='flex justify-start'>
                  <div className='bg-muted text-foreground max-w-[85%] sm:max-w-md rounded-2xl px-4 py-3 mr-4 sm:mr-12'>
                    <div className='flex items-center gap-2'>
                      <div className='flex space-x-1'>
                        <div className='w-2 h-2 bg-current rounded-full animate-bounce'></div>
                        <div
                          className='w-2 h-2 bg-current rounded-full animate-bounce'
                          style={{ animationDelay: '0.1s' }}
                        ></div>
                        <div
                          className='w-2 h-2 bg-current rounded-full animate-bounce'
                          style={{ animationDelay: '0.2s' }}
                        ></div>
                      </div>
                      <span className='text-sm'>Печатает...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Message Input */}
          <div className='border-t p-4'>
            <div className='max-w-4xl mx-auto'>
              <div className='flex items-center gap-2'>
                <div className='flex-1 relative'>
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder='Отправить сообщение...'
                    className='pr-16 sm:pr-20'
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    disabled={isLoading}
                  />
                  <div className='absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1'>
                    <Button variant='ghost' size='icon' className='h-8 w-8'>
                      <Mic className='h-4 w-4' />
                    </Button>
                    <Button variant='ghost' size='icon' className='h-8 w-8'>
                      <Paperclip className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || isLoading}
                  className='bg-purple-600 hover:bg-purple-700'
                  size='icon'
                >
                  <Send className='h-4 w-4' />
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
