import type { ReactElement } from 'react';
import { Bug1Cascade } from './components/Bug1Cascade';
import { Bug2PropDrilling } from './components/Bug2PropDrilling';
import { Bug3MemoBypass } from './components/Bug3MemoBypass';
import { Bug4DuplicateApi } from './components/Bug4DuplicateApi';
import { Bug5UnmemoContext } from './components/Bug5UnmemoContext';
import { Bug6TanStackRefetch } from './components/Bug6TanStackRefetch';
import { Bug7RawFetch } from './components/Bug7RawFetch';
import { Bug8ReduxBurst } from './components/Bug8ReduxBurst';
import { Bug9EffectBugs } from './components/Bug9EffectBugs';
import { Bug10SlowRender } from './components/Bug10SlowRender';
import { Bug11ExcessiveRenders } from './components/Bug11ExcessiveRenders';
import { Bug12NetworkErrors } from './components/Bug12NetworkErrors';
import { Bug13UseTransition } from './components/Bug13UseTransition';
import { Bug14SuspenseLazy } from './components/Bug14SuspenseLazy';
import { Bug15Router } from './components/Bug15Router';
import { Bug19ThrowingComponent } from './components/Bug19ThrowingComponent';
import { Bug20UnhandledRejection } from './components/Bug20UnhandledRejection';
import { Bug21SlowInteraction } from './components/Bug21SlowInteraction';
import { Bug22DuplicateKeys } from './components/Bug22DuplicateKeys';
import { Bug23RouteScopedCascade } from './components/Bug23RouteScopedCascade';
import { usePathname, useNavigate } from './router/tinyRouter';
import { Bug16WatchDemo } from './components/Bug16WatchDemo';
import { Bug17Xhr } from './components/Bug17Xhr';
import { Bug18TanstackMutations } from './components/Bug18TanstackMutations';

interface Group {
  /** URL segment for the per-group route, e.g. `/g/render`. */
  slug: string;
  title: string;
  blurb: string;
  bugs: { id: string; label: string; Component: () => ReactElement }[];
}

const GROUPS: Group[] = [
  {
    slug: 'render',
    title: 'Render & re-render',
    blurb:
      "Cascades, memo defeats, slow renders, runaway frequency — what FloTrace's tree heatmap and cascade panel surface.",
    bugs: [
      { id: 'bug1', label: 'Bug 1 · Render cascade', Component: Bug1Cascade },
      { id: 'bug3', label: 'Bug 3 · Memo bypass', Component: Bug3MemoBypass },
      { id: 'bug10', label: 'Bug 10 · Slow render', Component: Bug10SlowRender },
      { id: 'bug11', label: 'Bug 11 · Excessive renders', Component: Bug11ExcessiveRenders },
    ],
  },
  {
    slug: 'props',
    title: 'Props, context & drilling',
    blurb:
      'Prop drilling chains, unmemoized context — DFS chain detection and context-value tracking.',
    bugs: [
      { id: 'bug2', label: 'Bug 2 · Prop drilling', Component: Bug2PropDrilling },
      { id: 'bug5', label: 'Bug 5 · Unmemoized context', Component: Bug5UnmemoContext },
    ],
  },
  {
    slug: 'state',
    title: 'State & stores',
    blurb:
      'Zustand, Redux, watch expressions. FloTrace tracks each store independently and lets you pin any value.',
    bugs: [
      { id: 'bug8', label: 'Bug 8 · Redux burst', Component: Bug8ReduxBurst },
      { id: 'bug16', label: 'Bug 16 · Watch playground', Component: Bug16WatchDemo },
    ],
  },
  {
    slug: 'effects',
    title: 'Effects',
    blurb: 'useEffect dep diffing, stale closures, willRun warnings.',
    bugs: [{ id: 'bug9', label: 'Bug 9 · Effect foot-guns', Component: Bug9EffectBugs }],
  },
  {
    slug: 'tanstack',
    title: 'Network — with TanStack',
    blurb:
      'Refetch storms, mutations + optimistic updates, suspense queries — how the TanStack Query panel and state timeline behave under stress.',
    bugs: [
      { id: 'bug6', label: 'Bug 6 · TanStack refetch storm', Component: Bug6TanStackRefetch },
      { id: 'bug18', label: 'Bug 18 · TanStack mutations', Component: Bug18TanstackMutations },
      { id: 'bug14', label: 'Bug 14 · Suspense + lazy', Component: Bug14SuspenseLazy },
    ],
  },
  {
    slug: 'network',
    title: 'Network — without TanStack',
    blurb:
      'Plain useEffect + fetch, XMLHttpRequest, duplicate calls, errors, slow APIs — how the network panel handles raw HTTP.',
    bugs: [
      { id: 'bug4', label: 'Bug 4 · Duplicate API call', Component: Bug4DuplicateApi },
      { id: 'bug7', label: 'Bug 7 · Raw fetch (no TanStack)', Component: Bug7RawFetch },
      { id: 'bug12', label: 'Bug 12 · Network errors + slow', Component: Bug12NetworkErrors },
      { id: 'bug17', label: 'Bug 17 · XHR (XMLHttpRequest)', Component: Bug17Xhr },
    ],
  },
  {
    slug: 'concurrent',
    title: 'Concurrent React 19',
    blurb:
      "useTransition signals, suspense boundaries — what FloTrace shows about React 19's scheduler.",
    bugs: [{ id: 'bug13', label: 'Bug 13 · useTransition', Component: Bug13UseTransition }],
  },
  {
    slug: 'routing',
    title: 'Routing',
    blurb: 'History API tracking — no router library required.',
    bugs: [
      { id: 'bug15', label: 'Bug 15 · Router pushState', Component: Bug15Router },
      { id: 'bug23', label: 'Bug 23 · Route-scoped cascade', Component: Bug23RouteScopedCascade },
    ],
  },
  {
    slug: 'errors',
    title: 'Errors & responsiveness',
    blurb:
      'Uncaught throws, unhandled rejections, duplicate keys, and a slow interaction — the signals the Live Analysis dashboard treats as highest-precision.',
    bugs: [
      { id: 'bug19', label: 'Bug 19 · Uncaught render error', Component: Bug19ThrowingComponent },
      { id: 'bug20', label: 'Bug 20 · Unhandled rejection', Component: Bug20UnhandledRejection },
      { id: 'bug21', label: 'Bug 21 · Slow interaction (INP)', Component: Bug21SlowInteraction },
      { id: 'bug22', label: 'Bug 22 · Duplicate list keys', Component: Bug22DuplicateKeys },
    ],
  },
];

/** `/g/<slug>` renders one group; every other path renders all of them. */
const GROUP_ROUTE_PREFIX = '/g/';

export function App() {
  const pathname = usePathname();
  const navigate = useNavigate();

  // Any path that is NOT /g/<slug> renders every group — including `/` and the
  // /users/:id route Bug 23 drives. Keeps the existing E2E specs, which locate
  // bugs by visible text on one page, working unchanged.
  const activeSlug = pathname.startsWith(GROUP_ROUTE_PREFIX)
    ? pathname.slice(GROUP_ROUTE_PREFIX.length)
    : null;
  const visibleGroups = activeSlug ? GROUPS.filter((g) => g.slug === activeSlug) : GROUPS;

  return (
    <div style={{ maxWidth: 920, margin: '0 auto', padding: '48px 24px' }}>
      <header style={{ marginBottom: 32 }}>
        <h1 style={{ margin: 0, fontSize: 28 }}>FloTrace Playground</h1>
        <p style={{ color: '#9ca3af', fontSize: 14, margin: '8px 0 0 0' }}>
          23 deliberately broken patterns covering every FloTrace debugging surface. Open{' '}
          <a href="https://flotrace.dev/download">FloTrace</a> and watch each panel light up —
          render cascades, prop drilling, memo bypass, refetch storms, Redux bursts, useTransition,
          suspense, router, uncaught errors, slow interactions, and a watch playground.
        </p>
      </header>

      <nav className="toc" style={{ marginBottom: 16 }}>
        <div className="toc-group">
          <h4>Pages (route segmentation)</h4>
          <ul>
            <li>
              <a
                href="/"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/');
                }}
              >
                / — everything
              </a>
            </li>
            {GROUPS.map((g) => (
              <li key={g.slug}>
                <a
                  href={`${GROUP_ROUTE_PREFIX}${g.slug}`}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(`${GROUP_ROUTE_PREFIX}${g.slug}`);
                  }}
                >
                  /g/{g.slug}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <nav className="toc">
        {GROUPS.map((g) => (
          <div key={g.title} className="toc-group">
            <h4>{g.title}</h4>
            <ul>
              {g.bugs.map((b) => (
                <li key={b.id}>
                  <a href={`#${b.id}`}>{b.label}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <main style={{ display: 'grid', gap: 32, marginTop: 32 }}>
        {visibleGroups.map((g) => (
          <section key={g.title} className="group">
            <h2 className="group-title">{g.title}</h2>
            <p className="group-blurb">{g.blurb}</p>
            <div style={{ display: 'grid', gap: 24 }}>
              {g.bugs.map(({ id, Component }) => (
                <div id={id} key={id}>
                  <Component />
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>

      <footer
        style={{
          marginTop: 64,
          paddingTop: 24,
          borderTop: '1px solid #1f2429',
          fontSize: 12,
          color: '#6b7280',
        }}
      >
        <p>
          MIT licensed · <a href="https://github.com/flotrace-dev/playground">GitHub</a> · PRs
          adding more debugging surfaces welcome.
        </p>
      </footer>
    </div>
  );
}
