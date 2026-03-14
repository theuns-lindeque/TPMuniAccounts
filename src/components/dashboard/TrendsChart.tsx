'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface TrendsChartProps {
  data: any[];
}

export const TrendsChart = ({ data }: TrendsChartProps) => {
  return (
    <div className="h-[300px] w-full border border-slate-200 dark:border-slate-800 rounded-md p-4 bg-white dark:bg-slate-950">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4 px-2">
        Financial Trends (12 Months)
      </h3>
      <ResponsiveContainer width="100%" height="80%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis 
            dataKey="month" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
            tickFormatter={(value) => `R ${value}`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e2e8f0',
              borderRadius: '4px',
              fontSize: '12px',
              fontFamily: 'monospace'
            }}
          />
          <Legend 
            verticalAlign="top" 
            align="right" 
            iconType="circle"
            wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
          />
          <Line 
            type="monotone" 
            dataKey="invoices" 
            stroke="#42b883" 
            strokeWidth={2} 
            dot={{ r: 3, fill: '#42b883' }}
            activeDot={{ r: 5 }} 
            name="Expenses"
          />
          <Line 
            type="monotone" 
            dataKey="recoveries" 
            stroke="#8b5cf6" 
            strokeWidth={2} 
            dot={{ r: 3, fill: '#8b5cf6' }}
            activeDot={{ r: 5 }}
            name="Recoveries"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
