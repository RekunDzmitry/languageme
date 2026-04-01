import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import DashboardPage from './pages/DashboardPage'
import ThemesListPage from './pages/ThemesListPage'
import ThemePage from './pages/ThemePage'
import LearnPage from './pages/LearnPage'
import CardsPage from './pages/CardsPage'
import TrainingPage from './pages/TrainingPage'
import AuthPage from './pages/AuthPage'
import { I18nProvider } from './i18n'
import { SettingsProvider } from './stores/SettingsContext'
import { AuthProvider } from './stores/AuthContext'
import { UserProgressProvider } from './stores/UserProgressContext'
import RequireAuth from './components/common/RequireAuth'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <I18nProvider>
        <SettingsProvider>
          <AuthProvider>
            <UserProgressProvider>
              <Routes>
                <Route element={<App />}>
                  <Route index element={<DashboardPage />} />
                  <Route path="themes" element={<ThemesListPage />} />
                  <Route path="themes/:id" element={<ThemePage />} />
                  <Route path="auth" element={<AuthPage />} />
                  <Route path="learn" element={<RequireAuth><LearnPage /></RequireAuth>} />
                  <Route path="learn/:themeId" element={<RequireAuth><LearnPage /></RequireAuth>} />
                  <Route path="training" element={<RequireAuth><TrainingPage /></RequireAuth>} />
                  <Route path="cards" element={<RequireAuth><CardsPage /></RequireAuth>} />
                </Route>
              </Routes>
            </UserProgressProvider>
          </AuthProvider>
        </SettingsProvider>
      </I18nProvider>
    </BrowserRouter>
  </StrictMode>
)
