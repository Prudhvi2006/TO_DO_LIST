import React from 'react';

interface TaskToggleProps {
  id: string;
  checked: boolean;
  onChange: (newChecked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showLabels?: boolean;
}

export const TaskToggle: React.FC<TaskToggleProps> = ({
  id,
  checked,
  onChange,
  disabled = false,
  size = 'md',
  className = '',
  showLabels = false,
}) => {
  // Scaling container dimensions
  let scaleClass = 'scale-[0.58]';
  let containerSize = 'w-[54px] h-[32px]';

  if (size === 'sm') {
    scaleClass = 'scale-[0.45]';
    containerSize = 'w-[42px] h-[25px]';
  } else if (size === 'lg') {
    scaleClass = 'scale-[0.75]';
    containerSize = 'w-[70px] h-[40px]';
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!disabled) {
      onChange(e.target.checked);
    }
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${containerSize} select-none ${className}`}
      onClick={(e) => e.stopPropagation()}
      title={checked ? 'Completed (Night) • Click to mark as not done' : 'Active (Day) • Click to mark as done'}
    >
      <div className={`transform ${scaleClass} origin-center transition-transform`}>
        <div className={`toggleWrapper ${showLabels ? '' : 'task-toggle-wrapper'}`}>
          <input
            className="input"
            id={id}
            type="checkbox"
            checked={Boolean(checked)}
            onChange={handleChange}
            disabled={disabled}
            aria-label={checked ? 'Mark task as incomplete' : 'Mark task as completed'}
          />
          <label className="toggle" htmlFor={id}>
            <span className="toggle__handler">
              <span className="crater crater--1" />
              <span className="crater crater--2" />
              <span className="crater crater--3" />
            </span>
            <span className="star star--1" />
            <span className="star star--2" />
            <span className="star star--3" />
            <span className="star star--4" />
            <span className="star star--5" />
            <span className="star star--6" />
          </label>
        </div>
      </div>
    </div>
  );
};
