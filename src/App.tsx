import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import SubmitProcess from './components/SubmitProcess';
import ScenarioSimulation from './components/ScenarioSimulation';
import AIInsights from './components/AIInsights';
import Reports from './components/Reports';
import CompareProjects from './components/CompareProjects';
import UserProfile from './components/UserProfile';
import Login from './components/Login';
import Register from './components/Register';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token
    const token = localStorage.getItem('lca_token');
    const userData = localStorage.getItem('lca_user');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        localStorage.removeItem('lca_token');
        localStorage.removeItem('lca_user');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData: User, token: string) => {
    setUser(userData);
    localStorage.setItem('lca_token', token);
    localStorage.setItem('lca_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('lca_token');
    localStorage.removeItem('lca_user');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading LCA Application...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
          <Routes>
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/register" element={<Register onLogin={handleLogin} />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      </Router>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex">
        <Navbar user={user} onLogout={handleLogout} />
        <div className="flex-1 ml-64">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard user={user} />} />
            <Route path="/submit" element={<SubmitProcess user={user} />} />
            <Route path="/simulation" element={<ScenarioSimulation user={user} />} />
            <Route path="/insights" element={<AIInsights user={user} />} />
            <Route path="/reports" element={<Reports user={user} />} />
            <Route path="/compare" element={<CompareProjects user={user} />} />
            <Route path="/profile" element={<UserProfile user={user} onLogout={handleLogout} />} />
          </Routes>
        </div>
      </div>
     <footer className="bg-gray-100 text-gray-700 text-center py-6 mt-auto border-t border-gray-200">
  <div className="mb-2">&copy; {new Date().getFullYear()} Team StrawHats. All rights reserved.</div>
  <div className="flex justify-center gap-4 mb-2">
    <a href="mailto:contact@team.com" className="hover:text-gray-900">strawhats@gmail.com</a>
    <a href="/privacy" className="hover:text-gray-900">Privacy Policy</a>
    <a href="/terms" className="hover:text-gray-900">Terms</a>
  </div>
  
  <div className="mt-2 text-sm text-gray-500">v1.0.0</div>
</footer>

    </Router>
  );
}

export default App;