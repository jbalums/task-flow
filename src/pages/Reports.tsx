import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { format, parseISO, isPast, isToday, subDays } from 'date-fns';

const priorityColors: Record<string, string> = {
  low: 'text-priority-low',
  medium: 'text-priority-medium',
  high: 'text-priority-high',
};

export default function Reports() {
  const { tasks, projects } = useApp();

  const overdueTasks = tasks.filter(t => t.status !== 'done' && isPast(parseISO(t.dueDate)) && !isToday(parseISO(t.dueDate)));
  const highPriorityTasks = tasks.filter(t => t.priority === 'high' && t.status !== 'done');

  // Completion trend (last 7 days)
  const trendData = Array.from({ length: 7 }, (_, i) => {
    const day = subDays(new Date(), 6 - i);
    const completed = tasks.filter(t => t.status === 'done' && format(parseISO(t.updatedAt), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')).length;
    return { day: format(day, 'EEE'), completed };
  });

  const statusData = [
    { name: 'To Do', value: tasks.filter(t => t.status === 'todo').length, color: 'hsl(217, 91%, 60%)' },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'in-progress').length, color: 'hsl(38, 92%, 50%)' },
    { name: 'Review', value: tasks.filter(t => t.status === 'review').length, color: 'hsl(271, 91%, 65%)' },
    { name: 'Done', value: tasks.filter(t => t.status === 'done').length, color: 'hsl(142, 71%, 45%)' },
  ];

  const exportCSV = () => {
    const headers = ['Title', 'Project', 'Status', 'Priority', 'Label', 'Due Date'];
    const rows = tasks.map(t => [
      t.title,
      projects.find(p => p.id === t.projectId)?.name || '',
      t.status,
      t.priority,
      t.label,
      t.dueDate
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'tasks-export.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-sm text-muted-foreground">Insights and analytics</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={exportCSV}>
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Completion Trend */}
        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle className="text-base">Completion Trend (7 Days)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="completed" fill="hsl(221, 83%, 53%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Breakdown */}
        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle className="text-base">Status Breakdown</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width={200} height={200}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value" stroke="none">
                  {statusData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="ml-4 space-y-2">
              {statusData.map(s => (
                <div key={s.name} className="flex items-center gap-2 text-xs">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-muted-foreground">{s.name}</span>
                  <span className="font-medium">{s.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Overdue Tasks */}
        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle className="text-base text-destructive">Overdue Tasks ({overdueTasks.length})</CardTitle></CardHeader>
          <CardContent>
            {overdueTasks.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No overdue tasks 🎉</p>
            ) : (
              <div className="space-y-2">
                {overdueTasks.map(t => (
                  <div key={t.id} className="flex items-center justify-between rounded-lg border p-3">
                    <span className="text-sm font-medium">{t.title}</span>
                    <span className="text-xs text-destructive">{format(parseISO(t.dueDate), 'MMM d')}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Priorities */}
        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle className="text-base">Top Priorities</CardTitle></CardHeader>
          <CardContent>
            {highPriorityTasks.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No high-priority tasks</p>
            ) : (
              <div className="space-y-2">
                {highPriorityTasks.map(t => (
                  <div key={t.id} className="flex items-center justify-between rounded-lg border p-3">
                    <span className="text-sm font-medium">{t.title}</span>
                    <Badge variant="outline" className="text-[10px] capitalize bg-priority-high/10 text-priority-high border-priority-high/20">High</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
