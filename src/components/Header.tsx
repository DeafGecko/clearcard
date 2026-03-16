import { Link, useLocation } from 'react-router-dom';
import { CreditCard, User, LayoutGrid, Sun, Moon, Contrast } from 'lucide-react';

interface HeaderProps {
  theme: string;
  onThemeChange: (theme: string) => void;
}

export function Header({ theme, onThemeChange }: HeaderProps) {
  const location = useLocation();

  const navLinks = [
    { to: '/', label: 'My Cards', icon: CreditCard },
    { to: '/templates', label: 'Templates', icon: LayoutGrid },
    { to: '/profile', label: 'My Info', icon: User },
  ];

  const themeOptions = [
    { value: 'high-contrast', label: 'High Contrast', icon: Contrast },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'light', label: 'Light', icon: Sun },
  ];

  const themes: Record<string, { bg: string; text: string; nav: string; navActive: string; border: string }> = {
    'high-contrast': {
      bg: 'bg-black',
      text: 'text-yellow-400',
      nav: 'text-white hover:text-yellow-400',
      navActive: 'text-yellow-400 border-b-2 border-yellow-400',
      border: 'border-yellow-400',
    },
    dark: {
      bg: 'bg-gray-900',
      text: 'text-white',
      nav: 'text-gray-300 hover:text-white',
      navActive: 'text-white border-b-2 border-blue-400',
      border: 'border-gray-700',
    },
    light: {
      bg: 'bg-white',
      text: 'text-gray-900',
      nav: 'text-gray-600 hover:text-gray-900',
      navActive: 'text-gray-900 border-b-2 border-blue-600',
      border: 'border-gray-200',
    },
  };

  const t = themes[theme] || themes['high-contrast'];

  return (
    <header className={`${t.bg} ${t.border} border-b sticky top-0 z-50`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className={`flex items-center gap-2 ${t.text} font-black text-xl`}>
            <CreditCard className="w-7 h-7" />
            <span>ClearCard</span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-semibold transition-colors ${
                  location.pathname === to ? t.navActive : t.nav
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            ))}
          </nav>

          {/* Theme Switcher */}
          <div className="flex items-center gap-1">
            {themeOptions.map(({ value, icon: Icon }) => (
              <button
                key={value}
                onClick={() => onThemeChange(value)}
                title={`Switch to ${value} theme`}
                className={`p-2 rounded transition-colors ${
                  theme === value
                    ? `${t.text} bg-opacity-20`
                    : `${t.nav} opacity-50 hover:opacity-100`
                }`}
                aria-pressed={theme === value}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
