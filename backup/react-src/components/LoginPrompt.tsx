import React from 'react';
import { Github, Mail, Facebook } from 'lucide-react';

interface LoginPromptProps {
  onLogin: (provider: string) => void;
}

const LoginPrompt: React.FC<LoginPromptProps> = ({ onLogin }) => {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
      <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 text-center">
        Sign in to join the conversation
      </p>
      
      <div className="flex flex-wrap justify-center gap-3">
        <button
          onClick={() => onLogin('google')}
          className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032 s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2 C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
            />
          </svg>
          Google
        </button>
        
        <button
          onClick={() => onLogin('github')}
          className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <Github className="h-4 w-4 mr-2" />
          GitHub
        </button>
        
        <button
          onClick={() => onLogin('facebook')}
          className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <Facebook className="h-4 w-4 mr-2" />
          Facebook
        </button>
      </div>
      
      <div className="mt-4 flex items-center justify-center">
        <div className="border-t border-gray-200 dark:border-gray-700 w-full"></div>
        <span className="px-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50">Or</span>
        <div className="border-t border-gray-200 dark:border-gray-700 w-full"></div>
      </div>
      
      <div className="mt-4 text-center">
        <button
          onClick={() => onLogin('anonymous')}
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
        >
          Continue as guest
        </button>
      </div>
    </div>
  );
};

export default LoginPrompt;