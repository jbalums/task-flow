import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useApp } from '@/contexts/AppContext';
import { Task, TaskStatus } from '@/types';
import { Badge } from '@/components/ui/badge';
import { format, parseISO, isPast, isToday } from 'date-fns';

const columns: { id: TaskStatus; label: string; color: string }[] = [
  { id: 'todo', label: 'To Do', color: 'bg-status-todo' },
  { id: 'in-progress', label: 'In Progress', color: 'bg-status-in-progress' },
  { id: 'review', label: 'Review', color: 'bg-status-review' },
  { id: 'done', label: 'Done', color: 'bg-status-done' },
];

const priorityColors: Record<string, string> = {
  low: 'bg-priority-low/10 text-priority-low border-priority-low/20',
  medium: 'bg-priority-medium/10 text-priority-medium border-priority-medium/20',
  high: 'bg-priority-high/10 text-priority-high border-priority-high/20',
};

interface Props {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export default function KanbanBoard({ tasks, onTaskClick }: Props) {
  const { updateTask } = useApp();

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const taskId = result.draggableId;
    const newStatus = result.destination.droppableId as TaskStatus;
    updateTask(taskId, { status: newStatus });
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {columns.map(col => {
          const colTasks = tasks.filter(t => t.status === col.id);
          return (
            <Droppable key={col.id} droppableId={col.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex w-72 shrink-0 flex-col rounded-xl p-3 transition-colors ${snapshot.isDraggingOver ? 'bg-primary/5' : 'bg-muted/50'}`}
                >
                  <div className="mb-3 flex items-center gap-2 px-1">
                    <div className={`h-2.5 w-2.5 rounded-full ${col.color}`} />
                    <span className="text-sm font-semibold">{col.label}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{colTasks.length}</span>
                  </div>
                  <div className="flex-1 space-y-2 min-h-[100px]">
                    {colTasks.map((task, index) => {
                      const isOverdue = task.status !== 'done' && isPast(parseISO(task.dueDate)) && !isToday(parseISO(task.dueDate));
                      return (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => onTaskClick(task)}
                              className={`rounded-lg border bg-card p-3 shadow-sm transition-shadow cursor-pointer hover:shadow-md ${snapshot.isDragging ? 'shadow-lg ring-2 ring-primary/20' : ''}`}
                            >
                              <p className="mb-2 text-sm font-medium leading-snug">{task.title}</p>
                              <div className="flex flex-wrap items-center gap-1.5">
                                <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${priorityColors[task.priority]}`}>
                                  {task.priority}
                                </Badge>
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize">{task.label}</Badge>
                                {task.dueDate && (
                                  <span className={`ml-auto text-[10px] ${isOverdue ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                                    {format(parseISO(task.dueDate), 'MMM d')}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          );
        })}
      </div>
    </DragDropContext>
  );
}
