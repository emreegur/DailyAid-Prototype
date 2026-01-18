// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import FamilyDashboard from './pages/FamilyDashboard';
import ElderlyDashboard from './pages/ElderlyDashboard';

function App() {
  // Şimdilik "role" bilgisini elle simüle ediyoruz.
  // Backend bağlanınca burası API'den gelen veriye göre dolacak.
  const userRole = null; // 'family', 'elderly' veya null (giriş yapmamış)

  return (
    <Router>
      <Routes>
        {/* 1. Login Ekranı */}
        <Route path="/login" element={<Login />} />

        {/* 2. Aile Ekranı (Parent) */}
        <Route path="/family-dashboard" element={<FamilyDashboard />} />

        {/* 3. Yaşlı Ekranı (Elderly) */}
        <Route path="/elderly-dashboard" element={<ElderlyDashboard />} />

        {/* Ana sayfa yönlendirmesi */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;