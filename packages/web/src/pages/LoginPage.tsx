import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { LoginHero } from '../components/LoginHero';
import { useLogin } from '../hooks/useLogin';
import { useAuth } from '../contexts/AuthContext';
import { LayoutTextFlip } from '../components/ui/layout-text-flip';

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface LoginPageProps {
  mode?: 'default' | 'admin';
}

function LoginPage({ mode = 'default' }: LoginPageProps) {
  const { isAuthenticated, user } = useAuth();
  const { login, isLoading, error, reset } = useLogin();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });
  const [accessError, setAccessError] = useState<string | null>(null);

  const isAdminMode = mode === 'admin';

  // Validation - only show errors if field has value and is invalid
  const emailError = touched.email && email.length > 0 && !EMAIL_REGEX.test(email) ? 'Please enter a valid email address' : '';
  const passwordError = touched.password && password.length > 0 && password.length < 6 ? 'Password must be at least 6 characters' : '';
  const isFormValid = EMAIL_REGEX.test(email) && password.length >= 6;

  // Redirect if already authenticated
  if (isAuthenticated && user) {
    if (isAdminMode) {
      // Admin login: only redirect if user has admin access
      if (user.isAdmin) {
        return <Navigate to="/admin/users" replace />;
      }
      // User is authenticated but not an admin - don't redirect, show error
    } else {
      // Regular login: redirect based on role
      switch (user.role) {
        case 'LEADER':
          return <Navigate to="/team" replace />;
        default:
          return <Navigate to="/workspace" replace />;
      }
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    reset(); // Clear any previous errors
    setAccessError(null);

    if (isFormValid) {
      try {
        await login({ email, password });
        // After successful login, check admin access for admin mode
        // This is handled by the redirect logic above on next render
      } catch {
        // Error is handled by useLogin hook
      }
    }
  };

  // Check if we need to show admin access error
  // This happens when user is authenticated but not an admin in admin mode
  const showAdminAccessError = isAdminMode && isAuthenticated && user && !user.isAdmin;

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-[45%] flex flex-col justify-start pt-12 lg:pt-16 px-8 sm:px-12 lg:px-16 xl:px-20 bg-white overflow-visible">
        <div className="w-full max-w-[420px] mx-auto overflow-visible">
          {/* Company Logo */}
          <div className="mb-14">
            <img
              src="/images/Wawanesa-Logo-RGB-Blue.png"
              alt="Wawanesa"
              className="h-[100px] w-auto -ml-7 -mt-4"
            />
          </div>

          {/* Welcome Text */}
          <div className="mb-8 overflow-visible">
            {isAdminMode ? (
              <>
                <h1 className="text-5xl font-semibold text-rich-black mb-1">Admin</h1>
                <h2 className="text-5xl font-bold text-rich-black">Portal</h2>
                <p className="mt-3 text-text-secondary">Enter your admin credentials</p>
              </>
            ) : (
              <>
                <h1 className="text-5xl font-semibold text-rich-black mb-1">Hi,</h1>
                <h2 className="text-5xl font-bold text-rich-black">Welcome back to</h2>
                <LayoutTextFlip
                  text=""
                  words={["Growth", "Connection", "Meaningful Conversations"]}
                  duration={3000}
                  wordsClassName="!text-5xl font-bold font-display bg-transparent text-rich-black border-0 ring-0 shadow-none p-0 pl-0.5 whitespace-nowrap tracking-normal rounded-none"
                />
              </>
            )}
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setTouched((prev) => ({ ...prev, email: false }));
                }}
                onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                placeholder="you@wawanesa.com"
                disabled={isLoading}
                className={`
                  w-full h-11 px-4 rounded-md border bg-white
                  text-text-primary placeholder:text-text-placeholder
                  transition-all duration-150
                  focus:outline-none
                  disabled:bg-surface-tertiary disabled:cursor-not-allowed
                  ${emailError ? 'border-error' : 'border-border hover:border-border-hover'}
                `}
              />
              {emailError && (
                <p className="mt-1.5 text-sm text-error">{emailError}</p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setTouched((prev) => ({ ...prev, password: false }));
                  }}
                  onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className={`
                    w-full h-11 px-4 pr-12 rounded-md border bg-white
                    text-text-primary placeholder:text-text-placeholder
                    transition-all duration-150
                    focus:outline-none
                    disabled:bg-surface-tertiary disabled:cursor-not-allowed
                    ${passwordError ? 'border-error' : 'border-border hover:border-border-hover'}
                  `}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text-tertiary hover:text-text-secondary transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {passwordError && (
                <p className="mt-1.5 text-sm text-error">{passwordError}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-5 h-5 border-2 border-border rounded transition-all peer-checked:bg-wawanesa-blue peer-checked:border-wawanesa-blue group-hover:border-border-hover">
                    {rememberMe && (
                      <svg className="w-full h-full text-white p-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                  Remember me
                </span>
              </label>
              <button
                type="button"
                className="text-sm text-wawanesa-blue hover:text-wawanesa-blue-hover transition-colors"
              >
                Forgot Password?
              </button>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading || !isFormValid}
              className={`
                w-full h-12 flex items-center justify-center gap-2
                bg-white text-black font-medium rounded-md
                border border-black
                transition duration-200
                hover:shadow-[4px_4px_0px_0px_rgba(0,0,0)]
                focus:outline-none
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none
              `}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Footer */}
          {!isAdminMode && (
            <p className="mt-8 text-center text-sm text-text-secondary">
              Don't have an account?{' '}
              <span className="text-wawanesa-blue font-medium">Contact Admin</span>
            </p>
          )}

          {/* Error Messages */}
          {(error || showAdminAccessError || accessError) && (
            <div className="mt-6 p-3 bg-error-light border border-error/20 rounded-md animate-shake">
              <p className="text-sm text-error text-center">
                {showAdminAccessError
                  ? 'You do not have admin access. Please use the regular login.'
                  : accessError || error}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden lg:flex w-[55%] items-center justify-center overflow-hidden">
        <LoginHero />
      </div>
    </div>
  );
}

// Named exports for different modes
function AdminLoginPage() {
  return <LoginPage mode="admin" />;
}

export { LoginPage, AdminLoginPage };
