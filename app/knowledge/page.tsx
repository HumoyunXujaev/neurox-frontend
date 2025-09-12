'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/header';
import { Sidebar } from '@/components/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { apiClient } from '@/lib/api/client';
import { toast } from 'sonner';
import {
  PlusCircle,
  Upload,
  Trash2,
  Edit,
  Loader2,
  Search,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface KnowledgeItem {
  id: number;
  title: string;
  content: string;
  knowledge_type: string;
  tags: { name: string }[];
}

const KNOWLEDGE_TYPES = [
  'document',
  'faq',
  'product',
  'service',
  'policy',
  'instruction',
  'description',
  'url',
];

export default function KnowledgePage() {
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newItem, setNewItem] = useState({
    title: '',
    content: '',
    knowledge_type: 'document',
    tags: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.knowledgeBase.listItems();
      setItems(response.data);
      console.log(response)
    } catch (error) {
      toast.error('Не удалось загрузить базу знаний.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleAddItem = async () => {
    if (!newItem.title || !newItem.content) {
      toast.error('Заполните заголовок и содержание.');
      return;
    }
    try {
      const tagsArray = newItem.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);
      await apiClient.knowledgeBase.createItem({ ...newItem, tags: tagsArray });
      toast.success('Элемент успешно добавлен.');
      setShowAddDialog(false);
      setNewItem({
        title: '',
        content: '',
        knowledge_type: 'document',
        tags: '',
      });
      fetchItems();
    } catch (error) {
      toast.error('Не удалось добавить элемент.');
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast.error('Выберите файл для загрузки.');
      return;
    }
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      await apiClient.knowledgeBase.uploadFile(formData);
      toast.success(
        'Файл успешно загружен и поставлен в очередь на обработку.'
      );
      setSelectedFile(null);
      // Optional: Add a delay or websocket to update the list after processing
      setTimeout(fetchItems, 2000);
    } catch (error) {
      toast.error('Не удалось загрузить файл.');
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (confirm('Вы уверены, что хотите удалить этот элемент?')) {
      try {
        await apiClient.knowledgeBase.deleteItem(id);
        toast.success('Элемент успешно удален.');
        fetchItems();
      } catch (error) {
        toast.error('Не удалось удалить элемент.');
      }
    }
  };

  return (
    <div className='flex h-screen bg-background'>
      <div className='hidden md:block w-68 flex-shrink-0'>
        <Sidebar />
      </div>
      <div className='flex-1 flex flex-col min-w-0'>
        <Header />
        <main className='flex-1 p-6 overflow-auto'>
          <div className='flex justify-between items-center mb-6'>
            <h1 className='text-2xl font-bold'>База знаний</h1>
            <Button onClick={() => setShowAddDialog(true)}>
              <PlusCircle className='mr-2 h-4 w-4' /> Добавить вручную
            </Button>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle>Загрузить документ</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <Input
                  type='file'
                  onChange={(e) =>
                    setSelectedFile(e.target.files ? e.target.files[0] : null)
                  }
                />
                <Button
                  onClick={handleFileUpload}
                  disabled={!selectedFile}
                  className='w-full'
                >
                  <Upload className='mr-2 h-4 w-4' /> Загрузить
                </Button>
                <p className='text-xs text-muted-foreground'>
                  Поддерживаемые форматы: PDF, DOCX, TXT, MD.
                </p>
              </CardContent>
            </Card>

            {/* Search Section */}
            <Card>
              <CardHeader>
                <CardTitle>Поиск по базе</CardTitle>
              </CardHeader>
              <CardContent className='flex gap-4'>
                <Input type='search' placeholder='Найти информацию...' />
                <Button>
                  <Search className='h-4 w-4' />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Items List */}
          <Card className='mt-6'>
            <CardHeader>
              <CardTitle>Элементы базы знаний</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className='flex justify-center p-8'>
                  <Loader2 className='h-8 w-8 animate-spin' />
                </div>
              ) : (
                <div className='space-y-4'>
                  {items.length > 0 ? (
                    items.map((item) => (
                      <div
                        key={item.id}
                        className='p-4 border rounded-lg flex justify-between items-start gap-4'
                      >
                        <div className='flex-1'>
                          <h3 className='font-semibold'>{item.title}</h3>
                          <p className='text-sm text-muted-foreground mt-1 line-clamp-2'>
                            {item.content}
                          </p>
                          <div className='mt-2 flex gap-2 flex-wrap'>
                            <Badge variant='secondary'>
                              {item.knowledge_type}
                            </Badge>
                            {item.tags.map((tag) => (
                              <Badge key={tag.name} variant='outline'>
                                {tag.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className='flex gap-2'>
                          <Button variant='ghost' size='icon' disabled>
                            <Edit className='h-4 w-4' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='text-destructive hover:text-destructive'
                            onClick={() => handleDeleteItem(item.id)}
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className='text-center text-muted-foreground p-8'>
                      База знаний пуста.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Add Item Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить новый элемент</DialogTitle>
            <DialogDescription>
              Заполните поля для добавления новой информации в базу знаний.
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='title'>Заголовок</Label>
              <Input
                id='title'
                value={newItem.title}
                onChange={(e) =>
                  setNewItem({ ...newItem, title: e.target.value })
                }
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='content'>Содержание</Label>
              <Textarea
                id='content'
                value={newItem.content}
                onChange={(e) =>
                  setNewItem({ ...newItem, content: e.target.value })
                }
                rows={6}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='knowledge_type'>Тип знания</Label>
              <Select
                value={newItem.knowledge_type}
                onValueChange={(value) =>
                  setNewItem({ ...newItem, knowledge_type: value })
                }
              >
                <SelectTrigger id='knowledge_type'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {KNOWLEDGE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='tags'>Теги (через запятую)</Label>
              <Input
                id='tags'
                value={newItem.tags}
                onChange={(e) =>
                  setNewItem({ ...newItem, tags: e.target.value })
                }
                placeholder='например: доставка, оплата, возврат'
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setShowAddDialog(false)}>
              Отмена
            </Button>
            <Button onClick={handleAddItem}>Добавить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
