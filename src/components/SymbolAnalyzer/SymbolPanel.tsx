import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { symbolCommands } from '../../lib/commands/symbols';

interface Props {
  text: string;
  onCommand: (fn: (text: string) => string) => void;
}

export const SymbolPanel: React.FC<Props> = ({ text, onCommand }) => {
  const isMobile = false;
  const scrollRef = useRef<HTMLDivElement>(null);

  const [debouncedText, setDebouncedText] = useState(text);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedText(text);
    }, 300);
    return () => clearTimeout(handler);
  }, [text]);

  const symbols = useMemo(() => {
    if (!debouncedText) return [];
    const counts: Record<string, number> = {};
    let remainingText = debouncedText;

    const numberedListMatches = remainingText.match(/(?:^|\n)\s*\d+\./g);
    if (numberedListMatches) {
      counts['1.'] = numberedListMatches.length;
      remainingText = remainingText.replace(/(?:^|\n)\s*\d+\./g, '');
    }

    const multiTokens = ['---', '...', '```', '=='];
    for (const token of multiTokens) {
      const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escapeRegex(token), 'g');
      const matches = remainingText.match(regex);
      if (matches) {
        counts[token] = matches.length;
        remainingText = remainingText.replace(regex, '');
      }
    }

    const symbolRegex = /[_\-+\>~`!@#$%^&*()[\]{}|\\:;"'<>,.?/]/g;
    const matches = remainingText.match(symbolRegex);
    if (matches) {
      for (const char of matches) {
        counts[char] = (counts[char] || 0) + 1;
      }
    }

    return Object.entries(counts)
      .map(([symbol, count]) => ({ symbol, count }))
      .sort((a, b) => b.count - a.count);
  }, [debouncedText]);

  const handleSymbolClick = (symbol: string) => {
    const cmd = symbolCommands.find(c => c.id === `remove-symbol-${symbol}`);
    if (cmd && typeof cmd.execute === 'function') {
      onCommand(cmd.execute);
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (scrollRef.current && e.deltaY !== 0) {
      scrollRef.current.scrollLeft += e.deltaY;
    }
  };

  if (symbols.length === 0) return null;

  return (
    <div className="border-b border-white/5 bg-white/[0.03] backdrop-blur-sm flex items-center p-2.5 gap-4 shrink-0 shadow-sm relative z-10">
      {!isMobile && (
        <div className="flex items-center gap-1.5 text-blue-300/70 text-xs font-bold tracking-wider uppercase whitespace-nowrap">
          <Search size={14} />
          СИМВОЛЫ
          <span className="bg-blue-900/30 border border-blue-900/50 text-blue-400 px-1.5 py-0.5 rounded text-[10px] ml-1">
            {symbols.length}
          </span>
        </div>
      )}
      
      <div 
        ref={scrollRef}
        onWheel={handleWheel}
        className={`flex gap-2 flex-1 ${
          isMobile ? 'flex-wrap' : 'flex-nowrap overflow-x-auto scrollbar-hide'
        }`}
      >
        {symbols.map(({ symbol, count }) => (
          <button
            key={symbol}
            onClick={() => handleSymbolClick(symbol)}
            title={`Удалить все символы "${symbol}" (встречается: ${count})`}
            className="flex items-center justify-center px-3 py-1.5 glass-button rounded-lg text-xs text-blue-200 whitespace-nowrap shrink-0 font-mono font-medium"
          >
            {symbol}
          </button>
        ))}
      </div>
    </div>
  );
};
