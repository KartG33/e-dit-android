import { Command } from './types';

export const basicCommands: Command[] = [
  {
    id: 'remove-extra-spaces',
    name: 'Spaces',
    category: 'basic',
    description: 'Заменяет множественные пробелы и табы на один пробел',
    execute: (text) => text.replace(/[ \t]{2,}/g, ' ')
  },
  {
    id: 'trim-lines',
    name: 'Edges',
    category: 'basic',
    description: 'Удаляет пробелы в начале и конце каждой строки',
    execute: (text) => text.split('\n').map(line => line.trim()).join('\n')
  },
  {
    id: 'to-uppercase',
    name: 'Upper',
    category: 'basic',
    execute: (text) => text.toUpperCase()
  },
  {
    id: 'to-lowercase',
    name: 'Lower',
    category: 'basic',
    execute: (text) => text.toLowerCase()
  },
  {
    id: 'to-sentence-case',
    name: 'Sentence',
    category: 'basic',
    description: 'Заглавная буква в начале предложений',
    execute: (text) => {
      return text.replace(/(^\s*\p{L}|[.!?]\s+\p{L})/gu, match => match.toUpperCase());
    }
  },
  {
    id: 'remove-space-before-punctuation',
    name: ',Space',
    category: 'basic',
    execute: (text) => text.replace(/\s+([.,;:!?])/g, '$1')
  },
  {
    id: 'add-space-after-punctuation',
    name: 'Space,',
    category: 'basic',
    execute: (text) => text.replace(/([.,;:!?])(\S)/g, '$1 $2')
  },
  {
    id: 'line-1',
    name: 'Line 1',
    category: 'basic',
    execute: (text) => text.replace(/\n\s*\n\s*\n/g, '\n\n')
  },
  {
    id: 'line-x',
    name: 'Line X',
    category: 'basic',
    description: 'Удаляет все пустые строки',
    execute: (text) => text.split('\n').filter(line => line.trim() !== '').join('\n')
  },
  {
    id: 'inline',
    name: 'Inline',
    category: 'basic',
    description: 'Склеивает строки внутри блока через пробел, сохраняет разрывы между абзацами',
    execute: (text) => {
      return text
        .split(/\n\n+/)
        .map(block => block.replace(/\n/g, ' ').trim())
        .join('\n\n');
    }
  },
  {
    id: 'inline-comma',
    name: 'Inline ,',
    category: 'basic',
    description: 'Склеивает строки внутри блока через запятую, сохраняет разрывы между абзацами',
    execute: (text) => {
      return text
        .split(/\n\n+/)
        .map(block => block.split('\n').map(l => l.trim()).filter(Boolean).join(', '))
        .join('\n\n');
    }
  }
];
