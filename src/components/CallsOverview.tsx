import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, DollarSign, Clock, TrendingUp } from 'lucide-react';

interface CallStatistics {
  total_calls: number;
  total_cost: number;
  total_minutes: number;
  successful_calls: number;
  success_rate: number;
}

interface CallsOverviewProps {
  statistics?: CallStatistics;
  isLoading: boolean;
}

export const CallsOverview = ({ statistics, isLoading }: CallsOverviewProps) => {
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 border-0 shadow-lg rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Loading...</CardTitle>
              <div className="h-5 w-5 bg-slate-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-slate-200 rounded animate-shimmer mb-2"></div>
              <div className="h-3 bg-slate-100 rounded animate-pulse"></div>
            </CardContent>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
          </Card>
        ))}
      </div>
    );
  }

  const totalCalls = statistics?.total_calls || 0;
  const totalCost = statistics?.total_cost || 0;
  const totalMinutesRaw = statistics?.total_minutes || 0;
  const successRate = statistics?.success_rate || 0;

  // Round up total minutes to nearest 3, no hours, just "Xm"
  const roundedUpMinutes = Math.ceil(Number(totalMinutesRaw) / 3) * 3;

  const cards = [
    {
      title: "Total Calls",
      value: Number(totalCalls).toLocaleString(),
      description: "Total calls recorded",
      icon: Phone,
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-50 to-blue-100",
      iconColor: "text-blue-500",
      titleColor: "text-blue-700",
      shadow: "shadow-blue-200/50"
    },
    {
      title: "Total Cost",
      value: `$${Number(totalCost).toFixed(2)}`,
      description: "Total call expenses",
      icon: DollarSign,
      gradient: "from-emerald-500 to-emerald-600",
      bgGradient: "from-emerald-50 to-emerald-100",
      iconColor: "text-emerald-500",
      titleColor: "text-emerald-700",
      shadow: "shadow-emerald-200/50"
    },
    {
      title: "Total Minutes",
      value: `${roundedUpMinutes}m`,
      description: "Total call duration",
      icon: Clock,
      gradient: "from-purple-500 to-purple-600",
      bgGradient: "from-purple-50 to-purple-100",
      iconColor: "text-purple-500",
      titleColor: "text-purple-700",
      shadow: "shadow-purple-200/50"
    },
    {
      title: "Booking Rate",
      value: `${Number(successRate).toFixed(1)}%`,
      description: "Calls that resulted in bookings",
      icon: TrendingUp,
      gradient: "from-orange-500 to-orange-600",
      bgGradient: "from-orange-50 to-orange-100",
      iconColor: "text-orange-500",
      titleColor: "text-orange-700",
      shadow: "shadow-orange-200/50"
    }
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <Card 
          key={card.title}
          className={`
            relative overflow-hidden bg-gradient-to-br ${card.bgGradient} 
            border-0 shadow-xl ${card.shadow} rounded-2xl 
            hover-lift cursor-pointer group
            animate-fade-in
          `}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
            <CardTitle className={`text-sm font-semibold ${card.titleColor} tracking-wide`}>
              {card.title}
            </CardTitle>
            <div className={`p-2 rounded-xl bg-white/80 ${card.iconColor} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
              <card.icon className="h-5 w-5" />
            </div>
          </CardHeader>
          
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-slate-800 mb-1 group-hover:scale-105 transition-transform duration-300">
              {card.value}
            </div>
            <p className="text-xs text-slate-600 font-medium">
              {card.description}
            </p>
          </CardContent>

          {/* Animated border effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse-glow"></div>
        </Card>
      ))}
    </div>
  );
};