// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  User, 
  Settings, 
  CreditCard, 
  Bell, 
  LogOut, 
  GraduationCap,
  University,
  BookOpen
} from 'lucide-react'
import { toast } from 'sonner'
import { SettingsService } from '@/lib/api-services'
import { apiClient } from '@/lib/api-client'
import type { UserProfile } from '@/types/api'

export function StudentProfileDropdown() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Load user profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true)
        const response = await SettingsService.getUserProfile()
        
        if (response.success && response.data) {
          setProfile(response.data)
        } else {
          console.error('Failed to load profile:', response.error)
        }
      } catch (error) {
        console.error('Error loading profile:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [])

  // Handle logout
  const handleLogout = async () => {
    try {
      // Clear tokens and redirect
      apiClient.clearTokens()
      toast.success('Logged out successfully')
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Error logging out')
    }
  }

  // Get user initials for avatar fallback
  const getUserInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Get subscription status
  const getSubscriptionStatus = () => {
    if (!profile?.subscriptions || profile.subscriptions.length === 0) {
      return { text: 'No Active Plan', variant: 'secondary' as const }
    }
    
    const activeSubscriptions = profile.subscriptions.filter(sub => sub.status === 'ACTIVE')
    if (activeSubscriptions.length > 0) {
      return { text: 'Active Plan', variant: 'default' as const }
    }
    
    return { text: 'Inactive Plan', variant: 'destructive' as const }
  }

  if (isLoading) {
    return (
      <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
        <Skeleton className="h-8 w-8 rounded-full" />
      </Button>
    )
  }

  if (!profile) {
    return (
      <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
        <Avatar className='h-8 w-8'>
          <AvatarFallback>?</AvatarFallback>
        </Avatar>
      </Button>
    )
  }

  const subscriptionStatus = getSubscriptionStatus()

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
          <Avatar className='h-8 w-8'>
            <AvatarImage src='/avatar-placeholder.png' alt={profile.fullName} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getUserInitials(profile.fullName)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-72' align='end' forceMount>
        <DropdownMenuLabel className='font-normal'>
          <div className='flex flex-col space-y-2'>
            <div className="flex items-center justify-between">
              <p className='text-sm leading-none font-medium'>{profile.fullName}</p>
              {profile.emailVerified && (
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                  Verified
                </Badge>
              )}
            </div>
            <p className='text-muted-foreground text-xs leading-none'>
              {profile.email}
            </p>
            <div className="flex items-center justify-between pt-1">
              <Badge variant={subscriptionStatus.variant} className="text-xs">
                {subscriptionStatus.text}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {profile.role}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {/* Academic Info */}
        <div className="px-2 py-1.5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <GraduationCap className="h-3 w-3" />
            <span>Academic Information</span>
          </div>
          <div className="space-y-1 text-xs pl-5">
            <div className="flex justify-between">
              <span>University:</span>
              <span className="font-medium">{profile.university?.name || 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span>Specialty:</span>
              <span className="font-medium">{profile.specialty?.name || 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span>Year:</span>
              <span className="font-medium">{profile.currentYear || 'Not set'}</span>
            </div>
          </div>
        </div>

        <DropdownMenuSeparator />
        
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href='/student/settings' className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              Profile Settings
              <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href='/student/subscriptions' className="cursor-pointer">
              <CreditCard className="mr-2 h-4 w-4" />
              Subscriptions
              <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href='/student/settings' className="cursor-pointer">
              <Bell className="mr-2 h-4 w-4" />
              Notifications
              <DropdownMenuShortcut>⌘N</DropdownMenuShortcut>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href='/student/dashboard' className="cursor-pointer">
              <BookOpen className="mr-2 h-4 w-4" />
              Dashboard
              <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          Log out
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
