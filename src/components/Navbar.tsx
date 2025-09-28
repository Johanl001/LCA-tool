import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Upload, 
  Settings, 
  Brain, 
  FileText, 
  GitCompare, 
  User, 
  LogOut,
  Leaf
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
    <div className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-green-900 to-green-800 text-white shadow-xl">
      {/* Header */}
      <div className="p-6 border-b border-green-700">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-600 rounded-lg">
            <Leaf className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">LCA Platform</h1>
            <p className="text-green-200 text-sm">Life Cycle Assessment</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 bg-green-800/50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
            <User className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-green-200 truncate">{user.email}</p>
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
                      ? 'bg-green-600 text-white shadow-lg'
                      : 'text-green-100 hover:bg-green-700/50 hover:text-white'
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

      {/* Logout */}
      <div className="p-4 border-t border-green-700">
        <button
          onClick={onLogout}
          className="flex items-center space-x-3 px-4 py-3 rounded-lg text-green-100 hover:bg-red-600 hover:text-white transition-all duration-200 w-full"
        >
          <LogOut className="h-5 w-5" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Navbar;