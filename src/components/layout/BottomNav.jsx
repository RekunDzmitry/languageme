import { Link, useLocation } from 'react-router-dom'
import { useT } from '../../i18n'

export default function BottomNav() {
  const { t } = useT()
  const location = useLocation()

  const links = [
    { to: '/', label: t('nav_home'), icon: '⌂' },
    { to: '/themes', label: t('nav_themes'), icon: '📖' },
    { to: '/training', label: t('nav_training'), icon: '💪' },
    { to: '/learn', label: t('nav_learn'), icon: '⚡' },
    { to: '/cards', label: t('nav_cards'), icon: '🗂' },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border flex justify-around items-center h-14 z-50">
      {links.map(({ to, label, icon }) => {
        const active = location.pathname === to || (to !== '/' && location.pathname.startsWith(to))
        return (
          <Link
            key={to}
            to={to}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 no-underline text-xs transition-colors
              ${active ? 'text-accent' : 'text-text-muted'}`}
          >
            <span className="text-lg">{icon}</span>
            <span className="font-medium">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
