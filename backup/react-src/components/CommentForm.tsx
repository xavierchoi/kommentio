import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

interface CommentFormProps {
  onSubmit: (content: string) => void;
  placeholder?: string;
  buttonText?: string;
  initialValue?: string;
  onCancel?: () => void;
}

const CommentForm: React.FC<CommentFormProps> = ({ 
  onSubmit, 
  placeholder = 'Add a comment...', 
  buttonText = 'Submit',
  initialValue = '',
  onCancel
}) => {
  const [content, setContent] = useState(initialValue);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      
      // Focus and place cursor at end if there's initial content
      if (initialValue) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(
          initialValue.length,
          initialValue.length
        );
      }
    }
  }, [initialValue]);
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onSubmit(content);
      setContent('');
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          placeholder={placeholder}
          rows={1}
          className="w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border-none focus:outline-none resize-none"
          aria-label="Comment text"
        />
        
        <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 px-3 py-2">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {/* Optional character limit or formatting tips can go here */}
          </div>
          
          <div className="flex space-x-2">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
            )}
            
            <button
              type="submit"
              disabled={!content.trim()}
              className={`
                px-3 py-1 rounded-md text-xs font-medium flex items-center
                ${content.trim() 
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'}
                transition-colors
              `}
            >
              <Send className="h-3.5 w-3.5 mr-1" />
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default CommentForm;