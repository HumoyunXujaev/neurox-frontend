'use client';

import type React from 'react';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Key,
  Shield,
  Clock,
  Check,
  X,
} from 'lucide-react';
import AnimatedBackground from '@/components/animated-background';
import { toast } from 'sonner';

type Step = 'email' | 'code' | 'password' | 'success';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

  // Password strength calculation
  const getPasswordStrength = (password: string) => {
    let strength = 0;
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      numbers: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    Object.values(checks).forEach((check) => {
      if (check) strength += 20;
    });

    return { strength, checks };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  const getStrengthColor = (strength: number) => {
    if (strength < 40) return 'bg-red-500';
    if (strength < 60) return 'bg-yellow-500';
    if (strength < 80) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStrengthText = (strength: number) => {
    if (strength < 40) return 'Слабый';
    if (strength < 60) return 'Средний';
    if (strength < 80) return 'Хороший';
    return 'Отличный';
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Введите email адрес');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast.success('Код восстановления отправлен на email');
      setCurrentStep('code');
      // Start countdown
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      toast.error('Ошибка отправки кода');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.length !== 6) {
      toast.error('Введите 6-значный код');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success('Код подтвержден');
      setCurrentStep('password');
    } catch (error) {
      toast.error('Неверный код');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      toast.error('Заполните все поля');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Пароли не совпадают');
      return;
    }
    if (passwordStrength.strength < 80) {
      toast.error('Пароль должен быть более надежным');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast.success('Пароль успешно изменен');
      setCurrentStep('success');
    } catch (error) {
      toast.error('Ошибка изменения пароля');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Код отправлен повторно');
      setTimeLeft(300);
    } catch (error) {
      toast.error('Ошибка отправки кода');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStepProgress = () => {
    switch (currentStep) {
      case 'email':
        return 25;
      case 'code':
        return 50;
      case 'password':
        return 75;
      case 'success':
        return 100;
      default:
        return 0;
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 relative overflow-hidden'>
      <AnimatedBackground />

      {/* Header */}
      <div className='absolute top-0 left-0 right-0 z-20 p-4 sm:p-6'>
        <div className='flex items-center justify-between max-w-7xl mx-auto'>
          <Button
            variant='ghost'
            className='text-white/80 hover:text-white hover:bg-white/10'
            onClick={() => router.push('/login')}
          >
            <ArrowLeft className='w-4 h-4 mr-2' />
            Вернуться к входу
          </Button>
          <Link
            href='/'
            className='text-xl sm:text-2xl font-bold bg-gradient-to-r from-white via-purple-100 to-blue-100 bg-clip-text text-transparent'
          >
            NEUROX
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className='flex items-center justify-center min-h-screen p-4 pt-20'>
        <div className='w-full max-w-md relative z-10'>
          {/* Progress Bar */}
          <div className='mb-8'>
            <div className='flex items-center justify-between mb-2'>
              <span className='text-white/80 text-sm'>
                Восстановление пароля
              </span>
              <span className='text-white/80 text-sm'>
                {getStepProgress()}%
              </span>
            </div>
            <Progress value={getStepProgress()} className='h-2 bg-white/20' />
          </div>

          <Card className='bg-white/95 backdrop-blur-sm border-0 shadow-2xl'>
            {/* Email Step */}
            {currentStep === 'email' && (
              <>
                <CardHeader className='space-y-2 text-center pb-6'>
                  <div className='mx-auto w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mb-4'>
                    <Mail className='w-8 h-8 text-white' />
                  </div>
                  <CardTitle className='text-2xl sm:text-3xl font-bold text-gray-900'>
                    Восстановление пароля
                  </CardTitle>
                  <CardDescription className='text-gray-600 text-base'>
                    Введите email адрес для получения кода восстановления
                  </CardDescription>
                </CardHeader>

                <CardContent className='space-y-6'>
                  <form onSubmit={handleEmailSubmit} className='space-y-5'>
                    <div className='space-y-2'>
                      <Label
                        htmlFor='email'
                        className='text-sm font-medium text-gray-700'
                      >
                        Email адрес
                      </Label>
                      <div className='relative'>
                        <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
                        <Input
                          id='email'
                          type='email'
                          placeholder='example@email.com'
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className='pl-10 h-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500'
                          disabled={isLoading}
                          required
                        />
                      </div>
                    </div>

                    <Alert className='bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-600'>
                      <AlertTriangle className='h-4 w-4 text-blue-600' />
                      <AlertDescription className='text-blue-800 dark:text-blue-200'>
                        Мы отправим 6-значный код на указанный email адрес. Код
                        действителен в течение 5 минут.
                      </AlertDescription>
                    </Alert>

                    <Button
                      type='submit'
                      className='w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium text-base shadow-lg hover:shadow-xl transition-all duration-200'
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className='mr-2 h-5 w-5 animate-spin' />
                          Отправка кода...
                        </>
                      ) : (
                        <>
                          <Mail className='mr-2 h-5 w-5' />
                          Отправить код
                        </>
                      )}
                    </Button>
                  </form>

                  <div className='text-center'>
                    <span className='text-gray-600'>Вспомнили пароль? </span>
                    <Link
                      href='/login'
                      className='text-purple-600 hover:text-purple-700 font-medium transition-colors'
                    >
                      Войти
                    </Link>
                  </div>
                </CardContent>
              </>
            )}

            {/* Code Verification Step */}
            {currentStep === 'code' && (
              <>
                <CardHeader className='space-y-2 text-center pb-6'>
                  <div className='mx-auto w-16 h-16 bg-gradient-to-br from-green-600 to-teal-600 rounded-2xl flex items-center justify-center mb-4'>
                    <Key className='w-8 h-8 text-white' />
                  </div>
                  <CardTitle className='text-2xl sm:text-3xl font-bold text-gray-900'>
                    Введите код
                  </CardTitle>
                  <CardDescription className='text-gray-600 text-base'>
                    Мы отправили 6-значный код на {email}
                  </CardDescription>
                </CardHeader>

                <CardContent className='space-y-6'>
                  <form onSubmit={handleCodeSubmit} className='space-y-5'>
                    <div className='space-y-2'>
                      <Label
                        htmlFor='code'
                        className='text-sm font-medium text-gray-700'
                      >
                        Код подтверждения
                      </Label>
                      <div className='relative'>
                        <Key className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
                        <Input
                          id='code'
                          type='text'
                          placeholder='123456'
                          value={code}
                          onChange={(e) =>
                            setCode(
                              e.target.value.replace(/\D/g, '').slice(0, 6)
                            )
                          }
                          className='pl-10 h-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500 text-center text-lg font-mono tracking-widest'
                          disabled={isLoading}
                          maxLength={6}
                          required
                        />
                      </div>
                    </div>

                    {timeLeft > 0 ? (
                      <div className='flex items-center justify-center gap-2 text-sm text-gray-600'>
                        <Clock className='w-4 h-4' />
                        <span>Код действителен еще {formatTime(timeLeft)}</span>
                      </div>
                    ) : (
                      <Alert className='bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-600'>
                        <AlertTriangle className='h-4 w-4 text-red-600' />
                        <AlertDescription className='text-red-800 dark:text-red-200'>
                          Время действия кода истекло. Запросите новый код.
                        </AlertDescription>
                      </Alert>
                    )}

                    <Button
                      type='submit'
                      className='w-full h-12 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-medium text-base shadow-lg hover:shadow-xl transition-all duration-200'
                      disabled={isLoading || code.length !== 6}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className='mr-2 h-5 w-5 animate-spin' />
                          Проверка кода...
                        </>
                      ) : (
                        <>
                          <CheckCircle className='mr-2 h-5 w-5' />
                          Подтвердить код
                        </>
                      )}
                    </Button>
                  </form>

                  <div className='text-center'>
                    <span className='text-gray-600'>Не получили код? </span>
                    <button
                      onClick={handleResendCode}
                      disabled={isLoading || timeLeft > 0}
                      className='text-purple-600 hover:text-purple-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      Отправить повторно
                    </button>
                  </div>
                </CardContent>
              </>
            )}

            {/* New Password Step */}
            {currentStep === 'password' && (
              <>
                <CardHeader className='space-y-2 text-center pb-6'>
                  <div className='mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-4'>
                    <Lock className='w-8 h-8 text-white' />
                  </div>
                  <CardTitle className='text-2xl sm:text-3xl font-bold text-gray-900'>
                    Новый пароль
                  </CardTitle>
                  <CardDescription className='text-gray-600 text-base'>
                    Создайте надежный пароль для вашего аккаунта
                  </CardDescription>
                </CardHeader>

                <CardContent className='space-y-6'>
                  <form onSubmit={handlePasswordSubmit} className='space-y-5'>
                    <div className='space-y-2'>
                      <Label
                        htmlFor='new-password'
                        className='text-sm font-medium text-gray-700'
                      >
                        Новый пароль
                      </Label>
                      <div className='relative'>
                        <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
                        <Input
                          id='new-password'
                          type={showPassword ? 'text' : 'password'}
                          placeholder='Создайте надежный пароль'
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className='pl-10 pr-12 h-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500'
                          disabled={isLoading}
                          required
                        />
                        <button
                          type='button'
                          onClick={() => setShowPassword(!showPassword)}
                          className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors'
                          disabled={isLoading}
                        >
                          {showPassword ? (
                            <EyeOff className='h-5 w-5' />
                          ) : (
                            <Eye className='h-5 w-5' />
                          )}
                        </button>
                      </div>

                      {newPassword && (
                        <div className='space-y-2'>
                          <div className='flex items-center justify-between text-xs'>
                            <span className='text-gray-600'>
                              Надежность пароля:
                            </span>
                            <span
                              className={`font-medium ${
                                passwordStrength.strength >= 80
                                  ? 'text-green-600'
                                  : passwordStrength.strength >= 60
                                  ? 'text-blue-600'
                                  : passwordStrength.strength >= 40
                                  ? 'text-yellow-600'
                                  : 'text-red-600'
                              }`}
                            >
                              {getStrengthText(passwordStrength.strength)}
                            </span>
                          </div>
                          <Progress
                            value={passwordStrength.strength}
                            className={`h-2 ${getStrengthColor(
                              passwordStrength.strength
                            )}`}
                          />
                          <div className='grid grid-cols-2 gap-2 text-xs'>
                            {Object.entries({
                              'Минимум 8 символов':
                                passwordStrength.checks.length,
                              'Заглавные буквы':
                                passwordStrength.checks.uppercase,
                              'Строчные буквы':
                                passwordStrength.checks.lowercase,
                              Цифры: passwordStrength.checks.numbers,
                            }).map(([label, check]) => (
                              <div
                                key={label}
                                className='flex items-center gap-1'
                              >
                                {check ? (
                                  <Check className='w-3 h-3 text-green-500' />
                                ) : (
                                  <X className='w-3 h-3 text-red-500' />
                                )}
                                <span
                                  className={
                                    check ? 'text-green-600' : 'text-red-600'
                                  }
                                >
                                  {label}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className='space-y-2'>
                      <Label
                        htmlFor='confirm-password'
                        className='text-sm font-medium text-gray-700'
                      >
                        Подтвердите пароль
                      </Label>
                      <div className='relative'>
                        <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
                        <Input
                          id='confirm-password'
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder='Повторите пароль'
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className='pl-10 pr-12 h-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500'
                          disabled={isLoading}
                          required
                        />
                        <button
                          type='button'
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors'
                          disabled={isLoading}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className='h-5 w-5' />
                          ) : (
                            <Eye className='h-5 w-5' />
                          )}
                        </button>
                      </div>
                      {confirmPassword && newPassword !== confirmPassword && (
                        <p className='text-red-600 text-xs flex items-center gap-1'>
                          <X className='w-3 h-3' />
                          Пароли не совпадают
                        </p>
                      )}
                    </div>

                    <Button
                      type='submit'
                      className='w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium text-base shadow-lg hover:shadow-xl transition-all duration-200'
                      disabled={
                        isLoading ||
                        passwordStrength.strength < 80 ||
                        newPassword !== confirmPassword
                      }
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className='mr-2 h-5 w-5 animate-spin' />
                          Сохранение пароля...
                        </>
                      ) : (
                        <>
                          <Shield className='mr-2 h-5 w-5' />
                          Сохранить пароль
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </>
            )}

            {/* Success Step */}
            {currentStep === 'success' && (
              <>
                <CardHeader className='space-y-2 text-center pb-6'>
                  <div className='mx-auto w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center mb-4'>
                    <CheckCircle className='w-8 h-8 text-white' />
                  </div>
                  <CardTitle className='text-2xl sm:text-3xl font-bold text-gray-900'>
                    Пароль изменен!
                  </CardTitle>
                  <CardDescription className='text-gray-600 text-base'>
                    Ваш пароль успешно изменен. Теперь вы можете войти в систему
                    с новым паролем.
                  </CardDescription>
                </CardHeader>

                <CardContent className='space-y-6'>
                  <div className='bg-green-50 p-4 rounded-lg border border-green-200'>
                    <div className='flex items-center gap-3'>
                      <CheckCircle className='w-5 h-5 text-green-600 flex-shrink-0' />
                      <div>
                        <p className='font-medium text-green-900'>
                          Пароль успешно обновлен
                        </p>
                        <p className='text-green-700 text-sm'>
                          Используйте новый пароль для входа в систему
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className='space-y-3'>
                    <Button
                      onClick={() => router.push('/login')}
                      className='w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium text-base shadow-lg hover:shadow-xl transition-all duration-200'
                    >
                      <CheckCircle className='mr-2 h-5 w-5' />
                      Войти в систему
                    </Button>

                    <Button
                      variant='outline'
                      onClick={() => router.push('/')}
                      className='w-full h-12 border-gray-200 hover:bg-gray-50'
                    >
                      На главную страницу
                    </Button>
                  </div>

                  <Alert className='bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-600'>
                    <Shield className='h-4 w-4 text-blue-600' />
                    <AlertDescription className='text-blue-800 dark:text-blue-200'>
                      <strong>Рекомендация:</strong> Для дополнительной
                      безопасности рассмотрите возможность включения
                      двухфакторной аутентификации в настройках аккаунта.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </>
            )}
          </Card>

          {/* Additional Info */}
          <div className='mt-8 text-center'>
            <p className='text-white/80 text-sm'>
              Нужна помощь?{' '}
              <Link
                href='mailto:support@neurox.ru'
                className='text-white underline hover:text-purple-200'
              >
                Свяжитесь с поддержкой
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
