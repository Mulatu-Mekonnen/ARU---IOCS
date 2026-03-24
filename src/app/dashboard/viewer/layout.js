"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useEffect } from "react";
import { Bell, ChevronDown, User, LogOut } from "lucide-react";

import { Menu, Home, Inbox, Megaphone, Archive } from "lucide-react";

export default function ViewerLayout({ children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);  
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
 
   const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };
     useEffect(() => {
        fetch("/api/auth/session", { credentials: "include" })
          .then((res) => res.json())
          .then((userData) => setUser(userData))
          .catch((err) => console.error("Failed to fetch user:", err));
   }, []);

  const nav = [
    { name: "Dashboard", href: "/dashboard/viewer", icon: Home },
    { name: "Inbox", href: "/dashboard/viewer/inbox", icon: Inbox },
    { name: "Announcements", href: "/dashboard/viewer/announcements", icon: Megaphone },
    { name: "Archive", href: "/dashboard/viewer/archive", icon: Archive },
  ];

  

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-md transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:inset-0`}>
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-slate-800">Viewer</h2>
        </div>
        <nav className="p-4 space-y-2">
          {nav.map((n) => {
            const Icon = n.icon;
            const active = pathname === n.href;
            return (
              <Link key={n.href} href={n.href} className={`flex items-center gap-3 px-3 py-2 rounded-lg ${active ? 'bg-blue-100 text-blue-800' : 'text-slate-700 hover:bg-gray-100'}`} onClick={() => setSidebarOpen(false)}>
                <Icon className="w-4 h-4" />
                {n.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black bg-opacity-40 md:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-4 py-3 md:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button className="md:hidden text-gray-600" onClick={() => setSidebarOpen(!sidebarOpen)}>
                <Menu className="w-6 h-6" />
              </button>
               <div>
          <h1 className="text-3xl font-bold text-gray-800">Welcome{user?.name ? `, ${user.name}` : ""} 👋</h1>
          <p className="text-gray-600 mt-1">View approved communications from across offices.</p>
             </div>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
      
        <div className="flex items-center gap-4">
          <button className="relative text-gray-500 hover:text-gray-700">
            <Bell className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              3
            </span>
          </button>

          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                {user?.name ? user.name.charAt(0).toUpperCase() : "V"}
              </div>
              <ChevronDown className="w-4 h-4" />
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <div className="px-4 py-2 border-b border-gray-200">
                  <div className="font-semibold">{user?.name || "Viewer User"}</div>
                  <div className="text-sm text-gray-500">{user?.role || "Viewer"}</div>
                </div>
                <button className="flex items-center gap-2 w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100">
                  <User className="w-4 h-4" />
                  Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-4 py-2 text-left text-gray-700 hover:bg-red-50 hover:text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
            </div>
           </div>
         </div>
       </div>
        </header>

        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
