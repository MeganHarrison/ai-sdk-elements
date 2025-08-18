import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider, } from "@/components/ui/sidebar"
import { QueryProvider } from "@/lib/providers/query-provider"

export default function PageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
        <QueryProvider>
          <SidebarProvider
            style={
                {
                    "--sidebar-width": "calc(var(--spacing) * 72)",
                    "--header-height": "calc(var(--spacing) * 12)",
                  } as React.CSSProperties
                }
              >
              <AppSidebar variant="inset" />
                <SidebarInset>
                  <SiteHeader />
                  <div className="flex flex-1 flex-col pt-8 px-6">
                    {children}
                  </div>
                </SidebarInset>
            </SidebarProvider>
        </QueryProvider>
  );
}
