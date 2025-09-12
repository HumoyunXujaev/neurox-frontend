'use client';

import { Header } from '@/components/header';
import { Sidebar } from '@/components/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronDown } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

// Sample data for charts
const botcoinData = [{ date: '01', value: 0.04 }];

const dialogsData = [{ date: '01/07/2025', messages: 4, dialogs: 1 }];

const functionsData = [{ date: '01/07/2025', functions: 0 }];

const tokensData = [
  {
    date: '01',
    'gpt-4o-mini-incoming': 0,
    'gpt-4o-mini-outgoing': 0,
    'gpt-4-incoming': 0,
    'gpt-4-outgoing': 0,
    'gpt-o3-mini-incoming': 0,
  },
];

export default function AnalyticsPage() {
  return (
    <div className='flex h-screen bg-background'>
      {/* Desktop Sidebar */}
      <div className='hidden md:block w-68 flex-shrink-0'>
        <Sidebar />
      </div>

      <div className='flex-1 flex flex-col min-w-0'>
        <Header />
        <main className='flex-1 p-4 md:p-6 overflow-auto'>
          <div className='max-w-7xl mx-auto space-y-4 md:space-y-6'>
            {/* BotCoin Expenses Chart */}
            <Card>
              <CardHeader className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
                <CardTitle className='text-lg font-medium'>
                  Расход NXT
                </CardTitle>
                <Button
                  variant='outline'
                  size='sm'
                  className='flex items-center gap-2 bg-transparent text-sm'
                >
                  <Calendar className='h-4 w-4' />
                  <span className='hidden sm:inline'>01/06/25 - 01/07/25</span>
                  <span className='sm:hidden'>Период</span>
                  <ChevronDown className='h-4 w-4' />
                </Button>
              </CardHeader>
              <CardContent>
                <div className='text-sm text-muted-foreground mb-4 space-y-1'>
                  <div>Общие затраты за выбранный период: 0.03 NXT</div>
                  <div>Средние затраты на диалог: 0.03 NXT/диалог</div>
                  <div className='flex items-center gap-2 mt-2'>
                    <div className='w-3 h-3 bg-purple-500 rounded-full'></div>
                    <span>Главный текст</span>
                  </div>
                </div>
                <ChartContainer
                  config={{
                    value: {
                      label: 'NXT',
                      color: 'hsl(var(--chart-1))',
                    },
                  }}
                  className='h-[200px]'
                >
                  <ResponsiveContainer width='100%' height='100%'>
                    <BarChart data={botcoinData}>
                      <CartesianGrid strokeDasharray='3 3' />
                      <XAxis dataKey='date' />
                      <YAxis domain={[0, 0.05]} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey='value' fill='var(--color-value)' />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
                <div className='text-xs text-muted-foreground mt-2'>
                  Отображается только расходы, превышающие 0.01 NXT
                </div>
              </CardContent>
            </Card>

            {/* Dialogs and Messages Chart */}
            <Card>
              <CardHeader className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
                <CardTitle className='text-lg font-medium'>
                  Диалоги и сообщения
                </CardTitle>
                <Button
                  variant='outline'
                  size='sm'
                  className='flex items-center gap-2 bg-transparent text-sm'
                >
                  <Calendar className='h-4 w-4' />
                  <span className='hidden sm:inline'>01/06/25 - 01/07/25</span>
                  <span className='sm:hidden'>Период</span>
                  <ChevronDown className='h-4 w-4' />
                </Button>
              </CardHeader>
              <CardContent>
                <div className='flex flex-wrap items-center gap-4 mb-4 text-sm'>
                  <div className='flex items-center gap-2'>
                    <div className='w-3 h-3 bg-blue-500 rounded-full'></div>
                    <span>Сообщения: 4</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <div className='w-3 h-3 bg-purple-500 rounded-full'></div>
                    <span>Диалоги: 1</span>
                  </div>
                </div>
                <ChartContainer
                  config={{
                    messages: {
                      label: 'Сообщения',
                      color: 'hsl(var(--chart-2))',
                    },
                    dialogs: {
                      label: 'Диалоги',
                      color: 'hsl(var(--chart-1))',
                    },
                  }}
                  className='h-[200px]'
                >
                  <ResponsiveContainer width='100%' height='100%'>
                    <BarChart data={dialogsData}>
                      <CartesianGrid strokeDasharray='3 3' />
                      <XAxis dataKey='date' />
                      <YAxis domain={[0, 8]} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey='messages' fill='var(--color-messages)' />
                      <Bar dataKey='dialogs' fill='var(--color-dialogs)' />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Functions Executed Chart */}
            <Card>
              <CardHeader className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
                <CardTitle className='text-lg font-medium'>
                  Выполнено функций
                </CardTitle>
                <Button
                  variant='outline'
                  size='sm'
                  className='flex items-center gap-2 bg-transparent text-sm'
                >
                  <Calendar className='h-4 w-4' />
                  <span className='hidden sm:inline'>01/06/25 - 01/07/25</span>
                  <span className='sm:hidden'>Период</span>
                  <ChevronDown className='h-4 w-4' />
                </Button>
              </CardHeader>
              <CardContent>
                <div className='flex items-center gap-2 mb-4 text-sm'>
                  <div className='w-3 h-3 bg-purple-500 rounded-full'></div>
                  <span>Выполнено функций: 0</span>
                </div>
                <ChartContainer
                  config={{
                    functions: {
                      label: 'Функции',
                      color: 'hsl(var(--chart-1))',
                    },
                  }}
                  className='h-[200px]'
                >
                  <ResponsiveContainer width='100%' height='100%'>
                    <BarChart data={functionsData}>
                      <CartesianGrid strokeDasharray='3 3' />
                      <XAxis dataKey='date' />
                      <YAxis domain={[0, 4]} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey='functions' fill='var(--color-functions)' />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Tokens Chart */}
            <Card>
              <CardHeader className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
                <CardTitle className='text-lg font-medium'>Токены</CardTitle>
                <Button
                  variant='outline'
                  size='sm'
                  className='flex items-center gap-2 bg-transparent text-sm'
                >
                  <Calendar className='h-4 w-4' />
                  <span className='hidden sm:inline'>01/06/25 - 01/07/25</span>
                  <span className='sm:hidden'>Период</span>
                  <ChevronDown className='h-4 w-4' />
                </Button>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4 text-xs'>
                  <div className='flex items-center gap-2'>
                    <div className='w-3 h-3 bg-green-500 rounded-full'></div>
                    <span>Входящие токены GPT-4o-mini: 0</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <div className='w-3 h-3 bg-blue-500 rounded-full'></div>
                    <span>Исходящие токены GPT-4o-mini: 0</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <div className='w-3 h-3 bg-purple-500 rounded-full'></div>
                    <span>Входящие токены GPT-4: 0</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <div className='w-3 h-3 bg-orange-500 rounded-full'></div>
                    <span>Исходящие токены GPT-4: 0</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <div className='w-3 h-3 bg-red-500 rounded-full'></div>
                    <span>Входящие токены GPT-o3-mini: 0</span>
                  </div>
                </div>
                <ChartContainer
                  config={{
                    'gpt-4o-mini-incoming': {
                      label: 'GPT-4o-mini входящие',
                      color: 'hsl(var(--chart-3))',
                    },
                    'gpt-4o-mini-outgoing': {
                      label: 'GPT-4o-mini исходящие',
                      color: 'hsl(var(--chart-2))',
                    },
                    'gpt-4-incoming': {
                      label: 'GPT-4 входящие',
                      color: 'hsl(var(--chart-1))',
                    },
                    'gpt-4-outgoing': {
                      label: 'GPT-4 исходящие',
                      color: 'hsl(var(--chart-4))',
                    },
                    'gpt-o3-mini-incoming': {
                      label: 'GPT-o3-mini входящие',
                      color: 'hsl(var(--chart-5))',
                    },
                  }}
                  className='h-[200px]'
                >
                  <ResponsiveContainer width='100%' height='100%'>
                    <LineChart data={tokensData}>
                      <CartesianGrid strokeDasharray='3 3' />
                      <XAxis dataKey='date' />
                      <YAxis domain={[0, 4]} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type='monotone'
                        dataKey='gpt-4o-mini-incoming'
                        stroke='var(--color-gpt-4o-mini-incoming)'
                      />
                      <Line
                        type='monotone'
                        dataKey='gpt-4o-mini-outgoing'
                        stroke='var(--color-gpt-4o-mini-outgoing)'
                      />
                      <Line
                        type='monotone'
                        dataKey='gpt-4-incoming'
                        stroke='var(--color-gpt-4-incoming)'
                      />
                      <Line
                        type='monotone'
                        dataKey='gpt-4-outgoing'
                        stroke='var(--color-gpt-4-outgoing)'
                      />
                      <Line
                        type='monotone'
                        dataKey='gpt-o3-mini-incoming'
                        stroke='var(--color-gpt-o3-mini-incoming)'
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
