import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/home/home').then(m => m.HomeComponent),
      },
      {
        path: 'resume',
        loadComponent: () => import('./pages/resume/resume').then(m => m.ResumeComponent),
      },
      { path: '**', redirectTo: '' },
    ],
  },
];
