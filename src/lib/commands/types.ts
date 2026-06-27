export interface Command {
  id: string;
  name: string;
  category: 'basic' | 'suno' | 'custom';
  description?: string;
  execute: (text: string, ...args: any[]) => string;
  icon?: string;
  dangerous?: boolean;
}

export type CommandExecutor = (text: string) => string;
