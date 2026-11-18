const SWARM_CONFIG = {
  enabled: true,
  root: '#portfolio-content',
  targets: '[data-cs]',
  ignore: 'nav, form, [role="dialog"], [aria-modal="true"], [data-cs-ignore], .fixed, .sticky',
  cursors: 3,
  mobileCursors: 2,
  mobileBreakpoint: 640,
  palette: ['#D9541E', '#111111', '#F3EEE3'],
  deconstruct: true,
  copyPaste: false,
  relocation: false,
  imageWaitMs: 1500,
};

const REFRESH_EVENT = 'cursor-swarm:refresh';

interface CursorSwarmOptions {
  root: string;
  targets: string;
  ignore: string;
  cursors: number;
  palette: string[];
  deconstruct: boolean;
  copyPaste: boolean;
  relocation: boolean;
  respectReducedMotion: boolean;
}

interface CursorSwarmInstance {
  state: 'idle' | 'running' | 'paused' | 'stopped' | 'destroyed';
  init(): CursorSwarmInstance;
  refresh(): CursorSwarmInstance;
  destroy(): CursorSwarmInstance;
}

interface CursorSwarmConstructor {
  new (options: CursorSwarmOptions): CursorSwarmInstance;
}

declare global {
  interface Window {
    CursorSwarm?: CursorSwarmConstructor;
  }
}

let initializerMounted = false;
let activeSwarm: CursorSwarmInstance | null = null;

export function refreshCursorSwarm() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(REFRESH_EVENT));
  }
}

async function waitForLayout(root: HTMLElement) {
  await document.fonts.ready;

  const images = Array.from(root.querySelectorAll<HTMLImageElement>('img:not([loading="lazy"])'));
  if (!images.length) return;

  let timeoutId: number | undefined;
  try {
    await Promise.race([
      Promise.all(
        images.map((image) =>
          image.decode().catch((error: unknown) => {
            console.warn(
              '[CursorSwarm] Could not decode an image before measuring the page.',
              image.currentSrc || image.src,
              error,
            );
          }),
        ),
      ).then(() => undefined),
      new Promise<void>((resolve) => {
        timeoutId = window.setTimeout(resolve, SWARM_CONFIG.imageWaitMs);
      }),
    ]);
  } finally {
    if (timeoutId !== undefined) window.clearTimeout(timeoutId);
  }
}

export function initializeCursorSwarm() {
  if (typeof window === 'undefined' || !SWARM_CONFIG.enabled || initializerMounted) {
    return () => undefined;
  }

  initializerMounted = true;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    initializerMounted = false;
    return () => undefined;
  }

  let disposed = false;
  let swarm: CursorSwarmInstance | null = null;
  const refresh = () => {
    if (swarm?.state === 'running' || swarm?.state === 'paused') {
      swarm.refresh();
    }
  };

  window.addEventListener(REFRESH_EVENT, refresh);

  const start = async () => {
    try {
      const root = document.querySelector<HTMLElement>(SWARM_CONFIG.root);
      if (!root) throw new Error(`CursorSwarm root not found: ${SWARM_CONFIG.root}`);

      await waitForLayout(root);
      if (disposed) return;

      const CursorSwarm = window.CursorSwarm;
      if (!CursorSwarm) throw new Error('The CursorSwarm browser script did not load.');

      const cursors = window.matchMedia(`(max-width: ${SWARM_CONFIG.mobileBreakpoint}px)`).matches
        ? SWARM_CONFIG.mobileCursors
        : SWARM_CONFIG.cursors;

      swarm = new CursorSwarm({
        root: SWARM_CONFIG.root,
        targets: SWARM_CONFIG.targets,
        ignore: SWARM_CONFIG.ignore,
        cursors,
        palette: SWARM_CONFIG.palette,
        deconstruct: SWARM_CONFIG.deconstruct,
        copyPaste: SWARM_CONFIG.copyPaste,
        relocation: SWARM_CONFIG.relocation,
        respectReducedMotion: true,
      }).init();
      activeSwarm = swarm;
    } catch (error) {
      swarm?.destroy();
      console.error('[CursorSwarm] Initialization failed; leaving the page content visible.', error);
    }
  };

  void start();

  return () => {
    disposed = true;
    window.removeEventListener(REFRESH_EVENT, refresh);
    if (activeSwarm === swarm) activeSwarm = null;
    swarm?.destroy();
    initializerMounted = false;
  };
}
