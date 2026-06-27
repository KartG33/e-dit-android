import React from 'react';
import { Columns, Maximize, FileText, Sliders } from 'lucide-react';
import { TabButton } from '../UI/TabButton';
import { IconButton } from '../UI/IconButton';

export type TabType = 'basic' | 'suno' | 'presets' | 'favorites';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  charsCount: number;
  showNotes: boolean;
  setShowNotes: (show: boolean) => void;
  splitMode: boolean;
  setSplitMode: (split: boolean) => void;
  showPresetsModal: boolean;
  setShowPresetsModal: (show: boolean) => void;
  defaultTab: TabType;
  onSetDefaultTab: (tab: TabType) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  charsCount,
  showNotes,
  setShowNotes,
  splitMode,
  setSplitMode,
  showPresetsModal,
  setShowPresetsModal,
  defaultTab,
  onSetDefaultTab
}) => {
  return (
    <header className="flex items-end justify-between px-4 pt-2 glass-panel border-b border-white/5 z-20 shadow-lg shrink-0">
      <div className="flex items-center gap-6">
        <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent drop-shadow-sm pb-2">E-dit</h1>
        
        {/* Tabs */}
        <div className="flex gap-2">
          <TabButton 
            label="Команды" 
            isActive={activeTab === 'basic'} 
            onClick={() => setActiveTab('basic')} 
            isDefault={defaultTab === 'basic'}
            onSetDefault={() => onSetDefaultTab('basic')}
          />
          <TabButton 
            label="Suno" 
            isActive={activeTab === 'suno'} 
            onClick={() => setActiveTab('suno')} 
            isDefault={defaultTab === 'suno'}
            onSetDefault={() => onSetDefaultTab('suno')}
          />
          <TabButton 
            label="Пресеты" 
            isActive={activeTab === 'presets'} 
            onClick={() => setActiveTab('presets')} 
            isDefault={defaultTab === 'presets'}
            onSetDefault={() => onSetDefaultTab('presets')}
          />
          <TabButton 
            label="Избранное" 
            isActive={activeTab === 'favorites'} 
            onClick={() => setActiveTab('favorites')} 
            isDefault={defaultTab === 'favorites'}
            onSetDefault={() => onSetDefaultTab('favorites')}
          />
        </div>
      </div>

      <div className="flex gap-1.5 pb-2 items-center">
        <div className="text-gray-300 text-sm font-medium mr-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 shadow-inner flex items-center gap-1.5">
          Символов: <span className="text-blue-400">{charsCount}</span>
        </div>
        <IconButton
          icon={<FileText size={16} />}
          isActive={showNotes}
          onClick={() => setShowNotes(!showNotes)}
          title="Заметки"
        />
        <IconButton
          icon={<Sliders size={16} />}
          isActive={showPresetsModal}
          onClick={() => setShowPresetsModal(!showPresetsModal)}
          title="Пресеты"
        />
        <IconButton
          icon={splitMode ? <Maximize size={16} /> : <Columns size={16} />}
          onClick={() => setSplitMode(!splitMode)}
          title={splitMode ? 'Одна колонка' : 'Две колонки'}
        />
      </div>
    </header>
  );
};
