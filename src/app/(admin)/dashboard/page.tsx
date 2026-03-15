"use client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, Package, Users, TrendingUp } from "lucide-react";

const data = [
  { name: 'Mon', sales: 4000 },
  { name: 'Tue', sales: 3000 },
  { name: 'Wed', sales: 2000 },
  { name: 'Thu', sales: 2780 },
  { name: 'Fri', sales: 1890 },
  { name: 'Sat', sales: 2390 },
  { name: 'Sun', sales: 3490 },
];

const stats = [
  { name: 'Total Revenue', value: '$45,231.89', change: '+20.1% from last month', icon: DollarSign },
  { name: 'Total Orders', value: '+2350', change: '+180.1% from last month', icon: Package },
  { name: 'Active Users', value: '+12,234', change: '+19% from last month', icon: Users },
  { name: 'Conversion Rate', value: '3.2%', change: '+0.2% from last month', icon: TrendingUp },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl">Dashboard Overview</h1>
        <p className="text-muted-foreground font-body text-sm mt-1">Welcome back. Here's what's happening with your store today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-background border border-border p-6 rounded-none">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs tracking-[0.1em] uppercase text-muted-foreground font-body">{stat.name}</p>
              <stat.icon className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-display">{stat.value}</p>
              <p className="text-[10px] font-body text-muted-foreground">{stat.change}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-background border border-border p-8 rounded-none">
        <h3 className="font-display text-lg mb-8">Weekly Sales Volume</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fontFamily: 'var(--font-body)', fill: 'hsl(var(--muted-foreground))' }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fontFamily: 'var(--font-body)', fill: 'hsl(var(--muted-foreground))' }} 
              />
              <Tooltip 
                cursor={{ fill: 'hsl(var(--secondary))', opacity: 0.4 }}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0px',
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px'
                }}
              />
              <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
