import { useState, useEffect } from 'react';
import { Comment, User } from '../types';
import { v4 as uuidv4 } from '../utils/uuid';

// This is a mock implementation for the demo
// In production, this would use Supabase for data storage and real-time updates
export function useComments(pageId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Simulate loading comments from a backend
    const loadComments = async () => {
      try {
        setIsLoading(true);
        
        // In a real implementation, this would fetch from Supabase
        // For demo purposes, we'll use mock data with a slight delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockComments: Comment[] = [
          {
            id: '1',
            content: "This is such a great alternative to Disqus! Love that it's ad-free and open source.",
            user: {
              id: '101',
              name: 'Sarah Chen',
              avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
              provider: 'github'
            },
            createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
            likes: 12,
            parentId: null,
            edited: false
          },
          {
            id: '2',
            content: "How does this compare to other open source comment systems like Commento?",
            user: {
              id: '102',
              name: 'Mike Johnson',
              avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
              provider: 'google'
            },
            createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
            likes: 5,
            parentId: null,
            edited: false
          },
          {
            id: '3',
            content: "Great question! This system is much lighter (50KB vs 200KB) and offers more social login options, especially for Korean users.",
            user: {
              id: '103',
              name: 'Emily Wong',
              avatar: 'https://randomuser.me/api/portraits/women/33.jpg',
              provider: 'github'
            },
            createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
            likes: 7,
            parentId: '2',
            edited: true
          },
          {
            id: '4',
            content: "Plus the AI spam filtering is a killer feature that most other comment systems don't have!",
            user: {
              id: '104',
              name: 'Alex Kim',
              avatar: 'https://randomuser.me/api/portraits/men/64.jpg',
              provider: 'facebook'
            },
            createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
            likes: 3,
            parentId: '3',
            edited: false
          },
          {
            id: '5',
            content: "Is there an easy way to migrate from Disqus to this system?",
            user: {
              id: '105',
              name: 'Anonymous',
              avatar: '',
              provider: 'anonymous'
            },
            createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
            likes: 1,
            parentId: null,
            edited: false
          }
        ];
        
        setComments(mockComments);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load comments');
        setIsLoading(false);
      }
    };
    
    loadComments();
  }, [pageId]);
  
  // Add a new comment
  const addComment = (content: string, parentId: string | null, user: User) => {
    const newComment: Comment = {
      id: uuidv4(),
      content,
      user,
      createdAt: new Date().toISOString(),
      likes: 0,
      parentId,
      edited: false
    };
    
    setComments(prevComments => [...prevComments, newComment]);
    
    // In a real implementation, this would also save to Supabase
  };
  
  // Update an existing comment
  const updateComment = (id: string, content: string) => {
    setComments(prevComments => 
      prevComments.map(comment => 
        comment.id === id 
          ? { ...comment, content, edited: true } 
          : comment
      )
    );
    
    // In a real implementation, this would also update in Supabase
  };
  
  // Delete a comment and its replies
  const deleteComment = (id: string) => {
    // Get all descendent comment IDs (replies to replies, etc.)
    const getDescendentIds = (commentId: string): string[] => {
      const directReplies = comments.filter(c => c.parentId === commentId);
      const descendentIds = directReplies.map(r => r.id);
      
      for (const replyId of descendentIds) {
        descendentIds.push(...getDescendentIds(replyId));
      }
      
      return descendentIds;
    };
    
    const idsToRemove = [id, ...getDescendentIds(id)];
    
    setComments(prevComments => 
      prevComments.filter(comment => !idsToRemove.includes(comment.id))
    );
    
    // In a real implementation, this would also delete from Supabase
  };
  
  // Like/unlike a comment
  const likeComment = (id: string) => {
    setComments(prevComments => 
      prevComments.map(comment => 
        comment.id === id 
          ? { 
              ...comment, 
              likes: comment.liked ? (comment.likes || 1) - 1 : (comment.likes || 0) + 1,
              liked: !comment.liked
            } 
          : comment
      )
    );
    
    // In a real implementation, this would also update in Supabase
  };
  
  return { 
    comments, 
    isLoading, 
    error, 
    addComment, 
    updateComment, 
    deleteComment,
    likeComment
  };
}