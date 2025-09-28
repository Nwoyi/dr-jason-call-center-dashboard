import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X, Filter } from 'lucide-react';

interface CallsFilters {
  outcome?: string;
  dateFrom?: string;
  dateTo?: string;
  customerNumber?: string;
}

interface CallsFiltersProps {
  filters: CallsFilters;
  onFiltersChange: (filters: CallsFilters) => void;
}

export const CallsFilters = ({ filters, onFiltersChange }: CallsFiltersProps) => {
  const updateFilter = (key: keyof CallsFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined,
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(filters).some(value => value);

  return (
    <Card className="shadow-lg border-none rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-400/10 animate-enter transition-all duration-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center rounded-full bg-blue-200 p-2 animate-bounce-slow shadow-sm">
              <Filter className="h-6 w-6 text-blue-500 stroke-[2.5]" />
            </span>
            <CardTitle className="text-2xl font-bold text-blue-600 tracking-tight drop-shadow">
              Dr Jason Won DB
            </CardTitle>
          </div>
          {hasActiveFilters && (
            <Button variant="destructive" size="sm" onClick={clearFilters} className="shadow hover:scale-105 transition-transform">
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          <div className="space-y-1.5">
            <Label htmlFor="outcome" className="text-blue-800 font-semibold text-base">Outcome</Label>
            <Select value={filters.outcome || "all"} onValueChange={(value) => updateFilter('outcome', value === "all" ? "" : value)}>
              <SelectTrigger className="bg-white/80 border-blue-200 focus:ring-2 focus:ring-blue-400 shadow transition-all duration-150">
                <SelectValue placeholder="All outcomes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All outcomes</SelectItem>
                <SelectItem value="Booked">✅ Booked</SelectItem>
                <SelectItem value="Connected">📞 Connected</SelectItem>
                <SelectItem value="No answer">📵 No Answer</SelectItem>
                <SelectItem value="Busy">📞 Busy</SelectItem>
                <SelectItem value="Wrong number">❌ Wrong Number</SelectItem>
                <SelectItem value="Left voicemail">📧 Left Voicemail</SelectItem>
                <SelectItem value="Left live message">💬 Left Live Message</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="dateFrom" className="text-blue-800 font-semibold text-base">From Date</Label>
            <Input
              id="dateFrom"
              type="date"
              className="bg-white/80 border-blue-200 focus:ring-2 focus:ring-blue-400 shadow"
              value={filters.dateFrom || ""}
              onChange={(e) => updateFilter('dateFrom', e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="dateTo" className="text-blue-800 font-semibold text-base">To Date</Label>
            <Input
              id="dateTo"
              type="date"
              className="bg-white/80 border-blue-200 focus:ring-2 focus:ring-blue-400 shadow"
              value={filters.dateTo || ""}
              onChange={(e) => updateFilter('dateTo', e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="customerNumber" className="text-blue-800 font-semibold text-base">Customer Number</Label>
            <Input
              id="customerNumber"
              placeholder="Search by number..."
              className="bg-white/80 border-blue-200 focus:ring-2 focus:ring-blue-400 shadow"
              value={filters.customerNumber || ""}
              onChange={(e) => updateFilter('customerNumber', e.target.value)}
            />
          </div>
          {/* Animated filter button, always visible on mobile */}
          <div className="md:col-span-4 flex justify-end pt-3">
            <Button
              type="button"
              variant="default"
              size="lg"
              className="shadow-blue-300 shadow-md hover:shadow-lg hover:scale-105 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-400 text-white font-bold tracking-wider transition-all duration-200 animate-scale-in"
              onClick={() => window.scrollTo({ top: 400, behavior: 'smooth' })}
            >
              <Filter className="h-4 w-4 mr-2 animate-pulse" />
              Apply Filters
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};