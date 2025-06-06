import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { MoreHorizontal, Plus } from 'lucide-react';
import KanbanCard from './KanbanCard';
import { cn } from '../../utils/cn';

interface KanbanListProps {
  id: string;
  title: string;
  tasks: any[];
}

export default function KanbanList({ id, title, tasks }: KanbanListProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    data: {
      type: 'list',
    },
  });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  const listColors = {
    'To Do': 'bg-gray-100 dark:bg-gray-700',
    'In Progress': 'bg-blue-100 dark:bg-blue-900/30',
    'Review': 'bg-yellow-100 dark:bg-yellow-900/30',
    'Done': 'bg-green-100 dark:bg-green-900/30',
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex-shrink-0 w-72 h-full flex flex-col rounded-lg bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700",
        isDragging && "opacity-50 z-10"
      )}
    >
      {/* List header */}
      <div
        {...attributes}
        {...listeners}
        className="p-3 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 cursor-move"
      >
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-3 h-3 rounded-full",
            listColors[title] || 'bg-gray-300 dark:bg-gray-600'
          )}></div>
          <h3 className="font-medium text-gray-900 dark:text-white">{title}</h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">{tasks.length}</span>
        </div>
        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <MoreHorizontal size={18} />
        </button>
      </div>
      
      {/* List content */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3">
        {tasks.map((task) => (
          <KanbanCard key={task.id} task={task} />
        ))}
      </div>
      
      {/* Add card button */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700">
        <button className="w-full py-2 rounded-md flex items-center justify-center gap-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <Plus size={16} />
          <span>Add a card</span>
        </button>
      </div>
    </motion.div>
  );
}