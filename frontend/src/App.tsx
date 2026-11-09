import { useGameStore } from './store/gameStore';
import { Navbar } from './components/common/Navbar';
import { LandingPage } from './components/landing/LandingPage';
import { CharacterCreator } from './components/character-creator/CharacterCreator';
import { ScenarioSelector } from './components/scenarios/ScenarioSelector';
import { ArenaPage } from './components/arena/ArenaPage';

export function App() {
  const { activeTab } = useGameStore();

  if (activeTab === 'arena') {
    return <ArenaPage />;
  }

  return (
    <div className="min-h-screen bg-[#07080e] text-slate-100 flex flex-col selection:bg-purple-600 selection:text-white">
      <Navbar />
      <main className="flex-1 flex flex-col">
        {activeTab === 'landing' && <LandingPage />}
        {activeTab === 'create' && <CharacterCreator />}
        {activeTab === 'scenarios' && <ScenarioSelector />}
      </main>
    </div>
  );
}

export default App;
