/**
 * CursorSwarm Reusable Integration Module (smoothness-optimized)
 *
 * Same visuals as the original (3 cursors, HUD, copy-paste, relocation, effects),
 * but without the things that made it freeze:
 *  1. MutationObserver ignores the swarm's own DOM changes (no refresh feedback loop).
 *  2. Refreshes are throttled, run in idle time, and stop once the build is done.
 *  3. A stall watchdog nudges the swarm if progress stops moving in a section.
 *  4. Pauses when the tab is hidden.
 */

export interface CursorSwarmOptions {
  cursors?: number;
  agents?: Array<{ name?: string; color?: string; role?: string; x?: number | string; y?: number | string }> | null;
  names?: string[] | ((i: number) => string) | null;
  palette?: string | readonly string[] | { colors?: string[]; mono?: string; hud?: unknown };
  colors?: string[] | null;
  startPosition?:
  | 'center'
  | 'random'
  | 'corners'
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'outside'
  | { x: number | string; y: number | string };
  root?: HTMLElement | string | null;
  targets?: string | null;
  ignore?: string | null;
  frames?: boolean;
  deconstruct?: boolean;
  exitAfterBuild?: boolean | 'edge' | 'home';
  idle?: 'dim' | 'stay' | 'hide';
  spawn?: boolean;
  speed?: number;
  adaptiveSpeed?: boolean;
  maxSpeed?: number;
  trigger?: number;
  typeDuration?: number;
  hud?: boolean;
  hudPosition?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  labels?: boolean;
  marquee?: boolean;
  guides?: boolean;
  sparks?: boolean;
  caret?: boolean;
  copyPaste?: boolean | number;
  relocation?: boolean | number;
  zIndex?: number;
  respectReducedMotion?: boolean;
  onBuild?: ((el: HTMLElement, type: string, agentName: string) => void) | null;
  onUnbuild?: ((el: HTMLElement, type: string, agentName: string) => void) | null;
  onIdle?: ((agent: unknown) => void) | null;
  onDone?: (() => void) | null;
}

interface SwarmAgent {
  cur?: HTMLElement;
  [key: string]: unknown;
}

export interface CursorSwarmInstance {
  init: () => CursorSwarmInstance;
  pause: () => CursorSwarmInstance;
  resume: () => CursorSwarmInstance;
  toggle: () => CursorSwarmInstance;
  stop: (options?: { reveal?: boolean }) => CursorSwarmInstance;
  destroy: () => CursorSwarmInstance;
  buildAll: () => CursorSwarmInstance;
  refresh: () => CursorSwarmInstance;
  add: (el: HTMLElement, type?: string) => CursorSwarmInstance;
  setSpeed: (speed: number) => CursorSwarmInstance;
  setPalette: (palette: string | string[]) => CursorSwarmInstance;
  on: <A extends unknown[]>(event: string, handler: (...args: A) => void) => CursorSwarmInstance;
  off: <A extends unknown[]>(event: string, handler: (...args: A) => void) => CursorSwarmInstance;
  state: 'idle' | 'running' | 'paused' | 'stopped' | 'destroyed';
  progress: number;
  agents?: SwarmAgent[];
  hud?: HTMLElement | null;
}

export interface CursorSwarmConstructor {
  new(options?: CursorSwarmOptions): CursorSwarmInstance;
  cloak: () => void;
  palettes: Record<string, unknown>;
  mono: (base: string, n?: number) => string[];
  inkOn: (color: string) => string;
  defaults: CursorSwarmOptions;
  version: string;
}

declare global {
  interface Window {
    CursorSwarm?: CursorSwarmConstructor;
    cursorSwarm?: CursorSwarmInstance;
  }
}

/**
 * Global configuration object for CursorSwarm.
 */
export const SWARM_CONFIG = {
  enabled: true,
  cursors: 3,
  mobileCursors: 2,
  palette: ['#D9541E', '#F3EEE3', '#FF7A3D'] as readonly string[],
  ignore:
    'nav, header, form, input, textarea, select, [role="dialog"], [role="alertdialog"], [data-cs-ignore], [data-cs-fixed], .fixed, .sticky',
  deconstruct: false,
  /** Lower = less duplicate-building work in repeated lists */
  copyPaste: 0.55,
  relocation: 0.15,
  exitAfterBuild: true as const,
  idle: 'hide' as const,
  startPosition: 'center' as const,
  hud: true,
  hudPosition: 'bottom-left' as const,
  respectReducedMotion: true,
  cloakTimeout: 2000,
  /** Skip containers with more than this many children. 0 = never skip (keeps every section animated). */
  maxSiblings: 0,
  /**
   * Light sections: the heading/container still get built by the cursors, but the many small
   * repeated items inside (skill chips, tags, logos) are skipped and just appear instantly.
   * Use your real section selectors, e.g. ['#skills', '.skills-section'].
   */
  lightSections: ['#skills', '.skills', '[data-section="skills"]'] as readonly string[],
  /** Inside a light section, a container with more than this many children has its children skipped */
  lightThreshold: 4,
  /** Extra selectors to skip entirely (optional) */
  extraIgnore: '' as string,
  /** Stall watchdog: ms without progress/movement before the swarm is nudged. 0 = off */
  stallMs: 3500,
  /** Minimum ms between auto-refreshes */
  refreshMinInterval: 600,
} as const;

const activeRoots = new WeakMap<HTMLElement, () => void>();

const getCursorSwarm = async (): Promise<CursorSwarmConstructor | undefined> => {
  if (typeof window === 'undefined') return undefined;
  if (window.CursorSwarm) return window.CursorSwarm;

  return new Promise((resolve) => {
    let elapsed = 0;
    const interval = window.setInterval(() => {
      elapsed += 50;
      if (window.CursorSwarm) {
        window.clearInterval(interval);
        resolve(window.CursorSwarm);
      } else if (elapsed >= 1500) {
        window.clearInterval(interval);
        const existing = document.querySelector('script[src*="cursor-swarm"]');
        if (!existing) {
          const script = document.createElement('script');
          script.src = '/vendor/cursor-swarm.min.js';
          script.async = true;
          script.onload = () => resolve(window.CursorSwarm);
          script.onerror = () => resolve(undefined);
          document.head.appendChild(script);
        } else {
          resolve(window.CursorSwarm);
        }
      }
    }, 50);
  });
};

const waitForLayout = async (root: HTMLElement): Promise<void> => {
  const imagePromises = Array.from(root.querySelectorAll('img')).map((image) =>
    image.complete
      ? Promise.resolve()
      : new Promise<void>((resolve) => {
        image.addEventListener('load', () => resolve(), { once: true });
        image.addEventListener('error', () => resolve(), { once: true });
      }),
  );

  const fontsReady = document.fonts?.ready ?? Promise.resolve();
  const timeout = new Promise<void>((resolve) => window.setTimeout(resolve, 350));

  await Promise.race([Promise.all([fontsReady, ...imagePromises]), timeout]);
};

/** True for nodes created/managed by the swarm itself (cursors, HUD, sparks, carets...). */
const isSwarmNode = (node: Node): boolean => {
  if (node.nodeType !== 1) return false;
  const el = node as HTMLElement;
  const cls = typeof el.className === 'string' ? el.className : '';
  return cls.includes('cs-') || (el.id ? el.id.startsWith('cs-') : false) || el.hasAttribute('data-cs-ui');
};

/** Inside light sections, skip the many small repeated items so cursors don't crawl through each one. */
const markLightSections = (root: HTMLElement): void => {
  const sections = SWARM_CONFIG.lightSections.filter(Boolean).join(', ');
  if (!sections) return;
  let list: HTMLElement[] = [];
  try {
    list = Array.from(root.querySelectorAll<HTMLElement>(sections));
  } catch {
    return;
  }
  list.forEach((section) => {
    section.querySelectorAll<HTMLElement>('*').forEach((el) => {
      if (el.childElementCount > SWARM_CONFIG.lightThreshold) {
        Array.from(el.children).forEach((child) => {
          if (!child.hasAttribute('data-cs-ignore')) child.setAttribute('data-cs-ignore', 'light');
        });
      }
    });
  });
};

/** Mark containers with a huge number of repeated children so the swarm skips them. */
const markHeavyContainers = (root: HTMLElement): void => {
  const limit = SWARM_CONFIG.maxSiblings;
  if (!limit) return;
  root.querySelectorAll<HTMLElement>('*').forEach((el) => {
    if (el.hasAttribute('data-cs-ignore')) return;
    if (el.childElementCount > limit) {
      el.setAttribute('data-cs-ignore', 'auto');
    }
  });
};

const scheduleIdle = (fn: () => void): number => {
  const w = window as Window & {
    requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
  };
  return w.requestIdleCallback ? w.requestIdleCallback(fn, { timeout: 800 }) : window.setTimeout(fn, 50);
};

export function initSwarm(root: HTMLElement): () => void {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !SWARM_CONFIG.enabled) {
    return () => undefined;
  }

  if (SWARM_CONFIG.respectReducedMotion && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return () => undefined;
  }

  const existingCleanup = activeRoots.get(root);
  if (existingCleanup) return existingCleanup;

  let disposed = false;
  let finished = false;
  let swarm: CursorSwarmInstance | undefined;
  let observer: MutationObserver | undefined;
  let refreshTimeout: number | undefined;
  let hudTimeout: number | undefined;
  let lastRefresh = 0;
  let pausedByVisibility = false;
  let watchdog: number | undefined;

  const reveal = () => document.documentElement.classList.remove('cs-cloak');

  const onVisibility = () => {
    if (!swarm || disposed || finished) return;
    try {
      if (document.hidden && swarm.state === 'running') {
        swarm.pause();
        pausedByVisibility = true;
      } else if (!document.hidden && pausedByVisibility) {
        swarm.resume();
        pausedByVisibility = false;
      }
    } catch {
      /* ignore */
    }
  };

  const stopWatchdog = () => {
    if (watchdog !== undefined) {
      window.clearInterval(watchdog);
      watchdog = undefined;
    }
  };

  /**
   * If progress and cursor positions don't change for stallMs while running,
   * gently kick the swarm (pause/resume first, refresh as a last resort).
   */
  const startWatchdog = () => {
    if (!SWARM_CONFIG.stallMs) return;
    let lastProgress = -1;
    let lastSig = '';
    let lastChange = Date.now();
    let nudges = 0;
    watchdog = window.setInterval(() => {
      if (disposed || finished || !swarm || document.hidden || swarm.state !== 'running') {
        lastChange = Date.now();
        return;
      }
      const sig = (swarm.agents ?? [])
        .map((a) => {
          const r = a?.cur?.getBoundingClientRect();
          return r ? `${Math.round(r.left)},${Math.round(r.top)}` : '';
        })
        .join('|');
      if (swarm.progress !== lastProgress || sig !== lastSig) {
        lastProgress = swarm.progress;
        lastSig = sig;
        lastChange = Date.now();
        nudges = 0;
        return;
      }
      if (Date.now() - lastChange < SWARM_CONFIG.stallMs) return;
      lastChange = Date.now();
      try {
        if (nudges === 0) {
          swarm.pause();
          swarm.resume();
        } else {
          swarm.refresh();
        }
        nudges += 1;
        console.info('[CursorSwarm] stall detected, nudged swarm');
      } catch {
        /* ignore */
      }
    }, 1000);
  };

  const stopObserving = () => {
    observer?.disconnect();
    observer = undefined;
    if (refreshTimeout !== undefined) {
      window.clearTimeout(refreshTimeout);
      refreshTimeout = undefined;
    }
  };

  const cleanup = () => {
    disposed = true;
    stopObserving();
    stopWatchdog();
    if (hudTimeout !== undefined) window.clearTimeout(hudTimeout);
    document.removeEventListener('visibilitychange', onVisibility);
    reveal();
    try {
      swarm?.destroy();
    } catch (e) {
      console.warn('[CursorSwarm] Error during teardown destroy:', e);
    }
    if (window.cursorSwarm === swarm) window.cursorSwarm = undefined;
    if (activeRoots.get(root) === cleanup) activeRoots.delete(root);
  };

  activeRoots.set(root, cleanup);

  const queueRefresh = () => {
    if (disposed || finished || refreshTimeout !== undefined) return;
    const wait = Math.max(150, SWARM_CONFIG.refreshMinInterval - (Date.now() - lastRefresh));
    refreshTimeout = window.setTimeout(() => {
      refreshTimeout = undefined;
      scheduleIdle(() => {
        if (disposed || finished || !swarm) return;
        lastRefresh = Date.now();
        try {
          markHeavyContainers(root);
          markLightSections(root);
          swarm.refresh();
        } catch (e) {
          console.warn('[CursorSwarm] auto-refresh failed:', e);
        }
      });
    }, wait);
  };

  const start = async () => {
    await waitForLayout(root);
    if (disposed) return;

    const CursorSwarm = await getCursorSwarm();
    if (disposed) return;
    if (!CursorSwarm) {
      console.warn('[CursorSwarm] Vendor library not found.');
      reveal();
      activeRoots.delete(root);
      return;
    }

    try {
      const isMobile = window.matchMedia('(max-width: 767px)').matches;
      const cursorCount = isMobile ? SWARM_CONFIG.mobileCursors : SWARM_CONFIG.cursors;

      markHeavyContainers(root);
      markLightSections(root);

      const ignore = [SWARM_CONFIG.ignore, SWARM_CONFIG.extraIgnore].filter(Boolean).join(', ');

      swarm = new CursorSwarm({
        cursors: cursorCount,
        palette: SWARM_CONFIG.palette,
        root,
        ignore,
        deconstruct: SWARM_CONFIG.deconstruct,
        copyPaste: SWARM_CONFIG.copyPaste,
        relocation: SWARM_CONFIG.relocation,
        exitAfterBuild: SWARM_CONFIG.exitAfterBuild,
        idle: SWARM_CONFIG.idle,
        startPosition: SWARM_CONFIG.startPosition,
        hud: SWARM_CONFIG.hud,
        hudPosition: SWARM_CONFIG.hudPosition,
        respectReducedMotion: SWARM_CONFIG.respectReducedMotion,
      }).init();

      swarm.on('idle', (agent: SwarmAgent) => {
        agent?.cur?.classList.add('cs-hidden');
      });

      swarm.on('done', () => {
        finished = true;
        stopWatchdog();
        // Build finished: stop all refresh work so nothing keeps running in the background.
        stopObserving();
        swarm?.agents?.forEach((a) => a?.cur?.classList.add('cs-hidden'));
        const hud = swarm?.hud;
        if (hud) {
          hud.style.transition = 'opacity 0.6s ease';
          hud.style.opacity = '0';
          hudTimeout = window.setTimeout(() => {
            hud.style.display = 'none';
          }, 650);
        }
      });

      // Only react to REAL content changes (new element nodes from async data),
      // never to the swarm's own cursors / typing text / HUD updates.
      observer = new MutationObserver((mutations) => {
        if (disposed || finished) return;
        for (const m of mutations) {
          if (m.type !== 'childList') continue;
          if (isSwarmNode(m.target)) continue;
          for (const n of Array.from(m.addedNodes)) {
            if (n.nodeType === 1 && !isSwarmNode(n)) {
              queueRefresh();
              return;
            }
          }
        }
      });
      observer.observe(root, { childList: true, subtree: true });

      document.addEventListener('visibilitychange', onVisibility);
      startWatchdog();

      window.cursorSwarm = swarm;
      reveal();
    } catch (error) {
      console.error('[CursorSwarm] Initialization failed:', error);
      reveal();
      activeRoots.delete(root);
    }
  };

  void start();
  return cleanup;
}

export function refreshSwarm(): void {
  if (typeof window !== 'undefined' && window.cursorSwarm) {
    requestAnimationFrame(() => {
      try {
        window.cursorSwarm?.refresh();
      } catch (err) {
        console.warn('[CursorSwarm] manual refresh failed', err);
      }
    });
  }
}