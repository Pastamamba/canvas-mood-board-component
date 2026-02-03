import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  variant?: 'primary' | 'secondary' | 'muted';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  message = 'Loading...', 
  variant = 'primary' 
}) => {
  return (
    <div className={`loading-container loading-${size}`}>
      <div className={`loading-spinner spinner-${variant}`}></div>
      {message && <span className="loading-message">{message}</span>}
    </div>
  );
};

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`btn btn-${variant} btn-${size} ${loading ? 'btn-loading' : ''} ${className}`}
    >
      {loading ? (
        <>
          <LoadingSpinner size="sm" message="" variant="secondary" />
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

interface InputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
  autoFocus?: boolean;
  'aria-label'?: string;
}

export const Input: React.FC<InputProps> = ({
  value,
  onChange,
  onBlur,
  onKeyDown,
  placeholder,
  disabled = false,
  error,
  className = '',
  autoFocus = false,
  'aria-label': ariaLabel,
}) => {
  return (
    <div className="input-container">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        aria-label={ariaLabel}
        className={`input ${error ? 'input-error' : ''} ${className}`}
      />
      {error && <span className="input-error-message">{error}</span>}
    </div>
  );
};

export default { LoadingSpinner, Button, Input };