import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../stores/AuthContext'
import { useT } from '../i18n'

export default function AuthPage() {
  const { t } = useT()
  const { login, register, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true })
  }, [isAuthenticated, navigate, from])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isLogin) {
        await login(email, password)
      } else {
        await register(email, password, displayName || undefined)
      }
      navigate(from, { replace: true })
    } catch (err) {
      if (err.status === 409) setError(t('auth_error_email_taken'))
      else if (err.status === 401) setError(t('auth_error_invalid'))
      else if (!err.status) setError(t('auth_error_network'))
      else setError(t('auth_error_generic'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[70vh] px-4">
      <div className="w-full max-w-sm bg-surface border border-border rounded-xl p-6">
        <div className="flex mb-6 border-b border-border">
          <button
            className={`flex-1 pb-3 text-sm font-medium transition-colors ${isLogin ? 'text-accent border-b-2 border-accent' : 'text-text-muted'}`}
            onClick={() => { setIsLogin(true); setError('') }}
          >
            {t('auth_login')}
          </button>
          <button
            className={`flex-1 pb-3 text-sm font-medium transition-colors ${!isLogin ? 'text-accent border-b-2 border-accent' : 'text-text-muted'}`}
            onClick={() => { setIsLogin(false); setError('') }}
          >
            {t('auth_register')}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              placeholder={t('auth_display_name')}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-text-primary placeholder-text-muted text-sm focus:outline-none focus:border-accent"
            />
          )}
          <input
            type="email"
            placeholder={t('auth_email')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-text-primary placeholder-text-muted text-sm focus:outline-none focus:border-accent"
          />
          <input
            type="password"
            placeholder={t('auth_password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-text-primary placeholder-text-muted text-sm focus:outline-none focus:border-accent"
          />

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-accent text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? '...' : isLogin ? t('auth_submit_login') : t('auth_submit_register')}
          </button>
        </form>
      </div>
    </div>
  )
}
