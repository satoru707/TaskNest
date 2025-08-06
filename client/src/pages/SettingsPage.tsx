import { useState, useEffect } from "react";
import { useAuth0WithUser as useAuth0 } from "../hooks/useAuth0withUser";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/Card";
import { User, Monitor, Moon, Sun, LogOut } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useCurrentUser } from "../lib/auth";
import { cn } from "../utils/cn";

export default function SettingsPage() {
  const { user, logout } = useAuth0();
  const { dbUser } = useCurrentUser();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(false);

  // Profile form state
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    bio: "",
    avatar: "",
  });

  useEffect(() => {
    if (user && dbUser) {
      setProfileData({
        firstName: user.given_name || "",
        lastName: user.family_name || "",
        email: user.email || "",
        bio: dbUser.bio || "",
        avatar: user.picture || dbUser.avatar || "",
      });
    }
  }, [user, dbUser]);

  const tabs = [
    { id: "profile", label: "Profile", icon: <User size={18} /> },
    { id: "appearance", label: "Appearance", icon: <Monitor size={18} /> },
  ];

  const handleLogout = () => {
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Manage your account settings and preferences
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6">
        {/* Sidebar */}
        <div className="md:border-r border-gray-200 dark:border-gray-700 md:pr-6">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  activeTab === tab.id
                    ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                <span className="mr-3">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2 text-sm font-medium rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut size={18} className="mr-3" />
              Sign out
            </button>
          </div>
        </div>

        {/* Content */}
        <div>
          {activeTab === "profile" && (
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className="flex-shrink-0 relative">
                    {profileData.avatar ? (
                      <img
                        src={profileData.avatar}
                        alt="Profile"
                        className="w-24 h-24 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 text-2xl font-semibold">
                        {profileData.firstName?.charAt(0) ||
                          user?.name?.charAt(0) ||
                          "U"}
                      </div>
                    )}

                    {isLoading && (
                      <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {user?.name}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      {user?.email}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      First name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      value={profileData.firstName}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          firstName: e.target.value,
                        }))
                      }
                      disabled
                      className="w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Last name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      value={profileData.lastName}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          lastName: e.target.value,
                        }))
                      }
                      disabled
                      className="w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Email address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={profileData.email}
                      className="w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-sm text-gray-500 dark:text-gray-400"
                      disabled
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Email cannot be changed. Contact support if you need to
                      update your email.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "appearance" && (
            <Card>
              <CardHeader>
                <CardTitle>Appearance Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-gray-600 dark:text-gray-300">
                  Customize the appearance of the application to your
                  preference.
                </p>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Theme
                  </h3>

                  <div className="grid grid-cols-3 gap-4">
                    <button
                      onClick={() => setTheme("light")}
                      className={cn(
                        "flex flex-col items-center p-4 rounded-lg border-2 transition-all",
                        theme === "light"
                          ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                      )}
                    >
                      <div className="w-12 h-12 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center text-yellow-500 mb-3">
                        <Sun size={24} />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        Light
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Clean and bright
                      </span>
                    </button>

                    <button
                      onClick={() => setTheme("dark")}
                      className={cn(
                        "flex flex-col items-center p-4 rounded-lg border-2 transition-all",
                        theme === "dark"
                          ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                      )}
                    >
                      <div className="w-12 h-12 rounded-full bg-gray-900 border-2 border-gray-700 flex items-center justify-center text-blue-400 mb-3">
                        <Moon size={24} />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        Dark
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Easy on the eyes
                      </span>
                    </button>

                    <button
                      onClick={() => setTheme("system")}
                      className={cn(
                        "flex flex-col items-center p-4 rounded-lg border-2 transition-all",
                        theme === "system"
                          ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                      )}
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-white to-gray-900 border-2 border-gray-300 flex items-center justify-center text-primary-500 mb-3">
                        <Monitor size={24} />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        System
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Follows device
                      </span>
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
