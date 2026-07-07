import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { api, setTokens, clearTokens, getAccessToken } from '../api/client'
import { storage } from '../utils/storage'

const AuthContext = createContext()

/** Parse OAuth tokens from URL fragment (#access_token=...&refresh_token=...) */
function parseOAuthFragment() {
  const hash = window.location.hash.substring(1);
  if (!hash) return null;
  const params = new URLSearchParams(hash);
  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');
  if (accessToken && refreshToken) {
    // Clear fragment so tokens don't linger in browser history
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
    return { accessToken, refreshToken };
  }
  return null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchProfile = useCallback(async () => {
    try {
      const profile = await api.get('/api/me')
      setUser(profile)
      return profile
    } catch {
      clearTokens()
      setUser(null)
      return null
    }
  }, [])

  const migrateLocalData = useCallback(async () => {
    const saved = storage.getProgress()
    if (!saved) return

    const payload = {}
    if (saved.srsCards) payload.srsCards = saved.srsCards
    if (saved.themeProgress) payload.themeProgress = saved.themeProgress
    if (saved.userMnemonics) payload.userMnemonics = saved.userMnemonics
    if (saved.stats) payload.stats = saved.stats

    if (Object.keys(payload).length === 0) return

    try {
      await api.post('/api/migrate/import', payload)
    } catch (e) {
      if (e.status !== 409) return
    }
    storage.remove('progress')
  }, [])

  const login = useCallback(async (email, password) => {
    const data = await api.post('/api/auth/login', { email, password })
    setTokens(data.accessToken, data.refreshToken)
    await migrateLocalData()
    const profile = await fetchProfile()
    return profile
  }, [fetchProfile, migrateLocalData])

  const register = useCallback(async (email, password, displayName) => {
    const body = { email, password }
    if (displayName) body.displayName = displayName
    const data = await api.post('/api/auth/register', body)
    setTokens(data.accessToken, data.refreshToken)
    await migrateLocalData()
    const profile = await fetchProfile()
    return profile
  }, [fetchProfile, migrateLocalData])

  const logout = useCallback(async () => {
    try {
      await api.post('/api/auth/logout')
    } catch {}
    clearTokens()
    setUser(null)
  }, [])

  // Handle OAuth callback on mount (tokens in URL fragment after social login redirect)
  const oauthHandled = useRef(false);
  useEffect(() => {
    if (oauthHandled.current) return;
    const tokens = parseOAuthFragment();
    if (tokens) {
      oauthHandled.current = true;
      setTokens(tokens.accessToken, tokens.refreshToken);
      migrateLocalData().finally(() => {
        fetchProfile().finally(() => setIsLoading(false));
      });
    }
  }, [fetchProfile, migrateLocalData]);

  // Validate token on mount (or after OAuth)
  useEffect(() => {
    if (oauthHandled.current) return; // Already handling OAuth
    if (getAccessToken()) {
      fetchProfile().finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [fetchProfile])

  // Listen for forced logout from client.js
  useEffect(() => {
    const handler = () => {
      setUser(null)
    }
    window.addEventListener('auth:logout', handler)
    return () => window.removeEventListener('auth:logout', handler)
  }, [])

  // Redirect browser to OAuth provider
  const loginWithGoogle = useCallback(() => {
    window.location.href = '/api/auth/google';
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isAdmin: !!user?.is_admin, isLoading, login, register, logout, loginWithGoogle }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
