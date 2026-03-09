import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'teal';
  subtitle?: string;
  trend?: { value: number; isPositive: boolean };
}

const colorStyles = {
  blue: {
    bg: 'bg-blue-500',
    lightBg: 'bg-blue-50',
    text: 'text-blue-600',
    gradient: 'from-blue-500 to-blue-600',
    shadow: 'shadow-blue-500/20',
  },
  green: {
    bg: 'bg-emerald-500',
    lightBg: 'bg-emerald-50',
    text: 'text-emerald-600',
    gradient: 'from-emerald-500 to-emerald-600',
    shadow: 'shadow-emerald-500/20',
  },
  yellow: {
    bg: 'bg-amber-500',
    lightBg: 'bg-amber-50',
    text: 'text-amber-600',
    gradient: 'from-amber-400 to-amber-500',
    shadow: 'shadow-amber-500/20',
  },
  red: {
    bg: 'bg-rose-500',
    lightBg: 'bg-rose-50',
    text: 'text-rose-600',
    gradient: 'from-rose-500 to-rose-600',
    shadow: 'shadow-rose-500/20',
  },
  purple: {
    bg: 'bg-violet-500',
    lightBg: 'bg-violet-50',
    text: 'text-violet-600',
    gradient: 'from-violet-500 to-violet-600',
    shadow: 'shadow-violet-500/20',
  },
  teal: {
    bg: 'bg-teal-500',
    lightBg: 'bg-teal-50',
    text: 'text-teal-600',
    gradient: 'from-teal-500 to-teal-600',
    shadow: 'shadow-teal-500/20',
  }
};

export default function StatsCard({
  title,
  value,
  icon: Icon,
  color = 'blue',
  subtitle,
  trend
}: StatsCardProps) {
  const styles = colorStyles[color];

  return (
    <div className="relative overflow-hidden bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 p-6 hover:-translate-y-1 transition-transform duration-300 group">
      {/* Background Decorative Elements */}
      <div className={`absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 rounded-full opacity-10 bg-gradient-to-br ${styles.gradient} blur-2xl group-hover:opacity-20 transition-opacity`}></div>
      
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <div className="flex items-baseline gap-2 mt-2">
            <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{value}</h3>
          </div>
          
          {(subtitle || trend) && (
             <div className="flex items-center gap-2 mt-2">
               {trend && (
                 <span className={`flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${trend.isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                   {trend.isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                   {Math.abs(trend.value)}%
                 </span>
               )}
               {subtitle && <p className="text-xs text-slate-400 font-medium">{subtitle}</p>}
             </div>
          )}
        </div>
        
        <div className={`p-3.5 rounded-xl ${styles.lightBg} ${styles.text} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {/* Progress bar decorative (optional) */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-50">
         <div className={`h-full ${styles.bg} opacity-20 w-2/3`}></div>
      </div>
    </div>
  );
}
