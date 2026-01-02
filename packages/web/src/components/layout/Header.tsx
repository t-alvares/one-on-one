import { Bot } from '@/components/animate-ui/icons/bot';

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
}

function Header({ title, onMenuClick }: HeaderProps) {
  return (
    <header className="h-12 flex items-center px-4 lg:px-6">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 -ml-2 text-text-secondary hover:text-text-primary hover:bg-surface-secondary rounded-md transition-colors mr-4"
        aria-label="Open menu"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>

      {/* Page title - matches section titles style but bold */}
      <h1 className="flex items-center gap-2 text-base font-semibold text-text-secondary tracking-wide">
        <Bot size={30} animateOnHover />
        {title}
      </h1>
    </header>
  );
}

export { Header };
