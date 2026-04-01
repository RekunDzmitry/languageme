import { Link, useLocation } from 'react-router-dom'
import { useT } from '../../i18n'
import { useAuth } from '../../stores/AuthContext'
import LanguageSwitcher from './LanguageSwitcher'

export default function Navbar() {
  const { t } = useT()
  const location = useLocation()
  const { user, isAuthenticated, isLoading, logout } = useAuth()

  const links = [
    { to: '/', label: t('nav_home'), icon: '⌂' },
    { to: '/themes', label: t('nav_themes'), icon: '📖' },
    { to: '/training', label: t('nav_training'), icon: '💪' },
    { to: '/learn', label: t('nav_learn'), icon: '⚡' },
    { to: '/cards', label: t('nav_cards'), icon: '🗂' },
  ]

  return (
    <nav className="bg-surface border-b border-border px-5 flex items-center justify-between sticky top-0 z-50 h-14">
      <Link to="/" className="flex items-center gap-2 no-underline">
        <span className="font-black text-xl tracking-wide bg-gradient-to-r from-blue-700 via-white to-red-600 bg-clip-text text-transparent">FR</span>
        <span className="font-bold text-sm text-text-primary tracking-wide">LanguageMe</span>
      </Link>
      <div className="hidden md:flex items-center gap-1">
        {links.map(({ to, label, icon }) => {
          const active = location.pathname === to || (to !== '/' && location.pathname.startsWith(to))
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium no-underline transition-colors
                ${active ? 'bg-accent-glow text-accent' : 'text-text-muted hover:text-text-primary'}`}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </Link>
          )
        })}
        <LanguageSwitcher />
        {!isLoading && (
          isAuthenticated ? (
            <div className="flex items-center gap-2 ml-2">
              <span className="text-sm text-text-muted truncate max-w-[120px]">
                {user?.display_name || user?.email}
              </span>
              <button
                onClick={logout}
                className="text-sm text-text-muted hover:text-red-400 transition-colors"
              >
                {t('auth_logout')}
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="ml-2 text-sm text-accent hover:text-accent/80 no-underline font-medium transition-colors"
            >
              {t('auth_login_prompt')}
            </Link>
          )
        )}
      </div>
    </nav>
  )
}
