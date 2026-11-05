import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function StatCard({ title, value, unit, trend, icon: Icon, color = 'primary' }) {
  // Soft tiles in the brand palette (no gradients); keys kept for existing callers
  const colors = {
    primary: 'bg-mist text-mlima',
    green:   'bg-primary-100 text-mlima',
    blue:    'bg-[#e4eff3] text-[#2a5d7c]',
    orange:  'bg-maize/25 text-soil',
    red:     'bg-red-50 text-red-700',
    purple:  'bg-[#efe9f5] text-[#5b3f7d]',
  };
  const hasValue = value !== null && value !== undefined && value !== '—';

  return (
    <div className="bg-white rounded-2xl border border-primary-100 p-4 sm:p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="font-display text-3xl font-bold text-ink mt-1">
            {hasValue ? value : '—'}
            {unit && hasValue && <span className="text-lg font-normal text-gray-500 ml-1">{unit}</span>}
          </p>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-500'}`}>
              {trend > 0 ? <TrendingUp size={14} /> : trend < 0 ? <TrendingDown size={14} /> : <Minus size={14} />}
              {Math.abs(trend)}% vs last period
            </div>
          )}
        </div>
        {Icon && (
          <div className={`p-2.5 sm:p-3 rounded-xl flex-shrink-0 ${colors[color] || colors.primary}`}>
            <Icon size={20} aria-hidden="true" />
          </div>
        )}
      </div>
    </div>
  );
}
