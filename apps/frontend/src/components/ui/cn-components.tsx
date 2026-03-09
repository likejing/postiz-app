// 中文优化的通用组件样式
// Chinese-Optimized Common Component Styles

import { FC, ReactNode, ButtonHTMLAttributes, InputHTMLAttributes } from 'react';
import clsx from 'clsx';

// ============================================
// 中文优化按钮组件
// ============================================
interface CNButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'text' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}

export const CNButton: FC<CNButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  loading = false,
  icon,
  children,
  className,
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 rounded-cn-md disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'bg-btnPrimary text-white hover:opacity-90 active:opacity-80',
    secondary: 'bg-newBgColorInner text-textColor border border-newTableBorder hover:bg-boxHover',
    outline: 'bg-transparent text-textColor border-2 border-btnPrimary hover:bg-btnPrimary hover:text-white',
    text: 'bg-transparent text-textColor hover:bg-boxHover',
    danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700',
  };

  const sizeClasses = {
    small: 'h-8 px-3 text-xs min-w-[64px]',
    medium: 'h-10 px-5 text-sm min-w-[88px]',
    large: 'h-12 px-7 text-base min-w-[120px]',
  };

  return (
    <button
      className={clsx(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        'font-sans-cn tracking-cn-normal',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {icon && !loading && icon}
      <span className="leading-cn-normal">{children}</span>
    </button>
  );
};

// ============================================
// 中文优化输入框组件
// ============================================
interface CNInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const CNInput: FC<CNInputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className,
  ...props
}) => {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm font-medium text-textColor font-sans-cn tracking-cn-normal">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {leftIcon}
          </div>
        )}
        <input
          className={clsx(
            'w-full h-10 px-4 text-sm bg-newBgColorInner border border-newTableBorder rounded-cn-md',
            'text-textColor placeholder-gray-400',
            'focus:outline-none focus:border-btnPrimary focus:ring-2 focus:ring-btnPrimary focus:ring-opacity-20',
            'transition-all duration-200',
            'font-sans-cn tracking-cn-normal leading-cn-normal',
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <p className="text-xs text-red-500 font-sans-cn">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-xs text-gray-400 font-sans-cn">{helperText}</p>
      )}
    </div>
  );
};

// ============================================
// 中文优化卡片组件
// ============================================
interface CNCardProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  headerAction?: ReactNode;
  padding?: 'none' | 'small' | 'medium' | 'large';
}

export const CNCard: FC<CNCardProps> = ({
  title,
  subtitle,
  children,
  className,
  headerAction,
  padding = 'medium',
}) => {
  const paddingClasses = {
    none: 'p-0',
    small: 'p-4',
    medium: 'p-6',
    large: 'p-8',
  };

  return (
    <div
      className={clsx(
        'bg-newBgColorInner border border-newTableBorder rounded-cn-lg shadow-sm',
        'transition-shadow duration-200 hover:shadow-md',
        className
      )}
    >
      {(title || subtitle || headerAction) && (
        <div className={clsx('flex items-center justify-between border-b border-newTableBorder', paddingClasses[padding])}>
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-textColor font-sans-cn tracking-cn-wide">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-400 mt-1 font-sans-cn tracking-cn-normal">
                {subtitle}
              </p>
            )}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className={clsx(paddingClasses[padding], 'font-sans-cn')}>
        {children}
      </div>
    </div>
  );
};

// ============================================
// 中文优化标签组件
// ============================================
interface CNBadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'small' | 'medium';
  className?: string;
}

export const CNBadge: FC<CNBadgeProps> = ({
  children,
  variant = 'default',
  size = 'medium',
  className,
}) => {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  };

  const sizeClasses = {
    small: 'px-2 py-0.5 text-xs',
    medium: 'px-3 py-1 text-sm',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium rounded-cn-sm',
        'font-sans-cn tracking-cn-normal',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </span>
  );
};

// ============================================
// 中文优化分隔线组件
// ============================================
interface CNDividerProps {
  text?: string;
  className?: string;
}

export const CNDivider: FC<CNDividerProps> = ({ text, className }) => {
  if (text) {
    return (
      <div className={clsx('relative flex items-center my-6', className)}>
        <div className="flex-grow border-t border-newTableBorder" />
        <span className="flex-shrink mx-4 text-sm text-gray-400 font-sans-cn tracking-cn-normal">
          {text}
        </span>
        <div className="flex-grow border-t border-newTableBorder" />
      </div>
    );
  }

  return <hr className={clsx('border-t border-newTableBorder my-6', className)} />;
};

// ============================================
// 中文优化提示框组件
// ============================================
interface CNAlertProps {
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: ReactNode;
  className?: string;
  onClose?: () => void;
}

export const CNAlert: FC<CNAlertProps> = ({
  type = 'info',
  title,
  children,
  className,
  onClose,
}) => {
  const typeConfig = {
    info: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      icon: '💡',
      iconColor: 'text-blue-500',
    },
    success: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      icon: '✓',
      iconColor: 'text-green-500',
    },
    warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-200 dark:border-yellow-800',
      icon: '⚠',
      iconColor: 'text-yellow-500',
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      icon: '✕',
      iconColor: 'text-red-500',
    },
  };

  const config = typeConfig[type];

  return (
    <div
      className={clsx(
        'relative p-4 rounded-cn-md border',
        config.bg,
        config.border,
        className
      )}
    >
      <div className="flex items-start gap-3">
        <span className={clsx('text-xl', config.iconColor)}>{config.icon}</span>
        <div className="flex-1 font-sans-cn">
          {title && (
            <h4 className="font-semibold text-textColor mb-1 tracking-cn-normal">
              {title}
            </h4>
          )}
          <div className="text-sm text-textColor tracking-cn-normal leading-cn-relaxed">
            {children}
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-textColor transition-colors"
            aria-label="关闭"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};
