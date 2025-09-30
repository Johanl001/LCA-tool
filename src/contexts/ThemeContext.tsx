import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Theme = 'sunset' | 'adventure';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('sunset'); // Default to SUNSET theme

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('lca_theme') as Theme;
    if (savedTheme && (savedTheme === 'sunset' || savedTheme === 'adventure')) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('lca_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'sunset' ? 'adventure' : 'sunset');
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Theme-specific color utilities
export const getThemeColors = (theme: Theme) => {
  if (theme === 'sunset') {
    return {
      primary: {
        light: 'bg-sunset-100',
        main: 'bg-sunset-500',
        dark: 'bg-sunset-700',
        darker: 'bg-sunset-900'
      },
      secondary: {
        light: 'bg-sunsetRed-100',
        main: 'bg-sunsetRed-500',
        dark: 'bg-sunsetRed-700',
        darker: 'bg-sunsetRed-900'
      },
      accent: {
        light: 'bg-sunsetGold-100',
        main: 'bg-sunsetGold-500',
        dark: 'bg-sunsetGold-700',
        darker: 'bg-sunsetGold-900'
      },
      gradient: 'bg-sunset-gradient',
      navbar: 'from-sunset-900 to-sunset-800',
      textPrimary: 'text-sunset-600',
      textSecondary: 'text-sunsetRed-600',
      textAccent: 'text-sunsetGold-600'
    };
  } else {
    return {
      primary: {
        light: 'bg-adventure-100',
        main: 'bg-adventure-500',
        dark: 'bg-adventure-700',
        darker: 'bg-adventure-900'
      },
      secondary: {
        light: 'bg-adventureGreen-100',
        main: 'bg-adventureGreen-500',
        dark: 'bg-adventureGreen-700',
        darker: 'bg-adventureGreen-900'
      },
      accent: {
        light: 'bg-adventureBrown-100',
        main: 'bg-adventureBrown-500',
        dark: 'bg-adventureBrown-700',
        darker: 'bg-adventureBrown-900'
      },
      gradient: 'bg-adventure-gradient',
      navbar: 'from-adventure-900 to-adventure-800',
      textPrimary: 'text-adventure-600',
      textSecondary: 'text-adventureGreen-600',
      textAccent: 'text-adventureBrown-600'
    };
  }
};