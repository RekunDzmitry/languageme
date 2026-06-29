import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../stores/AuthContext'
import { useT } from '../i18n'

export default function AuthPage() {
  const { t } = useT()
  const { login, register, isAuthenticated, loginWithGoogle } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState(false)

  // Detect OAuth callback — the page mounted with tokens in URL fragment
  useEffect(() => {
    if (window.location.hash.includes('access_token')) {
      setOauthLoading(true);
    }
  }, []);

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

        {oauthLoading ? (
          <p className="text-text-muted text-sm text-center pt-4">{t('auth_processing_oauth')}</p>
        ) : (
          <>
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-surface text-text-muted">{t('auth_social_title')}</span>
              </div>
            </div>
            <div className="space-y-2">
              <button
                type="button"
                onClick={loginWithGoogle}
                disabled={loading}
                className="w-full py-2.5 border border-border rounded-lg text-sm font-medium text-text-primary hover:bg-bg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {t('auth_google')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
