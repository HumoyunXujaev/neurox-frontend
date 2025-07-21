'use client';

import type React from 'react';

import { useState } from 'react';
import { Header } from '@/components/header';
import { Sidebar } from '@/components/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Database,
  FileText,
  Globe,
  Table,
  Upload,
  AlertTriangle,
  HelpCircle,
  Info,
  Plus,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

type KnowledgeSection =
  | 'main'
  | 'database'
  | 'documents'
  | 'openai-docs'
  | 'web-search'
  | 'tables'
  | 'document-upload';

interface KnowledgeItem {
  id: string;
  name: string;
  content: string;
  tokens: number;
}

export default function KnowledgePage() {
  const [currentSection, setCurrentSection] =
    useState<KnowledgeSection>('main');
  const [knowledgeEnabled, setKnowledgeEnabled] = useState(false);
  const [maxResults, setMaxResults] = useState([3]);
  const [minSimilarity, setMinSimilarity] = useState([25]);
  const [smartSearch, setSmartSearch] = useState(false);
  const [resultReranking, setResultReranking] = useState(false);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [searchQuality, setSearchQuality] = useState('medium');
  const [fileSearchEnabled, setFileSearchEnabled] = useState(false);
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        toast.success(`Файл ${file.name} загружен`);
      });
    }
  };

  const renderBreadcrumb = () => {
    const breadcrumbs = [
      { label: 'Источники знаний', section: 'main' as KnowledgeSection },
    ];

    if (currentSection === 'database') {
      breadcrumbs.push({
        label: 'База знаний',
        section: 'database' as KnowledgeSection,
      });
    } else if (currentSection === 'documents') {
      breadcrumbs.push({
        label: 'Документы',
        section: 'documents' as KnowledgeSection,
      });
    } else if (currentSection === 'openai-docs') {
      breadcrumbs.push({
        label: 'OpenAI документы',
        section: 'openai-docs' as KnowledgeSection,
      });
    } else if (currentSection === 'web-search') {
      breadcrumbs.push({
        label: 'OpenAI веб-поиск',
        section: 'web-search' as KnowledgeSection,
      });
    } else if (currentSection === 'tables') {
      breadcrumbs.push({
        label: 'Таблицы',
        section: 'tables' as KnowledgeSection,
      });
    } else if (currentSection === 'document-upload') {
      breadcrumbs.push({
        label: 'Загрузка документа',
        section: 'document-upload' as KnowledgeSection,
      });
    }

    return (
      <div className='flex items-center gap-2 text-sm text-muted-foreground mb-4 md:mb-6'>
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.section} className='flex items-center gap-2'>
            {index > 0 && <span>/</span>}
            <button
              onClick={() => setCurrentSection(crumb.section)}
              className={`hover:text-foreground ${
                currentSection === crumb.section
                  ? 'text-foreground font-medium'
                  : ''
              }`}
            >
              {crumb.label}
            </button>
          </div>
        ))}
      </div>
    );
  };

  const renderMainSection = () => (
    <div className='space-y-4 md:space-y-6'>
      {renderBreadcrumb()}

      {/* Premium Warning */}
      <Alert className='bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-600'>
        <AlertTriangle className='h-4 w-4 text-amber-600' />
        <AlertDescription className='text-amber-800 dark:text-amber-200'>
          <strong>Премиум-функции</strong>
          <br />
          Для доступа к этой функции необходим тариф Премиум. Для получения
          доступа купите{' '}
          <Link
            href='/account?tab=subscription'
            className='text-purple-600 hover:text-purple-700 underline'
          >
            соответствующую подписку
          </Link>
          .
        </AlertDescription>
      </Alert>

      {/* Knowledge Source Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6'>
        {/* База знаний */}
        <Card
          className='cursor-pointer hover:shadow-md transition-shadow'
          onClick={() => setCurrentSection('database')}
        >
          <CardHeader className='pb-4'>
            <div className='flex items-center gap-3 mb-3'>
              <div className='p-2 bg-purple-100 dark:bg-purple-900 rounded-lg'>
                <Database className='h-6 w-6 text-purple-600 dark:text-purple-400' />
              </div>
              <CardTitle className='text-lg'>База знаний</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className='space-y-2 text-sm text-muted-foreground'>
              <p>Ручное создание и организация ключевой информации.</p>
              <ul className='space-y-1'>
                <li>• Точный контроль над каждым фрагментом данных</li>
                <li>• Релевантные данные подтягиваются на каждый запрос</li>
                <li>• Идеально для FAQ, регламентов, скриптов продаж</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Документы */}
        <Card
          className='cursor-pointer hover:shadow-md transition-shadow'
          onClick={() => setCurrentSection('documents')}
        >
          <CardHeader className='pb-4'>
            <div className='flex items-center gap-3 mb-3'>
              <div className='p-2 bg-blue-100 dark:bg-blue-900 rounded-lg'>
                <FileText className='h-6 w-6 text-blue-600 dark:text-blue-400' />
              </div>
              <CardTitle className='text-lg'>Документы</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className='space-y-2 text-sm text-muted-foreground'>
              <p>
                Быстрая загрузка ключевой информации из файлов без ручной
                обработки.
              </p>
              <ul className='space-y-1'>
                <li>• Автоматическое разделение на фрагменты</li>
                <li>• Релевантные данные подтягиваются на каждый запрос</li>
                <li>• Для быстрого тестирования гипотез</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Документы OpenAI */}
        <Card
          className='cursor-pointer hover:shadow-md transition-shadow'
          onClick={() => setCurrentSection('openai-docs')}
        >
          <CardHeader className='pb-4'>
            <div className='flex items-center gap-3 mb-3'>
              <div className='p-2 bg-green-100 dark:bg-green-900 rounded-lg'>
                <FileText className='h-6 w-6 text-green-600 dark:text-green-400' />
              </div>
              <CardTitle className='text-lg'>Документы OpenAI</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className='space-y-2 text-sm text-muted-foreground'>
              <p>Документы по запросу без перегрузки контекста.</p>
              <ul className='space-y-1'>
                <li>• Агент сам решает, когда обращаться к документации</li>
                <li>• Экономия на токенах и ресурсах</li>
                <li>• Надежное решение для больших массивов данных</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Веб-поиск */}
        <Card
          className='cursor-pointer hover:shadow-md transition-shadow'
          onClick={() => setCurrentSection('web-search')}
        >
          <CardHeader className='pb-4'>
            <div className='flex items-center gap-3 mb-3'>
              <div className='p-2 bg-orange-100 dark:bg-orange-900 rounded-lg'>
                <Globe className='h-6 w-6 text-orange-600 dark:text-orange-400' />
              </div>
              <CardTitle className='text-lg'>Веб-поиск</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className='space-y-2 text-sm text-muted-foreground'>
              <p>Доступ агента к актуальной информации в интернете.</p>
              <ul className='space-y-1'>
                <li>• Самостоятельный поиск свежих данных</li>
                <li>• Ответы на вопросы, требующие актуальности</li>
                <li>• Для работы с ценами, новостями, тенденциями рынка</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Таблицы */}
        <Card
          className='cursor-pointer hover:shadow-md transition-shadow'
          onClick={() => setCurrentSection('tables')}
        >
          <CardHeader className='pb-4'>
            <div className='flex items-center gap-3 mb-3'>
              <div className='p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg'>
                <Table className='h-6 w-6 text-indigo-600 dark:text-indigo-400' />
              </div>
              <div className='flex items-center gap-2'>
                <CardTitle className='text-lg'>Таблицы</CardTitle>
                <Badge
                  variant='secondary'
                  className='bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
                >
                  Beta
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className='space-y-2 text-sm text-muted-foreground'>
              <p>Структурированные данные с комбинированным поиском.</p>
              <ul className='space-y-1'>
                <li>• Точная фильтрация по параметрам (цена, категория)</li>
                <li>• Интеллектуальный поиск по смыслу в описаниях</li>
                <li>• Идеально для прайс-листов и каталогов продукции</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderDatabaseSection = () => (
    <div className='space-y-4 md:space-y-6'>
      {renderBreadcrumb()}

      <Card>
        <CardHeader className='flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0'>
          <CardTitle className='text-lg'>Настройки базы знаний</CardTitle>
          <div className='flex items-center gap-2'>
            <HelpCircle className='h-4 w-4 text-muted-foreground' />
            <Button variant='ghost' size='icon' className='h-8 w-8'>
              <Info className='h-4 w-4' />
            </Button>
          </div>
        </CardHeader>
        <CardContent className='space-y-4 md:space-y-6'>
          {/* Включить базу знаний */}
          <div className='space-y-3'>
            <div className='flex items-center space-x-2'>
              <Switch
                id='knowledge-enabled'
                checked={knowledgeEnabled}
                onCheckedChange={setKnowledgeEnabled}
              />
              <Label htmlFor='knowledge-enabled' className='font-medium'>
                Включить базу знаний
              </Label>
            </div>
            <div className='text-sm text-muted-foreground'>
              Когда включено, агент сможет искать информацию в базе знаний.
              <br />
              Найденные фрагменты будут добавлены в контекст Агента. И при
              необходимости будут использоваться для генерации ответов.
            </div>
          </div>

          {/* Максимальное число результатов */}
          <div className='space-y-4'>
            <div className='flex items-center gap-2'>
              <Label className='font-medium'>
                Максимальное число результатов
              </Label>
            </div>
            <div className='text-sm text-muted-foreground mb-3'>
              Определяет, сколько фрагментов(знаний) будет извлечено при поиске.
            </div>
            <div className='space-y-2'>
              <div className='text-sm'>Число результатов: {maxResults[0]}</div>
              <Slider
                value={maxResults}
                onValueChange={setMaxResults}
                max={50}
                min={1}
                step={1}
                className='w-full'
              />
              <div className='flex justify-between text-xs text-muted-foreground'>
                <span>1</span>
                <span>10</span>
                <span>20</span>
                <span>30</span>
                <span>40</span>
                <span>50</span>
              </div>
            </div>
            <div className='text-xs text-purple-600 flex items-start gap-2'>
              <Info className='h-3 w-3 mt-0.5 flex-shrink-0' />
              <span>
                Рекомендации по выбору числа результатов
                <br />
                Установите максимальное количество фрагментов(знаний), которые
                агент получит при поиске в файлах. Рекомендуется начинать с
                небольших значений (1-5) и увеличивать их при необходимости.
                Большая база знаний может требовать большего числа результатов.
              </span>
            </div>
          </div>

          {/* Минимальный процент совпадений */}
          <div className='space-y-4'>
            <div className='flex items-center gap-2'>
              <Label className='font-medium'>
                Минимальный процент совпадений
              </Label>
            </div>
            <div className='text-sm text-muted-foreground mb-3'>
              Определяет, насколько сильно должен совпадать фрагмент по смыслу,
              чтобы быть включённым в результаты поиска.
            </div>
            <div className='space-y-2'>
              <div className='text-sm'>
                Процент совпадений: {minSimilarity[0]}%
              </div>
              <Slider
                value={minSimilarity}
                onValueChange={setMinSimilarity}
                max={100}
                min={1}
                step={1}
                className='w-full'
              />
              <div className='flex justify-between text-xs text-muted-foreground'>
                <span>1%</span>
                <span>20%</span>
                <span>40%</span>
                <span>60%</span>
                <span>80%</span>
                <span>100%</span>
              </div>
            </div>
            <div className='text-xs text-purple-600 flex items-start gap-2'>
              <Info className='h-3 w-3 mt-0.5 flex-shrink-0' />
              <span>
                Средний порог: Компромисс
                <br />В этом диапазоне система старается отсекать наименее
                релевантные фрагменты, но сохранит те, что имеют достаточное
                смысловое совпадение. Это компромисс между полнотой и точностью
                результатов. Баланс точности будет умеренным и зависит от
                количества проходящих фильтр фрагментов.
              </span>
            </div>
          </div>

          {/* Умный поиск */}
          <div className='space-y-3'>
            <div className='flex items-center space-x-2'>
              <Switch
                id='smart-search'
                checked={smartSearch}
                onCheckedChange={setSmartSearch}
              />
              <Label htmlFor='smart-search' className='font-medium'>
                Включить умный поиск
              </Label>
            </div>
            <div className='text-sm text-muted-foreground'>
              Агент объединяет несколько последних сообщений пользователя в свои
              ответы в один общий вопрос, чтобы выполнить более точный поиск по
              базе знаний.
            </div>
          </div>

          {/* Переоценка результатов */}
          <div className='space-y-3'>
            <div className='flex items-center space-x-2'>
              <Switch
                id='result-reranking'
                checked={resultReranking}
                onCheckedChange={setResultReranking}
              />
              <Label htmlFor='result-reranking' className='font-medium'>
                Включить переоценку результатов
              </Label>
            </div>
            <div className='text-sm text-muted-foreground'>
              Агент выполняет дополнительную проверку найденных фрагментов для
              повышения точности и релевантности ответов. ЭТО НЕ значительно
              улучшает качество поиска, но увеличивает время ответа и стоимость.
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Knowledge Items Table */}
      <Card>
        <CardHeader className='flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0'>
          <div className='flex flex-col sm:flex-row items-start sm:items-center gap-3'>
            <Button className='bg-purple-600 hover:bg-purple-700 w-full sm:w-auto'>
              <Plus className='mr-2 h-4 w-4' />
              ДОБАВИТЬ ЗНАНИЕ
            </Button>
            <span className='text-sm text-muted-foreground'>Поиск</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div className='hidden md:grid grid-cols-4 gap-4 text-sm font-medium text-muted-foreground border-b pb-2'>
              <div>Имя</div>
              <div>Контент</div>
              <div>Токены</div>
              <div></div>
            </div>
            {knowledgeItems.length === 0 ? (
              <div className='text-center py-8 text-muted-foreground'>
                Нет строк
              </div>
            ) : (
              knowledgeItems.map((item) => (
                <div
                  key={item.id}
                  className='grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-4 text-sm py-2 border-b'
                >
                  <div className='font-medium md:font-normal'>
                    <span className='md:hidden text-muted-foreground'>
                      Имя:{' '}
                    </span>
                    {item.name}
                  </div>
                  <div className='truncate'>
                    <span className='md:hidden text-muted-foreground'>
                      Контент:{' '}
                    </span>
                    {item.content}
                  </div>
                  <div>
                    <span className='md:hidden text-muted-foreground'>
                      Токены:{' '}
                    </span>
                    {item.tokens}
                  </div>
                  <div className='flex gap-2'>
                    <Button variant='outline' size='sm'>
                      Редактировать
                    </Button>
                    <Button variant='destructive' size='sm'>
                      Удалить
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          <div className='flex flex-col sm:flex-row items-center justify-between gap-4 mt-6'>
            <div className='text-sm text-muted-foreground'>
              Показано{' '}
              {Math.min(
                (currentPage - 1) * itemsPerPage + 1,
                knowledgeItems.length
              )}{' '}
              - {Math.min(currentPage * itemsPerPage, knowledgeItems.length)} из{' '}
              {knowledgeItems.length} строк
            </div>
            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className='h-4 w-4' />
                Предыдущая
              </Button>
              <span className='text-sm'>
                Страница {currentPage} из{' '}
                {Math.ceil(knowledgeItems.length / itemsPerPage) || 1}
              </span>
              <Button
                variant='outline'
                size='sm'
                onClick={() =>
                  setCurrentPage(
                    Math.min(
                      Math.ceil(knowledgeItems.length / itemsPerPage),
                      currentPage + 1
                    )
                  )
                }
                disabled={
                  currentPage >= Math.ceil(knowledgeItems.length / itemsPerPage)
                }
              >
                Следующая
                <ChevronRight className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderDocumentsSection = () => (
    <div className='space-y-4 md:space-y-6'>
      {renderBreadcrumb()}

      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>Загрузка документов</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 md:p-8 text-center'>
            <Upload className='h-8 w-8 mx-auto mb-4 text-muted-foreground' />
            <div className='space-y-2'>
              <p className='text-sm text-muted-foreground'>
                Перетащите файлы сюда или
              </p>
              <Label htmlFor='file-upload' className='cursor-pointer'>
                <Button
                  variant='outline'
                  className='bg-purple-600 hover:bg-purple-700 text-white'
                >
                  Выберите файлы
                </Button>
                <Input
                  id='file-upload'
                  type='file'
                  multiple
                  className='hidden'
                  accept='.pdf,.doc,.docx,.txt'
                  onChange={handleFileUpload}
                />
              </Label>
            </div>
            <p className='text-xs text-muted-foreground mt-2'>
              Поддерживаемые форматы: PDF, DOC, DOCX, TXT (максимум 10 МБ)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderOpenAIDocsSection = () => (
    <div className='space-y-4 md:space-y-6'>
      {renderBreadcrumb()}

      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>Настройки документов OpenAI</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-3'>
            <div className='flex items-center space-x-2'>
              <Switch
                id='file-search'
                checked={fileSearchEnabled}
                onCheckedChange={setFileSearchEnabled}
              />
              <Label htmlFor='file-search' className='font-medium'>
                Включить поиск по файлам
              </Label>
            </div>
            <div className='text-sm text-muted-foreground'>
              Агент сможет самостоятельно искать информацию в загруженных
              документах при необходимости.
            </div>
          </div>

          <div className='border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 md:p-8 text-center'>
            <FileText className='h-8 w-8 mx-auto mb-4 text-muted-foreground' />
            <div className='space-y-2'>
              <p className='text-sm text-muted-foreground'>
                Загрузите документы для OpenAI
              </p>
              <Label htmlFor='openai-file-upload' className='cursor-pointer'>
                <Button
                  variant='outline'
                  className='bg-purple-600 hover:bg-purple-700 text-white'
                >
                  Выберите файлы
                </Button>
                <Input
                  id='openai-file-upload'
                  type='file'
                  multiple
                  className='hidden'
                  accept='.pdf,.doc,.docx,.txt'
                  onChange={handleFileUpload}
                />
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderWebSearchSection = () => (
    <div className='space-y-4 md:space-y-6'>
      {renderBreadcrumb()}

      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>Настройки веб-поиска</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4 md:space-y-6'>
          <div className='space-y-3'>
            <div className='flex items-center space-x-2'>
              <Switch
                id='web-search'
                checked={webSearchEnabled}
                onCheckedChange={setWebSearchEnabled}
              />
              <Label htmlFor='web-search' className='font-medium'>
                Включить веб-поиск
              </Label>
            </div>
            <div className='text-sm text-muted-foreground'>
              Агент сможет искать актуальную информацию в интернете для ответов
              на вопросы пользователей.
            </div>
          </div>

          <div className='space-y-3'>
            <Label className='font-medium'>Качество поиска</Label>
            <RadioGroup value={searchQuality} onValueChange={setSearchQuality}>
              <div className='flex items-center space-x-2'>
                <RadioGroupItem value='low' id='low' />
                <Label htmlFor='low'>Низкое (быстро, дешево)</Label>
              </div>
              <div className='flex items-center space-x-2'>
                <RadioGroupItem value='medium' id='medium' />
                <Label htmlFor='medium'>Среднее (баланс)</Label>
              </div>
              <div className='flex items-center space-x-2'>
                <RadioGroupItem value='high' id='high' />
                <Label htmlFor='high'>Высокое (медленно, дорого)</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTablesSection = () => (
    <div className='space-y-4 md:space-y-6'>
      {renderBreadcrumb()}

      <Card>
        <CardHeader className='flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0'>
          <div className='flex items-center gap-2'>
            <CardTitle className='text-lg'>Таблицы</CardTitle>
            <Badge
              variant='secondary'
              className='bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
            >
              Beta
            </Badge>
          </div>
          <Button className='bg-purple-600 hover:bg-purple-700 w-full sm:w-auto'>
            <Plus className='mr-2 h-4 w-4' />
            СОЗДАТЬ ТАБЛИЦУ
          </Button>
        </CardHeader>
        <CardContent>
          <div className='text-center py-8 text-muted-foreground'>
            <Table className='h-12 w-12 mx-auto mb-4 opacity-50' />
            <p>Таблицы не созданы</p>
            <p className='text-sm mt-2'>
              Создайте первую таблицу для структурированного хранения данных
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (currentSection) {
      case 'main':
        return renderMainSection();
      case 'database':
        return renderDatabaseSection();
      case 'documents':
        return renderDocumentsSection();
      case 'openai-docs':
        return renderOpenAIDocsSection();
      case 'web-search':
        return renderWebSearchSection();
      case 'tables':
        return renderTablesSection();
      default:
        return renderMainSection();
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
          <div className='p-4 md:p-6'>
            <div className='max-w-7xl mx-auto'>{renderContent()}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
