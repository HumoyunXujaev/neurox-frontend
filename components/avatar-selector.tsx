'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AvatarSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (avatar: string) => void;
  currentAvatar: string;
}

// Генерация 40 различных аватаров

const generateAvatars = () => {
  const avatars = [];
  for (let i = 1; i <= 40; i++) {
    avatars.push(
      `https://api.dicebear.com/9.x/notionists/png?seed=${i}&backgroundColor=b6e3f4,c0aede,d1d4f9`
    );
  }
  return avatars;
};

export function AvatarSelector({
  open,
  onOpenChange,
  onSelect,
  currentAvatar,
}: AvatarSelectorProps) {
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar);
  const avatars = generateAvatars();

  const handleSelect = () => {
    onSelect(selectedAvatar);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Выберите аватар</DialogTitle>
          <DialogDescription>
            Выберите аватар для вашего агента из представленных вариантов.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className='h-96'>
          <div className='grid grid-cols-8 gap-2 p-2'>
            {avatars.map((avatar, index) => (
              <Avatar
                key={index}
                className={`h-12 w-12 cursor-pointer border-2 transition-all hover:scale-105 ${
                  selectedAvatar === avatar
                    ? 'border-purple-500 ring-2 ring-purple-200'
                    : 'border-transparent'
                }`}
                onClick={() => setSelectedAvatar(avatar)}
              >
                <AvatarImage
                  src={avatar || '/placeholder.svg'}
                  alt={`Аватар ${index + 1}`}
                />
                <AvatarFallback>{index + 1}</AvatarFallback>
              </Avatar>
            ))}
          </div>
        </ScrollArea>
        <div className='flex justify-end gap-2'>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={handleSelect}>Выбрать аватар</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
