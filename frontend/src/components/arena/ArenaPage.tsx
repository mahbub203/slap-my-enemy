import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useSettingsStore } from '../../store/settingsStore';
import { Arena3DCanvas } from './Arena3DCanvas';
import { ScoreboardHUD } from './ScoreboardHUD';
import { ActionControls } from './ActionControls';
import { ReactionMessageBanner } from './ReactionMessageBanner';
import { FloatingTextOverlay } from './FloatingTextOverlay';
import { TutorialOverlay } from './TutorialOverlay';
import { SessionSummaryModal } from './SessionSummaryModal';
import { SettingsModal } from '../settings/SettingsModal';
import { AchievementsModal } from '../achievements/AchievementsModal';

export const ArenaPage: React.FC = () => {
  const { 
    isScreenShaking, 
    setActiveTab, 
    isSummaryOpen, 
    setIsSummaryOpen, 
    stressReliefLevel 
  } = useGameStore();

  const { screenShakeEnabled, hasSeenTutorial } = useSettingsStore();

  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState<boolean>(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(false);

  // Automatically trigger tutorial on first entry
  useEffect(() => {
    if (!hasSeenTutorial) {
      setIsTutorialOpen(true);
    }
  }, [hasSeenTutorial]);

  // Open summary if 100% stress relief is achieved
  useEffect(() => {
    if (stressReliefLevel >= 100) {
      setIsSummaryOpen(true);
    }
  }, [stressReliefLevel, setIsSummaryOpen]);

  return (
    <div className={`relative w-full h-screen overflow-hidden select-none bg-[#07080e] ${
      isScreenShaking && screenShakeEnabled ? 'screen-shake' : ''
    }`}>
      {/* 3D Canvas Viewport */}
      <Arena3DCanvas />

      {/* Top HUD */}
      <ScoreboardHUD
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAchievements={() => setIsAchievementsOpen(true)}
        onOpenTutorial={() => setIsTutorialOpen(true)}
        onOpenSummary={() => setIsSummaryOpen(true)}
        onNavigateLanding={() => setActiveTab('landing')}
        onNavigateCreate={() => setActiveTab('create')}
        onNavigateScenarios={() => setActiveTab('scenarios')}
      />

      {/* Funny Speech Reaction Banner */}
      <ReactionMessageBanner />

      {/* Floating Damage & Combo Text VFX */}
      <FloatingTextOverlay />

      {/* Bottom Action Controls */}
      <ActionControls />

      {/* Modals */}
      <TutorialOverlay
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
      />

      <SessionSummaryModal
        isOpen={isSummaryOpen}
        onClose={() => setIsSummaryOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <AchievementsModal
        isOpen={isAchievementsOpen}
        onClose={() => setIsAchievementsOpen(false)}
      />
    </div>
  );
};
