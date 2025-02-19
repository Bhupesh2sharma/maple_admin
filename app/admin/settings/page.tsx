"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export default function SettingsPage() {
  const [sendBookingConfirmations, setSendBookingConfirmations] = useState(true)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    // Handle form submission here
    // You would typically send this data to your API
    alert("Settings updated!")
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="adminEmail">Admin Email</Label>
          <Input id="adminEmail" type="email" required />
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="bookingConfirmations"
            checked={sendBookingConfirmations}
            onCheckedChange={setSendBookingConfirmations}
          />
          <Label htmlFor="bookingConfirmations">Send booking confirmation emails</Label>
        </div>
        <Button type="submit">Save Settings</Button>
      </form>
    </div>
  )
}

