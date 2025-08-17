"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import {
  Table,
  TableBody,
  TableCaption,
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
  Table as TableIcon,
  AlertCircle,
} from "lucide-react"

interface TableColumn {
  cid: number
  name: string
  type: string
  notnull: number
  dflt_value: any
  pk: number
}

interface TableDataResponse {
  success: boolean
  data: any[]
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
  }
  error?: string
}

export default function TableViewerPage() {
  const params = useParams()
  const router = useRouter()
  const tableName = params.tableName as string
  
  const [columns, setColumns] = useState<TableColumn[]>([])
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Pagination state
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(50)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  
  // Sort state
  const [sortBy, setSortBy] = useState<string>("")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  
  // Search state
  const [search, setSearch] = useState("")
  const [searchInput, setSearchInput] = useState("")

  useEffect(() => {
    loadTableSchema()
  }, [tableName])

  useEffect(() => {
    if (columns.length > 0) {
      // Set default sort to first column (usually id)
      setSortBy(columns[0].name)
      loadTableData()
    }
  }, [columns, page, limit, sortBy, sortOrder, search])

  const loadTableSchema = async () => {
    try {
      const response = await apiClient.database.getTableSchema(tableName)
      if (response.success) {
        setColumns(response.columns || [])
      } else {
        setError(response.error || "Failed to load table schema")
      }
    } catch (err) {
      setError("Failed to load table schema")
      console.error("Error loading schema:", err)
    }
  }

  const loadTableData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response: TableDataResponse = await apiClient.database.getTableData(tableName, {
        page,
        limit,
        sortBy,
        sortOrder,
        search,
      })
      
      if (response.success) {
        setData(response.data || [])
        setTotalPages(response.pagination.totalPages)
        setTotalCount(response.pagination.totalCount)
      } else {
        setError(response.error || "Failed to load table data")
      }
    } catch (err) {
      setError("Failed to load table data")
      console.error("Error loading data:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSort = (columnName: string) => {
    if (sortBy === columnName) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(columnName)
      setSortOrder("asc")
    }
    setPage(1) // Reset to first page when sorting
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1) // Reset to first page when searching
  }

  const clearSearch = () => {
    setSearchInput("")
    setSearch("")
    setPage(1)
  }

  const formatCellValue = (value: any, column: TableColumn): React.ReactNode => {
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground/50 italic">NULL</span>
    }
    
    // Format based on column type
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
    
    // For text, truncate long values
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
  }

  const renderSortIcon = (columnName: string) => {
    if (sortBy !== columnName) {
      return <ArrowUpDown className="ml-1 h-3 w-3 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
    }
    return sortOrder === "asc" 
      ? <ArrowUp className="ml-1 h-3 w-3 text-primary" />
      : <ArrowDown className="ml-1 h-3 w-3 text-primary" />
  }

  if (error && columns.length === 0) {
    return (
      <div className="@container/main flex flex-1 flex-col gap-4 p-4">
        <Button 
          variant="ghost" 
          onClick={() => router.push("/data/database")}
          className="w-fit"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Tables
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => router.push("/data/database")}
            className="hover:bg-muted"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TableIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{tableName}</h1>
              <p className="text-sm text-muted-foreground">
                {totalCount.toLocaleString()} {totalCount === 1 ? 'record' : 'records'}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Live</span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search across all text columns..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10 pr-10 h-10 bg-muted/30 border-muted focus:bg-background transition-colors"
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
        <Button 
          type="submit" 
          disabled={loading}
          className="shadow-sm"
        >
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </form>

      {/* Table */}
      <div className="flex-1 bg-background rounded-lg border shadow-sm overflow-hidden">
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
                          <span className="text-[10px] text-muted-foreground/50 font-mono">
                            {column.type.toLowerCase()}
                          </span>
                          {renderSortIcon(column.name)}
                        </div>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  // Loading skeletons
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
                          {search ? "No results found" : "No data available"}
                        </p>
                        {search && (
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
                      className="hover:bg-muted/30 transition-colors group/row"
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