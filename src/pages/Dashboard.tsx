import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FolderKanban, CheckSquare, Clock, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { format, isToday, isPast, parseISO } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useEffect } from 'react';

const statusColors: Record<string, string> = {
  todo: 'bg-status-todo',
  'in-progress': 'bg-status-in-progress',
  review: 'bg-status-review',
  done: 'bg-status-done',
};

const statusLabels: Record<string, string> = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  review: 'Review',
  done: 'Done',
};

export default function Dashboard() {
  const { projects, tasks, activities, updateTask } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const activeProjects = projects.filter(p => p.status === 'active').length;
  const activeTasks = tasks.filter(t => t.status !== 'done').length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const overdueTasks = tasks.filter(t => t.status !== 'done' && isPast(parseISO(t.dueDate)) && !isToday(parseISO(t.dueDate))).length;
  const todayTasks = tasks.filter(t => t.status !== 'done' && isToday(parseISO(t.dueDate)));

  const statusData = [
    { name: 'To Do', value: tasks.filter(t => t.status === 'todo').length, color: 'hsl(217, 91%, 60%)' },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'in-progress').length, color: 'hsl(38, 92%, 50%)' },
    { name: 'Review', value: tasks.filter(t => t.status === 'review').length, color: 'hsl(271, 91%, 65%)' },
    { name: 'Done', value: tasks.filter(t => t.status === 'done').length, color: 'hsl(142, 71%, 45%)' },
  ];

  const completionPct = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  const kpis = [
    { label: 'Total Projects', value: projects.length, icon: FolderKanban, color: 'text-primary' },
    { label: 'Active Tasks', value: activeTasks, icon: CheckSquare, color: 'text-status-in-progress' },
    { label: 'Completed', value: completedTasks, icon: CheckCircle2, color: 'text-status-done' },
    { label: 'Overdue', value: overdueTasks, icon: AlertTriangle, color: 'text-destructive' },
  ];

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Skeleton className="h-72 rounded-xl lg:col-span-2" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Welcome back. Here's your overview.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map(kpi => (
          <Card key={kpi.label} className="border-0 shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`rounded-xl bg-muted p-3 ${kpi.color}`}>
                <kpi.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{kpi.value}</p>
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Today's Tasks */}
        <Card className="border-0 shadow-sm lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" /> Due Today
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate('/app/tasks')}>
              View all <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {todayTasks.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                🎉 No tasks due today. You're all caught up!
              </div>
            ) : (
              todayTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateTask(task.id, { status: 'done' })}
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-muted-foreground/30 transition-colors hover:border-status-done hover:bg-status-done/10"
                    >
                      <CheckCircle2 className="h-3 w-3 text-transparent hover:text-status-done" />
                    </button>
                    <span className="text-sm font-medium">{task.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs capitalize">{task.label}</Badge>
                    <div className={`h-2 w-2 rounded-full ${statusColors[task.status]}`} />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Workload Chart */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Workload by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <div className="relative">
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value" stroke="none">
                      {statusData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold">{completionPct}%</span>
                  <span className="text-xs text-muted-foreground">Complete</span>
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {statusData.map(s => (
                <div key={s.name} className="flex items-center gap-2 text-xs">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-muted-foreground">{s.name}</span>
                  <span className="ml-auto font-medium">{s.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Timeline */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.slice(0, 8).map((a, i) => (
              <div key={a.id} className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-primary shrink-0" />
                <div className="flex-1">
                  <p className="text-sm">{a.description}</p>
                  <p className="text-xs text-muted-foreground">{format(parseISO(a.createdAt), 'MMM d, h:mm a')}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
