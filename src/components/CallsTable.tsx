import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Play } from 'lucide-react';
import { formatInTimeZone } from 'date-fns-tz';

interface Call {
  id: string;
  call_id: string;
  customer_number: string;
  call_date: string;
  call_minutes: number;
  outcome: string;
  call_cost: number;
  recording_url?: string;
  summary?: string;
}

interface CallsTableProps {
  calls: Call[] | undefined;
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

export const CallsTable = ({ 
  calls, 
  isLoading, 
  currentPage, 
  totalPages, 
  totalCount, 
  onPageChange 
}: CallsTableProps) => {
  const getOutcomeBadge = (outcome: string) => {
    const normalizedOutcome = outcome.toLowerCase();
    
    switch (normalizedOutcome) {
      case 'booked':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">✅ Booked</Badge>;
      case 'connected':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">📞 Connected</Badge>;
      case 'no answer':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">📵 No Answer</Badge>;
      case 'busy':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">📞 Busy</Badge>;
      case 'wrong number':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">❌ Wrong Number</Badge>;
      case 'left voicemail':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">📧 Left Voicemail</Badge>;
      case 'left live message':
        return <Badge variant="outline" className="bg-indigo-100 text-indigo-800 border-indigo-300">💬 Left Live Message</Badge>;
      default:
        return <Badge variant="outline">{outcome}</Badge>;
    }
  };

  // Generate visible page numbers with ellipsis logic
  const getVisiblePages = () => {
    const pages = [];
    const maxVisible = 7; // Show max 7 page numbers
    
    if (totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page, current page area, and last page with ellipsis
      if (currentPage <= 4) {
        // Near beginning
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        // Near end
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // In middle
        pages.push(1);
        pages.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  if (isLoading) {
    return (
      <Card className="shadow-lg border-2 border-slate-100 rounded-2xl">
        <CardHeader>
          <CardTitle>Call Records</CardTitle>
          <CardDescription>Loading call data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-2 border-slate-100 rounded-2xl bg-white/95 animate-fade-in">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-800">Call Records</CardTitle>
        <CardDescription className="text-slate-500">
          {totalCount} calls found {totalPages > 1 && `• Page ${currentPage} of ${totalPages}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Call ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Outcome</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {calls && calls.length > 0 ? (
                calls.map((call) => (
                  <TableRow
                    key={call.id}
                    className="hover:bg-blue-50/60 transition-colors cursor-pointer"
                  >
                    <TableCell className="font-medium">{call.call_id}</TableCell>
                    <TableCell>{call.customer_number}</TableCell>
                    <TableCell>{formatInTimeZone(new Date(call.call_date), 'America/New_York', 'MMM dd, yyyy HH:mm')} ET</TableCell>
                    <TableCell>{call.call_minutes}m</TableCell>
                    <TableCell>{getOutcomeBadge(call.outcome)}</TableCell>
                    <TableCell>${call.call_cost.toFixed(2)}</TableCell>
                    <TableCell>
                      {call.recording_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(call.recording_url!, '_blank')}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Recording
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No calls found. Call data will appear here once received from your automation.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {totalPages > 1 && (
          <div className="mt-4 w-full overflow-x-auto">
            <Pagination className="w-full">
              <PaginationContent className="flex-wrap justify-center gap-1">
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
                    className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                
                {getVisiblePages().map((page, index) => (
                  <PaginationItem key={index}>
                    {page === 'ellipsis' ? (
                      <span className="flex h-9 w-9 items-center justify-center text-sm">...</span>
                    ) : (
                      <PaginationLink
                        onClick={() => onPageChange(page as number)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
                    className={currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  );
};