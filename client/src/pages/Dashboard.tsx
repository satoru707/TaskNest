import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Clock, Users, BarChart2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { cn } from '../utils/cn';

// Mock data for the dashboard
const recentBoards = [
  { id: '1', title: 'Product Roadmap', tasks: 24, completedTasks: 18, members: 5, lastUpdated: '2 hours ago' },
  { id: '2', title: 'Marketing Campaign', tasks: 15, completedTasks: 8, members: 3, lastUpdated: '1 day ago' },
  { id: '3', title: 'Website Redesign', tasks: 32, completedTasks: 14, members: 7, lastUpdated: '3 days ago' },
];

const stats = [
  { id: 1, name: 'Total Tasks', value: '71', icon: <Clock size={20} />, change: '+12%', changeType: 'increase' },
  { id: 2, name: 'Team Members', value: '9', icon: <Users size={20} />, change: '+2', changeType: 'increase' },
  { id: 3, name: 'Completion Rate', value: '64%', icon: <BarChart2 size={20} />, change: '+5%', changeType: 'increase' },
];

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Welcome back! Here's an overview of your tasks.</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button icon={<Plus size={18} />}>
            New Board
          </Button>
        </div>
      </div>
      
      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: stat.id * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center mr-4",
                    stat.id === 1 ? "bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400" :
                    stat.id === 2 ? "bg-secondary-100 dark:bg-secondary-900/30 text-secondary-600 dark:text-secondary-400" :
                    "bg-accent-100 dark:bg-accent-900/30 text-accent-600 dark:text-accent-400"
                  )}>
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.name}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                  </div>
                  <div className="ml-auto">
                    <span className={cn(
                      "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                      stat.changeType === 'increase' 
                        ? "bg-success-100 dark:bg-success-900/30 text-success-800 dark:text-success-400"
                        : "bg-error-100 dark:bg-error-900/30 text-error-800 dark:text-error-400"
                    )}>
                      {stat.change}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      
      {/* Recent Boards */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Boards</h2>
          <div className="mt-2 sm:mt-0 flex space-x-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400" />
              </div>
              <input 
                type="text" 
                placeholder="Search boards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <Button variant="outline" size="sm" icon={<Filter size={16} />}>
              Filter
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recentBoards.map((board, index) => (
            <motion.div
              key={board.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
            >
              <Link to={`/boards/${board.id}`}>
                <Card className="h-full hover:shadow-md transition-shadow duration-200">
                  <CardHeader>
                    <CardTitle className="truncate">{board.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Progress</span>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {board.completedTasks}/{board.tasks} tasks
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary-500 rounded-full"
                          style={{ width: `${(board.completedTasks / board.tasks) * 100}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center text-gray-500 dark:text-gray-400">
                          <Users size={16} className="mr-1" />
                          <span>{board.members} members</span>
                        </div>
                        <span className="text-gray-500 dark:text-gray-400">
                          Updated {board.lastUpdated}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
          
          {/* Create new board card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 + recentBoards.length * 0.1 }}
          >
            <Card className="h-full border-2 border-dashed border-gray-300 dark:border-gray-700 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200 flex flex-col items-center justify-center p-6">
              <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 mb-3">
                <Plus size={24} />
              </div>
              <h3 className="text-gray-900 dark:text-white font-medium text-lg mb-1">Create New Board</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm text-center">
                Start a new project or organize tasks
              </p>
            </Card>
          </motion.div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: 'Create Task', icon: <Plus size={20} />, color: 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' },
            { title: 'View Analytics', icon: <BarChart2 size={20} />, color: 'bg-secondary-100 dark:bg-secondary-900/30 text-secondary-600 dark:text-secondary-400' },
            { title: 'Team Members', icon: <Users size={20} />, color: 'bg-accent-100 dark:bg-accent-900/30 text-accent-600 dark:text-accent-400' },
            { title: 'Upcoming Deadlines', icon: <Clock size={20} />, color: 'bg-warning-100 dark:bg-warning-900/30 text-warning-600 dark:text-warning-400' },
          ].map((action, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
              className="cursor-pointer"
            >
              <Card className="hover:shadow-md transition-shadow duration-200">
                <CardContent className="p-4 flex items-center">
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mr-3", action.color)}>
                    {action.icon}
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">{action.title}</span>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}