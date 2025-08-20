'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  IconRefresh,
  IconFilter,
  IconChevronDown,
  IconAlertCircle,
  IconCircleCheck,
  IconInfoCircle,
  IconClipboardList,
  IconArrowUp,
  IconArrowDown,
  IconDots,
  IconEye,
  IconCheck,
} from '@tabler/icons-react';

interface Insight {
  id: number;
  title: string;
  description: string;
  insight_type: 'general_info' | 'positive_feedback' | 'risk' | 'action_item';
  confidence_score: number | null;
  severity: 'low' | 'medium' | 'high' | null;
  project_id: number | null;
  meeting_id: string | null;
  created_at: string | null;
  resolved: number | null;
  meetings?: {
    id: string;
    title: string;
    date: string;
    participants: string[];
  };
  projects?: {
    id: number;
    name: string;
    'job number': string;
  };
}

interface InsightsTableProps {
  projectId?: number;
  limit?: number;
  showProjectColumn?: boolean;
  onInsightClick?: (insight: Insight) => void;
}

export function InsightsTable({
  projectId,
  limit = 50,
  showProjectColumn = true,
  onInsightClick,
}: InsightsTableProps) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  // Fetch insights from the worker
  const fetchInsights = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: '0',
      });
      
      if (projectId) {
        params.append('projectId', projectId.toString());
      }
      
      if (typeFilter !== 'all') {
        params.append('type', typeFilter);
      }

      const response = await fetch(`/api/insights?${params}`);
      if (!response.ok) throw new Error('Failed to fetch insights');
      
      const data = await response.json();
      setInsights(data.insights || []);
    } catch (error) {
      console.error('Error fetching insights:', error);
      toast.error('Failed to load insights');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [projectId, typeFilter]);

  // Mark insight as resolved
  const markAsResolved = async (insightId: number) => {
    try {
      // For now, we'll update locally. In production, this would call an API
      setInsights(prev =>
        prev.map(insight =>
          insight.id === insightId
            ? { ...insight, resolved: 1 }
            : insight
        )
      );
      toast.success('Insight marked as resolved');
    } catch (error) {
      toast.error('Failed to update insight');
    }
  };

  // Get icon based on insight type
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'risk':
        return <IconAlertCircle className="h-4 w-4" />;
      case 'positive_feedback':
        return <IconCircleCheck className="h-4 w-4" />;
      case 'action_item':
        return <IconClipboardList className="h-4 w-4" />;
      default:
        return <IconInfoCircle className="h-4 w-4" />;
    }
  };

  // Get badge variant based on type
  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'risk':
        return 'destructive';
      case 'positive_feedback':
        return 'default';
      case 'action_item':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  // Get severity badge color
  const getSeverityBadgeVariant = (severity: string | null) => {
    switch (severity) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  // Define table columns
  const columns: ColumnDef<Insight>[] = useMemo(() => {
    const cols: ColumnDef<Insight>[] = [
      {
        accessorKey: 'insight_type',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 p-0"
          >
            Type
            {column.getIsSorted() === 'asc' ? (
              <IconArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === 'desc' ? (
              <IconArrowDown className="ml-2 h-4 w-4" />
            ) : null}
          </Button>
        ),
        cell: ({ row }) => {
          const type = row.getValue('insight_type') as string;
          return (
            <div className="flex items-center gap-2">
              {getInsightIcon(type)}
              <Badge variant={getTypeBadgeVariant(type)}>
                {type.replace('_', ' ')}
              </Badge>
            </div>
          );
        },
      },
      {
        accessorKey: 'title',
        header: 'Title',
        cell: ({ row }) => (
          <div className="font-medium max-w-[300px] truncate">
            {row.getValue('title')}
          </div>
        ),
      },
      {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ row }) => (
          <div className="text-sm text-muted-foreground max-w-[400px] line-clamp-2">
            {row.getValue('description')}
          </div>
        ),
      },
    ];

    // Add project column if needed
    if (showProjectColumn) {
      cols.push({
        accessorKey: 'projects',
        header: 'Project',
        cell: ({ row }) => {
          const project = row.original.projects;
          if (!project) return <span className="text-muted-foreground">Unassigned</span>;
          return (
            <div className="flex flex-col">
              <span className="font-medium text-sm">{project.name}</span>
              {project['job number'] && (
                <span className="text-xs text-muted-foreground">
                  #{project['job number']}
                </span>
              )}
            </div>
          );
        },
      });
    }

    // Add remaining columns
    cols.push(
      {
        accessorKey: 'severity',
        header: 'Severity',
        cell: ({ row }) => {
          const severity = row.getValue('severity') as string | null;
          if (!severity) return null;
          return (
            <Badge variant={getSeverityBadgeVariant(severity)}>
              {severity}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'confidence_score',
        header: 'Confidence',
        cell: ({ row }) => {
          const score = row.getValue('confidence_score') as number | null;
          if (score === null) return null;
          return (
            <div className="flex items-center gap-2">
              <div className="w-16 bg-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{ width: `${score * 100}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">
                {(score * 100).toFixed(0)}%
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: 'created_at',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 p-0"
          >
            Created
            {column.getIsSorted() === 'asc' ? (
              <IconArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === 'desc' ? (
              <IconArrowDown className="ml-2 h-4 w-4" />
            ) : null}
          </Button>
        ),
        cell: ({ row }) => {
          const date = row.getValue('created_at') as string | null;
          if (!date) return null;
          return (
            <span className="text-sm text-muted-foreground">
              {format(new Date(date), 'MMM d, yyyy')}
            </span>
          );
        },
      },
      {
        accessorKey: 'resolved',
        header: 'Status',
        cell: ({ row }) => {
          const resolved = row.getValue('resolved') as number | null;
          return resolved ? (
            <Badge variant="outline" className="text-green-600">
              <IconCheck className="h-3 w-3 mr-1" />
              Resolved
            </Badge>
          ) : (
            <Badge variant="outline">Open</Badge>
          );
        },
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          const insight = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <IconDots className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => onInsightClick?.(insight)}
                >
                  <IconEye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                {!insight.resolved && (
                  <DropdownMenuItem
                    onClick={() => markAsResolved(insight.id)}
                  >
                    <IconCheck className="mr-2 h-4 w-4" />
                    Mark as Resolved
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-muted-foreground">
                  Meeting: {insight.meetings?.title || 'Unknown'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    );

    return cols;
  }, [showProjectColumn, onInsightClick]);

  // Filter insights based on severity
  const filteredInsights = useMemo(() => {
    if (severityFilter === 'all') return insights;
    return insights.filter(i => i.severity === severityFilter);
  }, [insights, severityFilter]);

  // Create table instance
  const table = useReactTable({
    data: filteredInsights,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      globalFilter,
    },
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Project Insights</CardTitle>
            <CardDescription>
              AI-generated insights from meeting transcripts
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchInsights}
            disabled={loading}
          >
            <IconRefresh className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex items-center gap-4 mb-4">
          <Input
            placeholder="Search insights..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="max-w-sm"
          />
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="general_info">General Info</SelectItem>
              <SelectItem value="positive_feedback">Positive</SelectItem>
              <SelectItem value="risk">Risks</SelectItem>
              <SelectItem value="action_item">Action Items</SelectItem>
            </SelectContent>
          </Select>
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {loading ? (
                // Loading skeleton
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {columns.map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-8 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => onInsightClick?.(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No insights found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between py-4">
          <div className="text-sm text-muted-foreground">
            Showing {table.getRowModel().rows.length} of {filteredInsights.length} insights
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}