import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  header?: ReactNode;
  headerAction?: ReactNode;
  footer?: ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
}

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      header,
      headerAction,
      footer,
      padding = 'md',
      hoverable = false,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={`
          bg-surface border border-border rounded-lg shadow-soft
          ${hoverable ? 'transition-shadow duration-200 hover:shadow-card cursor-pointer' : ''}
          ${className}
        `}
        {...props}
      >
        {header && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div className="font-medium text-text-primary">{header}</div>
            {headerAction && <div>{headerAction}</div>}
          </div>
        )}
        <div className={paddingStyles[padding]}>{children}</div>
        {footer && (
          <div className="px-6 py-4 border-t border-border bg-surface-secondary rounded-b-lg">
            {footer}
          </div>
        )}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Card sub-components for composition
const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className = '', children, ...props }, ref) => (
    <div
      ref={ref}
      className={`px-6 py-4 border-b border-border ${className}`}
      {...props}
    >
      {children}
    </div>
  )
);
CardHeader.displayName = 'CardHeader';

const CardBody = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className = '', children, ...props }, ref) => (
    <div ref={ref} className={`p-6 ${className}`} {...props}>
      {children}
    </div>
  )
);
CardBody.displayName = 'CardBody';

const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className = '', children, ...props }, ref) => (
    <div
      ref={ref}
      className={`px-6 py-4 border-t border-border bg-surface-secondary rounded-b-lg ${className}`}
      {...props}
    >
      {children}
    </div>
  )
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardBody, CardFooter };
export type { CardProps };
