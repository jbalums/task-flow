import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Task, TaskStatus, Priority, TaskLabel } from '@/types';
import KanbanBoard from '@/components/tasks/KanbanBoard';
import TaskDetailModal from '@/components/tasks/TaskDetailModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Plus, Search, LayoutGrid, List, CheckSquare, CheckCircle2
} from 'lucide-react';
import { format, parseISO, isPast, isToday } from 'date-fns';

const statusColors: Record<string, string> = {
  todo: 'bg-status-todo',
  'in-progress': 'bg-status-in-progress',
  review: 'bg-status-review',
  done: 'bg-status-done',
};

const priorityColors: Record<string, string> = {
  low: 'text-priority-low',
  medium: 'text-priority-medium',
  high: 'text-priority-high',
};

export default function Tasks() {
  const { tasks, projects, addTask, updateTask } = useApp();
  const [view, setView] = useState<'board' | 'list'>('board');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', projectId: projects[0]?.id || '', status: 'todo' as TaskStatus,
    priority: 'medium' as Priority, label: 'feature' as TaskLabel, dueDate: ''
  });

  const filtered = tasks.filter(t => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleCreate = () => {
    if (!form.title.trim()) return;
    if (!form.projectId && projects.length > 0) {
      setForm(f => ({ ...f, projectId: projects[0].id }));
    }
    if (!form.projectId && projects.length === 0) return;
    addTask({ ...form, projectId: form.projectId || projects[0]?.id });
    setCreateOpen(false);
    setForm({ title: '', description: '', projectId: projects[0]?.id || '', status: 'todo', priority: 'medium', label: 'feature', dueDate: '' });
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
          <p className="text-sm text-muted-foreground">{tasks.length} tasks across {projects.length} projects</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border p-0.5">
            <button onClick={() => setView('board')} className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${view === 'board' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button onClick={() => setView('list')} className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${view === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
              <List className="h-4 w-4" />
            </button>
          </div>
          <Button onClick={() => setCreateOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Add Task
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search tasks..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="review">Review</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <CheckSquare className="mb-4 h-12 w-12 text-muted-foreground/40" />
          <h3 className="mb-1 text-lg font-semibold">No tasks found</h3>
          <p className="mb-4 text-sm text-muted-foreground">Create a task to start tracking work.</p>
          <Button onClick={() => setCreateOpen(true)} className="gap-2"><Plus className="h-4 w-4" /> Create Task</Button>
        </div>
      ) : view === 'board' ? (
        <KanbanBoard tasks={filtered} onTaskClick={setSelectedTask} />
      ) : (
        /* List view */
        <div className="rounded-xl border bg-card">
          <div className="grid grid-cols-[1fr_100px_80px_80px_90px] gap-4 border-b px-4 py-2.5 text-xs font-medium text-muted-foreground">
            <span>Task</span><span>Status</span><span>Priority</span><span>Label</span><span>Due</span>
          </div>
          {filtered.map(task => {
            const isOverdue = task.status !== 'done' && isPast(parseISO(task.dueDate)) && !isToday(parseISO(task.dueDate));
            return (
              <div
                key={task.id}
                onClick={() => setSelectedTask(task)}
                className="grid grid-cols-[1fr_100px_80px_80px_90px] gap-4 items-center border-b last:border-0 px-4 py-3 text-sm cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); updateTask(task.id, { status: task.status === 'done' ? 'todo' : 'done' }); }}
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${task.status === 'done' ? 'border-status-done bg-status-done' : 'border-muted-foreground/30 hover:border-status-done'}`}
                  >
                    {task.status === 'done' && <CheckCircle2 className="h-3 w-3 text-card" />}
                  </button>
                  <span className={task.status === 'done' ? 'line-through text-muted-foreground' : 'font-medium'}>{task.title}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className={`h-2 w-2 rounded-full ${statusColors[task.status]}`} />
                  <span className="text-xs capitalize">{task.status.replace('-', ' ')}</span>
                </div>
                <span className={`text-xs font-medium capitalize ${priorityColors[task.priority]}`}>{task.priority}</span>
                <Badge variant="outline" className="text-[10px] capitalize w-fit">{task.label}</Badge>
                <span className={`text-xs ${isOverdue ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                  {task.dueDate ? format(parseISO(task.dueDate), 'MMM d') : '—'}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Task detail modal */}
      <TaskDetailModal task={selectedTask} open={!!selectedTask} onOpenChange={(open) => { if (!open) setSelectedTask(null); }} />

      {/* Create task dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Task</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Task title" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Details..." />
            </div>
            <div className="space-y-2">
              <Label>Project</Label>
              <Select value={form.projectId} onValueChange={v => setForm({ ...form, projectId: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={v => setForm({ ...form, priority: v as Priority })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Label</Label>
                <Select value={form.label} onValueChange={v => setForm({ ...form, label: v as TaskLabel })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="frontend">Frontend</SelectItem>
                    <SelectItem value="backend">Backend</SelectItem>
                    <SelectItem value="bug">Bug</SelectItem>
                    <SelectItem value="ui">UI</SelectItem>
                    <SelectItem value="feature">Feature</SelectItem>
                    <SelectItem value="docs">Docs</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
