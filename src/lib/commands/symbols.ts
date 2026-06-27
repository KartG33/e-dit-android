import { Command } from './types';

const analyzerSymbols = [
  '1.', '---', '***', '___', '...', '```', '==', '~~',
  '######', '#####', '####', '###', '##', '**', '__',
  '_', '-', '+', '>', '~', '`', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '[', ']', '{', '}', '|', '\\', ':', ';', '"', "'", '<', ',', '.', '?', '/'
];

export const symbolCommands: Command[] = analyzerSymbols.map(sym => ({
  id: `remove-symbol-${sym}`,
  name: `Удалить ${sym}`,
  category: 'custom',
  execute: (text: string) => {
    if (sym === '1.') {
      return text.replace(/(?:^|\n)\s*\d+\./g, '');
    }
    const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapeRegex(sym), 'g');
    return text.replace(regex, '');
  }
}));
