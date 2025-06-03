import React from 'react';
import CommentItem from './CommentItem';
import { Comment, User } from '../types';

interface CommentListProps {
  comments: Comment[];
  rootComments: Comment[];
  currentUser: User | null;
  onReply: (content: string, parentId: string, user: User) => void;
  onEdit: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  onLike: (id: string) => void;
}

const CommentList: React.FC<CommentListProps> = ({ 
  comments, 
  rootComments,
  currentUser,
  onReply,
  onEdit,
  onDelete,
  onLike
}) => {
  // Function to get replies for a specific comment
  const getReplies = (parentId: string) => {
    return comments.filter(comment => comment.parentId === parentId);
  };
  
  return (
    <div className="space-y-6">
      {rootComments.map(comment => (
        <CommentItem 
          key={comment.id}
          comment={comment}
          replies={getReplies(comment.id)}
          allComments={comments}
          currentUser={currentUser}
          onReply={onReply}
          onEdit={onEdit}
          onDelete={onDelete}
          onLike={onLike}
          level={0}
        />
      ))}
    </div>
  );
};

export default CommentList;