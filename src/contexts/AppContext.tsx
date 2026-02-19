import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Project, Task, Comment, ActivityLog, TaskStatus, Priority, ProjectStatus, TaskLabel } from '@/types';
import { demoProjects, demoTasks, demoComments, demoActivities } from '@/data/demoData';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

interface AppContextType {
  isDemo: boolean;
  user: User | null;
  authLoading: boolean;
  projects: Project[];
  tasks: Task[];
  comments: Comment[];
  activities: ActivityLog[];
  addProject: (p: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addTask: (t: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  addComment: (taskId: string, content: string) => void;
  resetDemo: () => void;
  enterDemo: () => void;
  exitDemo: () => void;
  signOut: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

let nextId = 100;
const genId = () => `demo-${nextId++}`;

// Helper to map DB rows to our local types
function mapProject(row: any): Project {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? '',
    status: row.status,
    priority: row.priority,
    dueDate: row.due_date ?? '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapTask(row: any): Task {
  return {
    id: row.id,
    projectId: row.project_id,
    title: row.title,
    description: row.description ?? '',
    status: row.status,
    priority: row.priority,
    label: row.label ?? 'feature',
    dueDate: row.due_date ?? '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapComment(row: any): Comment {
  return { id: row.id, taskId: row.task_id, content: row.content, createdAt: row.created_at };
}

function mapActivity(row: any): ActivityLog {
  return {
    id: row.id,
    entityType: row.entity_type as ActivityLog['entityType'],
    entityId: row.entity_id,
    action: row.action,
    description: row.description ?? '',
    createdAt: row.created_at,
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [isDemo, setIsDemo] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);

  // ---- Auth listener ----
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  // ---- Fetch data from DB when user is authenticated and not in demo ----
  useEffect(() => {
    if (isDemo || !user) return;
    const fetchAll = async () => {
      const [pRes, tRes, cRes, aRes] = await Promise.all([
        supabase.from('projects').select('*').order('created_at', { ascending: false }),
        supabase.from('tasks').select('*').order('created_at', { ascending: false }),
        supabase.from('comments').select('*').order('created_at', { ascending: true }),
        supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(50),
      ]);
      if (pRes.data) setProjects(pRes.data.map(mapProject));
      if (tRes.data) setTasks(tRes.data.map(mapTask));
      if (cRes.data) setComments(cRes.data.map(mapComment));
      if (aRes.data) setActivities(aRes.data.map(mapActivity));
    };
    fetchAll();
  }, [user, isDemo]);

  const now = () => new Date().toISOString();

  // ---- CRUD helpers: demo = in-memory, auth = Supabase ----
  const addProject = useCallback(async (p: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (isDemo || !user) {
      const newProject: Project = { ...p, id: genId(), createdAt: now(), updatedAt: now() };
      setProjects(prev => [newProject, ...prev]);
      setActivities(prev => [{ id: genId(), entityType: 'project', entityId: newProject.id, action: 'created', description: `Created project "${p.name}"`, createdAt: now() }, ...prev]);
      return;
    }
    const { data, error } = await supabase.from('projects').insert({
      name: p.name,
      description: p.description,
      status: p.status,
      priority: p.priority,
      due_date: p.dueDate || null,
      user_id: user.id,
    }).select().single();
    if (data) {
      setProjects(prev => [mapProject(data), ...prev]);
      // log activity
      const { data: logData } = await supabase.from('activity_logs').insert({
        user_id: user.id, entity_type: 'project', entity_id: data.id, action: 'created', description: `Created project "${p.name}"`,
      }).select().single();
      if (logData) setActivities(prev => [mapActivity(logData), ...prev]);
    }
  }, [isDemo, user]);

  const updateProject = useCallback(async (id: string, updates: Partial<Project>) => {
    if (isDemo || !user) {
      setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates, updatedAt: now() } : p));
      return;
    }
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
    if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate || null;
    const { data } = await supabase.from('projects').update(dbUpdates).eq('id', id).select().single();
    if (data) setProjects(prev => prev.map(p => p.id === id ? mapProject(data) : p));
  }, [isDemo, user]);

  const deleteProject = useCallback(async (id: string) => {
    if (isDemo || !user) {
      setProjects(prev => prev.filter(p => p.id !== id));
      setTasks(prev => prev.filter(t => t.projectId !== id));
      return;
    }
    // Delete tasks first (cascade not set up in DB)
    await supabase.from('tasks').delete().eq('project_id', id);
    await supabase.from('projects').delete().eq('id', id);
    setProjects(prev => prev.filter(p => p.id !== id));
    setTasks(prev => prev.filter(t => t.projectId !== id));
  }, [isDemo, user]);

  const addTask = useCallback(async (t: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (isDemo || !user) {
      const newTask: Task = { ...t, id: genId(), createdAt: now(), updatedAt: now() };
      setTasks(prev => [newTask, ...prev]);
      setActivities(prev => [{ id: genId(), entityType: 'task', entityId: newTask.id, action: 'created', description: `Created task "${t.title}"`, createdAt: now() }, ...prev]);
      return;
    }
    const { data, error } = await supabase.from('tasks').insert({
      title: t.title,
      description: t.description,
      status: t.status,
      priority: t.priority,
      label: t.label,
      due_date: t.dueDate || null,
      project_id: t.projectId,
      user_id: user.id,
    }).select().single();
    if (data) {
      setTasks(prev => [mapTask(data), ...prev]);
      const { data: logData } = await supabase.from('activity_logs').insert({
        user_id: user.id, entity_type: 'task', entity_id: data.id, action: 'created', description: `Created task "${t.title}"`,
      }).select().single();
      if (logData) setActivities(prev => [mapActivity(logData), ...prev]);
    }
  }, [isDemo, user]);

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    if (isDemo || !user) {
      setTasks(prev => prev.map(t => {
        if (t.id !== id) return t;
        const updated = { ...t, ...updates, updatedAt: now() };
        if (updates.status && updates.status !== t.status) {
          const action = updates.status === 'done' ? 'completed' : 'status_changed';
          const desc = updates.status === 'done'
            ? `Marked "${t.title}" as done`
            : `Moved "${t.title}" to ${updates.status.replace('-', ' ')}`;
          setActivities(prev => [{ id: genId(), entityType: 'task', entityId: id, action, description: desc, createdAt: now() }, ...prev]);
        }
        return updated;
      }));
      return;
    }
    const dbUpdates: any = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
    if (updates.label !== undefined) dbUpdates.label = updates.label;
    if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate || null;
    if (updates.projectId !== undefined) dbUpdates.project_id = updates.projectId;

    // Get old task for activity log
    const oldTask = tasks.find(t => t.id === id);

    const { data } = await supabase.from('tasks').update(dbUpdates).eq('id', id).select().single();
    if (data) {
      setTasks(prev => prev.map(t => t.id === id ? mapTask(data) : t));
      // Log status changes
      if (updates.status && oldTask && updates.status !== oldTask.status) {
        const action = updates.status === 'done' ? 'completed' : 'status_changed';
        const desc = updates.status === 'done'
          ? `Marked "${oldTask.title}" as done`
          : `Moved "${oldTask.title}" to ${updates.status.replace('-', ' ')}`;
        const { data: logData } = await supabase.from('activity_logs').insert({
          user_id: user.id, entity_type: 'task', entity_id: id, action, description: desc,
        }).select().single();
        if (logData) setActivities(prev => [mapActivity(logData), ...prev]);
      }
    }
  }, [isDemo, user, tasks]);

  const deleteTask = useCallback(async (id: string) => {
    if (isDemo || !user) {
      setTasks(prev => prev.filter(t => t.id !== id));
      setComments(prev => prev.filter(c => c.taskId !== id));
      return;
    }
    await supabase.from('comments').delete().eq('task_id', id);
    await supabase.from('tasks').delete().eq('id', id);
    setTasks(prev => prev.filter(t => t.id !== id));
    setComments(prev => prev.filter(c => c.taskId !== id));
  }, [isDemo, user]);

  const addComment = useCallback(async (taskId: string, content: string) => {
    if (isDemo || !user) {
      const c: Comment = { id: genId(), taskId, content, createdAt: now() };
      setComments(prev => [...prev, c]);
      return;
    }
    const { data } = await supabase.from('comments').insert({
      task_id: taskId, content, user_id: user.id,
    }).select().single();
    if (data) setComments(prev => [...prev, mapComment(data)]);
  }, [isDemo, user]);

  const resetDemo = useCallback(() => {
    nextId = 100;
    setProjects([...demoProjects]);
    setTasks([...demoTasks]);
    setComments([...demoComments]);
    setActivities([...demoActivities]);
  }, []);

  const enterDemo = useCallback(() => {
    setIsDemo(true);
    resetDemo();
  }, [resetDemo]);

  const exitDemo = useCallback(() => {
    setIsDemo(false);
    // Clear demo data; real data will load via useEffect if user is authenticated
    setProjects([]);
    setTasks([]);
    setComments([]);
    setActivities([]);
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsDemo(false);
    setProjects([]);
    setTasks([]);
    setComments([]);
    setActivities([]);
  }, []);

  return (
    <AppContext.Provider value={{ isDemo, user, authLoading, projects, tasks, comments, activities, addProject, updateProject, deleteProject, addTask, updateTask, deleteTask, addComment, resetDemo, enterDemo, exitDemo, signOut }}>
      {children}
    </AppContext.Provider>
  );
}
