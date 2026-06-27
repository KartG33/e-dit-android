import { useState, useCallback, useRef, useEffect } from 'react';
import { db } from '../lib/db/schema';

export function useEditor(initialValue = '', editorId = 'main') {
  const [text, setTextState] = useState(initialValue);
  const [past, setPast] = useState<string[]>([]);
  const [future, setFuture] = useState<string[]>([]);
  
  const textRef = useRef(initialValue);
  
  const maxHistorySize = 100;
  
  const lastSavedTextRef = useRef(initialValue);
  const debounceTimerRef = useRef<number | null>(null);
  const isInitializedRef = useRef(false);

  // Sync textRef with live text state changes
  useEffect(() => {
    textRef.current = text;
  }, [text]);

  // Load from DB on mount
  useEffect(() => {
    const loadSession = async () => {
      const setting = await db.settings.where('key').equals(`editor_${editorId}`).first();
      if (setting && setting.value) {
        setTextState(setting.value);
        lastSavedTextRef.current = setting.value;
        textRef.current = setting.value;
      } else if (initialValue) {
        setTextState(initialValue);
        lastSavedTextRef.current = initialValue;
        textRef.current = initialValue;
      }
      isInitializedRef.current = true;
    };
    loadSession();
  }, [editorId, initialValue]);



  // Save to DB on text change
  useEffect(() => {
    if (!isInitializedRef.current) return;
    
    const saveTimer = setTimeout(() => {
      db.settings.put({ key: `editor_${editorId}`, value: text })
        .catch(err => console.error('Failed to autosave', err));
    }, 1000);
    
    return () => clearTimeout(saveTimer);
  }, [text, editorId]);

  const saveToHistory = useCallback((newPastText: string) => {
    setPast(prev => {
      // Don't save duplicates
      if (prev.length > 0 && prev[prev.length - 1] === newPastText) return prev;
      return [...prev.slice(-maxHistorySize + 1), newPastText];
    });
    setFuture([]);
  }, []);

  const setText = useCallback((newText: string) => {
    setTextState(newText);
    
    if (debounceTimerRef.current !== null) {
      window.clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = window.setTimeout(() => {
      if (lastSavedTextRef.current !== newText) {
        saveToHistory(lastSavedTextRef.current);
        lastSavedTextRef.current = newText;
      }
    }, 800);
  }, [saveToHistory]);

  const undo = useCallback(() => {
    if (past.length === 0) return;
    
    if (debounceTimerRef.current !== null) {
      window.clearTimeout(debounceTimerRef.current);
    }

    const previous = past[past.length - 1];
    const newPast = past.slice(0, -1);
    
    // Save current state to future, unless it's identical to previous
    setFuture(prev => [text, ...prev]);
    setPast(newPast);
    setTextState(previous);
    lastSavedTextRef.current = previous;
  }, [past, text]);

  const redo = useCallback(() => {
    if (future.length === 0) return;
    
    const next = future[0];
    const newFuture = future.slice(1);
    
    setPast(prev => [...prev, text]);
    setFuture(newFuture);
    setTextState(next);
    lastSavedTextRef.current = next;
  }, [future, text]);

  const applyCommand = useCallback((commandFn: (text: string) => string) => {
    if (debounceTimerRef.current !== null) {
      window.clearTimeout(debounceTimerRef.current);
    }
    
    const currentText = textRef.current;
    if (lastSavedTextRef.current !== currentText) {
      saveToHistory(lastSavedTextRef.current);
    }
    
    const newText = commandFn(currentText);
    if (newText !== currentText) {
      saveToHistory(currentText);
      
      // Save to db.history
      db.history.add({
        content: currentText,
        timestamp: Date.now(),
        source: 'autosave'
      }).then(() => {
        return db.history.orderBy('timestamp').toArray();
      }).then(history => {
        if (history.length > 50) {
          const toDelete = history.slice(0, history.length - 50);
          return Promise.all(toDelete.map(item => db.history.delete(item.id!)));
        }
      }).catch(console.error);

      lastSavedTextRef.current = newText;
      setTextState(newText);
      textRef.current = newText;
    }
  }, [saveToHistory]);

  const stats = {
    chars: text.length
  };

  const clear = useCallback(() => {
    applyCommand(() => '');
  }, [applyCommand]);

  return {
    text,
    setText,
    undo,
    redo,
    canUndo: past.length > 0 || lastSavedTextRef.current !== text,
    canRedo: future.length > 0,
    applyCommand,
    stats,
    clear
  };
}
