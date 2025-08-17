"use client"

import { useState, useCallback, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { useTableData, useTableSchema } from "@/hooks/useTableData"
import { useDebounce } from "@/hooks/useDebounce"
import { VirtualTable } from "@/components/ui/virtual-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  X,
  Database,
  AlertCircle,
  Zap,
} from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface TableColumn {
  cid: number
  name: string
  type: string
  notnull: number
  dflt_value: unknown
  pk: number
}

export default function OptimizedTableViewerPage() {
  const params = useParams()
  const tableName = params.tableName as string
  
  // UI state
  const [useVirtualization, setUseVirtualization] = useState(false)
  
  // Pagination state
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(50)
  
  // Sort state
  const [sortBy, setSortBy] = useState<string>("")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  
  // Search state
  const [searchInput, setSearchInput] = useState("")
  const debouncedSearch = useDebounce(searchInput, 300)

  // Define specific columns for the meetings table
  const meetingsColumns = [
    'title', 'date_time', 'duration', 'project', 'category', 
    'meeting_type', 'tags', 'client', 'follow_up_required', 
    'vector_processed', 'insight_generated'
  ]

  // Fetch data using React Query
  const { data: schemaData, isLoading: schemaLoading, error: schemaError } = useTableSchema(tableName)
  const allColumns = schemaData?.columns || []
  
  // Filter columns based on table name
  const columns = useMemo(() => {
    if (tableName === 'meetings') {
      return allColumns.filter(col => 
        meetingsColumns.includes(col.name.toLowerCase())
      ).sort((a, b) => {
        const aIndex = meetingsColumns.indexOf(a.name.toLowerCase())
        const bIndex = meetingsColumns.indexOf(b.name.toLowerCase())
        return aIndex - bIndex
      })
    }
    return allColumns
  }, [allColumns, tableName])

  // Set default sort when columns load
  useMemo(() => {
    if (columns.length > 0 && !sortBy) {
      setSortBy(columns[0].name)
    }
  }, [columns, sortBy])

  const { 
    data: tableData, 
    isLoading: dataLoading, 
    error: dataError,
    isFetching,
  } = useTableData(tableName, {
    page,
    limit,
    sortBy,
    sortOrder,
    search: debouncedSearch,
  })

  const data = tableData?.data || []
  const totalPages = tableData?.pagination?.totalPages || 1
  const totalCount = tableData?.pagination?.totalCount || 0

  // Memoized callbacks
  const handleSort = useCallback((columnName: string) => {
    if (sortBy === columnName) {
      setSortOrder(prev => prev === "asc" ? "desc" : "asc")
    } else {
      setSortBy(columnName)
      setSortOrder("asc")
    }
    setPage(1)
  }, [sortBy])

  const clearSearch = useCallback(() => {
    setSearchInput("")
    setPage(1)
  }, [])

  const formatCellValue = useCallback((value: unknown, column: TableColumn): React.ReactNode => {
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground/50 italic">NULL</span>
    }
    
    // Special formatting for duration column in meetings table
    if (tableName === 'meetings' && column.name.toLowerCase() === 'duration' && typeof value === 'number') {
      return <span className="font-mono tabular-nums">{Math.round(value)} mins</span>
    }
    
    const type = column.type.toUpperCase()
    
    if (type.includes('INT') || type.includes('REAL') || type.includes('NUMERIC')) {
      return <span className="font-mono tabular-nums">{String(value)}</span>
    }
    
    if (type.includes('BOOL')) {
      return (
        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
          value ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
        }`}>
          {String(value)}
        </span>
      )
    }
    
    if (type.includes('DATE') || type.includes('TIME')) {
      try {
        const date = new Date(value)
        if (!isNaN(date.getTime())) {
          return <span className="font-mono">{date.toLocaleString()}</span>
        }
      } catch {}
    }
    
    if (typeof value === 'object') {
      return (
        <pre className="text-xs bg-muted/50 rounded px-1 py-0.5 max-w-xs overflow-auto">
          {JSON.stringify(value, null, 2)}
        </pre>
      )
    }
    
    const strValue = String(value)
    if (strValue.length > 100) {
      return (
        <div className="group relative">
          <span className="block truncate max-w-xs">
            {strValue.substring(0, 100)}...
          </span>
          <div className="absolute left-0 top-full mt-1 hidden group-hover:block z-20 p-2 bg-popover text-popover-foreground rounded-lg shadow-lg border max-w-md break-words">
            {strValue}
          </div>
        </div>
      )
    }
    
    return strValue
  }, [tableName])

  const renderSortIcon = useCallback((columnName: string) => {
    if (sortBy !== columnName) {
      return <ArrowUpDown className="ml-1 h-3 w-3 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
    }
    return sortOrder === "asc" 
      ? <ArrowUp className="ml-1 h-3 w-3 text-primary" />
      : <ArrowDown className="ml-1 h-3 w-3 text-primary" />
  }, [sortBy, sortOrder])

  // Memoized virtual table columns
  const virtualColumns = useMemo(() => 
    columns.map(column => ({
      key: column.name,
      header: (
        <div 
          className="flex items-center justify-between cursor-pointer hover:text-foreground transition-colors"
          onClick={() => handleSort(column.name)}
        >
          <span className="font-medium text-xs uppercase tracking-wider">
            {column.name}
          </span>
          <div className="flex items-center gap-1">
            {renderSortIcon(column.name)}
          </div>
        </div>
      ),
      cell: (row: Record<string, unknown>) => formatCellValue(row[column.name], column),
      className: column.pk ? "font-medium" : undefined,
    })),
    [columns, handleSort, renderSortIcon, formatCellValue]
  )

  const error = schemaError || dataError
  const loading = schemaLoading || dataLoading

  if (error && columns.length === 0) {
    return (
      <div className="@container/main flex flex-1 flex-col gap-4">
        <div className="pb-6">
          <h1 className="text-2xl font-bold tracking-tight uppercase">{tableName}</h1>
          <p className="text-sm text-muted-foreground mt-2">Failed to load table</p>
        </div>
        <Alert variant="destructive" className="max-w-2xl">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error.message || "Failed to load table"}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-4">
      {/* Header */}
      <div className="pb-6">
        <div className="flex items-start justify-between gap-6">
          {/* Column 1: Title and Status */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold tracking-tight uppercase" style={{ color: '#DB802D' }}>{tableName}</h1>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  isFetching ? "bg-orange-500 animate-pulse" : "bg-green-500"
                )}></div>
                <span>{isFetching ? "Updating..." : "Live"}</span>
                <span className="text-muted-foreground/50">•</span>
                <span>{totalCount.toLocaleString()} {totalCount === 1 ? 'record' : 'records'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="virtualization"
                  checked={useVirtualization}
                  onCheckedChange={setUseVirtualization}
                  disabled={data.length === 0}
                />
                <Label htmlFor="virtualization" className="text-sm cursor-pointer text-muted-foreground">
                  <Zap className="inline h-3 w-3 mr-1" />
                  Virtual scrolling
                </Label>
              </div>
            </div>
          </div>
          
          {/* Column 2: Search */}
          <div className="flex items-start gap-3 max-w-md w-full">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search across all text columns..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10 pr-10 h-10 bg-muted/30 border-muted focus:border-muted-foreground focus:bg-background transition-colors focus:ring-0 focus:ring-offset-0"
              />
              {searchInput && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon"
                  onClick={clearSearch}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-transparent"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 bg-background overflow-hidden">
        {useVirtualization && data.length > 0 ? (
          <VirtualTable
            data={data}
            columns={virtualColumns}
            className="h-[600px]"
            estimateSize={50}
            overscan={10}
          />
        ) : (
          <div className="overflow-auto">
            <Table className="relative">
              <TableHeader className="sticky top-0 z-10 bg-muted/50 backdrop-blur supports-[backdrop-filter]:bg-muted/40">
                <TableRow className="border-b-2">
                  {columns.map((column) => (
                    <TableHead 
                      key={column.name}
                      className="cursor-pointer hover:bg-muted/80 transition-colors group h-12"
                      onClick={() => handleSort(column.name)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-xs uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">
                          {column.name}
                        </span>
                        <div className="flex items-center gap-1">
                          {renderSortIcon(column.name)}
                        </div>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [...Array(10)].map((_, i) => (
                    <TableRow key={i}>
                      {columns.map((column) => (
                        <TableCell key={column.name}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : data.length === 0 ? (
                  <TableRow>
                    <TableCell 
                      colSpan={columns.length} 
                      className="text-center py-12"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Database className="h-8 w-8 text-muted-foreground/50" />
                        <p className="text-sm font-medium text-muted-foreground">
                          {debouncedSearch ? "No results found" : "No data available"}
                        </p>
                        {debouncedSearch && (
                          <p className="text-xs text-muted-foreground/70">
                            Try adjusting your search terms
                          </p>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((row, i) => (
                    <TableRow 
                      key={i} 
                      className={`hover:bg-muted/30 transition-colors group/row ${
                        i % 2 === 0 ? 'bg-background' : 'bg-muted/10'
                      }`}
                    >
                      {columns.map((column) => (
                        <TableCell 
                          key={column.name}
                          className="text-sm py-3 px-4 first:font-medium"
                        >
                          {formatCellValue(row[column.name], column)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Show:</span>
            <Select 
              value={limit.toString()} 
              onValueChange={(value) => {
                setLimit(Number(value))
                setPage(1)
              }}
            >
              <SelectTrigger className="w-[70px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
                <SelectItem value="200">200</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">rows</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Showing {((page - 1) * limit) + 1}-{Math.min(page * limit, totalCount)} of {totalCount.toLocaleString()}
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPage(1)}
            disabled={page === 1 || loading}
            className="hidden sm:flex"
          >
            First
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1">
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              
              return (
                <Button
                  key={pageNum}
                  variant={page === pageNum ? "default" : "ghost"}
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setPage(pageNum)}
                  disabled={loading}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || loading}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPage(totalPages)}
            disabled={page === totalPages || loading}
            className="hidden sm:flex"
          >
            Last
          </Button>
        </div>
      </div>
    </div>
  )
}

function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(' ')
}