"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Database, Table, AlertCircle, ArrowRight, Columns, Activity } from "lucide-react"

interface DatabaseTable {
  name: string
  sql: string
}

export default function DatabasePage() {
  const [tables, setTables] = useState<DatabaseTable[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    loadTables()
  }, [])

  const loadTables = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiClient.database.getTables()
      
      if (response.success) {
        setTables(response.tables || [])
      } else {
        setError(response.error || "Failed to load tables")
      }
    } catch (err) {
      setError("Failed to connect to the database")
      console.error("Error loading tables:", err)
    } finally {
      setLoading(false)
    }
  }

  const navigateToTable = (tableName: string) => {
    router.push(`/data/database/${tableName}`)
  }

  const getTableInfo = (sql: string): { columnCount: number, hasIndexes: boolean } => {
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
  }

  if (loading) {
    return (
      <div className="@container/main flex flex-1 flex-col gap-4 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-primary/10 rounded-xl animate-pulse">
            <Database className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Database Viewer</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
      <div className="@container/main flex flex-1 flex-col gap-4 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-destructive/10 rounded-xl">
            <Database className="h-6 w-6 text-destructive" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Database Viewer</h1>
        </div>
        <Alert variant="destructive" className="max-w-2xl">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="ml-2">{error}</AlertDescription>
        </Alert>
        <Button onClick={loadTables} variant="outline" className="w-fit">
          <Activity className="h-4 w-4 mr-2" />
          Retry Connection
        </Button>
      </div>
    )
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-6 p-6">
      <div className="border-b pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Database className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Database Viewer</h1>
              <p className="text-muted-foreground mt-1">
                Cloudflare D1 • <span className="font-mono text-sm bg-muted px-2 py-0.5 rounded">alleato</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Activity className="h-4 w-4" />
            <span>{tables.length} tables</span>
          </div>
        </div>
      </div>

      {tables.length === 0 ? (
        <Alert>
          <AlertDescription>No tables found in the database.</AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tables.map((table) => {
            const { columnCount, hasIndexes } = getTableInfo(table.sql)
            return (
              <Card 
                key={table.name} 
                className="group cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-200 overflow-hidden border-muted"
                onClick={() => navigateToTable(table.name)}
              >
                <div className="h-2 bg-gradient-to-r from-primary/20 to-primary/10 group-hover:from-primary/30 group-hover:to-primary/20 transition-colors" />
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-lg">
                      <div className="p-1.5 bg-muted rounded group-hover:bg-primary/10 transition-colors">
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
          })}
        </div>
      )}
    </div>
  )
}