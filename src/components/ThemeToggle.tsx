import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Palette, Sun, Moon } from 'lucide-react';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300
        ${theme === 'sunset' 
          ? 'bg-sunset-100 text-sunset-700 hover:bg-sunset-200 border border-sunset-200' 
          : 'bg-adventure-100 text-adventure-700 hover:bg-adventure-200 border border-adventure-200'
        }
      `}
      title={`Switch to ${theme === 'sunset' ? 'Adventure' : 'Sunset'} theme`}
    >
      <div className="flex items-center space-x-2">
        {theme === 'sunset' ? (
          <>
            <Sun className="h-4 w-4 text-sunset-600" />
            <span className="text-sm font-medium">Sunset</span>
          </>
        ) : (
          <>
            <Moon className="h-4 w-4 text-adventure-600" />
            <span className="text-sm font-medium">Adventure</span>
          </>
        )}
      </div>
      
      {/* Theme preview dots */}
      <div className="flex space-x-1 ml-2">
        {theme === 'sunset' ? (
          <>
            <div className="w-2 h-2 rounded-full bg-sunset-500"></div>
            <div className="w-2 h-2 rounded-full bg-sunsetRed-500"></div>
            <div className="w-2 h-2 rounded-full bg-sunsetGold-500"></div>
          </>
        ) : (
          <>
            <div className="w-2 h-2 rounded-full bg-adventure-500"></div>
            <div className="w-2 h-2 rounded-full bg-adventureGreen-500"></div>
            <div className="w-2 h-2 rounded-full bg-adventureBrown-500"></div>
          </>
        )}
      </div>
    </button>
  );
};

export default ThemeToggle;