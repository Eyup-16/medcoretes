// @ts-nocheck
'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { User, Shield, Bell, Palette, Monitor } from 'lucide-react'
import ProfileForm from '@/features/admin/settings/profile/profile-form'
// import { AccountForm } from '@/features/student/settings/account/account-form'
// import { AppearanceForm } from '@/features/admin/settings/appearance/appearance-form'
// import { NotificationsForm } from '@/features/admin/settings/notifications/notifications-form'

export default function StudentSettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')

  return (
    <div className="flex-1 p-8 pt-6 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>
      </div>
      
      <Separator />

      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="-mx-4 lg:w-1/5">
          <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
            <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical" className="w-full">
              <TabsList className="grid w-full h-auto grid-cols-1 bg-transparent lg:grid-cols-1">
                <TabsTrigger 
                  value="profile" 
                  className="w-full justify-start gap-2 data-[state=active]:bg-muted"
                >
                  <User className="w-4 h-4" />
                  Profile
                </TabsTrigger>
                <TabsTrigger 
                  value="account" 
                  className="w-full justify-start gap-2 data-[state=active]:bg-muted"
                >
                  <Shield className="w-4 h-4" />
                  Account
                </TabsTrigger>
                <TabsTrigger 
                  value="appearance" 
                  className="w-full justify-start gap-2 data-[state=active]:bg-muted"
                >
                  <Palette className="w-4 h-4" />
                  Appearance
                </TabsTrigger>
                <TabsTrigger 
                  value="notifications" 
                  className="w-full justify-start gap-2 data-[state=active]:bg-muted"
                >
                  <Bell className="w-4 h-4" />
                  Notifications
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </nav>
        </aside>
        
        <div className="flex-1 lg:max-w-2xl">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsContent value="profile" className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Profile</h3>
                <p className="text-sm text-muted-foreground">
                  Update your profile information and academic details.
                </p>
              </div>
              <Separator />
              <ProfileForm />
            </TabsContent>

            <TabsContent value="account" className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Account</h3>
                <p className="text-sm text-muted-foreground">
                  View your account information and security status.
                </p>
              </div>
              <Separator />
              <AccountForm />
            </TabsContent>

            <TabsContent value="appearance" className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Appearance</h3>
                <p className="text-sm text-muted-foreground">
                  Customize the appearance of the application.
                </p>
              </div>
              <Separator />
              <AppearanceForm />
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Notifications</h3>
                <p className="text-sm text-muted-foreground">
                  Configure how you receive notifications.
                </p>
              </div>
              <Separator />
              <NotificationsForm />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
