import { Component, signal, computed, OnInit, OnDestroy, ElementRef, inject, WritableSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import {
  GithubService,
  GITHUB_USERNAME,
  ContributionDay,
  GitHubRepo,
  RecentCommit,
  bucketIntoWeeks,
  eventsToCommits,
  languageColor,
  repoIcon,
} from '../../services/github';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
})
export class HomeComponent implements OnInit, OnDestroy {
  private el = inject(ElementRef);
  private gh = inject(GithubService);
  private timers: ReturnType<typeof setTimeout>[] = [];
  private intervals: ReturnType<typeof setInterval>[] = [];
  private observer?: IntersectionObserver;

  readonly username = GITHUB_USERNAME;

  readonly contributions = toSignal(
    this.gh.fetchContributions().pipe(catchError(() => of(null))),
    { initialValue: null },
  );

  readonly repos = toSignal(
    this.gh.fetchRepos().pipe(
      map(rs => rs.filter(r => !r.fork && !r.archived).slice(0, 6)),
      catchError(() => of([] as GitHubRepo[])),
    ),
    { initialValue: [] as GitHubRepo[] },
  );

  readonly recentCommits = toSignal(
    this.gh.fetchRecentEvents().pipe(
      map(events => eventsToCommits(events, 3)),
      catchError(() => of([] as RecentCommit[])),
    ),
    { initialValue: [] as RecentCommit[] },
  );

  readonly contributionsLoaded = computed(() => this.contributions() !== null);
  readonly contributionsTotal = computed(() => this.contributions()?.total.lastYear ?? null);

  readonly heatmapWeeks = computed<ContributionDay[][]>(() => {
    const data = this.contributions();
    if (!data) {
      return Array.from({ length: 52 }, () =>
        Array.from({ length: 7 }, () => ({ date: '', count: 0, level: 0 as const })),
      );
    }
    return bucketIntoWeeks(data.contributions);
  });

  readonly months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

  readonly languageColor = languageColor;
  readonly repoIcon = repoIcon;

  formatRepoName(fullName: string): string {
    return fullName.replace(`${this.username}/`, '');
  }

  formatRelativeDate(iso: string): string {
    const then = new Date(iso).getTime();
    const diff = Date.now() - then;
    const days = Math.floor(diff / 86_400_000);
    if (days < 1) return 'today';
    if (days < 2) return 'yesterday';
    if (days < 30) return `${days}d ago`;
    if (days < 365) return `${Math.floor(days / 30)}mo ago`;
    return `${Math.floor(days / 365)}y ago`;
  }

  readonly cmd1Text = signal('');
  readonly cmd1OutputVisible = signal(false);
  readonly cmd2Text = signal('');
  readonly cmd2OutputVisible = signal(false);
  readonly cmd3Text = signal('');
  readonly cmd3OutputVisible = signal(false);
  readonly finalCursorVisible = signal(false);

  readonly showCursor1 = computed(() => this.cmd1Text().length > 0 && !this.cmd1OutputVisible());
  readonly showCursor2 = computed(() => this.cmd2Text().length > 0 && !this.cmd2OutputVisible());
  readonly showCursor3 = computed(() => this.cmd3Text().length > 0 && !this.cmd3OutputVisible());

  ngOnInit() {
    this.runTerminalAnimation();
    this.setupScrollReveal();
  }

  ngOnDestroy() {
    this.timers.forEach(id => clearTimeout(id));
    this.intervals.forEach(id => clearInterval(id));
    this.observer?.disconnect();
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => {
      this.timers.push(setTimeout(resolve, ms));
    });
  }

  private typeInto(target: WritableSignal<string>, text: string, charDelay = 65): Promise<void> {
    return new Promise(resolve => {
      let i = 0;
      const iv = setInterval(() => {
        i++;
        target.set(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(iv);
          resolve();
        }
      }, charDelay);
      this.intervals.push(iv);
    });
  }

  private async runTerminalAnimation() {
    await this.delay(500);

    await this.typeInto(this.cmd1Text, 'whoami');
    await this.delay(250);
    this.cmd1OutputVisible.set(true);

    await this.delay(600);
    await this.typeInto(this.cmd2Text, 'cat stack.json');
    await this.delay(250);
    this.cmd2OutputVisible.set(true);

    await this.delay(600);
    await this.typeInto(this.cmd3Text, 'git log --oneline -3');
    await this.delay(250);
    this.cmd3OutputVisible.set(true);

    await this.delay(200);
    this.finalCursorVisible.set(true);
  }

  private setupScrollReveal() {
    this.observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('revealed');
          this.observer!.unobserve(e.target);
        }
      }),
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );
    setTimeout(() => {
      this.el.nativeElement
        .querySelectorAll('.scroll-reveal')
        .forEach((el: Element) => this.observer!.observe(el));
    }, 50);
  }
}
