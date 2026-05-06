import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <main [class.dark]="darkMode()">
      <router-outlet />
    </main>
  `
})
export class AppComponent {
  darkMode = signal(localStorage.getItem('theme') === 'dark');
}
