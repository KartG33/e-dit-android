import { Command } from './types';

export const sunoCommands: Command[] = [
  {
    id: 'suno-clean-tags',
    name: 'Clean',
    category: 'suno',
    description: 'Оставляет только структурные теги Suno, удаляет пояснения и неструктурные теги',
    execute: (text) => {
      const STRUCTURAL_TAGS = [
        'intro', 'verse', 'pre-chorus', 'prechorus', 'chorus',
        'bridge', 'hook', 'refrain', 'break', 'drop',
        'interlude', 'solo', 'fade out', 'fadeout', 'outro'
      ];

      return text.replace(/\[([^\]]+)\]/g, (_match, content) => {
        // Убираем пояснения: всё после | - : ,
        const cleanContent = content.split(/[|\-:,]/)[0].trim();
        
        // Проверяем: является ли базовая часть структурным тегом
        // Убираем цифры и x2/x3 для проверки: "Verse 1" -> "verse", "Chorus x2" -> "chorus"
        const baseName = cleanContent.replace(/\s+x?\d+$/i, '').trim().toLowerCase();
        
        const isStructural = STRUCTURAL_TAGS.some(tag => baseName === tag);
        
        if (isStructural) {
          return '[' + cleanContent + ']';
        } else {
          return ''; // Удаляем неструктурный тег целиком
        }
      }).replace(/\n{3,}/g, '\n\n').trim();
    }
  },
  {
    id: 'suno-pad-tags',
    name: 'Space',
    category: 'suno',
    description: 'Добавляет пустые строки до и после тегов, без дублирования',
    execute: (text) => {
      return text
        .replace(/\n*(\[.*?\])\n*/g, '\n\n$1\n\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
    }
  },
  {
    id: 'suno-capitalize-lines',
    name: 'Upper',
    category: 'suno',
    execute: (text) => {
      return text.split('\n').map(line => {
        if (line.trim() && !line.trim().startsWith('[')) {
          return line.charAt(0).toUpperCase() + line.slice(1);
        }
        return line;
      }).join('\n');
    }
  },
  {
    id: 'suno-text-only',
    name: 'Lyrics',
    category: 'suno',
    execute: (text) => text
      .replace(/\[.*?\]/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  },
  {
    id: 'suno-structure-only',
    name: 'Structure',
    category: 'suno',
    description: 'Оставляет только теги, без лишних пустых строк',
    execute: (text) => {
      const tags = text.match(/\[.*?\]/g);
      return tags ? tags.join('\n') : '';
    }
  },
  {
    id: 'suno-smart-spacing',
    name: 'Trim',
    category: 'suno',
    execute: (text) => {
      return text.replace(/(\[.*?\]\n)([^\[][\s\S]*?)(?=\n\[|\n*$)/g, (_match, tag, content) => {
        const compactContent = content.replace(/\n+/g, '\n');
        return tag + compactContent;
      });
    }
  }
];
