'use client';
import { useState, useEffect } from 'react';
import { Header } from '@/components/header';
import { Sidebar } from '@/components/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  User,
  Shield,
  CreditCard,
  ShoppingCart,
  Bell,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

type TabType =
  | 'account'
  | 'profile'
  | 'security'
  | 'subscription'
  | 'purchase'
  | 'notifications';

export default function AccountPage() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>(
    (searchParams.get('tab') as TabType) || 'account'
  );
  const [showActivationDialog, setShowActivationDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [activationKey, setActivationKey] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Profile form state
  const [profileData, setProfileData] = useState({
    companyName: '',
    companySize: '',
    contactName: '',
    region: '',
    phone: '',
    email: '',
    language: '',
    experience: '',
    usage: '',
  });

  // Notification states
  const [telegramConnected, setTelegramConnected] = useState(false);
  const [emailConnected, setEmailConnected] = useState(true);

  const { user, refreshUser } = useAuth();
  const [accountDetails, setAccountDetails] = useState({
    plan: 'Тест',
    subscriptionEnd: 'Never',
    botcoinBalance: 0,
    reservedBotcoin: 0,
  });

  const getSubscriptionEndDate = () => {
    if (!user?.created_at) return new Date();
    const createdDate = new Date(user.created_at);
    const endDate = new Date(createdDate);
    endDate.setDate(createdDate.getDate() + 7);
    return endDate;
  };

  const getDaysRemaining = () => {
    const endDate = getSubscriptionEndDate();
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getSubscriptionProgress = () => {
    const daysRemaining = getDaysRemaining();
    return ((7 - daysRemaining) / 7) * 100;
  };

  useEffect(() => {
    const fetchAccountDetails = async () => {
      if (user) {
        // Assuming user object contains necessary account details
        setAccountDetails({
          plan: user.role, // Example: Assuming user.role represents the plan
          subscriptionEnd: 'Never', // Replace with actual subscription end date if available
          botcoinBalance: 100, // Replace with actual BotCoin balance if available
          reservedBotcoin: 0, // Replace with actual reserved BotCoin balance if available
        });
      }
    };

    fetchAccountDetails();
  }, [user]);

  const tabs = [
    { id: 'account', label: 'АККАУНТ', icon: User },
    { id: 'profile', label: 'ПРОФИЛЬ', icon: User },
    { id: 'security', label: 'БЕЗОПАСНОСТЬ', icon: Shield },
    { id: 'subscription', label: 'ОПЛАТА ПОДПИСКИ', icon: CreditCard },
    { id: 'purchase', label: 'ПОКУПКА BOTCOIN', icon: ShoppingCart },
    { id: 'notifications', label: 'УВЕДОМЛЕНИЯ', icon: Bell },
  ];

  const handleActivateKey = () => {
    if (!activationKey.trim()) {
      toast.error('Введите ключ активации');
      return;
    }
    toast.success('Ключ активации успешно применен');
    setShowActivationDialog(false);
    setActivationKey('');
  };

  const handlePasswordChange = () => {
    if (!newPassword || !confirmPassword) {
      toast.error('Заполните все поля');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Пароли не совпадают');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Пароль должен содержать минимум 6 символов');
      return;
    }
    toast.success('Пароль успешно изменен');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handlePayment = (paymentType: string) => {
    setShowPaymentDialog(false);
    toast.success(`Переход к оплате: ${paymentType}`);
  };

  const renderAccountTab = () => (
    <div className='space-y-4 md:space-y-6'>
      <h2 className='text-xl md:text-2xl font-bold'>Текущий план</h2>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6'>
        <Card>
          <CardContent className='p-4 md:p-6'>
            <div className='space-y-4'>
              <div>
                <div className='text-lg font-semibold'>
                  Тариф: {accountDetails.plan}
                </div>
                <div className='text-muted-foreground'>Пробная версия</div>
              </div>
              <div className='space-y-2'>
                <div className='text-sm text-muted-foreground'>
                  Подписка не оплачена.
                </div>
                <div className='text-sm text-muted-foreground'>
                  Уведомление об окончании подписки (и за 7 дней) придут вам в
                  Email
                </div>
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-lg font-bold'>0 руб в месяц</span>
                <Badge variant='secondary'>test</Badge>
              </div>
              <div className='text-sm text-muted-foreground'>
                Версия для тестирования
              </div>
              <Alert className='bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-600'>
                <AlertTriangle className='h-4 w-4 text-amber-600' />
                <AlertDescription className='text-amber-800 dark:text-amber-200'>
                  <strong>Внимание!</strong>
                  <br />
                  Требуется оплатить{' '}
                  <button
                    onClick={() => setActiveTab('subscription')}
                    className='underline hover:text-amber-900'
                  >
                    подписку
                  </button>
                  !
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4 md:p-6'>
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-muted-foreground'>
                  Текущая подписка
                </span>
                <span className='text-sm'>
                  {getDaysRemaining()} из 7 дн осталось
                </span>
              </div>
              <Progress value={getSubscriptionProgress()} className='h-2' />
              <div className='text-sm text-muted-foreground'>
                {getDaysRemaining()} дн. до окончания подписки
              </div>
              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-muted-foreground'>
                    Бонусные BotCoin
                  </span>
                  <span className='text-sm'>
                    {accountDetails.botcoinBalance} из 10
                  </span>
                </div>
                <Progress value={99.5} className='h-2' />
                <div className='text-xs text-muted-foreground'>
                  Обновляются каждый месяц на всех тарифах (кроме тестовых)
                </div>
              </div>
              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-muted-foreground'>
                    Резервные BotCoin
                  </span>
                  <span className='text-sm'>
                    {accountDetails.reservedBotcoin}
                  </span>
                </div>
                <div className='text-xs text-muted-foreground'>
                  Сохраняются после обновления и расходуются после бонусных
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className='flex justify-end'>
        <Button
          onClick={() => setShowActivationDialog(true)}
          className='bg-purple-600 hover:bg-purple-700 w-full sm:w-auto'
        >
          АКТИВИРОВАТЬ КЛЮЧ
        </Button>
      </div>
    </div>
  );

  const renderProfileTab = () => (
    <div className='space-y-4 md:space-y-6'>
      <h2 className='text-xl md:text-2xl font-bold'>Настройка профиля</h2>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6'>
        <div className='space-y-2'>
          <Label htmlFor='company-name'>Название компании</Label>
          <Input
            id='company-name'
            value={profileData.companyName}
            onChange={(e) =>
              setProfileData({ ...profileData, companyName: e.target.value })
            }
            placeholder='Введите название компании'
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='activity-sphere'>Сфера деятельности</Label>
          <Input
            id='activity-sphere'
            value={profileData.contactName}
            onChange={(e) =>
              setProfileData({ ...profileData, contactName: e.target.value })
            }
            placeholder='Введите сферу деятельности'
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='company-size'>Размер компании</Label>
          <Input
            id='company-size'
            value={profileData.companySize}
            onChange={(e) =>
              setProfileData({ ...profileData, companySize: e.target.value })
            }
            placeholder='Введите размер компании'
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='region'>Регион</Label>
          <Input
            id='region'
            value={profileData.region}
            onChange={(e) =>
              setProfileData({ ...profileData, region: e.target.value })
            }
            placeholder='Введите регион'
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='contact-person'>ФИО для связи</Label>
          <Input
            id='contact-person'
            value={profileData.contactName}
            onChange={(e) =>
              setProfileData({ ...profileData, contactName: e.target.value })
            }
            placeholder='Введите ФИО'
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='phone'>Телефонный номер</Label>
          <Input
            id='phone'
            value={profileData.phone}
            onChange={(e) =>
              setProfileData({ ...profileData, phone: e.target.value })
            }
            placeholder='Введите номер телефона'
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='email'>Email</Label>
          <Input
            id='email'
            type='email'
            value={profileData.email}
            onChange={(e) =>
              setProfileData({ ...profileData, email: e.target.value })
            }
            placeholder='Введите email'
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='language'>Язык</Label>
          <Select
            value={profileData.language}
            onValueChange={(value) =>
              setProfileData({ ...profileData, language: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder='Выберите язык' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='ru'>Русский</SelectItem>
              <SelectItem value='en'>English</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className='space-y-2'>
          <Label htmlFor='experience'>Прошлый опыт</Label>
          <Select
            value={profileData.experience}
            onValueChange={(value) =>
              setProfileData({ ...profileData, experience: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder='Выберите опыт' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='beginner'>Начинающий</SelectItem>
              <SelectItem value='intermediate'>Средний</SelectItem>
              <SelectItem value='advanced'>Продвинутый</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className='space-y-2'>
          <Label htmlFor='usage'>Способ применения</Label>
          <Select
            value={profileData.usage}
            onValueChange={(value) =>
              setProfileData({ ...profileData, usage: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder='Выберите способ применения' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='support'>Поддержка клиентов</SelectItem>
              <SelectItem value='sales'>Продажи</SelectItem>
              <SelectItem value='marketing'>Маркетинг</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className='space-y-4 md:space-y-6'>
      <h2 className='text-xl md:text-2xl font-bold'>Смена пароля</h2>
      <Card className='max-w-2xl'>
        <CardContent className='p-4 md:p-6 space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='new-password'>Новый пароль</Label>
              <div className='relative'>
                <Input
                  id='new-password'
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder='Введите новый пароль'
                />
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  className='absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8'
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className='h-4 w-4' />
                  ) : (
                    <Eye className='h-4 w-4' />
                  )}
                </Button>
              </div>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='confirm-password'>
                Подтверждение нового пароля
              </Label>
              <div className='relative'>
                <Input
                  id='confirm-password'
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder='Подтвердите новый пароль'
                />
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  className='absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8'
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className='h-4 w-4' />
                  ) : (
                    <Eye className='h-4 w-4' />
                  )}
                </Button>
              </div>
            </div>
          </div>
          <div className='space-y-2'>
            <div className='text-sm font-medium'>Требования к паролю:</div>
            <ul className='text-sm text-muted-foreground space-y-1'>
              <li>• Минимум 6 символов в длину - лучше больше</li>
              <li>• Как минимум одна цифра и буква</li>
            </ul>
          </div>
          <div className='flex flex-col sm:flex-row gap-3'>
            <Button
              onClick={handlePasswordChange}
              className='bg-purple-600 hover:bg-purple-700'
            >
              СОХРАНИТЬ
            </Button>
            <Button
              variant='outline'
              onClick={() => {
                setNewPassword('');
                setConfirmPassword('');
              }}
            >
              ОТМЕНА
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSubscriptionTab = () => (
    <div className='space-y-4 md:space-y-6'>
      <div>
        <h2 className='text-xl md:text-2xl font-bold'>Купить подписку</h2>
        <p className='text-muted-foreground text-sm md:text-base'>
          Подписка активируется сразу после оплаты. Выберите подходящий для вас
          тариф.
        </p>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6'>
        {/* Business Plan */}
        <Card className='relative'>
          <CardHeader className='text-center pb-4'>
            <div className='mx-auto mb-4'>
              <img
                src='/images/4.png'
                alt='Business'
                className='h-26 w-26 md:h-26 md:w-26 mx-auto'
              />
            </div>
            <CardTitle className='text-lg md:text-xl'>Бизнес</CardTitle>
            <div className='text-2xl md:text-3xl font-bold text-purple-600'>
              ₽2900
            </div>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div className='space-y-2 text-sm'>
              <div className='flex items-start gap-2'>
                <div className='w-1 h-1 bg-current rounded-full mt-2 flex-shrink-0'></div>
                <span>310 бонусных BotCoin</span>
              </div>
              <div className='flex items-start gap-2'>
                <div className='w-1 h-1 bg-current rounded-full mt-2 flex-shrink-0'></div>
                <span>Возможность докупать BotCoin</span>
              </div>
              <div className='flex items-start gap-2'>
                <div className='w-1 h-1 bg-current rounded-full mt-2 flex-shrink-0'></div>
                <span>Подписка на месяц</span>
              </div>
              <div className='flex items-start gap-2'>
                <div className='w-1 h-1 bg-current rounded-full mt-2 flex-shrink-0'></div>
                <span>
                  Доступны каналы связи: Telegram, Instagram, Avito, Vk, Salebot
                </span>
              </div>
              <div className='flex items-start gap-2 text-red-500'>
                <div className='w-1 h-1 bg-current rounded-full mt-2 flex-shrink-0'></div>
                <span>НЕдоступны интеграции с CRM, Notion, ELabs</span>
              </div>
              <div className='flex items-start gap-2 text-red-500'>
                <div className='w-1 h-1 bg-current rounded-full mt-2 flex-shrink-0'></div>
                <span>
                  WhatsApp не входит в стоимость, доступен на странице "Каналы"
                </span>
              </div>
            </div>
            <Button
              className='w-full bg-purple-600 hover:bg-purple-700 mt-6'
              onClick={() => setShowPaymentDialog(true)}
            >
              <CreditCard className='mr-2 h-4 w-4' /> ОПЛАТИТЬ
            </Button>
          </CardContent>
        </Card>
        {/* Premium Plan */}
        <Card className='relative border-purple-500'>
          <CardHeader className='text-center pb-4'>
            <div className='mx-auto mb-4'>
              <img
                src='/images/5.png'
                alt='Premium'
                className='h-26 w-26 md:h-26 md:w-26 mx-auto'
              />
            </div>
            <CardTitle className='text-lg md:text-xl'>Премиум</CardTitle>
            <div className='text-2xl md:text-3xl font-bold text-purple-600'>
              ₽4000
            </div>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div className='space-y-2 text-sm'>
              <div className='flex items-start gap-2'>
                <div className='w-1 h-1 bg-current rounded-full mt-2 flex-shrink-0'></div>
                <span>1520 бонусных BotCoin</span>
              </div>
              <div className='flex items-start gap-2'>
                <div className='w-1 h-1 bg-current rounded-full mt-2 flex-shrink-0'></div>
                <span>Возможность докупать BotCoin</span>
              </div>
              <div className='flex items-start gap-2'>
                <div className='w-1 h-1 bg-current rounded-full mt-2 flex-shrink-0'></div>
                <span>Подписка на месяц</span>
              </div>
              <div className='flex items-start gap-2'>
                <div className='w-1 h-1 bg-current rounded-full mt-2 flex-shrink-0'></div>
                <span>
                  Доступны каналы связи: Telegram, Instagram, Avito, Vk, Salebot
                </span>
              </div>
              <div className='flex items-start gap-2'>
                <div className='w-1 h-1 bg-current rounded-full mt-2 flex-shrink-0'></div>
                <span>Интеграции с CRM, Notion, ELabs</span>
              </div>
              <div className='flex items-start gap-2 text-red-500'>
                <div className='w-1 h-1 bg-current rounded-full mt-2 flex-shrink-0'></div>
                <span>
                  WhatsApp не входит в стоимость, доступен на странице "Каналы"
                </span>
              </div>
            </div>
            <Button
              className='w-full bg-purple-600 hover:bg-purple-700 mt-6'
              onClick={() => setShowPaymentDialog(true)}
            >
              <CreditCard className='mr-2 h-4 w-4' /> ОПЛАТИТЬ
            </Button>
          </CardContent>
        </Card>
        {/* VIP Plan */}
        <Card className='relative md:col-span-2 lg:col-span-1'>
          <CardHeader className='text-center pb-4'>
            <div className='mx-auto mb-4'>
              <img
                src='/images/6.png'
                alt='VIP'
                className='h-26 w-26 md:h-26 md:w-26 mx-auto'
              />
            </div>
            <CardTitle className='text-lg md:text-xl'>VIP</CardTitle>
            <div className='text-2xl md:text-3xl font-bold text-purple-600'>
              ₽50000
            </div>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div className='space-y-2 text-sm'>
              <div className='flex items-start gap-2'>
                <div className='w-1 h-1 bg-current rounded-full mt-2 flex-shrink-0'></div>
                <span>1520 бонусных BotCoin</span>
              </div>
              <div className='flex items-start gap-2'>
                <div className='w-1 h-1 bg-current rounded-full mt-2 flex-shrink-0'></div>
                <span>Возможность докупать BotCoin</span>
              </div>
              <div className='flex items-start gap-2'>
                <div className='w-1 h-1 bg-current rounded-full mt-2 flex-shrink-0'></div>
                <span>Подписка на месяц</span>
              </div>
              <div className='flex items-start gap-2'>
                <div className='w-1 h-1 bg-current rounded-full mt-2 flex-shrink-0'></div>
                <span>
                  Доступны каналы связи: Telegram, Instagram, Avito, Vk, Salebot
                </span>
              </div>
              <div className='flex items-start gap-2'>
                <div className='w-1 h-1 bg-current rounded-full mt-2 flex-shrink-0'></div>
                <span>Интеграции с CRM, Notion, ELabs</span>
              </div>
              <div className='flex items-start gap-2'>
                <div className='w-1 h-1 bg-current rounded-full mt-2 flex-shrink-0'></div>
                <span>
                  Поддержка персонального менеджера по настройке и интеграции
                  NEXTBOT
                </span>
              </div>
              <div className='flex items-start gap-2 text-red-500'>
                <div className='w-1 h-1 bg-current rounded-full mt-2 flex-shrink-0'></div>
                <span>
                  WhatsApp не входит в стоимость, доступен на странице "Каналы"
                </span>
              </div>
            </div>
            <Button
              className='w-full bg-purple-600 hover:bg-purple-700 mt-6'
              onClick={() => setShowPaymentDialog(true)}
            >
              <CreditCard className='mr-2 h-4 w-4' /> ОПЛАТИТЬ
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderPurchaseTab = () => (
    <div className='space-y-4 md:space-y-6'>
      <div className='max-w-md mx-auto'>
        <Card>
          <CardHeader className='text-center pb-4'>
            <div className='mx-auto mb-4'>
              <img
                src='/images/4.png'
                alt='BotCoin'
                className='h-26 w-26 md:h-26 md:w-26 mx-auto'
              />
            </div>
            <CardTitle className='text-xl md:text-2xl'>300 BotCoin</CardTitle>
            <div className='text-sm text-muted-foreground'>
              1.40 руб за 1 BotCoin
            </div>
          </CardHeader>
          <CardContent className='text-center space-y-6'>
            <div className='text-3xl md:text-4xl font-bold text-purple-600'>
              ₽420
            </div>
            <div className='space-y-2 text-sm text-muted-foreground'>
              <div className='flex items-center gap-2'>
                <div className='w-1 h-1 bg-current rounded-full'></div>
                <span>300 BotCoin</span>
              </div>
              <div className='flex items-center gap-2'>
                <div className='w-1 h-1 bg-current rounded-full'></div>
                <span>Данные BotCoin не сгорают</span>
              </div>
            </div>
            <Button
              className='w-full bg-purple-600 hover:bg-purple-700'
              onClick={() => setShowPaymentDialog(true)}
            >
              <CreditCard className='mr-2 h-4 w-4' /> ОПЛАТИТЬ
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className='space-y-4 md:space-y-6'>
      <h2 className='text-xl md:text-2xl font-bold'>Настройка уведомлений</h2>
      <div className='space-y-4 md:space-y-6'>
        {/* Telegram Notifications */}
        <Card>
          <CardHeader className='flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0'>
            <CardTitle className='text-lg'>
              Настройка уведомлений Telegram
            </CardTitle>
            <Info className='h-5 w-5 text-muted-foreground' />
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center gap-2'>
              <span className='text-sm'>Статус подключения:</span>
              {telegramConnected ? (
                <div className='flex items-center gap-1'>
                  <CheckCircle className='h-4 w-4 text-green-500' />
                  <span className='text-green-600'>Подключено</span>
                </div>
              ) : (
                <div className='flex items-center gap-1'>
                  <XCircle className='h-4 w-4 text-red-500' />
                  <span className='text-red-600'>Не подключено</span>
                </div>
              )}
            </div>
            <div className='flex flex-col sm:flex-row gap-3'>
              {telegramConnected ? (
                <Button
                  variant='destructive'
                  onClick={() => {
                    setTelegramConnected(false);
                    toast.success('Telegram уведомления отключены');
                  }}
                >
                  ОТКЛЮЧИТЬ
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    setTelegramConnected(true);
                    toast.success('Telegram уведомления подключены');
                  }}
                  className='bg-purple-600 hover:bg-purple-700'
                >
                  ПОДПИСАТЬСЯ
                </Button>
              )}
            </div>
            {!telegramConnected && (
              <div className='text-sm text-muted-foreground'>
                После подключения Telegram для получения состояния подключения
                требуется обновить страницу
              </div>
            )}
          </CardContent>
        </Card>
        {/* Email Notifications */}
        <Card>
          <CardHeader className='flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0'>
            <CardTitle className='text-lg'>
              Настройка уведомлений Email
            </CardTitle>
            <Info className='h-5 w-5 text-muted-foreground' />
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center gap-2'>
              <span className='text-sm'>Статус подключения:</span>
              {emailConnected ? (
                <div className='flex items-center gap-1'>
                  <CheckCircle className='h-4 w-4 text-green-500' />
                  <span className='text-green-600'>Подключено</span>
                </div>
              ) : (
                <div className='flex items-center gap-1'>
                  <XCircle className='h-4 w-4 text-red-500' />
                  <span className='text-red-600'>Не подключено</span>
                </div>
              )}
            </div>
            <div className='flex flex-col sm:flex-row gap-3'>
              {emailConnected ? (
                <Button
                  variant='destructive'
                  onClick={() => {
                    setEmailConnected(false);
                    toast.success('Email уведомления отключены');
                  }}
                >
                  ОТКЛЮЧИТЬ
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    setEmailConnected(true);
                    toast.success('Email уведомления подключены');
                  }}
                  className='bg-purple-600 hover:bg-purple-700'
                  disabled
                >
                  ПОДПИСАТЬСЯ
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'account':
        return renderAccountTab();
      case 'profile':
        return renderProfileTab();
      case 'security':
        return renderSecurityTab();
      case 'subscription':
        return renderSubscriptionTab();
      case 'purchase':
        return renderPurchaseTab();
      case 'notifications':
        return renderNotificationsTab();
      default:
        return renderAccountTab();
    }
  };

  return (
    <div className='flex h-screen bg-background'>
      {/* Desktop Sidebar */}
      <div className='hidden md:block w-68 flex-shrink-0'>
        <Sidebar />
      </div>
      <div className='flex-1 flex flex-col min-w-0'>
        <Header />
        <main className='flex-1 overflow-auto'>
          {/* Tab Navigation */}
          <div className='border-b bg-background sticky top-0 z-10'>
            <div className='flex overflow-x-auto'>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <tab.icon className='h-4 w-4' />
                  <span className='hidden sm:inline'>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
          {/* Tab Content */}
          <div className='p-4 md:p-6'>
            <div className='max-w-7xl mx-auto'>{renderTabContent()}</div>
          </div>
        </main>
      </div>
      {/* Activation Key Dialog */}
      <Dialog
        open={showActivationDialog}
        onOpenChange={setShowActivationDialog}
      >
        <DialogContent className='sm:max-w-md mx-4'>
          <DialogHeader>
            <DialogTitle>Активация ключа</DialogTitle>
            <DialogDescription>
              Введите ключ активации для получения дополнительных возможностей
              или подписки
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='activation-key'>Ключ активации</Label>
              <Input
                id='activation-key'
                value={activationKey}
                onChange={(e) => setActivationKey(e.target.value)}
                placeholder='XXXX-XXXX-XXXX-XXXX-XXXX'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='agent-select'>
                Выберите агента (опционально)
              </Label>
              <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                <SelectTrigger>
                  <SelectValue placeholder='Выберите агента' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='agent1'>Новый агент 1</SelectItem>
                  <SelectItem value='agent2'>Агент 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Alert className='bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-600'>
              <Info className='h-4 w-4 text-blue-600' />
              <AlertDescription className='text-blue-800 dark:text-blue-200'>
                Выбор агента требуется только для активации ключей WhatsApp. В
                большинстве случаев это поле можно оставить пустым.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter className='flex flex-col sm:flex-row gap-2'>
            <Button
              variant='outline'
              onClick={() => setShowActivationDialog(false)}
            >
              ОТМЕНА
            </Button>
            <Button
              onClick={handleActivateKey}
              className='bg-purple-600 hover:bg-purple-700'
            >
              АКТИВИРОВАТЬ КЛЮЧ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Payment Type Selection Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className='sm:max-w-md mx-4'>
          <DialogHeader>
            <DialogTitle className='text-center'>
              Выберите тип оплаты
            </DialogTitle>
          </DialogHeader>
          <div className='space-y-3'>
            <Button
              className='w-full bg-purple-600 hover:bg-purple-700 text-white h-12'
              onClick={() => handlePayment('Оплата картой РФ')}
            >
              ОПЛАТА КАРТОЙ РФ
            </Button>
            <Button
              className='w-full bg-purple-600 hover:bg-purple-700 text-white h-12'
              onClick={() => handlePayment('Оплата картой')}
            >
              ОПЛАТА КАРТОЙ
            </Button>
            <Button
              className='w-full bg-purple-600 hover:bg-purple-700 text-white h-12'
              onClick={() => handlePayment('Оплата по расчетному счету')}
            >
              ОПЛАТА ПО РАСЧЕТНОМУ СЧЕТУ
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
