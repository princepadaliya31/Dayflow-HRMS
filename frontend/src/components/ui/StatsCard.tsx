interface StatsCardProps {
  label: string
  value: string | number
  sub?: string
  icon: React.ReactNode
  color: string
  trend?: { value: string; up: boolean }
  tooltipContent?: string
  onClick?: () => void
}

export default function StatsCard({ label, value, sub, icon, color, trend, tooltipContent, onClick }: StatsCardProps) {
  return (
    <div
      onClick={onClick}
      style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', cursor: onClick ? 'pointer' : 'default' }}
      className={`rounded-xl border p-5 flex flex-col gap-3 transition-shadow relative group ${onClick ? 'hover:shadow-md hover:border-indigo-500/50' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${trend.up ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-500'}`}>
            {trend.up ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--foreground)' }}>{value}</p>
        <p className="text-sm font-medium mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{label}</p>
        {sub && <p className="text-xs mt-1 text-indigo-400">{sub}</p>}
      </div>

      {tooltipContent && (
        <div 
          className="absolute bottom-[80%] left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-30 bg-slate-900 text-white text-xs rounded-lg py-1.5 px-3 whitespace-nowrap shadow-lg transition-opacity duration-200"
        >
          {tooltipContent}
          {/* Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
        </div>
      )}
    </div>
  )
}
