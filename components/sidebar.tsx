import Link from "next/link"
import { BarChart, BookOpen, Mail, Package, Settings, Users } from "lucide-react"

export function Sidebar() {
  return (
    <aside className="w-64 bg-white shadow-md">
      <div className="p-6">
        <h1 className="text-2xl font-bold">Maple Tours Admin</h1>
      </div>
      <nav className="mt-6">
        <Link href="/admin" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100">
          <BarChart className="mr-3" />
          Dashboard
        </Link>
        <Link href="/admin/packages" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100">
          <Package className="mr-3" />
          Packages
        </Link>
        <Link href="/admin/bookings" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100">
          <BookOpen className="mr-3" />
          Bookings
        </Link>
        <Link href="/admin/contact-forms" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100">
          <Mail className="mr-3" />
          Contact Forms
        </Link>
        <Link href="/admin/users" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100">
          <Users className="mr-3" />
          Users
        </Link>
        <Link href="/admin/settings" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100">
          <Settings className="mr-3" />
          Settings
        </Link>
      </nav>
    </aside>
  )
}

