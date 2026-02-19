import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth,
  isSameDay, addMonths, subMonths, parseISO, startOfWeek, endOfWeek, isToday
} from 'date-fns';
import TaskDetailModal from '@/components/tasks/TaskDetailModal';
import { Task } from '@/types';

const statusDot: Record<string, string> = {
  todo: 'bg-status-todo',
  'in-progress': 'bg-status-in-progress',
  review: 'bg-status-review',
  done: 'bg-status-done',
};

export default function CalendarPage() {
  const { tasks } = useApp();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getTasksForDay = (day: Date) =>
    tasks.filter(t => t.dueDate && isSameDay(parseISO(t.dueDate), day));

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
          <p className="text-sm text-muted-foreground">Tasks by due date</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-semibold w-32 text-center">{format(currentMonth, 'MMMM yyyy')}</span>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="px-2 py-3 text-center text-xs font-medium text-muted-foreground">{d}</div>
            ))}
          </div>
          {/* Days grid */}
          <div className="grid grid-cols-7">
            {days.map((day, i) => {
              const dayTasks = getTasksForDay(day);
              const inMonth = isSameMonth(day, currentMonth);
              return (
                <div
                  key={i}
                  className={`min-h-[100px] border-b border-r p-2 transition-colors ${!inMonth ? 'bg-muted/30' : ''} ${isToday(day) ? 'bg-primary/5' : ''}`}
                >
                  <span className={`text-xs font-medium ${!inMonth ? 'text-muted-foreground/40' : isToday(day) ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                    {format(day, 'd')}
                  </span>
                  <div className="mt-1 space-y-1">
                    {dayTasks.slice(0, 3).map(t => (
                      <button
                        key={t.id}
                        onClick={() => setSelectedTask(t)}
                        className="flex w-full items-center gap-1 rounded px-1 py-0.5 text-[10px] leading-tight hover:bg-muted transition-colors text-left"
                      >
                        <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${statusDot[t.status]}`} />
                        <span className="truncate">{t.title}</span>
                      </button>
                    ))}
                    {dayTasks.length > 3 && (
                      <span className="text-[10px] text-muted-foreground px-1">+{dayTasks.length - 3} more</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <TaskDetailModal task={selectedTask} open={!!selectedTask} onOpenChange={(open) => { if (!open) setSelectedTask(null); }} />
    </div>
  );
}
