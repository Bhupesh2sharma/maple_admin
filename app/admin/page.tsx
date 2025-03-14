"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  Users, 
  MessageSquareQuote,
  Mail,
  Download,
  Calendar,
  Clock,
  IndianRupee,
} from "lucide-react";
import { toast } from "react-toastify";
import { 
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer
} from 'recharts';
import * as XLSX from 'xlsx';
import { Badge } from "@/components/ui/badge";

interface Package {
  _id: string;
  title: string;
  destination: string;
  active: boolean;
}

interface Contact {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: 'new' | 'read' | 'responded';
}

interface Booking {
  _id: string;
  package: {
    _id: string;
    title: string;
  };
  startDate: string;
  totalAmount: number;
  bookingStatus: 'confirmed' | 'cancelled' | 'pending';
  paymentStatus: 'pending' | 'completed' | 'failed';
}

interface DashboardStats {
  activePackages: number;
  totalUsers: number;
  testimonialCount: number;
  contactFormCount: number;
  recentPackages: Package[];
  recentContacts: Contact[];
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  recentBookings: Booking[];
  totalRevenue: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    activePackages: 0,
    totalUsers: 0,
    testimonialCount: 0,
    contactFormCount: 0,
    recentPackages: [],
    recentContacts: [],
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    cancelledBookings: 0,
    recentBookings: [],
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      
      // Fetch packages
      const packagesResponse = await fetch("https://maple-server-e7ye.onrender.com/api/packages", {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const packagesData = await packagesResponse.json();
      
      // Fetch users
      const usersResponse = await fetch("https://maple-server-e7ye.onrender.com/api/user", {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const usersData = await usersResponse.json();

      // Fetch testimonials
      const testimonialsResponse = await fetch("https://maple-server-e7ye.onrender.com/api/testimonials", {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const testimonialsData = await testimonialsResponse.json();

      // Fetch contacts
      const contactsResponse = await fetch("https://maple-server-e7ye.onrender.com/api/contacts", {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const contactsData = await contactsResponse.json();

      // Fetch bookings
      const bookingsResponse = await fetch("https://maple-server-e7ye.onrender.com/api/bookings", {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const bookingsData = await bookingsResponse.json();

      // Calculate booking stats
      const bookings = bookingsData.data || [];
      const pendingBookings = bookings.filter(b => b.bookingStatus === 'pending').length;
      const confirmedBookings = bookings.filter(b => b.bookingStatus === 'confirmed').length;
      const cancelledBookings = bookings.filter(b => b.bookingStatus === 'cancelled').length;
      
      // Calculate total revenue only from confirmed bookings
      const totalRevenue = bookings
        .filter(b => b.bookingStatus === 'confirmed' && b.paymentStatus === 'completed')
        .reduce((sum, booking) => sum + booking.totalAmount, 0);

      // Update stats with the fetched data
      setStats({
        activePackages: packagesData.data?.length || 0,
        totalUsers: usersData.data?.length || 0,
        testimonialCount: testimonialsData.data?.length || 0,
        contactFormCount: contactsData.data?.length || 0,
        recentPackages: (packagesData.data || []).slice(0, 5), // Get only the 5 most recent packages
        recentContacts: (contactsData.data || []).slice(0, 5),  // Get only the 5 most recent contacts
        totalBookings: bookings.length,
        pendingBookings,
        confirmedBookings,
        cancelledBookings,
        recentBookings: bookings.slice(0, 5), // Get 5 most recent bookings
        totalRevenue
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Failed to load dashboard statistics');
      // Set default values in case of error
      setStats({
        activePackages: 0,
        totalUsers: 0,
        testimonialCount: 0,
        contactFormCount: 0,
        recentPackages: [],
        recentContacts: [],
        totalBookings: 0,
        pendingBookings: 0,
        confirmedBookings: 0,
        cancelledBookings: 0,
        recentBookings: [],
        totalRevenue: 0
      });
    } finally {
      setLoading(false);
    }
  };

  // Export data to Excel
  const exportToExcel = () => {
    try {
      // Prepare data for export
      const exportData = {
        'Dashboard Summary': [
          {
            'Metric': 'Active Packages',
            'Count': stats.activePackages
          },
          {
            'Metric': 'Total Users',
            'Count': stats.totalUsers
          },
          {
            'Metric': 'Total Testimonials',
            'Count': stats.testimonialCount
          },
          {
            'Metric': 'Contact Inquiries',
            'Count': stats.contactFormCount
          }
        ],
        'Recent Packages': stats.recentPackages,
        'Recent Contacts': stats.recentContacts
      };

      // Create workbook and add worksheets
      const wb = XLSX.utils.book_new();
      
      // Add Summary Sheet
      const summaryWS = XLSX.utils.json_to_sheet(exportData['Dashboard Summary']);
      XLSX.utils.book_append_sheet(wb, summaryWS, 'Summary');

      // Add Recent Packages Sheet
      const packagesWS = XLSX.utils.json_to_sheet(exportData['Recent Packages']);
      XLSX.utils.book_append_sheet(wb, packagesWS, 'Recent Packages');

      // Add Recent Contacts Sheet
      const contactsWS = XLSX.utils.json_to_sheet(exportData['Recent Contacts']);
      XLSX.utils.book_append_sheet(wb, contactsWS, 'Recent Contacts');

      // Save the file
      XLSX.writeFile(wb, 'dashboard-report.xlsx');
      toast.success('Report exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export report');
    }
  };

  // Prepare chart data
  const pieChartData = [
    { name: 'Packages', value: stats.activePackages },
    { name: 'Users', value: stats.totalUsers },
    { name: 'Testimonials', value: stats.testimonialCount },
    { name: 'Inquiries', value: stats.contactFormCount }
  ];

  const barChartData = [
    {
      name: 'Statistics',
      packages: stats.activePackages,
      users: stats.totalUsers,
      testimonials: stats.testimonialCount,
      inquiries: stats.contactFormCount
    }
  ];

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold dark:text-white">Dashboard</h1>
        <Button onClick={exportToExcel} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>
      
      {/* Main Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Packages</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activePackages}</div>
            <p className="text-xs text-muted-foreground">Total available packages</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Testimonials</CardTitle>
            <MessageSquareQuote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.testimonialCount}</div>
            <p className="text-xs text-muted-foreground">Total testimonials received</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contact Inquiries</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.contactFormCount}</div>
            <p className="text-xs text-muted-foreground">Total inquiries received</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
            <p className="text-xs text-muted-foreground">All time bookings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Bookings</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingBookings}</div>
            <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">From confirmed bookings</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Statistics Overview</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart
                data={barChartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="packages" fill="#0088FE" name="Packages" />
                <Bar dataKey="users" fill="#00C49F" name="Users" />
                <Bar dataKey="testimonials" fill="#FFBB28" name="Testimonials" />
                <Bar dataKey="inquiries" fill="#FF8042" name="Inquiries" />
              </RechartsBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Packages */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Packages</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentPackages.length > 0 ? (
              <div className="space-y-4">
                {stats.recentPackages.map((pkg) => (
                  <div key={pkg._id} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-medium">{pkg.title}</p>
                      <p className="text-sm text-muted-foreground">{pkg.destination}</p>
                    </div>
                    <Badge className={pkg.active ? 'bg-green-100 text-green-800' : 'bg-gray-100'}>
                      {pkg.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No recent packages
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Inquiries */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Inquiries</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentContacts.length > 0 ? (
              <div className="space-y-4">
                {stats.recentContacts.map((contact) => (
                  <div key={contact._id} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-medium">{contact.firstName} {contact.lastName}</p>
                      <p className="text-sm text-muted-foreground">{contact.email}</p>
                    </div>
                    <Badge className={
                      contact.status === 'new' ? 'bg-blue-100 text-blue-800' :
                      contact.status === 'read' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }>
                      {contact.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No recent inquiries
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentBookings?.length > 0 ? (
            <div className="space-y-4">
              {stats.recentBookings.map((booking) => (
                <div key={booking._id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="font-medium">{booking.package.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(booking.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-medium">₹{booking.totalAmount.toLocaleString()}</p>
                    <Badge className={
                      booking.bookingStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      booking.bookingStatus === 'confirmed' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }>
                      {booking.bookingStatus}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No recent bookings
            </div>
          )}
        </CardContent>
      </Card>

      {/* Future Booking Section Placeholder */}
     
    </div>
  );
}