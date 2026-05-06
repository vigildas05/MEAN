import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BoardStats, Project, ProjectTask, UserProfile } from '@platform/shared';

const isLocalhost = typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname);

const endpoints = {
  auth: isLocalhost ? 'http://localhost:4001/auth' : '/api/auth',
  tasks: isLocalhost ? 'http://localhost:4002' : '/api',
  users: isLocalhost ? 'http://localhost:4003' : '/api'
};

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  login(email: string, password: string): Observable<{ token: string; user: UserProfile }> {
    return this.http.post<{ token: string; user: UserProfile }>(`${endpoints.auth}/login`, { email, password });
  }

  register(name: string, email: string, password: string): Observable<{ token: string; user: UserProfile }> {
    return this.http.post<{ token: string; user: UserProfile }>(`${endpoints.auth}/register`, {
      name,
      email,
      password
    });
  }

  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(`${endpoints.tasks}/projects`);
  }

  createProject(payload: Pick<Project, 'name' | 'description'>): Observable<Project> {
    return this.http.post<Project>(`${endpoints.tasks}/projects`, payload);
  }

  getTasks(filters: { projectId?: string; status?: string; search?: string } = {}): Observable<ProjectTask[]> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params = params.set(key, value);
    });
    return this.http.get<ProjectTask[]>(`${endpoints.tasks}/tasks`, { params });
  }

  createTask(payload: Partial<ProjectTask> & { projectId: string; title: string }): Observable<ProjectTask> {
    return this.http.post<ProjectTask>(`${endpoints.tasks}/tasks`, payload);
  }

  updateTaskStatus(taskId: string, status: ProjectTask['status']): Observable<ProjectTask> {
    return this.http.patch<ProjectTask>(`${endpoints.tasks}/tasks/${taskId}/status`, { status });
  }

  addComment(taskId: string, body: string): Observable<ProjectTask> {
    return this.http.post<ProjectTask>(`${endpoints.tasks}/tasks/${taskId}/comments`, { body });
  }

  getStats(): Observable<BoardStats> {
    return this.http.get<BoardStats>(`${endpoints.tasks}/stats`);
  }

  getUsers(): Observable<UserProfile[]> {
    return this.http.get<UserProfile[]>(`${endpoints.users}/users`);
  }
}
