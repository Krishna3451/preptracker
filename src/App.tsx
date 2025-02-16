import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Learn from './pages/Learn';
import TestYourself from './pages/TestYourself';
import Rank from './pages/Rank';
import Reports from './pages/Reports';
import Landing from './pages/Landing';

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  if (isLandingPage) {
    return children;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/test" element={<TestYourself />} />
          <Route path="/rank" element={<Rank />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}

export default App;