import Link from "next/link"
import { 
  BarChart, 
  BookOpen, 
  Mail, 
  Package, 
  Settings, 
  Users,
  MessageSquareQuote
} from "lucide-react"

export function Sidebar() {
  return (
    <aside className="w-64 bg-white dark:bg-gray-800 shadow-md">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Maple Tours Admin</h1>
      </div>
      <nav className="mt-6">
        <Link 
          href="/admin" 
          className="flex items-center px-6 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <BarChart className="mr-3" />
          Dashboard
        </Link>
        <Link 
          href="/admin/packages" 
          className="flex items-center px-6 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Package className="mr-3" />
          Packages
        </Link>
        <Link 
          href="/admin/bookings" 
          className="flex items-center px-6 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <BookOpen className="mr-3" />
          Bookings
        </Link>
        <Link 
          href="/admin/contact-forms" 
          className="flex items-center px-6 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Mail className="mr-3" />
          Contact Forms
        </Link>
        <Link 
          href="/admin/testimonials" 
          className="flex items-center px-6 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <MessageSquareQuote className="mr-3" />
          Testimonials
        </Link>
        <Link 
          href="/admin/users" 
          className="flex items-center px-6 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Users className="mr-3" />
          Users
        </Link>
        <Link 
          href="/admin/settings" 
          className="flex items-center px-6 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Settings className="mr-3" />
          Settings
        </Link>
      </nav>
    </aside>
  )
}