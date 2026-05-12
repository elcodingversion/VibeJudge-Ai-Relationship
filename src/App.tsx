import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomeScreen from './pages/HomeScreen';
import { PsychologyView } from './components/PsychologyView';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/psychology" element={<PsychologyView onClose={() => window.history.back()} />} />
      </Routes>
    </BrowserRouter>
  );
}
