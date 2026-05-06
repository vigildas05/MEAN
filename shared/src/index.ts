export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done';
export type UserRole = 'admin' | 'member';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  memberIds: string[];
  createdAt: string;
}

export interface TaskComment {
  id: string;
  taskId: string;
  authorId: string;
  body: string;
  createdAt: string;
}

export interface ProjectTask {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  assigneeId?: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  comments: TaskComment[];
  createdAt: string;
  updatedAt: string;
}

export interface BoardStats {
  totalProjects: number;
  totalTasks: number;
  byStatus: Record<TaskStatus, number>;
}

export const taskStatuses: TaskStatus[] = ['todo', 'in-progress', 'review', 'done'];
