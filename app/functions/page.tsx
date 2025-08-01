'use client';

import { useState } from 'react';
import { Header } from '@/components/header';
import { Sidebar } from '@/components/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Plus,
  Settings,
  Trash2,
  Edit,
  AlertTriangle,
  Info,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface FunctionParameter {
  name: string;
  type: string;
  description: string;
  required: boolean;
  validation?: string;
}

interface CustomFunction {
  id: string;
  name: string;
  description: string;
  parameters: FunctionParameter[];
  enabled: boolean;
  createdAt: string;
}

export default function FunctionsPage() {
  const [functions, setFunctions] = useState<CustomFunction[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingFunction, setEditingFunction] = useState<CustomFunction | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Form state
  const [functionName, setFunctionName] = useState('');
  const [functionDescription, setFunctionDescription] = useState('');
  const [parameters, setParameters] = useState<FunctionParameter[]>([
    { name: '', type: 'string', description: '', required: false },
  ]);

  const handleCreateFunction = () => {
    if (!functionName.trim() || !functionDescription.trim()) {
      toast.error('Заполните все обязательные поля');
      return;
    }

    const newFunction: CustomFunction = {
      id: Date.now().toString(),
      name: functionName,
      description: functionDescription,
      parameters: parameters.filter((p) => p.name.trim() !== ''),
      enabled: true,
      createdAt: new Date().toISOString(),
    };

    setFunctions([...functions, newFunction]);
    setShowCreateDialog(false);
    resetForm();
    toast.success('Функция успешно создана');
  };

  const handleEditFunction = () => {
    if (
      !editingFunction ||
      !functionName.trim() ||
      !functionDescription.trim()
    ) {
      toast.error('Заполните все обязательные поля');
      return;
    }

    const updatedFunction: CustomFunction = {
      ...editingFunction,
      name: functionName,
      description: functionDescription,
      parameters: parameters.filter((p) => p.name.trim() !== ''),
    };

    setFunctions(
      functions.map((f) => (f.id === editingFunction.id ? updatedFunction : f))
    );
    setShowEditDialog(false);
    setEditingFunction(null);
    resetForm();
    toast.success('Функция успешно обновлена');
  };

  const handleDeleteFunction = (id: string) => {
    setFunctions(functions.filter((f) => f.id !== id));
    toast.success('Функция удалена');
  };

  const handleToggleFunction = (id: string) => {
    setFunctions(
      functions.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f))
    );
  };

  const resetForm = () => {
    setFunctionName('');
    setFunctionDescription('');
    setParameters([
      { name: '', type: 'string', description: '', required: false },
    ]);
  };

  const addParameter = () => {
    setParameters([
      ...parameters,
      { name: '', type: 'string', description: '', required: false },
    ]);
  };

  const removeParameter = (index: number) => {
    if (parameters.length > 1) {
      setParameters(parameters.filter((_, i) => i !== index));
    }
  };

  const updateParameter = (
    index: number,
    field: keyof FunctionParameter,
    value: string | boolean
  ) => {
    const updated = [...parameters];
    updated[index] = { ...updated[index], [field]: value };
    setParameters(updated);
  };

  const openEditDialog = (func: CustomFunction) => {
    setEditingFunction(func);
    setFunctionName(func.name);
    setFunctionDescription(func.description);
    setParameters(
      func.parameters.length > 0
        ? func.parameters
        : [{ name: '', type: 'string', description: '', required: false }]
    );
    setShowEditDialog(true);
  };

  const renderParameterForm = () => (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <Label className='text-base font-medium'>Параметры функции</Label>
        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={addParameter}
        >
          <Plus className='h-4 w-4 mr-2' />
          Добавить параметр
        </Button>
      </div>

      {parameters.map((param, index) => (
        <Card key={index} className='p-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor={`param-name-${index}`}>
                Название параметра *
                {!param.name.trim() && (
                  <span className='text-red-500 ml-1'>⚠</span>
                )}
              </Label>
              <Input
                id={`param-name-${index}`}
                value={param.name}
                onChange={(e) => updateParameter(index, 'name', e.target.value)}
                placeholder='Введите название параметра'
                className={!param.name.trim() ? 'border-red-500' : ''}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor={`param-type-${index}`}>Тип данных</Label>
              <Select
                value={param.type}
                onValueChange={(value) => updateParameter(index, 'type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='string'>Строка</SelectItem>
                  <SelectItem value='number'>Число</SelectItem>
                  <SelectItem value='boolean'>Логический</SelectItem>
                  <SelectItem value='array'>Массив</SelectItem>
                  <SelectItem value='object'>Объект</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2 md:col-span-2'>
              <Label htmlFor={`param-desc-${index}`}>
                Описание параметра *
                {!param.description.trim() && (
                  <span className='text-red-500 ml-1'>⚠</span>
                )}
              </Label>
              <Textarea
                id={`param-desc-${index}`}
                value={param.description}
                onChange={(e) =>
                  updateParameter(index, 'description', e.target.value)
                }
                placeholder='Опишите назначение параметра'
                className={!param.description.trim() ? 'border-red-500' : ''}
                rows={2}
              />
            </div>

            <div className='flex items-center justify-between md:col-span-2'>
              <div className='flex items-center space-x-2'>
                <Switch
                  id={`param-required-${index}`}
                  checked={param.required}
                  onCheckedChange={(checked) =>
                    updateParameter(index, 'required', checked)
                  }
                />
                <Label htmlFor={`param-required-${index}`}>
                  Обязательный параметр
                </Label>
              </div>

              {parameters.length > 1 && (
                <Button
                  type='button'
                  variant='destructive'
                  size='sm'
                  onClick={() => removeParameter(index)}
                >
                  <Trash2 className='h-4 w-4' />
                </Button>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  const paginatedFunctions = functions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
            <div className='max-w-7xl mx-auto space-y-4 md:space-y-6'>
              {/* Premium Warning */}
              <Alert className='bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-600'>
                <AlertTriangle className='h-4 w-4 text-amber-600' />
                <AlertDescription className='text-amber-800 dark:text-amber-200'>
                  <strong>Премиум-функции</strong>
                  <br />
                  Для доступа к этой функции необходим тариф Премиум. Для
                  получения доступа купите{' '}
                  <Link
                    href='/account?tab=subscription'
                    className='text-purple-600 hover:text-purple-700 underline'
                  >
                    соответствующую подписку.
                  </Link>
                </AlertDescription>
              </Alert>

              {/* Header */}
              <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
                <div>
                  <h1 className='text-2xl md:text-3xl font-bold'>Функции</h1>
                  <p className='text-muted-foreground text-sm md:text-base'>
                    Создавайте пользовательские функции для расширения
                    возможностей ваших агентов
                  </p>
                </div>
                <Button
                  onClick={() => setShowCreateDialog(true)}
                  className='bg-purple-600 hover:bg-purple-700 w-full sm:w-auto'
                >
                  <Plus className='mr-2 h-4 w-4' />
                  СОЗДАТЬ ФУНКЦИЮ
                </Button>
              </div>

              {/* Functions Table */}
              <Card>
                <CardHeader>
                  <CardTitle className='text-lg'>Список функций</CardTitle>
                </CardHeader>
                <CardContent>
                  {functions.length === 0 ? (
                    <div className='text-center py-8 text-muted-foreground'>
                      <Settings className='h-12 w-12 mx-auto mb-4 opacity-50' />
                      <p>Функции не созданы</p>
                      <p className='text-sm mt-2'>
                        Создайте первую функцию для расширения возможностей
                        агентов
                      </p>
                    </div>
                  ) : (
                    <div className='space-y-4'>
                      {/* Desktop Table */}
                      <div className='hidden md:block'>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Название</TableHead>
                              <TableHead>Описание</TableHead>
                              <TableHead>Параметры</TableHead>
                              <TableHead>Статус</TableHead>
                              <TableHead>Создано</TableHead>
                              <TableHead className='text-right'>
                                Действия
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {paginatedFunctions.map((func) => (
                              <TableRow key={func.id}>
                                <TableCell className='font-medium'>
                                  {func.name}
                                </TableCell>
                                <TableCell className='max-w-xs truncate'>
                                  {func.description}
                                </TableCell>
                                <TableCell>
                                  <Badge variant='secondary'>
                                    {func.parameters.length} параметр(ов)
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className='flex items-center gap-2'>
                                    <Switch
                                      checked={func.enabled}
                                      onCheckedChange={() =>
                                        handleToggleFunction(func.id)
                                      }
                                    />
                                    <span className='text-sm'>
                                      {func.enabled ? 'Включена' : 'Отключена'}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className='text-sm text-muted-foreground'>
                                  {new Date(
                                    func.createdAt
                                  ).toLocaleDateString()}
                                </TableCell>
                                <TableCell className='text-right'>
                                  <div className='flex items-center gap-2 justify-end'>
                                    <Button
                                      variant='outline'
                                      size='sm'
                                      onClick={() => openEditDialog(func)}
                                    >
                                      <Edit className='h-4 w-4' />
                                    </Button>
                                    <Button
                                      variant='destructive'
                                      size='sm'
                                      onClick={() =>
                                        handleDeleteFunction(func.id)
                                      }
                                    >
                                      <Trash2 className='h-4 w-4' />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Mobile Cards */}
                      <div className='md:hidden space-y-4'>
                        {paginatedFunctions.map((func) => (
                          <Card key={func.id}>
                            <CardContent className='p-4 space-y-3'>
                              <div className='flex items-start justify-between'>
                                <div>
                                  <h3 className='font-medium'>{func.name}</h3>
                                  <p className='text-sm text-muted-foreground mt-1'>
                                    {func.description}
                                  </p>
                                </div>
                                <div className='flex items-center gap-2'>
                                  <Switch
                                    checked={func.enabled}
                                    onCheckedChange={() =>
                                      handleToggleFunction(func.id)
                                    }
                                  />
                                </div>
                              </div>

                              <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                                <Badge variant='secondary'>
                                  {func.parameters.length} параметр(ов)
                                </Badge>
                                <span>
                                  {new Date(
                                    func.createdAt
                                  ).toLocaleDateString()}
                                </span>
                              </div>

                              <div className='flex gap-2 pt-2'>
                                <Button
                                  variant='outline'
                                  size='sm'
                                  onClick={() => openEditDialog(func)}
                                  className='flex-1'
                                >
                                  <Edit className='h-4 w-4 mr-2' />
                                  Редактировать
                                </Button>
                                <Button
                                  variant='destructive'
                                  size='sm'
                                  onClick={() => handleDeleteFunction(func.id)}
                                  className='flex-1'
                                >
                                  <Trash2 className='h-4 w-4 mr-2' />
                                  Удалить
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      {/* Pagination */}
                      {functions.length > itemsPerPage && (
                        <div className='flex flex-col sm:flex-row items-center justify-between gap-4 mt-6'>
                          <div className='text-sm text-muted-foreground'>
                            Показано{' '}
                            {Math.min(
                              (currentPage - 1) * itemsPerPage + 1,
                              functions.length
                            )}{' '}
                            -{' '}
                            {Math.min(
                              currentPage * itemsPerPage,
                              functions.length
                            )}{' '}
                            из {functions.length} функций
                          </div>
                          <div className='flex items-center gap-2'>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() =>
                                setCurrentPage(Math.max(1, currentPage - 1))
                              }
                              disabled={currentPage === 1}
                            >
                              <ChevronLeft className='h-4 w-4' />
                              Предыдущая
                            </Button>
                            <span className='text-sm'>
                              Страница {currentPage} из{' '}
                              {Math.ceil(functions.length / itemsPerPage)}
                            </span>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() =>
                                setCurrentPage(
                                  Math.min(
                                    Math.ceil(functions.length / itemsPerPage),
                                    currentPage + 1
                                  )
                                )
                              }
                              disabled={
                                currentPage >=
                                Math.ceil(functions.length / itemsPerPage)
                              }
                            >
                              Следующая
                              <ChevronRight className='h-4 w-4' />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      {/* Create Function Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto mx-4'>
          <DialogHeader>
            <DialogTitle>Создать новую функцию</DialogTitle>
            <DialogDescription>
              Создайте пользовательскую функцию для расширения возможностей
              ваших агентов
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='function-name'>
                  Название функции *
                  {!functionName.trim() && (
                    <span className='text-red-500 ml-1'>⚠</span>
                  )}
                </Label>
                <Input
                  id='function-name'
                  value={functionName}
                  onChange={(e) => setFunctionName(e.target.value)}
                  placeholder='Введите название функции'
                  className={!functionName.trim() ? 'border-red-500' : ''}
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='function-description'>
                Описание функции *
                {!functionDescription.trim() && (
                  <span className='text-red-500 ml-1'>⚠</span>
                )}
              </Label>
              <Textarea
                id='function-description'
                value={functionDescription}
                onChange={(e) => setFunctionDescription(e.target.value)}
                placeholder='Опишите назначение и работу функции'
                className={!functionDescription.trim() ? 'border-red-500' : ''}
                rows={3}
              />
            </div>

            {renderParameterForm()}

            <Alert className='bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-600'>
              <Info className='h-4 w-4 text-blue-600' />
              <AlertDescription className='text-blue-800 dark:text-blue-200'>
                <strong>Совет:</strong> Четко опишите назначение функции и
                каждого параметра. Это поможет агенту правильно использовать
                функцию в диалогах.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter className='flex flex-col sm:flex-row gap-2'>
            <Button
              variant='outline'
              onClick={() => {
                setShowCreateDialog(false);
                resetForm();
              }}
            >
              Отмена
            </Button>
            <Button
              onClick={handleCreateFunction}
              className='bg-purple-600 hover:bg-purple-700'
            >
              Создать функцию
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Function Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto mx-4'>
          <DialogHeader>
            <DialogTitle>Редактировать функцию</DialogTitle>
            <DialogDescription>
              Внесите изменения в существующую функцию
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='edit-function-name'>
                  Название функции *
                  {!functionName.trim() && (
                    <span className='text-red-500 ml-1'>⚠</span>
                  )}
                </Label>
                <Input
                  id='edit-function-name'
                  value={functionName}
                  onChange={(e) => setFunctionName(e.target.value)}
                  placeholder='Введите название функции'
                  className={!functionName.trim() ? 'border-red-500' : ''}
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='edit-function-description'>
                Описание функции *
                {!functionDescription.trim() && (
                  <span className='text-red-500 ml-1'>⚠</span>
                )}
              </Label>
              <Textarea
                id='edit-function-description'
                value={functionDescription}
                onChange={(e) => setFunctionDescription(e.target.value)}
                placeholder='Опишите назначение и работу функции'
                className={!functionDescription.trim() ? 'border-red-500' : ''}
                rows={3}
              />
            </div>

            {renderParameterForm()}
          </div>

          <DialogFooter className='flex flex-col sm:flex-row gap-2'>
            <Button
              variant='outline'
              onClick={() => {
                setShowEditDialog(false);
                setEditingFunction(null);
                resetForm();
              }}
            >
              Отмена
            </Button>
            <Button
              onClick={handleEditFunction}
              className='bg-purple-600 hover:bg-purple-700'
            >
              Сохранить изменения
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
