import { useState, useEffect } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth0WithUser as useAuth0 } from "../hooks/useAuth0withUser";
import {
  LayoutDashboard,
  CheckSquare,
  BarChart,
  Settings,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Monitor,
  Bell,
  Search,
  Plus,
  HelpCircle,
  Bookmark,
  Users,
  Calendar,
  Archive,
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useCurrentUser } from "../lib/auth";
import { cn } from "../utils/cn";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../components/ui/Button";

const navItems = [
  {
    path: "/dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard size={20} />,
  },
  { path: "/analytics", label: "Analytics", icon: <BarChart size={20} /> },
  { path: "/settings", label: "Settings", icon: <Settings size={20} /> },
];

const quickActions = [
  { label: "New Board", icon: <Plus size={16} />, action: "create-board" },
  { label: "New Task", icon: <CheckSquare size={16} />, action: "create-task" },
  { label: "Calendar", icon: <Calendar size={16} />, action: "calendar" },
];

export default function DashboardLayout() {
  const { logout } = useAuth0();
  const { user, dbUser } = useCurrentUser();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme, isDarkMode } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications] = useState([
    {
      id: 1,
      title: "New task assigned",
      message: 'You have been assigned to "Update documentation"',
      time: "2 min ago",
      unread: true,
    },
    {
      id: 2,
      title: "Board invitation",
      message: 'You were invited to join "Marketing Campaign"',
      time: "1 hour ago",
      unread: true,
    },
    {
      id: 3,
      title: "Task completed",
      message: 'Sarah completed "Design review"',
      time: "3 hours ago",
      unread: false,
    },
  ]);

  const handleLogout = () => {
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Implement global search functionality
      console.log("Searching for:", searchQuery);
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "create-board":
        // Trigger create board modal
        break;
      case "create-task":
        // Trigger create task modal
        break;
      case "calendar":
        // Navigate to calendar view
        break;
    }
  };

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case "k":
            e.preventDefault();
            document.getElementById("search-input")?.focus();
            break;
          case "b":
            e.preventDefault();
            toggleSidebar();
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="h-screen flex flex-col md:flex-row bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      {/* Mobile Header */}
      <div className="md:hidden bg-white dark:bg-gray-800 p-4 shadow-nav flex items-center justify-between z-10 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="mr-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 9V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-1" />
                <path d="M2 13h10" />
                <path d="m9 16 3-3-3-3" />
                <path d="M12 19h9" />
              </svg>
            </div>
            <span className="font-semibold text-lg">TaskNest</span>
          </div>
        </div>

        {/* Mobile user area */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Bell size={20} />
            {notifications.some((n) => n.unread) && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>
          <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center overflow-hidden">
            {user?.picture ? (
              <img
                src={user.picture}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              user?.name?.charAt(0) || "U"
            )}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {(isSidebarOpen || window.innerWidth >= 768) && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{
              x: 0,
              opacity: 1,
              width: isSidebarOpen ? (window.innerWidth < 768 ? 300 : 280) : 80,
            }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={cn(
              "fixed md:relative w-80 md:w-80 h-full z-20 md:z-0 bg-white dark:bg-gray-800 shadow-xl md:shadow-none border-r border-gray-200 dark:border-gray-700 flex flex-col",
              !isSidebarOpen && "md:w-20"
            )}
          >
            {/* Sidebar Header */}
            <div className="p-4 h-16 flex items-center justify-between border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2 9V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-1" />
                    <path d="M2 13h10" />
                    <path d="m9 16 3-3-3-3" />
                    <path d="M12 19h9" />
                  </svg>
                </div>
                {isSidebarOpen && (
                  <span className="font-semibold text-lg">TaskNest</span>
                )}
              </div>
              <button
                onClick={toggleSidebar}
                className="hidden md:block text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1 rounded transition-colors"
              >
                {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>

            {/* Search */}
            {isSidebarOpen && (
              <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                <form onSubmit={handleSearch} className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    id="search-input"
                    type="text"
                    placeholder="Search... (⌘K)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  />
                </form>
              </div>
            )}

            {/* Quick Actions */}
            {isSidebarOpen && (
              <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-xs uppercase text-gray-500 dark:text-gray-400 font-medium mb-3">
                  Quick Actions
                </h3>
                <div className="space-y-1">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickAction(action.action)}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      {action.icon}
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation Links */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              <div className="space-y-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center py-2 px-3 rounded-lg transition-all group",
                        isActive
                          ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50",
                        !isSidebarOpen && "justify-center"
                      )
                    }
                    title={!isSidebarOpen ? item.label : undefined}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    {isSidebarOpen && (
                      <span className="ml-3 font-medium">{item.label}</span>
                    )}
                  </NavLink>
                ))}
              </div>

              {isSidebarOpen && (
                <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-xs uppercase text-gray-500 dark:text-gray-400 font-medium mb-3">
                    Workspace
                  </h3>
                  <div className="space-y-1">
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      <Users size={16} />
                      Team Members
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      <Bookmark size={16} />
                      Bookmarks
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      <Archive size={16} />
                      Archive
                    </button>
                  </div>
                </div>
              )}
            </nav>

            {/* Theme Switcher */}
            {isSidebarOpen && (
              <div className="p-4 border-t border-gray-100 dark:border-gray-700">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                  <h3 className="text-xs uppercase text-gray-500 dark:text-gray-400 font-medium mb-3">
                    Appearance
                  </h3>
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      onClick={() => handleThemeChange("light")}
                      className={cn(
                        "flex flex-col items-center justify-center p-2 rounded-lg transition-all",
                        theme === "light"
                          ? "bg-white dark:bg-gray-600 shadow-sm ring-2 ring-primary-500"
                          : "hover:bg-gray-100 dark:hover:bg-gray-700"
                      )}
                      title="Light theme"
                    >
                      <Sun size={16} />
                      <span className="text-xs mt-1">Light</span>
                    </button>
                    <button
                      onClick={() => handleThemeChange("dark")}
                      className={cn(
                        "flex flex-col items-center justify-center p-2 rounded-lg transition-all",
                        theme === "dark"
                          ? "bg-white dark:bg-gray-600 shadow-sm ring-2 ring-primary-500"
                          : "hover:bg-gray-100 dark:hover:bg-gray-700"
                      )}
                      title="Dark theme"
                    >
                      <Moon size={16} />
                      <span className="text-xs mt-1">Dark</span>
                    </button>
                    <button
                      onClick={() => handleThemeChange("system")}
                      className={cn(
                        "flex flex-col items-center justify-center p-2 rounded-lg transition-all",
                        theme === "system"
                          ? "bg-white dark:bg-gray-600 shadow-sm ring-2 ring-primary-500"
                          : "hover:bg-gray-100 dark:hover:bg-gray-700"
                      )}
                      title="System theme"
                    >
                      <Monitor size={16} />
                      <span className="text-xs mt-1">Auto</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* User section */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex-shrink-0">
              {isSidebarOpen ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {user?.picture ? (
                        <img
                          src={user.picture}
                          alt={user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        user?.name?.charAt(0) || "U"
                      )}
                    </div>
                    <div className="ml-3 min-w-0 flex-1">
                      <p className="text-sm font-medium truncate text-gray-900 dark:text-white">
                        {user?.name || "User"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {user?.email || "user@example.com"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="relative p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      title="Notifications"
                    >
                      <Bell size={16} />
                      {notifications.some((n) => n.unread) && (
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                      )}
                    </button>
                    <button
                      onClick={handleLogout}
                      className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      title="Sign out"
                    >
                      <LogOut size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center overflow-hidden">
                    {user?.picture ? (
                      <img
                        src={user.picture}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      user?.name?.charAt(0) || "U"
                    )}
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <button
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="relative p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      title="Notifications"
                    >
                      <Bell size={16} />
                      {notifications.some((n) => n.unread) && (
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                      )}
                    </button>
                    <button
                      onClick={handleLogout}
                      className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      title="Sign out"
                    >
                      <LogOut size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && window.innerWidth < 768 && (
        <div
          className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-10"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Notifications Panel */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed right-0 top-0 h-full w-80 bg-white dark:bg-gray-800 shadow-xl border-l border-gray-200 dark:border-gray-700 z-50 overflow-y-auto"
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Notifications
                </h2>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="p-4">
              {notifications.length > 0 ? (
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "p-3 rounded-lg border transition-colors cursor-pointer",
                        notification.unread
                          ? "bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800"
                          : "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                            {notification.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            {notification.time}
                          </p>
                        </div>
                        {notification.unread && (
                          <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-1"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Bell className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-500 dark:text-gray-400">
                    No notifications
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications overlay */}
      {showNotifications && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setShowNotifications(false)}
        />
      )}

      {/* Main content */}
      <main
        className={cn(
          "flex-1 transition-all duration-300 ease-in-out overflow-auto",
          isSidebarOpen ? "md:ml-0" : "md:ml-0"
        )}
      >
        <Outlet />
      </main>

      {/* Help Button */}
      <button
        className="fixed bottom-6 right-6 w-12 h-12 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors z-30"
        title="Help & Support"
      >
        <HelpCircle size={24} />
      </button>
    </div>
  );
}
