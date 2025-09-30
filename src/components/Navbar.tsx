import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme, getThemeColors } from '../contexts/ThemeContext';
import { 
  BarChart3, 
  Upload, 
  Settings, 
  Brain, 
  FileText, 
  GitCompare, 
  User, 
  LogOut,
  Leaf,
  Palette
} from 'lucide-react';

interface NavbarProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const colors = getThemeColors(theme);

  const navItems = [
    { path: '/dashboard', icon: BarChart3, label: 'Dashboard' },
    { path: '/submit', icon: Upload, label: 'Submit Process Data' },
    { path: '/simulation', icon: Settings, label: 'Scenario Simulation' },
    { path: '/insights', icon: Brain, label: 'AI Insights' },
    { path: '/reports', icon: FileText, label: 'Reports / Exports' },
    { path: '/compare', icon: GitCompare, label: 'Compare Projects' },
    { path: '/profile', icon: User, label: 'User Profile' }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className={`fixed left-0 top-0 h-full w-64 bg-gradient-to-b ${colors.navbar} text-white shadow-xl`}>
      {/* Header */}
      <div className={`p-6 border-b ${theme === 'sunset' ? 'border-sunset-700' : 'border-adventure-700'}`}>
        <div className="flex items-center space-x-3">
          <div className={`p-2 ${theme === 'sunset' ? 'bg-sunset-600' : 'bg-adventure-600'} rounded-lg`}>
            <Leaf className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">LCA Platform</h1>
            <p className={`${theme === 'sunset' ? 'text-sunset-200' : 'text-adventure-200'} text-sm`}>Life Cycle Assessment</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className={`p-4 ${theme === 'sunset' ? 'bg-sunset-800/50' : 'bg-adventure-800/50'}`}>
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 ${theme === 'sunset' ? 'bg-sunset-600' : 'bg-adventure-600'} rounded-full flex items-center justify-center`}>
            <User className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className={`text-xs ${theme === 'sunset' ? 'text-sunset-200' : 'text-adventure-200'} truncate`}>{user.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive(item.path)
                      ? `${theme === 'sunset' ? 'bg-sunset-600' : 'bg-adventure-600'} text-white shadow-lg`
                      : `${theme === 'sunset' ? 'text-sunset-100 hover:bg-sunset-700/50' : 'text-adventure-100 hover:bg-adventure-700/50'} hover:text-white`
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Theme Switcher & Logout */}
      <div className={`p-4 border-t ${theme === 'sunset' ? 'border-sunset-700' : 'border-adventure-700'} space-y-2`}>
        <button
          onClick={toggleTheme}
          className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${theme === 'sunset' ? 'text-sunset-100 hover:bg-sunset-600' : 'text-adventure-100 hover:bg-adventure-600'} hover:text-white transition-all duration-200 w-full`}
        >
          <Palette className="h-5 w-5" />
          <span className="text-sm font-medium">
            {theme === 'sunset' ? 'Adventure Theme' : 'Sunset Theme'}
          </span>
        </button>
        
        <button
          onClick={onLogout}
          className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${theme === 'sunset' ? 'text-sunset-100' : 'text-adventure-100'} hover:bg-red-600 hover:text-white transition-all duration-200 w-full`}
        >
          <LogOut className="h-5 w-5" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Navbar;