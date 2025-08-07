// @ts-nocheck
import { Database } from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'Admin User',
    email: 'admin@medcortex.com',
    avatar: '/images/avatars/default.jpg',
  },
  teams: [
    {
      name: 'Question Import',
      logo: Database,
      plan: 'Content Management',
    },
  ],
  navGroups: [
    {
      title: 'Content Management',
      items: [
        {
          title: 'Question Import',
          url: '/admin/content',
          icon: Database,
        },
      ],
    },
  ],
}
