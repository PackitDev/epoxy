import { useEffect } from 'react';
import { useProjectStore } from './stores/project-store';
import { Sidebar } from './components/Sidebar';
import { StatusBar } from './components/StatusBar';
import { Dashboard } from './pages/Dashboard';
import { Features } from './pages/Features';
import { Config } from './pages/Config';
import { Packages } from './pages/Packages';
import { Modules } from './pages/Modules';
import { Presets } from './pages/Presets';
import { LicenseGate } from './components/LicenseGate';

function AppContent() {
  const currentPage = useProjectStore((s) => s.currentPage);
  const loadModulesAndPresets = useProjectStore((s) => s.loadModulesAndPresets);
  const scanProjects = useProjectStore((s) => s.scanProjects);
  const setStatusMessage = useProjectStore((s) => s.setStatusMessage);

  useEffect(() => {
    loadModulesAndPresets();
    scanProjects();

    // Listen for progress events from backend
    if (window.epoxy) {
      const unsubPackage = window.epoxy.onPackageProgress((msg) => {
        setStatusMessage(msg);
      });
      const unsubModule = window.epoxy.onModuleProgress((msg) => {
        setStatusMessage(msg);
      });

      return () => {
        unsubPackage();
        unsubModule();
      };
    }
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'features':
        return <Features />;
      case 'config':
        return <Config />;
      case 'packages':
        return <Packages />;
      case 'modules':
        return <Modules />;
      case 'presets':
        return <Presets />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0a0a0a]">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6">
          {renderPage()}
        </div>
        <StatusBar />
      </main>
    </div>
  );
}

function App() {
  return (
    <LicenseGate>
      <AppContent />
    </LicenseGate>
  );
}

export default App;
