import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of, tap } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

export const GITHUB_USERNAME = 'justbeekind';
const CACHE_TTL_MS = 15 * 60 * 1000;
const CACHE_PREFIX = 'gh:v1:';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

function readCache<T>(key: string): T | null {
  if (typeof sessionStorage === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry<T>;
    if (Date.now() > entry.expiresAt) {
      sessionStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

function writeCache<T>(key: string, data: T, ttlMs: number): void {
  if (typeof sessionStorage === 'undefined') return;
  try {
    const entry: CacheEntry<T> = { data, expiresAt: Date.now() + ttlMs };
    sessionStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
  } catch {}
}

export interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface ContributionsResponse {
  total: { lastYear: number } & Record<string, number>;
  contributions: ContributionDay[];
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  pushed_at: string;
  fork: boolean;
  archived: boolean;
  topics?: string[];
}

interface GitHubEvent {
  id: string;
  type: string;
  repo: { name: string };
  payload: { head?: string };
  created_at: string;
}

interface CommitDetail {
  sha: string;
  commit: { message: string };
}

export interface RecentCommit {
  sha: string;
  message: string;
  repo: string;
  url: string;
  date: string;
}

@Injectable({ providedIn: 'root' })
export class GithubService {
  private http = inject(HttpClient);
  private readonly user = GITHUB_USERNAME;

  private cachedGet<T>(cacheKey: string, url: string): Observable<T> {
    const cached = readCache<T>(cacheKey);
    if (cached !== null) return of(cached);
    return this.http.get<T>(url).pipe(
      tap(data => writeCache(cacheKey, data, CACHE_TTL_MS)),
    );
  }

  fetchContributions(): Observable<ContributionsResponse> {
    return this.cachedGet<ContributionsResponse>(
      `contrib:${this.user}`,
      `https://github-contributions-api.jogruber.de/v4/${this.user}?y=last`,
    );
  }

  fetchRepos(): Observable<GitHubRepo[]> {
    return this.cachedGet<GitHubRepo[]>(
      `repos:${this.user}`,
      `https://api.github.com/users/${this.user}/repos?sort=updated&per_page=12&type=owner`,
    );
  }

  fetchRecentEvents(): Observable<GitHubEvent[]> {
    return this.cachedGet<GitHubEvent[]>(
      `events:${this.user}`,
      `https://api.github.com/users/${this.user}/events/public?per_page=30`,
    );
  }

  // /repos/.../commits/{sha} endpoint and cache by SHA.
  fetchRecentCommits(limit = 3): Observable<RecentCommit[]> {
    return this.fetchRecentEvents().pipe(
      switchMap(events => {
        const pushes = events
          .filter(e => e.type === 'PushEvent' && !!e.payload.head)
          .slice(0, limit);
        if (pushes.length === 0) return of([] as RecentCommit[]);
        return forkJoin(
          pushes.map(e =>
            this.cachedGet<CommitDetail>(
              `commit:${e.repo.name}:${e.payload.head}`,
              `https://api.github.com/repos/${e.repo.name}/commits/${e.payload.head}`,
            ).pipe(
              map(c => ({
                sha: c.sha.slice(0, 7),
                message: c.commit.message.split('\n')[0],
                repo: e.repo.name.split('/')[1] ?? e.repo.name,
                url: `https://github.com/${e.repo.name}/commit/${c.sha}`,
                date: e.created_at,
              }) satisfies RecentCommit),
              catchError(() => of(null)),
            ),
          ),
        ).pipe(map(results => results.filter((c): c is RecentCommit => c !== null)));
      }),
    );
  }

  clearCache(): void {
    if (typeof sessionStorage === 'undefined') return;
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const key = sessionStorage.key(i);
      if (key?.startsWith(CACHE_PREFIX)) sessionStorage.removeItem(key);
    }
  }
}

export function bucketIntoWeeks(days: ContributionDay[]): ContributionDay[][] {
  // Pad/align so the grid is exactly 52 columns × 7 rows ending today.
  const last364 = days.slice(-364);
  const weeks: ContributionDay[][] = [];
  for (let w = 0; w < 52; w++) {
    weeks.push(last364.slice(w * 7, w * 7 + 7));
  }
  return weeks;
}

const LANG_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f7df1e',
  Python: '#3572a5',
  Java: '#b07219',
  'C++': '#f34b7d',
  C: '#555555',
  'C#': '#178600',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Go: '#00add8',
  Rust: '#dea584',
  Shell: '#89e051',
  Dart: '#00b4ab',
  Vue: '#41b883',
  Svelte: '#ff3e00',
};

export function languageColor(language: string | null | undefined): string {
  if (!language) return '#7e947a';
  return LANG_COLORS[language] ?? '#7e947a';
}

const LANG_ICONS: Record<string, string> = {
  TypeScript: 'code',
  JavaScript: 'javascript',
  Python: 'data_object',
  Java: 'coffee',
  'C++': 'memory',
  C: 'memory',
  'C#': 'code_blocks',
  HTML: 'html',
  CSS: 'css',
  Go: 'directions_run',
  Rust: 'shield',
};

export function repoIcon(language: string | null | undefined): string {
  if (!language) return 'folder_code';
  return LANG_ICONS[language] ?? 'folder_code';
}
