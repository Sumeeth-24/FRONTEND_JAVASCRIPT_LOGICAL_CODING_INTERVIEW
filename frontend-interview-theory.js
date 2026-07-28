// ==============================================================
// 🧠 FRONTEND INTERVIEW REVISION GUIDE
// ==============================================================
// Quick-scan revision file for frontend interviews.
// Each topic: What → Why → Key Points → What interviewers want.
// ==============================================================



// --------------------------------------------------------------
// 1. DETECTING MEMORY LEAKS IN REACT
// --------------------------------------------------------------

/**
 * 🧠 WHAT IS IT?
 * Memory leaks = your app holds onto stuff it no longer needs.
 * Think of it like leaving all the lights on in rooms you've left.
 * The house (browser) runs out of electricity (memory) over time.
 *
 * 🎯 WHY IT MATTERS IN INTERVIEWS:
 * Shows you can debug production performance issues — not just write code.
 *
 * 📌 KEY POINTS:
 * - Leaks happen when unmounted components still have active async ops,
 *   listeners, or timers holding references to stale state
 * - Use Chrome DevTools → Memory tab → Heap Snapshots (compare 2 snapshots)
 * - Look for "Detached DOM nodes" and growing "Retained Size"
 * - Performance Monitor: watch JS Heap Size climb without dropping
 * - React 18 removed the "setState on unmounted" warning, but leaks still exist
 *
 * 🔍 DETECTION METHODS:
 * | Method                   | Best For                         |
 * |--------------------------|----------------------------------|
 * | Heap Snapshot Comparison | Pinpointing exact leaked objects |
 * | Performance Monitor      | Quick visual confirmation        |
 * | Allocation Timeline      | Finding WHEN leak occurs         |
 * | WeakRef tracking         | Verifying specific object cleanup|
 *
 * 🗣️ WHAT INTERVIEWERS WANT TO HEAR:
 * - "I take two heap snapshots — before and after the action — and compare"
 * - "I look for Detached DOM nodes and growing retained size"
 * - "React leaks happen when async ops complete after unmount"
 * - "I use Performance Monitor for quick visual confirmation"
 */



// --------------------------------------------------------------
// 2. FIXING MEMORY LEAKS
// --------------------------------------------------------------

/**
 * 🧠 WHAT IS IT?
 * The golden rule: "Whatever you SET UP in useEffect, TEAR DOWN in cleanup."
 * Think of it like camping — pack out everything you packed in.
 *
 * 🎯 WHY IT MATTERS IN INTERVIEWS:
 * Every senior dev must know the cleanup pattern. It's the #1 React bug source.
 *
 * 📌 KEY POINTS — THE FIX CHEAT SHEET:
 * | Leak Source              | Fix                                     |
 * |--------------------------|-----------------------------------------|
 * | setInterval/setTimeout   | clearInterval/clearTimeout in cleanup   |
 * | addEventListener         | removeEventListener in cleanup          |
 * | fetch/XHR                | AbortController.abort() in cleanup      |
 * | WebSocket                | ws.close() in cleanup                   |
 * | Store subscriptions      | Call unsubscribe() in cleanup           |
 * | IntersectionObserver     | observer.disconnect() in cleanup        |
 * | Large data in closures   | Use useRef + nullify in cleanup         |
 *
 * 💡 ANALOGY: useEffect is like checking into a hotel.
 *    The return function is checking out. If you never check out,
 *    your stuff stays in the room forever (memory leak).
 *
 * 🗣️ WHAT INTERVIEWERS WANT TO HEAR:
 * - "Every useEffect that sets up something must return a cleanup function"
 * - "AbortController is the modern standard for cancelling fetch + listeners"
 * - "React 18 Strict Mode double-mounts help catch missing cleanups"
 * - "AbortController can remove MULTIPLE listeners with one abort() call"
 */

// The ONE code pattern to remember:
// useEffect(() => {
//   const controller = new AbortController();
//   fetch(url, { signal: controller.signal });
//   window.addEventListener('resize', handler, { signal: controller.signal });
//   return () => controller.abort(); // Cancels EVERYTHING
// }, []);



// --------------------------------------------------------------
// 3. JAVASCRIPT GARBAGE COLLECTION
// --------------------------------------------------------------

/**
 * 🧠 WHAT IS IT?
 * GC = the engine's automatic janitor that frees memory you're no longer using.
 * Think of it like a city garbage truck — it only picks up trash that's
 * NOT connected to anyone's house (no references from any "root").
 *
 * 🎯 WHY IT MATTERS IN INTERVIEWS:
 * Understanding GC explains WHY memory leaks happen and how to prevent them.
 *
 * 📌 KEY POINTS:
 * - CORE ALGORITHM: Mark-and-Sweep (not reference counting)
 *   - Starts from "roots" (global, stack, closures)
 *   - Marks everything reachable → sweeps everything else
 *   - Handles circular references (unlike old ref counting)
 *
 * - V8 GENERATIONAL GC:
 *   - Young Generation: small, fast, frequent ("most objects die young")
 *   - Old Generation: large, slow, infrequent (long-lived objects)
 *   - Objects survive 2 young GCs → promoted to old generation
 *
 * - GC PRESSURE: too many short-lived allocations
 *   - Inline objects in JSX: <Comp style={{color:'red'}}/> (new obj every render)
 *   - Array chains: data.map().filter().reduce() (intermediate arrays)
 *
 * 💡 ANALOGY: Young gen is like a whiteboard you erase frequently.
 *    Old gen is like filing cabinets — slower to reorganize but holds important stuff.
 *
 * - WeakMap/WeakRef: references that DON'T prevent GC
 *   - Perfect for caches that auto-cleanup
 *   - WeakMap keys get GC'd when no other reference exists
 *
 * 🗣️ WHAT INTERVIEWERS WANT TO HEAR:
 * - "JS uses mark-and-sweep, not reference counting"
 * - "V8 uses generational GC — young space is fast, old space is slower"
 * - "Most objects die young — that's why scavenge is efficient"
 * - "In React, inline objects in JSX cause GC pressure every render"
 * - "WeakMap lets you cache without preventing garbage collection"
 * - "A memory leak means objects are technically still reachable — GC can't help"
 */



// --------------------------------------------------------------
// 4. UI JANK — CAUSES AND FIXES
// --------------------------------------------------------------

/**
 * 🧠 WHAT IS IT?
 * Jank = visible stutter when the browser drops frames.
 * Browser aims for 60fps → each frame gets ~16.6ms budget.
 * If ANY task exceeds that → frame dropped → user sees lag.
 *
 * Think of it like a conveyor belt in a factory. If one station
 * takes too long, the whole line stutters.
 *
 * 🎯 WHY IT MATTERS IN INTERVIEWS:
 * Shows you understand browser rendering pipeline and can fix perf issues.
 *
 * 📌 KEY POINTS:
 *
 * WHAT HAPPENS IN ONE FRAME (must fit in 16.6ms):
 * Input → JS → rAF → Style → Layout → Paint → Composite
 *
 * COMMON CAUSES:
 * 1. Long JS tasks (>50ms) — heavy computation, large re-renders
 * 2. Layout thrashing — reading then writing DOM in a loop
 * 3. Animating expensive properties (width, height, top, left)
 * 4. Non-passive scroll listeners — browser waits for preventDefault
 * 5. Giant DOM (10K+ nodes) — expensive layout calculations
 *
 * FIXES:
 * | Cause                | Fix                                   |
 * |----------------------|---------------------------------------|
 * | Long JS task         | Chunk work + yield (setTimeout/rAF)   |
 * | Layout thrashing     | Batch reads, then batch writes        |
 * | Scroll blocking      | rAF + passive listeners               |
 * | Heavy computation    | Web Workers                           |
 * | Expensive animations | Use ONLY transform/opacity            |
 * | Large DOM            | Virtualization (react-window)          |
 * | React re-renders     | useTransition, memo, useDeferredValue |
 *
 * 💡 KEY RULE: Only animate `transform` and `opacity` — they skip
 *    layout & paint entirely (GPU composited).
 *
 * 🗣️ WHAT INTERVIEWERS WANT TO HEAR:
 * - "60fps = 16.6ms per frame budget"
 * - "Layout thrashing = interleaving DOM reads and writes"
 * - "Only animate transform and opacity for smooth animations"
 * - "Web Workers for CPU-heavy work off main thread"
 * - "React 18 useTransition keeps UI responsive during heavy updates"
 * - "INP (Interaction to Next Paint) < 200ms is the target"
 */

// Classic yield pattern:
async function processInChunks(items, chunkSize = 50) {
  for (let i = 0; i < items.length; i += chunkSize) {
    items.slice(i, i + chunkSize).forEach(item => heavyWork(item));
    await new Promise(r => setTimeout(r, 0)); // Yield to browser
  }
}
function heavyWork(item) { /* ... */ }



// --------------------------------------------------------------
// 5. REACT BUNDLE SIZE OPTIMIZATION
// --------------------------------------------------------------

/**
 * 🧠 WHAT IS IT?
 * Shipping less JavaScript = faster load times.
 * Think of it like packing for a trip — only bring what you'll actually use,
 * and ship heavy items separately to pick up when needed.
 *
 * 🎯 WHY IT MATTERS IN INTERVIEWS:
 * Direct impact on Core Web Vitals (LCP, TTI). Every KB counts on mobile.
 *
 * 📌 KEY POINTS:
 *
 * 1. CODE SPLITTING (biggest win):
 *    - Route-level: React.lazy(() => import('./Page'))
 *    - Component-level: lazy-load heavy editors, charts
 *    - Dynamic import() for conditional features (PDF export, etc.)
 *
 * 2. TREE SHAKING:
 *    - Only works with ES modules (import/export), NOT require()
 *    - import debounce from 'lodash/debounce' (1KB) vs import _ from 'lodash' (70KB)
 *
 * 3. REPLACE HEAVY DEPS:
 *    | Heavy           | Light Alternative        | Savings |
 *    |-----------------|--------------------------|---------|
 *    | moment.js 300KB | dayjs 2KB                | ~99%    |
 *    | lodash 70KB     | lodash-es + cherry-pick  | ~90%    |
 *    | axios 13KB      | native fetch             | 100%    |
 *    | uuid            | crypto.randomUUID()      | 100%    |
 *
 * 4. ANALYZE: webpack-bundle-analyzer, bundlephobia.com
 * 5. BARREL FILES: can defeat tree-shaking — use direct imports
 * 6. COMPRESSION: Brotli > gzip (~15-20% better)
 * 7. VENDOR SPLITTING: separate chunk for deps (changes less, cached longer)
 *
 * 🗣️ WHAT INTERVIEWERS WANT TO HEAR:
 * - "First I run bundle analyzer to find the biggest offenders"
 * - "Route-level code splitting with React.lazy gives the biggest win"
 * - "Tree shaking only works with ES modules"
 * - "I check bundlephobia before adding any dependency"
 * - "Barrel files can silently defeat tree shaking"
 */





// --------------------------------------------------------------
// 6. REACT PERFORMANCE OPTIMIZATION
// --------------------------------------------------------------

/**
 * 🧠 WHAT IS IT?
 * Making React apps fast by reducing unnecessary work.
 * Think of React rendering like a factory: "render" = calling your function,
 * NOT updating the DOM. A wasted render = running the machine for nothing.
 *
 * 🎯 WHY IT MATTERS IN INTERVIEWS:
 * The #1 React interview topic after hooks. Shows production experience.
 *
 * 📌 KEY POINTS:
 *
 * WHEN DOES A COMPONENT RE-RENDER?
 * 1. Its state changes (setState)
 * 2. Its parent re-renders (even if props didn't change!)
 * 3. Context value it consumes changes
 *
 * THE TOOLKIT:
 * | Technique         | What it solves                         |
 * |-------------------|----------------------------------------|
 * | React.memo        | Unnecessary child re-renders           |
 * | useMemo           | Expensive recomputation + stable refs  |
 * | useCallback       | Stable function refs for memo'd children|
 * | Virtualization    | Large lists (DOM bloat)                |
 * | State colocation  | Sibling re-renders from lifted state   |
 * | Context splitting | Context re-render cascades             |
 * | useTransition     | Blocking UI during heavy updates       |
 * | Code splitting    | Initial bundle size                    |
 *
 * 💡 ANALOGY: React.memo is like a bouncer at a club door.
 *    "Are your props different from last time? No? You can't come in (re-render)."
 *
 * ANTI-PATTERNS TO AVOID:
 * - Inline objects in JSX: <Chart data={{labels, values}}/> → new ref every render
 * - Index as key in dynamic lists → breaks reconciliation
 * - Deriving state in useEffect instead of computing during render
 * - Single giant Context → re-renders ALL consumers on any change
 *
 * STATE COLOCATION (simplest win):
 * Keep state close to where it's used. If only SearchInput + Results
 * need `query`, don't put it in App (would re-render Header, Footer too).
 *
 * 🗣️ WHAT INTERVIEWERS WANT TO HEAR:
 * - "I profile first with React DevTools before optimizing"
 * - "Most issues come from unnecessary re-renders — memo + stable refs fix it"
 * - "State colocation is the simplest win"
 * - "For large lists, virtualization is non-negotiable"
 * - "Context should be split by update frequency"
 * - "Derived state should be computed during render, not in useEffect"
 */



// --------------------------------------------------------------
// 7. WHAT HAPPENS WHEN YOU TYPE A URL AND HIT ENTER?
// --------------------------------------------------------------

/**
 * 🧠 WHAT IS IT?
 * The full journey from keystroke to rendered pixels.
 * Think of it like ordering a package online — DNS is looking up the address,
 * TCP is establishing the delivery route, TLS is locking the package,
 * HTTP is the actual delivery, and rendering is unpacking it.
 *
 * 🎯 WHY IT MATTERS IN INTERVIEWS:
 * THE classic full-stack question. Depth on any layer shows seniority.
 *
 * 📌 THE FULL TIMELINE:
 *
 * 1. URL PARSE + HSTS CHECK (~0ms)
 *    - Browser checks if it's a URL or search query
 *    - HSTS: auto-upgrades http → https for known domains
 *
 * 2. DNS RESOLUTION (0-100ms)
 *    - Domain → IP address
 *    - Cache hierarchy: Browser → OS → Router → ISP → Root → TLD → Authoritative
 *    - Optimization: <link rel="dns-prefetch">
 *
 * 3. TCP HANDSHAKE (1 RTT, ~10-50ms)
 *    - SYN → SYN-ACK → ACK (three-way handshake)
 *    - Both sides confirm they can send AND receive
 *
 * 4. TLS HANDSHAKE (1-2 RTT, ~50ms)
 *    - Exchange certificates, agree on encryption
 *    - TLS 1.3 reduced to 1-RTT (0-RTT for repeat visits)
 *
 * 5. HTTP REQUEST
 *    - GET /page with headers (cookies, accept-encoding, etc.)
 *    - HTTP/2: multiplexing, header compression, binary framing
 *
 * 6. SERVER PROCESSING (50-500ms)
 *    - Load balancer → Web server → App server → Database/Cache → Response
 *
 * 7. HTTP RESPONSE
 *    - HTML bytes + headers (Cache-Control, ETag, Content-Encoding)
 *    - CDN may serve from edge (much faster)
 *
 * 8. CRITICAL RENDERING PATH:
 *    HTML → DOM tree
 *    CSS → CSSOM tree
 *    DOM + CSSOM → Render tree → Layout → Paint → Composite
 *
 *    KEY BLOCKERS:
 *    - <script> blocks HTML parsing (unless async/defer)
 *    - CSS is render-blocking (browser won't paint until CSSOM is ready)
 *
 * 9. JS EXECUTION + HYDRATION
 *    - React hydrates server-rendered HTML (attaches event listeners)
 *    - Lazy chunks loaded as needed
 *
 * SCRIPT LOADING:
 * | Attribute | Download     | Execute              | Order? |
 * |-----------|--------------|----------------------|--------|
 * | (none)    | Blocks parse | Immediately          | Yes    |
 * | defer     | Parallel     | After DOM parsed     | Yes    |
 * | async     | Parallel     | ASAP (interrupts)    | No     |
 *
 * 🗣️ WHAT INTERVIEWERS WANT TO HEAR:
 * - Frontend: Critical rendering path, async/defer, CSS blocking, hydration
 * - Backend: DNS hierarchy, TCP/TLS, load balancing, caching layers
 * - "defer for scripts needing DOM, async for independent scripts (analytics)"
 * - "CSS blocks rendering, scripts block parsing"
 */



// --------------------------------------------------------------
// 8. THE EVENT LOOP
// --------------------------------------------------------------

/**
 * 🧠 WHAT IS IT?
 * JS is single-threaded but handles async via the event loop.
 * Think of it like a restaurant with ONE chef (call stack).
 * Orders go to the kitchen (Web APIs), and when ready, they wait
 * in a queue. The chef handles them when the current dish is done.
 *
 * Microtasks = VIP queue (served between EVERY dish).
 * Macrotasks = regular queue (one per round).
 *
 * 🎯 WHY IT MATTERS IN INTERVIEWS:
 * Classic "what's the output?" questions. Tests async understanding.
 *
 * 📌 KEY POINTS:
 *
 * COMPONENTS:
 * 1. Call Stack — where code executes (one thing at a time)
 * 2. Microtask Queue — Promise.then, queueMicrotask, MutationObserver
 * 3. Macrotask Queue — setTimeout, setInterval, I/O, UI events
 * 4. Web APIs — browser-provided (timers, fetch, DOM events)
 *
 * THE ALGORITHM (each loop iteration):
 * 1. Run all synchronous code on call stack
 * 2. Drain ENTIRE microtask queue (including newly added ones!)
 * 3. Pick ONE macrotask → execute it
 * 4. Drain microtask queue again
 * 5. Render/paint if needed (rAF runs here)
 * 6. Repeat
 *
 * PRIORITY ORDER:
 * Sync > Microtasks > requestAnimationFrame > Macrotasks
 *
 * 🗣️ WHAT INTERVIEWERS WANT TO HEAR:
 * - "Microtasks ALWAYS run before the next macrotask"
 * - "Promise.then = microtask, setTimeout = macrotask"
 * - "async/await: code after await is scheduled as a microtask"
 * - "rAF fires before paint but after microtasks"
 * - "Infinite microtasks starve rendering and macrotasks"
 */

// CLASSIC OUTPUT QUESTION:
console.log('1');                          // Sync
setTimeout(() => console.log('2'), 0);    // Macrotask
Promise.resolve().then(() => {
  console.log('3');                        // Microtask
  Promise.resolve().then(() => console.log('4')); // Nested microtask
});
console.log('5');                          // Sync
// OUTPUT: 1, 5, 3, 4, 2

// ASYNC/AWAIT OUTPUT QUESTION:
async function asyncFn() {
  console.log('A');              // Sync (before await)
  await Promise.resolve();       // Yields here
  console.log('B');              // Microtask (after await)
}
console.log('C');
setTimeout(() => console.log('D'), 0);
asyncFn();
console.log('E');
// OUTPUT: C, A, E, B, D



// --------------------------------------------------------------
// 9. CLOSURES, SCOPE & HOISTING
// --------------------------------------------------------------

/**
 * 🧠 WHAT IS IT?
 * CLOSURE: A function that remembers variables from where it was born,
 * even after that birthplace (outer function) is gone.
 * Think of it like a backpack — the inner function carries its outer
 * scope's variables around wherever it goes.
 *
 * SCOPE: Where variables are visible. JS uses LEXICAL scoping
 * (determined by where code is written, not where it's called).
 *
 * HOISTING: Declarations move to the top of their scope during compilation.
 *
 * 🎯 WHY IT MATTERS IN INTERVIEWS:
 * The #1 JS concept question. Expected at every level.
 *
 * 📌 KEY POINTS:
 *
 * SCOPE TYPES:
 * - Global: accessible everywhere
 * - Function: var lives here
 * - Block: let/const live here ({})
 * - Lexical: inner functions access outer variables
 *
 * HOISTING TABLE:
 * | Declaration          | Hoisted? | Initialized?         |
 * |----------------------|----------|----------------------|
 * | var                  | ✅ Yes   | undefined            |
 * | let/const            | ✅ Yes   | ❌ No (TDZ)         |
 * | function declaration | ✅ Yes   | ✅ Fully (body too) |
 * | function expression  | var only | undefined            |
 *
 * TDZ (Temporal Dead Zone): let/const exist but accessing them
 * before declaration → ReferenceError.
 *
 * PRACTICAL CLOSURE USES:
 * - Data privacy (module pattern)
 * - Function factories (multiply(2) → double)
 * - Memoization, debounce, throttle, once
 * - Currying
 *
 * 🗣️ WHAT INTERVIEWERS WANT TO HEAR:
 * - "A closure is a function + its lexical environment"
 * - "var is function-scoped, let/const are block-scoped"
 * - "The classic for-loop problem is fixed with let or IIFE"
 * - "Closures enable data privacy and function factories"
 * - "Each call to the outer function creates a NEW closure"
 */

// THE CLASSIC INTERVIEW QUESTION:
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 1000);
}
// OUTPUT: 3, 3, 3 (var is shared across all iterations)

// FIX with let (new binding per iteration):
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 1000);
}
// OUTPUT: 0, 1, 2

// Closure for data privacy:
function createCounter() {
  let count = 0; // Private!
  return {
    increment: () => ++count,
    getCount: () => count,
  };
}

// Memoize pattern (closure holds cache):
function memoize(fn) {
  const cache = new Map();
  return function (...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

// Debounce (closure holds timeoutId):
function debounce(fn, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}





// --------------------------------------------------------------
// 10. THIS KEYWORD, CALL, APPLY, BIND
// --------------------------------------------------------------

/**
 * 🧠 WHAT IS IT?
 * `this` is determined by HOW a function is CALLED, not where it's defined.
 * Think of `this` like the word "I" — it changes meaning depending on
 * who's speaking (who's calling the function).
 *
 * 🎯 WHY IT MATTERS IN INTERVIEWS:
 * Classic JS gotcha. Tests understanding of execution context.
 *
 * 📌 KEY POINTS:
 *
 * RULES (in priority order):
 * 1. new Fn()        → this = brand new object
 * 2. call/apply/bind → this = specified object
 * 3. obj.method()    → this = obj (left of the dot)
 * 4. standalone fn() → this = window (undefined in strict mode)
 * 5. Arrow function  → this = lexical (inherited, NEVER changes)
 *
 * | Method | Executes immediately? | Args format      |
 * |--------|----------------------|------------------|
 * | call   | ✅ Yes               | comma-separated  |
 * | apply  | ✅ Yes               | array            |
 * | bind   | ❌ No (returns fn)   | comma-separated  |
 *
 * 💡 ARROW FUNCTIONS: They don't have their own `this`.
 *    They inherit from the enclosing scope. This is WHY they work
 *    perfectly as callbacks but FAIL as object methods.
 *
 * 🗣️ WHAT INTERVIEWERS WANT TO HEAR:
 * - "this is determined at call-time, not definition-time"
 * - "Arrow functions lexically bind this — they inherit from parent scope"
 * - "call/apply invoke immediately, bind returns a new function"
 * - "In event handlers, this = the element (unless arrow function)"
 */



// this binding examples:
const person = {
  name: 'Alice',
  greet() { console.log(this.name); },          // this = person
  greetArrow: () => console.log(this.name),      // this = window/undefined (lexical!)
};
person.greet();       // "Alice"
person.greetArrow();  // undefined (arrow inherits outer this, NOT person)

const greet = person.greet;
greet(); // undefined — standalone call, this = window (undefined in strict)

// call vs apply vs bind:
function introduce(greeting, punctuation) {
  return `${greeting}, I'm ${this.name}${punctuation}`;
}
introduce.call(person, 'Hi', '!');    // "Hi, I'm Alice!" — executes now
introduce.apply(person, ['Hi', '!']); // "Hi, I'm Alice!" — args as array
const boundFn = introduce.bind(person, 'Hey'); // returns NEW function
boundFn('.');                          // "Hey, I'm Alice."



// --------------------------------------------------------------
// 11. PROTOTYPES & INHERITANCE
// --------------------------------------------------------------

/**
 * 🧠 WHAT IS IT?
 * JS uses prototypal inheritance — objects link to other objects.
 * Think of it like a family tree. If you don't have a recipe (property),
 * you ask your parent. If they don't have it, they ask THEIR parent.
 * Chain continues until null (the ancestor of all).
 *
 * 🎯 WHY IT MATTERS IN INTERVIEWS:
 * Explains how JS "classes" actually work under the hood.
 *
 * 📌 KEY POINTS:
 * - Every object has a hidden [[Prototype]] (accessible via __proto__)
 * - Property lookup walks the prototype chain until found or null
 * - ES6 `class` is syntactic sugar over prototype-based inheritance
 * - Object.create(proto) creates object with specified prototype
 * - hasOwnProperty() checks OWN properties (not inherited)
 * - instanceof walks the prototype chain
 *
 * 💡 ANALOGY: Prototypes are like CSS inheritance.
 *    A <span> inside a <div> "inherits" the font from <div>.
 *    It can override, but if it doesn't define its own, it looks up.
 *
 * 🗣️ WHAT INTERVIEWERS WANT TO HEAR:
 * - "JS doesn't have classical inheritance — it's objects linking to objects"
 * - "Property lookup walks the chain: own → prototype → prototype → null"
 * - "ES6 class is sugar — under the hood it's still prototypes"
 * - "hasOwnProperty distinguishes own vs inherited properties"
 */



// --------------------------------------------------------------
// 12. REACT HOOKS DEEP DIVE
// --------------------------------------------------------------

/**
 * 🧠 WHAT IS IT?
 * Hooks let function components have state and side effects.
 * Think of them as superpowers you "hook into" React's internals.
 *
 * 🎯 WHY IT MATTERS IN INTERVIEWS:
 * You'll be asked about hook rules, edge cases, and custom hooks.
 *
 * 📌 KEY POINTS:
 *
 * CORE HOOKS:
 * - useState: state that triggers re-render
 * - useEffect: side effects (API calls, subscriptions, DOM mutations)
 *   - [] deps = run once on mount
 *   - [dep] = run when dep changes
 *   - return fn = cleanup (runs before next effect AND on unmount)
 * - useRef: mutable value that persists WITHOUT triggering re-render
 *   - DOM refs: ref={myRef} → myRef.current = DOM node
 *   - Instance vars: store previous values, timers, flags
 * - useMemo: cache expensive computation (recomputes only when deps change)
 * - useCallback: cache function reference (prevents child re-renders)
 * - useContext: consume context value
 * - useReducer: complex state logic (like a mini Redux)
 *
 * ADVANCED HOOKS:
 * - useLayoutEffect: fires BEFORE paint (synchronous) — for DOM measurement
 * - useTransition: mark state updates as non-urgent (keeps UI responsive)
 * - useDeferredValue: defer expensive child renders
 * - useImperativeHandle + forwardRef: control what parent accesses via ref
 *
 * HOOK RULES:
 * 1. Only call at top level (not in loops, conditions, nested functions)
 * 2. Only call in React functions (components or custom hooks)
 *
 * forwardRef + useImperativeHandle:
 * - forwardRef: pass a ref from parent to a child's DOM node
 * - useImperativeHandle: customize what the ref exposes to parent
 *   (e.g., only expose .focus() and .scrollTo(), not the full DOM node)
 *
 * 🗣️ WHAT INTERVIEWERS WANT TO HEAR:
 * - "useEffect with empty deps = componentDidMount equivalent"
 * - "useRef doesn't trigger re-renders — use for DOM refs and instance vars"
 * - "useLayoutEffect runs synchronously before paint — useEffect is async after"
 * - "useImperativeHandle limits what parent can do with the ref (encapsulation)"
 * - "Hooks must be called in the same order every render (linked list internally)"
 */



// --------------------------------------------------------------
// 13. CSS FLEXBOX vs GRID
// --------------------------------------------------------------

/**
 * 🧠 WHAT IS IT?
 * Two CSS layout systems that solve different problems.
 * FLEXBOX = 1D (row OR column). GRID = 2D (rows AND columns).
 *
 * Think of Flexbox like arranging books on a single shelf.
 * Think of Grid like arranging furniture in a room (floor plan).
 *
 * 🎯 WHY IT MATTERS IN INTERVIEWS:
 * You'll be asked to implement layouts and explain your choice.
 *
 * 📌 KEY POINTS:
 *
 * | Scenario                  | Use     |
 * |---------------------------|---------|
 * | Navigation bar            | Flexbox |
 * | Card row (wrapping)       | Flexbox |
 * | Centering one item        | Flexbox |
 * | Full page layout          | Grid    |
 * | Overlapping items         | Grid    |
 * | Items align in both axes  | Grid    |
 * | Content dictates size     | Flexbox |
 * | Layout dictates size      | Grid    |
 *
 * FLEXBOX CHEAT:
 * - justify-content → MAIN axis (horizontal in row)
 * - align-items → CROSS axis (vertical in row)
 * - flex: 1 → grow equally (basis: 0)
 * - flex: none → fixed size
 * - gap: modern spacing (no margin hacks)
 *
 * GRID CHEAT:
 * - repeat(auto-fit, minmax(250px, 1fr)) → responsive without media queries!
 * - grid-template-areas → named visual layout (super readable)
 * - fr unit → fraction of available space
 * - auto-fill keeps empty tracks, auto-fit collapses them
 *
 * 💡 They're COMPLEMENTARY: Grid for page layout, Flexbox for components.
 *
 * 🗣️ WHAT INTERVIEWERS WANT TO HEAR:
 * - "Flexbox is 1D, Grid is 2D — I use both together"
 * - "repeat(auto-fit, minmax(250px, 1fr)) = responsive grid without media queries"
 * - "justify-content = main axis, align-items = cross axis"
 * - "flex: 1 means grow equally, flex: none means fixed size"
 * - "Grid areas make complex layouts readable and maintainable"
 */



// --------------------------------------------------------------
// 14. WEB SECURITY (XSS, CSRF)
// --------------------------------------------------------------

/**
 * 🧠 WHAT IS IT?
 * XSS = attacker injects malicious scripts into YOUR page.
 * CSRF = attacker tricks user's browser into making requests on their behalf.
 *
 * XSS analogy: Someone slips a fake note into a trusted newspaper.
 * CSRF analogy: Someone forges a letter with your signature.
 *
 * 🎯 WHY IT MATTERS IN INTERVIEWS:
 * Security awareness is expected at mid-senior level.
 *
 * 📌 KEY POINTS:
 *
 * XSS (Cross-Site Scripting):
 * - Stored XSS: script saved in DB, served to all users
 * - Reflected XSS: script in URL params, reflected in page
 * - DOM XSS: script manipulates DOM directly (innerHTML)
 * - PREVENTION:
 *   - Escape/sanitize all user input before rendering
 *   - React auto-escapes JSX (safe by default)
 *   - NEVER use dangerouslySetInnerHTML with user data
 *   - Content Security Policy (CSP) header
 *   - Use DOMPurify for HTML that MUST be rendered
 *
 * CSRF (Cross-Site Request Forgery):
 * - Attacker's page triggers request to YOUR API (using user's cookies)
 * - PREVENTION:
 *   - CSRF tokens (unique per session/request)
 *   - SameSite cookie attribute (Lax or Strict)
 *   - Check Origin/Referer headers
 *   - Don't use GET for state-changing operations
 *
 * 🗣️ WHAT INTERVIEWERS WANT TO HEAR:
 * - "React auto-escapes JSX — dangerouslySetInnerHTML is the XSS risk"
 * - "CSP header restricts what scripts can run — strongest XSS defense"
 * - "SameSite=Lax cookies prevent most CSRF without tokens"
 * - "Never trust user input — sanitize on both client AND server"
 */



// --------------------------------------------------------------
// 15. STATE MANAGEMENT — WHEN TO USE WHAT
// --------------------------------------------------------------

/**
 * 🧠 WHAT IS IT?
 * Choosing the right tool for managing data in your React app.
 * Think of it like storage in a house — some things go in your pocket
 * (local state), some on a shared shelf (context), some in a filing
 * cabinet (global store), and server data belongs in the cloud.
 *
 * 🎯 WHY IT MATTERS IN INTERVIEWS:
 * Shows architectural thinking. Wrong choice = unnecessary complexity.
 *
 * 📌 KEY POINTS:
 *
 * | Data Type          | Solution                              |
 * |--------------------|---------------------------------------|
 * | Server/async data  | TanStack Query / SWR / RTK Query      |
 * | Local UI state     | useState                              |
 * | Complex local      | useReducer                            |
 * | Shared (few users) | Context + useReducer                  |
 * | Global client state| Zustand / Jotai / Redux Toolkit       |
 * | Form state         | React Hook Form / controlled inputs   |
 * | URL state          | useSearchParams / router state        |
 *
 * ⚠️ CONTEXT IS NOT A STATE MANAGER:
 * - It's a dependency injection tool
 * - ANY change re-renders ALL consumers
 * - Fine for rarely-changing data (theme, auth, locale)
 * - Terrible for frequently-updating data (form inputs, counters)
 *
 * 🗣️ WHAT INTERVIEWERS WANT TO HEAR:
 * - "Server state belongs in TanStack Query — it handles caching, refetching, stale"
 * - "Context re-renders all consumers — split contexts by update frequency"
 * - "useState for local, Zustand/Redux for truly global client state"
 * - "Most apps over-use global state — start local, lift only when needed"
 */





// --------------------------------------------------------------
// 16. SEMANTIC HTML & ACCESSIBILITY
// --------------------------------------------------------------

/**
 * 🧠 WHAT IS IT?
 * Using HTML elements for their MEANING, not appearance.
 * <button> means "clickable action", <nav> means "navigation links".
 *
 * Think of semantic HTML like proper labeling in a grocery store.
 * A blind shopper (screen reader) relies on labels to find what they need.
 * If everything is in unlabeled boxes (divs), they're lost.
 *
 * 🎯 WHY IT MATTERS IN INTERVIEWS:
 * Machine coding rounds specifically evaluate semantic HTML usage.
 *
 * 📌 KEY POINTS:
 *
 * USE SEMANTIC ELEMENTS:
 * - <header>, <nav>, <main>, <aside>, <footer> → page structure
 * - <article> → self-contained (blog post, comment, product card)
 * - <section> → thematic grouping WITH a heading
 * - <button> → clickable actions (NOT <div onClick>!)
 * - <details>/<summary> → native accordion (no JS needed)
 * - <dialog> → native modal (showModal() traps focus automatically)
 *
 * ACCESSIBILITY ESSENTIALS:
 * - Every input needs a <label> (placeholder is NOT a label!)
 * - Color contrast: 4.5:1 for text, 3:1 for UI components
 * - Never color-only information (add icons, text, aria)
 * - All interactive elements must be keyboard accessible
 * - aria-live="polite" announces dynamic content changes
 * - Focus trapping in modals, focus return on close
 * - Skip links for keyboard users
 *
 * KEYBOARD EXPECTATIONS:
 * - Tab: move focus | Enter/Space: activate | Escape: close/dismiss
 * - tabindex="0": add to tab order | tabindex="-1": JS-focusable only
 *
 * ARIA RULES:
 * - First rule: DON'T use ARIA if native HTML works
 * - aria-label: accessible name when no visible text
 * - aria-expanded: toggle state for dropdowns
 * - aria-invalid + aria-describedby: link errors to inputs
 *
 * 🗣️ WHAT INTERVIEWERS WANT TO HEAR:
 * - "<button> gives free keyboard access, focus, and ARIA roles"
 * - "One <main> per page, headings in sequential order (no skipping)"
 * - "ARIA is a last resort — semantic HTML gives accessibility for free"
 * - "I test with keyboard navigation, Lighthouse, and screen reader"
 */



// --------------------------------------------------------------
// 17. CORS
// --------------------------------------------------------------

/**
 * 🧠 WHAT IS IT?
 * Browser security that blocks requests to different origins.
 * Same Origin = same protocol + host + port.
 *
 * Think of it like a nightclub bouncer checking IDs.
 * The BROWSER is the bouncer. It asks the SERVER: "Is this person (origin)
 * allowed in?" The server responds with Access-Control headers.
 *
 * 🎯 WHY IT MATTERS IN INTERVIEWS:
 * Every frontend dev hits CORS errors. Understanding shows real experience.
 *
 * 📌 KEY POINTS:
 * - CORS is a BROWSER mechanism (server-to-server has no CORS)
 * - Simple requests (GET, POST with simple headers) go through directly
 * - Complex requests trigger a PREFLIGHT (OPTIONS request first)
 *   - Browser asks: "Can I send a POST with custom headers?"
 *   - Server responds with allowed methods, headers, origins
 * - Server sets: Access-Control-Allow-Origin, Allow-Methods, Allow-Headers
 * - credentials: 'include' sends cookies (requires explicit server allow)
 *
 * DEV SOLUTIONS:
 * - Proxy in dev server (Vite/CRA proxy config)
 * - Backend adds CORS headers for your origin
 *
 * PRODUCTION:
 * - Whitelist specific origins (never use * with credentials)
 * - API gateway handles CORS headers
 *
 * 🗣️ WHAT INTERVIEWERS WANT TO HEAR:
 * - "CORS is browser-enforced — curl and servers don't have CORS"
 * - "Preflight OPTIONS is sent for non-simple requests"
 * - "Server must explicitly allow the origin, methods, and headers"
 * - "In dev I use a proxy, in prod I whitelist origins on the server"
 */



// --------------------------------------------------------------
// 18. CANVAS vs DOM RENDERING
// --------------------------------------------------------------

/**
 * 🧠 WHAT IS IT?
 * DOM = browser tracks every element (retained mode).
 * Canvas = you draw pixels, browser forgets (immediate mode).
 *
 * Think of DOM like a puppet show — each puppet (element) stays on stage.
 * Canvas is like a flipbook — you draw each frame from scratch.
 *
 * 🎯 WHY IT MATTERS IN INTERVIEWS:
 * Shows you understand rendering tradeoffs and when to reach for Canvas.
 *
 * 📌 KEY POINTS:
 *
 * | Aspect           | DOM                  | Canvas                 |
 * |------------------|----------------------|------------------------|
 * | Model            | Retained (tracked)   | Immediate (draw+forget)|
 * | Layout engine    | Yes (reflow/repaint) | No                     |
 * | Events           | Built-in (click etc) | Manual hit detection   |
 * | Accessibility    | ✅ Native            | ❌ Must add manually   |
 * | 10K+ elements    | Slow                 | Fast                   |
 * | 60fps animation  | Hard                 | Natural                |
 * | Text/SEO         | Excellent            | Basic                  |
 *
 * USE CANVAS: Games, maps, data visualizations, particle systems, image editors
 * USE DOM: UI, forms, text content, anything needing accessibility
 * HYBRID: Figma uses Canvas for design surface + DOM for panels/menus
 *
 * 🗣️ WHAT INTERVIEWERS WANT TO HEAR:
 * - "Canvas skips layout/reflow — faster for thousands of elements"
 * - "DOM is better for text, interactions, and accessibility"
 * - "Modern apps use hybrid approach (Canvas + DOM overlays)"
 */



// --------------------------------------------------------------
// 19. MACHINE CODING ROUND STRATEGY
// --------------------------------------------------------------

/**
 * 🧠 WHAT IS IT?
 * Build a functional UI feature in 1-2 hours.
 * NOT about perfection — about structured, incremental delivery.
 *
 * 🎯 WHY IT MATTERS IN INTERVIEWS:
 * This IS the interview. Your approach matters as much as the code.
 *
 * 📌 STRATEGY:
 *
 * FIRST 10 MINUTES (don't code yet!):
 * 1. Read problem completely
 * 2. Ask: Responsive? Pagination? Accessibility? API or mock data?
 * 3. Plan component structure in comments
 * 4. Prioritize: working > perfect
 *
 * BUILD ORDER:
 * 1. Skeleton UI (semantic HTML structure)
 * 2. Core functionality
 * 3. Responsiveness
 * 4. Edge cases
 * 5. Polish (if time permits)
 *
 * WHAT THEY EVALUATE:
 * - Semantic HTML (<header>, <nav>, <button>, NOT div soup)
 * - CSS: Flexbox/Grid (NOT position hacks)
 * - JS: Clean separation, event delegation, error handling
 * - Component design: single responsibility, proper keys
 * - Modern JS: optional chaining, destructuring, async/await
 *
 * COMMON PROBLEMS:
 * Email client, chat interface, kanban board, file explorer,
 * notification system, search with autocomplete, infinite scroll
 *
 * 💡 A working 80% solution ALWAYS beats an incomplete "perfect architecture."
 *
 * 🗣️ KEY PRINCIPLES:
 * - "I spend first 5-10 min understanding requirements before coding"
 * - "Semantic HTML shows I understand web fundamentals"
 * - "I build incrementally — skeleton first, features next"
 */



// --------------------------------------------------------------
// 20. LOW-LEVEL DESIGN (LLD) FOR FRONTEND
// --------------------------------------------------------------

/**
 * 🧠 WHAT IS IT?
 * Model a system using OOP: identify entities, behaviors, relationships.
 * Think of it like designing LEGO sets — what pieces (classes) do you need,
 * and how do they snap together?
 *
 * 🎯 WHY IT MATTERS IN INTERVIEWS:
 * Tests class design, SOLID principles, and extensibility thinking.
 *
 * 📌 APPROACH:
 * 1. Identify ENTITIES (nouns in the problem)
 * 2. Identify BEHAVIORS (verbs/actions)
 * 3. Define RELATIONSHIPS (has-a, is-a, uses)
 * 4. Apply SOLID principles
 * 5. Consider extensibility ("What if we add multiplayer?")
 *
 * SOLID:
 * - S: Single Responsibility (Dice only rolls, Board only tracks positions)
 * - O: Open/Closed (extend without modifying existing code)
 * - L: Liskov Substitution (subtypes are interchangeable)
 * - I: Interface Segregation (don't force unused methods)
 * - D: Dependency Inversion (depend on abstractions)
 *
 * SCALABILITY FOLLOW-UPS:
 * - "Support multiplayer?" → Event system + WebSocket sync
 * - "Custom configurations?" → Factory pattern
 * - "AI players?" → Strategy pattern for different difficulties
 * - "Undo/Redo?" → Command pattern (store moves as objects)
 *
 * 🗣️ WHAT INTERVIEWERS WANT TO HEAR:
 * - "I identify entities first, then behaviors, then relationships"
 * - "Each class has a single responsibility"
 * - "I design for extension — new features shouldn't modify existing code"
 * - "Composition over inheritance where possible"
 */



// --------------------------------------------------------------
// 21. SLIDING WINDOW / REAL-TIME AGGREGATION
// --------------------------------------------------------------

/**
 * 🧠 WHAT IS IT?
 * Count events within a moving time window efficiently.
 * Think of it like a treadmill display showing "calories in last 60 min" —
 * it constantly drops old minutes and adds new ones.
 *
 * 🎯 WHY IT MATTERS IN INTERVIEWS:
 * System design question testing data structure choice and scalability.
 *
 * 📌 KEY POINTS:
 *
 * APPROACH: Time-bucketed circular buffer
 * - Divide 1 hour into 60 buckets (1-min each)
 * - Each bucket stores count for that minute
 * - Total = sum of all 60 buckets
 * - Expire old buckets as time advances
 * - Memory per word: 60 × 8 bytes = 480 bytes
 *
 * SCALING:
 * - Shard by word (consistent hashing across servers)
 * - Local count + periodic flush (reduce network overhead)
 * - Count-Min Sketch for approximate counting at extreme scale
 *
 * FRONTEND ANGLE (dashboard):
 * - Backend pushes aggregated data via WebSocket
 * - Batch WebSocket messages using rAF (avoid render thrashing)
 * - Canvas-based charts for real-time 60fps updates
 * - Web Worker for JSON parsing off main thread
 * - Virtualize word list if tracking 1000+ words
 *
 * 🗣️ WHAT INTERVIEWERS WANT TO HEAR:
 * - "Time-bucketed circular buffer — O(1) space per word"
 * - "Shard by word across servers using consistent hashing"
 * - "Frontend receives aggregated data — it doesn't process raw events"
 * - "Batch WebSocket messages with rAF to avoid render thrashing"
 */



// --------------------------------------------------------------
// 22. ES6+ FEATURES
// --------------------------------------------------------------

/**
 * 🧠 WHAT IS IT?
 * The modern JavaScript features you MUST know. ES6 (2015) was the
 * biggest update ever. Think of it as JS growing up from a scripting
 * language into a proper programming language.
 *
 * 🎯 WHY IT MATTERS IN INTERVIEWS:
 * Expected fluency. Using modern features shows you write current code.
 *
 * 📌 KEY FEATURES:
 *
 * 1. LET/CONST vs VAR:
 * | Feature      | var          | let        | const      |
 * |--------------|--------------|------------|------------|
 * | Scope        | Function     | Block      | Block      |
 * | Hoisted      | Yes(undefined)| Yes(TDZ)  | Yes(TDZ)   |
 * | Reassign     | ✅           | ✅         | ❌         |
 * | window prop  | ✅           | ❌         | ❌         |
 *
 * const prevents REASSIGNMENT, not mutation:
 * const arr = [1,2]; arr.push(3); // ✅ works
 *
 * 2. ARROW FUNCTIONS:
 * - Lexical `this` (inherits from parent — no own this)
 * - No arguments object, no prototype, can't be constructor
 * - Use for: callbacks, array methods, preserving this
 * - DON'T use for: object methods, constructors
 *
 * 3. DESTRUCTURING:
 * - const { name, age = 25 } = user; // with default
 * - const [first, , third] = array;  // skip elements
 * - function fn({ name, role = 'user' } = {}) {} // param destructuring
 *
 * 4. SPREAD/REST (...):
 * - Spread: expands → const merged = { ...a, ...b } (later wins)
 * - Rest: collects → function sum(...nums) { }
 * - ⚠️ SHALLOW copy only! Use structuredClone() for deep.
 *
 * 5. PROMISES & ASYNC/AWAIT:
 * | Combinator       | Resolves when...         | Rejects when...      |
 * |------------------|--------------------------|----------------------|
 * | Promise.all      | ALL resolve              | ANY rejects          |
 * | Promise.allSettled| ALL settle               | NEVER                |
 * | Promise.race     | FIRST settles            | FIRST settles        |
 * | Promise.any      | FIRST resolves           | ALL reject           |
 *
 * 6. OPTIONAL CHAINING & NULLISH COALESCING:
 * - user?.address?.city  → undefined if any part is null/undefined
 * - value ?? 'default'   → default ONLY for null/undefined
 * - value || 'default'   → default for ALL falsy (0, '', false too!)
 * - USE ?? when 0 or "" are valid values
 *
 * 7. MAP/SET:
 * - Map: any key type, guaranteed order, O(1) .size, no prototype pollution
 * - Set: unique values only → [...new Set(arr)] deduplicates
 * - WeakMap: keys are weakly held (auto GC when no other reference)
 *
 * 8. MODERN (ES2022-2024):
 * - .at(-1) → last element
 * - toSorted(), toReversed() → immutable versions
 * - Object.groupBy(arr, fn) → group items
 * - structuredClone() → deep copy (handles cycles, dates)
 * - Promise.withResolvers() → cleaner promise construction
 *
 * 🗣️ WHAT INTERVIEWERS WANT TO HEAR:
 * - "let/const are block-scoped with TDZ, var is function-scoped"
 * - "Arrow functions lexically bind this — no own this or arguments"
 * - "Spread creates SHALLOW copies — structuredClone for deep"
 * - "?? only checks null/undefined, || checks all falsy"
 * - "Map over Object when keys aren't strings or you need frequent add/delete"
 * - "ES Modules enable tree-shaking via static analysis"
 */

// Key code examples:

// Optional chaining vs nullish coalescing:
const value1 = 0 ?? 'default';  // 0 (NOT "default" — 0 is valid!)
const value2 = 0 || 'default';  // "default" (0 is falsy — WRONG if 0 is valid)

// Promise.all for parallel requests:
async function loadDashboard() {
  const [users, posts] = await Promise.all([
    fetch('/api/users').then(r => r.json()),
    fetch('/api/posts').then(r => r.json()),
  ]);
}

// Immutable array methods (ES2023):
const original = [3, 1, 2];
const sorted = original.toSorted(); // [1,2,3] — original unchanged!

// Destructuring with defaults (interview favorite):
function createUser({ name, age, role = 'viewer' } = {}) {
  return { name, age, role };
}
createUser({ name: 'Bob', age: 25 }); // { name: 'Bob', age: 25, role: 'viewer' }
createUser(); // Works! Default {} prevents crash on no args

// Rest to remove properties (immutable pattern):
const user = { id: 1, name: 'Alice', password: 'secret' };
const { password: _removed, ...safeUser } = user;
// safeUser = { id: 1, name: 'Alice' } — password gone

// Tagged templates (used in styled-components, GraphQL):
function highlight(strings, ...values) {
  return strings.reduce((r, s, i) =>
    r + s + (values[i] ? `<mark>${values[i]}</mark>` : ''), '');
}
const lib = 'React';
highlight`Using ${lib} today`; // "Using <mark>React</mark> today"

// Proxy (powers Vue 3 reactivity):
const validated = new Proxy({}, {
  set(target, prop, value) {
    if (prop === 'age' && typeof value !== 'number')
      throw new TypeError('Age must be a number');
    target[prop] = value;
    return true;
  }
});
validated.age = 25;   // ✅
// validated.age = "old"; // ❌ TypeError

// Generator (lazy evaluation):
function* fibonacci() {
  let [a, b] = [0, 1];
  while (true) { yield a; [a, b] = [b, a + b]; }
}
const fib = fibonacci();
fib.next().value; // 0
fib.next().value; // 1
fib.next().value; // 1
fib.next().value; // 2





// --------------------------------------------------------------
// 23. CLOSURES — DEEP DIVE
// --------------------------------------------------------------

/**
 * 🧠 WHAT IS IT?
 * A function that remembers variables from where it was CREATED,
 * even after that outer function has finished executing.
 *
 * 💡 ANALOGY: A closure is like a student who graduated (outer function returned)
 *    but still has their student ID card (access to outer variables).
 *    The school (memory) keeps their record alive because the card exists.
 *
 * 🎯 WHY IT MATTERS IN INTERVIEWS:
 * THE most asked JS concept. Expect tricky output questions + practical patterns.
 *
 * 📌 KEY POINTS:
 * - Each call to outer function creates a SEPARATE closure (own variables)
 * - Closures keep references alive → can cause memory leaks
 * - var in loops creates SHARED closure (all callbacks see final value)
 * - let in loops creates SEPARATE closure per iteration
 *
 * PRACTICAL PATTERNS:
 * 1. Module pattern (data privacy)
 * 2. Function factories (makeAdder, createValidator)
 * 3. Memoization (cache in closure)
 * 4. Debounce/throttle (timer in closure)
 * 5. Once (called flag in closure)
 * 6. Currying (partial application)
 *
 * ⚠️ PITFALLS:
 * - React stale closures: useEffect with [] captures initial state forever
 * - Event listeners capturing large objects → prevents GC
 * - setInterval closures trap variables forever until cleared
 *
 * 🗣️ WHAT INTERVIEWERS WANT TO HEAR:
 * - "A closure is a function + its lexical environment"
 * - "var in loops creates shared closure — use let or IIFE to fix"
 * - "Each function call creates a NEW closure with its own variables"
 * - "Practical uses: memoize, debounce, curry, once, module pattern"
 * - "Closures can leak memory if they reference large objects unnecessarily"
 */

// TRICKY QUESTION: var creates shared closure
function createFunctions() {
  var fns = [];
  for (var i = 0; i < 5; i++) {
    fns.push(function() { return i; });
  }
  return fns;
}
// createFunctions()[0]() → 5 (ALL return 5!)
// FIX: use `let` instead of `var`

// Once pattern:
function once(fn) {
  let called = false, result;
  return function(...args) {
    if (!called) { called = true; result = fn.apply(this, args); }
    return result;
  };
}

// Curry pattern:
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) return fn.apply(this, args);
    return function(...next) { return curried.apply(this, [...args, ...next]); };
  };
}



// --------------------------------------------------------------
// 24. SCOPE — DEEP DIVE
// --------------------------------------------------------------

/**
 * 🧠 WHAT IS IT?
 * Scope = where variables are visible/accessible.
 * JS uses LEXICAL (static) scoping — determined by where code is
 * WRITTEN in the source, not where it's CALLED.
 *
 * 💡 ANALOGY: Scope is like one-way glass. Inner rooms can see out
 *    to the hallway, but the hallway can't see into the rooms.
 *    Scope chain walks UP only — inner accesses outer, never reverse.
 *
 * 🎯 WHY IT MATTERS IN INTERVIEWS:
 * "What's the output?" questions test scope chain understanding.
 *
 * 📌 KEY POINTS:
 *
 * SCOPE TYPES:
 * 1. Global — accessible everywhere (var goes on window, let/const don't)
 * 2. Function — var lives here (ignores blocks!)
 * 3. Block — let/const live here (if, for, while, {})
 * 4. Module — each file has its own scope (top-level vars aren't global)
 * 5. Lexical — inner functions access outer variables
 *
 * SCOPE CHAIN LOOKUP:
 * Current scope → Parent → ... → Global → ReferenceError
 * (NEVER walks down — inner scopes aren't accessible from outer)
 *
 * 🗣️ WHAT INTERVIEWERS WANT TO HEAR:
 * - "JavaScript uses lexical scoping — determined at write time"
 * - "var is function-scoped, let/const are block-scoped"
 * - "Scope chain walks UP only"
 * - "var global goes on window, let/const global does not"
 */

// TRICKY QUESTION: var hoisting in function scope
var x = 1;
function foo() {
  console.log(x); // undefined (NOT 1!) — var x below is hoisted
  var x = 2;
  console.log(x); // 2
}
foo();

// TRICKY QUESTION: Lexical scope vs call-site
var scopeVal = 'global';
function getValue() { return scopeVal; } // Looks up where DEFINED
function wrapper() {
  var scopeVal = 'local';
  return getValue(); // Still returns "global"!
}



// --------------------------------------------------------------
// 25. EVENT HANDLING — DEEP DIVE
// --------------------------------------------------------------

/**
 * 🧠 WHAT IS IT?
 * How the browser handles clicks, keypresses, etc.
 * Events go through THREE phases: Capture (down) → Target → Bubble (up).
 *
 * 💡 ANALOGY: Imagine dropping a pebble in a pond.
 *    Capture = the pebble going down to the bottom (top → target).
 *    Bubble = the ripples coming back up (target → top).
 *    By default, you catch fish (events) on the way UP (bubbling).
 *
 * 🎯 WHY IT MATTERS IN INTERVIEWS:
 * Event delegation is a key pattern. Understanding propagation prevents bugs.
 *
 * 📌 KEY POINTS:
 *
 * THREE PHASES:
 * 1. Capture: window → document → html → body → ... → target (top down)
 * 2. Target: event reaches the actual clicked element
 * 3. Bubble: target → ... → body → html → document → window (bottom up)
 *
 * EVENT DELEGATION:
 * - ONE listener on parent, use e.target to determine what was clicked
 * - Works for dynamically added elements (they bubble too!)
 * - Use e.target.closest('li') for nested elements
 * - Performance: 1 listener vs 1000 listeners
 *
 * KEY METHODS:
 * | Method                      | What it does                        |
 * |-----------------------------|-------------------------------------|
 * | e.stopPropagation()         | Stops bubbling to parents           |
 * | e.stopImmediatePropagation()| Stops bubbling + other same-element handlers |
 * | e.preventDefault()          | Stops browser default (submit, link)|
 *
 * ⚠️ preventDefault does NOT stop propagation, and vice versa!
 *
 * KEY PROPERTIES:
 * - e.target: element that TRIGGERED the event (deepest clicked)
 * - e.currentTarget: element the handler is ATTACHED to
 * - { passive: true }: tells browser you won't preventDefault → smoother scroll
 * - { once: true }: auto-removes after first fire
 * - { signal: controller.signal }: AbortController cleanup
 *
 * REACT SYNTHETIC EVENTS:
 * - Cross-browser wrapper, camelCase (onClick not onclick)
 * - React uses event delegation to root internally
 * - onClickCapture for capture phase
 *
 * 🗣️ WHAT INTERVIEWERS WANT TO HEAR:
 * - "Events go through capture → target → bubble"
 * - "Event delegation: one handler on parent, check e.target"
 * - "Use closest() in delegation to handle nested child elements"
 * - "e.target = what was clicked, e.currentTarget = where handler is attached"
 * - "passive: true improves scroll performance"
 * - "AbortController can remove multiple listeners with one abort()"
 */

// Event delegation pattern:
// document.querySelector('ul').addEventListener('click', (e) => {
//   const li = e.target.closest('li'); // Handles nested <span> inside <li>
//   if (!li) return;
//   const action = li.dataset.action; // data-action="delete"
//   handleAction(action, li);
// });

// AbortController for cleanup (modern pattern):
function setupListeners() {
  const controller = new AbortController();
  const { signal } = controller;
  document.addEventListener('click', handleClick, { signal });
  window.addEventListener('resize', handleResize, { signal });
  window.addEventListener('keydown', handleKey, { signal });
  return () => controller.abort(); // Removes ALL with one call!
}
function handleClick() {}
function handleResize() {}
function handleKey() {}



// --------------------------------------------------------------
// 26. BROWSER APIs
// --------------------------------------------------------------

/**
 * 🧠 WHAT IS IT?
 * Powerful tools the browser gives you beyond just the DOM.
 * Think of them as the browser's Swiss Army knife — most devs
 * only use the main blade (DOM), but the other tools are powerful.
 *
 * 🎯 WHY IT MATTERS IN INTERVIEWS:
 * Shows real-world experience beyond React.
 *
 * 📌 KEY POINTS:
 *
 * STORAGE:
 * | Feature        | Size   | Lifetime     | Sent to server? |
 * |----------------|--------|--------------|-----------------|
 * | localStorage   | ~5MB   | Forever      | ❌              |
 * | sessionStorage | ~5MB   | Tab session  | ❌              |
 * | Cookies        | ~4KB   | Configurable | ✅ Every request|
 * | IndexedDB      | Large  | Forever      | ❌              |
 *
 * ⚠️ localStorage only stores strings! JSON.stringify/parse needed.
 *
 * OBSERVERS (better than event listeners for these tasks):
 * - IntersectionObserver: lazy loading, infinite scroll (replaces scroll listener)
 * - MutationObserver: watch DOM changes (child add/remove, attributes)
 * - ResizeObserver: watch element size changes (not just window)
 *
 * WORKERS:
 * - Web Worker: CPU-heavy tasks off main thread (no DOM access)
 * - Service Worker: offline caching, push notifications, request proxy
 *
 * OTHER KEY APIs:
 * - requestAnimationFrame: sync animations with display refresh (~60fps)
 * - History API: pushState/replaceState for SPA routing without reload
 * - BroadcastChannel: communicate between tabs (sync logout, theme)
 * - Performance API: mark/measure timings, Web Vitals
 * - Fetch: doesn't reject on 404/500! Must check res.ok
 *
 * 🗣️ WHAT INTERVIEWERS WANT TO HEAR:
 * - "localStorage persists forever, sessionStorage dies with the tab"
 * - "fetch doesn't reject on 404/500 — you must check res.ok"
 * - "IntersectionObserver replaces scroll listeners for lazy loading"
 * - "requestAnimationFrame syncs with display refresh — use for animations"
 * - "Web Workers for CPU-heavy tasks, Service Workers for offline/caching"
 * - "History API enables SPA routing without full page reload"
 */

// IntersectionObserver — lazy loading pattern:
function lazyLoadImages() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src; // Load actual image
        observer.unobserve(img);   // Stop watching
      }
    });
  }, { rootMargin: '200px' }); // Start 200px before visible

  document.querySelectorAll('img[data-src]').forEach(img => observer.observe(img));
}

// Fetch with proper error handling:
async function safeFetch(url) {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(5000), // Timeout after 5s
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`); // fetch doesn't throw on 404!
  return res.json();
}



// --------------------------------------------------------------
// 27. SEMANTIC HTML — DEEP DIVE
// --------------------------------------------------------------

/**
 * 🧠 WHAT IS IT?
 * HTML elements that describe WHAT content is, not how it looks.
 * The browser, search engines, and screen readers all benefit.
 *
 * 🎯 WHY IT MATTERS IN INTERVIEWS:
 * Machine coding rounds heavily evaluate this. It's the easiest win.
 *
 * 📌 KEY POINTS:
 *
 * PAGE STRUCTURE:
 * ❌ <div class="header"><div class="nav">...</div></div>
 * ✅ <header><nav aria-label="Main"><ul><li><a>...</a></li></ul></nav></header>
 *
 * ELEMENT CHOICE GUIDE:
 * - <article>: self-contained (syndicate-able? → article)
 * - <section>: thematic group WITH heading (no heading? → use div)
 * - <div>: generic wrapper for styling (no semantic meaning)
 * - <button>: any clickable action (NOT <div onClick>)
 * - <a href>: navigation (gives right-click, ctrl+click, crawling)
 * - <details>/<summary>: native collapsible (no JS!)
 * - <dialog>: native modal (showModal() traps focus!)
 *
 * HEADING RULES:
 * - One <h1> per page
 * - Sequential: h1 → h2 → h3 (never skip levels)
 * - Screen readers generate heading outline for navigation
 *
 * FORMS:
 * - Every input needs a <label> (for/id or wrapping)
 * - <fieldset> + <legend> groups related inputs
 * - Use proper input types (email, tel, url) for mobile keyboards + validation
 * - autocomplete attribute helps password managers
 *
 * 🗣️ WHAT INTERVIEWERS WANT TO HEAR:
 * - "Semantic elements are navigation landmarks for screen readers"
 * - "<button> gives keyboard access, focus, and ARIA roles for free"
 * - "<dialog> with showModal() gives native focus trapping"
 * - "div/span are for styling only — zero semantic meaning"
 */



// --------------------------------------------------------------
// 28. ACCESSIBILITY (a11y) — DEEP DIVE
// --------------------------------------------------------------

/**
 * 🧠 WHAT IS IT?
 * Making websites usable by EVERYONE — visual, motor, cognitive,
 * hearing impairments + temporary disabilities.
 *
 * 💡 ANALOGY: Accessibility is like curb cuts in sidewalks.
 *    Designed for wheelchairs, but helps everyone (strollers, bikes, luggage).
 *    Good a11y benefits ALL users.
 *
 * 🎯 WHY IT MATTERS IN INTERVIEWS:
 * Legal requirement in many countries. Shows you build for real users.
 *
 * 📌 KEY POINTS:
 *
 * WCAG PRINCIPLES (POUR):
 * - Perceivable: alt text, captions, 4.5:1 contrast
 * - Operable: keyboard accessible, no seizure triggers
 * - Understandable: clear labels, predictable navigation
 * - Robust: valid HTML, works with screen readers
 *
 * ARIA (only when native HTML isn't enough):
 * - Roles: role="alert", role="dialog", role="tablist"
 * - Properties: aria-label, aria-labelledby, aria-describedby
 * - States: aria-expanded, aria-hidden, aria-live, aria-invalid
 *
 * aria-live REGIONS:
 * - "polite": announces at next pause (status updates)
 * - "assertive": interrupts immediately (errors)
 *
 * KEYBOARD:
 * - All interactive elements focusable + operable via keyboard
 * - Visible focus indicators (:focus-visible)
 * - Focus trapping in modals (Tab loops inside, Escape closes)
 * - Skip links for long navigation
 *
 * TESTING:
 * - Keyboard only (Tab through everything)
 * - Lighthouse/axe for automated checks
 * - Screen reader (VoiceOver on Mac, NVDA on Windows)
 * - Zoom to 200% — does layout break?
 *
 * 🗣️ WHAT INTERVIEWERS WANT TO HEAR:
 * - "First rule of ARIA: don't use it if native HTML works"
 * - "Every interactive element needs keyboard access + visible focus"
 * - "aria-live announces dynamic content to screen readers"
 * - "Focus trapping in modals, return focus on close"
 * - "I test with keyboard, Lighthouse, and screen reader"
 */





// --------------------------------------------------------------
// 29. HTML FORMS — DEEP DIVE
// --------------------------------------------------------------

/**
 * 🧠 WHAT IS IT?
 * The primary way users input data. Modern HTML forms have powerful
 * built-in validation, autocomplete, and accessibility features
 * most devs never use.
 *
 * 🎯 WHY IT MATTERS IN INTERVIEWS:
 * Shows you know native capabilities before reaching for libraries.
 *
 * 📌 KEY POINTS:
 *
 * NATIVE VALIDATION (no JS needed!):
 * - required, minlength/maxlength, min/max, pattern (regex)
 * - type="email" / type="url" → built-in format validation
 * - :valid / :invalid / :user-invalid CSS pseudo-classes
 * - Constraint Validation API: input.checkValidity(), setCustomValidity()
 *
 * FORMDATA API (modern approach):
 * - const data = new FormData(formElement);
 * - const obj = Object.fromEntries(data); // all values as object
 * - fetch('/api', { method: 'POST', body: formData }); // auto multipart
 *
 * ACCESSIBILITY:
 * - Every input needs a <label> (for/id pairing)
 * - <fieldset> + <legend> for radio/checkbox groups
 * - aria-invalid="true" + aria-describedby="error-id" for errors
 * - autocomplete attribute helps autofill (email, new-password, etc.)
 *
 * USEFUL ELEMENTS:
 * - <datalist>: native autocomplete suggestions (user can type freely)
 * - <output>: displays calculated result
 * - formaction attribute: different submit URLs per button
 *
 * 🗣️ WHAT INTERVIEWERS WANT TO HEAR:
 * - "Use proper input types for free mobile keyboards and validation"
 * - "Native validation with required/pattern before custom JS"
 * - "FormData API extracts all form values without manual DOM queries"
 * - "Every input needs a label — placeholder is NOT a label"
 */



// --------------------------------------------------------------
// 30. HTML BEST PRACTICES
// --------------------------------------------------------------

/**
 * 🧠 WHAT IS IT?
 * The foundational HTML knowledge that separates good devs from great ones.
 *
 * 🎯 WHY IT MATTERS IN INTERVIEWS:
 * Small things (meta tags, resource hints, image optimization) show depth.
 *
 * 📌 KEY POINTS:
 *
 * DOCUMENT ESSENTIALS:
 * - <!DOCTYPE html> → standards mode
 * - <html lang="en"> → accessibility + SEO
 * - <meta charset="UTF-8"> → FIRST in <head>
 * - <meta name="viewport" content="width=device-width, initial-scale=1">
 *
 * SCRIPT LOADING:
 * | Attribute | Download     | Execute              | Order? |
 * |-----------|--------------|----------------------|--------|
 * | (none)    | Blocks parse | Immediately          | Yes    |
 * | defer     | Parallel     | After DOM parsed     | Yes    |
 * | async     | Parallel     | ASAP (interrupts)    | No     |
 * | module    | Parallel     | After DOM parsed     | Yes    |
 *
 * RESOURCE HINTS:
 * - <link rel="preload"> → WILL be needed soon (fonts, critical CSS)
 * - <link rel="prefetch"> → MIGHT be needed later (next page)
 * - <link rel="preconnect"> → early DNS+TCP+TLS (third-party APIs)
 *
 * IMAGE OPTIMIZATION:
 * - width/height attributes → prevent CLS (layout shift)
 * - loading="lazy" → below-fold images
 * - fetchpriority="high" → LCP image (above fold, NEVER lazy)
 * - srcset + sizes → browser picks optimal resolution
 * - <picture> → format switching (avif > webp > jpg)
 *
 * SECURITY:
 * - CSP header → prevents XSS
 * - rel="noopener noreferrer" on external target="_blank" links
 * - sandbox attribute on iframes
 *
 * 🗣️ WHAT INTERVIEWERS WANT TO HEAR:
 * - "defer for scripts needing DOM, async for independent scripts"
 * - "preload for critical assets, preconnect for third-party origins"
 * - "width/height on images prevents CLS"
 * - "CSP prevents XSS by restricting what scripts can execute"
 */



// --------------------------------------------------------------
// 31. CSS FLEXBOX — DEEP DIVE
// --------------------------------------------------------------

/**
 * 🧠 WHAT IS IT?
 * One-dimensional layout (row OR column). Content dictates size.
 * Think of books on a shelf — you control spacing and alignment.
 *
 * 🎯 WHY IT MATTERS IN INTERVIEWS:
 * You'll implement layouts live. Flexbox handles 80% of component layout.
 *
 * 📌 KEY POINTS:
 *
 * CONTAINER (parent):
 * - justify-content: main axis (flex-start, center, space-between, space-evenly)
 * - align-items: cross axis (stretch, center, flex-start, baseline)
 * - flex-wrap: wrap → items flow to next line
 * - gap: modern spacing between items
 *
 * ITEMS (children):
 * - flex: 1 → grow equally (basis: 0, ignores content size)
 * - flex: none → fixed size (don't grow or shrink)
 * - flex: auto → grow equally (basis: auto, respects content)
 * - flex-shrink: 0 → never shrink below basis
 * - align-self: override parent's align-items for one item
 *
 * COMMON PATTERNS:
 * - Centering: display:flex; justify-content:center; align-items:center
 * - Navbar: justify-content: space-between
 * - Sticky footer: body flex column, main flex:1
 * - Input+button: input flex:1, button flex:none
 *
 * GOTCHAS:
 * - min-width:auto prevents shrinking → FIX: min-width:0 or overflow:hidden
 * - margin:auto absorbs all extra space (pushes items apart)
 * - flex-basis overrides width in flex context
 * - flex-grow distributes REMAINING space, not total space
 *
 * FLEX-GROW CALCULATION (interview trick):
 * Container: 600px. 3 items each 100px (basis). Remaining: 300px.
 * Grow ratios 1:2:3 (total=6):
 * - Item 1: 100 + (300 × 1/6) = 150px
 * - Item 2: 100 + (300 × 2/6) = 200px
 * - Item 3: 100 + (300 × 3/6) = 250px
 * ⚠️ If flex-basis:0 → distributes ALL space by ratio (not just remaining)
 *
 * 🗣️ WHAT INTERVIEWERS WANT TO HEAR:
 * - "justify-content = main axis, align-items = cross axis"
 * - "flex:1 = grow equally with basis 0"
 * - "gap is the modern replacement for margin hacks"
 * - "min-width:0 fixes the overflow/shrinking issue"
 * - "margin:auto in flex absorbs remaining space"
 */



// --------------------------------------------------------------
// 32. CSS GRID — DEEP DIVE
// --------------------------------------------------------------

/**
 * 🧠 WHAT IS IT?
 * Two-dimensional layout (rows AND columns simultaneously).
 * Layout dictates content placement.
 * Think of it like a spreadsheet — you define the grid, then place items.
 *
 * 🎯 WHY IT MATTERS IN INTERVIEWS:
 * Page layouts, dashboards, complex forms. Grid is the right tool.
 *
 * 📌 KEY POINTS:
 *
 * DEFINING THE GRID:
 * - grid-template-columns: 200px 1fr 1fr → fixed + flexible columns
 * - repeat(3, 1fr) → 3 equal columns
 * - repeat(auto-fit, minmax(250px, 1fr)) → RESPONSIVE! No media queries needed!
 * - fr unit → fraction of available space
 *
 * auto-fill vs auto-fit:
 * - auto-fill: keeps empty tracks (columns stay even with no content)
 * - auto-fit: collapses empty tracks (items stretch to fill)
 *
 * PLACING ITEMS:
 * - grid-column: 1 / 3 → span columns 1-2
 * - grid-column: 1 / -1 → span entire row
 * - grid-column: span 2 → span 2 from current position
 *
 * NAMED AREAS (super readable!):
 * grid-template-areas:
 *   "header header header"
 *   "sidebar main aside"
 *   "footer footer footer";
 * .header { grid-area: header; }
 *
 * ALIGNMENT:
 * - justify-items / align-items → align all items within their cells
 * - place-items: center center → shorthand for both
 *
 * SUBGRID: nested grid inherits parent's tracks (cards align across rows)
 *
 * 🗣️ WHAT INTERVIEWERS WANT TO HEAR:
 * - "Grid is 2D, Flexbox is 1D — Grid for page layout"
 * - "repeat(auto-fit, minmax(250px, 1fr)) = responsive without media queries"
 * - "fr distributes available space proportionally"
 * - "Named areas make layouts readable and maintainable"
 * - "Grid and Flexbox are complementary — I use both"
 */



// --------------------------------------------------------------
// 33. CSS POSITIONING
// --------------------------------------------------------------

/**
 * 🧠 WHAT IS IT?
 * How elements are placed on the page and how they interact with
 * the document flow.
 *
 * 💡 ANALOGY: Think of position values like different types of furniture.
 *    Static = floor furniture (normal placement).
 *    Relative = furniture nudged slightly from its spot.
 *    Absolute = a painting hung on the wall (out of floor flow).
 *    Fixed = a TV mounted to the wall (stays while you walk around).
 *    Sticky = a post-it note that sticks when you scroll past it.
 *
 * 📌 KEY POINTS:
 *
 * | Position | In flow? | Positioned to...                    |
 * |----------|----------|-------------------------------------|
 * | static   | ✅       | Normal flow (default)               |
 * | relative | ✅       | Offset from ORIGINAL position       |
 * | absolute | ❌       | Nearest POSITIONED ancestor         |
 * | fixed    | ❌       | VIEWPORT (unless parent has transform!)|
 * | sticky   | ✅→❌    | Relative until threshold, then sticks|
 *
 * Z-INDEX:
 * - Only works on positioned elements (or flex/grid items)
 * - Stacking contexts are ISOLATED (child can't escape parent's z-index)
 * - Created by: position+z-index, opacity<1, transform, filter
 * - Use a scale: dropdown:100, sticky:200, modal:400, tooltip:500
 *
 * STICKY GOTCHAS:
 * - Needs top/bottom value specified (top: 0)
 * - Breaks if ANY ancestor has overflow: hidden/auto/scroll
 * - Parent must have enough height for scrolling
 *
 * COMMON PATTERNS:
 * - Badge: parent relative, badge absolute top-right
 * - Overlay: position fixed, inset: 0
 * - Center: absolute, top:50%, left:50%, transform:translate(-50%,-50%)
 *
 * 🗣️ WHAT INTERVIEWERS WANT TO HEAR:
 * - "absolute positions to nearest positioned ancestor"
 * - "fixed breaks if ancestor has transform (creates new containing block)"
 * - "z-index only works on positioned elements"
 * - "Stacking contexts are isolated — child can't escape parent's z-level"
 * - "Sticky fails if ancestor has overflow:hidden"
 */

// Z-INDEX SCALE SYSTEM (best practice):
// --z-dropdown: 100;
// --z-sticky:   200;
// --z-modal-bg: 300;
// --z-modal:    400;
// --z-tooltip:  500;
// --z-toast:    600;

// WHY Z-INDEX DOESN'T WORK (common interview question):
// .sidebar { position: relative; z-index: 1; }
// .sidebar .dropdown { position: absolute; z-index: 9999; }
// .modal { position: fixed; z-index: 2; }
// → Modal (z:2) ALWAYS beats dropdown (z:9999) because
//   dropdown is trapped inside sidebar's stacking context (z:1)
// → sidebar(1) < modal(2) = modal wins, regardless of children



// --------------------------------------------------------------
// 34. RESPONSIVE DESIGN
// --------------------------------------------------------------

/**
 * 🧠 WHAT IS IT?
 * Making websites work on all screen sizes with one codebase.
 * THREE PILLARS: fluid grids, flexible media, media queries.
 *
 * 💡 ANALOGY: Responsive design is like water in different containers.
 *    The content adapts to whatever vessel (viewport) holds it.
 *
 * 📌 KEY POINTS:
 *
 * MOBILE-FIRST (recommended):
 * - Base styles = mobile
 * - Add complexity with min-width media queries
 * - Forces content-first thinking + smaller CSS on mobile
 *
 * CSS UNITS:
 * - rem: font-size (predictable, scales from root)
 * - %, vw, fr: widths (fluid)
 * - px: borders, shadows, small fixed values
 * - dvh: viewport height that accounts for mobile URL bar (replaces vh!)
 * - ch: character width — max-width:65ch = optimal reading line length
 *
 * CLAMP (the responsive power tool):
 * - font-size: clamp(1rem, 2.5vw, 2rem) → fluid between min and max
 * - width: clamp(300px, 50%, 800px)
 * - Replaces complex media query combinations
 *
 * CONTAINER QUERIES (game changer — 2023+):
 * - Media queries respond to VIEWPORT
 * - Container queries respond to PARENT size
 * - container-type: inline-size on parent
 * - @container (min-width: 400px) { ... }
 * - Makes truly reusable components that adapt to their container
 *
 * IMAGES:
 * - img { max-width: 100%; height: auto; } → basic fluid
 * - srcset + sizes → browser picks optimal resolution
 * - <picture> → art direction (different crops per viewport)
 * - aspect-ratio: 16/9 → prevent layout shift
 *
 * MODERN MEDIA QUERIES:
 * - (hover: hover) → device has hover
 * - (prefers-color-scheme: dark) → dark mode
 * - (prefers-reduced-motion: reduce) → respect motion preferences
 * - (width >= 768px) → range syntax (cleaner)
 *
 * 🗣️ WHAT INTERVIEWERS WANT TO HEAR:
 * - "Mobile-first: base styles for mobile, min-width to add complexity"
 * - "clamp() creates fluid values between min and max"
 * - "Container queries make components responsive to their container, not viewport"
 * - "dvh replaces vh — accounts for mobile browser chrome"
 * - "Add breakpoints where your DESIGN breaks, not at device widths"
 */

// Fluid typography (no media queries needed!):
// h1 { font-size: clamp(1.5rem, 4vw, 3rem); }
// .container { width: clamp(320px, 90%, 1200px); }
// .gap { gap: clamp(1rem, 3vw, 2.5rem); }

// Container query (component adapts to ITS container):
// .card-wrapper { container-type: inline-size; }
// @container (min-width: 400px) {
//   .card { flex-direction: row; }  /* Horizontal when container is wide */
// }
// @container (max-width: 399px) {
//   .card { flex-direction: column; }  /* Vertical when narrow */
// }

// Responsive grid without media queries:
// .grid {
//   display: grid;
//   grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
//   gap: clamp(1rem, 2vw, 2rem);
// }



// --------------------------------------------------------------
// 35. CSS SPECIFICITY
// --------------------------------------------------------------

/**
 * 🧠 WHAT IS IT?
 * The algorithm that decides which CSS rule wins when multiple
 * rules target the same element. It's a scoring system.
 *
 * 💡 ANALOGY: Think of specificity like an address system.
 *    ID = country (most specific), class = city, element = street.
 *    1 country reference beats 1000 city references.
 *
 * 📌 KEY POINTS:
 *
 * SPECIFICITY TUPLE: (IDs, Classes, Elements)
 * - *, combinators (+, >, ~): (0,0,0)
 * - element (div, p): (0,0,1)
 * - .class, [attr], :hover: (0,1,0)
 * - #id: (1,0,0)
 * - inline style: beats all selectors
 * - !important: beats everything (avoid!)
 *
 * ⚠️ ONE ID beats ANY number of classes!
 * (1,0,0) > (0,99,99) always
 *
 * MODERN SELECTORS:
 * - :is() → takes specificity of MOST SPECIFIC argument
 * - :where() → ALWAYS zero specificity (great for overridable base styles)
 * - :not()/:has() → takes specificity of argument
 *
 * THE CASCADE (full resolution order):
 * Origin → @layer → Specificity → Source Order
 *
 * @layer (Cascade Layers):
 * - @layer reset, base, components, utilities;
 * - Later layers win regardless of specificity
 * - Un-layered CSS beats all layers
 *
 * BEST PRACTICES:
 * - BEM (.block__element--modifier) keeps specificity flat at (0,1,0)
 * - Never use IDs for styling (too specific)
 * - :where() for overridable base styles
 * - @layer for architecture-level priority control
 *
 * 🗣️ WHAT INTERVIEWERS WANT TO HEAR:
 * - "Specificity is (ID, Class, Element) — one ID beats any classes"
 * - "Equal specificity → last rule in source order wins"
 * - ":where() has zero specificity — great for overridable styles"
 * - "Cascade Layers add priority control above specificity"
 * - "BEM keeps specificity flat and avoids wars"
 */

// Quick specificity quiz:
// #app p         → (1,0,1) = WINS
// .text.highlight → (0,2,0)
// div p.text     → (0,1,2)
// One ID always beats any combination of classes!



// --------------------------------------------------------------
// 36. MAP vs OBJECT & SPREAD vs OBJECT.ASSIGN
// --------------------------------------------------------------

/**
 * 🧠 WHAT IS IT?
 * Choosing the right data structure and merge strategy.
 *
 * 💡 ANALOGY: Object is like a labeled filing cabinet (string labels only).
 *    Map is like a locker system where ANYTHING can be the key
 *    (your face, a card, an object — any key type).
 *
 * 📌 MAP vs OBJECT:
 *
 * | Feature         | Object              | Map                      |
 * |-----------------|---------------------|--------------------------|
 * | Key types       | String/Symbol only  | ANY type (objects, fns!) |
 * | Key order       | Integer keys sorted!| Always insertion order   |
 * | Size            | Object.keys().length| .size (O(1))             |
 * | Frequent delete | Slow (deoptimizes)  | Fast (optimized for it)  |
 * | Prototype keys  | ✅ toString etc     | ❌ Clean (safe)          |
 * | JSON            | ✅ stringify/parse  | ❌ Must convert manually |
 * | Destructuring   | ✅ { a, b } = obj  | ❌ Not directly          |
 *
 * USE OBJECT: fixed string keys, JSON serialization, destructuring, spread
 * USE MAP: any key type, frequent add/delete, guaranteed order, user input keys
 *
 * 📌 SPREAD vs OBJECT.ASSIGN:
 *
 * | Feature           | { ...obj }          | Object.assign(target)    |
 * |-------------------|---------------------|--------------------------|
 * | Mutates target?   | ❌ Never            | ✅ YES (first arg)       |
 * | Triggers setters? | ❌ No               | ✅ Yes                   |
 * | Returns           | New object          | The mutated target       |
 *
 * ⚠️ BOTH ARE SHALLOW — nested objects are shared references!
 * Deep copy: structuredClone(obj)
 * Deep merge: manual recursion or library
 *
 * 🗣️ WHAT INTERVIEWERS WANT TO HEAR:
 * - "Map allows any key type — Object only strings/symbols"
 * - "Map has O(1) .size — Object needs Object.keys().length"
 * - "Object.delete deoptimizes V8 — Map.delete is fast"
 * - "Spread NEVER mutates, Object.assign MUTATES first arg"
 * - "Both are shallow — use structuredClone() for deep copy"
 * - "In React always use spread for immutable state updates"
 */

// Object key order gotcha:
const objDemo = {};
objDemo['b'] = 1; objDemo['2'] = 2; objDemo['a'] = 3; objDemo['1'] = 4;
console.log(Object.keys(objDemo)); // ["1", "2", "b", "a"] — integers sorted first!

// Map preserves exact insertion order:
const mapDemo = new Map();
mapDemo.set('b', 1); mapDemo.set(2, 2); mapDemo.set('a', 3);
console.log([...mapDemo.keys()]); // ['b', 2, 'a'] — exact order

// Map allows ANY key type (Object can't do this):
const userA = { id: 1 };
const userB = { id: 2 };
const permissions = new Map();
permissions.set(userA, ['read', 'write']); // Object as key!
permissions.set(userB, ['read']);
permissions.get(userA); // ['read', 'write']
// With Object: obj[userA] = obj[userB] = "[object Object]" — KEY COLLISION!

// Object.assign MUTATES:
const defaults = { a: 1, b: 2 };
const result = Object.assign(defaults, { b: 3 });
// defaults.b is now 3! defaults === result (same object)

// Spread is safe (always creates new):
const safeResult = { ...defaults, b: 3 }; // defaults unchanged

// Both are SHALLOW:
const nested = { user: { name: 'Alice' } };
const copy = { ...nested };
copy.user.name = 'Bob';
console.log(nested.user.name); // "Bob" — SAME reference! ⚠️
// FIX: const deep = structuredClone(nested);



// ==============================================================
// 🎯 END OF REVISION GUIDE
// ==============================================================
// Quick scan strategy: Read the 🗣️ sections before your interview.
// They contain the exact phrases interviewers want to hear.
// ==============================================================
