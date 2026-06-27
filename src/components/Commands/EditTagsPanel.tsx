import React, { useState, useEffect, useRef } from 'react';
import { parseTags, applyTags, ParsedTag } from '../../lib/commands/editTags';

interface EditTagsPanelProps {
  text: string;
  onApply: (newText: string) => void;
  onClose: () => void;
}

export const EditTagsPanel: React.FC<EditTagsPanelProps> = ({ text, onApply, onClose }) => {
  const [tags, setTags] = useState<ParsedTag[]>([]);
  // We use a ref to prevent re-parsing from text on every external update,
  // we only want to parse once on mount, then control the state internally.
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      setTags(parseTags(text));
      initialized.current = true;
    }
  }, [text]);

  const handleTagsChange = (newTags: ParsedTag[]) => {
    const { newText, updatedTags } = applyTags(text, newTags);
    setTags(updatedTags);
    onApply(newText);
  };

  const handleToggleDelete = (index: number) => {
    const newTags = [...tags];
    newTags[index].isDeleted = !newTags[index].isDeleted;
    handleTagsChange(newTags);
  };

  const handleDeleteStyle = (tagIndex: number, styleIndex: number) => {
    const newTags = [...tags];
    newTags[tagIndex].styles.splice(styleIndex, 1);
    handleTagsChange(newTags);
  };

  const handleAddStyle = (tagIndex: number, newStyle: string) => {
    if (!newStyle.trim()) return;
    const newTags = [...tags];
    newTags[tagIndex].styles.push(newStyle.trim());
    handleTagsChange(newTags);
  };

  const handleEditStyle = (tagIndex: number, styleIndex: number, newStyle: string) => {
    const newTags = [...tags];
    const trimmed = newStyle.trim();
    if (!trimmed) {
      newTags[tagIndex].styles.splice(styleIndex, 1);
    } else {
      newTags[tagIndex].styles[styleIndex] = trimmed;
    }
    handleTagsChange(newTags);
  };

  const totalTags = tags.reduce((sum, t) => sum + t.count, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative bg-[#1a1b1e] border border-white/10 rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-medium text-white">Edit Tags</h2>
            <div className="text-xs text-white/50 bg-white/5 px-2 py-1 rounded">
              {totalTags} всего, {tags.length} уникальных
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-white/50 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-4 overflow-y-auto space-y-3">
          {tags.length === 0 ? (
            <div className="text-center py-12 text-white/40">
              Теги не найдены
            </div>
          ) : (
            tags.map((tag, tagIndex) => (
              <div 
                key={tag.id}
                className="bg-white/5 rounded-lg p-3 border border-white/5 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-blue-400">[{tag.structuralPart}]</span>
                    {tag.count > 1 && (
                      <span className="text-[10px] bg-yellow-500/20 text-yellow-300 px-1.5 py-0.5 rounded-full font-medium">
                        ×{tag.count}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleToggleDelete(tagIndex)}
                    className="text-white/40 hover:text-white/80 transition-colors w-6 h-6 flex items-center justify-center rounded bg-white/5 hover:bg-white/10"
                    title={tag.isDeleted ? "Восстановить стили" : "Удалить все стили"}
                  >
                    {tag.isDeleted ? '↩' : '✕'}
                  </button>
                </div>

                <div className={`flex flex-wrap gap-2 transition-opacity ${tag.isDeleted ? 'opacity-30 pointer-events-none' : ''}`}>
                  {tag.styles.map((style, styleIndex) => (
                    <StyleChip
                      key={`${tag.id}-${styleIndex}`}
                      initialValue={style}
                      onSave={(newVal) => handleEditStyle(tagIndex, styleIndex, newVal)}
                      onDelete={() => handleDeleteStyle(tagIndex, styleIndex)}
                    />
                  ))}
                  <AddStyleChip onAdd={(newVal) => handleAddStyle(tagIndex, newVal)} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

interface StyleChipProps {
  initialValue: string;
  onSave: (val: string) => void;
  onDelete: () => void;
}

const StyleChip: React.FC<StyleChipProps> = ({ initialValue, onSave, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    setIsEditing(false);
    if (value !== initialValue) {
      onSave(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') {
      setValue(initialValue);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className="bg-black/40 border border-blue-500/50 rounded-full px-3 py-1 text-sm outline-none text-white min-w-[80px]"
      />
    );
  }

  return (
    <div className="group flex items-center gap-1 bg-white/10 hover:bg-white/15 border border-white/5 rounded-full pl-3 pr-1 py-1 text-sm transition-colors">
      <span 
        className="cursor-pointer select-none"
        onClick={() => setIsEditing(true)}
      >
        {initialValue}
      </span>
      <button 
        onClick={onDelete}
        className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-white/20 text-white/50 hover:text-white transition-colors"
      >
        <span className="text-[10px]">✕</span>
      </button>
    </div>
  );
};

const AddStyleChip: React.FC<{ onAdd: (val: string) => void }> = ({ onAdd }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (value.trim()) {
      onAdd(value);
    }
    setValue('');
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') {
      setValue('');
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        placeholder="новый стиль"
        className="bg-black/40 border border-blue-500/50 rounded-full px-3 py-1 text-sm outline-none text-white min-w-[80px]"
      />
    );
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      className="flex items-center gap-1 bg-transparent border border-dashed border-white/20 hover:border-white/40 rounded-full px-3 py-1 text-sm text-white/40 hover:text-white/70 transition-colors"
    >
      <span className="text-lg leading-none mb-[2px]">+</span> добавить
    </button>
  );
};
