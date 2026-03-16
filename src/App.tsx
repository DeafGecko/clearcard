import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { CardsPage } from './pages/CardsPage';
import { TemplatesPage } from './pages/TemplatesPage';
import { ProfilePage } from './pages/ProfilePage';
import { storageUtils } from './utils/storage';

function App() {
  const [theme, setTheme] = useState(() => storageUtils.getTheme());

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    storageUtils.saveTheme(newTheme);
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <Header theme={theme} onThemeChange={handleThemeChange} />
        <Routes>
          <Route path="/" element={<CardsPage theme={theme} />} />
          <Route path="/templates" element={<TemplatesPage theme={theme} />} />
          <Route path="/profile" element={<ProfilePage theme={theme} />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
