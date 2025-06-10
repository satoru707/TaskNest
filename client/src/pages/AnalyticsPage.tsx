import { useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { BarChart3, Calendar, PieChart as PieChartIcon, TrendingUp, Users, Filter } from 'lucide-react';
import Button from '../components/ui/Button';
import { cn } from '../utils/cn';

// Mock data for the analytics
const taskCompletionData = [
  { name: 'Mon', completed: 4, total: 5 },
  { name: 'Tue', completed: 6, total: 8 },
  { name: 'Wed', completed: 5, total: 7 },
  { name: 'Thu', completed: 8, total: 9 },
  { name: 'Fri', completed: 7, total: 10 },
  { name: 'Sat', completed: 3, total: 5 },
  { name: 'Sun', completed: 2, total: 3 },
];

const taskDistributionData = [
  { name: 'To Do', value: 12, color: '#94a3b8' },
  { name: 'In Progress', value: 8, color: '#60a5fa' },
  { name: 'Review', value: 5, color: '#fbbf24' },
  { name: 'Done', value: 18, color: '#34d399' },
];

const teamPerformanceData = [
  { name: 'Alex', tasks: 15, completed: 12 },
  { name: 'Jessica', tasks: 20, completed: 17 },
  { name: 'Mark', tasks: 18, completed: 14 },
  { name: 'Sarah', tasks: 12, completed: 10 },
];

const weeklyActivityData = [
  { name: 'Week 1', tasks: 15, comments: 8 },
  { name: 'Week 2', tasks: 20, comments: 12 },
  { name: 'Week 3', tasks: 25, comments: 18 },
  { name: 'Week 4', tasks: 18, comments: 15 },
];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('week');
  
  const handleTimeRangeChange = (range: string) => {
    setTimeRange(range);
  };
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Track your team's productivity and task completion metrics.</p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-l-lg focus:z-10",
                timeRange === 'week' 
                  ? "bg-primary-600 text-white hover:bg-primary-700" 
                  : "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              )}
              onClick={() => handleTimeRangeChange('week')}
            >
              Week
            </button>
            <button
              type="button"
              className={cn(
                "px-4 py-2 text-sm font-medium border-t border-b focus:z-10",
                timeRange === 'month' 
                  ? "bg-primary-600 text-white hover:bg-primary-700 border-primary-600" 
                  : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              )}
              onClick={() => handleTimeRangeChange('month')}
            >
              Month
            </button>
            <button
              type="button"
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-r-lg focus:z-10",
                timeRange === 'year' 
                  ? "bg-primary-600 text-white hover:bg-primary-700" 
                  : "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              )}
              onClick={() => handleTimeRangeChange('year')}
            >
              Year
            </button>
          </div>
          <Button variant="outline" size="sm" icon={<Filter size={16} />}>
            Filter
          </Button>
          <Button variant="outline" size="sm" icon={<Calendar size={16} />}>
            May 8 - May 14
          </Button>
        </div>
      </div>
      
      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { title: 'Total Tasks', value: '43', icon: <BarChart3 size={20} />, change: '+12%', changeType: 'increase', color: 'text-primary-600 dark:text-primary-400' },
          { title: 'Completion Rate', value: '76%', icon: <PieChartIcon size={20} />, change: '+5%', changeType: 'increase', color: 'text-secondary-600 dark:text-secondary-400' },
          { title: 'Active Members', value: '8', icon: <Users size={20} />, change: '+2', changeType: 'increase', color: 'text-accent-600 dark:text-accent-400' },
          { title: 'Productivity Score', value: '8.4', icon: <TrendingUp size={20} />, change: '+0.6', changeType: 'increase', color: 'text-success-600 dark:text-success-400' },
        ].map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className={cn(
                  "w-12 h-12 rounded-lg flex items-center justify-center mr-4",
                  index === 0 ? "bg-primary-100 dark:bg-primary-900/30" : 
                  index === 1 ? "bg-secondary-100 dark:bg-secondary-900/30" : 
                  index === 2 ? "bg-accent-100 dark:bg-accent-900/30" : 
                  "bg-success-100 dark:bg-success-900/30"
                )}>
                  <span className={stat.color}>{stat.icon}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.title}</p>
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
        ))}
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Task Completion Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Task Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={taskCompletionData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.1} />
                  <XAxis dataKey="name" tick={{ fill: '#6B7280' }} />
                  <YAxis tick={{ fill: '#6B7280' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      borderColor: '#374151',
                      color: '#E5E7EB' 
                    }}
                  />
                  <Legend />
                  <Bar dataKey="total" name="Total Tasks" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="completed" name="Completed" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Team Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Team Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={teamPerformanceData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.1} />
                  <XAxis type="number" tick={{ fill: '#6B7280' }} />
                  <YAxis dataKey="name" type="category" tick={{ fill: '#6B7280' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      borderColor: '#374151',
                      color: '#E5E7EB' 
                    }}
                  />
                  <Legend />
                  <Bar dataKey="tasks" name="Assigned Tasks" fill="#94a3b8" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="completed" name="Completed Tasks" fill="#10B981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={weeklyActivityData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.1} />
                  <XAxis dataKey="name" tick={{ fill: '#6B7280' }} />
                  <YAxis tick={{ fill: '#6B7280' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      borderColor: '#374151',
                      color: '#E5E7EB' 
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="tasks" name="Tasks Created" stroke="#4F46E5" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="comments" name="Comments" stroke="#14B8A6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Task Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Task Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {taskDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      borderColor: '#374151',
                      color: '#E5E7EB' 
                    }}
                    formatter={(value) => [`${value} Tasks`, '']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}