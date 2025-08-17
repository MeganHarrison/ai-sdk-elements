'use client';

import * as React from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { cn } from "@/lib/utils";

interface VirtualTableProps<T> {
  data: T[];
  columns: {
    key: string;
    header: React.ReactNode;
    cell: (item: T) => React.ReactNode;
    className?: string;
  }[];
  estimateSize?: number;
  overscan?: number;
  className?: string;
  onRowClick?: (item: T) => void;
}

export function VirtualTable<T>({
  data,
  columns,
  estimateSize = 50,
  overscan = 10,
  className,
  onRowClick,
}: VirtualTableProps<T>) {
  const parentRef = React.useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan,
  });

  return (
    <div className={cn("relative overflow-auto", className)} ref={parentRef}>
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="flex">
          {columns.map((column) => (
            <div
              key={column.key}
              className={cn(
                "flex-1 px-4 py-3 text-left text-sm font-medium text-muted-foreground",
                column.className
              )}
            >
              {column.header}
            </div>
          ))}
        </div>
      </div>

      {/* Virtual Rows */}
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const item = data[virtualRow.index];
          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
              className={cn(
                "flex border-b hover:bg-muted/30 transition-colors",
                virtualRow.index % 2 === 0 ? 'bg-background' : 'bg-muted/10',
                onRowClick && "cursor-pointer"
              )}
              onClick={() => onRowClick?.(item)}
            >
              {columns.map((column) => (
                <div
                  key={column.key}
                  className={cn(
                    "flex-1 px-4 py-3 text-sm",
                    column.className
                  )}
                >
                  {column.cell(item)}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}