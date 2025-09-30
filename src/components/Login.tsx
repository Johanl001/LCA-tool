import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme, getThemeColors } from '../contexts/ThemeContext';
import { Leaf, Mail, Lock, LogIn } from 'lucide-react';

interface LoginProps {
  onLogin: (user: any, token: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      onLogin(data.user, data.token);
    } catch (error: any) {
      setError(error.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className={`p-3 ${theme === 'sunset' ? 'bg-sunset-100' : 'bg-adventure-100'} rounded-full`}>
              <Leaf className={`h-8 w-8 ${theme === 'sunset' ? 'text-sunset-600' : 'text-adventure-600'}`} />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your LCA Platform account</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={`pl-10 w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 ${theme === 'sunset' ? 'focus:ring-sunset-500' : 'focus:ring-adventure-500'} focus:border-transparent`}
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className={`pl-10 w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 ${theme === 'sunset' ? 'focus:ring-sunset-500' : 'focus:ring-adventure-500'} focus:border-transparent`}
                placeholder="Enter your password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white ${theme === 'sunset' ? 'bg-sunset-600 hover:bg-sunset-700 focus:ring-sunset-500' : 'bg-adventure-600 hover:bg-adventure-700 focus:ring-adventure-500'} focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <LogIn className="h-5 w-5 mr-2" />
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link
              to="/register"
              className={`font-medium ${colors.textPrimary} ${theme === 'sunset' ? 'hover:text-sunset-500' : 'hover:text-adventure-500'} transition-colors`}
            >
              Sign up here
            </Link>
          </p>
        </div>

        <div className={`mt-8 p-4 ${theme === 'sunset' ? 'bg-sunsetGold-50' : 'bg-adventure-50'} rounded-lg`}>
          <h3 className={`text-sm font-medium ${theme === 'sunset' ? 'text-sunsetGold-900' : 'text-adventure-900'} mb-2`}>Demo Account</h3>
          <p className={`text-xs ${theme === 'sunset' ? 'text-sunsetGold-700' : 'text-adventure-700'}`}>
            Email: demo@lca.com<br />
            Password: demo123
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;