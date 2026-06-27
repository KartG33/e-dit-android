import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/db/schema';
import { Save, FileText, Trash2, Plus, X, History, Clock } from 'lucide-react';

interface Props {
  currentText: string;
  onLoadText: (text: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const NotesSidebar: React.FC<Props> = ({ currentText, onLoadText, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'notes' | 'history'>('notes');
  const notes = useLiveQuery(() => db.notes.orderBy('updatedAt').reverse().toArray());
  const historyItems = useLiveQuery(() => db.history.orderBy('timestamp').reverse().toArray());
  
  const [activeNoteId, setActiveNoteId] = useState<number | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [currentTags, setCurrentTags] = useState<string[]>([]);
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);

  if (!isOpen) return null;

  // -- Notes Logic --
  const handleAddTag = (tagText: string) => {
    const tags = tagText.split(',').map(t => t.trim()).filter(Boolean);
    if (tags.length) {
      setCurrentTags(prev => Array.from(new Set([...prev, ...tags])));
    }
    setTagsInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setCurrentTags(prev => prev.filter(t => t !== tagToRemove));
  };

  const handleSaveNew = async () => {
    if (!currentText.trim()) return;
    const title = newTitle.trim() || 'Заметка ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const id = await db.notes.add({
      title,
      content: currentText,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      tags: currentTags
    });
    setActiveNoteId(id as number);
    setNewTitle('');
    setCurrentTags([]);
    setTagsInput('');
  };

  const handleUpdate = async (id: number) => {
    await db.notes.update(id, {
      content: currentText,
      updatedAt: Date.now(),
      tags: currentTags
    });
  };

  const handleLoadNote = (id: number, content: string, tags?: string[]) => {
    setActiveNoteId(id);
    setCurrentTags(tags || []);
    onLoadText(content);
  };

  const handleDeleteNote = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    await db.notes.delete(id);
    if (activeNoteId === id) {
      setActiveNoteId(null);
      setCurrentTags([]);
    }
  };

  // Get unique tags across all notes
  const allTags = Array.from(new Set(notes?.flatMap(n => n.tags || []) || []));
  
  const filteredNotes = activeTagFilter 
    ? notes?.filter(n => n.tags?.includes(activeTagFilter))
    : notes;

  // -- History Logic --
  const handleLoadHistory = (content: string) => {
    onLoadText(content);
  };

  const handleDeleteHistoryItem = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    await db.history.delete(id);
  };

  const handleClearHistory = async () => {
    if (confirm('Вы уверены, что хотите очистить всю историю?')) {
      await db.history.clear();
    }
  };

  return (
    <div className="w-72 bg-black/20 border-l border-white/10 flex flex-col h-full shrink-0 z-20 backdrop-blur-md">
      {/* Header Tabs */}
      <div className="flex items-center border-b border-white/10 shrink-0">
        <button 
          onClick={() => setActiveTab('notes')}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'notes' ? 'text-white border-b-2 border-blue-500 bg-white/5' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}
        >
          <FileText size={16} /> Заметки
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'history' ? 'text-white border-b-2 border-blue-500 bg-white/5' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}
        >
          <History size={16} /> История
        </button>
        <button onClick={onClose} className="p-3 text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
          <X size={16}/>
        </button>
      </div>

      {activeTab === 'notes' && (
        <>
          <div className="p-3 border-b border-white/10 flex flex-col gap-3 bg-white/5">
            {activeNoteId ? (
              <button
                onClick={() => handleUpdate(activeNoteId)}
                className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <Save size={14} /> Сохранить текущую
              </button>
            ) : null}
            
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Название..." 
                  className="flex-1 bg-black/40 border border-white/10 px-3 py-1.5 text-sm rounded-lg outline-none focus:border-blue-500/50 text-white placeholder-gray-500 transition-colors"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSaveNew()}
                />
                <button
                  onClick={handleSaveNew}
                  title="Сохранить как новую"
                  className="p-2 bg-white/10 hover:bg-blue-600 rounded-lg transition-colors border border-white/5"
                >
                  <Plus size={16} />
                </button>
              </div>
              
              <div className="flex flex-col gap-1.5">
                <input 
                  type="text" 
                  placeholder="Теги (через запятую)..." 
                  className="w-full bg-black/40 border border-white/10 px-3 py-1.5 text-xs rounded-lg outline-none focus:border-blue-500/50 text-white placeholder-gray-500 transition-colors"
                  value={tagsInput}
                  onChange={e => setTagsInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag(tagsInput);
                    }
                  }}
                  onBlur={() => handleAddTag(tagsInput)}
                />
                {currentTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {currentTags.map(tag => (
                      <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        {tag}
                        <button onClick={() => handleRemoveTag(tag)} className="hover:text-white">
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tags Filter */}
          {allTags.length > 0 && (
            <div className="px-3 py-2 border-b border-white/10 bg-black/20 flex flex-wrap gap-1.5 overflow-y-auto max-h-20 scrollbar-hide">
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setActiveTagFilter(prev => prev === tag ? null : tag)}
                  className={`px-2 py-1 rounded text-xs transition-colors ${
                    activeTagFilter === tag 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1.5 scrollbar-hide">
            {filteredNotes?.map(note => (
              <div 
                key={note.id}
                onClick={() => handleLoadNote(note.id!, note.content, note.tags)}
                className={`p-3 rounded-xl cursor-pointer group flex justify-between items-start transition-all ${
                  activeNoteId === note.id 
                    ? 'bg-blue-500/20 border border-blue-500/30 shadow-inner' 
                    : 'bg-white/5 hover:bg-white/10 border border-transparent'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate text-gray-200">{note.title}</div>
                  <div className="text-[11px] text-gray-500 truncate mt-1 flex items-center gap-1">
                    <Clock size={10} />
                    {new Date(note.updatedAt).toLocaleString()}
                  </div>
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {note.tags.map(tag => (
                        <span key={tag} className="px-1.5 py-0.5 rounded text-[9px] bg-white/10 text-gray-300">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button 
                  onClick={(e) => handleDeleteNote(e, note.id!)}
                  className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all rounded-lg ml-2"
                  title="Удалить заметку"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {filteredNotes?.length === 0 && (
              <div className="text-gray-500 text-sm text-center mt-6">
                {activeTagFilter ? 'Нет заметок с этим тегом' : 'Нет сохраненных заметок'}
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'history' && (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1.5 scrollbar-hide">
            {historyItems?.map(item => (
              <div 
                key={item.id}
                onClick={() => handleLoadHistory(item.content)}
                className="p-3 rounded-xl cursor-pointer group flex justify-between items-start transition-all bg-white/5 hover:bg-white/10 border border-transparent"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] text-gray-400 flex items-center gap-1 mb-1">
                    <Clock size={10} />
                    {new Date(item.timestamp).toLocaleTimeString()} - {new Date(item.timestamp).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-gray-300 line-clamp-2 leading-relaxed">
                    {item.content || <span className="text-gray-600 italic">Пустой текст</span>}
                  </div>
                </div>
                <button 
                  onClick={(e) => handleDeleteHistoryItem(e, item.id!)}
                  className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all rounded-lg ml-2"
                  title="Удалить запись"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {historyItems?.length === 0 && (
              <div className="text-gray-500 text-sm text-center mt-6">История пуста</div>
            )}
          </div>
          
          {historyItems && historyItems.length > 0 && (
            <div className="p-3 border-t border-white/10 bg-black/20 shrink-0">
              <button
                onClick={handleClearHistory}
                className="w-full py-2 px-3 bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 border border-white/10 hover:border-red-500/30 rounded-lg text-sm font-medium transition-colors"
              >
                Очистить всю историю
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
