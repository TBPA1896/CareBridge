import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'blue' | 'emerald' | 'amber' | 'rose' | 'purple';
  trend?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'blue',
  trend,
}) => {
  const colorMap = {
    blue: {
      bg: 'bg-blue-50',
      iconBg: 'bg-blue-600 text-white',
      border: 'border-blue-100',
    },
    emerald: {
      bg: 'bg-emerald-50',
      iconBg: 'bg-emerald-600 text-white',
      border: 'border-emerald-100',
    },
    amber: {
      bg: 'bg-amber-50',
      iconBg: 'bg-amber-500 text-white',
      border: 'border-amber-100',
    },
    rose: {
      bg: 'bg-rose-50',
      iconBg: 'bg-rose-600 text-white',
      border: 'border-rose-100',
    },
    purple: {
      bg: 'bg-purple-50',
      iconBg: 'bg-purple-600 text-white',
      border: 'border-purple-100',
    },
  };

  const scheme = colorMap[color];

  return (
    <div className={`p-5 rounded-2xl bg-white border ${scheme.border} shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
          {trend && <p className="text-xs font-medium text-emerald-600 mt-1">{trend}</p>}
        </div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${scheme.iconBg}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};
