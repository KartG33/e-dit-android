import React from 'react';
import { Undo, Redo, Trash2, Copy, ClipboardPaste, Save, FolderOpen } from 'lucide-react';

interface EditorToolbarProps {
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onClear: () => void;
  text: string;
  className?: string;
  onSave?: () => void;
  onOpen?: () => void;
  onPaste?: () => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onClear,
  text,
  className = "absolute bottom-6 left-1/2 -translate-x-1/2",
  onSave,
  onOpen,
  onPaste
}) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
  };

  const handlePaste = async () => {
    if (onPaste) {
      onPaste();
    } else {
      try {
        const clipText = await navigator.clipboard.readText();
        console.log('Clipboard content:', clipText);
      } catch (err) {
        console.error('Failed to read clipboard contents: ', err);
      }
    }
  };

  return (
    <div className={`flex items-center gap-1.5 p-1.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] z-20 ${className}`}>
      <button
        onClick={onUndo}
        disabled={!canUndo}
        className="p-2.5 rounded-xl transition-all duration-200 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent text-gray-300"
        title="Отменить (Ctrl+Z)"
      >
        <Undo size={18} />
      </button>
      
      <button
        onClick={onRedo}
        disabled={!canRedo}
        className="p-2.5 rounded-xl transition-all duration-200 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent text-gray-300"
        title="Повторить (Ctrl+Y)"
      >
        <Redo size={18} />
      </button>

      <div className="w-px h-6 bg-white/10 mx-1" />

      {onOpen && (
        <button
          onClick={onOpen}
          className="p-2.5 rounded-xl transition-all duration-200 hover:bg-white/10 text-gray-300"
          title="Открыть файл (Ctrl+O)"
        >
          <FolderOpen size={18} />
        </button>
      )}

      {onSave && (
        <button
          onClick={onSave}
          className="p-2.5 rounded-xl transition-all duration-200 hover:bg-white/10 text-gray-300"
          title="Сохранить файл (Ctrl+S)"
        >
          <Save size={18} />
        </button>
      )}

      <div className="w-px h-6 bg-white/10 mx-1" />

      <button
        onClick={handleCopy}
        className="p-2.5 rounded-xl transition-all duration-200 hover:bg-white/10 text-gray-300"
        title="Копировать всё"
      >
        <Copy size={18} />
      </button>

      <button
        onClick={handlePaste}
        className="p-2.5 rounded-xl transition-all duration-200 hover:bg-white/10 text-gray-300"
        title="Вставить"
      >
        <ClipboardPaste size={18} />
      </button>

      <div className="w-px h-6 bg-white/10 mx-1" />

      <button
        onClick={onClear}
        className="p-2.5 rounded-xl transition-all duration-200 hover:bg-red-500/20 text-red-400 hover:text-red-300"
        title="Очистить всё"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
};
