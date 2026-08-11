import { Outlet } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import BottomNav from './components/layout/BottomNav'
import Notification from './components/common/Notification'
import { useSettings } from './stores/SettingsContext'
import { CourseDataProvider, useCourseData } from './lib/courseData'

// Rendered inside the provider so it can read the fetch state. Pages read
// the course bundle synchronously via useCourseData(), so we hold the route
// back until the bundle has resolved — otherwise every page paints once
// against an empty bundle (zero themes, zero words) before the real data
// lands. The provider fails open, so a failed fetch also clears this gate.
function AppShell() {
  const { loading } = useCourseData()

  return (
    <div className="min-h-screen bg-bg text-text-primary flex flex-col">
      <Navbar />
      <Notification />
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        {loading ? <CourseLoading /> : <Outlet />}
      </main>
      <BottomNav />
    </div>
  )
}

function CourseLoading() {
  return (
    <div className="flex items-center justify-center py-24 text-text-secondary">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-surface border-t-accent" />
    </div>
  )
}

export default function App() {
  const { settings } = useSettings()

  return (
    <CourseDataProvider targetLang={settings.targetLang} nativeLang={settings.nativeLang}>
      <AppShell />
    </CourseDataProvider>
  )
}
