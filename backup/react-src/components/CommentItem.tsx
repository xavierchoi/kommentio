import React, { useState } from 'react';
import { MessageSquare, Heart, Trash, Edit, CornerDownRight } from 'lucide-react';
import CommentForm from './CommentForm';
import { Comment, User } from '../types';
import { formatDate } from '../utils/formatDate';

interface CommentItemProps {
  comment: Comment;
  replies: Comment[];
  allComments: Comment[];
  currentUser: User | null;
  onReply: (content: string, parentId: string, user: User) => void;
  onEdit: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  onLike: (id: string) => void;
  level: number;
}

const CommentItem: React.FC<CommentItemProps> = ({ 
  comment, 
  replies,
  allComments,
  currentUser,
  onReply,
  onEdit,
  onDelete,
  onLike,
  level
}) => {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showReplies, setShowReplies] = useState(level < 1); // Auto-expand first level replies
  
  const handleReply = (content: string) => {
    if (currentUser) {
      onReply(content, comment.id, currentUser);
      setIsReplying(false);
    }
  };
  
  const handleEdit = (content: string) => {
    onEdit(comment.id, content);
    setIsEditing(false);
  };
  
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      onDelete(comment.id);
    }
  };
  
  // Function to get nested replies for display
  const getReplies = (parentId: string) => {
    return allComments.filter(c => c.parentId === parentId);
  };
  
  // Only allow 3 levels of nesting
  const canReply = level < 2;
  
  return (
    <div className={`${level > 0 ? 'mt-4' : ''}`}>
      <div className="flex">
        {/* Indentation lines for nested comments */}
        {level > 0 && (
          <div className="mr-3 flex items-stretch">
            <div className="border-l-2 border-gray-200 dark:border-gray-700"></div>
          </div>
        )}
        
        <div className="flex-1">
          <div className="bg-gray-50 dark:bg-gray-800/60 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {comment.user.avatar ? (
                  <img 
                    src={comment.user.avatar} 
                    alt={comment.user.name} 
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                    <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                      {comment.user.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="ml-3 flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {comment.user.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(comment.createdAt)}
                      {comment.edited && (
                        <span className="ml-2 italic">
                          (edited)
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                
                {isEditing ? (
                  <CommentForm 
                    onSubmit={handleEdit}
                    initialValue={comment.content}
                    buttonText="Save"
                    onCancel={() => setIsEditing(false)}
                  />
                ) : (
                  <div className="mt-2">
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  </div>
                )}
                
                {!isEditing && (
                  <div className="mt-2 flex items-center space-x-4">
                    <button
                      onClick={() => onLike(comment.id)}
                      className={`flex items-center text-xs ${
                        comment.liked 
                          ? 'text-red-500 dark:text-red-400' 
                          : 'text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400'
                      } transition-colors`}
                      aria-label="Like comment"
                    >
                      <Heart className="h-3.5 w-3.5 mr-1" />
                      <span>{comment.likes || 0}</span>
                    </button>
                    
                    {canReply && (
                      <button
                        onClick={() => {
                          if (currentUser) {
                            setIsReplying(!isReplying);
                          } else {
                            alert('Please login to reply');
                          }
                        }}
                        className="flex items-center text-xs text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                        aria-label="Reply to comment"
                      >
                        <MessageSquare className="h-3.5 w-3.5 mr-1" />
                        <span>Reply</span>
                      </button>
                    )}
                    
                    {currentUser && currentUser.id === comment.user.id && (
                      <>
                        <button
                          onClick={() => setIsEditing(true)}
                          className="flex items-center text-xs text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                          aria-label="Edit comment"
                        >
                          <Edit className="h-3.5 w-3.5 mr-1" />
                          <span>Edit</span>
                        </button>
                        
                        <button
                          onClick={handleDelete}
                          className="flex items-center text-xs text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                          aria-label="Delete comment"
                        >
                          <Trash className="h-3.5 w-3.5 mr-1" />
                          <span>Delete</span>
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {isReplying && currentUser && (
            <div className="mt-3 pl-6">
              <CommentForm 
                onSubmit={handleReply}
                placeholder={`Reply to ${comment.user.name}...`}
                buttonText="Reply"
                onCancel={() => setIsReplying(false)}
              />
            </div>
          )}
          
          {replies.length > 0 && (
            <div className="mt-3">
              {!showReplies ? (
                <button
                  onClick={() => setShowReplies(true)}
                  className="text-xs flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors ml-4"
                >
                  <CornerDownRight className="h-3.5 w-3.5 mr-1" />
                  Show {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                </button>
              ) : (
                <>
                  {replies.length > 3 && (
                    <button
                      onClick={() => setShowReplies(false)}
                      className="text-xs flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors ml-4 mb-2"
                    >
                      Hide replies
                    </button>
                  )}
                  <div className="space-y-4 pl-4">
                    {replies.map(reply => (
                      <CommentItem
                        key={reply.id}
                        comment={reply}
                        replies={getReplies(reply.id)}
                        allComments={allComments}
                        currentUser={currentUser}
                        onReply={onReply}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onLike={onLike}
                        level={level + 1}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentItem;