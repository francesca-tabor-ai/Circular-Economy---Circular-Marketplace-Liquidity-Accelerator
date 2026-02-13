
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TransactionMetric } from '../types';

const data: TransactionMetric[] = [
  { date: 'W1', transactions: 4, supplyActive: 12, demandActive: 8 },
  { date: 'W2', transactions: 7, supplyActive: 15, demandActive: 10 },
  { date: 'W3', transactions: 5, supplyActive: 18, demandActive: 12 },
  { date: 'W4', transactions: 12, supplyActive: 22, demandActive: 15 },
  { date: 'W5', transactions: 18, supplyActive: 28, demandActive: 22 },
  { date: 'W6', transactions: 25, supplyActive: 35, demandActive: 30 },
  { date: 'W7', transactions: 42, supplyActive: 45, demandActive: 45 },
];

const LiquidityChart: React.FC = () => {
  return (
    <div className="h-[340px] w-full mt-6">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorTrans" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorSupply" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis 
            dataKey="date" 
            stroke="#94a3b8" 
            fontSize={11} 
            tickLine={false} 
            axisLine={false} 
            dy={10}
          />
          <YAxis 
            stroke="#94a3b8" 
            fontSize={11} 
            tickLine={false} 
            axisLine={false}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
            itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
          />
          <Legend 
            verticalAlign="top" 
            align="right" 
            iconType="circle" 
            wrapperStyle={{ paddingBottom: '20px', fontSize: '12px' }} 
          />
          <Area 
            type="monotone" 
            dataKey="transactions" 
            stroke="#10b981" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorTrans)" 
            name="Weekly Transactions"
          />
          <Area 
            type="monotone" 
            dataKey="supplyActive" 
            stroke="#3b82f6" 
            strokeWidth={2}
            strokeDasharray="5 5"
            fillOpacity={1}
            fill="url(#colorSupply)"
            name="Active Suppliers"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LiquidityChart;
