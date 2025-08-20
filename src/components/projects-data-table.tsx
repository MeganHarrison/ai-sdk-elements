"use client"

import * as React from "react"
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconCircleCheckFilled,
  IconDotsVertical,
  IconGripVertical,
  IconLayoutColumns,
  IconLoader,
  IconPlus,
  IconCurrencyDollar,
  IconCalendar,
  IconUsers,
  IconBriefcase,
  IconMapPin,
} from "@tabler/icons-react"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import { format } from "date-fns"
import { toast } from "sonner"

import { useIsMobile } from "@/hooks/use-mobile"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { ProjectChat } from "@/components/chat/project-chat"
import { ScrollArea } from "@/components/ui/scroll-area"

export interface Project {
  id: string | number
  name?: string
  title?: string
  description?: string
  status?: string
  priority?: string
  start_date?: string
  due_date?: string
  "start date"?: string
  "est completion"?: string
  "est revenue"?: number
  "est profit"?: number
  "job number"?: string
  phase?: string
  state?: string
  address?: string
  client_id?: number
  created_at: string
  updated_at?: string
  metadata?: {
    tags?: string[]
    budget?: number
    team_members?: any[]
    progress?: number
    client_name?: string
  }
}

// Create a separate component for the drag handle
function DragHandle({ id }: { id: string | number }) {
  const { attributes, listeners } = useSortable({
    id,
  })

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="text-muted-foreground size-7 hover:bg-transparent"
    >
      <IconGripVertical className="text-muted-foreground size-3" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  )
}

function ProjectDetailViewer({ project }: { project: Project }) {
  const isMobile = useIsMobile()
  const [activeTab, setActiveTab] = React.useState("details")

  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button variant="link" className="text-foreground w-fit px-0 text-left font-medium">
          {project.name || project.title || `Project ${project.id}`}
        </Button>
      </DrawerTrigger>
      <DrawerContent className={isMobile ? "" : "w-[600px] h-full fixed right-0 top-0"}>
        <DrawerHeader className="gap-1">
          <DrawerTitle>{project.name || project.title || `Project ${project.id}`}</DrawerTitle>
          <DrawerDescription>
            {project.description || "View project details and chat with AI assistant"}
          </DrawerDescription>
        </DrawerHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="mx-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="chat">AI Chat</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="flex-1">
            <ScrollArea className="h-[calc(100vh-200px)] px-4">
              <div className="space-y-6 pb-6">
                {/* Project Overview */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Project Overview</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant="outline" className="ml-2">
                        {project.status || project.phase || "Active"}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Priority:</span>
                      <Badge variant="outline" className="ml-2">
                        {project.priority || "Medium"}
                      </Badge>
                    </div>
                    {project["job number"] && (
                      <div>
                        <span className="text-muted-foreground">Job Number:</span>
                        <span className="ml-2 font-mono">{project["job number"]}</span>
                      </div>
                    )}
                    {project.client_id && (
                      <div>
                        <span className="text-muted-foreground">Client ID:</span>
                        <span className="ml-2">{project.client_id}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Timeline */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Timeline</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {(project.start_date || project["start date"]) && (
                      <div>
                        <span className="text-muted-foreground">Start Date:</span>
                        <span className="ml-2">
                          {format(new Date(project.start_date || project["start date"]!), "MMM d, yyyy")}
                        </span>
                      </div>
                    )}
                    {(project.due_date || project["est completion"]) && (
                      <div>
                        <span className="text-muted-foreground">Est. Completion:</span>
                        <span className="ml-2">
                          {format(new Date(project.due_date || project["est completion"]!), "MMM d, yyyy")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Financials */}
                {(project["est revenue"] || project["est profit"]) && (
                  <div className="space-y-4">
                    <h3 className="font-semibold">Financials</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {project["est revenue"] && (
                        <div>
                          <span className="text-muted-foreground">Est. Revenue:</span>
                          <span className="ml-2 font-semibold">
                            ${project["est revenue"].toLocaleString()}
                          </span>
                        </div>
                      )}
                      {project["est profit"] && (
                        <div>
                          <span className="text-muted-foreground">Est. Profit:</span>
                          <span className="ml-2 font-semibold">
                            ${project["est profit"].toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Location */}
                {(project.address || project.state) && (
                  <div className="space-y-4">
                    <h3 className="font-semibold">Location</h3>
                    <div className="space-y-2 text-sm">
                      {project.address && (
                        <div>
                          <span className="text-muted-foreground">Address:</span>
                          <span className="ml-2">{project.address}</span>
                        </div>
                      )}
                      {project.state && (
                        <div>
                          <span className="text-muted-foreground">State:</span>
                          <span className="ml-2">{project.state}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Description */}
                {project.description && (
                  <div className="space-y-4">
                    <h3 className="font-semibold">Description</h3>
                    <p className="text-sm text-muted-foreground">{project.description}</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="chat" className="flex-1 px-4">
            <div className="h-[calc(100vh-200px)]">
              <ProjectChat 
                projectId={String(project.id)} 
                projectTitle={project.name || project.title}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="insights" className="flex-1">
            <ScrollArea className="h-[calc(100vh-200px)] px-4">
              <div className="space-y-4 pb-6">
                <div className="rounded-lg border p-4">
                  <h4 className="font-medium mb-2">Project Health</h4>
                  <p className="text-sm text-muted-foreground">
                    AI-generated insights will appear here based on meeting transcripts and project data.
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <h4 className="font-medium mb-2">Recent Activity</h4>
                  <p className="text-sm text-muted-foreground">
                    No recent meetings or updates found for this project.
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <h4 className="font-medium mb-2">Action Items</h4>
                  <p className="text-sm text-muted-foreground">
                    Action items from meetings will be displayed here.
                  </p>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
        
        <DrawerFooter>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1">
              View Full Details
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" className="flex-1">Close</Button>
            </DrawerClose>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

// Helper function to save changes via worker
async function saveProjectField(projectId: string | number, field: string, value: any) {
  const WORKER_URL = process.env.NEXT_PUBLIC_AI_WORKER_URL || 'https://ai-agent-supabase-worker.megan-d14.workers.dev'
  
  const response = await fetch(`${WORKER_URL}/projects/${projectId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ [field]: value })
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.details || 'Failed to update project')
  }
  
  return response.json()
}

// Editable cell component
function EditableCell({ 
  value: initialValue, 
  row, 
  column,
  type = "text"
}: { 
  value: any
  row: any
  column: string
  type?: "text" | "number" | "date"
}) {
  const [value, setValue] = React.useState(initialValue)
  const [isEditing, setIsEditing] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  const handleSave = async () => {
    setIsEditing(false)
    if (value !== initialValue) {
      const projectName = row.original.name || row.original.title || `Project ${row.original.id}`
      toast.promise(
        saveProjectField(row.original.id, column, value),
        {
          loading: `Saving ${projectName}...`,
          success: "Changes saved",
          error: "Failed to save changes"
        }
      )
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      setValue(initialValue)
      setIsEditing(false)
    }
  }

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        type={type}
        value={value || ''}
        onChange={(e) => setValue(type === 'number' ? Number(e.target.value) : e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className="h-8 w-full"
        autoFocus
      />
    )
  }

  const displayValue = () => {
    if (!value) return '-'
    if (type === 'date') {
      try {
        return format(new Date(value), 'MMM d, yyyy')
      } catch {
        return value
      }
    }
    if (type === 'number' && value) {
      return `$${(value / 1000).toFixed(0)}k`
    }
    return value
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className="cursor-pointer hover:bg-muted/50 px-2 py-1 rounded"
    >
      {displayValue()}
    </div>
  )
}

const columns: ColumnDef<Project>[] = [
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.id} />,
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Project Name",
    cell: ({ row }) => {
      return <ProjectDetailViewer project={row.original} />
    },
    enableHiding: false,
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <div className="max-w-[200px]">
        <EditableCell 
          value={row.original.description} 
          row={row} 
          column="description"
        />
      </div>
    ),
  },
  {
    accessorKey: "client_id",
    header: "Client",
    cell: ({ row }) => {
      const clientName = row.original.metadata?.client_name || 
                        (row.original.client_id ? `Client ${row.original.client_id}` : null)
      return (
        <EditableCell 
          value={clientName} 
          row={row} 
          column="client_id"
        />
      )
    },
  },
  {
    accessorKey: "phase",
    header: "Phase",
    cell: ({ row }) => {
      const phase = row.original.phase || row.original.status || "Active"
      return (
        <Select
          defaultValue={phase}
          onValueChange={async (value) => {
            const projectName = row.original.name || `Project ${row.original.id}`
            toast.promise(
              saveProjectField(row.original.id, 'phase', value),
              {
                loading: `Updating ${projectName}...`,
                success: "Phase updated",
                error: "Failed to update phase"
              }
            )
          }}
        >
          <SelectTrigger className="h-8 w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Planning">Planning</SelectItem>
            <SelectItem value="Design">Design</SelectItem>
            <SelectItem value="Development">Development</SelectItem>
            <SelectItem value="Testing">Testing</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="On Hold">On Hold</SelectItem>
          </SelectContent>
        </Select>
      )
    },
  },
  {
    accessorKey: "est revenue",
    header: () => <div className="text-right">Est. Revenue</div>,
    cell: ({ row }) => {
      const revenue = row.original["est revenue"]
      return (
        <div className="text-right">
          <EditableCell 
            value={revenue} 
            row={row} 
            column="est revenue"
            type="number"
          />
        </div>
      )
    },
  },
  {
    accessorKey: "est profit",
    header: () => <div className="text-right">Est. Profit</div>,
    cell: ({ row }) => {
      const profit = row.original["est profit"]
      return (
        <div className="text-right">
          <EditableCell 
            value={profit} 
            row={row} 
            column="est profit"
            type="number"
          />
        </div>
      )
    },
  },
  {
    accessorKey: "start date",
    header: "Start Date",
    cell: ({ row }) => {
      const date = row.original["start date"] || row.original.start_date
      return (
        <EditableCell 
          value={date} 
          row={row} 
          column="start date"
          type="date"
        />
      )
    },
  },
  {
    accessorKey: "est completion",
    header: "Est. Completion",
    cell: ({ row }) => {
      const date = row.original["est completion"] || row.original.due_date
      return (
        <EditableCell 
          value={date} 
          row={row} 
          column="est completion"
          type="date"
        />
      )
    },
  },
  {
    accessorKey: "state",
    header: "State",
    cell: ({ row }) => (
      <EditableCell 
        value={row.original.state} 
        row={row} 
        column="state"
      />
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
            size="icon"
          >
            <IconDotsVertical />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuItem>Duplicate</DropdownMenuItem>
          <DropdownMenuItem>Archive</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]

function DraggableRow({ row }: { row: Row<Project> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  })

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  )
}

export function ProjectsDataTable({
  data: initialData,
  isLoading,
  onRefresh,
}: {
  data: Project[]
  isLoading?: boolean
  onRefresh?: () => void
}) {
  const [data, setData] = React.useState(() => initialData)
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 25,
  })
  const sortableId = React.useId()
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  )

  React.useEffect(() => {
    setData(initialData)
  }, [initialData])

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map(({ id }) => id) || [],
    [data]
  )

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id)
        const newIndex = dataIds.indexOf(over.id)
        return arrayMove(data, oldIndex, newIndex)
      })
    }
  }

  return (
    <Tabs defaultValue="all" className="w-full flex-col justify-start gap-6">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <TabsList>
          <TabsTrigger value="all">All Projects</TabsTrigger>
          <TabsTrigger value="active">
            Active <Badge variant="secondary" className="ml-2">{data.filter(p => p.phase === "Active" || p.status === "active").length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed <Badge variant="secondary" className="ml-2">{data.filter(p => p.phase === "Completed" || p.status === "completed").length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="on-hold">On Hold</TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search projects..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <IconLayoutColumns />
                <span className="hidden lg:inline">Customize Columns</span>
                <span className="lg:hidden">Columns</span>
                <IconChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide()
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
              {isLoading ? <IconLoader className="animate-spin" /> : "Refresh"}
            </Button>
          )}
          <Button variant="outline" size="sm">
            <IconPlus />
            <span className="hidden lg:inline">New Project</span>
          </Button>
        </div>
      </div>
      
      <TabsContent value="all" className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
        <div className="overflow-hidden rounded-lg border">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          >
            <Table>
              <TableHeader className="bg-muted sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} colSpan={header.colSpan}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      <IconLoader className="animate-spin mx-auto" />
                      Loading projects...
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows?.length ? (
                  <SortableContext
                    items={dataIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No projects found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>
        
        <div className="flex items-center justify-between px-4">
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Rows per page
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value))
                }}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 25, 30, 40, 50, 100].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <IconChevronsLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <IconChevronLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <IconChevronRight />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <IconChevronsRight />
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="active" className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
        <p className="text-muted-foreground text-center py-8">Filtered view for active projects</p>
      </TabsContent>
      
      <TabsContent value="completed" className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
        <p className="text-muted-foreground text-center py-8">Filtered view for completed projects</p>
      </TabsContent>
      
      <TabsContent value="on-hold" className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
        <p className="text-muted-foreground text-center py-8">Filtered view for on-hold projects</p>
      </TabsContent>
    </Tabs>
  )
}