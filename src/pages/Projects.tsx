import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Plus, Search, FolderKanban } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ProjectStatus, Priority } from '@/types';

const statusConfig: Record<ProjectStatus, { label: string; class: string }> = {
  active: { label: 'Active', class: 'bg-primary/10 text-primary border-primary/20' },
  'on-hold': { label: 'On Hold', class: 'bg-status-in-progress/10 text-status-in-progress border-status-in-progress/20' },
  completed: { label: 'Completed', class: 'bg-status-done/10 text-status-done border-status-done/20' },
  archived: { label: 'Archived', class: 'bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20' },
};

export default function Projects() {
  const { projects, tasks, addProject, deleteProject } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', description: '', status: 'active' as ProjectStatus, priority: 'medium' as Priority, dueDate: '' });

  const filtered = projects.filter(p => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const getTaskStats = (projectId: string) => {
    const projectTasks = tasks.filter(t => t.projectId === projectId);
    const done = projectTasks.filter(t => t.status === 'done').length;
    return { total: projectTasks.length, done, pct: projectTasks.length > 0 ? Math.round((done / projectTasks.length) * 100) : 0 };
  };

  const handleCreate = () => {
    if (!form.name.trim()) return;
    addProject(form);
    setCreateOpen(false);
    setForm({ name: '', description: '', status: 'active', priority: 'medium', dueDate: '' });
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-sm text-muted-foreground">{projects.length} projects total</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> New Project
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search projects..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="on-hold">On Hold</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Project grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FolderKanban className="mb-4 h-12 w-12 text-muted-foreground/40" />
          <h3 className="mb-1 text-lg font-semibold">No projects found</h3>
          <p className="mb-4 text-sm text-muted-foreground">Create your first project to get started.</p>
          <Button onClick={() => setCreateOpen(true)} className="gap-2"><Plus className="h-4 w-4" /> Create Project</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map(project => {
            const stats = getTaskStats(project.id);
            const sc = statusConfig[project.status];
            return (
              <Card key={project.id} className="border-0 shadow-sm transition-shadow hover:shadow-md cursor-pointer group">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-base font-semibold group-hover:text-primary transition-colors">{project.name}</h3>
                    <Badge variant="outline" className={`text-xs shrink-0 ${sc.class}`}>{sc.label}</Badge>
                  </div>
                  <p className="mb-4 text-sm text-muted-foreground line-clamp-2">{project.description}</p>
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-muted-foreground">{stats.done}/{stats.total} tasks</span>
                      <span className="text-xs font-medium">{stats.pct}%</span>
                    </div>
                    <Progress value={stats.pct} className="h-1.5" />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Due {project.dueDate ? format(parseISO(project.dueDate), 'MMM d') : '—'}</span>
                    <button className="text-destructive/60 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); setDeleteId(project.id); }}>
                      Delete
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Project</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Project name" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Brief description" />
            </div>
            <div className="grid grid-cols-2 gap-4">
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

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete project?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete the project and all its tasks.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deleteId) deleteProject(deleteId); setDeleteId(null); }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
