import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { DndContext, DragOverlay, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { motion } from 'framer-motion';
import { MoreHorizontal, Plus, MessageSquare, Paperclip, UserPlus, Search, Lock, Users, Calendar } from 'lucide-react';
import Button from '../components/ui/Button';
import KanbanList from '../components/board/KanbanList';
import KanbanCard from '../components/board/KanbanCard';
import { cn } from '../utils/cn';

// Mock data for a board
const mockBoard = {
  id: '1',
  title: 'Product Roadmap',
  description: 'Plan and track our product development roadmap',
  lists: [
    {
      id: 'list-1',
      title: 'To Do',
      tasks: [
        {
          id: 'task-1',
          title: 'Research competitor features',
          description: 'Analyze top 5 competitors and create feature comparison',
          labels: [{ id: '1', name: 'Research', color: 'bg-purple-500' }],
          dueDate: '2025-05-15',
          assignees: [{ id: '1', name: 'Alex Smith', avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=40' }],
          comments: 3,
          attachments: 2,
        },
        {
          id: 'task-2',
          title: 'Create wireframes for new dashboard',
          description: 'Design initial wireframes for the analytics dashboard',
          labels: [{ id: '2', name: 'Design', color: 'bg-blue-500' }],
          dueDate: '2025-05-18',
          assignees: [{ id: '2', name: 'Jessica Chen', avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=40' }],
          comments: 1,
          attachments: 0,
        },
      ],
    },
    {
      id: 'list-2',
      title: 'In Progress',
      tasks: [
        {
          id: 'task-3',
          title: 'Implement user authentication flow',
          description: 'Create login, registration, and password reset functionality',
          labels: [{ id: '3', name: 'Development', color: 'bg-green-500' }],
          dueDate: '2025-05-20',
          assignees: [
            { id: '3', name: 'Mark Johnson', avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=40' },
            { id: '4', name: 'Sarah Lee', avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=40' },
          ],
          comments: 5,
          attachments: 1,
        },
      ],
    },
    {
      id: 'list-3',
      title: 'Review',
      tasks: [
        {
          id: 'task-4',
          title: 'API integration with payment gateway',
          description: 'Connect the application with Stripe for payment processing',
          labels: [
            { id: '3', name: 'Development', color: 'bg-green-500' },
            { id: '4', name: 'High Priority', color: 'bg-red-500' },
          ],
          dueDate: '2025-05-12',
          assignees: [{ id: '3', name: 'Mark Johnson', avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=40' }],
          comments: 2,
          attachments: 3,
        },
      ],
    },
    {
      id: 'list-4',
      title: 'Done',
      tasks: [
        {
          id: 'task-5',
          title: 'Create project documentation',
          description: 'Write comprehensive documentation for the API endpoints',
          labels: [
            { id: '5', name: 'Documentation', color: 'bg-yellow-500' },
          ],
          dueDate: '2025-05-10',
          assignees: [{ id: '1', name: 'Alex Smith', avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=40' }],
          comments: 0,
          attachments: 1,
        },
        {
          id: 'task-6',
          title: 'Design system setup',
          description: 'Set up a component library and design system',
          labels: [
            { id: '2', name: 'Design', color: 'bg-blue-500' },
          ],
          dueDate: '2025-05-05',
          assignees: [{ id: '2', name: 'Jessica Chen', avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=40' }],
          comments: 4,
          attachments: 2,
        },
      ],
    },
  ],
};

export default function BoardPage() {
  const { boardId } = useParams();
  const [board, setBoard] = useState(mockBoard);
  const [activeId, setActiveId] = useState(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };
  
  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);
    
    if (!over) return;
    
    if (active.id !== over.id) {
      // Handle list reordering
      if (active.id.toString().includes('list-') && over.id.toString().includes('list-')) {
        setBoard((prev) => {
          const oldIndex = prev.lists.findIndex((list) => list.id === active.id);
          const newIndex = prev.lists.findIndex((list) => list.id === over.id);
          
          return {
            ...prev,
            lists: arrayMove(prev.lists, oldIndex, newIndex),
          };
        });
      }
      
      // Handle task reordering or moving between lists
      // This would be more complex in a real implementation
    }
  };
  
  return (
    <div className="h-full flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Board header */}
      <header className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{board.title}</h1>
              <div className="flex items-center">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="flex items-center gap-1 text-gray-600 dark:text-gray-300"
                >
                  <Users size={16} />
                  <span>Share</span>
                </Button>
                <div className="h-5 border-r border-gray-300 dark:border-gray-600 mx-2"></div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="flex items-center gap-1 text-gray-600 dark:text-gray-300"
                >
                  <Lock size={16} />
                  <span>Private</span>
                </Button>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{board.description}</p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400" />
              </div>
              <input 
                type="text" 
                placeholder="Search tasks..."
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div className="flex -space-x-2">
              {['Alex', 'Jessica', 'Mark', 'Sarah'].map((name, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center text-white font-medium text-xs",
                    i === 0 ? "bg-primary-500" : 
                    i === 1 ? "bg-secondary-500" : 
                    i === 2 ? "bg-accent-500" : 
                    "bg-success-500"
                  )}
                >
                  {name.charAt(0)}
                </div>
              ))}
              <button className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300">
                <UserPlus size={14} />
              </button>
            </div>
            
            <Button size="sm" icon={<Calendar size={16} />} variant="outline">
              May 15
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              className="text-gray-600 dark:text-gray-300"
            >
              <MoreHorizontal size={18} />
            </Button>
          </div>
        </div>
      </header>
      
      {/* Board content */}
      <div className="flex-1 overflow-x-auto p-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-6 h-full">
            <SortableContext
              items={board.lists.map(list => list.id)}
              strategy={verticalListSortingStrategy}
            >
              {board.lists.map((list) => (
                <KanbanList
                  key={list.id}
                  id={list.id}
                  title={list.title}
                  tasks={list.tasks}
                />
              ))}
            </SortableContext>
            
            {/* Add new list button */}
            <div className="flex-shrink-0 w-72">
              <button className="w-full h-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center gap-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <Plus size={18} />
                <span>Add New List</span>
              </button>
            </div>
          </div>
          
          <DragOverlay>
            {activeId && activeId.toString().includes('task-') && (
              <KanbanCard
                task={board.lists
                  .flatMap(list => list.tasks)
                  .find(task => task.id === activeId)}
              />
            )}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}