import React from 'react';
import { TextEditor } from './TextEditor';

interface SplitViewProps {
  leftEditor: any;
  rightEditor: any;
  activePane: 'left' | 'right';
  setActivePane: (pane: 'left' | 'right') => void;
  onSave?: (editor: any) => void;
  onOpen?: (editor: any) => void;
  leftTextareaRef?: React.RefObject<HTMLTextAreaElement>;
  rightTextareaRef?: React.RefObject<HTMLTextAreaElement>;
}

export const SplitView: React.FC<SplitViewProps> = ({
  leftEditor,
  rightEditor,
  activePane,
  setActivePane,
  onSave,
  onOpen,
  leftTextareaRef,
  rightTextareaRef
}) => {
  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="flex-1 flex flex-col border-r border-white/5 relative after:absolute after:right-0 after:top-0 after:bottom-0 after:w-[1px] after:bg-gradient-to-b after:from-transparent after:via-blue-500/20 after:to-transparent">
        <TextEditor
          value={leftEditor.text}
          onChange={leftEditor.setText}
          isActive={activePane === 'left'}
          onClick={() => setActivePane('left')}
          placeholder="Левая колонка (нажмите для редактирования)..."
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
              if (onSave) onSave(leftEditor);
            } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'o') {
              e.preventDefault();
              if (onOpen) onOpen(leftEditor);
            }
          }}
        />
      </div>
      <div className="flex-1 flex flex-col">
        <TextEditor
          value={rightEditor.text}
          onChange={rightEditor.setText}
          isActive={activePane === 'right'}
          onClick={() => setActivePane('right')}
          placeholder="Правая колонка (нажмите для редактирования)..."
          textareaRef={rightTextareaRef}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
              e.preventDefault();
              if (e.shiftKey) rightEditor.redo();
              else rightEditor.undo();
            } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
              e.preventDefault();
              rightEditor.redo();
            } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
              e.preventDefault();
              if (onSave) onSave(rightEditor);
            } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'o') {
              e.preventDefault();
              if (onOpen) onOpen(rightEditor);
            }
          }}
        />
      </div>
    </div>
  );
};
