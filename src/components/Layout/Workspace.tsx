import React, { useRef } from 'react';
import { SplitView } from '../Editor/SplitView';
import { TextEditor } from '../Editor/TextEditor';
import { EditorToolbar } from '../Editor/EditorToolbar';
import { NotesSidebar } from '../Notes/NotesSidebar';
import { useEditor } from '../../hooks/useEditor';
import { Share } from '@capacitor/share';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

type EditorInstance = ReturnType<typeof useEditor>;

interface WorkspaceProps {
  leftEditor: EditorInstance;
  rightEditor: EditorInstance;
  activeEditor: EditorInstance;
  activePane: 'left' | 'right';
  setActivePane: (pane: 'left' | 'right') => void;
  splitMode: boolean;
  showNotes: boolean;
  setShowNotes: (show: boolean) => void;
}

export const Workspace: React.FC<WorkspaceProps> = ({
  leftEditor,
  rightEditor,
  activeEditor,
  activePane,
  setActivePane,
  splitMode,
  showNotes,
  setShowNotes
}) => {
  const leftTextareaRef = useRef<HTMLTextAreaElement>(null);
  const rightTextareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeTextareaRef = splitMode 
    ? (activePane === 'left' ? leftTextareaRef : rightTextareaRef)
    : leftTextareaRef;

  const handleOpenFile = async (editor: EditorInstance) => {
    if (fileInputRef.current) {
      fileInputRef.current.onchange = async (e) => {
        const target = e.target as HTMLInputElement;
        if (target.files && target.files.length > 0) {
          try {
            const file = target.files[0];
            const text = await file.text();
            editor.setText(text);
          } catch (err) {
            console.error('Failed to read file', err);
          } finally {
            target.value = '';
          }
        }
      };
      fileInputRef.current.click();
    }
  };

  const handleSaveFile = async (editor: EditorInstance) => {
    try {
      const fileName = `edit_document_${Date.now()}.txt`;
      const result = await Filesystem.writeFile({
        path: fileName,
        data: editor.text,
        directory: Directory.Cache,
        encoding: Encoding.UTF8,
      });
      
      await Share.share({
        title: 'Save Document',
        text: 'Save or share your text document',
        url: result.uri,
        dialogTitle: 'Save Document',
      });
    } catch (e) {
      console.error('Error saving file:', e);
    }
  };

  const handlePaste = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (!clipText) return;
      
      const textarea = activeTextareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const before = text.substring(0, start);
        const after = text.substring(end, text.length);
        
        activeEditor.setText(before + clipText + after);
        
        setTimeout(() => {
          textarea.focus();
          const nextCursor = start + clipText.length;
          textarea.setSelectionRange(nextCursor, nextCursor);
        }, 0);
      } else {
        activeEditor.setText(activeEditor.text + clipText);
      }
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      <input type="file" ref={fileInputRef} className="hidden" accept=".txt,.md,.lyrics" />
      {/* Editor Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {splitMode ? (
          <SplitView 
            leftEditor={leftEditor}
            rightEditor={rightEditor}
            activePane={activePane}
            setActivePane={setActivePane}
            onOpen={handleOpenFile}
            onSave={handleSaveFile}
            leftTextareaRef={leftTextareaRef}
            rightTextareaRef={rightTextareaRef}
          />
        ) : (
          <TextEditor
            value={leftEditor.text}
            onChange={leftEditor.setText}
            placeholder="Введите или вставьте текст..."
            textareaRef={leftTextareaRef}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
                e.preventDefault();
                if (e.shiftKey) leftEditor.redo();
                else leftEditor.undo();
              } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
                e.preventDefault();
                leftEditor.redo();
              } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
                e.preventDefault();
                handleSaveFile(leftEditor);
              } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'o') {
                e.preventDefault();
                handleOpenFile(leftEditor);
              }
            }}
          />
        )}
        
        <EditorToolbar
          onUndo={activeEditor.undo}
          onRedo={activeEditor.redo}
          canUndo={activeEditor.canUndo}
          canRedo={activeEditor.canRedo}
          onClear={activeEditor.clear}
          text={activeEditor.text}
          onOpen={() => handleOpenFile(activeEditor)}
          onSave={() => handleSaveFile(activeEditor)}
          onPaste={handlePaste}
        />
      </div>

      <NotesSidebar 
        currentText={activeEditor.text}
        onLoadText={activeEditor.setText}
        isOpen={showNotes}
        onClose={() => setShowNotes(false)}
      />
    </div>
  );
};
