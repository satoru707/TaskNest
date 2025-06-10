import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Moon, Sun, ArrowRight, Menu, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import Button from '../components/ui/Button';
import { cn } from '../utils/cn';

export default function LandingPage() {
  const { isDarkMode, setTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const toggleTheme = () => {
    setTheme(isDarkMode ? 'light' : 'dark');
  };
  
  const features = [
    {
      title: 'Collaborative Boards',
      description: 'Create and organize tasks on flexible boards that your entire team can access and update in real-time.',
      icon: <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
      </svg>
    },
    {
      title: 'AI Task Generation',
      description: 'Leverage AI to automatically generate tasks and summaries based on your project goals and descriptions.',
      icon: <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    },
    {
      title: 'Role-Based Access',
      description: 'Control who can view, edit, or manage your projects with flexible permission settings for every team member.',
      icon: <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    },
    {
      title: 'Real-Time Updates',
      description: 'See changes instantly as they happen with seamless real-time synchronization across all devices and team members.',
      icon: <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
      </svg>
    },
  ];
  
  const plans = [
    {
      name: 'Free',
      price: '$0',
      description: 'Perfect for individuals and small teams just getting started.',
      features: [
        'Up to 3 boards',
        'Basic task management',
        'Limited file storage (100MB)',
        'Community support',
      ],
      cta: 'Get Started',
      highlighted: false,
    },
    {
      name: 'Pro',
      price: '$12',
      description: 'Ideal for growing teams that need more power and flexibility.',
      features: [
        'Unlimited boards',
        'Advanced task tracking',
        'Expanded file storage (10GB)',
        'AI task generation (100/month)',
        'Analytics dashboard',
        'Priority support',
      ],
      cta: 'Upgrade to Pro',
      highlighted: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'For organizations requiring advanced security and control.',
      features: [
        'Everything in Pro',
        'Unlimited storage',
        'SSO & advanced security',
        'Custom integrations',
        'Dedicated account manager',
        '24/7 phone support',
      ],
      cta: 'Contact Sales',
      highlighted: false,
    },
  ];
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-2">
              <span className="text-primary-600 dark:text-primary-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 9V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-1"/>
                  <path d="M2 13h10"/>
                  <path d="m9 16 3-3-3-3"/>
                  <path d="M12 19h9"/>
                </svg>
              </span>
              <span className="font-bold text-xl text-gray-900 dark:text-white">TaskNest</span>
            </div>
            
            {/* Desktop navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Pricing</a>
              <a href="#testimonials" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Testimonials</a>
              <button 
                onClick={toggleTheme} 
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </nav>
            
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/login">
                <Button variant="outline">Log in</Button>
              </Link>
              <Link to="/register">
                <Button>Sign up free</Button>
              </Link>
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-4">
              <button 
                onClick={toggleTheme} 
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
          
          {/* Mobile menu */}
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700"
            >
              <nav className="flex flex-col space-y-4 py-2">
                <a 
                  href="#features" 
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Features
                </a>
                <a 
                  href="#pricing" 
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Pricing
                </a>
                <a 
                  href="#testimonials" 
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Testimonials
                </a>
                <div className="flex flex-col space-y-2 px-4 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <Link to="/login" className="w-full">
                    <Button variant="outline" fullWidth>Log in</Button>
                  </Link>
                  <Link to="/register" className="w-full">
                    <Button fullWidth>Sign up free</Button>
                  </Link>
                </div>
              </nav>
            </motion.div>
          )}
        </div>
      </header>
      
      {/* Hero section */}
      <section className="relative overflow-hidden py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight"
            >
              Organize your tasks with <span className="text-primary-600 dark:text-primary-400">AI-powered</span> collaboration
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-6 text-xl text-gray-600 dark:text-gray-300"
            >
              TaskNest combines visual task management with intelligent AI assistance to streamline your workflow and boost productivity.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-10 flex flex-col sm:flex-row justify-center gap-4"
            >
              <Link to="/register">
                <Button size="lg" icon={<ArrowRight size={18} />} iconPosition="right">
                  Get Started Free
                </Button>
              </Link>
              <a href="#features">
                <Button variant="outline" size="lg">
                  Learn More
                </Button>
              </a>
            </motion.div>
          </div>
          
          {/* Hero image */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-16 relative mx-auto max-w-5xl"
          >
            <div className="aspect-[16/9] overflow-hidden rounded-xl shadow-xl ring-1 ring-gray-200 dark:ring-gray-700">
              <div className="bg-white dark:bg-gray-800 w-full h-full p-2">
                <div className="h-full w-full rounded-lg bg-gray-50 dark:bg-gray-900 overflow-hidden">
                  <div className="h-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-4">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 rounded-full bg-error-500"></div>
                      <div className="w-3 h-3 rounded-full bg-warning-500"></div>
                      <div className="w-3 h-3 rounded-full bg-success-500"></div>
                    </div>
                    <div className="mx-auto bg-gray-100 dark:bg-gray-700 rounded-full text-xs px-3 py-1 text-gray-600 dark:text-gray-300">
                      tasknest.app/dashboard
                    </div>
                  </div>
                  <div className="flex h-[calc(100%-2.5rem)]">
                    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4">
                      <div className="flex items-center mb-6">
                        <div className="w-8 h-8 rounded bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-400">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <div className="h-2.5 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className={cn(
                            "p-2 rounded",
                            i === 0 ? "bg-primary-50 dark:bg-primary-900/30" : "hover:bg-gray-100 dark:hover:bg-gray-700/50"
                          )}>
                            <div className="h-2 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex-1 p-6">
                      <div className="mb-6">
                        <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                        <div className="h-2 w-96 max-w-full bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                        <div className="h-2 w-80 max-w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
                            <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
                            {[...Array(3)].map((_, j) => (
                              <div key={j} className="mb-2 p-2 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
                                <div className="h-2 w-28 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                                <div className="h-2 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -z-10 inset-0 bg-gradient-to-tr from-primary-500/20 to-secondary-500/20 dark:from-primary-500/10 dark:to-secondary-500/10 transform -translate-y-1/2 translate-x-1/3 rounded-full blur-3xl"></div>
          </motion.div>
        </div>
        
        {/* Background decorations */}
        <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-950/30 dark:to-secondary-950/30 -z-10"></div>
        <div className="absolute -top-40 -right-40 h-80 w-80 bg-primary-100 dark:bg-primary-900/20 rounded-full blur-3xl opacity-70 dark:opacity-30 -z-10"></div>
        <div className="absolute top-60 -left-20 h-60 w-60 bg-secondary-100 dark:bg-secondary-900/20 rounded-full blur-3xl opacity-70 dark:opacity-30 -z-10"></div>
      </section>
      
      {/* Features section */}
      <section id="features" className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Powerful features for productive teams</h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              TaskNest combines the best aspects of Kanban boards, document collaboration, and AI assistance to create a unique task management experience.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-soft border border-gray-100 dark:border-gray-700"
              >
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center text-primary-600 dark:text-primary-400 mb-5">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
          
          {/* Feature details */}
          <div className="mt-24 grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">AI-Powered Task Generation</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Simply describe your project goals, and our AI will intelligently break them down into actionable tasks, saving you hours of planning time.
              </p>
              <ul className="space-y-3">
                {[
                  'Convert project descriptions into structured task lists',
                  'Generate subtasks and checklists automatically',
                  'Get smart task prioritization suggestions',
                  'Create AI-powered project summaries and reports'
                ].map((item, i) => (
                  <li key={i} className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-success-500 mr-2 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center">
                  <div className="h-2.5 w-2.5 rounded-full bg-error-500 mr-2"></div>
                  <div className="h-2.5 w-2.5 rounded-full bg-warning-500 mr-2"></div>
                  <div className="h-2.5 w-2.5 rounded-full bg-success-500 mr-2"></div>
                  <div className="ml-auto bg-gray-100 dark:bg-gray-700 rounded text-xs px-2 py-1 text-gray-600 dark:text-gray-300">
                    AI Assistant
                  </div>
                </div>
                <div className="p-6">
                  <div className="mb-4">
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 mb-4">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        I need to plan the launch of our new product by next month.
                      </p>
                    </div>
                    <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-3 border-l-4 border-primary-500">
                      <p className="text-sm text-gray-800 dark:text-gray-200 font-medium mb-3">
                        Here are the tasks for your product launch:
                      </p>
                      <ul className="space-y-2">
                        {[
                          'Finalize product features and documentation',
                          'Prepare marketing materials and press release',
                          'Set up analytics tracking for launch metrics',
                          'Schedule social media announcements',
                          'Organize launch event and team preparation'
                        ].map((task, i) => (
                          <li key={i} className="flex items-center">
                            <div className="h-4 w-4 border border-primary-500 rounded-sm mr-2 flex-shrink-0"></div>
                            <span className="text-sm text-gray-700 dark:text-gray-300">{task}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                        Would you like me to break these down into subtasks?
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="flex-1">
                      <div className="h-10 bg-gray-100 dark:bg-gray-700 rounded-lg"></div>
                    </div>
                    <button className="ml-2 p-2 bg-primary-500 text-white rounded-lg flex-shrink-0">
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
              <div className="absolute -z-10 -top-6 -right-6 h-32 w-32 bg-secondary-200 dark:bg-secondary-900/20 rounded-full blur-2xl opacity-70 dark:opacity-30"></div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Pricing section */}
      <section id="pricing" className="py-16 lg:py-24 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Simple, transparent pricing</h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Choose the plan that fits your team's needs, with no hidden fees or complicated tiers.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={cn(
                  "bg-white dark:bg-gray-800 rounded-xl shadow-soft overflow-hidden border",
                  plan.highlighted 
                    ? "border-primary-500 dark:border-primary-500 ring-1 ring-primary-500 dark:ring-primary-500" 
                    : "border-gray-100 dark:border-gray-700"
                )}
              >
                {plan.highlighted && (
                  <div className="bg-primary-500 py-1.5 text-center">
                    <p className="text-xs font-medium text-white uppercase tracking-wide">Most Popular</p>
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{plan.name}</h3>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                    {plan.price !== 'Custom' && (
                      <span className="ml-1 text-gray-500 dark:text-gray-400">/month</span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{plan.description}</p>
                  
                  <ul className="mt-6 space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-success-500 mr-2 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="mt-8">
                    <Link to="/register" className="w-full">
                      <Button 
                        fullWidth
                        variant={plan.highlighted ? 'primary' : 'outline'}
                      >
                        {plan.cta}
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Testimonials section */}
      <section id="testimonials" className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Loved by teams worldwide</h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              See how TaskNest is transforming how teams collaborate and manage their projects.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "TaskNest's AI feature saved us countless hours of planning. Now we can focus on execution rather than organization.",
                author: "Sarah Johnson",
                role: "Product Manager, Acme Inc.",
                avatar: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150",
              },
              {
                quote: "The best task management tool we've used. The real-time collaboration features are game-changing for our remote team.",
                author: "Michael Chen",
                role: "CTO, TechStart",
                avatar: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150",
              },
              {
                quote: "We've tried everything from Trello to Notion, but TaskNest combines the best features of all of them with powerful AI capabilities.",
                author: "Emily Rodriguez",
                role: "Creative Director, Design Co.",
                avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150",
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-soft border border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.author}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">{testimonial.author}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 italic">"{testimonial.quote}"</p>
                <div className="mt-4 flex">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="h-5 w-5 text-warning-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-primary-600 dark:bg-primary-900 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <svg className="absolute right-0 top-0 h-full w-full translate-x-1/2" width="404" height="784" fill="none" viewBox="0 0 404 784">
            <defs>
              <pattern id="pattern-squares" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <rect x="0" y="0" width="4" height="4" className="text-primary-500 dark:text-primary-800" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="404" height="784" fill="url(#pattern-squares)" />
          </svg>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-white">Ready to transform how your team works?</h2>
            <p className="mt-4 text-xl text-primary-100">
              Join thousands of teams using TaskNest to collaborate more effectively and achieve their goals faster.
            </p>
            <div className="mt-10">
              <Link to="/register">
                <Button size="lg" className="bg-white text-primary-600 hover:bg-primary-50">
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-primary-600 dark:text-primary-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 9V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-1"/>
                    <path d="M2 13h10"/>
                    <path d="m9 16 3-3-3-3"/>
                    <path d="M12 19h9"/>
                  </svg>
                </span>
                <span className="font-bold text-xl text-gray-900 dark:text-white">TaskNest</span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4 max-w-md">
                TaskNest combines Kanban boards, Notion-like flexibility, and AI-powered task generation to create the ultimate collaboration platform.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                  <span className="sr-only">GitHub</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Product</h3>
              <ul className="mt-4 space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Features</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Pricing</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Integrations</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Roadmap</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Company</h3>
              <ul className="mt-4 space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">About</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Blog</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Careers</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              &copy; {new Date().getFullYear()} TaskNest. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">Privacy</a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">Terms</a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}