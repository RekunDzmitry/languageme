import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import DashboardPage from './pages/DashboardPage'
import ThemesListPage from './pages/ThemesListPage'
import ThemePage from './pages/ThemePage'
import StudyPage from './pages/StudyPage'
import LearnPage from './pages/LearnPage'
import CardsPage from './pages/CardsPage'
import TrainingPage from './pages/TrainingPage'
import EmailPage from './pages/EmailPage'
import AdminPage from './pages/AdminPage'
import RequireAdmin from './components/common/RequireAdmin'
import { I18nProvider } from './i18n'
import { SettingsProvider } from './stores/SettingsContext'
import { AuthProvider } from './stores/AuthContext'
import { UserProgressProvider } from './stores/UserProgressContext'
import RequireAuth from './components/common/RequireAuth'
import { getThemes } from './data/courses'
import { assertPackInvariants } from './data/lessonPacks'
import './index.css'

// Run once on boot: every theme id should carry a language prefix and
// belong to exactly one pack. Without this a mis-prefixed or orphaned
// theme would disappear from every pack-scoped view with no error.
assertPackInvariants({ fr: getThemes('fr'), pl: getThemes('pl') })

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
                  <Route path="study/:themeId" element={<RequireAuth><StudyPage /></RequireAuth>} />
                  <Route path="training" element={<RequireAuth><TrainingPage /></RequireAuth>} />
                  <Route path="cards" element={<RequireAuth><CardsPage /></RequireAuth>} />
                  <Route path="email" element={<EmailPage />} />
                  <Route path="email/:themeId" element={<EmailPage />} />
                  <Route path="admin" element={<RequireAdmin><AdminPage /></RequireAdmin>} />
                </Route>
              </Routes>
            </UserProgressProvider>
          </AuthProvider>
        </SettingsProvider>
      </I18nProvider>
    </BrowserRouter>
  </StrictMode>
)
