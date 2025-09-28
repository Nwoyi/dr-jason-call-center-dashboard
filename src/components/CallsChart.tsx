import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { formatInTimeZone, parseISO } from 'date-fns-tz';

interface ChartData {
  daily: Array<{
    call_date: string;
    call_count: number;
    total_cost: number;
    total_minutes: number;
  }>;
  outcomes: Array<{
    outcome_name: string;
    outcome_count: number;
  }>;
  hourly: Array<{
    call_hour: number;
    call_count: number;
  }>;
}

interface CallsChartProps {
  chartData: ChartData | undefined;
  isLoading: boolean;
}

export const CallsChart = ({ chartData, isLoading }: CallsChartProps) => {
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="shadow-lg border-2 border-slate-100 rounded-2xl">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-100 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Transform daily data for charts
  const dailyStats = (chartData?.daily || []).map((item) => ({
    date: formatInTimeZone(parseISO(item.call_date), 'America/New_York', 'MMM dd'),
    calls: Number(item.call_count),
    cost: Number(item.total_cost),
    minutes: Number(item.total_minutes)
  })).reverse(); // Reverse to show chronological order

  // Transform outcome data for pie chart with better label handling
  const pieData = (chartData?.outcomes || []).map((item) => ({
    name: item.outcome_name,
    value: Number(item.outcome_count),
    // Truncate long names for better display
    displayName: item.outcome_name.length > 12 ? item.outcome_name.substring(0, 12) + '...' : item.outcome_name
  }));

  // Custom label function for pie chart
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
    // Only show labels for slices larger than 5%
    if (percent < 0.05) return null;
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 1.4;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="#374151" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
        fontWeight="500"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Transform hourly data for bar chart
  const hourlyData = Array.from({ length: 24 }, (_, hour) => {
    const hourCalls = chartData?.hourly?.find(h => h.call_hour === hour);
    return {
      hour: `${hour}:00`,
      calls: hourCalls ? Number(hourCalls.call_count) : 0
    };
  });

  const COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#fde68a', '#e879f9', '#fbbf24'];

  const hasData = chartData && (chartData.daily.length > 0 || chartData.outcomes.length > 0);
  const dateRange = hasData && chartData.daily.length > 0 
    ? `${formatInTimeZone(parseISO(chartData.daily[chartData.daily.length - 1].call_date), 'America/New_York', 'MMM dd, yyyy')} – ${formatInTimeZone(parseISO(chartData.daily[0].call_date), 'America/New_York', 'MMM dd, yyyy')} ET`
    : "No data available";

  const chartCards = [
    {
      title: "📊 Call Volume",
      description: hasData ? `Daily calls: ${dateRange}` : "No data",
      gradient: "from-blue-50 via-indigo-50 to-blue-100",
      shadowColor: "shadow-blue-300/30",
      titleColor: "text-blue-700",
      descColor: "text-blue-600",
      component: (
        <BarChart data={dailyStats}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="date" fontSize={12} />
          <YAxis fontSize={12} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)', 
              border: 'none', 
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
            }}
          />
          <Legend />
          <Bar 
            dataKey="calls" 
            fill="#6366f1" 
            name="Calls" 
            radius={[4, 4, 0, 0]}
            animationDuration={800}
          />
        </BarChart>
      )
    },
    {
      title: "🎯 Call Outcomes",
      description: "Distribution of call outcomes in filtered range",
      gradient: "from-purple-50 via-pink-50 to-purple-100",
      shadowColor: "shadow-purple-300/30",
      titleColor: "text-purple-700",
      descColor: "text-purple-600",
      component: (
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={70}
            fill="#8884d8"
            dataKey="value"
            isAnimationActive
            animationDuration={800}
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value, name) => [value, name]}
            labelFormatter={(label) => `Outcome: ${label}`}
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)', 
              border: 'none', 
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
            }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value) => value.length > 15 ? value.substring(0, 15) + '...' : value}
            wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
          />
        </PieChart>
      )
    },
    {
      title: "💸 Call Cost",
      description: hasData ? `Daily cost: ${dateRange}` : "No data",
      gradient: "from-orange-50 via-amber-50 to-orange-100",
      shadowColor: "shadow-orange-300/30",
      titleColor: "text-orange-600",
      descColor: "text-orange-500",
      component: (
        <LineChart data={dailyStats}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="date" fontSize={12} />
          <YAxis fontSize={12} />
          <Tooltip 
            formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Cost']}
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)', 
              border: 'none', 
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="cost" 
            stroke="#f59e0b" 
            name="Cost ($)" 
            strokeWidth={3} 
            dot={{ r: 6, fill: '#f59e0b', strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 8, fill: '#f59e0b' }}
            animationDuration={800} 
          />
        </LineChart>
      )
    },
    {
      title: "⏰ Hourly Distribution",
      description: "Calls by hour in the selected date range",
      gradient: "from-indigo-50 via-blue-50 to-indigo-100",
      shadowColor: "shadow-indigo-300/30",
      titleColor: "text-indigo-700",
      descColor: "text-indigo-600",
      component: (
        <BarChart data={hourlyData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="hour" fontSize={12} />
          <YAxis fontSize={12} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)', 
              border: 'none', 
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
            }}
          />
          <Bar 
            dataKey="calls" 
            fill="url(#hourlyGradient)" 
            name="Calls" 
            radius={[4, 4, 0, 0]}
            animationDuration={800}
          />
          <defs>
            <linearGradient id="hourlyGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.3}/>
            </linearGradient>
          </defs>
        </BarChart>
      )
    }
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {chartCards.map((card, index) => (
        <Card 
          key={card.title}
          className={`
            relative overflow-hidden bg-gradient-to-tr ${card.gradient} 
            border-0 shadow-xl ${card.shadowColor} rounded-2xl 
            hover-lift group cursor-pointer
            animate-fade-in
          `}
          style={{ animationDelay: `${index * 150}ms` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <CardHeader className="relative z-10">
            <CardTitle className={`text-xl font-bold ${card.titleColor} tracking-wide drop-shadow-sm group-hover:scale-105 transition-transform duration-300`}>
              {card.title}
            </CardTitle>
            <CardDescription className={`${card.descColor} font-medium`}>
              {card.description}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="relative z-10">
            <ResponsiveContainer width="100%" height={280}>
              {card.component}
            </ResponsiveContainer>
          </CardContent>

          {/* Subtle animated border */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        </Card>
      ))}
    </div>
  );
};