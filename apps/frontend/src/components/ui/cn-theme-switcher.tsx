import { FC, useEffect, useState, useMemo, useRef } from 'react';
import { useLocalStorage } from '@mantine/hooks';
import clsx from 'clsx';

// 中文主题切换器
// Chinese Theme Switcher Component

export type CNTheme = 'cn-red' | 'cn-blue' | 'cn-jade' | 'cn-light' | 'cn-light-blue' | 'dark' | 'light';

interface CNThemeSwitcherProps {
  className?: string;
}

const themes: { value: CNTheme; label: string; icon: string }[] = [
  { value: 'cn-red', label: '中国红', icon: '🔴' },
  { value: 'cn-blue', label: '青花瓷', icon: '🔵' },
  { value: 'cn-jade', label: '翡翠绿', icon: '🟢' },
  { value: 'cn-light', label: '明亮红', icon: '🌸' },
  { value: 'cn-light-blue', label: '清新蓝', icon: '💙' },
  { value: 'dark', label: '深色', icon: '🌙' },
  { value: 'light', label: '浅色', icon: '☀️' },
];

// Create a Map for O(1) theme lookup
const themesMap = new Map(themes.map((t) => [t.value, t]));

export const CNThemeSwitcher: FC<CNThemeSwitcherProps> = ({ className = '' }) => {
  const [theme, setTheme] = useLocalStorage<CNTheme>({
    key: 'cn-theme',
    defaultValue: 'cn-blue',
  });
  const [isOpen, setIsOpen] = useState(false);
  const previousThemeRef = useRef<CNTheme>(theme);

  useEffect(() => {
    const htmlElement = document.documentElement;
    const previousTheme = previousThemeRef.current;

    // Only remove the previous theme class, not all themes
    if (previousTheme !== theme) {
      htmlElement.classList.remove(previousTheme);
      htmlElement.classList.add(theme);
      previousThemeRef.current = theme;
    }
  }, [theme]);

  // Memoize current theme lookup
  const currentTheme = useMemo(() => themesMap.get(theme) || themes[1], [theme]);

  return (
    <div className={clsx('relative', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          'flex items-center gap-2 px-4 py-2 rounded-cn-md bg-newBgColorInner border border-newTableBorder hover:bg-boxHover transition-colors',
        )}
        aria-label="切换主题"
      >
        <span className="text-lg">{currentTheme.icon}</span>
        <span className="text-sm font-medium text-textColor">{currentTheme.label}</span>
        <svg
          className={clsx('w-4 h-4 transition-transform', isOpen && 'rotate-180')}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 mt-2 w-48 rounded-cn-lg bg-newBgColorInner border border-newTableBorder shadow-menu z-50 overflow-hidden">
            {themes.map((t) => (
              <button
                key={t.value}
                onClick={() => {
                  setTheme(t.value);
                  setIsOpen(false);
                }}
                className={clsx(
                  'w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-boxHover transition-colors',
                  theme === t.value && 'bg-boxHover'
                )}
              >
                <span className="text-lg">{t.icon}</span>
                <span className="text-sm font-medium text-textColor">{t.label}</span>
                {theme === t.value && (
                  <svg
                    className="w-4 h-4 ml-auto text-cnBlue"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// Hook to use current theme
export const useCNTheme = () => {
  const [theme] = useLocalStorage<CNTheme>({
    key: 'cn-theme',
    defaultValue: 'cn-blue',
  });

  return theme;
};
