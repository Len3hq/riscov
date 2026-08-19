import { Route, Routes } from 'react-router-dom';
import { PageShell } from './components/layout/PageShell';
import { Dashboard } from './pages/Dashboard';
import { Docs } from './pages/Docs';

function App() {
  return (
    <PageShell>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/docs" element={<Docs />} />
        <Route path="/docs/:slug" element={<Docs />} />
      </Routes>
    </PageShell>
  );
}

export default App;
