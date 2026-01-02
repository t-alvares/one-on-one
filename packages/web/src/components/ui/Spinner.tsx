import { forwardRef, type HTMLAttributes } from 'react';

type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';

interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: SpinnerSize;
  color?: 'primary' | 'white' | 'current';
  label?: string;
}

const sizeStyles: Record<SpinnerSize, string> = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-[3px]',
  xl: 'w-12 h-12 border-4',
};

const colorStyles = {
  primary: 'border-wawanesa-blue border-t-transparent',
  white: 'border-white border-t-transparent',
  current: 'border-current border-t-transparent',
};

const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
  ({ size = 'md', color = 'primary', label = 'Loading', className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="status"
        aria-label={label}
        className={`inline-flex items-center justify-center ${className}`}
        {...props}
      >
        <div
          className={`
            rounded-full animate-spin
            ${sizeStyles[size]}
            ${colorStyles[color]}
          `}
          aria-hidden="true"
        />
        <span className="sr-only">{label}</span>
      </div>
    );
  }
);

Spinner.displayName = 'Spinner';

// Full-page loading spinner
function LoadingScreen({ message }: { message?: string }) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-surface z-50">
      <Spinner size="xl" />
      {message && (
        <p className="mt-4 text-text-secondary animate-pulse">{message}</p>
      )}
    </div>
  );
}

// Inline loading indicator
function LoadingInline({
  size = 'sm',
  text,
}: {
  size?: SpinnerSize;
  text?: string;
}) {
  return (
    <div className="inline-flex items-center gap-2 text-text-secondary">
      <Spinner size={size} color="current" />
      {text && <span className="text-sm">{text}</span>}
    </div>
  );
}

export { Spinner, LoadingScreen, LoadingInline };
export type { SpinnerProps, SpinnerSize };
