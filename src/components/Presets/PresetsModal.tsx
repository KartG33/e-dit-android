import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, Preset } from '../../lib/db/schema';
import { basicCommands } from '../../lib/commands/basic';
import { sunoCommands } from '../../lib/commands/suno';
import { symbolCommands } from '../../lib/commands/symbols';
import { Command } from '../../lib/commands/types';
import { X, Sliders, Plus, Check, ArrowRight, Edit, Trash2, Star, Play } from 'lucide-react';

interface PresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCommand: (fn: (text: string) => string) => void;
  text?: string;
  favoritePresetIds?: number[];
  onToggleFavoritePreset?: (id: number) => void;
}

const allCommandsList = [...basicCommands, ...sunoCommands, ...symbolCommands];
const allCommandsMap = allCommandsList.reduce((acc, cmd) => {
  acc[cmd.id] = cmd;
  return acc;
}, {} as Record<string, Command>);

export const PresetsModal: React.FC<PresetsModalProps> = ({ 
  isOpen, 
  onClose, 
  onCommand,
  text = '',
  favoritePresetIds = [],
  onToggleFavoritePreset
}) => {
  const presets = useLiveQuery(() => db.presets.toArray());
  const [isCreating, setIsCreating] = useState(false);
  const [editingPresetId, setEditingPresetId] = useState<number | null>(null);
  
  // Shared fields
  const [newPresetName, setNewPresetName] = useState('');
  const [presetType, setPresetType] = useState<'chain' | 'regex'>('chain');
  
  // Chain fields
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Regex fields
  const [regexPattern, setRegexPattern] = useState('');
  const [regexReplacement, setRegexReplacement] = useState('');
  const [regexFlags, setRegexFlags] = useState('g');
  const [regexTestResult, setRegexTestResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExecute = (preset: Preset) => {
    if (preset.type === 'regex') {
      if (!preset.pattern) return;
      onCommand((currentText) => {
        try {
          const regex = new RegExp(preset.pattern!, preset.flags || 'g');
          return currentText.replace(regex, preset.replacement || '');
        } catch (e) {
          console.error('Invalid regex', e);
          return currentText;
        }
      });
      return;
    }

    if (!preset.commandIds || !Array.isArray(preset.commandIds)) return;
    
    const allCmds = [...basicCommands, ...sunoCommands, ...symbolCommands];
    
    onCommand((currentText) => {
      let result = currentText;
      for (const id of preset.commandIds!) {
        const cmd = allCmds.find(c => c.id === id);
        if (cmd && typeof cmd.execute === 'function') {
          result = cmd.execute(result);
        }
      }
      return result;
    });
  };

  const handleTestRegex = () => {
    try {
      const regex = new RegExp(regexPattern, regexFlags);
      setRegexTestResult(text.replace(regex, regexReplacement));
    } catch (e: any) {
      setRegexTestResult(`Ошибка: ${e.message}`);
    }
  };

  const handleSave = async () => {
    if (presetType === 'chain' && selectedIds.length === 0) return;
    if (presetType === 'regex' && !regexPattern.trim()) return;
    
    const finalName = newPresetName.trim() || `Мой пресет ${presets ? presets.length + 1 : 1}`;
    
    if (editingPresetId !== null) {
      await db.presets.update(editingPresetId, {
        name: finalName,
        type: presetType,
        commandIds: presetType === 'chain' ? selectedIds : undefined,
        pattern: presetType === 'regex' ? regexPattern : undefined,
        replacement: presetType === 'regex' ? regexReplacement : undefined,
        flags: presetType === 'regex' ? regexFlags : undefined,
      });
      setEditingPresetId(null);
    } else {
      await db.presets.add({
        name: finalName,
        type: presetType,
        commandIds: presetType === 'chain' ? selectedIds : undefined,
        pattern: presetType === 'regex' ? regexPattern : undefined,
        replacement: presetType === 'regex' ? regexReplacement : undefined,
        flags: presetType === 'regex' ? regexFlags : undefined,
        createdAt: Date.now()
      });
    }
    
    setIsCreating(false);
    resetForm();
  };

  const handleStartEdit = (preset: Preset) => {
    setEditingPresetId(preset.id!);
    setNewPresetName(preset.name);
    setPresetType(preset.type || 'chain');
    setSelectedIds(preset.commandIds || []);
    setRegexPattern(preset.pattern || '');
    setRegexReplacement(preset.replacement || '');
    setRegexFlags(preset.flags || 'g');
    setRegexTestResult(null);
    setIsCreating(true);
  };

  const resetForm = () => {
    setNewPresetName('');
    setPresetType('chain');
    setSelectedIds([]);
    setRegexPattern('');
    setRegexReplacement('');
    setRegexFlags('g');
    setRegexTestResult(null);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingPresetId(null);
    resetForm();
  };

  const handleDelete = async (id: number) => {
    await db.presets.delete(id);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        className="bg-[#0f1219]/95 border border-white/10 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative flex flex-col max-h-[85vh] overflow-hidden text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5 shrink-0">
          <h2 className="text-lg font-bold flex items-center gap-2 text-white">
            <Sliders size={18} className="text-blue-400" />
            Управление пресетами
          </h2>
          <button 
            onClick={onClose} 
            className="p-1.5 hover:bg-white/5 text-gray-400 hover:text-white rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto pt-4 pr-1 scrollbar-hide">
          {isCreating ? (
            <div className="flex flex-col gap-4 p-2 text-sm max-h-[60vh] overflow-y-auto scrollbar-hide">
              <div className="flex gap-2 items-center">
                <input
                  className="flex-1 bg-white/5 border border-white/10 px-4 py-2 rounded-xl outline-none focus:border-blue-500/50 focus:bg-white/10 text-gray-200 transition-all placeholder-gray-500"
                  placeholder="Название пресета..."
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                />
                <button onClick={handleSave} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded font-medium flex items-center gap-1 transition-colors">
                  <Check size={16}/> {editingPresetId !== null ? 'Сохранить' : 'Создать'}
                </button>
                <button onClick={handleCancel} className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded flex items-center gap-1 transition-colors">
                  <X size={16}/> Отмена
                </button>
              </div>

              {/* Type selector */}
              <div className="flex bg-white/5 p-1 rounded-lg w-fit">
                <button
                  onClick={() => setPresetType('chain')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${presetType === 'chain' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
                >
                  Цепочка команд
                </button>
                <button
                  onClick={() => setPresetType('regex')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${presetType === 'regex' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
                >
                  Регулярное выражение
                </button>
              </div>
              
              {presetType === 'chain' ? (
                <>
                  <div className="flex flex-col gap-1.5">
                    <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
                      Выбранная цепочка ({selectedIds.length})
                    </div>
                    {selectedIds.length === 0 ? (
                      <div className="text-gray-600 italic text-xs py-1">Кликните на команды ниже, чтобы добавить их в цепочку</div>
                    ) : (
                      <div className="flex flex-wrap items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-xl min-h-[48px] shadow-inner">
                        {selectedIds.map((id, index) => (
                          <React.Fragment key={`${id}-${index}`}>
                            <span 
                              className="px-3 py-1.5 bg-blue-500/20 text-blue-200 border border-blue-500/30 rounded-lg text-sm cursor-pointer hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-300 transition-all shadow-sm"
                              onClick={() => setSelectedIds(prev => prev.filter((_, i) => i !== index))}
                              title="Удалить из цепочки"
                            >
                              {allCommandsMap[id]?.name || id}
                            </span>
                            {index < selectedIds.length - 1 && <ArrowRight size={14} className="text-gray-600"/>}
                          </React.Fragment>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 mt-2 pb-2">
                    <div>
                      <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5">Базовые команды</div>
                      <div className="flex flex-wrap gap-1.5">
                        {basicCommands.map(cmd => (
                          <button
                            key={cmd.id}
                            onClick={() => setSelectedIds(prev => [...prev, cmd.id])}
                            className="glass-button px-3 py-1.5 rounded-lg text-sm text-gray-300 transform hover:scale-[1.02] active:scale-[0.98]"
                          >
                            + {cmd.name}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5">Suno команды</div>
                      <div className="flex flex-wrap gap-1.5">
                        {sunoCommands.map(cmd => (
                          <button
                            key={cmd.id}
                            onClick={() => setSelectedIds(prev => [...prev, cmd.id])}
                            className="glass-button px-3 py-1.5 rounded-lg text-sm text-gray-300 transform hover:scale-[1.02] active:scale-[0.98]"
                          >
                            + {cmd.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5">Удаление символов</div>
                      <div className="flex flex-wrap gap-1.5 font-mono">
                        {symbolCommands.map(cmd => (
                          <button
                            key={cmd.id}
                            onClick={() => setSelectedIds(prev => [...prev, cmd.id])}
                            title={cmd.name}
                            className="min-w-[2rem] h-8 px-1.5 flex items-center justify-center glass-button rounded-lg text-sm text-gray-300 transform hover:scale-[1.05] active:scale-[0.95]"
                          >
                            {cmd.id.replace('remove-symbol-', '')}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Паттерн</label>
                    <input 
                      type="text" 
                      value={regexPattern} 
                      onChange={e => setRegexPattern(e.target.value)}
                      placeholder="Например: \s+"
                      className="bg-black/40 border border-white/10 px-3 py-2 rounded-lg text-white font-mono text-sm outline-none focus:border-blue-500/50"
                    />
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex-1 flex flex-col gap-2">
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Замена</label>
                      <input 
                        type="text" 
                        value={regexReplacement} 
                        onChange={e => setRegexReplacement(e.target.value)}
                        placeholder="Например: $1 или пробел"
                        className="bg-black/40 border border-white/10 px-3 py-2 rounded-lg text-white font-mono text-sm outline-none focus:border-blue-500/50"
                      />
                    </div>
                    
                    <div className="w-24 flex flex-col gap-2">
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Флаги</label>
                      <input 
                        type="text" 
                        value={regexFlags} 
                        onChange={e => setRegexFlags(e.target.value)}
                        placeholder="g, gi, gm..."
                        className="bg-black/40 border border-white/10 px-3 py-2 rounded-lg text-white font-mono text-sm outline-none focus:border-blue-500/50"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={handleTestRegex}
                        className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                      >
                        <Play size={14} /> Тест на текущем тексте
                      </button>
                    </div>
                    {regexTestResult !== null && (
                      <div className="bg-black/50 border border-white/5 rounded-lg p-3 max-h-32 overflow-y-auto text-xs font-mono text-gray-300">
                        {regexTestResult || <span className="text-gray-600 italic">Пустой результат</span>}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 p-1">
              {presets?.length === 0 && (
                <div className="text-gray-500 text-sm py-1.5 px-2 flex items-center">У вас пока нет пресетов</div>
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
                  
                  <button
                    onClick={() => handleStartEdit(preset)}
                    className="p-1 text-gray-500 hover:text-blue-400 rounded transition-colors"
                    title="Редактировать пресет"
                  >
                    <Edit size={14} />
                  </button>

                  <button
                    onClick={() => handleDelete(preset.id!)}
                    className="p-1 text-gray-500 hover:text-red-400 rounded transition-colors"
                    title="Удалить пресет"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              
              <button
                onClick={() => setIsCreating(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600/90 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transform hover:scale-[1.02] active:scale-[0.98]"
                title="Создать пресет"
              >
                <Plus size={16} /> Создать пресет
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
