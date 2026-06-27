import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, Preset } from '../../lib/db/schema';
import { basicCommands } from '../../lib/commands/basic';
import { sunoCommands } from '../../lib/commands/suno';
import { symbolCommands } from '../../lib/commands/symbols';
import { Command } from '../../lib/commands/types';
import { Star } from 'lucide-react';

interface Props {
  onCommand: (fn: (text: string) => string) => void;
  favoritePresetIds?: number[];
  onToggleFavoritePreset?: (id: number) => void;
}

const allCommandsList = [...basicCommands, ...sunoCommands, ...symbolCommands];
const allCommandsMap = allCommandsList.reduce((acc, cmd) => {
  acc[cmd.id] = cmd;
  return acc;
}, {} as Record<string, Command>);

export const PresetsTab: React.FC<Props> = React.memo(({ 
  onCommand,
  favoritePresetIds = [],
  onToggleFavoritePreset
}) => {
  const presets = useLiveQuery(() => db.presets.toArray());

  const handleExecute = (preset: Preset) => {
    if (preset.type === 'regex') {
      if (!preset.pattern) return;
      onCommand((text) => {
        try {
          const regex = new RegExp(preset.pattern!, preset.flags || 'g');
          return text.replace(regex, preset.replacement || '');
        } catch (e) {
          console.error('Invalid regex', e);
          return text;
        }
      });
      return;
    }

    if (!preset.commandIds || !Array.isArray(preset.commandIds)) return;
    
    const allCmds = [...basicCommands, ...sunoCommands, ...symbolCommands];
    
    onCommand((text) => {
      let result = text;
      for (const id of preset.commandIds!) {
        const cmd = allCmds.find(c => c.id === id);
        if (cmd && typeof cmd.execute === 'function') {
          result = cmd.execute(result);
        }
      }
      return result;
    });
  };

  return (
    <div className="flex flex-wrap gap-2 p-1">
      {presets?.length === 0 && (
        <div className="text-gray-500 text-sm py-1.5 px-2 flex items-center">
          У вас пока нет пресетов. Создайте их через кнопку Пресеты в шапке
        </div>
      )}

      {presets?.map(preset => (
        <div 
          key={preset.id} 
          className="flex items-center gap-1 bg-white/5 border border-white/10 hover:border-white/20 rounded-xl px-3 py-1.5 transition-all shadow-sm group"
        >
          <button
            onClick={() => handleExecute(preset)}
            className="text-sm font-medium text-gray-200 hover:text-white mr-1 flex items-center gap-1.5"
            title={preset.type === 'regex' ? `Regex: /${preset.pattern}/${preset.flags}` : `Применить цепочку: ${preset.commandIds?.map(id => allCommandsMap[id]?.name || id).join(' → ')}`}
          >
            {preset.type === 'regex' && <span className="text-[10px] font-mono text-blue-400 border border-blue-400/30 rounded px-1 bg-blue-500/10">/</span>}
            {preset.name}
          </button>

          {onToggleFavoritePreset && (
            <button
              onClick={() => onToggleFavoritePreset(preset.id!)}
              className={`p-1 transition-all duration-200 ${
                favoritePresetIds.includes(preset.id!)
                  ? 'text-yellow-400 opacity-100'
                  : 'text-gray-500 hover:text-yellow-300 opacity-0 group-hover:opacity-100'
              }`}
              title={favoritePresetIds.includes(preset.id!) ? 'Убрать из избранного' : 'Добавить в избранное'}
            >
              <Star size={14} fill={favoritePresetIds.includes(preset.id!) ? 'currentColor' : 'none'} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
});

PresetsTab.displayName = 'PresetsTab';
