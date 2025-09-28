'use client';
import { useState, useEffect, useCallback } from 'react';
import {
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Settings,
  HelpCircle,
  ChevronDown,
  LinkIcon,
  MessageSquare,
  Users,
  Bot,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { useAuth } from '@/contexts/auth-context';
import { apiClient, type InfoFlow } from '@/lib/api/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Channel type icons and colors
const channelConfig = {
  telegram: {
    icon: '📱',
    name: 'Telegram',
    color: 'bg-blue-500',
    description: 'Базовое подключение ИИ-агента',
    features: [
      'Подключение ИИ-агента к группе',
      'Подключение ИИ-агента к личному аккаунту',
      'Настройка получения заявок',
    ],
    available: true,
  },
  instagram: {
    icon: '📷',
    name: 'Instagram',
    color: 'bg-pink-500',
    description: 'Ответы в директе и в комментариях',
    features: [
      'Шаблонные ответы',
      'Ответы только на ключевые слова или только на определенные посты',
    ],
    available: true,
  },
  whatsapp: {
    icon: '💬',
    name: 'WhatsApp',
    color: 'bg-green-500',
    description: 'Базовое подключение к WhatsApp',
    features: ['Настройка ответов в группах'],
    available: false,
    comingSoon: true,
  },
  avito: {
    icon: '🏠',
    name: 'Авито',
    color: 'bg-blue-600',
    description:
      'Подключение одного аккаунта авито для ответов во всех объявлениях',
    features: [],
    available: false,
    comingSoon: true,
  },
  avito_pro: {
    icon: '🏠',
    name: 'Авито PRO',
    color: 'bg-purple-600',
    description: 'PRO подключение к Авито',
    features: [
      'Подключение неограниченного количества аккаунтов',
      'Выбор конкретных объявлений',
      'Индивидуальные настройки для объявлений',
    ],
    available: false,
    comingSoon: true,
  },
  vkontakte: {
    icon: '🔵',
    name: 'ВКонтакте',
    color: 'bg-blue-700',
    description: 'Подключение к ВКонтакте для ответов в группе',
    features: [],
    available: false,
    comingSoon: true,
  },
  salebot: {
    icon: '🤖',
    name: 'Salebot',
    color: 'bg-indigo-600',
    description: 'Подключение агентов Nextbot к воронкам Salebot',
    features: [],
    available: false,
    comingSoon: true,
  },
  jivo: {
    icon: '💬',
    name: 'Jivo',
    color: 'bg-green-600',
    description: 'Подключение к Jivo для ответов в чатах',
    features: [],
    badge: 'Beta',
    available: false,
    comingSoon: true,
  },
};

export default function ChannelsPage() {
  const { user } = useAuth();
  const [channels, setChannels] = useState<InfoFlow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<InfoFlow | null>(null);
  const [viewMode, setViewMode] = useState<'overview' | 'detail'>('overview');
  const [isConnecting, setIsConnecting] = useState(false);

  // New channel form
  const [newChannel, setNewChannel] = useState({
    name: '',
    type: 'telegram' as keyof typeof channelConfig,
    botToken: '', // For Telegram bot token
  });

  // Load channels
  const loadChannels = useCallback(async () => {
    if (!user?.company_id) return;
    try {
      setIsLoading(true);
      apiClient.infoFlow.setAuthHeader(
        process.env.NEXT_PUBLIC_STATS_SERVICE_SECRET_KEY
      );
      const response = await apiClient.infoFlow.list({
        limit: 100,
      });
      // Filter by company
      const companyChannels = response.data.results.filter(
        (channel) => channel.company_id === user.company_id
      );
      setChannels(companyChannels);
      console.log(response, 'response');
    } catch (error) {
      console.error('Error loading channels:', error);
      toast.error('Ошибка загрузки каналов');
    } finally {
      setIsLoading(false);
    }
  }, [user?.company_id]);

  useEffect(() => {
    loadChannels();
  }, [loadChannels]);

  // Filter channels by search
  const filteredChannels = channels.filter((channel) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      channel.name.toLowerCase().includes(query) ||
      channel.type.toLowerCase().includes(query)
    );
  });

  // Create channel
  const handleCreateChannel = async () => {
    if (!newChannel.name.trim() || !user?.company_id) return;

    // Validation for Telegram
    if (newChannel.type === 'telegram' && !newChannel.botToken.trim()) {
      toast.error('Введите токен бота для Telegram');
      return;
    }

    setIsCreating(true);
    try {
      const channelData = {
        id: Math.floor(Date.now() / 100000),
        name: newChannel.name.trim(),
        type: newChannel.type,
        company_id: user.company_id,
        data:
          newChannel.type === 'telegram'
            ? {
                bot_token: newChannel.botToken.trim(),
                webhook_url: 'http://localhost:3000/test',
              }
            : {}, // Empty data for Instagram - will be filled after OAuth
      };

      apiClient.infoFlow.setAuthHeader(
        process.env.NEXT_PUBLIC_MAIN_SERVICE_API_KEY
      );
      await apiClient.infoFlow.create(channelData);
      toast.success('Канал создан успешно');
      setShowAddDialog(false);
      setNewChannel({ name: '', type: 'telegram', botToken: '' });
      loadChannels();
    } catch (error) {
      console.error('Error creating channel:', error);
      toast.error('Ошибка создания ка��ала');
    } finally {
      setIsCreating(false);
    }
  };

  // Delete channel
  const handleDeleteChannel = async (channel: InfoFlow) => {
    if (!confirm(`Удалить канал "${channel.name}"?`)) return;
    try {
      await apiClient.infoFlow.delete(channel.id);
      toast.success('Канал удален');
      loadChannels();
    } catch (error) {
      console.error('Error deleting channel:', error);
      toast.error('Ошибка удаления канала');
    }
  };

  // Connect channel (OAuth flow for Instagram)
  const handleConnectChannel = async (channel: InfoFlow) => {
    if (channel.type !== 'instagram') return;

    setIsConnecting(true);
    try {
      const response = await apiClient.infoFlow.getOAuthLink(
        channel.id,
        'instagram'
      );
      // Open OAuth URL in new window
      if (response.data.url) {
        window.open(response.data.url, '_blank');
        toast.info('Следуйте инструкциям для подключения Instagram');
      }
    } catch (error) {
      console.error('Error connecting channel:', error);
      toast.error('Ошибка подключения канала');
    } finally {
      setIsConnecting(false);
    }
  };

  // Check channel status
  const getChannelStatus = (channel: InfoFlow) => {
    // Check if channel has required data
    if (channel.type === 'instagram' && !channel.data?.access_token) {
      return 'not_configured';
    }
    // TODO: Add real status check via API
    return 'active';
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge variant='default' className='gap-1'>
            <CheckCircle className='h-3 w-3' />
            Активен
          </Badge>
        );
      case 'not_configured':
        return (
          <Badge variant='secondary' className='gap-1'>
            <AlertCircle className='h-3 w-3' />
            Не настроен
          </Badge>
        );
      case 'error':
        return (
          <Badge variant='destructive' className='gap-1'>
            <XCircle className='h-3 w-3' />
            Ошибка
          </Badge>
        );
      default:
        return null;
    }
  };

  // Reset form when dialog closes
  const handleDialogClose = (open: boolean) => {
    setShowAddDialog(open);
    if (!open) {
      setNewChannel({ name: '', type: 'telegram', botToken: '' });
    }
  };

  // Render channel overview grid
  const renderChannelOverview = () => (
    <div className='max-w-6xl mx-auto space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
        <div>
          <h1 className='text-2xl md:text-3xl font-bold text-foreground'>
            Каналы
          </h1>
        </div>
      </div>

      {/* Channels Grid */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {Object.entries(channelConfig).map(([type, config]) => {
          const existingChannel = channels.find((c) => c.type === type);
          const isAvailable = config.available;

          return (
            <Card
              key={type}
              className={cn(
                'bg-card border-border transition-all duration-200 relative overflow-hidden',
                isAvailable
                  ? 'hover:shadow-lg cursor-pointer hover:scale-[1.02]'
                  : 'opacity-60 cursor-not-allowed'
              )}
              onClick={() => {
                if (!isAvailable) return;
                if (existingChannel) {
                  setSelectedChannel(existingChannel);
                  setViewMode('detail');
                } else {
                  setNewChannel({
                    name: config.name,
                    type: type as keyof typeof channelConfig,
                    botToken: '',
                  });
                  setShowAddDialog(true);
                }
              }}
            >
              {!isAvailable && (
                <div className='absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-[1px] z-10 flex items-center justify-center'>
                  <div className='bg-background/90 backdrop-blur-sm border border-border rounded-lg px-4 py-2 shadow-lg'>
                    <span className='text-sm font-medium text-foreground'>
                      Скоро доступно
                    </span>
                  </div>
                </div>
              )}

              <CardHeader className='pb-3'>
                <div className='flex items-start justify-between'>
                  <div className='flex items-center gap-3'>
                    <div
                      className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-lg',
                        config.color
                      )}
                    >
                      <span className='text-xl'>{config.icon}</span>
                    </div>
                    <div>
                      <CardTitle className='text-lg text-foreground flex items-center gap-2'>
                        {config.name}
                        {config.available && (
                          <Badge variant='secondary' className='text-xs'>
                            {config.available}
                          </Badge>
                        )}
                      </CardTitle>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  <p className='text-sm text-muted-foreground'>
                    {config.description}
                  </p>
                  {config.features.length > 0 && (
                    <ul className='text-xs text-muted-foreground space-y-1'>
                      {config.features.map((feature, index) => (
                        <li key={index} className='flex items-start gap-2'>
                          <span className='text-muted-foreground/60 mt-1'>
                            •
                          </span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {existingChannel && isAvailable && (
                    <div className='pt-2'>
                      {getStatusBadge(getChannelStatus(existingChannel))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  // Render channel detail view
  const renderChannelDetail = () => {
    if (!selectedChannel) return null;

    const config =
      channelConfig[selectedChannel.type as keyof typeof channelConfig];
    const status = getChannelStatus(selectedChannel);

    return (
      <div className='max-w-4xl mx-auto space-y-6'>
        {/* Breadcrumb */}
        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
          <button
            onClick={() => setViewMode('overview')}
            className='hover:text-foreground transition-colors'
          >
            Каналы
          </button>
          <span>/</span>
          <span className='text-foreground'>{config?.name}</span>
        </div>

        {/* Connection Status Card */}
        <Card className='bg-card border-border'>
          <CardHeader className='flex flex-row items-center justify-between'>
            <div>
              <CardTitle className='text-foreground flex items-center gap-3'>
                <div
                  className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-lg',
                    config?.color
                  )}
                >
                  <span>{config?.icon}</span>
                </div>
                Подключение {config?.name}
              </CardTitle>
            </div>
            <div className='flex items-center gap-2'>
              <Button
                variant='ghost'
                size='icon'
                className='text-muted-foreground'
              >
                <HelpCircle className='h-4 w-4' />
              </Button>
              <Button
                variant='ghost'
                size='icon'
                className='text-muted-foreground'
              >
                <Settings className='h-4 w-4' />
              </Button>
            </div>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center gap-2'>
              <span className='text-muted-foreground'>Статус подключения:</span>
              <span className='text-red-500 flex items-center gap-1'>
                {getStatusBadge(getChannelStatus(selectedChannel)) || 'активен'}

                <AlertCircle className='h-4 w-4' />
              </span>
            </div>

            {selectedChannel.type === 'telegram' && (
              <div className='space-y-4'>
                <div className='space-y-2'>
                  <Label className='text-foreground'>Telegram токен</Label>
                  <Input
                    className='bg-background border-border text-foreground'
                    placeholder='Введите токен бота'
                    defaultValue={selectedChannel.data?.bot_token || ''}
                    readOnly
                  />
                </div>

                {status === 'active' ? (
                  <Button
                    className='bg-green-600 hover:bg-green-700 text-white'
                    disabled
                  >
                    <CheckCircle className='h-4 w-4 mr-2' />
                    ПОДКЛЮЧЕНО
                  </Button>
                ) : (
                  <Button className='bg-purple-600 hover:bg-purple-700 text-white'>
                    <LinkIcon className='h-4 w-4 mr-2' />
                    ПОДКЛЮЧИТЬ
                  </Button>
                )}
              </div>
            )}

            {selectedChannel.type === 'instagram' && (
              <div className='flex gap-2 flex-wrap'>
                {status === 'active' ? (
                  <Button
                    className='bg-green-600 hover:bg-green-700 text-white'
                    disabled
                  >
                    <CheckCircle className='h-4 w-4 mr-2' />
                    ПОДКЛЮЧЕНО
                  </Button>
                ) : (
                  <Button
                    className='bg-purple-600 hover:bg-purple-700 text-white'
                    onClick={() => handleConnectChannel(selectedChannel)}
                    disabled={isConnecting}
                  >
                    {isConnecting ? (
                      <>
                        <RefreshCw className='h-4 w-4 mr-2 animate-spin' />
                        Подключение...
                      </>
                    ) : (
                      <>
                        <LinkIcon className='h-4 w-4 mr-2' />
                        ПОДКЛЮЧИТЬ ЧЕРЕЗ INSTAGRAM
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className='flex h-screen bg-background'>
      <div className='hidden md:block w-68 flex-shrink-0'>
        <Sidebar />
      </div>
      <div className='flex-1 flex flex-col min-w-0'>
        <Header />
        <main className='flex-1 p-4 md:p-6 overflow-auto'>
          {viewMode === 'overview'
            ? renderChannelOverview()
            : renderChannelDetail()}
        </main>
      </div>

      {/* Add Channel Dialog */}
      <Dialog open={showAddDialog} onOpenChange={handleDialogClose}>
        <DialogContent className='bg-card border-border'>
          <DialogHeader>
            <DialogTitle className='text-foreground'>
              Добавить канал
            </DialogTitle>
            <DialogDescription className='text-muted-foreground'>
              Создайте новый канал для связи с клиентами
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='channel-name' className='text-foreground'>
                Название канала
              </Label>
              <Input
                id='channel-name'
                placeholder='Например: Основной Telegram'
                value={newChannel.name}
                onChange={(e) =>
                  setNewChannel({ ...newChannel, name: e.target.value })
                }
                className='bg-background border-border text-foreground'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='channel-type' className='text-foreground'>
                Тип канала
              </Label>
              <Select
                value={newChannel.type}
                onValueChange={(value: any) =>
                  setNewChannel({ ...newChannel, type: value, botToken: '' })
                }
              >
                <SelectTrigger
                  id='channel-type'
                  className='bg-background border-border text-foreground'
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className='bg-card border-border'>
                  {Object.entries(channelConfig)
                    .filter(([_, config]) => config.available)
                    .map(([type, config]) => (
                      <SelectItem
                        key={type}
                        value={type}
                        className='text-foreground hover:bg-accent'
                      >
                        <div className='flex items-center gap-2'>
                          <span>{config.icon}</span>
                          <span>{config.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Bot Token field for Telegram */}
            {newChannel.type === 'telegram' && (
              <div className='space-y-2'>
                <Label htmlFor='bot-token' className='text-foreground'>
                  Токен бота <span className='text-red-500'>*</span>
                </Label>
                <Input
                  id='bot-token'
                  placeholder='Введите токен бота от @BotFather'
                  value={newChannel.botToken}
                  onChange={(e) =>
                    setNewChannel({ ...newChannel, botToken: e.target.value })
                  }
                  className='bg-background border-border text-foreground'
                />
                <p className='text-xs text-muted-foreground'>
                  Получите токен у @BotFather в Telegram
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => handleDialogClose(false)}
              disabled={isCreating}
              className='border-border text-muted-foreground'
            >
              Отмена
            </Button>
            <Button
              onClick={handleCreateChannel}
              disabled={
                !newChannel.name.trim() ||
                (newChannel.type === 'telegram' &&
                  !newChannel.botToken.trim()) ||
                isCreating
              }
              className='bg-purple-600 hover:bg-purple-700 text-white'
            >
              {isCreating ? (
                <>
                  <RefreshCw className='h-4 w-4 mr-2 animate-spin' />
                  Создание...
                </>
              ) : (
                'Создать'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// 'use client';

// import { Header } from '@/components/header';
// import { Sidebar } from '@/components/sidebar';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Plus } from 'lucide-react';

// export default function ChannelsPage() {
//   return (
//     <div className='flex h-screen bg-background'>
//       {/* Desktop Sidebar */}
//       <div className='hidden md:block w-68 flex-shrink-0'>
//         <Sidebar />
//       </div>

//       <div className='flex-1 flex flex-col min-w-0'>
//         <Header />
//         <main className='flex-1 p-4 md:p-6 overflow-auto'>
//           <div className='max-w-4xl mx-auto'>
//             <Card>
//               <CardHeader className='text-center'>
//                 <Plus className='h-12 w-12 md:h-16 md:w-16 mx-auto text-purple-600 mb-4' />
//                 <CardTitle className='text-xl md:text-2xl'>Каналы</CardTitle>
//               </CardHeader>
//               <CardContent className='text-center'>
//                 <p className='text-muted-foreground text-sm md:text-base'>
//                   Эта страница находится в разработке. Здесь будет возможность
//                   дообучения агентов.
//                 </p>
//               </CardContent>
//             </Card>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }
