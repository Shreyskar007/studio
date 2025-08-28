import type { FC } from 'react';
import { Bot } from 'lucide-react';

export const Logo: FC = () => (
  <div className="flex items-center gap-2">
    <Bot className="h-8 w-8 text-primary" />
    <h1 className="text-2xl font-bold tracking-tight">MeetFlow</h1>
  </div>
);
