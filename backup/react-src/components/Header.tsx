import React, { useState } from 'react';
import { MessageSquare, Moon, Sun } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

interface HeaderProps {
  currentView: 'demo' | 'install' | 'about';
  setCurrentView: (view: 'demo' | 'install' | 'about') => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView }) => {
  const { darkMode, toggleDarkMode } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <header className="bg-light-surface/80 dark:bg-dark-surface/80 border-b border-light-border dark:border-dark-border sticky top-0 z-10 backdrop-blur-sm shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16 lg:h-20">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-primary-500" />
            <span className="text-lg sm:text-xl font-bold text-light-text-primary dark:text-dark-text-primary">kommentio</span>
          </div>
          
          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
            <button 
              onClick={() => setCurrentView('demo')}
              className={`text-sm lg:text-base font-medium transition-colors ${
                currentView === 'demo' 
                  ? 'text-primary-500 dark:text-primary-400' 
                  : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-500 dark:hover:text-primary-400'
              }`}
            >
              Demo
            </button>
            <button 
              onClick={() => setCurrentView('install')}
              className={`text-sm lg:text-base font-medium transition-colors ${
                currentView === 'install' 
                  ? 'text-primary-500 dark:text-primary-400' 
                  : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-500 dark:hover:text-primary-400'
              }`}
            >
              Installation
            </button>
            <button 
              onClick={() => setCurrentView('about')}
              className={`text-sm lg:text-base font-medium transition-colors ${
                currentView === 'about' 
                  ? 'text-primary-500 dark:text-primary-400' 
                  : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-500 dark:hover:text-primary-400'
              }`}
            >
              About
            </button>
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-full text-light-text-tertiary dark:text-dark-text-tertiary hover:bg-light-bg dark:hover:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </nav>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={toggleDarkMode}
              className="p-2 mr-2 rounded-full text-light-text-tertiary dark:text-dark-text-tertiary hover:bg-light-bg dark:hover:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-light-text-tertiary dark:text-dark-text-tertiary hover:bg-light-bg dark:hover:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="Open menu"
            >
              <svg className="h-5 w-5 sm:h-6 sm:w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-2 border-t border-light-border dark:border-dark-border">
            <div className="flex flex-col space-y-2">
              <button 
                onClick={() => {
                  setCurrentView('demo');
                  setMobileMenuOpen(false);
                }}
                className={`px-4 py-2.5 text-sm font-medium rounded-md ${
                  currentView === 'demo' 
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-500 dark:text-primary-400' 
                    : 'text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-bg dark:hover:bg-dark-bg'
                }`}
              >
                Demo
              </button>
              <button 
                onClick={() => {
                  setCurrentView('install');
                  setMobileMenuOpen(false);
                }}
                className={`px-4 py-2.5 text-sm font-medium rounded-md ${
                  currentView === 'install' 
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-500 dark:text-primary-400' 
                    : 'text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-bg dark:hover:bg-dark-bg'
                }`}
              >
                Installation
              </button>
              <button 
                onClick={() => {
                  setCurrentView('about');
                  setMobileMenuOpen(false);
                }}
                className={`px-4 py-2.5 text-sm font-medium rounded-md ${
                  currentView === 'about' 
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-500 dark:text-primary-400' 
                    : 'text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-bg dark:hover:bg-dark-bg'
                }`}
              >
                About
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;