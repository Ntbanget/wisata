import React from 'react';
import { AlertCircle, X } from 'lucide-react';

const ErrorMessage = ({ error, onDismiss, className = '' }) => {
  if (!error) return null;

  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3 ${className}`}>
      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
      <div className="flex-grow">
        <h4 className="text-red-800 font-medium">Error</h4>
        <p className="text-red-700 text-sm mt-1">
          {typeof error === 'string' ? error : error.message || 'Something went wrong'}
        </p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-red-400 hover:text-red-600 transition-colors duration-200"
          aria-label="Dismiss error"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
