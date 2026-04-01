export default function ProgressBar({ value, color = 'bg-accent', className = '' }) {
  return (
    <div className={`bg-white/[0.08] rounded h-1.5 overflow-hidden ${className}`}>
      <div
        className={`h-full rounded transition-width ${color}`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}
