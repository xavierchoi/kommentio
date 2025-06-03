import React from 'react';
import { Github } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-light-surface dark:bg-dark-surface border-t border-light-border dark:border-dark-border py-4 sm:py-6">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <div className="flex items-center mb-4 sm:mb-0">
            <span className="text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary">
              © {new Date().getFullYear()} kommentio. Free and open source.
            </span>
          </div>
          
          <div className="flex items-center space-x-4 sm:space-x-6">
            <a 
              href="#" 
              className="text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors"
            >
              Documentation
            </a>
            <a 
              href="#" 
              className="text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors"
            >
              Privacy
            </a>
            <a 
              href="#" 
              className="text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors"
            >
              Terms
            </a>
            <a 
              href="#" 
              className="text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors"
              aria-label="GitHub"
            >
              <Github className="h-4 w-4 sm:h-5 sm:w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;