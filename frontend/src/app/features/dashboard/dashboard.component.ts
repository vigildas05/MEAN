import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Project, ProjectTask, taskStatuses, UserProfile } from '@platform/shared';
import { ApiService } from '../../core/api.service';

const statusLabels: Record<ProjectTask['status'], string> = {
  todo: 'Todo',
  'in-progress': 'In Progress',
  review: 'Review',
  done: 'Done'
};

type ApiProject = Project & { _id?: string };
type ApiTask = ProjectTask & { _id?: string };

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FormsModule],
  template: `
    <section class="workspace">
      <aside class="sidebar">
        <div class="brand-block">
          <div class="brand-mark">P</div>
          <div>
            <p class="eyebrow">Project Platform</p>
            <h1>Delivery Board</h1>
          </div>
        </div>
        <nav>
          <button class="active">Board</button>
          <button>Projects</button>
          <button>Reports</button>
        </nav>
        <button class="secondary" (click)="logout()">Logout</button>
      </aside>

      <section class="content">
        <header class="toolbar">
          <div>
            <p class="eyebrow">Microservices Dashboard</p>
            <h2>Plan, assign, review, and ship work</h2>
          </div>
          <div class="toolbar-actions">
            <input placeholder="Search tasks" [(ngModel)]="search" (input)="loadTasks()" />
            <button (click)="loadAll()">Refresh</button>
          </div>
        </header>

        <section class="metrics">
          <article>
            <span>Total projects</span>
            <strong>{{ projects().length }}</strong>
            <small>Active workspaces</small>
          </article>
          <article>
            <span>Total tasks</span>
            <strong>{{ tasks().length }}</strong>
            <small>Across all stages</small>
          </article>
          <article>
            <span>In review</span>
            <strong>{{ countByStatus('review') }}</strong>
            <small>Ready for feedback</small>
          </article>
          <article>
            <span>Done</span>
            <strong>{{ countByStatus('done') }}</strong>
            <small>Recently shipped</small>
          </article>
        </section>

        <section class="create-row">
          <form (ngSubmit)="createProject()">
            <input name="projectName" placeholder="New project name" [(ngModel)]="projectName" required />
            <button type="submit">Create project</button>
          </form>
          <form (ngSubmit)="createTask()">
            <input name="taskTitle" placeholder="New task title" [(ngModel)]="taskTitle" required />
            <select name="project" [(ngModel)]="selectedProjectId" required>
              @for (project of projects(); track project.id || project._id) {
                <option [value]="project.id || project._id">{{ project.name }}</option>
              }
            </select>
            <button type="submit">Add task</button>
          </form>
        </section>

        <section class="board">
          @for (status of statuses; track status) {
            <article class="column {{ status }}">
              <header>
                <h3>{{ statusLabels[status] }}</h3>
                <span>{{ grouped()[status].length }}</span>
              </header>
              @for (task of grouped()[status]; track task.id || task._id) {
                <div class="task-card">
                  <div>
                    <strong>{{ task.title }}</strong>
                    <p>{{ task.description || 'No description yet' }}</p>
                  </div>
                  <div class="task-meta">
                    <span class="priority">{{ task.priority }}</span>
                    <span class="comment-count">{{ task.comments.length }} comments</span>
                    <select [ngModel]="task.status" (ngModelChange)="moveTask(task, $event)">
                      @for (target of statuses; track target) {
                        <option [value]="target">{{ statusLabels[target] }}</option>
                      }
                    </select>
                  </div>
                  <form class="comment-form" (ngSubmit)="addComment(task)">
                    <input name="comment-{{ task.id || task._id }}" placeholder="Add comment" [(ngModel)]="commentDrafts[task.id || task._id]" />
                    <button type="submit">Comment</button>
                  </form>
                </div>
              } @empty {
                <p class="empty">No tasks</p>
              }
            </article>
          }
        </section>
      </section>
    </section>
  `
})
export class DashboardComponent {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  statuses = taskStatuses;
  statusLabels = statusLabels;
  projects = signal<ApiProject[]>([]);
  tasks = signal<ApiTask[]>([]);
  users = signal<UserProfile[]>([]);
  search = '';
  projectName = '';
  taskTitle = '';
  selectedProjectId = '';
  commentDrafts: Record<string, string> = {};

  grouped = computed(() => {
    const buckets: Record<ProjectTask['status'], ApiTask[]> = {
      todo: [],
      'in-progress': [],
      review: [],
      done: []
    };
    this.tasks().forEach((task) => buckets[task.status].push(task));
    return buckets;
  });

  constructor() {
    if (!localStorage.getItem('token')) {
      this.router.navigateByUrl('/login');
      return;
    }

    this.loadAll();
  }

  loadAll() {
    this.api.getProjects().subscribe((projects) => {
      this.projects.set(projects);
      this.selectedProjectId = this.selectedProjectId || projects[0]?.id || (projects[0] as Project & { _id?: string })?._id || '';
    });
    this.api.getUsers().subscribe((users) => this.users.set(users));
    this.loadTasks();
  }

  loadTasks() {
    this.api.getTasks({ search: this.search }).subscribe((tasks) => this.tasks.set(tasks));
  }

  countByStatus(status: ProjectTask['status']) {
    return this.tasks().filter((task) => task.status === status).length;
  }

  createProject() {
    this.api.createProject({ name: this.projectName, description: 'Created from the Angular dashboard' }).subscribe((project) => {
      this.projects.update((projects) => [project, ...projects]);
      this.selectedProjectId = project.id || (project as Project & { _id?: string })._id || '';
      this.projectName = '';
    });
  }

  createTask() {
    if (!this.selectedProjectId) return;
    this.api
      .createTask({
        projectId: this.selectedProjectId,
        title: this.taskTitle,
        description: 'Ready for assignment and review.',
        priority: 'medium',
        status: 'todo'
      })
      .subscribe((task) => {
        this.tasks.update((tasks) => [task, ...tasks]);
        this.taskTitle = '';
      });
  }

  moveTask(task: ApiTask, status: ProjectTask['status']) {
    this.api.updateTaskStatus(task.id || task._id!, status).subscribe((updated) => {
      this.tasks.update((tasks) => tasks.map((item) => (item.id === updated.id || item._id === (updated as ProjectTask & { _id?: string })._id ? updated : item)));
    });
  }

  addComment(task: ApiTask) {
    const id = task.id || task._id!;
    const body = this.commentDrafts[id];
    if (!body) return;
    this.api.addComment(id, body).subscribe((updated) => {
      this.commentDrafts[id] = '';
      this.tasks.update((tasks) => tasks.map((item) => (item.id === updated.id || item._id === (updated as ProjectTask & { _id?: string })._id ? updated : item)));
    });
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigateByUrl('/login');
  }
}
