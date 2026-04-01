export default function Card({ children, className = '', onClick, style }) {
  return (
    <div
      className={`bg-surface border border-border rounded-xl p-4 transition-colors ${onClick ? 'cursor-pointer hover:bg-surface-hover' : ''} ${className}`}
      onClick={onClick}
      style={style}
    >
      {children}
    </div>
  )
}
