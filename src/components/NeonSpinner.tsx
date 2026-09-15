import React from 'react';

interface NeonSpinnerProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const NeonSpinner: React.FC<NeonSpinnerProps> = ({
  text,
  size = 'lg',
  className = '',
}) => {
  const scaleClass =
    size === 'sm' ? 'scale-50' : size === 'md' ? 'scale-75' : 'scale-100';

  return (
    <div className={`flex flex-col items-center justify-center gap-4 select-none ${className}`}>
      <div className={`spinner transition-transform duration-300 ${scaleClass}`}>
        <div className="spinner1"></div>
      </div>
      {text && (
        <span className="text-xs font-bold tracking-wider uppercase text-slate-700 dark:text-slate-200">
          {text}
        </span>
      )}
    </div>
  );
};
