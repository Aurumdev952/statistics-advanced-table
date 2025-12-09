import { Outlet, Link, useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { useAuthContext } from '@/features/auth';

const Layout = () => {
  const { user, logout, isAuthenticated } = useAuthContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-l-bg-1 dark:bg-d-bg-1 text-l-text-1 dark:text-d-text-1 overflow-x-hidden">
      {/* Navigation */}
      <nav className="bg-l-bg-2 dark:bg-d-bg-2 border-b border-border-l dark:border-border-d">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <Link to="/" className="text-xl font-bold text-accent-1 shrink-0">
              React Template
            </Link>

            {/* Right side: User info and controls */}
            <div className="flex items-center gap-4">
              {isAuthenticated && user && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-l-text-2 dark:text-d-text-2">
                    {user.first_name || user.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-accent-danger hover:bg-accent-danger/90 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="w-full overflow-x-hidden">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="w-full py-12 bg-l-bg-3 dark:bg-d-bg-3 border-t border-border-l dark:border-border-d">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2 text-l-text-1 dark:text-d-text-1">
                React TypeScript Template
              </h3>
              <p className="text-l-text-2 dark:text-d-text-2">
                Modern, production-ready template with routing, forms, and API
                integration
              </p>
            </div>

            <div className="flex justify-center gap-4 mb-8">
              <a
                href="https://github.com/YousifAbozid/template-react-ts#readme"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-accent-1 hover:bg-accent-2 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Documentation
              </a>
            </div>

            <div className="text-l-text-3 dark:text-d-text-3">
              <p className="text-center wrap-break-word">
                React 19 + TypeScript + Vite + Tailwind CSS v4 + React Router +
                React Query
              </p>
              <p className="mt-1">
                Built with 💙 by{' '}
                <a
                  href="https://github.com/YousifAbozid"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent-1 hover:underline"
                >
                  Yousif Abozid
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
