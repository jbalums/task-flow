export type ProjectStatus = 'active' | 'on-hold' | 'completed' | 'archived';
export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done';
export type Priority = 'low' | 'medium' | 'high';
export type TaskLabel = 'frontend' | 'backend' | 'bug' | 'ui' | 'feature' | 'docs';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  priority: Priority;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  label: TaskLabel;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  taskId: string;
  content: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  entityType: 'project' | 'task' | 'comment';
  entityId: string;
  action: string;
  description: string;
  createdAt: string;
}
