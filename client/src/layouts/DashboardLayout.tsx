import { useEffect, useState } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
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
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useCurrentUser } from "../lib/auth";
import { cn } from "../utils/cn";
import { motion } from "framer-motion";
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

export default function DashboardLayout() {
  const { logout, user, isAuthenticated } = useAuth0();
  const ran = useAuth0();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme, isDarkMode } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, []);

  const handleLogout = () => {
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
  };

  return (
    <div className="h-screen flex flex-col md:flex-row bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      {/* Mobile Header */}
      <div className="md:hidden bg-white dark:bg-gray-800 p-4 shadow-nav flex items-center justify-between z-10">
        <div className="flex items-center">
          <button onClick={toggleSidebar} className="mr-2">
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="flex items-center gap-2">
            <span className="text-primary-600 dark:text-primary-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 9V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-1" />
                <path d="M2 13h10" />
                <path d="m9 16 3-3-3-3" />
                <path d="M12 19h9" />
              </svg>
            </span>
            <span className="font-semibold text-lg">TaskNest</span>
          </div>
        </div>

        {/* Mobile user area */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="p-2">
            <Bell size={20} />
          </Button>
          <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center">
            {user?.picture ? (
              <img
                src={user.picture}
                alt={user.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              user?.name?.charAt(0) || "U"
            )}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300, opacity: 0 }}
        animate={{
          x: isSidebarOpen ? 0 : window.innerWidth < 768 ? -300 : -80,
          opacity: 1,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={cn(
          "fixed md:relative w-64 md:w-64 h-full z-20 md:z-0 bg-white dark:bg-gray-800 shadow-lg md:shadow-none border-r border-gray-200 dark:border-gray-700",
          !isSidebarOpen && "md:w-20"
        )}
      >
        {/* Sidebar Header */}
        <div className="p-4 h-16 flex items-center justify-between border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <span className="text-primary-600 dark:text-primary-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 9V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-1" />
                <path d="M2 13h10" />
                <path d="m9 16 3-3-3-3" />
                <path d="M12 19h9" />
              </svg>
            </span>
            {isSidebarOpen && (
              <span className="font-semibold text-lg">TaskNest</span>
            )}
          </div>
          <button
            onClick={toggleSidebar}
            className="hidden md:block text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Search */}
        {isSidebarOpen && (
          <div className="p-4">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              // onClick={isSidebarOpen ? toggleSidebar : undefined}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center py-2 px-3 rounded-md transition-all",
                  isActive
                    ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50",
                  !isSidebarOpen && "justify-center"
                )
              }
            >
              <span>{item.icon}</span>
              {isSidebarOpen && <span className="ml-3">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Theme Switcher */}
        {isSidebarOpen && (
          <div className="px-4 mt-6">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-md p-2">
              <h3 className="text-xs uppercase text-gray-500 dark:text-gray-400 font-medium mb-2 px-2">
                Appearance
              </h3>
              <div className="grid grid-cols-3 gap-1">
                <button
                  onClick={() => handleThemeChange("light")}
                  className={cn(
                    "flex flex-col items-center justify-center p-2 rounded",
                    theme === "light"
                      ? "bg-white dark:bg-gray-600 shadow-sm"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  )}
                >
                  <Sun size={16} />
                  <span className="text-xs mt-1">Light</span>
                </button>
                <button
                  onClick={() => handleThemeChange("dark")}
                  className={cn(
                    "flex flex-col items-center justify-center p-2 rounded",
                    theme === "dark"
                      ? "bg-white dark:bg-gray-600 shadow-sm"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  )}
                >
                  <Moon size={16} />
                  <span className="text-xs mt-1">Dark</span>
                </button>
                <button
                  onClick={() => handleThemeChange("system")}
                  className={cn(
                    "flex flex-col items-center justify-center p-2 rounded",
                    theme === "system"
                      ? "bg-white dark:bg-gray-600 shadow-sm"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  )}
                >
                  <Monitor size={16} />
                  <span className="text-xs mt-1">Auto</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* User section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 dark:border-gray-700">
          {isSidebarOpen ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center min-w-0">
                <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center flex-shrink-0">
                  {user?.picture ? (
                    <img
                      src={user.picture}
                      alt={user.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    user?.name?.charAt(0) || "U"
                  )}
                </div>
                <div className="ml-2 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user?.name || "User"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user?.email || "user@example.com"}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 flex-shrink-0"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center">
                {user?.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  user?.name?.charAt(0) || "U"
                )}
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <LogOut size={18} />
              </button>
            </div>
          )}
        </div>
      </motion.aside>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-10"
          onClick={() => setIsSidebarOpen(false)}
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
    </div>
  );
}
