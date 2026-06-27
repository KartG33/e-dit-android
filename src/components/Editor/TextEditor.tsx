import React from 'react';

interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  textareaRef?: React.RefObject<HTMLTextAreaElement>;
}

export const TextEditor: React.FC<TextEditorProps> = ({ 
  value, 
  onChange, 
  placeholder = 'Введите текст...',
  isActive = true,
  onClick,
  className = '',
  onKeyDown,
  textareaRef
}) => {
  return (
    <div 
      className={`flex-1 flex flex-col w-full h-full cursor-text ${isActive ? '' : 'opacity-90 grayscale-[20%]'} ${className}`} 
      onClick={() => onClick && onClick()}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full h-full p-6 pb-24 text-gray-100 border-none outline-none resize-none font-mono text-base leading-relaxed placeholder:text-gray-500/50 transition-all shadow-[inset_0_4px_20px_rgba(0,0,0,0.5)] ${isActive ? 'bg-black/40' : 'bg-black/20'}`}
        spellCheck={false}
        onKeyDown={onKeyDown}
      />
    </div>
  );
};
