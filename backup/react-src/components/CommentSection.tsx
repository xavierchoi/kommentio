import React, { useState, useEffect } from 'react';
import CommentList from './CommentList';
import CommentForm from './CommentForm';
import LoginPrompt from './LoginPrompt';
import { useComments } from '../hooks/useComments';
import { Comment, User } from '../types';

interface CommentSectionProps {
  pageId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ pageId }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sort, setSort] = useState<'newest' | 'oldest' | 'popular'>('newest');
  
  const { 
    comments, 
    isLoading, 
    error, 
    addComment, 
    updateComment,
    deleteComment,
    likeComment
  } = useComments(pageId);
  
  // Mock login/logout functions for the demo
  const handleLogin = (provider: string) => {
    // In a real implementation, this would authenticate with Supabase
    const mockUsers: Record<string, User> = {
      'google': { 
        id: '1', 
        name: 'Jane Smith', 
        avatar: 'https://randomuser.me/api/portraits/women/42.jpg',
        provider: 'google'
      },
      'github': { 
        id: '2', 
        name: 'John Developer', 
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        provider: 'github'
      },
      'facebook': { 
        id: '3', 
        name: 'Alex Johnson', 
        avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
        provider: 'facebook'
      },
      'anonymous': { 
        id: '4', 
        name: 'Anonymous User', 
        avatar: '',
        provider: 'anonymous'
      }
    };
    
    setCurrentUser(mockUsers[provider] || mockUsers.anonymous);
  };
  
  const handleLogout = () => {
    setCurrentUser(null);
  };
  
  // Sort comments based on selected sort option
  const sortedComments = [...comments].sort((a, b) => {
    if (sort === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sort === 'oldest') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else {
      // popular
      return (b.likes || 0) - (a.likes || 0);
    }
  });
  
  const rootComments = sortedComments.filter(comment => !comment.parentId);
  const commentCount = comments.length;
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Comments ({commentCount})
        </h2>
        
        <div className="flex items-center">
          <label htmlFor="sort-comments" className="mr-2 text-sm text-gray-500 dark:text-gray-400">
            Sort by:
          </label>
          <select 
            id="sort-comments"
            value={sort}
            onChange={(e) => setSort(e.target.value as 'newest' | 'oldest' | 'popular')}
            className="text-sm bg-gray-100 dark:bg-gray-700 border-none rounded-md text-gray-700 dark:text-gray-300 py-1 px-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="popular">Popular</option>
          </select>
        </div>
      </div>
      
      {currentUser ? (
        <>
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              {currentUser.avatar ? (
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.name} 
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                  <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                    {currentUser.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <div className="ml-3 flex items-center">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {currentUser.name}
              </span>
              <button 
                onClick={handleLogout}
                className="ml-2 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                (Logout)
              </button>
            </div>
          </div>
          
          <CommentForm 
            onSubmit={(content) => addComment(content, null, currentUser)} 
            placeholder="Write a comment..."
            buttonText="Post Comment"
          />
        </>
      ) : (
        <LoginPrompt onLogin={handleLogin} />
      )}
      
      <div className="mt-8">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500 dark:text-red-400">
            Error loading comments. Please try again.
          </div>
        ) : rootComments.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Be the first to comment!
          </div>
        ) : (
          <CommentList 
            comments={sortedComments}
            rootComments={rootComments}
            currentUser={currentUser}
            onReply={addComment}
            onEdit={updateComment}
            onDelete={deleteComment}
            onLike={likeComment}
          />
        )}
      </div>
    </div>
  );
};

export default CommentSection;