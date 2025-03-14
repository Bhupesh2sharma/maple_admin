"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "react-toastify"
import {
  Moon,
  Sun,
  LogOut,
  Palette,
} from "lucide-react"

interface Settings {
  theme: 'light' | 'dark' | 'system';
  adminEmail: string;
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  language: string;
  autoLogout: number; // in minutes
  securitySettings: {
    twoFactorAuth: boolean;
    sessionTimeout: boolean;
  };
}

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<Settings>({
    theme: 'system',
    adminEmail: '',
    notificationsEnabled: true,
    emailNotifications: true,
    language: 'en',
    autoLogout: 30,
    securitySettings: {
      twoFactorAuth: false,
      sessionTimeout: true,
    }
  });

  // Theme handling
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    if (settings.theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(settings.theme);
    }
  }, [settings.theme]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    toast.success('Logged out successfully');
    router.push('/');
  };

  const handleSaveSettings = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      // Save settings to backend/localStorage
      localStorage.setItem('adminSettings', JSON.stringify(settings));
      toast.success('Settings saved successfully');
    } catch (err) {
      console.error("Error updating settings:", err);
      toast.error('Failed to update settings');
    }
  };

  return (
    <div className="space-y-4 p-2 sm:p-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <h1 className="text-xl sm:text-3xl font-bold mt-14">Settings</h1>
        <Button 
          variant="destructive" 
          onClick={handleLogout}
          className="w-full sm:w-auto flex items-center justify-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="w-full flex overflow-x-auto">
          <TabsTrigger value="general" className="flex-1">General</TabsTrigger>
          <TabsTrigger value="notifications" className="flex-1">Notifications</TabsTrigger>
          <TabsTrigger value="security" className="flex-1">Security</TabsTrigger>
          <TabsTrigger value="appearance" className="flex-1">Appearance</TabsTrigger>
        </TabsList>

        {/* General Settings Tab */}
        <TabsContent value="general">
          <Card className="border-0 shadow-sm">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">General Settings</CardTitle>
              <CardDescription className="text-sm">
                Manage your basic admin settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="adminEmail" className="text-sm font-medium">Admin Email</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  value={settings.adminEmail}
                  onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
                  className="w-full"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="language" className="text-sm font-medium">Language</Label>
                <select
                  id="language"
                  className="w-full p-2 border rounded-md text-sm"
                  value={settings.language}
                  onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="autoLogout" className="text-sm font-medium">Auto Logout (minutes)</Label>
                <Label htmlFor="autoLogout">Auto Logout (minutes)</Label>
                <Input
                  id="autoLogout"
                  type="number"
                  min="5"
                  max="120"
                  value={settings.autoLogout}
                  onChange={(e) => setSettings({ ...settings, autoLogout: parseInt(e.target.value) })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure how you want to receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => 
                    setSettings({ ...settings, emailNotifications: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Browser Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications in browser
                  </p>
                </div>
                <Switch
                  checked={settings.notificationsEnabled}
                  onCheckedChange={(checked) => 
                    setSettings({ ...settings, notificationsEnabled: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your security preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security
                  </p>
                </div>
                <Switch
                  checked={settings.securitySettings.twoFactorAuth}
                  onCheckedChange={(checked) => 
                    setSettings({
                      ...settings,
                      securitySettings: {
                        ...settings.securitySettings,
                        twoFactorAuth: checked
                      }
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Session Timeout</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically logout after inactivity
                  </p>
                </div>
                <Switch
                  checked={settings.securitySettings.sessionTimeout}
                  onCheckedChange={(checked) => 
                    setSettings({
                      ...settings,
                      securitySettings: {
                        ...settings.securitySettings,
                        sessionTimeout: checked
                      }
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>
                Customize how the admin panel looks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Theme</Label>
                <div className="flex space-x-4">
                  <Button
                    variant={settings.theme === 'light' ? 'default' : 'outline'}
                    onClick={() => setSettings({ ...settings, theme: 'light' })}
                    className="flex items-center gap-2"
                  >
                    <Sun className="h-4 w-4" />
                    Light
                  </Button>
                  <Button
                    variant={settings.theme === 'dark' ? 'default' : 'outline'}
                    onClick={() => setSettings({ ...settings, theme: 'dark' })}
                    className="flex items-center gap-2"
                  >
                    <Moon className="h-4 w-4" />
                    Dark
                  </Button>
                  <Button
                    variant={settings.theme === 'system' ? 'default' : 'outline'}
                    onClick={() => setSettings({ ...settings, theme: 'system' })}
                    className="flex items-center gap-2"
                  >
                    <Palette className="h-4 w-4" />
                    System
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} className="w-full md:w-auto">
          Save All Settings
        </Button>
      </div>
    </div>
  );
}

