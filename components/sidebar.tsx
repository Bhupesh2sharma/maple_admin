"use client";

import Link from "next/link"
import { 
  BarChart, 
  BookOpen, 
  Mail, 
  Package, 
  Settings, 
  Users,
  MessageSquareQuote,
  Menu,
  X,
  Calendar // Add Calendar icon
} from "lucide-react"
import { useState, useEffect } from "react";

interface SidebarProps {
  isMobile: boolean;
}

export function Sidebar({ isMobile }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(!isMobile);

  // Handle window resize
  useEffect(() => {
    setIsOpen(!isMobile);
  }, [isMobile]);

  return (
    <>
      {/* Mobile Menu Button - Fixed Position */}
      <button
        className="fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-screen z-40 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isMobile ? 'w-64' : 'w-64'}
        bg-white dark:bg-gray-800 shadow-md
        md:relative md:translate-x-0
      `}>
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Maple Tours Admin</h1>
        </div>
        
        <nav className="mt-6">
          <Link 
            href="/admin" 
            className="flex items-center px-6 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => isMobile && setIsOpen(false)}
          >
            <BarChart className="mr-3" />
            Dashboard
          </Link>
          <Link 
            href="/admin/packages" 
            className="flex items-center px-6 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => isMobile && setIsOpen(false)}
          >
            <Package className="mr-3" />
            Packages
          </Link>
          <Link 
            href="/admin/bookings" 
            className="flex items-center px-6 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => isMobile && setIsOpen(false)}
          >
            <BookOpen className="mr-3" />
            Bookings
          </Link>

          {/* Add Calendar Link */}
          <a
            href="https://v0-modern-admin-calendar-design-ngzxeh.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center px-6 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => isMobile && setIsOpen(false)}
          >
            <Calendar className="mr-3" />
            Calendar
          </a>

          <Link 
            href="/admin/contact-forms" 
            className="flex items-center px-6 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => isMobile && setIsOpen(false)}
          >
            <Mail className="mr-3" />
            Contact Forms
          </Link>
          <Link 
            href="/admin/testimonials" 
            className="flex items-center px-6 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => isMobile && setIsOpen(false)}
          >
            <MessageSquareQuote className="mr-3" />
            Testimonials
          </Link>
          <Link 
            href="/admin/users" 
            className="flex items-center px-6 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => isMobile && setIsOpen(false)}
          >
            <Users className="mr-3" />
            Users
          </Link>
          <Link 
            href="/admin/settings" 
            className="flex items-center px-6 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => isMobile && setIsOpen(false)}
          >
            <Settings className="mr-3" />
            Settings
          </Link>
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
