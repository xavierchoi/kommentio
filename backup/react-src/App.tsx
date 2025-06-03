import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import CommentSection from './components/CommentSection';
import Header from './components/Header';
import Footer from './components/Footer';

function App() {
  const [currentView, setCurrentView] = useState<'demo' | 'install' | 'about'>('demo');
  
  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex flex-col">
      <Header currentView={currentView} setCurrentView={setCurrentView} />
      
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {currentView === 'demo' && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-light-surface dark:bg-dark-surface rounded-lg shadow-md p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 lg:mb-8 border border-light-border dark:border-dark-border">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-light-text-primary dark:text-dark-text-primary mb-3 sm:mb-4">
                Demo Article
              </h1>
              <p className="text-sm sm:text-base text-light-text-secondary dark:text-dark-text-secondary mb-3 sm:mb-4">
                This is a sample article to demonstrate how our open-source comment system works. 
                The comment section below is fully functional - try adding a comment!
              </p>
              <p className="text-sm sm:text-base text-light-text-secondary dark:text-dark-text-secondary">
                Our comment system is designed to be lightweight, fast, and easy to integrate 
                into any website. It's completely free and open-source, with no ads or tracking.
              </p>
            </div>
            
            <CommentSection pageId="demo-page" />
          </div>
        )}
        
        {currentView === 'install' && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-light-surface dark:bg-dark-surface rounded-lg shadow-md p-4 sm:p-6 lg:p-8 border border-light-border dark:border-dark-border">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-light-text-primary dark:text-dark-text-primary mb-3 sm:mb-4">
                Installation
              </h1>
              <p className="text-sm sm:text-base text-light-text-secondary dark:text-dark-text-secondary mb-4 sm:mb-6">
                Adding our comment system to your website is as simple as adding a single line of code.
              </p>
              
              <h2 className="text-lg sm:text-xl font-semibold text-light-text-primary dark:text-dark-text-primary mb-2 sm:mb-3">
                Step 1: Add the script to your website
              </h2>
              <div className="bg-light-bg dark:bg-dark-bg rounded-md p-3 sm:p-4 mb-4 sm:mb-6 overflow-x-auto border border-light-border dark:border-dark-border">
                <code className="text-xs sm:text-sm text-light-text-primary dark:text-dark-text-primary">
                  &lt;script src="https://comments.example.com/embed.js" async&gt;&lt;/script&gt;
                </code>
              </div>
              
              <h2 className="text-lg sm:text-xl font-semibold text-light-text-primary dark:text-dark-text-primary mb-2 sm:mb-3">
                Step 2: Add a container for comments
              </h2>
              <div className="bg-light-bg dark:bg-dark-bg rounded-md p-3 sm:p-4 mb-4 sm:mb-6 overflow-x-auto border border-light-border dark:border-dark-border">
                <code className="text-xs sm:text-sm text-light-text-primary dark:text-dark-text-primary">
                  &lt;div id="comments" data-page-id="unique-page-identifier"&gt;&lt;/div&gt;
                </code>
              </div>
              
              <p className="text-sm sm:text-base text-light-text-secondary dark:text-dark-text-secondary mt-4">
                That's it! The comment system will automatically initialize and render in the specified container.
                Make sure to provide a unique page-id for each page where you want to display comments.
              </p>
            </div>
          </div>
        )}
        
        {currentView === 'about' && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-light-surface dark:bg-dark-surface rounded-lg shadow-md p-4 sm:p-6 lg:p-8 border border-light-border dark:border-dark-border">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-light-text-primary dark:text-dark-text-primary mb-3 sm:mb-4">
                About kommentio
              </h1>
              <p className="text-sm sm:text-base text-light-text-secondary dark:text-dark-text-secondary mb-4 sm:mb-6">
                Our open-source comment system was created to provide a free, lightweight alternative to 
                commercial options like Disqus that often include unwanted ads and tracking.
              </p>
              
              <h2 className="text-lg sm:text-xl font-semibold text-light-text-primary dark:text-dark-text-primary mb-2 sm:mb-3">
                Key Features
              </h2>
              <ul className="list-disc pl-4 sm:pl-5 mb-4 sm:mb-6 text-sm sm:text-base text-light-text-secondary dark:text-dark-text-secondary space-y-1 sm:space-y-2">
                <li>Completely free and open-source</li>
                <li>No ads or unwanted tracking</li>
                <li>Lightweight (only ~50KB)</li>
                <li>Supports threaded comments</li>
                <li>Real-time updates</li>
                <li>Social login options</li>
                <li>Dark mode support</li>
                <li>Spam protection</li>
              </ul>
              
              <h2 className="text-lg sm:text-xl font-semibold text-light-text-primary dark:text-dark-text-primary mb-2 sm:mb-3">
                Technical Details
              </h2>
              <p className="text-sm sm:text-base text-light-text-secondary dark:text-dark-text-secondary mb-3 sm:mb-4">
                Built with modern web technologies and hosted on reliable infrastructure:
              </p>
              <ul className="list-disc pl-4 sm:pl-5 mb-4 sm:mb-6 text-sm sm:text-base text-light-text-secondary dark:text-dark-text-secondary space-y-1 sm:space-y-2">
                <li>Frontend: Vanilla JavaScript with modern CSS</li>
                <li>Backend: Supabase (PostgreSQL, Auth, Realtime)</li>
                <li>Hosting: Vercel (free tier)</li>
                <li>CDN: Cloudflare (free tier)</li>
              </ul>
              
              <h2 className="text-lg sm:text-xl font-semibold text-light-text-primary dark:text-dark-text-primary mb-2 sm:mb-3">
                Open Source
              </h2>
              <p className="text-sm sm:text-base text-light-text-secondary dark:text-dark-text-secondary">
                Our code is fully open source and available on GitHub. We welcome contributions from the community!
              </p>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}

export default App;