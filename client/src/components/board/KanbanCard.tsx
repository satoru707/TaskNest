import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format } from 'date-fns';
import { MessageSquare, Paperclip, Calendar } from 'lucide-react';
import { cn } from '../../utils/cn';

interface KanbanCardProps {
  task: any;
}

export default function KanbanCard({ task }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'task',
    },
  });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md p-3 cursor-move transition-all",
        isDragging ? "opacity-50 z-10 shadow-md" : "opacity-100"
      )}
    >
      {/* Card labels */}
      {task.labels && task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {task.labels.map((label) => (
            <span 
              key={label.id} 
              className={cn(
                "text-xs font-medium px-2 py-0.5 rounded",
                label.color,
                label.color.includes('bg-purple') && 'text-purple-50',
                label.color.includes('bg-blue') && 'text-blue-50',
                label.color.includes('bg-green') && 'text-green-50',
                label.color.includes('bg-red') && 'text-red-50',
                label.color.includes('bg-yellow') && 'text-yellow-800',
              )}
            >
              {label.name}
            </span>
          ))}
        </div>
      )}
      
      {/* Card title */}
      <h4 className="font-medium text-gray-900 dark:text-white mb-1">
        {task.title}
      </h4>
      
      {/* Card description (truncated) */}
      {task.description && (
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}
      
      {/* Card meta */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-3">
          {task.dueDate && (
            <div className="flex items-center">
              <Calendar size={12} className="mr-1" />
              <span>{format(new Date(task.dueDate), 'MMM d')}</span>
            </div>
          )}
          
          {task.comments > 0 && (
            <div className="flex items-center">
              <MessageSquare size={12} className="mr-1" />
              <span>{task.comments}</span>
            </div>
          )}
          
          {task.attachments > 0 && (
            <div className="flex items-center">
              <Paperclip size={12} className="mr-1" />
              <span>{task.attachments}</span>
            </div>
          )}
        </div>
        
        {task.assignees && task.assignees.length > 0 && (
          <div className="flex -space-x-1">
            {task.assignees.map((assignee, index) => (
              <div 
                key={assignee.id}
                className="w-6 h-6 rounded-full border border-white dark:border-gray-800 overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-700 dark:text-gray-300"
              >
                {assignee.avatar ? (
                  <img 
                    src={assignee.avatar} 
                    alt={assignee.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  assignee.name.charAt(0)
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}