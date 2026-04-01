import { useProgress } from '../../stores/UserProgressContext'

export default function Notification() {
  const { notification } = useProgress()

  if (!notification) return null

  return (
    <div
      className={`fixed top-16 right-5 z-[999] px-4 py-2.5 rounded-xl text-white font-semibold text-sm shadow-lg animate-fade-in
        ${notification.type === 'success' ? 'bg-green-500' : 'bg-blue-500'}`}
    >
      {notification.msg}
    </div>
  )
}
