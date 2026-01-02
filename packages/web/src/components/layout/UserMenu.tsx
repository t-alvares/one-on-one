import { useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface UserMenuProps {
  onClose: () => void;
}

function UserMenu({ onClose }: UserMenuProps) {
  const { user, logout } = useAuth();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    // Close on escape key
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    onClose();
  };

  const getRoleLabel = (role: typeof user.role) => {
    switch (role) {
      case 'IC':
        return 'Individual Contributor';
      case 'LEADER':
        return 'Leader';
      case 'ADMIN':
        return 'Administrator';
      default:
        return role;
    }
  };

  return (
    <div
      ref={menuRef}
      className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-dropdown border border-border py-2 z-50 animate-fade-in"
      role="menu"
    >
      {/* User info */}
      <div className="px-4 py-3 border-b border-border">
        <p className="text-sm font-medium text-text-primary truncate">
          {user.name}
        </p>
        <p className="text-xs text-text-tertiary truncate">
          {user.email}
        </p>
        <span className="inline-block mt-2 px-2 py-0.5 bg-surface-secondary text-text-secondary text-xs font-medium rounded">
          {getRoleLabel(user.role)}
        </span>
      </div>

      {/* Menu items */}
      <div className="py-1">
        <button
          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-surface-secondary hover:text-text-primary transition-colors"
          onClick={() => {
            // TODO: Navigate to profile
            onClose();
          }}
          role="menuitem"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
          View Profile
        </button>
        <button
          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-surface-secondary hover:text-text-primary transition-colors"
          onClick={() => {
            // TODO: Navigate to settings
            onClose();
          }}
          role="menuitem"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Settings
        </button>
      </div>

      {/* Logout */}
      <div className="border-t border-border pt-1">
        <button
          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-error hover:bg-error-light transition-colors"
          onClick={handleLogout}
          role="menuitem"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
          </svg>
          Log out
        </button>
      </div>
    </div>
  );
}

export { UserMenu };
