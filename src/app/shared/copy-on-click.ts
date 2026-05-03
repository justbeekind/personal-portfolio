import { Directive, ElementRef, HostListener, Input, OnDestroy, inject, signal } from '@angular/core';

@Directive({
  selector: '[copyOnClick]',
  standalone: true,
  host: {
    '[class.is-copied]': 'copied()',
    '[attr.aria-live]': '"polite"',
  },
})
export class CopyOnClickDirective implements OnDestroy {
  @Input('copyOnClick') value = '';
  readonly copied = signal(false);

  private el = inject(ElementRef);
  private timer?: ReturnType<typeof setTimeout>;

  @HostListener('click', ['$event'])
  onClick(e: Event): void {
    if (!this.value) return;
    e.preventDefault();
    const ok = (text: string) =>
      navigator.clipboard?.writeText(text) ??
      Promise.reject(new Error('clipboard unavailable'));

    ok(this.value)
      .then(() => this.flash())
      .catch(() => this.fallbackCopy(this.value) && this.flash());
  }

  private flash(): void {
    this.copied.set(true);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.copied.set(false), 1400);
  }

  private fallbackCopy(text: string): boolean {
    try {
      const node = document.createElement('textarea');
      node.value = text;
      node.style.position = 'fixed';
      node.style.opacity = '0';
      document.body.appendChild(node);
      node.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(node);
      return ok;
    } catch {
      return false;
    }
  }

  ngOnDestroy(): void {
    clearTimeout(this.timer);
  }
}
