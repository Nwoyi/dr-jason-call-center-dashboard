import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CallsOverview } from './CallsOverview';
import { CallsTable } from './CallsTable';
import { CallsChart } from './CallsChart';
import { CallsFilters } from './CallsFilters';
import { useToast } from '@/hooks/use-toast';

type CallsFiltersType = {
  outcome?: string;
  dateFrom?: string;
  dateTo?: string;
  customerNumber?: string;
};

const CALLS_PER_PAGE = 10;

export const CallsDashboard = () => {
  const { toast } = useToast();
  const [filters, setFilters] = useState<CallsFiltersType>({});
  const [currentPage, setCurrentPage] = useState(1);

  // Query for paginated calls (table view)
  const { data: callsData, isLoading: isLoadingCalls, error } = useQuery({
    queryKey: ['calls', filters, currentPage],
    queryFn: async () => {
      // First get the total count
      let countQuery = supabase
        .from('calls')
        .select('*', { count: 'exact', head: true });

      if (filters.outcome) {
        countQuery = countQuery.eq('outcome', filters.outcome);
      }
      
      if (filters.dateFrom) {
        countQuery = countQuery.gte('call_date', filters.dateFrom);
      }
      
      if (filters.dateTo) {
        countQuery = countQuery.lte('call_date', filters.dateTo);
      }
      
      if (filters.customerNumber) {
        countQuery = countQuery.ilike('customer_number', `%${filters.customerNumber}%`);
      }

      const { count, error: countError } = await countQuery;

      if (countError) {
        throw countError;
      }

      // Then get the paginated data
      let dataQuery = supabase
        .from('calls')
        .select('*')
        .order('call_date', { ascending: false })
        .range((currentPage - 1) * CALLS_PER_PAGE, currentPage * CALLS_PER_PAGE - 1);

      if (filters.outcome) {
        dataQuery = dataQuery.eq('outcome', filters.outcome);
      }
      
      if (filters.dateFrom) {
        dataQuery = dataQuery.gte('call_date', filters.dateFrom);
      }
      
      if (filters.dateTo) {
        dataQuery = dataQuery.lte('call_date', filters.dateTo);
      }
      
      if (filters.customerNumber) {
        dataQuery = dataQuery.ilike('customer_number', `%${filters.customerNumber}%`);
      }

      const { data, error: dataError } = await dataQuery;

      if (dataError) {
        throw dataError;
      }
      
      const result = {
        calls: data || [],
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / CALLS_PER_PAGE)
      };
      
      return result;
    },
    refetchInterval: 30000, // Refetch every 30 seconds to catch new calls
  });

  // Query for call statistics using server-side aggregation
  const { data: statisticsData, isLoading: isLoadingStats } = useQuery({
    queryKey: ['call-statistics', filters],
    queryFn: async () => {
      console.log('Fetching call statistics with filters:', filters);
      
      const { data, error } = await supabase.rpc('get_call_statistics', {
        p_outcome: filters.outcome || null,
        p_date_from: filters.dateFrom || null,
        p_date_to: filters.dateTo || null,
        p_customer_number: filters.customerNumber || null,
      });

      if (error) {
        console.error('Error fetching call statistics:', error);
        throw error;
      }

      console.log('Fetched call statistics:', data);
      return data?.[0] || {
        total_calls: 0,
        total_cost: 0,
        total_minutes: 0,
        successful_calls: 0,
        success_rate: 0
      };
    },
    refetchInterval: 60000, // Refetch every minute for stats (less frequent than table)
  });

  // Query for chart data using server-side aggregation
  const { data: chartData, isLoading: isLoadingCharts } = useQuery({
    queryKey: ['chart-data', filters],
    queryFn: async () => {
      console.log('Fetching chart data with filters:', filters);
      
      // Fetch daily aggregates
      const { data: dailyData, error: dailyError } = await supabase.rpc('get_daily_call_aggregates', {
        p_outcome: filters.outcome || null,
        p_date_from: filters.dateFrom || null,
        p_date_to: filters.dateTo || null,
        p_customer_number: filters.customerNumber || null,
        p_limit: 365
      });

      if (dailyError) {
        console.error('Error fetching daily aggregates:', dailyError);
        throw dailyError;
      }

      // Fetch outcome distribution
      const { data: outcomeData, error: outcomeError } = await supabase.rpc('get_outcome_distribution', {
        p_outcome: filters.outcome || null,
        p_date_from: filters.dateFrom || null,
        p_date_to: filters.dateTo || null,
        p_customer_number: filters.customerNumber || null,
      });

      if (outcomeError) {
        console.error('Error fetching outcome distribution:', outcomeError);
        throw outcomeError;
      }

      // Fetch hourly distribution
      const { data: hourlyData, error: hourlyError } = await supabase.rpc('get_hourly_call_distribution', {
        p_outcome: filters.outcome || null,
        p_date_from: filters.dateFrom || null,
        p_date_to: filters.dateTo || null,
        p_customer_number: filters.customerNumber || null,
      });

      if (hourlyError) {
        console.error('Error fetching hourly distribution:', hourlyError);
        throw hourlyError;
      }

      console.log('Fetched chart data - daily:', dailyData?.length, 'outcomes:', outcomeData?.length, 'hourly:', hourlyData?.length);
      
      return {
        daily: dailyData || [],
        outcomes: outcomeData || [],
        hourly: hourlyData || []
      };
    },
    refetchInterval: 120000, // Refetch every 2 minutes for charts (least frequent)
  });

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Handle error toast in useEffect to avoid state update during render
  React.useEffect(() => {
    if (error) {
      toast({
        title: "Error loading calls",
        description: "Failed to fetch call data. Please try again.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-8">
      <div className="max-w-7xl mx-auto px-2 md:px-4 space-y-6">
        <section>
          <CallsFilters filters={filters} onFiltersChange={setFilters} />
        </section>

        <section className="animate-fade-in">
          <CallsOverview 
            statistics={statisticsData}
            isLoading={isLoadingStats}
          />
        </section>

        <Tabs defaultValue="table" className="space-y-4">
          <TabsList className="bg-blue-100 shadow-sm border border-blue-200 rounded-lg overflow-hidden mb-2 max-w-md mx-auto">
            <TabsTrigger value="table">Call Records</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="table" className="space-y-4 animate-fade-in">
            <CallsTable 
              calls={callsData?.calls} 
              isLoading={isLoadingCalls}
              currentPage={currentPage}
              totalPages={callsData?.totalPages || 0}
              totalCount={callsData?.totalCount || 0}
              onPageChange={handlePageChange}
            />
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-4 animate-fade-in">
            <CallsChart 
              chartData={chartData}
              isLoading={isLoadingCharts} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};