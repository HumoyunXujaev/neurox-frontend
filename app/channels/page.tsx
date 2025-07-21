'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Search,
  MoreVertical,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { useAuth } from '@/contexts/auth-context';
import { apiClient, InfoFlow } from '@/lib/api/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Channel type icons
const channelIcons = {
  telegram: '📱',
  instagram: '📷',
  web: '🌐',
};

// Channel type names
const channelTypeNames = {
  telegram: 'Telegram',
  instagram: 'Instagram',
  web: 'Web Chat',
};

export default function ChannelsPage() {
  const { user } = useAuth();
  const [channels, setChannels] = useState<InfoFlow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<InfoFlow | null>(null);

  // New channel form
  const [newChannel, setNewChannel] = useState({
    name: '',
    type: 'telegram' as 'telegram' | 'instagram' | 'web',
    data: {},
  });

  // Load channels
  const loadChannels = useCallback(async () => {
    if (!user?.company_id) return;

    try {
      setIsLoading(true);
      apiClient.infoFlow.setAuthHeader(process.env.NEXT_PUBLIC_STATS_SERVICE_SECRET_KEY);
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

    setIsCreating(true);

    try {
      const channelData = {
        id: Math.floor(Date.now() / 100000),
        name: newChannel.name.trim(),
        type: newChannel.type,
        company_id: user.company_id,
        data: getDefaultChannelData(newChannel.type),
      };

      apiClient.infoFlow.setAuthHeader(process.env.NEXT_PUBLIC_MAIN_SERVICE_API_KEY);
      await apiClient.infoFlow.create(channelData);

      toast.success('Канал создан успешно');
      setShowAddDialog(false);
      setNewChannel({ name: '', type: 'telegram', data: {} });
      loadChannels();
    } catch (error) {
      console.error('Error creating channel:', error);
      toast.error('Ошибка создания канала');
    } finally {
      setIsCreating(false);
    }
  };

  // Get default channel data
  const getDefaultChannelData = (type: string) => {
    switch (type) {
      case 'telegram':
        return {
          bot_token: '',
          webhook_url: '',
        };
      case 'instagram':
        return {
          access_token: '',
          instagram_account_id: '',
          webhook_url: '',
        };
      case 'web':
        return {
          widget_id: `widget_${Date.now()}`,
          allowed_domains: [],
        };
      default:
        return {};
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

  // Connect channel (OAuth flow)
  const handleConnectChannel = async (channel: InfoFlow) => {
    try {
      if (channel.type === 'instagram') {
        const response = await apiClient.infoFlow.getOAuthLink(
          channel.id,
          'instagram'
        );
        // Open OAuth URL in new window
        if (response.data.url) {
          window.open(response.data.url, '_blank');
          toast.info('Следуйте инструкциям для подключения Instagram');
        }
      } else if (channel.type === 'telegram') {
        toast.info('Настройте бота Telegram через @BotFather и добавьте токен');
      } else {
        toast.info('Web канал готов к использованию');
      }
    } catch (error) {
      console.error('Error connecting channel:', error);
      toast.error('Ошибка подключения канала');
    }
  };

  // Check channel status
  const getChannelStatus = (channel: InfoFlow) => {
    // Check if channel has required data
    if (channel.type === 'telegram' && !channel.data?.bot_token) {
      return 'not_configured';
    }
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

  return (
    <div className='flex h-screen bg-background'>
      <div className='hidden md:block w-68 flex-shrink-0'>
        <Sidebar />
      </div>

      <div className='flex-1 flex flex-col min-w-0'>
        <Header />

        <main className='flex-1 p-4 md:p-6 overflow-auto'>
          <div className='max-w-6xl mx-auto space-y-6'>
            {/* Header */}
            <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
              <div>
                <h1 className='text-2xl md:text-3xl font-bold'>Каналы</h1>
                <p className='text-muted-foreground mt-1'>
                  Управление каналами связи с клиентами
                </p>
              </div>

              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className='h-4 w-4 mr-2' />
                Добавить канал
              </Button>
            </div>

            {/* Search */}
            <div className='relative max-w-md'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Поиск каналов...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='pl-9'
              />
            </div>

            {/* Channels Grid */}
            {isLoading ? (
              <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                {[...Array(3)].map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className='h-6 w-32 mb-2' />
                      <Skeleton className='h-4 w-24' />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className='h-4 w-full mb-2' />
                      <Skeleton className='h-4 w-48' />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredChannels.length === 0 ? (
              <Card>
                <CardContent className='p-12 text-center'>
                  <p className='text-muted-foreground mb-4'>
                    {searchQuery
                      ? 'Каналы не найдены'
                      : 'У вас пока нет каналов'}
                  </p>
                  {!searchQuery && (
                    <Button onClick={() => setShowAddDialog(true)}>
                      <Plus className='h-4 w-4 mr-2' />
                      Создать первый канал
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                {filteredChannels.map((channel) => {
                  const status = getChannelStatus(channel);

                  return (
                    <Card key={channel.id} className='relative overflow-hidden'>
                      <CardHeader className='pb-3'>
                        <div className='flex items-start justify-between'>
                          <div className='flex items-center gap-2'>
                            <span className='text-2xl'>
                              {channelIcons[
                                channel.type as keyof typeof channelIcons
                              ] || '📡'}
                            </span>
                            <div>
                              <CardTitle className='text-lg'>
                                {channel.name}
                              </CardTitle>
                              <CardDescription>
                                {channelTypeNames[
                                  channel.type as keyof typeof channelTypeNames
                                ] || channel.type}
                              </CardDescription>
                            </div>
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant='ghost'
                                size='icon'
                                className='h-8 w-8'
                              >
                                <MoreVertical className='h-4 w-4' />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end'>
                              <DropdownMenuItem
                                onClick={() => setSelectedChannel(channel)}
                              >
                                Настройки
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleConnectChannel(channel)}
                              >
                                Подключить
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteChannel(channel)}
                                className='text-destructive'
                              >
                                Удалить
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>

                      <CardContent>
                        <div className='space-y-3'>
                          {getStatusBadge(status)}

                          <div className='text-sm text-muted-foreground'>
                            <p>ID: {channel.id}</p>
                            <p>
                              Создан:{' '}
                              {new Date(channel.created_at).toLocaleDateString(
                                'ru-RU'
                              )}
                            </p>
                          </div>

                          {status === 'not_configured' && (
                            <Button
                              size='sm'
                              className='w-full'
                              onClick={() => handleConnectChannel(channel)}
                            >
                              Настроить подключение
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Add Channel Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить канал</DialogTitle>
            <DialogDescription>
              Создайте новый канал для связи с клиентами
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='channel-name'>Название канала</Label>
              <Input
                id='channel-name'
                placeholder='Например: Основной Telegram'
                value={newChannel.name}
                onChange={(e) =>
                  setNewChannel({ ...newChannel, name: e.target.value })
                }
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='channel-type'>Тип канала</Label>
              <Select
                value={newChannel.type}
                onValueChange={(value: any) =>
                  setNewChannel({ ...newChannel, type: value })
                }
              >
                <SelectTrigger id='channel-type'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='telegram'>
                    <div className='flex items-center gap-2'>
                      <span>{channelIcons.telegram}</span>
                      <span>Telegram</span>
                    </div>
                  </SelectItem>
                  <SelectItem value='instagram'>
                    <div className='flex items-center gap-2'>
                      <span>{channelIcons.instagram}</span>
                      <span>Instagram</span>
                    </div>
                  </SelectItem>
                  <SelectItem value='web'>
                    <div className='flex items-center gap-2'>
                      <span>{channelIcons.web}</span>
                      <span>Web Chat</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setShowAddDialog(false)}
              disabled={isCreating}
            >
              Отмена
            </Button>
            <Button
              onClick={handleCreateChannel}
              disabled={!newChannel.name.trim() || isCreating}
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
