import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CopyOnClickDirective } from '../shared/copy-on-click';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CopyOnClickDirective],
  templateUrl: './layout.html',
})
export class LayoutComponent {}
