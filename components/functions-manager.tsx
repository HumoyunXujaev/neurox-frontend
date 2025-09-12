'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  PlusCircle,
  Trash2,
  ChevronDown,
  ChevronUp,
  FileCode,
} from 'lucide-react';

// Типы для пропсов
interface FunctionParameter {
  name: string;
  data_type: 'string' | 'number' | 'boolean';
  description: string;
  is_optional: boolean;
  location: 'query-parameter' | 'path-parameter' | 'body' | 'header';
}

interface FunctionEndpoint {
  name: string;
  description: string;
  path: string;
  method: 'get' | 'post' | 'put' | 'patch' | 'delete';
  parameters: FunctionParameter[];
}

interface ApiConfig {
  base_url: string;
  authorization: string;
  endpoints: FunctionEndpoint[];
}

// --- Компонент для одного параметра ---
const FunctionParameterForm = ({
  param,
  apiIndex,
  endpointIndex,
  paramIndex,
  onChange,
  onRemove,
}: {
  param: FunctionParameter;
  apiIndex: number;
  endpointIndex: number;
  paramIndex: number;
  onChange: (
    apiIndex: number,
    endpointIndex: number,
    paramIndex: number,
    field: keyof FunctionParameter,
    value: any
  ) => void;
  onRemove: (
    apiIndex: number,
    endpointIndex: number,
    paramIndex: number
  ) => void;
}) => {
  const handleChange = (field: keyof FunctionParameter, value: any) => {
    onChange(apiIndex, endpointIndex, paramIndex, field, value);
  };

  return (
    <div className='p-3 border rounded-md bg-muted/30 space-y-3'>
      <div className='flex justify-between items-center'>
        <p className='text-xs font-semibold'>Параметр #{paramIndex + 1}</p>
        <Button
          variant='ghost'
          size='icon'
          className='h-6 w-6'
          onClick={() => onRemove(apiIndex, endpointIndex, paramIndex)}
        >
          <Trash2 className='h-3 w-3 text-destructive' />
        </Button>
      </div>
      <div className='grid grid-cols-2 gap-3'>
        <Input
          placeholder='Название (e.g., city)'
          value={param.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className='text-xs'
        />
        <Select
          value={param.data_type}
          onValueChange={(v) => handleChange('data_type', v)}
        >
          <SelectTrigger className='text-xs'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='string'>String</SelectItem>
            <SelectItem value='number'>Number</SelectItem>
            <SelectItem value='boolean'>Boolean</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={param.location}
          onValueChange={(v) => handleChange('location', v)}
        >
          <SelectTrigger className='text-xs'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='query-parameter'>Query</SelectItem>
            <SelectItem value='path-parameter'>Path</SelectItem>
            <SelectItem value='body'>Body</SelectItem>
            <SelectItem value='header'>Header</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Textarea
        placeholder='Описание для AI (e.g., Город для прогноза погоды)'
        value={param.description}
        onChange={(e) => handleChange('description', e.target.value)}
        className='text-xs min-h-[50px]'
      />
    </div>
  );
};

// --- Компонент для одного эндпоинта ---
const FunctionEndpointForm = ({
  endpoint,
  apiIndex,
  endpointIndex,
  onChange,
  onRemove,
}: {
  endpoint: FunctionEndpoint;
  apiIndex: number;
  endpointIndex: number;
  onChange: (
    apiIndex: number,
    endpointIndex: number,
    field: keyof FunctionEndpoint,
    value: any
  ) => void;
  onRemove: (apiIndex: number, endpointIndex: number) => void;
}) => {
  const handleChange = (field: keyof FunctionEndpoint, value: any) => {
    onChange(apiIndex, endpointIndex, field, value);
  };

  const handleParamChange = (
    paramIndex: number,
    field: keyof FunctionParameter,
    value: any
  ) => {
    const newParams = [...endpoint.parameters];
    newParams[paramIndex] = { ...newParams[paramIndex], [field]: value };
    onChange(apiIndex, endpointIndex, 'parameters', newParams);
  };

  const addParam = () => {
    const newParams = [
      ...endpoint.parameters,
      {
        name: '',
        data_type: 'string',
        description: '',
        is_optional: false,
        location: 'query-parameter',
      },
    ];
    onChange(apiIndex, endpointIndex, 'parameters', newParams);
  };

  const removeParam = (paramIndex: number) => {
    const newParams = endpoint.parameters.filter((_, i) => i !== paramIndex);
    onChange(apiIndex, endpointIndex, 'parameters', newParams);
  };

  return (
    <div className='p-4 border rounded-lg bg-background space-y-4'>
      <div className='flex justify-between items-center'>
        <p className='text-sm font-semibold'>
          Функция #{endpointIndex + 1}: {endpoint.name || 'Новая функция'}
        </p>
        <Button
          variant='ghost'
          size='icon'
          className='h-7 w-7'
          onClick={() => onRemove(apiIndex, endpointIndex)}
        >
          <Trash2 className='h-4 w-4 text-destructive' />
        </Button>
      </div>
      <Input
        placeholder='Название функции (e.g., getWeather)'
        value={endpoint.name}
        onChange={(e) => handleChange('name', e.target.value)}
      />
      <Textarea
        placeholder='Описание для AI (e.g., Получает погоду по городу)'
        value={endpoint.description}
        onChange={(e) => handleChange('description', e.target.value)}
        className='min-h-[70px]'
      />
      <div className='flex gap-3'>
        <Select
          value={endpoint.method}
          onValueChange={(v) => handleChange('method', v)}
        >
          <SelectTrigger className='w-[120px]'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='get'>GET</SelectItem>
            <SelectItem value='post'>POST</SelectItem>
            <SelectItem value='put'>PUT</SelectItem>
            <SelectItem value='patch'>PATCH</SelectItem>
            <SelectItem value='delete'>DELETE</SelectItem>
          </SelectContent>
        </Select>
        <Input
          placeholder='Путь (e.g., /v1/weather)'
          value={endpoint.path}
          onChange={(e) => handleChange('path', e.target.value)}
        />
      </div>
      <div className='space-y-3'>
        <Label>Параметры</Label>
        {endpoint.parameters.map((param, i) => (
          <FunctionParameterForm
            key={i}
            param={param}
            apiIndex={apiIndex}
            endpointIndex={endpointIndex}
            paramIndex={i}
            onChange={(...args) => handleParamChange(args[2], args[3], args[4])}
            onRemove={() => removeParam(i)}
          />
        ))}
        <Button
          variant='outline'
          size='sm'
          onClick={addParam}
          className='w-full'
        >
          <PlusCircle className='h-4 w-4 mr-2' />
          Добавить параметр
        </Button>
      </div>
    </div>
  );
};

// --- Компонент для одной API конфигурации ---
const FunctionApiConfigForm = ({
  apiConfig,
  index,
  onChange,
  onRemove,
}: {
  apiConfig: ApiConfig;
  index: number;
  onChange: (index: number, field: keyof ApiConfig, value: any) => void;
  onRemove: (index: number) => void;
}) => {
  const [isOpen, setIsOpen] = useState(true);

  const handleChange = (field: keyof ApiConfig, value: any) => {
    onChange(index, field, value);
  };

  const handleEndpointChange = (
    endpointIndex: number,
    apiIndex: any,
    field: keyof FunctionEndpoint,
    value: any
  ) => {
    const newEndpoints = [...apiConfig.endpoints];
    newEndpoints[endpointIndex] = {
      ...newEndpoints[endpointIndex],
      [field]: value,
    };
    onChange(index, 'endpoints', newEndpoints);
  };

  const addEndpoint = () => {
    const newEndpoints = [
      ...apiConfig.endpoints,
      {
        name: '',
        description: '',
        path: '',
        method: 'get',
        parameters: [],
      },
    ];
    onChange(index, 'endpoints', newEndpoints);
  };

  const removeEndpoint = (endpointIndex: number) => {
    const newEndpoints = apiConfig.endpoints.filter(
      (_, i) => i !== endpointIndex
    );
    onChange(index, 'endpoints', newEndpoints);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CardHeader>
          <div className='flex justify-between items-center'>
            <CollapsibleTrigger asChild>
              <div className='flex items-center gap-2 cursor-pointer'>
                {isOpen ? (
                  <ChevronUp className='h-4 w-4' />
                ) : (
                  <ChevronDown className='h-4 w-4' />
                )}
                <CardTitle>API: {apiConfig.base_url || 'Новое API'}</CardTitle>
              </div>
            </CollapsibleTrigger>
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8'
              onClick={() => onRemove(index)}
            >
              <Trash2 className='h-4 w-4 text-destructive' />
            </Button>
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className='space-y-4'>
            <Input
              placeholder='Base URL (e.g., https://api.example.com)'
              value={apiConfig.base_url}
              onChange={(e) => handleChange('base_url', e.target.value)}
            />
            <Input
              placeholder='Authorization (e.g., Bearer YOUR_KEY)'
              value={apiConfig.authorization}
              onChange={(e) => handleChange('authorization', e.target.value)}
            />
            <div className='space-y-3'>
              <Label>Функции (Эндпоинты)</Label>
              {apiConfig.endpoints.map((endpoint, i) => (
                <FunctionEndpointForm
                  key={i}
                  endpoint={endpoint}
                  apiIndex={index}
                  endpointIndex={i}
                  onChange={handleEndpointChange}
                  onRemove={() => removeEndpoint(i)}
                />
              ))}
              <Button
                variant='secondary'
                onClick={addEndpoint}
                className='w-full'
              >
                <PlusCircle className='h-4 w-4 mr-2' />
                Добавить функцию
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

// --- Главный компонент-менеджер ---
export const FunctionsManager = ({
  functions,
  setFunctions,
}: {
  functions: ApiConfig[];
  setFunctions: React.Dispatch<React.SetStateAction<ApiConfig[]>>;
}) => {
  const handleApiConfigChange = (
    index: number,
    field: keyof ApiConfig,
    value: any
  ) => {
    const newFunctions = [...functions];
    newFunctions[index] = { ...newFunctions[index], [field]: value };
    setFunctions(newFunctions);
  };

  const addApiConfig = () => {
    setFunctions([
      ...functions,
      {
        base_url: '',
        authorization: '',
        endpoints: [],
      },
    ]);
  };

  const removeApiConfig = (index: number) => {
    setFunctions(functions.filter((_, i) => i !== index));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Функции</CardTitle>
        <CardDescription>
          Подключите внешние API, чтобы ваш агент мог выполнять действия,
          например, проверять статус заказа или погоду.
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        {functions.map((apiConfig, index) => (
          <FunctionApiConfigForm
            key={index}
            apiConfig={apiConfig}
            index={index}
            onChange={handleApiConfigChange}
            onRemove={() => removeApiConfig(index)}
          />
        ))}
        <Button onClick={addApiConfig} variant='outline' className='w-full'>
          <FileCode className='h-4 w-4 mr-2' />
          Подключить новое API
        </Button>
      </CardContent>
    </Card>
  );
};
