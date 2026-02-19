import { Project, Task, ActivityLog, Comment } from '@/types';
import { format, subDays, addDays } from 'date-fns';

const today = new Date();
const fmt = (d: Date) => format(d, 'yyyy-MM-dd');
const fmtISO = (d: Date) => d.toISOString();

export const demoProjects: Project[] = [
  {
    id: 'p1',
    name: 'Website Redesign',
    description: 'Complete overhaul of the company website with new branding, improved UX, and mobile-first design.',
    status: 'active',
    priority: 'high',
    dueDate: fmt(addDays(today, 14)),
    createdAt: fmtISO(subDays(today, 30)),
    updatedAt: fmtISO(subDays(today, 1)),
  },
  {
    id: 'p2',
    name: 'Mobile App v2',
    description: 'Second version of the mobile application with offline support, push notifications, and dark mode.',
    status: 'active',
    priority: 'high',
    dueDate: fmt(addDays(today, 28)),
    createdAt: fmtISO(subDays(today, 45)),
    updatedAt: fmtISO(subDays(today, 2)),
  },
  {
    id: 'p3',
    name: 'API Integration',
    description: 'Integrate third-party payment processor and analytics SDK into the platform.',
    status: 'on-hold',
    priority: 'medium',
    dueDate: fmt(addDays(today, 7)),
    createdAt: fmtISO(subDays(today, 20)),
    updatedAt: fmtISO(subDays(today, 5)),
  },
  {
    id: 'p4',
    name: 'Documentation Hub',
    description: 'Build a comprehensive documentation site with versioning and search.',
    status: 'completed',
    priority: 'low',
    dueDate: fmt(subDays(today, 3)),
    createdAt: fmtISO(subDays(today, 60)),
    updatedAt: fmtISO(subDays(today, 3)),
  },
  {
    id: 'p5',
    name: 'Q1 Marketing Campaign',
    description: 'Launch marketing campaign including landing pages, email sequences, and ad creatives.',
    status: 'active',
    priority: 'medium',
    dueDate: fmt(addDays(today, 21)),
    createdAt: fmtISO(subDays(today, 15)),
    updatedAt: fmtISO(today),
  },
];

export const demoTasks: Task[] = [
  // Website Redesign tasks
  { id: 't1', projectId: 'p1', title: 'Design new homepage wireframes', description: 'Create wireframes for the new homepage layout with hero section and feature highlights.', status: 'done', priority: 'high', label: 'ui', dueDate: fmt(subDays(today, 5)), createdAt: fmtISO(subDays(today, 28)), updatedAt: fmtISO(subDays(today, 5)) },
  { id: 't2', projectId: 'p1', title: 'Implement responsive navigation', description: 'Build the main navigation component with mobile hamburger menu and dropdown support.', status: 'done', priority: 'high', label: 'frontend', dueDate: fmt(subDays(today, 2)), createdAt: fmtISO(subDays(today, 20)), updatedAt: fmtISO(subDays(today, 2)) },
  { id: 't3', projectId: 'p1', title: 'Build hero section', description: 'Implement the animated hero section with CTA buttons and background imagery.', status: 'in-progress', priority: 'high', label: 'frontend', dueDate: fmt(addDays(today, 2)), createdAt: fmtISO(subDays(today, 10)), updatedAt: fmtISO(today) },
  { id: 't4', projectId: 'p1', title: 'Create testimonials component', description: 'Design and build the customer testimonials carousel section.', status: 'todo', priority: 'medium', label: 'ui', dueDate: fmt(addDays(today, 5)), createdAt: fmtISO(subDays(today, 7)), updatedAt: fmtISO(subDays(today, 7)) },
  { id: 't5', projectId: 'p1', title: 'Fix footer alignment issue', description: 'Footer links are misaligned on tablet devices. Needs CSS grid adjustment.', status: 'review', priority: 'low', label: 'bug', dueDate: fmt(today), createdAt: fmtISO(subDays(today, 3)), updatedAt: fmtISO(today) },

  // Mobile App v2 tasks
  { id: 't6', projectId: 'p2', title: 'Implement offline data sync', description: 'Add IndexedDB caching layer for offline-first architecture.', status: 'in-progress', priority: 'high', label: 'backend', dueDate: fmt(addDays(today, 5)), createdAt: fmtISO(subDays(today, 14)), updatedAt: fmtISO(subDays(today, 1)) },
  { id: 't7', projectId: 'p2', title: 'Push notification service', description: 'Set up Firebase Cloud Messaging for push notifications.', status: 'todo', priority: 'high', label: 'backend', dueDate: fmt(addDays(today, 10)), createdAt: fmtISO(subDays(today, 10)), updatedAt: fmtISO(subDays(today, 10)) },
  { id: 't8', projectId: 'p2', title: 'Dark mode theming', description: 'Implement dark mode with system preference detection and manual toggle.', status: 'todo', priority: 'medium', label: 'frontend', dueDate: fmt(addDays(today, 12)), createdAt: fmtISO(subDays(today, 8)), updatedAt: fmtISO(subDays(today, 8)) },
  { id: 't9', projectId: 'p2', title: 'Performance audit', description: 'Run Lighthouse audit and optimize critical rendering path.', status: 'review', priority: 'medium', label: 'frontend', dueDate: fmt(addDays(today, 1)), createdAt: fmtISO(subDays(today, 5)), updatedAt: fmtISO(subDays(today, 1)) },

  // API Integration tasks
  { id: 't10', projectId: 'p3', title: 'Stripe webhook handler', description: 'Implement webhook endpoints for payment events.', status: 'in-progress', priority: 'high', label: 'backend', dueDate: fmt(addDays(today, 3)), createdAt: fmtISO(subDays(today, 12)), updatedAt: fmtISO(subDays(today, 2)) },
  { id: 't11', projectId: 'p3', title: 'Analytics SDK setup', description: 'Integrate Mixpanel SDK with event tracking utilities.', status: 'todo', priority: 'medium', label: 'backend', dueDate: fmt(addDays(today, 6)), createdAt: fmtISO(subDays(today, 8)), updatedAt: fmtISO(subDays(today, 8)) },

  // Documentation Hub tasks
  { id: 't12', projectId: 'p4', title: 'Write API reference docs', description: 'Document all REST API endpoints with examples.', status: 'done', priority: 'high', label: 'docs', dueDate: fmt(subDays(today, 7)), createdAt: fmtISO(subDays(today, 30)), updatedAt: fmtISO(subDays(today, 7)) },
  { id: 't13', projectId: 'p4', title: 'Setup search functionality', description: 'Implement full-text search across documentation pages.', status: 'done', priority: 'medium', label: 'feature', dueDate: fmt(subDays(today, 5)), createdAt: fmtISO(subDays(today, 25)), updatedAt: fmtISO(subDays(today, 5)) },

  // Marketing Campaign tasks
  { id: 't14', projectId: 'p5', title: 'Design landing page mockups', description: 'Create 3 landing page variations for A/B testing.', status: 'in-progress', priority: 'high', label: 'ui', dueDate: fmt(addDays(today, 3)), createdAt: fmtISO(subDays(today, 10)), updatedAt: fmtISO(today) },
  { id: 't15', projectId: 'p5', title: 'Write email sequence copy', description: 'Draft 5-email nurture sequence for campaign leads.', status: 'todo', priority: 'medium', label: 'docs', dueDate: fmt(addDays(today, 7)), createdAt: fmtISO(subDays(today, 8)), updatedAt: fmtISO(subDays(today, 8)) },
  { id: 't16', projectId: 'p5', title: 'Setup tracking pixels', description: 'Configure Facebook Pixel and Google Tag Manager for conversion tracking.', status: 'todo', priority: 'low', label: 'backend', dueDate: fmt(addDays(today, 14)), createdAt: fmtISO(subDays(today, 5)), updatedAt: fmtISO(subDays(today, 5)) },

  // Overdue task
  { id: 't17', projectId: 'p1', title: 'Update color palette', description: 'Refresh brand colors based on new style guide from design team.', status: 'todo', priority: 'high', label: 'ui', dueDate: fmt(subDays(today, 2)), createdAt: fmtISO(subDays(today, 10)), updatedAt: fmtISO(subDays(today, 2)) },
];

export const demoComments: Comment[] = [
  { id: 'c1', taskId: 't3', content: 'Looking great! Can we add a subtle parallax effect to the background?', createdAt: fmtISO(subDays(today, 1)) },
  { id: 'c2', taskId: 't3', content: 'Good idea. I\'ll prototype it and share a preview.', createdAt: fmtISO(today) },
  { id: 'c3', taskId: 't6', content: 'Consider using Dexie.js for the IndexedDB abstraction layer.', createdAt: fmtISO(subDays(today, 3)) },
  { id: 'c4', taskId: 't10', content: 'Webhook signature verification is implemented. Ready for review.', createdAt: fmtISO(subDays(today, 1)) },
  { id: 'c5', taskId: 't14', content: 'First mockup is ready. Check Figma for details.', createdAt: fmtISO(today) },
];

export const demoActivities: ActivityLog[] = [
  { id: 'a1', entityType: 'task', entityId: 't1', action: 'completed', description: 'Marked "Design new homepage wireframes" as done', createdAt: fmtISO(subDays(today, 5)) },
  { id: 'a2', entityType: 'task', entityId: 't2', action: 'completed', description: 'Marked "Implement responsive navigation" as done', createdAt: fmtISO(subDays(today, 2)) },
  { id: 'a3', entityType: 'project', entityId: 'p4', action: 'completed', description: 'Project "Documentation Hub" marked as completed', createdAt: fmtISO(subDays(today, 3)) },
  { id: 'a4', entityType: 'task', entityId: 't3', action: 'status_changed', description: 'Moved "Build hero section" to In Progress', createdAt: fmtISO(subDays(today, 1)) },
  { id: 'a5', entityType: 'task', entityId: 't14', action: 'created', description: 'Created task "Design landing page mockups"', createdAt: fmtISO(subDays(today, 10)) },
  { id: 'a6', entityType: 'comment', entityId: 'c1', action: 'created', description: 'New comment on "Build hero section"', createdAt: fmtISO(subDays(today, 1)) },
  { id: 'a7', entityType: 'task', entityId: 't5', action: 'status_changed', description: 'Moved "Fix footer alignment issue" to Review', createdAt: fmtISO(today) },
  { id: 'a8', entityType: 'project', entityId: 'p5', action: 'created', description: 'Created project "Q1 Marketing Campaign"', createdAt: fmtISO(subDays(today, 15)) },
  { id: 'a9', entityType: 'task', entityId: 't10', action: 'status_changed', description: 'Moved "Stripe webhook handler" to In Progress', createdAt: fmtISO(subDays(today, 2)) },
  { id: 'a10', entityType: 'task', entityId: 't17', action: 'created', description: 'Created task "Update color palette"', createdAt: fmtISO(subDays(today, 10)) },
];
