// @ts-nocheck
import {
  IconBarrierBlock,
  IconBrowserCheck,
  IconBug,
  IconChecklist,
  IconError404,
  IconHelp,
  IconLayoutDashboard,
  IconLock,
  IconLockAccess,
  IconMessages,
  IconNotification,
  IconPackages,
  IconPalette,
  IconServerOff,
  IconSettings,
  IconTool,
  IconUserCog,
  IconUserOff,
  IconUsers,
  IconChartBar,
  IconDatabase,
  IconShield,
  IconReportAnalytics,
  IconCoin,
  IconBook,
  IconSchool,
  IconActivity,
  IconCertificate,
} from '@tabler/icons-react'
import { AudioWaveform, Command, GalleryVerticalEnd, Stethoscope, Sparkles, BookOpen, Search, StickyNote, CheckSquare, BarChart3, FileText, TrendingUp } from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  teams: [],
  navGroups: [
    {
      title: 'Core',
      items: [
        {
          title: 'Dashboard',
          url: '/student/dashboard',
          icon: IconLayoutDashboard,
        },
        {
          title: 'Practice',
          url: '/student/practice',
          icon: IconActivity,
        },
        {
          title: 'Analytics',
          url: '/student/analytics',
          icon: BarChart3,
        },

      ],
    },
    {
      title: 'Organization',
      items: [
        {
          title: 'Workspace',
          url: '/student/workspace',
          icon: IconDatabase,
        },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          title: 'Subscriptions',
          url: '/student/subscriptions',
          icon: IconCoin,
        },
        {
          title: 'Settings',
          url: '/student/settings',
          icon: IconSettings,
        },
      ],
    },
  ],
}
