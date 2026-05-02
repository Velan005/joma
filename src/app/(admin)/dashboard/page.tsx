"use client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, Package, Users, TrendingUp, ShoppingBag, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function DashboardPage() {
  const { data: statsData, isLoading, error } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/stats");
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
    staleTime: 60_000,   // don't refetch within 60s — stats don't need real-time freshness
    gcTime: 5 * 60_000,  // keep in cache for 5 minutes
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
     return (
       <div className="p-8 text-center text-destructive">
          Failed to load dashboard statistics.
       </div>
     );
  }

  const stats = [
    { name: 'Total Revenue', value: `₹${statsData.totalRevenue.toLocaleString()}`, icon: DollarSign },
    { name: 'Total Sales', value: statsData.totalSales, icon: ShoppingBag },
    { name: 'Total Orders', value: statsData.totalOrders, icon: Package },
    { name: 'Total Customers', value: statsData.totalCustomers, icon: Users },
    { name: 'Total Products', value: statsData.totalProducts, icon: TrendingUp },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl">Dashboard Overview</h1>
        <p className="text-muted-foreground font-body text-sm mt-1">Welcome back. Here's what's happening with your store today.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-background border border-border p-6 rounded-none">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs tracking-[0.1em] uppercase text-muted-foreground font-body">{stat.name}</p>
              <stat.icon className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-display">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-background border border-border p-8 rounded-none">
        <h3 className="font-display text-lg mb-8">Weekly Sales Volume</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statsData.chartData}>
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

