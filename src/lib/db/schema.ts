import Dexie, { Table } from 'dexie';

export interface Note {
  id?: number;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  tags?: string[];
}

export interface Preset {
  id?: number;
  name: string;
  type?: 'chain' | 'regex';
  commandIds?: string[];
  pattern?: string;
  replacement?: string;
  flags?: string;
  description?: string;
  category?: 'basic' | 'suno' | 'custom';
  createdAt: number;
}

export interface HistoryEntry {
  id?: number;
  content: string;
  timestamp: number;
  source?: 'autosave' | 'manual';
}

export interface AppSettings {
  id?: number;
  key: string;
  value: any;
}

export class EditDatabase extends Dexie {
  notes!: Table<Note, number>;
  presets!: Table<Preset, number>;
  history!: Table<HistoryEntry, number>;
  settings!: Table<AppSettings, number>;

  constructor() {
    super('EditAppDB');
    
    this.version(1).stores({
      notes: '++id, title, createdAt, updatedAt, tags',
      presets: '++id, name, category, createdAt',
      history: '++id, timestamp',
      settings: '++id, key'
    });
  }
}

export const db = new EditDatabase();
