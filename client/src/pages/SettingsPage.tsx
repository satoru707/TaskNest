import { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { User, Bell, Shield, Monitor, Moon, Sun, LogOut } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from '../utils/cn';

export default function SettingsPage() {
  const { user, logout } = useAuth0();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  
  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
    { id: 'security', label: 'Security', icon: <Shield size={18} /> },
    { id: 'appearance', label: 'Appearance', icon: <Monitor size={18} /> },
  ];
  
  const handleLogout = () => {
    logout({ logoutParams: { returnTo: window.location.origin } });
  };
  
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Settings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6">
        {/* Sidebar */}
        <div className="md:border-r border-gray-200 dark:border-gray-700 md:pr-6">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center w-full px-3 py-2 text-sm font-medium rounded-md",
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
              className="flex items-center w-full px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <LogOut size={18} className="mr-3" />
              Sign out
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div>
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className="flex-shrink-0">
                    {user?.picture ? (
                      <img
                        src={user.picture}
                        alt={user?.name || 'User'}
                        className="w-24 h-24 rounded-full"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 text-2xl font-semibold">
                        {user?.name?.charAt(0) || 'U'}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">{user?.name}</h3>
                    <p className="text-gray-500 dark:text-gray-400">{user?.email}</p>
                    <div className="mt-2">
                      <Button size="sm">Change photo</Button>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      First name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      className="w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      defaultValue={user?.given_name || ''}
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Last name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      className="w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      defaultValue={user?.family_name || ''}
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email address
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      defaultValue={user?.email || ''}
                      disabled
                    />
                  </div>
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Role
                    </label>
                    <select
                      id="role"
                      className="w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option>Admin</option>
                      <option>Editor</option>
                      <option>Viewer</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    rows={4}
                    className="w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Write a short bio about yourself..."
                  ></textarea>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <div className="flex gap-3">
                  <Button variant="outline">Cancel</Button>
                  <Button>Save changes</Button>
                </div>
              </CardFooter>
            </Card>
          )}
          
          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Configure how and when you want to receive notifications.
                </p>
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Notifications</h3>
                  
                  {[
                    { id: 'task-assigned', label: 'When a task is assigned to me' },
                    { id: 'task-comment', label: 'When someone comments on my task' },
                    { id: 'task-due', label: 'When a task is due soon' },
                    { id: 'board-invite', label: 'When I am invited to a board' },
                  ].map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <label htmlFor={item.id} className="flex items-center cursor-pointer">
                        <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
                      </label>
                      <div className="relative inline-block w-10 mr-2 align-middle select-none">
                        <input 
                          type="checkbox" 
                          id={item.id} 
                          className="sr-only peer"
                          defaultChecked 
                        />
                        <div className="h-4 w-10 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0 after:left-0 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600"></div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">In-App Notifications</h3>
                  
                  {[
                    { id: 'app-task-assigned', label: 'When a task is assigned to me' },
                    { id: 'app-task-comment', label: 'When someone comments on my task' },
                    { id: 'app-task-due', label: 'When a task is due soon' },
                    { id: 'app-board-invite', label: 'When I am invited to a board' },
                    { id: 'app-task-moved', label: 'When a task is moved to a different list' },
                  ].map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <label htmlFor={item.id} className="flex items-center cursor-pointer">
                        <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
                      </label>
                      <div className="relative inline-block w-10 mr-2 align-middle select-none">
                        <input 
                          type="checkbox" 
                          id={item.id} 
                          className="sr-only peer"
                          defaultChecked 
                        />
                        <div className="h-4 w-10 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0 after:left-0 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <div className="flex gap-3">
                  <Button variant="outline">Cancel</Button>
                  <Button>Save changes</Button>
                </div>
              </CardFooter>
            </Card>
          )}
          
          {activeTab === 'security' && (
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Change Password</h3>
                  
                  <div>
                    <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Current password
                    </label>
                    <input
                      type="password"
                      id="current-password"
                      className="w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      New password
                    </label>
                    <input
                      type="password"
                      id="new-password"
                      className="w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Confirm new password
                    </label>
                    <input
                      type="password"
                      id="confirm-password"
                      className="w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  
                  <div>
                    <Button>Update password</Button>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-gray-200 dark:border-gray-700 space-y-4">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Two-Factor Authentication</h3>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-700 dark:text-gray-300 font-medium">Two-factor authentication</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Add an extra layer of security to your account</p>
                    </div>
                    <div className="relative inline-block w-10 mr-2 align-middle select-none">
                      <input 
                        type="checkbox" 
                        id="tfa" 
                        className="sr-only peer" 
                      />
                      <div className="h-4 w-10 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0 after:left-0 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600"></div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-gray-200 dark:border-gray-700 space-y-4">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sessions</h3>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-700 dark:text-gray-300 font-medium">Current session</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Last active 2 minutes ago • Chrome on macOS</p>
                      </div>
                      <div className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                        Active
                      </div>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-900/20">
                    Sign out of all other sessions
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {activeTab === 'appearance' && (
            <Card>
              <CardHeader>
                <CardTitle>Appearance Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Customize the appearance of the application to your preference.
                </p>
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Theme</h3>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div 
                      className={cn(
                        "flex flex-col items-center p-4 rounded-lg border-2 cursor-pointer",
                        theme === 'light' 
                          ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20" 
                          : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                      )}
                      onClick={() => setTheme('light')}
                    >
                      <div className="w-12 h-12 rounded-full bg-white dark:bg-gray-200 flex items-center justify-center text-amber-500 mb-3">
                        <Sun size={24} />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Light</span>
                    </div>
                    
                    <div 
                      className={cn(
                        "flex flex-col items-center p-4 rounded-lg border-2 cursor-pointer",
                        theme === 'dark' 
                          ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20" 
                          : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                      )}
                      onClick={() => setTheme('dark')}
                    >
                      <div className="w-12 h-12 rounded-full bg-gray-900 dark:bg-gray-800 flex items-center justify-center text-amber-300 mb-3">
                        <Moon size={24} />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Dark</span>
                    </div>
                    
                    <div 
                      className={cn(
                        "flex flex-col items-center p-4 rounded-lg border-2 cursor-pointer",
                        theme === 'system' 
                          ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20" 
                          : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                      )}
                      onClick={() => setTheme('system')}
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-white to-gray-900 dark:from-gray-200 dark:to-gray-800 flex items-center justify-center text-blue-500 mb-3">
                        <Monitor size={24} />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">System</span>
                    </div>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-gray-200 dark:border-gray-700 space-y-4">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Board View</h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input 
                        id="compact-view" 
                        name="board-view"
                        type="radio" 
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                        defaultChecked
                      />
                      <label htmlFor="compact-view" className="ml-3 block text-gray-700 dark:text-gray-300">
                        Compact view
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input 
                        id="detailed-view" 
                        name="board-view"
                        type="radio" 
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                      />
                      <label htmlFor="detailed-view" className="ml-3 block text-gray-700 dark:text-gray-300">
                        Detailed view
                      </label>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <div className="flex gap-3">
                  <Button variant="outline">Cancel</Button>
                  <Button>Save changes</Button>
                </div>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}