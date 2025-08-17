"use client"

import { useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useTables, type DatabaseTable } from "@/hooks/useTables"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, AlertCircle, ArrowRight, Columns, Activity, RefreshCcw } from "lucide-react"

export default function OptimizedDatabasePage() {
  const router = useRouter()
  const { data: tables = [] as DatabaseTable[], isLoading, error, refetch, isFetching } = useTables()

  const navigateToTable = useCallback((tableName: string) => {
    router.push(`/data/database/${tableName}`)
  }, [router])

  const getTableInfo = useCallback((sql: string): { columnCount: number, hasIndexes: boolean } => {
    // Extract column count from CREATE TABLE statement
    const matches = sql.match(/\((.*)\)/s)
    let columnCount = 0
    let hasIndexes = false
    
    if (matches) {
      const columns = matches[1].split(',').filter(col => !col.trim().startsWith('CONSTRAINT'))
      columnCount = columns.length
      hasIndexes = sql.toLowerCase().includes('primary key') || sql.toLowerCase().includes('unique')
    }
    
    return { columnCount, hasIndexes }
  }, [])

  // Memoize table cards to prevent unnecessary re-renders
  const tableCards = useMemo(() => 
    tables.map((table: DatabaseTable) => {
      const { columnCount, hasIndexes } = getTableInfo(table.sql)
      return (
        <Card 
          key={table.name} 
          className="group cursor-pointer hover:shadow-l hover:scale-[1.02] transition-all duration-200 overflow-hidden border-muted"
          onClick={() => navigateToTable(table.name)}
        >
          <div className="h-2" />
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-lg">
                <div>
                  <Table className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                {table.name}
              </span>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all translate-x-0 group-hover:translate-x-1" />
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-1">
                <Columns className="h-3 w-3" />
                <span>{columnCount} columns</span>
              </div>
              {hasIndexes && (
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  <span>Indexed</span>
                </div>
              )}
            </div>
            <Button 
              variant="ghost" 
              className="w-full justify-between group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                navigateToTable(table.name)
              }}
            >
              <span>View Data</span>
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      )
    }),
    [tables, getTableInfo, navigateToTable]
  )

  if (isLoading) {
    return (
      <div className="@container/main flex flex-1 flex-col gap-6">
        <div className="pb-6">
          <h1 className="text-3xl font-bold tracking-tight uppercase" style={{ color: '#DB802D' }}>Database Viewer</h1>
          <div className="flex items-center gap-2 mt-2 text-muted-foreground">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
            <span className="text-sm">Loading tables...</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-24" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="@container/main flex flex-1 flex-col gap-6">
        <div className="pb-6">
          <h1 className="text-3xl font-bold tracking-tight uppercase" style={{ color: '#DB802D' }}>Database Viewer</h1>
          <p className="text-muted-foreground mt-2">Failed to connect to database</p>
        </div>
        <Alert variant="destructive" className="max-w-2xl">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="ml-2">{(error as Error).message}</AlertDescription>
        </Alert>
        <Button onClick={() => refetch()} variant="outline" className="w-fit">
          <Activity className="h-4 w-4 mr-2" />
          Retry Connection
        </Button>
      </div>
    )
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-6">
      <div className="pb-6">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold tracking-tight uppercase" style={{ color: '#DB802D' }}>Database Viewer</h1>
            <div className="flex items-center gap-4 mt-2">
              <p className="text-muted-foreground">
                Cloudflare D1 • <span className="font-mono text-sm bg-muted px-2 py-0.5 rounded">alleato</span>
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className={`w-2 h-2 rounded-full ${isFetching ? 'bg-orange-500 animate-pulse' : 'bg-green-500'}`}></div>
                <span>{isFetching ? 'Updating...' : 'Live'}</span>
                <span className="text-muted-foreground/50">•</span>
                <Activity className="h-3 w-3" />
                <span>{tables.length} tables</span>
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="text-muted-foreground hover:text-foreground"
            >
              <RefreshCcw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {tables.length === 0 ? (
        <Alert>
          <AlertDescription>No tables found in the database.</AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tableCards}
        </div>
      )}
    </div>
  )
}