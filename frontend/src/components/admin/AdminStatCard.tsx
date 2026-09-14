import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AdminStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  color?: 'blue' | 'emerald' | 'amber' | 'violet' | 'rose' | 'cyan' | 'indigo';
  link?: string;
}

const colorMap = {
  blue: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-600',
    border: 'border-blue-500/20',
    ring: 'ring-blue-500/10',
  },
  emerald: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-600',
    border: 'border-emerald-500/20',
    ring: 'ring-emerald-500/10',
  },
  amber: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-600',
    border: 'border-amber-500/20',
    ring: 'ring-amber-500/10',
  },
  violet: {
    bg: 'bg-violet-500/10',
    text: 'text-violet-600',
    border: 'border-violet-500/20',
    ring: 'ring-violet-500/10',
  },
  rose: {
    bg: 'bg-rose-500/10',
    text: 'text-rose-600',
    border: 'border-rose-500/20',
    ring: 'ring-rose-500/10',
  },
  cyan: {
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-600',
    border: 'border-cyan-500/20',
    ring: 'ring-cyan-500/10',
  },
  indigo: {
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-600',
    border: 'border-indigo-500/20',
    ring: 'ring-indigo-500/10',
  },
};

export const AdminStatCard: React.FC<AdminStatCardProps> = ({
  title,
  value,
  subtitle,
  change,
  isPositive = true,
  icon: Icon,
  color = 'blue',
  link,
}) => {
  const styles = colorMap[color] || colorMap.blue;

  const content = (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between h-full group overflow-hidden">
      {/* Upper Content: Header & Icon */}
      <div className="flex items-start justify-between gap-3 min-w-0">
        <div className="min-w-0 flex-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block truncate">
            {title}
          </span>
          <div className="mt-1.5 flex items-baseline gap-2 min-w-0">
            <span className="text-xl lg:text-2xl font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors truncate block">
              {value}
            </span>
          </div>
        </div>

        {/* Fixed-size Icon Container */}
        <div className={`p-2.5 sm:p-3 rounded-xl ${styles.bg} ${styles.text} ${styles.border} border shadow-sm shrink-0 flex items-center justify-center`}>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
      </div>

      {/* Footer / Subtitle Section */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs gap-2 min-w-0">
        {change ? (
          <div className="flex items-center gap-1.5 font-medium truncate">
            {isPositive ? (
              <span className="inline-flex items-center gap-0.5 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold shrink-0">
                <TrendingUp className="w-3.5 h-3.5" />
                {change}
              </span>
            ) : (
              <span className="inline-flex items-center gap-0.5 text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full font-semibold shrink-0">
                <TrendingDown className="w-3.5 h-3.5" />
                {change}
              </span>
            )}
            <span className="text-slate-400 truncate">vs last month</span>
          </div>
        ) : (
          <span className="text-slate-500 font-medium truncate">
            {subtitle || 'Live metric'}
          </span>
        )}

        {link && (
          <span className="text-blue-600 font-semibold group-hover:translate-x-0.5 transition-transform shrink-0 ml-auto">
            View &rarr;
          </span>
        )}
      </div>
    </div>
  );

  if (link) {
    return (
      <Link to={link} className="block h-full focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
};