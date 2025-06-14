import { useState, useEffect } from "react";
import { useAuth0WithUser as useAuth0 } from "../hooks/useAuth0withUser";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "../components/ui/Card";
import Button from "../components/ui/Button";
import {
  User,
  Bell,
  Shield,
  Monitor,
  Moon,
  Sun,
  LogOut,
  Camera,
  Save,
  X,
  Check,
  AlertTriangle,
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useCurrentUser } from "../lib/auth";
import { authAPI, uploadsAPI } from "../lib/api";
import { toast } from "sonner";
import { cn } from "../utils/cn";

export default function SettingsPage() {
  const { user, logout } = useAuth0();
  const { dbUser } = useCurrentUser();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Profile form state
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    bio: "",
    avatar: "",
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailTaskAssigned: true,
    emailTaskComment: true,
    emailTaskDue: true,
    emailBoardInvite: true,
    appTaskAssigned: true,
    appTaskComment: true,
    appTaskDue: true,
    appBoardInvite: true,
    appTaskMoved: true,
  });

  // Security settings
  const [securityData, setSecurityData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactorEnabled: false,
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
    { id: "notifications", label: "Notifications", icon: <Bell size={18} /> },
    { id: "security", label: "Security", icon: <Shield size={18} /> },
    { id: "appearance", label: "Appearance", icon: <Monitor size={18} /> },
  ];

  const handleLogout = () => {
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  const handleProfileSave = async () => {
    if (!dbUser) return;

    setIsSaving(true);
    try {
      await authAPI.updateProfile(dbUser.auth0Id, {
        name: `${profileData.firstName} ${profileData.lastName}`.trim(),
        bio: profileData.bio,
      });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !dbUser) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      toast.error("Image size must be less than 5MB");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", dbUser.id);

      const response = await uploadsAPI.uploadAvatar(formData);
      setProfileData((prev) => ({
        ...prev,
        avatar: response.data.user.avatar,
      }));
      toast.success("Avatar updated successfully");
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("Failed to upload avatar");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationSave = async () => {
    setIsSaving(true);
    try {
      // In a real app, you'd save these to the backend
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      toast.success("Notification settings saved");
    } catch (error) {
      toast.error("Failed to save notification settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!securityData.newPassword || !securityData.confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (securityData.newPassword !== securityData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (securityData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    setIsSaving(true);
    try {
      // In a real app, you'd call Auth0's change password API
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      setSecurityData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
      toast.success("Password updated successfully");
    } catch (error) {
      toast.error("Failed to update password");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTwoFactorToggle = async () => {
    setIsLoading(true);
    try {
      // In a real app, you'd integrate with Auth0's MFA API
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      setSecurityData((prev) => ({
        ...prev,
        twoFactorEnabled: !prev.twoFactorEnabled,
      }));
      toast.success(
        `Two-factor authentication ${
          !securityData.twoFactorEnabled ? "enabled" : "disabled"
        }`
      );
    } catch (error) {
      toast.error("Failed to update two-factor authentication");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOutAllSessions = async () => {
    setIsLoading(true);
    try {
      // In a real app, you'd call Auth0's session management API
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      toast.success("Signed out of all other sessions");
    } catch (error) {
      toast.error("Failed to sign out of other sessions");
    } finally {
      setIsLoading(false);
    }
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
                    <label className="absolute bottom-0 right-0 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <Camera
                        size={16}
                        className="text-gray-600 dark:text-gray-300"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                        disabled={isLoading}
                      />
                    </label>
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
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Click the camera icon to change your profile photo
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

                <div>
                  <label
                    htmlFor="bio"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    rows={4}
                    value={profileData.bio}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        bio: e.target.value,
                      }))
                    }
                    className="w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                    placeholder="Write a short bio about yourself..."
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button
                  onClick={handleProfileSave}
                  isLoading={isSaving}
                  icon={<Save size={16} />}
                >
                  Save changes
                </Button>
              </CardFooter>
            </Card>
          )}

          {activeTab === "notifications" && (
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-gray-600 dark:text-gray-300">
                  Configure how and when you want to receive notifications.
                </p>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                      Email Notifications
                    </h3>
                    <div className="space-y-4">
                      {[
                        {
                          key: "emailTaskAssigned",
                          label: "When a task is assigned to me",
                        },
                        {
                          key: "emailTaskComment",
                          label: "When someone comments on my task",
                        },
                        {
                          key: "emailTaskDue",
                          label: "When a task is due soon",
                        },
                        {
                          key: "emailBoardInvite",
                          label: "When I am invited to a board",
                        },
                      ].map((item) => (
                        <div
                          key={item.key}
                          className="flex items-center justify-between"
                        >
                          <label className="text-gray-700 dark:text-gray-300">
                            {item.label}
                          </label>
                          <button
                            onClick={() =>
                              setNotifications((prev) => ({
                                ...prev,
                                [item.key]:
                                  !prev[item.key as keyof typeof prev],
                              }))
                            }
                            className={cn(
                              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                              notifications[
                                item.key as keyof typeof notifications
                              ]
                                ? "bg-primary-600"
                                : "bg-gray-200 dark:bg-gray-700"
                            )}
                          >
                            <span
                              className={cn(
                                "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                                notifications[
                                  item.key as keyof typeof notifications
                                ]
                                  ? "translate-x-6"
                                  : "translate-x-1"
                              )}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                      In-App Notifications
                    </h3>
                    <div className="space-y-4">
                      {[
                        {
                          key: "appTaskAssigned",
                          label: "When a task is assigned to me",
                        },
                        {
                          key: "appTaskComment",
                          label: "When someone comments on my task",
                        },
                        { key: "appTaskDue", label: "When a task is due soon" },
                        {
                          key: "appBoardInvite",
                          label: "When I am invited to a board",
                        },
                        {
                          key: "appTaskMoved",
                          label: "When a task is moved to a different list",
                        },
                      ].map((item) => (
                        <div
                          key={item.key}
                          className="flex items-center justify-between"
                        >
                          <label className="text-gray-700 dark:text-gray-300">
                            {item.label}
                          </label>
                          <button
                            onClick={() =>
                              setNotifications((prev) => ({
                                ...prev,
                                [item.key]:
                                  !prev[item.key as keyof typeof prev],
                              }))
                            }
                            className={cn(
                              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                              notifications[
                                item.key as keyof typeof notifications
                              ]
                                ? "bg-primary-600"
                                : "bg-gray-200 dark:bg-gray-700"
                            )}
                          >
                            <span
                              className={cn(
                                "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                                notifications[
                                  item.key as keyof typeof notifications
                                ]
                                  ? "translate-x-6"
                                  : "translate-x-1"
                              )}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button
                  onClick={handleNotificationSave}
                  isLoading={isSaving}
                  icon={<Save size={16} />}
                >
                  Save changes
                </Button>
              </CardFooter>
            </Card>
          )}

          {activeTab === "security" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label
                      htmlFor="current-password"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Current password
                    </label>
                    <input
                      type="password"
                      id="current-password"
                      value={securityData.currentPassword}
                      onChange={(e) =>
                        setSecurityData((prev) => ({
                          ...prev,
                          currentPassword: e.target.value,
                        }))
                      }
                      className="w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="new-password"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      New password
                    </label>
                    <input
                      type="password"
                      id="new-password"
                      value={securityData.newPassword}
                      onChange={(e) =>
                        setSecurityData((prev) => ({
                          ...prev,
                          newPassword: e.target.value,
                        }))
                      }
                      className="w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="confirm-password"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Confirm new password
                    </label>
                    <input
                      type="password"
                      id="confirm-password"
                      value={securityData.confirmPassword}
                      onChange={(e) =>
                        setSecurityData((prev) => ({
                          ...prev,
                          confirmPassword: e.target.value,
                        }))
                      }
                      className="w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={handlePasswordChange}
                    isLoading={isSaving}
                    icon={<Save size={16} />}
                  >
                    Update password
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Two-Factor Authentication</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-700 dark:text-gray-300 font-medium">
                        Two-factor authentication
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <button
                      onClick={handleTwoFactorToggle}
                      disabled={isLoading}
                      className={cn(
                        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                        securityData.twoFactorEnabled
                          ? "bg-primary-600"
                          : "bg-gray-200 dark:bg-gray-700"
                      )}
                    >
                      <span
                        className={cn(
                          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                          securityData.twoFactorEnabled
                            ? "translate-x-6"
                            : "translate-x-1"
                        )}
                      />
                    </button>
                  </div>
                  {securityData.twoFactorEnabled && (
                    <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="flex items-center">
                        <Check className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                        <span className="text-sm text-green-800 dark:text-green-200">
                          Two-factor authentication is enabled
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Active Sessions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-700 dark:text-gray-300 font-medium">
                          Current session
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Last active now •{" "}
                          {navigator.userAgent.includes("Chrome")
                            ? "Chrome"
                            : "Browser"}{" "}
                          on {navigator.platform}
                        </p>
                      </div>
                      <div className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                        Active
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    onClick={handleSignOutAllSessions}
                    isLoading={isLoading}
                    className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    icon={<LogOut size={16} />}
                  >
                    Sign out of all other sessions
                  </Button>
                </CardContent>
              </Card>
            </div>
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

                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                    Display Preferences
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-700 dark:text-gray-300 font-medium">
                          Compact mode
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Show more content in less space
                        </p>
                      </div>
                      <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700 transition-colors">
                        <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-700 dark:text-gray-300 font-medium">
                          Animations
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Enable smooth transitions and animations
                        </p>
                      </div>
                      <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary-600 transition-colors">
                        <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                      </button>
                    </div>
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
