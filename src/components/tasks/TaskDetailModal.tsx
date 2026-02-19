import { Task, TaskStatus, Priority, TaskLabel } from '@/types';
import { useApp } from '@/contexts/AppContext';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { format, parseISO } from 'date-fns';
import { useState } from 'react';
import { MessageSquare, Calendar, Flag, Tag } from 'lucide-react';

interface Props {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function TaskDetailModal({ task, open, onOpenChange }: Props) {
  const { updateTask, comments, addComment, projects } = useApp();
  const [newComment, setNewComment] = useState('');

  if (!task) return null;

  const taskComments = comments.filter(c => c.taskId === task.id);
  const project = projects.find(p => p.id === task.projectId);

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    addComment(task.id, newComment);
    setNewComment('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg">{task.title}</DialogTitle>
          {project && <p className="text-xs text-muted-foreground">{project.name}</p>}
        </DialogHeader>

        <div className="space-y-5">
          {task.description && (
            <p className="text-sm text-muted-foreground">{task.description}</p>
          )}

          {/* Meta */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"><Flag className="h-3 w-3" /> Status</label>
              <Select value={task.status} onValueChange={(v) => updateTask(task.id, { status: v as TaskStatus })}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"><Flag className="h-3 w-3" /> Priority</label>
              <Select value={task.priority} onValueChange={(v) => updateTask(task.id, { priority: v as Priority })}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              Due {task.dueDate ? format(parseISO(task.dueDate), 'MMM d, yyyy') : '—'}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Tag className="h-3 w-3" />
              <Badge variant="outline" className="text-[10px] capitalize">{task.label}</Badge>
            </div>
          </div>

          {/* Comments */}
          <div>
            <h4 className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-3">
              <MessageSquare className="h-3 w-3" /> Comments ({taskComments.length})
            </h4>
            <div className="space-y-3 max-h-40 overflow-y-auto">
              {taskComments.map(c => (
                <div key={c.id} className="rounded-lg bg-muted p-3">
                  <p className="text-sm">{c.content}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">{format(parseISO(c.createdAt), 'MMM d, h:mm a')}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <Textarea
                placeholder="Add a comment..."
                className="text-sm min-h-[60px]"
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
              />
            </div>
            <Button size="sm" className="mt-2" onClick={handleAddComment} disabled={!newComment.trim()}>
              Comment
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
