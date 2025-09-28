'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Activity,
  MessageSquare,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { amocrmClient } from '@/lib/api/amocrm-client';

export function LeadActionsManager() {
  const [leadId, setLeadId] = useState('');
  const [statusId, setStatusId] = useState('');
  const [noteText, setNoteText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastAction, setLastAction] = useState<{
    type: string;
    success: boolean;
    message: string;
  } | null>(null);

  const handleStatusChange = async () => {
    if (!leadId || !statusId) {
      toast.error('Заполните ID сделки и ID статуса');
      return;
    }
    try {
      setIsLoading(true);
      await amocrmClient.changeLeadStatus({
        lead_id: parseInt(leadId),
        status_id: parseInt(statusId),
      });
      setLastAction({
        type: 'status',
        success: true,
        message: `Статус сделки ${leadId} изменён на ${statusId}`,
      });
      toast.success('Статус сделки изменён');
    } catch (error) {
      console.error('Failed to change lead status:', error);
      setLastAction({
        type: 'status',
        success: false,
        message: 'Ошибка изменения статуса',
      });
      toast.error('Ошибка изменения статуса');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!leadId || !noteText.trim()) {
      toast.error('Заполните ID сделки и текст примечания');
      return;
    }
    try {
      setIsLoading(true);
      await amocrmClient.addLeadNote({
        lead_id: parseInt(leadId),
        text: noteText.trim(),
      });
      setLastAction({
        type: 'note',
        success: true,
        message: `Примечание добавлено к сделке ${leadId}`,
      });
      toast.success('Примечание добавлено');
      setNoteText('');
    } catch (error) {
      console.error('Failed to add lead note:', error);
      setLastAction({
        type: 'note',
        success: false,
        message: 'Ошибка добавления примечания',
      });
      toast.error('Ошибка добавления примечания');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold'>Действия со сделками</h2>
        <p className='text-gray-600'>
          Изменение статусов и добавление примечаний к сделкам в AmoCRM
        </p>
      </div>

      {lastAction && (
        <Alert
          className={
            lastAction.success
              ? 'border-green-200 bg-green-50'
              : 'border-red-200 bg-red-50'
          }
        >
          {lastAction.success ? (
            <CheckCircle className='h-4 w-4 text-green-600' />
          ) : (
            <AlertCircle className='h-4 w-4 text-red-600' />
          )}
          <AlertDescription
            className={lastAction.success ? 'text-green-800' : 'text-red-800'}
          >
            {lastAction.message}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue='status' className='space-y-4'>
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value='status' className='flex items-center gap-2'>
            <Activity className='h-4 w-4' /> Изменить статус
          </TabsTrigger>
          <TabsTrigger value='note' className='flex items-center gap-2'>
            <MessageSquare className='h-4 w-4' /> Добавить примечание
          </TabsTrigger>
        </TabsList>

        <TabsContent value='status' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Изменение статуса сделки</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label htmlFor='lead-id'>ID сделки *</Label>
                  <Input
                    id='lead-id'
                    type='number'
                    placeholder='123456'
                    value={leadId}
                    onChange={(e) => setLeadId(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor='status-id'>ID статуса *</Label>
                  <Input
                    id='status-id'
                    type='number'
                    placeholder='987654'
                    value={statusId}
                    onChange={(e) => setStatusId(e.target.value)}
                  />
                </div>
              </div>
              <div className='text-sm text-gray-600'>
                <p>• ID сделки можно найти в URL сделки в AmoCRM</p>
                <p>• ID статуса можно найти в справочниках выше</p>
              </div>
              <Button
                onClick={handleStatusChange}
                disabled={isLoading || !leadId || !statusId}
                className='w-full'
              >
                {isLoading ? 'Изменение...' : 'Изменить статус'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value='note' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Добавление примечания</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <Label htmlFor='note-lead-id'>ID сделки *</Label>
                <Input
                  id='note-lead-id'
                  type='number'
                  placeholder='123456'
                  value={leadId}
                  onChange={(e) => setLeadId(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor='note-text'>Текст примечания *</Label>
                <Textarea
                  id='note-text'
                  placeholder='Введите текст примечания...'
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  rows={4}
                />
              </div>
              <Button
                onClick={handleAddNote}
                disabled={isLoading || !leadId || !noteText.trim()}
                className='w-full'
              >
                {isLoading ? 'Добавление...' : 'Добавить примечание'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
