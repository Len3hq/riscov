import { Route, Routes } from 'react-router-dom';
import { PageShell } from './components/layout/PageShell';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { Docs } from './pages/Docs';

function App() {
  return (
    <PageShell>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/docs" element={<Docs />} />
        <Route path="/docs/:slug" element={<Docs />} />
      </Routes>
    </PageShell>
  );
}

export default App;
