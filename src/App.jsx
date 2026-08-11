import { Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Navbar from './components/layout/Navbar'
import BottomNav from './components/layout/BottomNav'
import Notification from './components/common/Notification'
import { useSettings } from './stores/SettingsContext'
import { CourseDataProvider } from './lib/courseData'

export default function App() {
  const { settings } = useSettings()
  const [bundleReady, setBundleReady] = useState(false)

  // Preload the active course bundle on mount and whenever the target
  // language changes. Components below consume via useCourseData().
  // The provider renders nothing on its own; it just exposes the bundle
  // via context once the fetch resolves.
  useEffect(() => {
    let cancelled = false
    setBundleReady(false)
    import('./lib/courseData').then(({ preloadBundle }) => {
      preloadBundle(settings.targetLang, settings.nativeLang)
        .then(() => { if (!cancelled) setBundleReady(true) })
        .catch(() => { if (!cancelled) setBundleReady(true) }) // fail open
    })
    return () => { cancelled = true }
  }, [settings.targetLang, settings.nativeLang])

  return (
    <CourseDataProvider targetLang={settings.targetLang} nativeLang={settings.nativeLang} ready={bundleReady}>
      <div className="min-h-screen bg-bg text-text-primary flex flex-col">
        <Navbar />
        <Notification />
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </CourseDataProvider>
  )
}
