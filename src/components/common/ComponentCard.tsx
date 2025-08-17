import React from 'react';

interface ComponentCardProps {
  title?: string;
  desc?: string;
  children: React.ReactNode;
}

export default function ComponentCard({ title, desc, children }: ComponentCardProps) {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      {(title || desc) && (
        <div className="flex flex-col space-y-1.5 p-6">
          {title && <h3 className="text-2xl font-semibold leading-none tracking-tight">{title}</h3>}
          {desc && <p className="text-sm text-muted-foreground">{desc}</p>}
        </div>
      )}
      <div className="p-6 pt-0">{children}</div>
    </div>
  );
}