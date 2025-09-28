'use client';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, PipetteIcon, Bot } from 'lucide-react';
import { toast } from 'sonner';
import type {
  AmoCRMPipelineBinding,
  AmoCRMReferenceData,
  AmoCRMPipelineBindingCreate,
  AmoCRMPipelineBindingUpdate,
  ServiceBot,
} from '@/types/amocrm';

interface PipelineBindingsManagerProps {
  bindings: AmoCRMPipelineBinding[];
  referenceData: AmoCRMReferenceData | null;
  serviceBots: ServiceBot[];
  onCreate: (data: AmoCRMPipelineBindingCreate) => Promise<void>;
  onUpdate: (id: number, data: AmoCRMPipelineBindingUpdate) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export function PipelineBindingsManager({
  bindings,
  referenceData,
  serviceBots,
  onCreate,
  onUpdate,
  onDelete,
}: PipelineBindingsManagerProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingBinding, setEditingBinding] =
    useState<AmoCRMPipelineBinding | null>(null);
  const [formData, setFormData] = useState<
    Partial<AmoCRMPipelineBindingCreate & { active: boolean }>
  >({
    pipeline_id: undefined,
    responsible_user_id: undefined,
    allowed_status_ids: [],
    service_bot_id: undefined,
    active: true,
  });

  const resetForm = () => {
    setFormData({
      pipeline_id: undefined,
      responsible_user_id: undefined,
      allowed_status_ids: [],
      service_bot_id: undefined,
      active: true,
    });
  };

  const handleCreate = () => {
    if (!formData.pipeline_id || !formData.service_bot_id) {
      toast.error('Выберите воронку и AI-агента');
      return;
    }
    const selectedPipeline = referenceData?.pipelines.find(
      (p) => p.id === formData.pipeline_id
    );

    onCreate({
      ...formData,
      pipeline_name:
        selectedPipeline?.name || `Воронка ${formData.pipeline_id}`,
    } as AmoCRMPipelineBindingCreate);

    setShowCreateDialog(false);
    resetForm();
  };

  const handleUpdate = () => {
    if (!editingBinding) return;
    const updateData: AmoCRMPipelineBindingUpdate = {
      responsible_user_id: formData.responsible_user_id,
      allowed_status_ids: formData.allowed_status_ids,
      service_bot_id: formData.service_bot_id,
      active: formData.active,
    };
    onUpdate(editingBinding.id, updateData);
    setEditingBinding(null);
    resetForm();
  };

  const handleEdit = (binding: AmoCRMPipelineBinding) => {
    setEditingBinding(binding);
    setFormData({
      pipeline_id: binding.pipeline_id,
      pipeline_name: binding.pipeline_name,
      responsible_user_id: binding.responsible_user_id,
      allowed_status_ids: binding.allowed_status_ids,
      service_bot_id: binding.service_bot_id,
      active: binding.active,
    });
  };

  const handleStatusToggle = (statusId: number) => {
    const currentIds = formData.allowed_status_ids || [];
    const newIds = currentIds.includes(statusId)
      ? currentIds.filter((id) => id !== statusId)
      : [...currentIds, statusId];
    setFormData((prev) => ({ ...prev, allowed_status_ids: newIds }));
  };

  const getPipelineName = (pipelineId: number) => {
    const pipeline = referenceData?.pipelines.find((p) => p.id === pipelineId);
    return pipeline?.name || `Воронка ${pipelineId}`;
  };

  const getServiceBotName = (botId: number) => {
    const bot = serviceBots.find((b) => b.id === botId);
    return bot?.name || `Бот #${botId}`;
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold'>Привязки воронок</h2>
          <p className='text-gray-600'>
            Настройте связь между воронками AmoCRM и AI-агентами
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowCreateDialog(true);
          }}
        >
          <Plus className='h-4 w-4 mr-2' /> Создать привязку
        </Button>
      </div>

      <div className='grid gap-4'>
        {bindings.map((binding) => (
          <Card key={binding.id}>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div className='space-y-2'>
                  <div className='flex items-center gap-2'>
                    <PipetteIcon className='h-4 w-4 text-blue-500' />
                    <span className='font-medium'>
                      {getPipelineName(binding.pipeline_id)}
                    </span>
                    <Badge variant={binding.active ? 'default' : 'secondary'}>
                      {binding.active ? 'Активна' : 'Неактивна'}
                    </Badge>
                  </div>
                  <div className='flex items-center gap-2 text-sm text-gray-600'>
                    <Bot className='h-4 w-4' />
                    <span>{getServiceBotName(binding.service_bot_id)}</span>
                  </div>
                  <div className='text-sm text-gray-600'>
                    Разрешённых статусов: {binding.allowed_status_ids.length}
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => handleEdit(binding)}
                  >
                    <Edit className='h-4 w-4' />
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => onDelete(binding.id)}
                  >
                    <Trash2 className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {bindings.length === 0 && (
          <Card>
            <CardContent className='p-6 text-center'>
              <PipetteIcon className='h-12 w-12 text-gray-400 mx-auto mb-4' />
              <h3 className='text-lg font-medium text-gray-900 mb-2'>
                Привязки не настроены
              </h3>
              <p className='text-gray-600 mb-4'>
                Создайте привязку между воронкой AmoCRM и AI-агентом
              </p>
              <Button
                onClick={() => {
                  resetForm();
                  setShowCreateDialog(true);
                }}
              >
                <Plus className='h-4 w-4 mr-2' /> Создать первую привязку
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog
        open={showCreateDialog || !!editingBinding}
        onOpenChange={(open) => {
          if (!open) {
            setShowCreateDialog(false);
            setEditingBinding(null);
            resetForm();
          }
        }}
      >
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>
              {editingBinding ? 'Редактировать привязку' : 'Создать привязку'}
            </DialogTitle>
            <DialogDescription>
              Настройте связь между воронкой AmoCRM и AI-агентом
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='pipeline'>Воронка *</Label>
                <Select
                  value={formData.pipeline_id?.toString()}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      pipeline_id: parseInt(value),
                      allowed_status_ids: [],
                    }))
                  }
                  disabled={!!editingBinding}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Выберите воронку' />
                  </SelectTrigger>
                  <SelectContent>
                    {referenceData?.pipelines.map((pipeline) => (
                      <SelectItem
                        key={pipeline.id}
                        value={pipeline.id.toString()}
                      >
                        {pipeline.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor='service_bot'>AI-агент *</Label>
                <Select
                  value={formData.service_bot_id?.toString()}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      service_bot_id: parseInt(value),
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Выберите агента' />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceBots.map((bot) => (
                      <SelectItem key={bot.id} value={bot.id.toString()}>
                        {bot.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor='responsible_user'>Ответственный</Label>
              <Select
                value={formData.responsible_user_id?.toString()}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    responsible_user_id: parseInt(value),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Выберите ответственного (опционально)' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='0'>Не назначать</SelectItem>
                  {referenceData?.users.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>
                Разрешённые статусы (AI может перемещать сделки между ними)
              </Label>
              <div className='mt-2 space-y-2 max-h-40 overflow-y-auto border rounded-md p-3'>
                {referenceData?.pipelines
                  .find((p) => p.id === formData.pipeline_id)
                  ?.statuses.map((status) => (
                    <div
                      key={status.id}
                      className='flex items-center space-x-2'
                    >
                      <Checkbox
                        id={`status-${status.id}`}
                        checked={
                          formData.allowed_status_ids?.includes(status.id) ||
                          false
                        }
                        onCheckedChange={() => handleStatusToggle(status.id)}
                      />
                      <Label
                        htmlFor={`status-${status.id}`}
                        className='text-sm font-normal'
                      >
                        {status.name}
                      </Label>
                    </div>
                  ))}
              </div>
            </div>
            {editingBinding && (
              <div className='flex items-center space-x-2'>
                <Switch
                  id='active'
                  checked={formData.active}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, active: checked }))
                  }
                />
                <Label htmlFor='active'>Привязка активна</Label>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                setShowCreateDialog(false);
                setEditingBinding(null);
              }}
            >
              Отмена
            </Button>
            <Button onClick={editingBinding ? handleUpdate : handleCreate}>
              {editingBinding ? 'Сохранить' : 'Создать'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
