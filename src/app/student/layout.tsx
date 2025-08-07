// @ts-nocheck
'use client';

import { SidebarProvider } from '@/components/ui/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'
import { StudentSearchProvider } from '@/context/student-search-context'
import { AppSidebar } from '@/components/student/layout/app-sidebar'
import { Header } from '@/components/student/layout/header'
import { Main } from '@/components/student/layout/main'
import { StudentSearch } from '@/components/student/layout/search'
import { ThemeToggle } from '@/components/theme-toggle'
import { StudentProfileDropdown } from '@/components/student/layout/profile-dropdown'

interface StudentLayoutProps {
  children: React.ReactNode
}

export default function StudentLayout({ children }: StudentLayoutProps) {
  return (
    <StudentSearchProvider>
      <TooltipProvider>
        <SidebarProvider defaultOpen={true}>
          <div className='flex h-screen w-full bg-background'>
            <AppSidebar />
            <div className='flex flex-1 flex-col min-w-0'>
              <Header>
                <div className='ml-auto flex items-center space-x-4'>
                  <StudentSearch />
                  <ThemeToggle />
                  <StudentProfileDropdown />
                </div>
              </Header>
              <Main className='flex-1'>{children}</Main>
            </div>
          </div>
        </SidebarProvider>
      </TooltipProvider>
    </StudentSearchProvider>
  )
}