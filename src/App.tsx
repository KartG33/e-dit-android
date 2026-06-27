import { useState, useEffect, useCallback } from 'react';
import { useEditor } from './hooks/useEditor';
import { BasicCommands } from './components/Commands/BasicCommands';
import { SunoCommands } from './components/Commands/SunoCommands';
import { PresetsTab } from './components/Presets/PresetsTab';
import { PresetsModal } from './components/Presets/PresetsModal';
import { FavoritesTab } from './components/Commands/FavoritesTab';
import { SymbolPanel } from './components/SymbolAnalyzer/SymbolPanel';
import { Header, TabType } from './components/Layout/Header';
import { Workspace } from './components/Layout/Workspace';
import { db } from './lib/db/schema';

function App() {
  const leftEditor = useEditor('', 'left');
  const rightEditor = useEditor('', 'right');
  const [activePane, setActivePane] = useState<'left' | 'right'>('left');
  const [splitMode, setSplitMode] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showPresetsModal, setShowPresetsModal] = useState(false);
  
  const [defaultTab, setDefaultTab] = useState<TabType>('basic');
  const [activeTab, setActiveTab] = useState<TabType>('basic');
  const [favoriteCommandIds, setFavoriteCommandIds] = useState<string[]>([]);
  const [favoritePresetIds, setFavoritePresetIds] = useState<number[]>([]);
  const [isSettingsLoading, setIsSettingsLoading] = useState(true);

  // Load settings on startup
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const defaultTabSetting = await db.settings.where('key').equals('default_tab').first();
        if (defaultTabSetting && defaultTabSetting.value) {
          setDefaultTab(defaultTabSetting.value);
          setActiveTab(defaultTabSetting.value);
        }

        const favCmdsSetting = await db.settings.where('key').equals('favorite_commands').first();
        if (favCmdsSetting && Array.isArray(favCmdsSetting.value)) {
          setFavoriteCommandIds(favCmdsSetting.value);
        }

        const favPresetsSetting = await db.settings.where('key').equals('favorite_presets').first();
        if (favPresetsSetting && Array.isArray(favPresetsSetting.value)) {
          setFavoritePresetIds(favPresetsSetting.value);
        }
      } catch (err) {
        console.error('Failed to load settings from IndexedDB', err);
      } finally {
        setIsSettingsLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleSetDefaultTab = useCallback(async (tab: TabType) => {
    setDefaultTab(tab);
    await db.settings.put({ key: 'default_tab', value: tab });
  }, []);

  const handleToggleFavoriteCommand = useCallback(async (id: string) => {
    setFavoriteCommandIds(prev => {
      const updated = prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id];
      db.settings.put({ key: 'favorite_commands', value: updated });
      return updated;
    });
  }, []);

  const handleToggleFavoritePreset = useCallback(async (id: number) => {
    setFavoritePresetIds(prev => {
      const updated = prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id];
      db.settings.put({ key: 'favorite_presets', value: updated });
      return updated;
    });
  }, []);

  const activeEditor = splitMode 
    ? (activePane === 'left' ? leftEditor : rightEditor) 
    : leftEditor;

  return (
    <div className="h-screen flex flex-col text-white font-sans selection:bg-blue-500/30">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        charsCount={activeEditor.stats.chars}
        showNotes={showNotes}
        setShowNotes={setShowNotes}
        splitMode={splitMode}
        setSplitMode={setSplitMode}
        showPresetsModal={showPresetsModal}
        setShowPresetsModal={setShowPresetsModal}
        defaultTab={defaultTab}
        onSetDefaultTab={handleSetDefaultTab}
      />

      {/* Commands Content Panel */}
      <div className="border-b border-white/5 shrink-0 z-10 bg-white/[0.03] shadow-sm px-4 py-3 relative min-h-[58px] flex items-center">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/10" />
        {isSettingsLoading ? (
          <div className="w-full h-8 animate-pulse bg-white/5 rounded-lg" />
        ) : (
          <>
            {activeTab === 'basic' && (
              <BasicCommands 
                onCommand={activeEditor.applyCommand} 
                favoriteCommandIds={favoriteCommandIds}
                onToggleFavoriteCommand={handleToggleFavoriteCommand}
              />
            )}
            {activeTab === 'suno' && (
              <SunoCommands 
                text={activeEditor.text}
                onCommand={activeEditor.applyCommand} 
                favoriteCommandIds={favoriteCommandIds}
                onToggleFavoriteCommand={handleToggleFavoriteCommand}
              />
            )}
            {activeTab === 'presets' && (
              <PresetsTab 
                onCommand={activeEditor.applyCommand} 
                favoritePresetIds={favoritePresetIds}
                onToggleFavoritePreset={handleToggleFavoritePreset}
              />
            )}
            {activeTab === 'favorites' && (
              <FavoritesTab 
                onCommand={activeEditor.applyCommand} 
                favoriteCommandIds={favoriteCommandIds}
                onToggleFavoriteCommand={handleToggleFavoriteCommand}
                favoritePresetIds={favoritePresetIds}
                onToggleFavoritePreset={handleToggleFavoritePreset}
              />
            )}
          </>
        )}
      </div>

      <SymbolPanel text={activeEditor.text} onCommand={activeEditor.applyCommand} />

      <Workspace
        leftEditor={leftEditor}
        rightEditor={rightEditor}
        activeEditor={activeEditor}
        activePane={activePane}
        setActivePane={setActivePane}
        splitMode={splitMode}
        showNotes={showNotes}
        setShowNotes={setShowNotes}
      />

      <PresetsModal
        isOpen={showPresetsModal}
        onClose={() => setShowPresetsModal(false)}
        onCommand={activeEditor.applyCommand}
        text={activeEditor.text}
        favoritePresetIds={favoritePresetIds}
        onToggleFavoritePreset={handleToggleFavoritePreset}
      />
    </div>
  );
}

export default App;
