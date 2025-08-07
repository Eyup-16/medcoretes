// @ts-nocheck
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar'
import { NavGroup } from '@/components/student/layout/nav-group'
import { NavUser } from '@/components/student/layout/nav-user'
import { sidebarData } from './data/sidebar-data'
import { Stethoscope } from 'lucide-react'

function AppSidebarHeader() {
  const { state } = useSidebar()

  return (
    <div className='flex h-full items-center gap-2'>
      {state === 'expanded' && (
        <span className='whitespace-nowrap text-lg font-semibold'>
          MedCortex
        </span>
      )}
    </div>
  )
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible='icon' variant='floating' {...props}>
      <SidebarHeader className='h-auto p-3'>
        <AppSidebarHeader />
      </SidebarHeader>
      <SidebarContent>
        {sidebarData.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
