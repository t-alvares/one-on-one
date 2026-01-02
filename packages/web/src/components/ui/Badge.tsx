import { forwardRef, type HTMLAttributes } from 'react';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
type BadgeSize = 'sm' | 'md';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-surface-tertiary text-text-secondary',
  primary: 'bg-wawanesa-blue-light text-wawanesa-blue',
  success: 'bg-grassy-green-light text-grassy-green',
  warning: 'bg-prairie-gold-light text-yellow-700',
  error: 'bg-error-light text-error',
  info: 'bg-midnight-sky-light text-midnight-sky',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-0.5',
};

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    { variant = 'default', size = 'sm', dot = false, className = '', children, ...props },
    ref
  ) => {
    return (
      <span
        ref={ref}
        className={`
          inline-flex items-center gap-1.5
          font-medium rounded-full
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${className}
        `}
        {...props}
      >
        {dot && (
          <span
            className={`
              w-1.5 h-1.5 rounded-full
              ${variant === 'default' ? 'bg-text-tertiary' : 'bg-current'}
            `}
            aria-hidden="true"
          />
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };
export type { BadgeProps, BadgeVariant, BadgeSize };
