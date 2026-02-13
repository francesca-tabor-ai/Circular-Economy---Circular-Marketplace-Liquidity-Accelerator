
import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: string;
  trend?: 'up' | 'down' | 'neutral';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon, trend }) => {
  return (
    <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start mb-6">
        <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
          <i className={`fas ${icon} text-slate-600 text-lg`}></i>
        </div>
        {change && (
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
            trend === 'up' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
            trend === 'down' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 
            'bg-slate-100 text-slate-500'
          }`}>
            {change}
          </span>
        )}
      </div>
      <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">{title}</h3>
      <p className="text-3xl font-bold text-slate-900 mt-1 tracking-tight">{value}</p>
    </div>
  );
};

export default StatCard;
