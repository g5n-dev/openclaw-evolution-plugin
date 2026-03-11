import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useSidebarStore } from './store';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardPage } from './pages/Dashboard';
import { FunnelPage } from './pages/Funnel';
import { CandidatesPage } from './pages/Candidates';
import { SkillsPage } from './pages/Skills';
import { CompatibilityPage } from './pages/Compatibility';
import { AvatarPage } from './pages/Avatar';
import { SponsorPage } from './pages/Sponsor';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  const isOpen = useSidebarStore((state) => state.isOpen);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          <Sidebar isOpen={isOpen} />
          <div className={`transition-all duration-300 ${isOpen ? 'lg:ml-64' : ''}`}>
            <Header />
            <main className="container mx-auto p-6">
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/funnel" element={<FunnelPage />} />
                <Route path="/candidates" element={<CandidatesPage />} />
                <Route path="/skills" element={<SkillsPage />} />
                <Route path="/compatibility" element={<CompatibilityPage />} />
                <Route path="/avatar" element={<AvatarPage />} />
                <Route path="/sponsor" element={<SponsorPage />} />
              </Routes>
            </main>
          </div>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
