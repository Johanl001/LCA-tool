import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import authService from './utils/authService';
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
import AuthStatus from './components/AuthStatus';

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
    // Check authentication status using the auth service
    const checkAuthStatus = async () => {
      try {
        if (authService.isAuthenticated()) {
          const currentUser = authService.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
            console.log('User authenticated:', currentUser.name);
          } else {
            console.log('No valid user data found');
            authService.clearAuthData();
          }
        } else {
          console.log('User not authenticated');
          authService.clearAuthData();
        }
      } catch (error) {
        console.error('Auth check error:', error);
        authService.clearAuthData();
      } finally {
        setLoading(false);
      }
    };
    
    checkAuthStatus();
  }, []);

  const handleLogin = (userData: User, token: string, refreshToken?: string) => {
    setUser(userData);
    localStorage.setItem('lca_token', token);
    if (refreshToken) {
      localStorage.setItem('lca_refresh_token', refreshToken);
    }
    localStorage.setItem('lca_user', JSON.stringify(userData));
    console.log('User logged in successfully:', userData.name);
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      setUser(null);
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      // Clear local data even if server logout fails
      authService.clearAuthData();
      setUser(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sunset-50 to-sunsetRed-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sunset-600 mx-auto"></div>
          <p className="mt-4 text-sunset-700">Loading LCA Application...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <ThemeProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-sunset-50 to-sunsetRed-50">
            <Routes>
              <Route path="/login" element={<Login onLogin={handleLogin} />} />
              <Route path="/register" element={<Register onLogin={handleLogin} />} />
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          </div>
        </Router>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
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
        
        {/* Authentication Status Monitor */}
        <AuthStatus onAuthError={() => {
          setUser(null);
          authService.redirectToLogin();
        }} />
        
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
    </ThemeProvider>
  );
}

export default App;