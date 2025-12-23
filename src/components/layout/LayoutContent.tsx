'use client'

import { usePathname } from 'next/navigation'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { SidebarNav } from '@/components/layout/sidebar/SidebarNav'
import { Suspense } from 'react'

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/login'

  if (isLoginPage) {
    return (
      <main className="w-full min-h-screen">
        <Suspense fallback={<div className="animate-spin text-white">Loading...</div>}>
          {children}
        </Suspense>
      </main>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex max-h-full max-w-full w-full">
        <aside>
          <SidebarNav />
        </aside>
        <main className="w-full flex flex-1 mx-2 mt-24 sm:mt-20 md:mt-16 p-3 md:p-1 transition-all duration-300 ease-in-out md:ml-60 group-data-[state=collapsed]/sidebar-wrapper:md:ml-12"> 
        {/* md:ml-[15rem] group-data-[state=collapsed]/sidebar-wrapper:md:ml-[3rem] */}
          <SidebarTrigger />
          <section className="w-full flex flex-col mx-auto min-h-[95vh] overflow-y-auto px-2">
            <Suspense fallback={<div className="animate-spin text-white">Loading...</div>}>
              {children}
            </Suspense>
          </section>
        </main>
      </div>
    </SidebarProvider>
  )
}
