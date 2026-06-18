// ==============================================================
// 🧠 FRONTEND INTERVIEW THEORY QUESTIONS
// ==============================================================
// This file contains conceptual/theory-based frontend interview
// questions with detailed answers, debugging strategies, and
// production-ready patterns.
// ==============================================================



// --------------------------------------------------------------
// 1. HOW DO YOU DETECT MEMORY LEAKS IN REACT APPLICATIONS?
// --------------------------------------------------------------

/**
 * 🎯 INTERVIEW ANSWER STRUCTURE:
 * 
 * Memory leaks in React happen when the application retains references
 * to objects that are no longer needed — typically after a component
 * unmounts but async operations, subscriptions, or closures still
 * hold references to stale state/DOM.
 *
 * ═══════════════════════════════════════════════════════════════
 * 🔍 DETECTION METHOD 1: Chrome DevTools — Memory Tab
 * ═══════════════════════════════════════════════════════════════
 *
 * STEP-BY-STEP:
 * 1. Open DevTools → Memory tab
 * 2. Select "Heap Snapshot"
 * 3. Take Snapshot #1 (baseline)
 * 4. Perform the suspected leaking action (navigate away, close modal, etc.)
 * 5. Force garbage collection (click 🗑️ icon)
 * 6. Take Snapshot #2
 * 7. Compare snapshots using "Comparison" view
 *
 * WHAT TO LOOK FOR:
 * - Objects with positive "# Delta" (new allocations not freed)
 * - Detached DOM nodes (search "Detached" in snapshot)
 * - Growing "Retained Size" for component-related objects
 *
 * PRO TIP (Senior-level):
 * - Filter by "Objects allocated between Snapshot 1 and 2"
 * - Look for "Detached HTMLDivElement" — means DOM nodes
 *   are removed from tree but still referenced in JS
 *
 * ═══════════════════════════════════════════════════════════════
 * 🔍 DETECTION METHOD 2: Performance Monitor (Real-time)
 * ═══════════════════════════════════════════════════════════════
 *
 * STEP-BY-STEP:
 * 1. DevTools → More tools → Performance Monitor
 * 2. Watch "JS Heap Size" and "DOM Nodes" counters
 * 3. Interact with the app (open/close modals, navigate pages)
 * 4. If counters keep climbing without dropping → leak confirmed
 *
 * ═══════════════════════════════════════════════════════════════
 * 🔍 DETECTION METHOD 3: Performance Tab — Allocation Timeline
 * ═══════════════════════════════════════════════════════════════
 *
 * STEP-BY-STEP:
 * 1. DevTools → Memory → "Allocation instrumentation on timeline"
 * 2. Start recording
 * 3. Perform actions (mount/unmount components repeatedly)
 * 4. Stop recording
 * 5. Blue bars that persist = memory NOT garbage collected = potential leak
 *
 * ═══════════════════════════════════════════════════════════════
 * 🔍 DETECTION METHOD 4: React DevTools Profiler
 * ═══════════════════════════════════════════════════════════════
 *
 * - Identifies components that re-render unnecessarily
 * - While not a direct leak detector, excessive re-renders
 *   with closures can indicate stale reference retention
 * - Check "Why did this render?" feature
 *
 * ═══════════════════════════════════════════════════════════════
 * 🔍 DETECTION METHOD 5: Console Warnings (React 18+)
 * ═══════════════════════════════════════════════════════════════
 *
 * React warns in development mode:
 * ⚠️ "Can't perform a React state update on an unmounted component"
 *
 * This warning is a DIRECT indicator of a memory leak:
 * - An async operation completed AFTER the component unmounted
 * - The callback still holds a reference to the component's state
 *
 * NOTE: React 18 removed this warning, but the leak still exists.
 * You must detect it via DevTools or custom tooling.
 *
 * ═══════════════════════════════════════════════════════════════
 * 🔍 DETECTION METHOD 6: Programmatic Detection
 * ═══════════════════════════════════════════════════════════════
 */

// 📊 Custom hook to monitor component mount/unmount lifecycle
// Useful in development to track if cleanup is happening

function useMemoryLeakDetector(componentName) {
  // useEffect with empty deps = mount/unmount tracker
  // useEffect(() => {
  //   console.log(`🟢 MOUNTED: ${componentName}`);
  //   
  //   return () => {
  //     console.log(`🔴 UNMOUNTED: ${componentName}`);
  //   };
  // }, []);
}

// 📊 Using PerformanceObserver API to detect growing memory
function detectMemoryGrowth() {
  if (!performance.memory) {
    console.warn("performance.memory not available (Chrome only)");
    return;
  }

  const readings = [];

  const intervalId = setInterval(() => {
    readings.push({
      timestamp: Date.now(),
      usedJSHeapSize: performance.memory.usedJSHeapSize,
      totalJSHeapSize: performance.memory.totalJSHeapSize,
    });

    // After 10 readings, analyze trend
    if (readings.length >= 10) {
      const first = readings[0].usedJSHeapSize;
      const last = readings[readings.length - 1].usedJSHeapSize;
      const growth = ((last - first) / first) * 100;

      if (growth > 20) {
        console.warn(
          `🚨 Potential memory leak detected! Heap grew ${growth.toFixed(1)}% over ${readings.length} samples`
        );
      }

      readings.length = 0; // Reset
    }
  }, 3000);

  // Return cleanup
  return () => clearInterval(intervalId);
}

/**
 * ═══════════════════════════════════════════════════════════════
 * 🔍 DETECTION METHOD 7: WeakRef for Tracking (Advanced)
 * ═══════════════════════════════════════════════════════════════
 *
 * Use WeakRef to verify if an object gets garbage collected.
 * If the WeakRef still holds a value after GC → leak.
 */

function trackObjectForLeak(obj, label) {
  const weakRef = new WeakRef(obj);

  setTimeout(() => {
    // Force GC if available (only in Node or with --expose-gc flag)
    if (typeof globalThis.gc === "function") {
      globalThis.gc();
    }

    if (weakRef.deref() !== undefined) {
      console.warn(`🚨 ${label} was NOT garbage collected — possible leak`);
    } else {
      console.log(`✅ ${label} was properly garbage collected`);
    }
  }, 5000);
}

/**
 * ═══════════════════════════════════════════════════════════════
 * 📋 INTERVIEW SUMMARY — DETECTION CHECKLIST
 * ═══════════════════════════════════════════════════════════════
 *
 * | Method                        | Best For                          |
 * |-------------------------------|-----------------------------------|
 * | Heap Snapshot Comparison      | Pinpointing exact leaked objects  |
 * | Performance Monitor           | Quick visual confirmation         |
 * | Allocation Timeline           | Finding when leak occurs          |
 * | React DevTools Profiler       | Unnecessary re-renders            |
 * | Console Warnings              | Quick dev-time detection          |
 * | performance.memory API        | Automated CI/monitoring           |
 * | WeakRef tracking              | Verifying specific object cleanup |
 *
 * 🗣️ WHAT INTERVIEWERS WANT TO HEAR:
 * - You know the SYMPTOMS (growing heap, detached DOM nodes)
 * - You know the TOOLS (DevTools Memory tab, Profiler)
 * - You can REPRODUCE and ISOLATE the leak
 * - You understand WHY React specifically leaks (async + unmount)
 */



// --------------------------------------------------------------
// 2. HOW WOULD YOU HANDLE/FIX MEMORY LEAKS IN YOUR WEBSITE?
// --------------------------------------------------------------

/**
 * 🎯 INTERVIEW ANSWER STRUCTURE:
 *
 * Memory leaks in React come from 5 primary sources:
 * 1. Uncleared timers/intervals
 * 2. Unremoved event listeners
 * 3. Uncancelled async operations (fetch, promises)
 * 4. Unsubscribed external subscriptions (WebSocket, Redux, etc.)
 * 5. Stale closures holding references to unmounted component state
 *
 * The FIX always follows the same principle:
 * "Whatever you set up in mount/effect → tear down in cleanup."
 */


// ═══════════════════════════════════════════════════════════════
// 🛠️ FIX 1: CLEANUP TIMERS & INTERVALS
// ═══════════════════════════════════════════════════════════════

/**
 * ❌ LEAKY — interval keeps running after unmount
 */
function LeakyTimer() {
  // const [count, setCount] = useState(0);
  //
  // useEffect(() => {
  //   setInterval(() => {
  //     setCount(c => c + 1); // ← updates state on unmounted component
  //   }, 1000);
  // }, []);
}

/**
 * ✅ FIXED — clear interval on unmount
 */
function FixedTimer() {
  // const [count, setCount] = useState(0);
  //
  // useEffect(() => {
  //   const id = setInterval(() => {
  //     setCount(c => c + 1);
  //   }, 1000);
  //
  //   return () => clearInterval(id); // 🧹 Cleanup
  // }, []);
}


// ═══════════════════════════════════════════════════════════════
// 🛠️ FIX 2: CLEANUP EVENT LISTENERS
// ═══════════════════════════════════════════════════════════════

/**
 * ❌ LEAKY — listener persists after unmount, holds component reference
 */
function LeakyListener() {
  // useEffect(() => {
  //   window.addEventListener('resize', handleResize);
  //   // ❌ No cleanup!
  // }, []);
}

/**
 * ✅ FIXED — remove listener on unmount
 */
function FixedListener() {
  // useEffect(() => {
  //   const handleResize = () => {
  //     console.log(window.innerWidth);
  //   };
  //
  //   window.addEventListener('resize', handleResize);
  //
  //   return () => window.removeEventListener('resize', handleResize); // 🧹
  // }, []);
}

/**
 * 🧠 SENIOR TIP: Use AbortController for multiple listeners
 */
function FixedListenerWithAbort() {
  // useEffect(() => {
  //   const controller = new AbortController();
  //   const { signal } = controller;
  //
  //   window.addEventListener('resize', handleResize, { signal });
  //   window.addEventListener('scroll', handleScroll, { signal });
  //   document.addEventListener('click', handleClick, { signal });
  //
  //   return () => controller.abort(); // 🧹 Removes ALL listeners at once
  // }, []);
}


// ═══════════════════════════════════════════════════════════════
// 🛠️ FIX 3: CANCEL ASYNC OPERATIONS (fetch / promises)
// ═══════════════════════════════════════════════════════════════

/**
 * ❌ LEAKY — fetch resolves after component unmounts
 */
function LeakyFetch() {
  // const [data, setData] = useState(null);
  //
  // useEffect(() => {
  //   fetch('/api/data')
  //     .then(res => res.json())
  //     .then(json => setData(json)); // ← setState on unmounted component
  // }, []);
}

/**
 * ✅ FIXED — AbortController cancels fetch on unmount
 */
function FixedFetch() {
  // const [data, setData] = useState(null);
  //
  // useEffect(() => {
  //   const controller = new AbortController();
  //
  //   fetch('/api/data', { signal: controller.signal })
  //     .then(res => res.json())
  //     .then(json => setData(json))
  //     .catch(err => {
  //       if (err.name !== 'AbortError') {
  //         console.error(err); // Only log real errors
  //       }
  //     });
  //
  //   return () => controller.abort(); // 🧹 Cancel in-flight request
  // }, []);
}

/**
 * ✅ ALTERNATIVE — Boolean flag pattern (simpler but doesn't cancel network)
 */
function FixedFetchWithFlag() {
  // const [data, setData] = useState(null);
  //
  // useEffect(() => {
  //   let isMounted = true;
  //
  //   fetch('/api/data')
  //     .then(res => res.json())
  //     .then(json => {
  //       if (isMounted) setData(json); // ← Only update if still mounted
  //     });
  //
  //   return () => { isMounted = false; }; // 🧹
  // }, []);
}

/**
 * 🧠 PRODUCTION PATTERN — Custom hook for safe async
 */
function useSafeAsync() {
  // const isMounted = useRef(true);
  //
  // useEffect(() => {
  //   return () => { isMounted.current = false; };
  // }, []);
  //
  // const safeSetState = useCallback((setter, value) => {
  //   if (isMounted.current) setter(value);
  // }, []);
  //
  // return safeSetState;
}


// ═══════════════════════════════════════════════════════════════
// 🛠️ FIX 4: UNSUBSCRIBE FROM EXTERNAL SOURCES
// ═══════════════════════════════════════════════════════════════

/**
 * ❌ LEAKY — WebSocket stays open after unmount
 */
function LeakyWebSocket() {
  // useEffect(() => {
  //   const ws = new WebSocket('wss://example.com');
  //   ws.onmessage = (event) => {
  //     setMessages(prev => [...prev, event.data]);
  //   };
  //   // ❌ Never closed!
  // }, []);
}

/**
 * ✅ FIXED — Close WebSocket on unmount
 */
function FixedWebSocket() {
  // useEffect(() => {
  //   const ws = new WebSocket('wss://example.com');
  //
  //   ws.onmessage = (event) => {
  //     setMessages(prev => [...prev, event.data]);
  //   };
  //
  //   return () => {
  //     ws.close(); // 🧹 Close connection
  //   };
  // }, []);
}

/**
 * ✅ FIXED — Redux / Zustand / Observable subscriptions
 */
function FixedSubscription() {
  // useEffect(() => {
  //   const unsubscribe = store.subscribe((state) => {
  //     setLocalState(state.value);
  //   });
  //
  //   return () => unsubscribe(); // 🧹 Always return the unsub function
  // }, []);
}


// ═══════════════════════════════════════════════════════════════
// 🛠️ FIX 5: STALE CLOSURES & REFS
// ═══════════════════════════════════════════════════════════════

/**
 * ❌ LEAKY — Closure captures component scope, prevents GC
 */
function LeakyClosure() {
  // const [data, setData] = useState(largeDataSet); // 10MB object
  //
  // useEffect(() => {
  //   const handler = () => {
  //     // This closure captures `data` (10MB) even if component unmounts
  //     processData(data);
  //   };
  //
  //   thirdPartyLib.on('event', handler);
  //   // ❌ Never removed — closure keeps `data` alive
  // }, []);
}

/**
 * ✅ FIXED — Use ref to avoid closure capture + cleanup
 */
function FixedClosure() {
  // const dataRef = useRef(largeDataSet);
  //
  // useEffect(() => {
  //   const handler = () => {
  //     processData(dataRef.current); // Ref doesn't create closure over value
  //   };
  //
  //   thirdPartyLib.on('event', handler);
  //
  //   return () => {
  //     thirdPartyLib.off('event', handler); // 🧹
  //     dataRef.current = null; // 🧹 Release large data
  //   };
  // }, []);
}


// ═══════════════════════════════════════════════════════════════
// 🛠️ FIX 6: DETACHED DOM NODES
// ═══════════════════════════════════════════════════════════════

/**
 * ❌ LEAKY — Storing DOM reference that outlives the component
 */
function LeakyDOMRef() {
  // const elementRef = useRef(null);
  //
  // useEffect(() => {
  //   // Store reference in a module-level cache
  //   globalCache.set('myElement', elementRef.current);
  //   // ❌ When component unmounts, DOM node is removed from tree
  //   //    but globalCache still holds a reference → Detached DOM node
  // }, []);
}

/**
 * ✅ FIXED — Remove from cache on unmount
 */
function FixedDOMRef() {
  // const elementRef = useRef(null);
  //
  // useEffect(() => {
  //   globalCache.set('myElement', elementRef.current);
  //
  //   return () => {
  //     globalCache.delete('myElement'); // 🧹 Release DOM reference
  //   };
  // }, []);
}


// ═══════════════════════════════════════════════════════════════
// 🛠️ FIX 7: PRODUCTION-READY CUSTOM HOOK (Combines all patterns)
// ═══════════════════════════════════════════════════════════════

/**
 * A reusable hook that handles:
 * - Fetch cancellation
 * - Loading/error states
 * - Safe state updates after unmount
 */
function useApiCall_ProductionReady(url, deps) {
  // const [state, setState] = useState({ data: null, loading: true, error: null });
  //
  // useEffect(() => {
  //   const controller = new AbortController();
  //   let isMounted = true;
  //
  //   setState(prev => ({ ...prev, loading: true, error: null }));
  //
  //   fetch(url, { signal: controller.signal })
  //     .then(res => {
  //       if (!res.ok) throw new Error(`HTTP ${res.status}`);
  //       return res.json();
  //     })
  //     .then(data => {
  //       if (isMounted) setState({ data, loading: false, error: null });
  //     })
  //     .catch(err => {
  //       if (err.name === 'AbortError') return; // Ignore abort
  //       if (isMounted) setState({ data: null, loading: false, error: err });
  //     });
  //
  //   return () => {
  //     isMounted = false;
  //     controller.abort(); // 🧹 Cancel network + prevent state update
  //   };
  // }, deps);
  //
  // return state;
}


// ═══════════════════════════════════════════════════════════════
// 📋 INTERVIEW SUMMARY — MEMORY LEAK FIXES CHEAT SHEET
// ═══════════════════════════════════════════════════════════════

/**
 * | Leak Source              | Fix                                    |
 * |--------------------------|----------------------------------------|
 * | setInterval / setTimeout | clearInterval / clearTimeout in cleanup|
 * | addEventListener         | removeEventListener in cleanup         |
 * | fetch / XHR              | AbortController.abort() in cleanup     |
 * | WebSocket                | ws.close() in cleanup                  |
 * | Redux / store subscribe  | Call unsubscribe() in cleanup          |
 * | IntersectionObserver     | observer.disconnect() in cleanup       |
 * | MutationObserver         | observer.disconnect() in cleanup       |
 * | Third-party lib events   | lib.off() / lib.removeListener()      |
 * | Large data in closures   | Use useRef + nullify in cleanup        |
 * | Global/module-level refs | Delete from cache in cleanup           |
 *
 * ═══════════════════════════════════════════════════════════════
 * 🧠 GOLDEN RULE FOR INTERVIEWS:
 * ═══════════════════════════════════════════════════════════════
 *
 * "Every useEffect that SETS UP something must RETURN a cleanup
 *  function that TEARS IT DOWN."
 *
 * Think of it as:
 *   useEffect(() => {
 *     // SETUP: subscribe, listen, connect, start
 *     return () => {
 *       // TEARDOWN: unsubscribe, unlisten, disconnect, stop
 *     };
 *   }, [deps]);
 *
 * ═══════════════════════════════════════════════════════════════
 * 🗣️ WHAT SENIOR ENGINEERS MENTION IN INTERVIEWS:
 * ═══════════════════════════════════════════════════════════════
 *
 * 1. AbortController is the modern standard for cancellation
 * 2. WeakMap/WeakSet for caches that shouldn't prevent GC
 * 3. React 18's Strict Mode double-mounts help catch missing cleanups
 * 4. Memory leaks compound over time — a 1KB leak per navigation
 *    becomes 100MB after hours of use in SPAs
 * 5. Monitoring in production: track performance.memory in analytics
 * 6. Code review checklist: every useEffect should have a cleanup
 *    unless it's purely synchronous with no side effects
 */




// --------------------------------------------------------------
// 3. HOW DOES JAVASCRIPT GARBAGE COLLECTION WORK?
// --------------------------------------------------------------

/**
 * 🎯 INTERVIEW ANSWER STRUCTURE:
 *
 * Garbage Collection (GC) is the automatic memory management process
 * in JavaScript. The engine (V8 in Chrome/Node) periodically identifies
 * objects that are no longer reachable from the root and frees their memory.
 *
 * You don't manually allocate/free memory in JS — the GC does it.
 * But understanding HOW it works is critical for writing leak-free,
 * performant frontend applications.
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 🧠 CORE CONCEPT: REACHABILITY
 * ═══════════════════════════════════════════════════════════════
 *
 * An object is "alive" if it's REACHABLE from a ROOT.
 *
 * ROOTS in a browser environment:
 * - Global object (window)
 * - Currently executing function's local variables & parameters
 * - Variables in the current closure chain
 * - DOM nodes attached to the document
 *
 * If there's NO path from any root to an object → it's garbage.
 *
 * Example:
 *   let user = { name: "Alice" };  // Object is reachable via `user`
 *   user = null;                   // No reference → object is now garbage
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 🔄 ALGORITHM 1: MARK-AND-SWEEP (Primary — used by V8)
 * ═══════════════════════════════════════════════════════════════
 *
 * HOW IT WORKS:
 * 1. GC starts from roots (global, stack, closures)
 * 2. MARK phase: Traverse all reachable objects, mark them as "alive"
 * 3. SWEEP phase: Scan entire heap, free any unmarked objects
 *
 * VISUAL:
 *   [root] → A → B → C     ← all marked (alive)
 *            D → E          ← D & E unreachable → swept (freed)
 *
 * WHY THIS REPLACED REFERENCE COUNTING:
 * - Handles circular references correctly
 * - A → B → A (circular) — if neither is reachable from root,
 *   both get collected
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 🔄 ALGORITHM 2: REFERENCE COUNTING (Legacy — NOT used by modern engines)
 * ═══════════════════════════════════════════════════════════════
 *
 * HOW IT WORKS:
 * - Each object has a counter of how many references point to it
 * - When counter reaches 0 → object is freed
 *
 * FATAL FLAW — Circular References:
 *   let a = {};
 *   let b = {};
 *   a.ref = b;
 *   b.ref = a;
 *   a = null;
 *   b = null;
 *   // Both objects have refCount = 1 (from each other)
 *   // NEVER collected! → Memory leak
 *
 * This is why IE6/7 had notorious memory leaks with DOM ↔ JS circular refs.
 * Modern engines (V8, SpiderMonkey) use mark-and-sweep, solving this.
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 🏗️ V8's GENERATIONAL GARBAGE COLLECTION
 * ═══════════════════════════════════════════════════════════════
 *
 * V8 (Chrome, Node.js) splits the heap into TWO generations:
 *
 * ┌─────────────────────────────────────────────────────────┐
 * │  YOUNG GENERATION (New Space)                           │
 * │  - Small (~1-8 MB)                                      │
 * │  - Newly allocated objects live here                    │
 * │  - Collected FREQUENTLY (Minor GC / Scavenge)          │
 * │  - Uses semi-space copying (from-space → to-space)     │
 * │  - FAST — most objects die young (generational hypothesis)│
 * └─────────────────────────────────────────────────────────┘
 *          │ survives 2 scavenges
 *          ▼
 * ┌─────────────────────────────────────────────────────────┐
 * │  OLD GENERATION (Old Space)                             │
 * │  - Large (hundreds of MB)                               │
 * │  - Long-lived objects promoted here                     │
 * │  - Collected INFREQUENTLY (Major GC / Mark-Sweep-Compact)│
 * │  - More expensive — causes longer pauses               │
 * └─────────────────────────────────────────────────────────┘
 *
 * THE GENERATIONAL HYPOTHESIS:
 * "Most objects die young."
 * - A temporary variable in a function → allocated, used, discarded
 * - Only ~10-20% of objects survive to old generation
 * - This is why Minor GC is fast — most of new space is garbage
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * ⚡ MINOR GC (Scavenge) — Young Generation
 * ═══════════════════════════════════════════════════════════════
 *
 * ALGORITHM: Semi-space copying (Cheney's algorithm)
 *
 * 1. New Space is split into two halves: FROM-space and TO-space
 * 2. Objects are allocated in FROM-space
 * 3. When FROM-space is full → Minor GC triggers
 * 4. Live objects are COPIED from FROM-space → TO-space
 * 5. Dead objects are simply abandoned (no explicit free)
 * 6. FROM and TO swap roles
 *
 * PROMOTION RULES:
 * - Object survives 2 scavenges → promoted to Old Space
 * - Object is too large for New Space → allocated directly in Old Space
 *
 * PERFORMANCE:
 * - Very fast (1-2ms typically)
 * - Runs frequently
 * - Proportional to number of LIVE objects (not total heap)
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * ⚡ MAJOR GC (Mark-Sweep-Compact) — Old Generation
 * ═══════════════════════════════════════════════════════════════
 *
 * Three phases:
 *
 * 1. MARK — Walk from roots, mark all reachable objects
 * 2. SWEEP — Free unmarked objects, create free-list
 * 3. COMPACT — Move surviving objects together to reduce fragmentation
 *
 * PERFORMANCE CONCERN:
 * - Can take 50-100ms+ on large heaps
 * - Causes "jank" (dropped frames) if not optimized
 *
 * V8 OPTIMIZATIONS:
 * - Incremental marking: break marking into small chunks
 * - Concurrent marking: mark on background thread
 * - Lazy sweeping: sweep only when memory is needed
 * - Parallel compaction: use multiple threads
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 🎯 WHAT CAUSES GC PRESSURE (Performance Impact)
 * ═══════════════════════════════════════════════════════════════
 *
 * GC pressure = allocating too many short-lived objects too fast
 *
 * COMMON CAUSES IN FRONTEND CODE:
 *
 * 1. Creating objects in hot loops:
 *    for (let i = 0; i < 10000; i++) {
 *      const point = { x: i, y: i * 2 }; // 10K allocations
 *    }
 *
 * 2. String concatenation in loops:
 *    let result = "";
 *    for (let i = 0; i < 1000; i++) {
 *      result += "x"; // Creates new string each iteration
 *    }
 *
 * 3. Array methods creating intermediate arrays:
 *    data.map(...).filter(...).reduce(...)
 *    // 2 intermediate arrays created and immediately discarded
 *
 * 4. Frequent React re-renders creating new objects:
 *    // Every render creates new object → GC pressure
 *    <Component style={{ color: 'red' }} />
 *    <Component onClick={() => handleClick()} />
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 🛠️ REDUCING GC PRESSURE — PRACTICAL PATTERNS
 * ═══════════════════════════════════════════════════════════════
 */

// ❌ BAD — Creates new object every render
// function Component() {
//   return <div style={{ margin: 10 }} />; // New object each render
// }

// ✅ GOOD — Stable reference, no GC pressure
// const styles = { margin: 10 };
// function Component() {
//   return <div style={styles} />;
// }

// ❌ BAD — New function reference every render
// function Parent() {
//   return <Child onClick={() => doSomething()} />;
// }

// ✅ GOOD — Memoized callback
// function Parent() {
//   const handleClick = useCallback(() => doSomething(), []);
//   return <Child onClick={handleClick} />;
// }

// ❌ BAD — Object pool not used in animation loops
// function animate() {
//   const pos = { x: 0, y: 0 }; // New allocation every frame
//   // ... use pos
//   requestAnimationFrame(animate);
// }

// ✅ GOOD — Reuse object (object pooling)
// const pos = { x: 0, y: 0 }; // Allocate once
// function animate() {
//   pos.x = computeX();
//   pos.y = computeY();
//   requestAnimationFrame(animate);
// }

/**
 * ═══════════════════════════════════════════════════════════════
 * 🧩 WeakRef & FinalizationRegistry (ES2021)
 * ═══════════════════════════════════════════════════════════════
 *
 * WeakRef — holds a reference that does NOT prevent GC
 * FinalizationRegistry — callback when object is collected
 *
 * USE CASES:
 * - Caches that auto-evict when memory is tight
 * - Tracking object lifecycle without preventing collection
 */

// WeakRef example — cache that doesn't prevent GC
class WeakCache {
  constructor() {
    this.cache = new Map(); // key → WeakRef
  }

  set(key, value) {
    this.cache.set(key, new WeakRef(value));
  }

  get(key) {
    const ref = this.cache.get(key);
    if (!ref) return undefined;

    const value = ref.deref(); // Returns undefined if GC'd
    if (!value) {
      this.cache.delete(key); // Cleanup stale entry
      return undefined;
    }
    return value;
  }
}

// FinalizationRegistry — detect when objects are collected
const registry = new FinalizationRegistry((heldValue) => {
  console.log(`🗑️ Object "${heldValue}" was garbage collected`);
});

function createTrackedObject(name) {
  const obj = { data: new Array(1000) };
  registry.register(obj, name); // Track this object
  return obj;
}

// let tracked = createTrackedObject("bigData");
// tracked = null; // Eventually logs: 🗑️ Object "bigData" was garbage collected

/**
 * ═══════════════════════════════════════════════════════════════
 * 🔑 WeakMap & WeakSet — GC-Friendly Collections
 * ═══════════════════════════════════════════════════════════════
 *
 * WeakMap/WeakSet keys are WEAKLY held:
 * - If the key object has no other references → it gets GC'd
 * - The entry is automatically removed from the collection
 *
 * PERFECT FOR:
 * - Attaching metadata to objects without preventing their collection
 * - Private data storage for class instances
 * - Caching computed values tied to object lifetime
 */

// Example: Attaching metadata without preventing GC
const metadata = new WeakMap();

function processElement(element) {
  // Store computed data tied to this DOM element
  metadata.set(element, {
    processedAt: Date.now(),
    computedHeight: element.offsetHeight,
  });
}
// When `element` is removed from DOM and dereferenced,
// the WeakMap entry is automatically cleaned up

/**
 * ═══════════════════════════════════════════════════════════════
 * 📋 INTERVIEW SUMMARY — GARBAGE COLLECTION
 * ═══════════════════════════════════════════════════════════════
 *
 * | Concept                    | Key Point                                    |
 * |----------------------------|----------------------------------------------|
 * | Core algorithm             | Mark-and-Sweep (reachability-based)          |
 * | Why not ref counting       | Can't handle circular references             |
 * | Generational hypothesis    | Most objects die young                       |
 * | Young gen (Scavenge)       | Fast, frequent, semi-space copying           |
 * | Old gen (Major GC)         | Slow, infrequent, mark-sweep-compact        |
 * | GC pressure                | Too many short-lived allocations             |
 * | WeakRef                    | Reference that doesn't prevent GC            |
 * | WeakMap/WeakSet            | Collections that auto-cleanup when keys die  |
 * | FinalizationRegistry       | Callback when object is collected            |
 *
 * ═══════════════════════════════════════════════════════════════
 * 🗣️ WHAT INTERVIEWERS WANT TO HEAR:
 * ═══════════════════════════════════════════════════════════════
 *
 * 1. "JS uses mark-and-sweep, not reference counting"
 * 2. "V8 uses generational GC — young space (fast scavenge)
 *     and old space (mark-sweep-compact)"
 * 3. "Most objects die young — that's why scavenge is efficient"
 * 4. "GC pressure comes from allocating too many temporary objects"
 * 5. "In React, inline objects/functions in JSX cause GC pressure
 *     because they're recreated every render"
 * 6. "WeakMap/WeakRef let you cache without preventing collection"
 * 7. "Major GC can cause jank — V8 mitigates with incremental
 *     and concurrent marking"
 *
 * ═══════════════════════════════════════════════════════════════
 * 🔗 CONNECTION TO MEMORY LEAKS (Questions 1 & 2):
 * ═══════════════════════════════════════════════════════════════
 *
 * A memory leak is when an object SHOULD be garbage collected
 * but ISN'T — because something still holds a reference to it.
 *
 * GC cannot collect:
 * - Event listeners referencing unmounted component state
 * - Closures capturing large objects
 * - Timers holding callbacks with stale references
 * - Global caches that grow unbounded
 *
 * The GC is NOT broken in these cases — the code is.
 * The objects are technically still "reachable" from a root.
 * The fix is always: remove the reference so GC can do its job.
 */




// --------------------------------------------------------------
// 4. WHAT CAUSES UI JANK AND HOW DO YOU FIX IT?
// --------------------------------------------------------------

/**
 * 🎯 INTERVIEW ANSWER STRUCTURE:
 *
 * UI Jank = visible stutter/lag when the browser drops frames.
 * The browser targets 60fps → each frame has ~16.6ms budget.
 * If ANY task on the main thread exceeds that budget, the frame
 * is dropped and the user perceives "jank."
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 🧠 THE FRAME BUDGET — 16.6ms
 * ═══════════════════════════════════════════════════════════════
 *
 * What happens in a single frame:
 *
 * ┌──────────────────────────────────────────────────────────┐
 * │ Input Events (click, scroll, keypress)                   │
 * │ → JavaScript execution                                   │
 * │ → requestAnimationFrame callbacks                        │
 * │ → Style calculation (recalc styles)                      │
 * │ → Layout (reflow)                                        │
 * │ → Paint                                                  │
 * │ → Composite                                              │
 * └──────────────────────────────────────────────────────────┘
 *         ALL of this must fit in ~16.6ms
 *
 * If JS alone takes 50ms → 3 frames dropped → visible stutter.
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * ❌ COMMON CAUSES OF JANK
 * ═══════════════════════════════════════════════════════════════
 *
 * 1. LONG TASKS ON MAIN THREAD (>50ms)
 *    - Heavy computation (sorting 10K items, JSON parsing)
 *    - Synchronous DOM manipulation in loops
 *    - Large React component trees re-rendering
 *
 * 2. FORCED SYNCHRONOUS LAYOUT (Layout Thrashing)
 *    - Reading layout property AFTER writing to DOM
 *    - Browser must recalculate layout mid-frame
 *
 *    ❌ BAD:
 *    for (let i = 0; i < elements.length; i++) {
 *      elements[i].style.width = box.offsetWidth + 'px'; // read → write → read → write
 *    }
 *
 *    ✅ GOOD:
 *    const width = box.offsetWidth; // batch read
 *    for (let i = 0; i < elements.length; i++) {
 *      elements[i].style.width = width + 'px'; // batch write
 *    }
 *
 * 3. EXPENSIVE PAINT/COMPOSITE
 *    - Animating properties that trigger layout (width, height, top, left)
 *    - Large box-shadows, filters on non-composited layers
 *
 * 4. GARBAGE COLLECTION PAUSES
 *    - Major GC on large heaps can pause 50-100ms
 *    - Caused by excessive short-lived allocations (see Q3)
 *
 * 5. BLOCKING THE MAIN THREAD DURING SCROLL/INPUT
 *    - Non-passive event listeners on scroll/touch
 *    - Heavy work in scroll handlers without debounce
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 🛠️ FIX 1: BREAK LONG TASKS WITH YIELDING
 * ═══════════════════════════════════════════════════════════════
 */

// ❌ BAD — blocks main thread for entire loop
function processAllItems(items) {
  for (let i = 0; i < items.length; i++) {
    heavyComputation(items[i]); // 200ms total → jank
  }
}

// ✅ GOOD — yield to browser between chunks
async function processItemsInChunks(items, chunkSize = 50) {
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    chunk.forEach(item => heavyComputation(item));

    // Yield to browser — lets it paint, handle input
    await new Promise(resolve => setTimeout(resolve, 0));
  }
}

// ✅ MODERN — scheduler.yield() (Chrome 129+)
// async function processWithYield(items) {
//   for (const item of items) {
//     heavyComputation(item);
//     if (navigator.scheduling) {
//       await navigator.scheduling.yield();
//     }
//   }
// }

/**
 * ═══════════════════════════════════════════════════════════════
 * 🛠️ FIX 2: USE requestAnimationFrame FOR VISUAL UPDATES
 * ═══════════════════════════════════════════════════════════════
 */

// ❌ BAD — scroll handler does heavy work every event
// window.addEventListener('scroll', () => {
//   updateParallax();    // layout thrashing
//   animateElements();   // forced reflow
// });

// ✅ GOOD — batch visual updates to next frame
// let ticking = false;
// window.addEventListener('scroll', () => {
//   if (!ticking) {
//     requestAnimationFrame(() => {
//       updateParallax();
//       animateElements();
//       ticking = false;
//     });
//     ticking = true;
//   }
// });

/**
 * ═══════════════════════════════════════════════════════════════
 * 🛠️ FIX 3: OFFLOAD TO WEB WORKERS
 * ═══════════════════════════════════════════════════════════════
 *
 * Move CPU-intensive work OFF the main thread entirely.
 */

// Main thread
// const worker = new Worker('heavy-task.js');
// worker.postMessage({ data: largeDataset });
// worker.onmessage = (e) => {
//   renderResults(e.data); // Only UI update on main thread
// };

// heavy-task.js (Web Worker)
// self.onmessage = (e) => {
//   const result = expensiveSort(e.data);
//   self.postMessage(result);
// };

/**
 * ═══════════════════════════════════════════════════════════════
 * 🛠️ FIX 4: ANIMATE ONLY COMPOSITE PROPERTIES
 * ═══════════════════════════════════════════════════════════════
 *
 * Properties that ONLY trigger composite (GPU-accelerated, no reflow):
 * ✅ transform (translate, scale, rotate)
 * ✅ opacity
 *
 * Properties that trigger LAYOUT (expensive):
 * ❌ width, height, top, left, margin, padding
 *
 * RULE: Animate transform/opacity. Never animate geometry.
 */

// ❌ BAD — triggers layout every frame
// .animate { left: 0 → 100px; }

// ✅ GOOD — GPU composited, no layout
// .animate { transform: translateX(0) → translateX(100px); }

/**
 * ═══════════════════════════════════════════════════════════════
 * 🛠️ FIX 5: PASSIVE EVENT LISTENERS
 * ═══════════════════════════════════════════════════════════════
 */

// ❌ BAD — browser waits to see if preventDefault() is called
// document.addEventListener('touchmove', handler);

// ✅ GOOD — browser knows it can scroll immediately
// document.addEventListener('touchmove', handler, { passive: true });

/**
 * ═══════════════════════════════════════════════════════════════
 * 🛠️ FIX 6: VIRTUALIZE LONG LISTS (React-specific)
 * ═══════════════════════════════════════════════════════════════
 *
 * Rendering 10,000 DOM nodes = layout + paint explosion.
 * Virtualization renders only visible items (~20-50 nodes).
 *
 * Libraries: react-window, react-virtuoso, @tanstack/virtual
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * 🛠️ FIX 7: REACT-SPECIFIC JANK FIXES
 * ═══════════════════════════════════════════════════════════════
 *
 * - useDeferredValue: deprioritize expensive re-renders
 * - useTransition: mark state updates as non-urgent
 * - React.memo: prevent unnecessary child re-renders
 * - Virtualization for long lists
 * - Code-split heavy components (React.lazy)
 */

// useTransition example — keeps UI responsive during filter
// function SearchResults({ query }) {
//   const [isPending, startTransition] = useTransition();
//   const [filtered, setFiltered] = useState(items);
//
//   function handleChange(e) {
//     startTransition(() => {
//       setFiltered(items.filter(i => i.includes(e.target.value)));
//     });
//   }
//
//   return isPending ? <Spinner /> : <List items={filtered} />;
// }

/**
 * ═══════════════════════════════════════════════════════════════
 * 🔍 HOW TO DIAGNOSE JANK
 * ═══════════════════════════════════════════════════════════════
 *
 * 1. DevTools → Performance tab → Record interaction
 * 2. Look for:
 *    - Red triangles (long tasks >50ms)
 *    - Dropped frames in the FPS chart
 *    - Layout/Reflow events in the flame chart
 * 3. Identify the function causing the long task
 * 4. Apply appropriate fix (yield, worker, rAF, virtualize)
 *
 * KEY METRICS:
 * - INP (Interaction to Next Paint): <200ms = good
 * - TBT (Total Blocking Time): <300ms = good
 * - Long Tasks: any task >50ms on main thread
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 📋 INTERVIEW SUMMARY — JANK FIXES
 * ═══════════════════════════════════════════════════════════════
 *
 * | Cause                    | Fix                                    |
 * |--------------------------|----------------------------------------|
 * | Long JS task             | Chunk work + yield (setTimeout/yield)  |
 * | Layout thrashing         | Batch reads, then batch writes         |
 * | Scroll/input blocking    | rAF + passive listeners                |
 * | Heavy computation        | Web Workers                            |
 * | Expensive animations     | Use transform/opacity only             |
 * | Large DOM (long lists)   | Virtualization                         |
 * | React re-render storms   | useTransition, memo, useDeferredValue  |
 * | GC pauses                | Reduce allocations, object pooling     |
 *
 * 🗣️ WHAT INTERVIEWERS WANT TO HEAR:
 * - "60fps = 16.6ms per frame budget"
 * - "Long tasks block the main thread"
 * - "Layout thrashing = interleaving reads and writes"
 * - "Only animate transform and opacity for smooth animations"
 * - "Use Web Workers for CPU-heavy work"
 * - "React 18's useTransition keeps UI responsive during heavy updates"
 */



// --------------------------------------------------------------
// 5. HOW DO YOU OPTIMIZE REACT BUNDLE SIZE?
// --------------------------------------------------------------

/**
 * 🎯 INTERVIEW ANSWER STRUCTURE:
 *
 * Bundle size directly impacts:
 * - Time to Interactive (TTI)
 * - First Contentful Paint (FCP)
 * - Core Web Vitals (LCP)
 * - Mobile performance (slow networks + weak CPUs)
 *
 * The goal: ship ONLY the JavaScript the user needs, WHEN they need it.
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 🛠️ 1. CODE SPLITTING (Most impactful)
 * ═══════════════════════════════════════════════════════════════
 *
 * Split your bundle into smaller chunks loaded on demand.
 *
 * ROUTE-LEVEL SPLITTING (React.lazy + Suspense):
 */

// ❌ BAD — entire app in one bundle
// import Dashboard from './Dashboard';
// import Settings from './Settings';
// import Analytics from './Analytics';

// ✅ GOOD — each route loads its own chunk
// const Dashboard = React.lazy(() => import('./Dashboard'));
// const Settings = React.lazy(() => import('./Settings'));
// const Analytics = React.lazy(() => import('./Analytics'));
//
// function App() {
//   return (
//     <Suspense fallback={<Spinner />}>
//       <Routes>
//         <Route path="/dashboard" element={<Dashboard />} />
//         <Route path="/settings" element={<Settings />} />
//         <Route path="/analytics" element={<Analytics />} />
//       </Routes>
//     </Suspense>
//   );
// }

// COMPONENT-LEVEL SPLITTING (heavy components):
// const HeavyEditor = React.lazy(() => import('./RichTextEditor'));
// const ChartWidget = React.lazy(() => import('./ChartWidget'));

/**
 * ═══════════════════════════════════════════════════════════════
 * 🛠️ 2. TREE SHAKING (Dead Code Elimination)
 * ═══════════════════════════════════════════════════════════════
 *
 * Bundlers (Webpack/Vite/Rollup) remove unused exports from ES modules.
 *
 * REQUIREMENTS:
 * - Use ES module syntax (import/export), NOT CommonJS (require)
 * - Library must export individual functions (not one giant object)
 */

// ❌ BAD — imports entire library (~70KB for lodash)
// import _ from 'lodash';
// _.debounce(fn, 300);

// ✅ GOOD — imports only what's used (~1KB)
// import debounce from 'lodash/debounce';

// ✅ BETTER — use a tree-shakeable alternative
// import { debounce } from 'lodash-es'; // ES module version

// SAME PATTERN FOR OTHER LIBRARIES:
// ❌ import { Button, Modal, Table, Tooltip } from 'antd'; // pulls entire lib
// ✅ import Button from 'antd/es/button'; // only button chunk

/**
 * ═══════════════════════════════════════════════════════════════
 * 🛠️ 3. ANALYZE YOUR BUNDLE
 * ═══════════════════════════════════════════════════════════════
 *
 * You can't optimize what you can't measure.
 *
 * TOOLS:
 * - webpack-bundle-analyzer → visual treemap of bundle contents
 * - source-map-explorer → analyze production source maps
 * - bundlephobia.com → check package size before installing
 * - import-cost (VS Code extension) → inline size display
 *
 * COMMANDS:
 * - Vite: npx vite-bundle-visualizer
 * - Webpack: npx webpack-bundle-analyzer stats.json
 * - Next.js: @next/bundle-analyzer
 *
 * WHAT TO LOOK FOR:
 * - Unexpectedly large dependencies
 * - Duplicate packages (different versions of same lib)
 * - Packages you imported but barely use
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * 🛠️ 4. REPLACE HEAVY DEPENDENCIES
 * ═══════════════════════════════════════════════════════════════
 *
 * | Heavy Library        | Lighter Alternative          | Savings    |
 * |----------------------|------------------------------|------------|
 * | moment.js (300KB)    | date-fns / dayjs (2-7KB)     | ~95%       |
 * | lodash (70KB)        | lodash-es + cherry-pick      | ~90%       |
 * | axios (13KB)         | native fetch + tiny wrapper  | ~100%      |
 * | uuid (4KB)           | crypto.randomUUID()          | ~100%      |
 * | classnames (1KB)     | clsx (0.5KB)                 | ~50%       |
 * | numeral.js (16KB)    | Intl.NumberFormat (native)    | ~100%      |
 *
 * RULE: Before adding a dependency, check:
 * 1. Can I use a native API instead?
 * 2. What's the gzipped size on bundlephobia?
 * 3. Is it tree-shakeable?
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * 🛠️ 5. DYNAMIC IMPORTS FOR CONDITIONAL FEATURES
 * ═══════════════════════════════════════════════════════════════
 */

// ❌ BAD — PDF library loaded for ALL users
// import { generatePDF } from 'heavy-pdf-lib'; // 200KB

// ✅ GOOD — loaded only when user clicks "Export PDF"
// async function handleExportPDF() {
//   const { generatePDF } = await import('heavy-pdf-lib');
//   generatePDF(data);
// }

// ✅ Conditional polyfills
// if (!window.IntersectionObserver) {
//   await import('intersection-observer'); // Only for old browsers
// }

/**
 * ═══════════════════════════════════════════════════════════════
 * 🛠️ 6. OPTIMIZE IMAGES & ASSETS
 * ═══════════════════════════════════════════════════════════════
 *
 * - Use next/image or responsive srcset for automatic optimization
 * - Prefer WebP/AVIF over PNG/JPEG
 * - Lazy-load below-the-fold images: loading="lazy"
 * - Inline small SVGs, sprite large icon sets
 * - Use CSS instead of images where possible (gradients, shapes)
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * 🛠️ 7. COMPRESSION & CACHING
 * ═══════════════════════════════════════════════════════════════
 *
 * BUILD-TIME:
 * - Enable gzip/brotli compression on server
 * - Brotli gives ~15-20% better compression than gzip
 * - Minify JS (terser), CSS (cssnano), HTML
 *
 * CACHING STRATEGY:
 * - Content-hashed filenames: app.a3b4c5.js
 * - Long cache headers (1 year) for hashed assets
 * - Split vendor chunk separately (changes less often)
 *
 * VITE/WEBPACK CONFIG:
 * - splitChunks: separate vendor from app code
 * - Vendor chunk cached longer since dependencies change less
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * 🛠️ 8. AVOID BARREL FILE BLOAT
 * ═══════════════════════════════════════════════════════════════
 *
 * Barrel files (index.ts re-exporting everything) can defeat tree-shaking.
 */

// ❌ BAD — barrel file pulls in everything
// // components/index.ts
// export { Button } from './Button';
// export { Modal } from './Modal';      // 50KB
// export { DataGrid } from './DataGrid'; // 200KB
//
// // consumer.ts
// import { Button } from './components'; // May pull Modal + DataGrid too

// ✅ GOOD — direct imports
// import { Button } from './components/Button';

/**
 * ═══════════════════════════════════════════════════════════════
 * 🛠️ 9. EXTERNALIZE LARGE LIBS (CDN)
 * ═══════════════════════════════════════════════════════════════
 *
 * For very large libs used across pages (React, React-DOM),
 * serve from CDN and mark as external in bundler config.
 *
 * Benefits:
 * - Shared CDN cache across sites
 * - Parallel download (separate domain)
 * - Your bundle shrinks significantly
 *
 * Trade-off: Extra DNS lookup + dependency on CDN availability.
 * Best for: internal tools, not critical production apps.
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * 📋 INTERVIEW SUMMARY — BUNDLE OPTIMIZATION CHECKLIST
 * ═══════════════════════════════════════════════════════════════
 *
 * | Technique                  | Impact   | Effort |
 * |----------------------------|----------|--------|
 * | Route-level code splitting | 🔥 High  | Low    |
 * | Tree shaking (ES imports)  | 🔥 High  | Low    |
 * | Replace heavy deps         | 🔥 High  | Medium |
 * | Bundle analysis            | Medium   | Low    |
 * | Dynamic imports            | Medium   | Low    |
 * | Compression (brotli)       | Medium   | Low    |
 * | Image optimization         | Medium   | Medium |
 * | Avoid barrel files         | Low-Med  | Low    |
 * | Vendor chunk splitting     | Medium   | Low    |
 * | Externalize to CDN         | Medium   | Medium |
 *
 * ═══════════════════════════════════════════════════════════════
 * 🗣️ WHAT INTERVIEWERS WANT TO HEAR:
 * ═══════════════════════════════════════════════════════════════
 *
 * 1. "First thing I do is run bundle analyzer to find the biggest offenders"
 * 2. "Route-level code splitting with React.lazy gives the biggest win"
 * 3. "Tree shaking only works with ES modules — avoid CommonJS imports"
 * 4. "I check bundlephobia before adding any dependency"
 * 5. "Dynamic import() for features not needed on initial load"
 * 6. "moment.js → dayjs, lodash → lodash-es with cherry-picking"
 * 7. "Barrel files can silently defeat tree shaking"
 * 8. "Vendor chunk separation improves cache hit rates"
 * 9. "Brotli compression reduces transfer size by 70-80%"
 */




// --------------------------------------------------------------
// 6. PERFORMANCE OPTIMIZATION TECHNIQUES FOR REACT APPS
// --------------------------------------------------------------

/**
 * 🎯 INTERVIEW ANSWER STRUCTURE:
 *
 * React performance optimization falls into 3 categories:
 * A) Reduce unnecessary re-renders
 * B) Reduce work per render
 * C) Reduce what's shipped to the browser
 *
 * Category C (bundle size) is covered in Q5.
 * This question focuses on A and B — runtime performance.
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 🔑 UNDERSTANDING REACT'S RENDER CYCLE
 * ═══════════════════════════════════════════════════════════════
 *
 * "Render" in React means calling your component function.
 * It does NOT mean DOM update.
 *
 * Render → Reconciliation (diff) → Commit (DOM update)
 *
 * A render is WASTED if:
 * - Component re-runs but produces identical output
 * - The diff finds nothing changed → no DOM commit
 * - Still costs CPU time for the function call + diffing
 *
 * WHEN does a component re-render?
 * 1. Its state changes (setState)
 * 2. Its parent re-renders (props may or may not change)
 * 3. Context value it consumes changes
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 🛠️ 1. React.memo — PREVENT UNNECESSARY CHILD RE-RENDERS
 * ═══════════════════════════════════════════════════════════════
 *
 * Wraps a component to skip re-render if props haven't changed
 * (shallow comparison by default).
 */

// ❌ BAD — ExpensiveList re-renders every time Parent's state changes
// function Parent() {
//   const [count, setCount] = useState(0);
//   return (
//     <>
//       <button onClick={() => setCount(c => c + 1)}>+</button>
//       <ExpensiveList items={items} /> {/* re-renders on every click */}
//     </>
//   );
// }

// ✅ GOOD — memo skips re-render if `items` reference is stable
// const ExpensiveList = React.memo(function ExpensiveList({ items }) {
//   return items.map(item => <ListItem key={item.id} item={item} />);
// });

/**
 * WHEN TO USE React.memo:
 * ✅ Component renders often with same props
 * ✅ Component is expensive to render (large tree, heavy computation)
 * ✅ Component is deep in the tree (parent re-renders frequently)
 *
 * WHEN NOT TO USE:
 * ❌ Component always receives new props (memo check is wasted)
 * ❌ Component is cheap to render (overhead > savings)
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 🛠️ 2. useMemo — CACHE EXPENSIVE COMPUTATIONS
 * ═══════════════════════════════════════════════════════════════
 */

// ❌ BAD — filters 10K items on EVERY render
// function SearchResults({ items, query }) {
//   const filtered = items.filter(i => i.name.includes(query)); // runs every render
//   return <List items={filtered} />;
// }

// ✅ GOOD — only recomputes when items or query change
// function SearchResults({ items, query }) {
//   const filtered = useMemo(
//     () => items.filter(i => i.name.includes(query)),
//     [items, query]
//   );
//   return <List items={filtered} />;
// }

/**
 * ALSO USE useMemo FOR STABLE REFERENCES:
 * - Prevents child re-renders when passing objects/arrays as props
 * - Without memo, a new array/object reference is created each render
 */

// const chartData = useMemo(() => ({
//   labels: data.map(d => d.date),
//   values: data.map(d => d.value),
// }), [data]);

/**
 * ═══════════════════════════════════════════════════════════════
 * 🛠️ 3. useCallback — STABLE FUNCTION REFERENCES
 * ═══════════════════════════════════════════════════════════════
 */

// ❌ BAD — new function every render → memo'd child still re-renders
// function Parent() {
//   const handleClick = (id) => deleteItem(id); // new ref each render
//   return <MemoizedChild onClick={handleClick} />;
// }

// ✅ GOOD — stable reference, memo'd child skips re-render
// function Parent() {
//   const handleClick = useCallback((id) => deleteItem(id), []);
//   return <MemoizedChild onClick={handleClick} />;
// }

/**
 * RULE: useCallback is only useful when the function is passed to
 * a memoized child or used as a dependency in another hook.
 * Don't useCallback everything — it has its own overhead.
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 🛠️ 4. VIRTUALIZATION — RENDER ONLY VISIBLE ITEMS
 * ═══════════════════════════════════════════════════════════════
 *
 * Rendering 10,000 DOM nodes is slow regardless of React.
 * Virtualization renders only what's in the viewport (~20-50 items).
 *
 * Libraries: @tanstack/react-virtual, react-window, react-virtuoso
 *
 * USE WHEN:
 * - Lists/tables with 100+ items
 * - Infinite scroll feeds
 * - Large data grids
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 🛠️ 5. STATE COLOCATION — KEEP STATE CLOSE TO WHERE IT'S USED
 * ═══════════════════════════════════════════════════════════════
 *
 * Lifting state too high causes unnecessary re-renders of siblings.
 */

// ❌ BAD — typing in search re-renders Sidebar, Header, Footer
// function App() {
//   const [search, setSearch] = useState('');
//   return (
//     <>
//       <Header />
//       <Sidebar />
//       <SearchInput value={search} onChange={setSearch} />
//       <Results query={search} />
//       <Footer />
//     </>
//   );
// }

// ✅ GOOD — search state lives only where needed
// function SearchSection() {
//   const [search, setSearch] = useState('');
//   return (
//     <>
//       <SearchInput value={search} onChange={setSearch} />
//       <Results query={search} />
//     </>
//   );
// }
// function App() {
//   return (
//     <>
//       <Header />
//       <Sidebar />
//       <SearchSection /> {/* Only this re-renders on typing */}
//       <Footer />
//     </>
//   );
// }

/**
 * ═══════════════════════════════════════════════════════════════
 * 🛠️ 6. CONTEXT OPTIMIZATION — AVOID RE-RENDER CASCADES
 * ═══════════════════════════════════════════════════════════════
 *
 * PROBLEM: When context value changes, ALL consumers re-render.
 */

// ❌ BAD — single context with everything → all consumers re-render
// const AppContext = createContext();
// function Provider({ children }) {
//   const [user, setUser] = useState(null);
//   const [theme, setTheme] = useState('light');
//   return (
//     <AppContext.Provider value={{ user, theme, setUser, setTheme }}>
//       {children}
//     </AppContext.Provider>
//   );
// }

// ✅ GOOD — split contexts by update frequency
// const UserContext = createContext();
// const ThemeContext = createContext();
//
// // Components consuming only theme won't re-render when user changes

// ✅ ALSO GOOD — memoize context value
// function ThemeProvider({ children }) {
//   const [theme, setTheme] = useState('light');
//   const value = useMemo(() => ({ theme, setTheme }), [theme]);
//   return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
// }

/**
 * ═══════════════════════════════════════════════════════════════
 * 🛠️ 7. useTransition & useDeferredValue (React 18+)
 * ═══════════════════════════════════════════════════════════════
 *
 * Mark updates as non-urgent so React can keep the UI responsive.
 */

// ✅ useTransition — filter a large list without blocking input
// function FilterableList({ items }) {
//   const [query, setQuery] = useState('');
//   const [filtered, setFiltered] = useState(items);
//   const [isPending, startTransition] = useTransition();
//
//   function handleChange(e) {
//     setQuery(e.target.value); // urgent — update input immediately
//     startTransition(() => {
//       setFiltered(items.filter(i => i.includes(e.target.value))); // non-urgent
//     });
//   }
//
//   return (
//     <>
//       <input value={query} onChange={handleChange} />
//       {isPending && <Spinner />}
//       <List items={filtered} />
//     </>
//   );
// }

// ✅ useDeferredValue — defer expensive child render
// function Search({ query }) {
//   const deferredQuery = useDeferredValue(query);
//   return <HeavyResults query={deferredQuery} />; // renders with stale value while typing
// }

/**
 * ═══════════════════════════════════════════════════════════════
 * 🛠️ 8. LAZY LOADING & SUSPENSE
 * ═══════════════════════════════════════════════════════════════
 *
 * Don't load what the user doesn't need yet.
 *
 * - React.lazy for route/component splitting (see Q5)
 * - Lazy load images: loading="lazy"
 * - Lazy load below-fold sections with IntersectionObserver
 * - Prefetch on hover/focus for likely navigations
 */

// Prefetch on hover (Next.js does this automatically)
// <Link onMouseEnter={() => import('./HeavyPage')} to="/heavy">
//   Go to Heavy Page
// </Link>

/**
 * ═══════════════════════════════════════════════════════════════
 * 🛠️ 9. AVOID COMMON ANTI-PATTERNS
 * ═══════════════════════════════════════════════════════════════
 */

// ❌ ANTI-PATTERN 1: Inline objects in JSX (new ref every render)
// <Chart data={{ labels, values }} />
// ✅ FIX: useMemo or extract to constant

// ❌ ANTI-PATTERN 2: Index as key in dynamic lists
// items.map((item, i) => <Item key={i} />)
// ✅ FIX: Use stable unique ID: key={item.id}

// ❌ ANTI-PATTERN 3: Deriving state from props in useEffect
// useEffect(() => { setFiltered(items.filter(...)) }, [items]);
// ✅ FIX: Compute during render with useMemo

// ❌ ANTI-PATTERN 4: Unnecessary state (derived data)
// const [fullName, setFullName] = useState('');
// useEffect(() => setFullName(first + ' ' + last), [first, last]);
// ✅ FIX: const fullName = `${first} ${last}`; // just compute it

// ❌ ANTI-PATTERN 5: Re-creating providers on every render
// <Context.Provider value={{ fn: () => {}, data }}>
// ✅ FIX: Memoize the value object

/**
 * ═══════════════════════════════════════════════════════════════
 * 🛠️ 10. IMAGE & ASSET OPTIMIZATION
 * ═══════════════════════════════════════════════════════════════
 *
 * Images are typically 50-70% of a page's total weight.
 *
 * FORMAT SELECTION:
 * | Format | Use Case                        | Savings vs PNG |
 * |--------|---------------------------------|----------------|
 * | WebP   | Photos, general purpose         | ~30%           |
 * | AVIF   | Photos (best compression)       | ~50%           |
 * | SVG    | Icons, logos, illustrations      | Scalable       |
 * | PNG    | Transparency needed, fallback    | Baseline       |
 *
 * RESPONSIVE IMAGES:
 *   <img
 *     srcset="hero-400.webp 400w, hero-800.webp 800w, hero-1200.webp 1200w"
 *     sizes="(max-width: 600px) 400px, (max-width: 1024px) 800px, 1200px"
 *     src="hero-800.webp"
 *     loading="lazy"
 *     decoding="async"
 *     alt="Hero"
 *   />
 *
 * LAZY LOADING:
 * - loading="lazy" for below-fold images (native browser support)
 * - IntersectionObserver for custom lazy-load behavior
 * - NEVER lazy-load LCP image (above-fold hero) — use fetchpriority="high"
 *
 * NEXT.JS / FRAMEWORK FEATURES:
 * - next/image: auto WebP, responsive srcset, lazy by default, blur placeholder
 * - Vite: vite-imagetools for build-time optimization
 *
 * OTHER ASSET OPTIMIZATIONS:
 * - Fonts: font-display: swap, preload critical fonts, subset unused glyphs
 * - CSS: Extract critical CSS inline, defer non-critical
 * - Preconnect to third-party origins: <link rel="preconnect" href="...">
 * - Prefetch resources for likely next navigation
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * 🛠️ 11. PROFILING & MEASUREMENT
 * ═══════════════════════════════════════════════════════════════
 *
 * TOOLS:
 * - React DevTools Profiler: identify slow components, wasted renders
 * - Chrome Performance tab: flame chart, long tasks
 * - React.Profiler component: programmatic render timing
 * - why-did-you-render: logs unnecessary re-renders in dev
 *
 * WORKFLOW:
 * 1. Profile first — don't optimize blindly
 * 2. Find the bottleneck (usually 1-2 components)
 * 3. Apply targeted fix
 * 4. Measure again to confirm improvement
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 📋 INTERVIEW SUMMARY — REACT PERFORMANCE
 * ═══════════════════════════════════════════════════════════════
 *
 * | Technique              | What it solves                         |
 * |------------------------|----------------------------------------|
 * | React.memo             | Unnecessary child re-renders           |
 * | useMemo                | Expensive recomputation + stable refs  |
 * | useCallback            | Stable function refs for memo'd children|
 * | Virtualization         | Large lists/tables (DOM bloat)         |
 * | State colocation       | Sibling re-renders from lifted state   |
 * | Context splitting      | Context re-render cascades             |
 * | useTransition          | Blocking UI during heavy state updates |
 * | useDeferredValue       | Expensive child renders during typing  |
 * | Code splitting         | Initial bundle size                    |
 * | Lazy loading           | Loading unused resources upfront       |
 *
 * ═══════════════════════════════════════════════════════════════
 * 🗣️ WHAT INTERVIEWERS WANT TO HEAR:
 * ═══════════════════════════════════════════════════════════════
 *
 * 1. "I profile first with React DevTools before optimizing"
 * 2. "Most perf issues come from unnecessary re-renders —
 *     I fix with memo + stable references"
 * 3. "State colocation is the simplest win — keep state
 *     close to where it's consumed"
 * 4. "For large lists, virtualization is non-negotiable"
 * 5. "React 18's useTransition lets me keep input responsive
 *     while deferring expensive updates"
 * 6. "Context should be split by update frequency —
 *     one giant context re-renders everything"
 * 7. "I avoid inline objects/functions in JSX for memo'd components"
 * 8. "Derived state should be computed during render, not in useEffect"
 */




// --------------------------------------------------------------
// 7. WHAT HAPPENS WHEN YOU TYPE A URL AND HIT ENTER?
// --------------------------------------------------------------

/**
 * 🎯 INTERVIEW ANSWER STRUCTURE:
 *
 * This is an end-to-end systems question. Interviewers want to see
 * you can trace the full lifecycle from keystroke to rendered pixels.
 * Depth on any layer (DNS, TCP, rendering) shows seniority.
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * STEP 1: URL PARSING & HSTS CHECK
 * ═══════════════════════════════════════════════════════════════
 *
 * Browser parses the input:
 * - Is it a URL or a search query?
 * - Extracts: protocol (https), host (www.example.com), port (443),
 *   path (/page), query string (?id=1), fragment (#section)
 *
 * HSTS (HTTP Strict Transport Security):
 * - Browser checks its HSTS preload list
 * - If domain is listed → automatically upgrades http:// to https://
 * - Prevents downgrade attacks before any network request
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * STEP 2: DNS RESOLUTION (Domain → IP Address)
 * ═══════════════════════════════════════════════════════════════
 *
 * Browser needs the IP address of "www.example.com"
 *
 * LOOKUP ORDER (cache hierarchy):
 * 1. Browser DNS cache (Chrome: chrome://net-internals/#dns)
 * 2. OS DNS cache (system resolver)
 * 3. Router cache
 * 4. ISP's recursive DNS resolver cache
 * 5. Root DNS servers → TLD servers → Authoritative nameserver
 *
 * RECURSIVE RESOLUTION (if not cached):
 *
 *   Client → Recursive Resolver
 *     → Root Server (.)         → "Ask .com TLD server"
 *     → TLD Server (.com)       → "Ask ns1.example.com"
 *     → Authoritative Server    → "IP is 93.184.216.34"
 *
 * DNS RECORD TYPES:
 * - A record: domain → IPv4
 * - AAAA record: domain → IPv6
 * - CNAME: alias → canonical name
 * - TTL: how long to cache the result
 *
 * PERFORMANCE:
 * - DNS lookup: 20-120ms (uncached)
 * - Optimization: dns-prefetch, preconnect
 *   <link rel="dns-prefetch" href="//api.example.com">
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * STEP 3: TCP CONNECTION (Three-Way Handshake)
 * ═══════════════════════════════════════════════════════════════
 *
 * Browser establishes a TCP connection to the server's IP:port.
 *
 *   Client              Server
 *     │── SYN ──────────→│    (1) Client sends SYN (seq=x)
 *     │←── SYN-ACK ──────│    (2) Server responds SYN-ACK (seq=y, ack=x+1)
 *     │── ACK ──────────→│    (3) Client sends ACK (ack=y+1)
 *     │                   │    Connection ESTABLISHED
 *
 * WHY 3 steps?
 * - Both sides confirm they can send AND receive
 * - Establishes initial sequence numbers (prevents replay attacks)
 *
 * COST: 1 round-trip time (RTT) — typically 10-100ms
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * STEP 4: TLS HANDSHAKE (HTTPS)
 * ═══════════════════════════════════════════════════════════════
 *
 * If HTTPS, a TLS handshake follows TCP:
 *
 *   Client                          Server
 *     │── ClientHello ──────────────→│  (supported ciphers, TLS version)
 *     │←── ServerHello ──────────────│  (chosen cipher, certificate)
 *     │    [Client verifies cert]     │
 *     │── Key Exchange ─────────────→│  (pre-master secret)
 *     │←── Finished ─────────────────│
 *     │── Finished ─────────────────→│
 *     │    [Symmetric encryption ON]  │
 *
 * WHAT HAPPENS:
 * 1. Client sends supported cipher suites + random number
 * 2. Server sends its certificate + chosen cipher + random number
 * 3. Client verifies certificate against trusted CAs
 * 4. Both derive session keys (symmetric encryption)
 * 5. All further communication is encrypted
 *
 * TLS 1.3 OPTIMIZATION:
 * - Reduced to 1-RTT (vs 2-RTT in TLS 1.2)
 * - 0-RTT resumption for repeat visits
 *
 * COST: 1-2 additional RTTs (50-200ms)
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * STEP 5: HTTP REQUEST
 * ═══════════════════════════════════════════════════════════════
 *
 * Browser sends an HTTP request over the encrypted connection:
 *
 *   GET /page HTTP/2
 *   Host: www.example.com
 *   User-Agent: Chrome/125
 *   Accept: text/html
 *   Accept-Encoding: gzip, br
 *   Cookie: session=abc123
 *   If-None-Match: "etag-xyz"        ← conditional request (caching)
 *
 * HTTP/2 ADVANTAGES:
 * - Multiplexing: multiple requests on single connection
 * - Header compression (HPACK)
 * - Server push (deprecated in most browsers)
 * - Binary framing (vs text in HTTP/1.1)
 *
 * HTTP/3 (QUIC):
 * - Built on UDP (not TCP)
 * - 0-RTT connection establishment
 * - No head-of-line blocking
 * - Built-in encryption (TLS 1.3 integrated)
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * STEP 6: SERVER PROCESSING
 * ═══════════════════════════════════════════════════════════════
 *
 * Request hits the server infrastructure:
 *
 * 1. LOAD BALANCER (e.g., AWS ALB, Nginx)
 *    - Distributes traffic across server instances
 *    - Health checks, SSL termination
 *
 * 2. WEB SERVER (Nginx/Apache)
 *    - Serves static files directly
 *    - Proxies dynamic requests to application server
 *
 * 3. APPLICATION SERVER (Node.js, Django, Spring)
 *    - Route matching
 *    - Middleware execution (auth, logging, rate limiting)
 *    - Business logic
 *    - Database queries
 *
 * 4. DATABASE / CACHE
 *    - Check Redis/Memcached first (cache hit → fast)
 *    - Query PostgreSQL/MongoDB if cache miss
 *    - ORM generates SQL, connection pooling
 *
 * 5. RESPONSE CONSTRUCTION
 *    - Server-side rendering (SSR) if applicable
 *    - JSON API response for SPAs
 *    - Set caching headers (Cache-Control, ETag)
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * STEP 7: HTTP RESPONSE
 * ═══════════════════════════════════════════════════════════════
 *
 *   HTTP/2 200 OK
 *   Content-Type: text/html; charset=utf-8
 *   Content-Encoding: br                    ← brotli compressed
 *   Cache-Control: public, max-age=3600
 *   ETag: "abc123"
 *   Set-Cookie: session=xyz; HttpOnly; Secure
 *   Content-Length: 45000
 *
 *   <!DOCTYPE html>...
 *
 * CACHING SCENARIOS:
 * - 200: fresh response, full body
 * - 304 Not Modified: ETag matched, use cached version (no body)
 * - 301/302: redirect → browser follows Location header
 *
 * CDN LAYER (Cloudflare, CloudFront):
 * - If resource is cached at edge → served without hitting origin
 * - Reduces latency dramatically (edge is geographically close)
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * STEP 8: BROWSER PARSING & RENDERING (Critical Rendering Path)
 * ═══════════════════════════════════════════════════════════════
 *
 * Once HTML bytes arrive, the browser begins rendering:
 *
 * ┌─────────────────────────────────────────────────────────────┐
 * │ 1. HTML Parsing → DOM Tree                                  │
 * │    - Tokenizer → Tree construction                          │
 * │    - Encounters <script> → BLOCKS parsing (unless async/defer)│
 * │    - Encounters <link rel="stylesheet"> → BLOCKS rendering  │
 * │                                                             │
 * │ 2. CSS Parsing → CSSOM Tree                                 │
 * │    - Parse all stylesheets                                  │
 * │    - Cascade, specificity, inheritance resolved             │
 * │                                                             │
 * │ 3. DOM + CSSOM → Render Tree                                │
 * │    - Only visible elements (no display:none, no <head>)     │
 * │    - Each node has computed styles                          │
 * │                                                             │
 * │ 4. Layout (Reflow)                                          │
 * │    - Calculate exact position and size of every element     │
 * │    - Box model: margin, border, padding, content            │
 * │                                                             │
 * │ 5. Paint                                                    │
 * │    - Convert layout to actual pixels                        │
 * │    - Fill colors, text, images, borders, shadows            │
 * │                                                             │
 * │ 6. Composite                                                │
 * │    - Combine painted layers in correct order                │
 * │    - GPU-accelerated for transform/opacity layers           │
 * └─────────────────────────────────────────────────────────────┘
 *
 * SCRIPT LOADING STRATEGIES:
 * - <script>: blocks HTML parsing
 * - <script defer>: downloads parallel, executes after DOM ready (in order)
 * - <script async>: downloads parallel, executes immediately (no order guarantee)
 *
 * CSS IS RENDER-BLOCKING:
 * - Browser won't paint until CSSOM is complete
 * - Critical CSS should be inlined in <head>
 * - Non-critical CSS: media queries or async loading
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * STEP 9: JAVASCRIPT EXECUTION & HYDRATION
 * ═══════════════════════════════════════════════════════════════
 *
 * After DOM is ready:
 * 1. JS bundles execute
 * 2. React (or framework) hydrates server-rendered HTML
 *    - Attaches event listeners
 *    - Makes page interactive
 * 3. Lazy-loaded chunks fetched as needed
 * 4. API calls for dynamic data (fetch → render)
 *
 * KEY METRICS:
 * - FCP (First Contentful Paint): first text/image visible
 * - LCP (Largest Contentful Paint): main content visible
 * - TTI (Time to Interactive): page responds to input
 * - CLS (Cumulative Layout Shift): visual stability
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 📋 COMPLETE TIMELINE SUMMARY
 * ═══════════════════════════════════════════════════════════════
 *
 * ┌──────────────────────────────────────────────────────────┐
 * │ 1. URL Parse + HSTS check              (~0ms)            │
 * │ 2. DNS Resolution                      (0-100ms)         │
 * │ 3. TCP Handshake                       (1 RTT, ~10-50ms) │
 * │ 4. TLS Handshake                       (1-2 RTT, ~50ms)  │
 * │ 5. HTTP Request sent                   (~0ms)            │
 * │ 6. Server Processing                   (50-500ms)        │
 * │ 7. Response Transfer (TTFB + download) (50-200ms)        │
 * │ 8. HTML Parse → DOM → CSSOM → Render   (50-200ms)        │
 * │ 9. JS Execute → Hydrate → Interactive  (100-500ms)       │
 * └──────────────────────────────────────────────────────────┘
 *    Total: ~300ms - 1500ms (typical modern website)
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 🗣️ WHAT INTERVIEWERS WANT TO HEAR:
 * ═══════════════════════════════════════════════════════════════
 *
 * FRONTEND INTERVIEWS — emphasize:
 * - Critical rendering path (DOM, CSSOM, render tree, paint)
 * - Script loading (async vs defer)
 * - CSS is render-blocking
 * - Core Web Vitals (LCP, FCP, CLS, INP)
 * - Hydration in SSR apps
 *
 * BACKEND INTERVIEWS — emphasize:
 * - DNS resolution hierarchy
 * - TCP/TLS handshake details
 * - Load balancing, reverse proxy
 * - Server processing pipeline (middleware, DB, caching)
 * - HTTP/2 multiplexing, HTTP/3 QUIC
 * - CDN caching, Cache-Control headers
 *
 * FULL-STACK — cover both, show you understand the entire chain.
 *
 * SENIOR-LEVEL ADDITIONS:
 * - Connection reuse (keep-alive, connection pooling)
 * - Service workers intercepting requests
 * - Preload, prefetch, preconnect hints
 * - HTTP/3 and 0-RTT
 * - Edge computing (Cloudflare Workers, Lambda@Edge)
 * - Browser resource prioritization (fetchpriority)
 */



// --------------------------------------------------------------
// 8. EXPLAIN THE EVENT LOOP IN JAVASCRIPT
// --------------------------------------------------------------

/**
 * 🎯 INTERVIEW ANSWER STRUCTURE:
 *
 * JavaScript is SINGLE-THREADED — it has ONE call stack.
 * Yet it handles async operations (timers, network, I/O) without blocking.
 * The Event Loop is the mechanism that makes this possible.
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 🧠 CORE COMPONENTS
 * ═══════════════════════════════════════════════════════════════
 *
 * 1. CALL STACK
 *    - LIFO structure where function execution contexts are pushed/popped
 *    - Only ONE function executes at a time
 *    - When stack is empty → event loop checks queues
 *
 * 2. WEB APIs / NODE APIs
 *    - setTimeout, fetch, DOM events, etc.
 *    - These run OUTSIDE the JS engine (browser/Node provides them)
 *    - When done → callback is placed in a queue
 *
 * 3. MICROTASK QUEUE (Job Queue)
 *    - Promise.then/catch/finally callbacks
 *    - queueMicrotask()
 *    - MutationObserver
 *    - HIGHER PRIORITY than macrotask queue
 *    - Completely drained before any macrotask runs
 *
 * 4. MACROTASK QUEUE (Task Queue)
 *    - setTimeout / setInterval callbacks
 *    - setImmediate (Node.js)
 *    - I/O callbacks
 *    - UI rendering events
 *    - requestAnimationFrame (runs before paint, after microtasks)
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 🔄 EVENT LOOP ALGORITHM (Per Iteration)
 * ═══════════════════════════════════════════════════════════════
 *
 * 1. Execute all synchronous code on the call stack
 * 2. Call stack empty? →
 * 3. Drain the ENTIRE microtask queue (all microtasks, including
 *    newly added ones during this drain)
 * 4. Pick ONE macrotask from the macrotask queue → execute it
 * 5. Drain microtask queue again
 * 6. Render/paint if needed (requestAnimationFrame runs here)
 * 7. Repeat from step 4
 *
 * KEY INSIGHT:
 * - ALL microtasks run before the NEXT macrotask
 * - A microtask can schedule another microtask → both run
 *   before the next macrotask
 * - This is why Promise.then() always runs before setTimeout(fn, 0)
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 📝 CLASSIC INTERVIEW OUTPUT QUESTION
 * ═══════════════════════════════════════════════════════════════
 */

// What's the output?

console.log('1');                          // Sync

setTimeout(() => console.log('2'), 0);    // Macrotask

Promise.resolve().then(() => {
  console.log('3');                        // Microtask
  Promise.resolve().then(() => console.log('4')); // Microtask (nested)
});

console.log('5');                          // Sync

// OUTPUT: 1, 5, 3, 4, 2
//
// WHY:
// 1 → sync (call stack)
// 5 → sync (call stack)
// 3 → microtask queue drains (Promise.then)
// 4 → nested microtask (added during drain, still runs before macrotask)
// 2 → macrotask (setTimeout)


/**
 * ═══════════════════════════════════════════════════════════════
 * 📝 ADVANCED OUTPUT QUESTION
 * ═══════════════════════════════════════════════════════════════
 */

async function asyncFn() {
  console.log('A');              // Sync (inside async, before await)
  await Promise.resolve();       // Yields — rest becomes microtask
  console.log('B');              // Microtask
}

console.log('C');
setTimeout(() => console.log('D'), 0);
asyncFn();
console.log('E');

// OUTPUT: C, A, E, B, D
//
// C → sync
// A → sync (async function runs synchronously until first await)
// E → sync
// B → microtask (continuation after await)
// D → macrotask


/**
 * ═══════════════════════════════════════════════════════════════
 * 🎯 requestAnimationFrame vs setTimeout vs Microtask
 * ═══════════════════════════════════════════════════════════════
 *
 * EXECUTION ORDER:
 * 1. Microtasks (Promise.then, queueMicrotask)
 * 2. requestAnimationFrame (before paint)
 * 3. Paint/Render
 * 4. setTimeout/setInterval (macrotask, next iteration)
 *
 * rAF runs once per frame (~16.6ms at 60fps)
 * setTimeout(fn, 0) → minimum ~4ms delay (clamped by browser)
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * ⚠️ COMMON PITFALLS
 * ═══════════════════════════════════════════════════════════════
 *
 * 1. INFINITE MICROTASK LOOP (starves macrotasks & rendering):
 *    function bad() { Promise.resolve().then(bad); }
 *    // Browser freezes — macrotasks and paint never run
 *
 * 2. setTimeout(fn, 0) IS NOT "IMMEDIATE":
 *    - Clamped to ~4ms in browsers (nested setTimeout)
 *    - All pending microtasks run first
 *    - Rendering may happen before it fires
 *
 * 3. async/await is SYNTACTIC SUGAR over Promises:
 *    - Code before await = synchronous
 *    - Code after await = microtask (.then callback)
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 📋 INTERVIEW SUMMARY
 * ═══════════════════════════════════════════════════════════════
 *
 * | Concept               | Key Point                              |
 * |-----------------------|----------------------------------------|
 * | Single-threaded       | One call stack, one thing at a time    |
 * | Microtask priority    | Always drains before next macrotask    |
 * | Promise.then          | Microtask                              |
 * | setTimeout            | Macrotask                              |
 * | async/await           | After await = microtask                |
 * | rAF                   | Before paint, after microtasks         |
 * | Starvation risk       | Infinite microtasks block rendering    |
 *
 * 🗣️ WHAT INTERVIEWERS WANT TO HEAR:
 * 1. "Microtasks always run before the next macrotask"
 * 2. "Promise.then is a microtask, setTimeout is a macrotask"
 * 3. "async/await — code after await is scheduled as a microtask"
 * 4. "The event loop enables non-blocking I/O on a single thread"
 * 5. "requestAnimationFrame fires before paint but after microtasks"
 */


// --------------------------------------------------------------
// 9. CLOSURES, SCOPE & HOISTING
// --------------------------------------------------------------

/**
 * 🎯 INTERVIEW ANSWER STRUCTURE:
 *
 * A CLOSURE is a function that retains access to its outer
 * (lexical) scope even after the outer function has returned.
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 🧠 SCOPE TYPES
 * ═══════════════════════════════════════════════════════════════
 *
 * 1. GLOBAL SCOPE — accessible everywhere
 * 2. FUNCTION SCOPE — var is function-scoped
 * 3. BLOCK SCOPE — let/const are block-scoped ({})
 * 4. LEXICAL SCOPE — inner functions access outer variables
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 📝 CLASSIC CLOSURE INTERVIEW QUESTION
 * ═══════════════════════════════════════════════════════════════
 */

// ❌ What's the output?
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 1000);
}
// OUTPUT: 3, 3, 3
// WHY: `var` is function-scoped. By the time setTimeout fires,
//       loop is done and `i` is 3. All callbacks share same `i`.

// ✅ FIX 1: Use `let` (block-scoped — each iteration gets its own `i`)
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 1000);
}
// OUTPUT: 0, 1, 2

// ✅ FIX 2: IIFE creates new scope per iteration
for (var i = 0; i < 3; i++) {
  ((j) => {
    setTimeout(() => console.log(j), 1000);
  })(i);
}
// OUTPUT: 0, 1, 2


/**
 * ═══════════════════════════════════════════════════════════════
 * 🏗️ PRACTICAL CLOSURE USE CASES
 * ═══════════════════════════════════════════════════════════════
 */

// 1. Data Privacy / Encapsulation
function createCounter() {
  let count = 0; // Private — not accessible outside
  return {
    increment: () => ++count,
    decrement: () => --count,
    getCount: () => count,
  };
}
const counter = createCounter();
counter.increment();
counter.increment();
console.log(counter.getCount()); // 2

// 2. Function Factories
function multiply(factor) {
  return (number) => number * factor;
}
const double = multiply(2);
const triple = multiply(3);
console.log(double(5)); // 10
console.log(triple(5)); // 15


/**
 * ═══════════════════════════════════════════════════════════════
 * 🔄 HOISTING
 * ═══════════════════════════════════════════════════════════════
 *
 * | Declaration         | Hoisted? | Initialized?          |
 * |---------------------|----------|-----------------------|
 * | var                 | ✅ Yes   | undefined             |
 * | let / const         | ✅ Yes   | ❌ No (TDZ)          |
 * | function declaration| ✅ Yes   | ✅ Fully (body too)  |
 * | function expression | ✅ var   | undefined             |
 * | class               | ✅ Yes   | ❌ No (TDZ)          |
 *
 * TDZ (Temporal Dead Zone):
 * - let/const are hoisted but NOT initialized
 * - Accessing before declaration → ReferenceError
 */

console.log(a); // undefined (var hoisted)
// console.log(b); // ❌ ReferenceError (TDZ)
var a = 1;
let b = 2;

hoisted();    // ✅ Works — fully hoisted
// notHoisted(); // ❌ TypeError
function hoisted() { console.log("I work!"); }
var notHoisted = function() { console.log("I don't"); };


/**
 * ═══════════════════════════════════════════════════════════════
 * 📋 INTERVIEW SUMMARY
 * ═══════════════════════════════════════════════════════════════
 *
 * 🗣️ WHAT INTERVIEWERS WANT TO HEAR:
 * 1. "A closure is a function + its lexical environment"
 * 2. "var is function-scoped, let/const are block-scoped"
 * 3. "The classic for-loop + setTimeout is solved with let or IIFE"
 * 4. "Closures enable data privacy and function factories"
 * 5. "Hoisting moves declarations up but let/const have TDZ"
 */


// (Covered in Q4 — transform/opacity are GPU-composited, skip layout & paint)


// --------------------------------------------------------------
// 10. THIS KEYWORD, CALL, APPLY, BIND
// --------------------------------------------------------------

/**
 * `this` is determined by HOW a function is CALLED, not where defined.
 *
 * RULES (Priority):
 * 1. new → this = new object
 * 2. call/apply/bind → this = specified object
 * 3. obj.method() → this = obj
 * 4. standalone → this = window (undefined in strict)
 * 5. Arrow → lexical this (NEVER changes)
 *
 * | Method | Executes? | Args           |
 * |--------|-----------|----------------|
 * | call   | Yes       | comma-separated|
 * | apply  | Yes       | array          |
 * | bind   | No        | returns new fn |
 */



// --------------------------------------------------------------
// 11. PROTOTYPES & INHERITANCE
// --------------------------------------------------------------

/**
 * JS uses prototypal inheritance — objects link to objects.
 * Property lookup walks chain until null.
 * ES6 classes are sugar over prototypes.
 * hasOwnProperty distinguishes own vs inherited.
 */



// --------------------------------------------------------------
// 12. REACT HOOKS DEEP DIVE (forwardRef, useImperativeHandle)
// --------------------------------------------------------------

/**
 * useEffect: [] = mount, return = unmount, [dep] = update
 * useRef: persists across renders WITHOUT triggering re-render
 * useLayoutEffect: fires BEFORE paint (sync) — for DOM measurement
 * forwardRef: pass ref from parent to child DOM node
 * useImperativeHandle: controls what parent can access via ref
 */



// --------------------------------------------------------------
// 13. CSS FLEXBOX vs GRID
// --------------------------------------------------------------

/**
 * Flexbox = 1D (row or column). Grid = 2D (rows + columns).
 * Flexbox: content dictates layout.
 * Grid: layout dictates content.
 * Complementary — Grid for page, Flexbox for components.
 */



// --------------------------------------------------------------
// 14. WEB SECURITY (XSS, CSRF)
// --------------------------------------------------------------

/**
 * XSS: inject scripts → prevent with escaping, CSP, never innerHTML user data
 * CSRF: forge requests → prevent with tokens, SameSite cookies
 * React auto-escapes JSX. dangerouslySetInnerHTML is the exception.
 */



// --------------------------------------------------------------
// 15. STATE MANAGEMENT — WHEN TO USE WHAT
// --------------------------------------------------------------

/**
 * Server data → TanStack Query
 * Local → useState
 * Shared → Context/Zustand
 * Complex transitions → useReducer/Redux Toolkit
 * Context is NOT a state manager — it re-renders ALL consumers.
 */



// --------------------------------------------------------------
// 16. SEMANTIC HTML & ACCESSIBILITY
// --------------------------------------------------------------

/**
 * Use elements for MEANING: <nav>, <main>, <button>, <header>
 * All interactive elements: keyboard focusable + :focus-visible
 * ARIA only when semantic HTML isn't enough
 * Every input needs <label>. Never color-only meaning.
 */



// --------------------------------------------------------------
// 17. CORS
// --------------------------------------------------------------

/**
 * Browser security. Same origin = protocol + host + port.
 * Preflight OPTIONS for non-simple requests.
 * Server sets Access-Control-Allow-Origin.
 * Dev: use proxy. Prod: whitelist origins.
 */

/*
 * ═══════════════════════════════════════════════════════════════
 * 📝 RAW INTERVIEW NOTES (kept as reference)
 * Topics: Messaging system design, Canvas vs DOM, Semantic HTML,
 * Flexbox vs Grid, call/apply/bind, Critical Rendering Path,
 * forwardRef/useImperativeHandle, Machine Coding tips, LLD design
 * ═══════════════════════════════════════════════════════════════
 */
 */ “Send Message” functionality similar to a chat application.

Topics Covered:
Tagging users in messages
UI component structure
Communication mechanisms between client and server
Data flow and state handling
Canvas Discussion
The interviewer also asked:

What is Canvas?
Why can Canvas sometimes perform better than traditional DOM rendering?
We discussed scenarios involving:

Large-scale rendering
Continuous repainting
Graphics-heavy interfaces
Round 3: JavaScript, React, HTML & CSS Fundamentals
Duration: ~60 minutes

This was one of the deepest frontend-focused rounds.

HTML & CSS Topics
Semantic HTML
Why are semantic elements important
Accessibility and SEO benefits
Why using only generic containers is not ideal
CSS Layout Systems
Discussion around:

Flexbox vs Grid
When to use each approach
I was also asked to implement a layout using CSS Grid syntax.

Responsive Design
Topics included:

Media queries
Relative sizing units
Building layouts adaptable across devices
JavaScript Topics
Function Context
Differences between:
call
apply
bind
Coding Task
Implement a polyfill for bind
Browser Rendering Internals
The discussion went deeper into browser behavior:

Critical Rendering Path
CSSOM construction
Event Loop execution model
React Topics
Advanced React APIs
forwardRef
useImperativeHandle


Round 1: Machine Coding (2 Hours)
As expected for a Frontend Engineer role, the interview started with a Machine Coding round.

I was provided with a problem statement and around 2 hours to complete it. Sometimes the interviewer may also provide a boilerplate zip setup.

Example Questions Asked
Design an Email Client like Outlook
Create a Chat Interface like Teams
Create a Notification System like Teams
This round primarily evaluates:

UI engineering skills
Component structuring
Semantic HTML
CSS architecture
JavaScript problem solving
Responsiveness
Code organization
Tradeoff discussions
Important Learnings From This Round
1. Never Jump Directly Into Coding
Spend the initial minutes understanding the problem thoroughly.

Interviewers intentionally include ambiguous requirements to evaluate:

Communication skills
Clarification ability
Product thinking
Always ask:

Pagination needed?
Mobile responsiveness?
Virtualization?
Accessibility expectations?
State persistence?
API integration assumptions?
2. Semantic HTML Matters A LOT
One major thing interviewers observe is whether you know proper HTML semantics.

Bad Example:

<div class="header"></div>
<div class="sidebar"></div>
<div class="footer"></div>
Good Example:

<header></header>
<aside></aside>
<main></main>
<footer></footer>
Semantic HTML improves:

Accessibility
SEO
Maintainability
Screen reader support
3. Know DOM Manipulation Tradeoffs
One interesting discussion happened around:

document.createElement()
vs

innerHTML
Press enter or click to view image in full size

For rapidly generating large UI during interviews, sometimes innerHTML can save time.

But for production systems:

Sanitization matters
XSS prevention matters
Maintainability matters
4. Flexbox & Grid Are Mandatory
Most frontend machine coding rounds become painful if:

Flexbox is weak
Grid understanding is poor
Typical expectations:

Responsive layouts
Sidebar management
Overflow handling
Sticky sections
Dynamic resizing
5. Use Modern JavaScript Features
This round is also your opportunity to demonstrate modern JS expertise.

Examples:

Optional chaining
Nullish coalescing
Async/await
Destructuring
Modules
Array helpers
Debouncing
Throttling
6. Incremental Development Wins
Never aim for perfection first.

Instead:

Build skeleton UI
Add functionality
Improve responsiveness
Add edge cases
Polish UI
A partially working solution is far better than an unfinished “perfect architecture”.

Round 3: LLD / Design Round
Initially, I was asked to design a:

Design Chess Board & Snake & Ladder Game

This round focused on:

Low-Level Design
OOP principles
Class modeling
Scalability
Expectations in This Round
1. Identify Top-Level Classes
Example:

class Board {}
class Player {}
class Dice {}
class Snake {}
class Ladder {}
class Game {}
2. Break Problems Into Smaller Responsibilities
Interviewers observe:

Separation of concerns
Single responsibility principle
Encapsulation
3. Data Structure Selection
Examples:

Arrays
Maps
Queues
Graph representations
4. Scalability Thinking
Can your design support:

Multiplayer?
Custom boards?
AI players?
Persistence?

Problem Statement
Millions of tweets are arriving every second.
Trigger an alert whenever a specific word appears a billion times within any moving 1-hour window.

This was an extremely interesting scalability question.

What Was Expected
1. Data Structure Design
Questions to think:

Queue?
HashMap?
Sliding window?
Bucketing?
2. Memory Optimization
How will you store:

Billions of events?
Timestamps?
Counts?
3. Scalability
How will your solution work:

Across distributed systems?
Across shards?
Across multiple servers?


// ==============================================================
// 🧠 CONTINUED — NEW THEORY QUESTIONS FROM INTERVIEW NOTES
// ==============================================================



// --------------------------------------------------------------
// 18. CANVAS vs DOM RENDERING — WHEN TO USE WHICH?
// --------------------------------------------------------------

/**
 * 🎯 INTERVIEW ANSWER STRUCTURE:
 *
 * DOM rendering uses the browser's layout engine (HTML elements).
 * Canvas is a pixel-based drawing API — no DOM nodes, no layout.
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 🧠 WHAT IS CANVAS?
 * ═══════════════════════════════════════════════════════════════
 *
 * <canvas> is an HTML element that provides a 2D (or WebGL 3D)
 * drawing surface. You draw pixels directly using JavaScript.
 *
 * const ctx = canvas.getContext('2d');
 * ctx.fillRect(10, 10, 100, 50); // Draws a rectangle
 *
 * KEY DIFFERENCE:
 * - DOM: retained mode — browser tracks every element
 * - Canvas: immediate mode — you draw, browser forgets
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * ⚡ WHEN CANVAS IS FASTER THAN DOM
 * ═══════════════════════════════════════════════════════════════
 *
 * 1. THOUSANDS OF ELEMENTS
 *    - DOM: 10,000 nodes = 10,000 layout calculations
 *    - Canvas: 10,000 shapes = just pixel operations (no layout)
 *    - Example: particle systems, data visualizations, maps
 *
 * 2. CONTINUOUS ANIMATION (60fps redraws)
 *    - DOM: reflow + repaint per frame = expensive
 *    - Canvas: clear + redraw = just pixel pushing
 *    - Example: games, physics simulations, real-time charts
 *
 * 3. COMPLEX CUSTOM GRAPHICS
 *    - Pixel manipulation, filters, blending
 *    - Things CSS/SVG can't express efficiently
 *    - Example: image editors, custom charts, heatmaps
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 🐌 WHEN DOM IS BETTER
 * ═══════════════════════════════════════════════════════════════
 *
 * 1. TEXT CONTENT — DOM handles text reflow, selection, a11y
 * 2. USER INTERACTION — DOM has built-in events, focus, tab order
 * 3. ACCESSIBILITY — screen readers can't read canvas
 * 4. SEO — search engines can't index canvas content
 * 5. SIMPLE UI — buttons, forms, lists = DOM is easier & faster to develop
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 📊 COMPARISON TABLE
 * ═══════════════════════════════════════════════════════════════
 *
 * | Aspect            | DOM                    | Canvas                |
 * |-------------------|------------------------|-----------------------|
 * | Rendering model   | Retained (tracked)     | Immediate (draw+forget)|
 * | Layout engine     | Yes (reflow/repaint)   | No                    |
 * | Event handling    | Built-in (click, hover)| Manual (hit detection)|
 * | Accessibility     | ✅ Native              | ❌ Must add manually  |
 * | SEO               | ✅ Indexable           | ❌ Not indexable      |
 * | 10K+ elements     | Slow                   | Fast                  |
 * | 60fps animation   | Hard                   | Natural               |
 * | Text rendering    | Excellent              | Basic                 |
 * | Memory per element| High (DOM node + CSSOM)| Low (just pixels)     |
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 🛠️ REAL-WORLD EXAMPLES
 * ═══════════════════════════════════════════════════════════════
 *
 * Canvas: Google Maps, Figma, games, D3 with canvas renderer,
 *         video processing, image editors
 *
 * DOM: Dashboards, forms, content sites, CRUD apps,
 *      anything requiring accessibility
 *
 * HYBRID: Figma uses Canvas for the design surface but DOM for
 *         panels, menus, and inputs. Best of both worlds.
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 📋 INTERVIEW SUMMARY
 * ═══════════════════════════════════════════════════════════════
 *
 * 🗣️ WHAT INTERVIEWERS WANT TO HEAR:
 * 1. "Canvas skips layout/reflow — faster for thousands of elements"
 * 2. "DOM is better for text, interactions, and accessibility"
 * 3. "Canvas is immediate-mode; DOM is retained-mode"
 * 4. "For real-time graphics/games — Canvas. For UI — DOM"
 * 5. "Modern apps often use hybrid (Canvas + DOM overlays)"
 */



// --------------------------------------------------------------
// 19. MACHINE CODING ROUND — STRATEGY & BEST PRACTICES
// --------------------------------------------------------------

/**
 * 🎯 INTERVIEW ANSWER STRUCTURE:
 *
 * Machine coding = build a functional UI feature in 1-2 hours.
 * Evaluated on: structure, semantics, CSS skills, JS logic,
 * responsiveness, incremental delivery, tradeoff discussions.
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 🏗️ STRATEGY (First 10 Minutes)
 * ═══════════════════════════════════════════════════════════════
 *
 * 1. READ the problem completely — don't start coding immediately
 * 2. ASK clarifying questions:
 *    - Mobile responsive?
 *    - Pagination / infinite scroll?
 *    - Accessibility expectations?
 *    - API integration or mock data?
 *    - State persistence needed?
 * 3. PLAN component structure on paper/comments:
 *    - Identify top-level components
 *    - Data flow (props, state, context)
 *    - Which parts are reusable
 * 4. PRIORITIZE: working > perfect
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 📝 EVALUATION CRITERIA (What interviewers look for)
 * ═══════════════════════════════════════════════════════════════
 *
 * 1. SEMANTIC HTML
 *    ❌ <div class="header"> <div class="nav">
 *    ✅ <header> <nav> <main> <aside> <footer> <button> <ul>/<li>
 *
 * 2. CSS ARCHITECTURE
 *    - Flexbox/Grid usage (not absolute positioning hacks)
 *    - Responsive without media query spaghetti
 *    - Consistent spacing, no magic numbers
 *
 * 3. JAVASCRIPT QUALITY
 *    - Clean separation of concerns
 *    - Event delegation where appropriate
 *    - Error handling
 *    - Modern features: optional chaining, destructuring, async/await
 *
 * 4. COMPONENT DESIGN (React)
 *    - Single responsibility
 *    - Props vs local state decisions
 *    - Controlled vs uncontrolled inputs
 *    - Proper key usage in lists
 *
 * 5. INCREMENTAL DELIVERY
 *    Build skeleton → core functionality → edge cases → polish
 *    A working 80% solution > a broken 100% attempt
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 🧰 COMMON MACHINE CODING PROBLEMS
 * ═══════════════════════════════════════════════════════════════
 *
 * - Email client (Outlook-like: inbox list + preview pane)
 * - Chat interface (message list + input + typing indicator)
 * - Kanban board (drag-and-drop columns)
 * - File explorer (tree view + breadcrumbs)
 * - Notification system (toast + priority + auto-dismiss)
 * - Calendar / scheduling UI
 * - Search with autocomplete + debounce
 * - Infinite scrolling feed
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * ⚠️ DOM MANIPULATION TRADEOFFS
 * ═══════════════════════════════════════════════════════════════
 *
 * document.createElement() vs innerHTML:
 *
 * | Aspect         | createElement       | innerHTML            |
 * |----------------|---------------------|----------------------|
 * | Speed (small)  | Fast                | Fast                 |
 * | Speed (bulk)   | Slower (many calls) | Faster (one parse)   |
 * | Security       | ✅ Safe by default  | ❌ XSS risk          |
 * | Event binding  | Direct attachment   | Need re-query        |
 * | Readability    | Verbose             | Template-like        |
 *
 * RULE: In interviews, createElement is safer to demonstrate.
 * In production: use framework (React/Vue) or sanitize with DOMPurify.
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 📋 INTERVIEW SUMMARY
 * ═══════════════════════════════════════════════════════════════
 *
 * 🗣️ KEY PRINCIPLES:
 * 1. "I spend first 5-10 min understanding requirements before coding"
 * 2. "Semantic HTML shows I understand web fundamentals"
 * 3. "I build incrementally — skeleton first, features next"
 * 4. "A working partial solution beats an incomplete perfect one"
 * 5. "I use Flexbox/Grid for layout — never float/position hacks"
 * 6. "I think about accessibility even in time-pressure situations"
 */



// --------------------------------------------------------------
// 20. LOW-LEVEL DESIGN (LLD) FOR FRONTEND
// --------------------------------------------------------------

/**
 * 🎯 INTERVIEW ANSWER STRUCTURE:
 *
 * LLD rounds test your ability to model a system using OOP
 * principles, proper class design, and scalable architecture.
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 🧠 APPROACH (Step-by-step)
 * ═══════════════════════════════════════════════════════════════
 *
 * 1. IDENTIFY ENTITIES (nouns in the problem)
 * 2. IDENTIFY BEHAVIORS (verbs / actions)
 * 3. DEFINE RELATIONSHIPS (has-a, is-a, uses)
 * 4. APPLY SOLID PRINCIPLES
 * 5. CONSIDER EXTENSIBILITY
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 📝 EXAMPLE: SNAKE & LADDER GAME
 * ═══════════════════════════════════════════════════════════════
 */

class Dice {
  roll() {
    return Math.floor(Math.random() * 6) + 1;
  }
}

class BoardEntity {
  constructor(start, end) {
    this.start = start;
    this.end = end;
  }
}

class Snake extends BoardEntity {
  // start > end (moves player DOWN)
  constructor(head, tail) { super(head, tail); }
}

class Ladder extends BoardEntity {
  // start < end (moves player UP)
  constructor(bottom, top) { super(bottom, top); }
}

class Player {
  constructor(name) {
    this.name = name;
    this.position = 0;
  }
  move(steps) { this.position += steps; }
}

class Board {
  constructor(size, snakes, ladders) {
    this.size = size;
    this.entities = new Map();
    [...snakes, ...ladders].forEach(e => this.entities.set(e.start, e.end));
  }

  getFinalPosition(position) {
    return this.entities.get(position) || position;
  }
}

class GameEngine {
  constructor(board, players, dice) {
    this.board = board;
    this.players = players;
    this.dice = dice;
    this.currentPlayerIndex = 0;
    this.winner = null;
  }

  playTurn() {
    if (this.winner) return;

    const player = this.players[this.currentPlayerIndex];
    const roll = this.dice.roll();
    let newPos = player.position + roll;

    if (newPos > this.board.size) return this.nextPlayer(); // Can't move beyond board

    newPos = this.board.getFinalPosition(newPos); // Check snake/ladder
    player.position = newPos;

    console.log(`${player.name} rolled ${roll} → position ${newPos}`);

    if (newPos === this.board.size) {
      this.winner = player;
      console.log(`🎉 ${player.name} wins!`);
      return;
    }

    this.nextPlayer();
  }

  nextPlayer() {
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
  }
}

/**
 * ═══════════════════════════════════════════════════════════════
 * 🔑 SOLID PRINCIPLES APPLIED
 * ═══════════════════════════════════════════════════════════════
 *
 * S — Single Responsibility:
 *     Dice only rolls. Board only tracks positions. Game orchestrates.
 *
 * O — Open/Closed:
 *     Add new entity types (PowerUp) without modifying Board.
 *
 * L — Liskov Substitution:
 *     Snake/Ladder extend BoardEntity — both work interchangeably.
 *
 * I — Interface Segregation:
 *     Player doesn't need to know about Board internals.
 *
 * D — Dependency Inversion:
 *     Game depends on abstractions (Dice interface), not concrete.
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 🧠 SCALABILITY QUESTIONS (What interviewers ask next)
 * ═══════════════════════════════════════════════════════════════
 *
 * Q: Support multiplayer online?
 * A: Extract GameState, add event system (PubSub), sync via WebSocket.
 *
 * Q: Custom boards?
 * A: Board accepts config object → factory pattern for board creation.
 *
 * Q: AI players?
 * A: Player becomes interface. HumanPlayer and AIPlayer implement it.
 *    Strategy pattern for different AI difficulty levels.
 *
 * Q: Undo/Redo?
 * A: Command pattern — store each move as an object with execute/undo.
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 📋 INTERVIEW SUMMARY
 * ═══════════════════════════════════════════════════════════════
 *
 * 🗣️ WHAT INTERVIEWERS WANT TO HEAR:
 * 1. "I identify entities first, then behaviors, then relationships"
 * 2. "Each class has a single responsibility"
 * 3. "I design for extension — new features shouldn't modify existing code"
 * 4. "I use composition over inheritance where possible"
 * 5. "Design patterns like Strategy, Command, Observer solve real problems"
 */



// --------------------------------------------------------------
// 21. SLIDING WINDOW / REAL-TIME AGGREGATION (System Design)
// --------------------------------------------------------------

/**
 * 🎯 PROBLEM: Millions of events/sec. Alert when a word hits
 *    1 billion occurrences in any 1-hour sliding window.
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 🧠 APPROACH: TIME-BUCKETED COUNTING
 * ═══════════════════════════════════════════════════════════════
 *
 * Instead of storing every event timestamp:
 * - Divide the hour into fixed-size buckets (e.g., 1-minute buckets = 60 buckets)
 * - Each bucket stores: { minute: count }
 * - On new event: increment current bucket
 * - To check total: sum all 60 buckets
 * - Expire old buckets as time moves forward (circular buffer)
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 🏗️ DATA STRUCTURE
 * ═══════════════════════════════════════════════════════════════
 */

class SlidingWindowCounter {
  constructor(windowSizeMs, bucketCount) {
    this.windowSize = windowSizeMs;             // e.g. 3600000 (1 hour)
    this.bucketCount = bucketCount;             // e.g. 60
    this.bucketSize = windowSizeMs / bucketCount; // e.g. 60000 (1 min)
    this.buckets = new Array(bucketCount).fill(0);
    this.lastBucketIndex = 0;
    this.lastTimestamp = Date.now();
    this.total = 0;
  }

  // Advance time — zero out expired buckets
  advanceTime(now) {
    const elapsed = now - this.lastTimestamp;
    const bucketsToExpire = Math.min(
      Math.floor(elapsed / this.bucketSize),
      this.bucketCount
    );

    for (let i = 0; i < bucketsToExpire; i++) {
      this.lastBucketIndex = (this.lastBucketIndex + 1) % this.bucketCount;
      this.total -= this.buckets[this.lastBucketIndex];
      this.buckets[this.lastBucketIndex] = 0;
    }

    this.lastTimestamp = now;
  }

  increment(now = Date.now()) {
    this.advanceTime(now);
    this.buckets[this.lastBucketIndex]++;
    this.total++;
  }

  getCount(now = Date.now()) {
    this.advanceTime(now);
    return this.total;
  }
}

/**
 * ═══════════════════════════════════════════════════════════════
 * 📈 SCALING TO MILLIONS OF EVENTS/SEC
 * ═══════════════════════════════════════════════════════════════
 *
 * 1. SHARDING: Partition by word (consistent hashing)
 *    Each shard handles a subset of words
 *
 * 2. LOCAL AGGREGATION: Each server counts locally per second,
 *    flushes to central aggregator periodically
 *
 * 3. APPROXIMATE COUNTING: Use probabilistic structures
 *    (Count-Min Sketch) to reduce memory per word
 *
 * 4. TIERED STORAGE:
 *    - Hot path: in-memory counters (Redis/local)
 *    - Warm: minute-level aggregates
 *    - Cold: hourly snapshots to disk
 *
 * 5. ALERTING: Compare total against threshold after each flush.
 *    Use hysteresis to avoid alert storms.
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 💾 MEMORY CALCULATION
 * ═══════════════════════════════════════════════════════════════
 *
 * Per word: 60 buckets × 8 bytes (int64) = 480 bytes
 * 1M unique words: ~480 MB (fits in single server)
 * 100M words: shard across ~100 servers
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 📋 INTERVIEW SUMMARY
 * ═══════════════════════════════════════════════════════════════
 *
 * 🗣️ WHAT INTERVIEWERS WANT TO HEAR:
 * 1. "Use time-bucketed circular buffer — not per-event storage"
 * 2. "Shard by word across servers using consistent hashing"
 * 3. "Local count + periodic flush to reduce network overhead"
 * 4. "60 buckets per word = O(1) space per word regardless of volume"
 * 5. "Count-Min Sketch for approximate counting at extreme scale"
 * 6. "Trade accuracy for memory — 1-minute granularity is acceptable"
 */



// --------------------------------------------------------------
// 21b. FRONTEND IMPLEMENTATION — REAL-TIME WORD COUNTER DASHBOARD
// --------------------------------------------------------------

/**
 * 🎯 FRONTEND ANGLE: How would you BUILD the UI that displays
 *    real-time word counts and triggers alerts?
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 🏗️ ARCHITECTURE
 * ═══════════════════════════════════════════════════════════════
 *
 * Backend (stream processor) → WebSocket → Frontend Dashboard
 *
 * The frontend does NOT count billions of tweets.
 * It RECEIVES aggregated data from the backend and visualizes it.
 *
 * DATA FLOW:
 * 1. Backend: Kafka/Flink processes tweet stream → computes counts
 * 2. Backend: Pushes updates via WebSocket every 1-5 seconds
 * 3. Frontend: Receives { word, count, windowStart, windowEnd }
 * 4. Frontend: Updates chart/table, fires alert when threshold hit
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 🛠️ WEBSOCKET CONNECTION (React)
 * ═══════════════════════════════════════════════════════════════
 */

// Custom hook for WebSocket with reconnection
function useWordCountStream(url) {
  // const [counts, setCounts] = useState(new Map());
  // const [alerts, setAlerts] = useState([]);
  // const wsRef = useRef(null);
  // const reconnectTimeout = useRef(null);
  //
  // useEffect(() => {
  //   function connect() {
  //     const ws = new WebSocket(url);
  //     wsRef.current = ws;
  //
  //     ws.onmessage = (event) => {
  //       const data = JSON.parse(event.data);
  //       // data = { word: "trending", count: 999500000, threshold: 1000000000 }
  //
  //       setCounts(prev => {
  //         const next = new Map(prev);
  //         next.set(data.word, data.count);
  //         return next;
  //       });
  //
  //       // Check threshold on frontend (backup — backend should alert too)
  //       if (data.count >= data.threshold) {
  //         setAlerts(prev => [...prev, { word: data.word, time: Date.now() }]);
  //       }
  //     };
  //
  //     ws.onclose = () => {
  //       // Auto-reconnect with exponential backoff
  //       reconnectTimeout.current = setTimeout(connect, 3000);
  //     };
  //   }
  //
  //   connect();
  //
  //   return () => {
  //     wsRef.current?.close();
  //     clearTimeout(reconnectTimeout.current);
  //   };
  // }, [url]);
  //
  // return { counts, alerts };
}


/**
 * ═══════════════════════════════════════════════════════════════
 * ⚡ PERFORMANCE CHALLENGES (Frontend-specific)
 * ═══════════════════════════════════════════════════════════════
 *
 * PROBLEM: WebSocket pushes data every second → 60 updates/min
 *          per word × 100 words = 6000 state updates/min
 *
 * SOLUTIONS:
 *
 * 1. BATCH UPDATES — Don't re-render on every message
 */

// Buffer messages and flush at 60fps
function useBatchedUpdates(ws) {
  // const buffer = useRef([]);
  // const [data, setData] = useState([]);
  //
  // useEffect(() => {
  //   ws.onmessage = (e) => buffer.current.push(JSON.parse(e.data));
  //
  //   let rafId;
  //   function flush() {
  //     if (buffer.current.length > 0) {
  //       setData(prev => [...prev, ...buffer.current]);
  //       buffer.current = [];
  //     }
  //     rafId = requestAnimationFrame(flush);
  //   }
  //   rafId = requestAnimationFrame(flush);
  //
  //   return () => cancelAnimationFrame(rafId);
  // }, [ws]);
  //
  // return data;
}

/**
 * 2. VIRTUALIZATION — If displaying 1000+ tracked words
 *    Use react-window / @tanstack/virtual for the word list
 *
 * 3. CANVAS FOR CHARTS — Real-time line chart with 60fps updates
 *    DOM-based charts (recharts) choke at high update frequency
 *    Use Canvas-based charts (Chart.js, uPlot) instead
 *
 * 4. WEB WORKER — Parse and aggregate WebSocket data off main thread
 */

// worker.js — offload JSON parsing and aggregation
// self.onmessage = (e) => {
//   const parsed = JSON.parse(e.data);
//   // Aggregate, filter, sort — heavy computation here
//   self.postMessage(parsed);
// };

/**
 * 5. THROTTLE RE-RENDERS — useDeferredValue for non-critical UI
 *
 * 6. SHARED ARRAY BUFFER — For extreme perf, share memory between
 *    Web Worker and main thread (avoids serialization cost)
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 🔔 ALERT SYSTEM (Frontend)
 * ═══════════════════════════════════════════════════════════════
 *
 * When count crosses threshold:
 * 1. Visual: Toast notification (auto-dismiss after 10s)
 * 2. Audio: Play alert sound (new Audio('/alert.mp3').play())
 * 3. Browser: Notification API (requires permission)
 *    Notification.requestPermission().then(() => {
 *      new Notification("Alert!", { body: `${word} hit 1B in 1hr` });
 *    });
 * 4. Persist: Store alert history in IndexedDB for audit
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 📊 UI COMPONENTS
 * ═══════════════════════════════════════════════════════════════
 *
 * Dashboard Layout:
 * ┌─────────────────────────────────────────────────┐
 * │ [Header: Live Word Tracker]        [Alert Bell] │
 * ├──────────────────────┬──────────────────────────┤
 * │ Word List (virtual)  │ Real-time Chart (Canvas)  │
 * │ - trending: 950M     │ ~~~~/~~~~~/~~~~~          │
 * │ - breaking: 800M     │         ↗️ threshold line │
 * │ - viral: 600M        │                          │
 * ├──────────────────────┴──────────────────────────┤
 * │ Alert History (last 24h)                        │
 * └─────────────────────────────────────────────────┘
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 📋 FRONTEND INTERVIEW SUMMARY
 * ═══════════════════════════════════════════════════════════════
 *
 * 🗣️ WHAT INTERVIEWERS WANT TO HEAR:
 * 1. "Frontend receives aggregated data via WebSocket — it doesn't process raw tweets"
 * 2. "Batch WebSocket messages using rAF to avoid render thrashing"
 * 3. "Canvas-based charts for real-time data — DOM charts can't handle 60fps"
 * 4. "Web Worker for JSON parsing to keep main thread free"
 * 5. "Virtualize the word list if tracking 1000+ words"
 * 6. "Notification API + toast + sound for alerting"
 * 7. "Reconnection logic with exponential backoff for WebSocket"
 */



// ══════════════════════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════════════════════
//
//                    📘 JAVASCRIPT — ES6+ FEATURES
//
// ══════════════════════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════════════════════


// --------------------------------------------------------------
// 22. ES6+ FEATURES (COMPLETE DEEP DIVE)
// --------------------------------------------------------------

/**
 * ═══════════════════════════════════════════════════════════════
 * 🎯 INTERVIEW ANSWER STRUCTURE:
 * ═══════════════════════════════════════════════════════════════
 *
 * ES6 (ECMAScript 2015) was a MASSIVE update to JavaScript.
 * It introduced block scoping, classes, modules, promises,
 * arrow functions, template literals, destructuring, spread/rest,
 * iterators, generators, symbols, Maps/Sets, and more.
 *
 * Subsequent versions (ES7–ES2024) added async/await, optional
 * chaining, nullish coalescing, top-level await, etc.
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 📝 1. LET, CONST, AND VAR — COMPLETE COMPARISON
 * ═══════════════════════════════════════════════════════════════
 *
 * | Feature          | var             | let           | const         |
 * |------------------|-----------------|---------------|---------------|
 * | Scope            | Function        | Block         | Block         |
 * | Hoisted?         | Yes (undefined) | Yes (TDZ)     | Yes (TDZ)     |
 * | Re-declare?      | ✅ Yes          | ❌ No         | ❌ No         |
 * | Re-assign?       | ✅ Yes          | ✅ Yes        | ❌ No         |
 * | Global property? | ✅ window.x     | ❌ No         | ❌ No         |
 *
 * TDZ = Temporal Dead Zone — the variable exists but accessing
 * it before its declaration line throws ReferenceError.
 */

// TDZ Example:
// console.log(x); // ❌ ReferenceError
// let x = 5;

// const does NOT mean immutable — it means the BINDING is constant:
const arr = [1, 2, 3];
arr.push(4);         // ✅ Works — mutating the array
// arr = [5, 6, 7]; // ❌ TypeError — can't reassign binding

const obj = { name: "Kiro" };
obj.name = "Updated"; // ✅ Works — mutating property
// obj = {};         // ❌ TypeError

// 💡 INTERVIEW TIP: "const prevents reassignment, not mutation.
//    For true immutability, use Object.freeze() — but it's shallow."

Object.freeze(obj);
obj.name = "Try";    // Silently fails (strict mode: TypeError)


/**
 * ═══════════════════════════════════════════════════════════════
 * 📝 2. ARROW FUNCTIONS vs REGULAR FUNCTIONS
 * ═══════════════════════════════════════════════════════════════
 *
 * | Feature              | Regular Function     | Arrow Function      |
 * |----------------------|----------------------|---------------------|
 * | `this` binding       | Dynamic (call-site)  | Lexical (parent)    |
 * | `arguments` object   | ✅ Yes               | ❌ No               |
 * | Can be constructor   | ✅ new Fn()          | ❌ TypeError         |
 * | `prototype` property | ✅ Yes               | ❌ No               |
 * | Implicit return      | ❌ No                | ✅ (single expr)    |
 * | `super` binding      | Own                  | Lexical             |
 */

// Lexical `this` — Arrow inherits from enclosing scope:
const team = {
  name: "Frontend",
  members: ["Alice", "Bob"],
  printMembers() {
    // Arrow inherits `this` from printMembers()
    this.members.forEach((member) => {
      console.log(`${member} belongs to ${this.name}`);
    });
  },
};
team.printMembers();
// "Alice belongs to Frontend"
// "Bob belongs to Frontend"

// ❌ WHY ARROW FUNCTIONS FAIL AS METHODS:
const broken = {
  name: "Broken",
  greet: () => {
    console.log(this.name); // `this` = window/undefined, NOT `broken`
  },
};

// ❌ WHY ARROWS CAN'T BE CONSTRUCTORS:
// const Person = (name) => { this.name = name; };
// new Person("X"); // ❌ TypeError: Person is not a constructor

// ✅ WHEN TO USE WHICH:
// Arrow → callbacks, array methods, short functions, preserving this
// Regular → object methods, constructors, need `arguments` or `this`


/**
 * ═══════════════════════════════════════════════════════════════
 * 📝 3. TEMPLATE LITERALS
 * ═══════════════════════════════════════════════════════════════
 */

// Basic interpolation
const userName = "Sumeeth";
const greeting = `Hello, ${userName}! Today is ${new Date().toLocaleDateString()}`;

// Multi-line strings (no \n needed)
const html = `
  <div class="card">
    <h2>${userName}</h2>
    <p>Welcome back!</p>
  </div>
`;

// TAGGED TEMPLATES — advanced (used in styled-components, GraphQL, etc.)
function highlight(strings, ...values) {
  return strings.reduce((result, str, i) => {
    return result + str + (values[i] ? `<mark>${values[i]}</mark>` : "");
  }, "");
}
const name1 = "React";
const version = 18;
const tagged = highlight`Using ${name1} version ${version}`;
// "Using <mark>React</mark> version <mark>18</mark>"

// 💡 INTERVIEW TIP: "Tagged templates power libraries like styled-components
//    and lit-html. The tag function receives parsed strings + interpolated values."


/**
 * ═══════════════════════════════════════════════════════════════
 * 📝 4. DESTRUCTURING (OBJECTS & ARRAYS)
 * ═══════════════════════════════════════════════════════════════
 */

// OBJECT DESTRUCTURING:
const user = { id: 1, name: "Alice", age: 30, role: "dev" };
const { name: userName2, age, role = "viewer" } = user; // rename + default

// NESTED destructuring:
const response = {
  data: {
    user: { profile: { avatar: "url.png" } },
  },
};
const {
  data: {
    user: {
      profile: { avatar },
    },
  },
} = response;
console.log(avatar); // "url.png"

// ARRAY DESTRUCTURING:
const [first, second, ...rest] = [10, 20, 30, 40, 50];
// first=10, second=20, rest=[30,40,50]

// SKIP elements:
const [, , third] = [1, 2, 3]; // third = 3

// SWAP variables without temp:
let a2 = 1, b2 = 2;
[a2, b2] = [b2, a2]; // a2=2, b2=1

// FUNCTION PARAMETER destructuring:
function createUser({ name, age, role = "user" } = {}) {
  return { name, age, role };
}
createUser({ name: "Bob", age: 25 }); // { name: "Bob", age: 25, role: "user" }

// 💡 INTERVIEW TIP: "Destructuring with defaults prevents undefined errors.
//    The `= {}` default on the param prevents crash when called with no args."


/**
 * ═══════════════════════════════════════════════════════════════
 * 📝 5. SPREAD & REST OPERATORS (...)
 * ═══════════════════════════════════════════════════════════════
 *
 * Same syntax (...) but different context:
 * - SPREAD: Expands an iterable into individual elements
 * - REST: Collects remaining elements into an array/object
 */

// SPREAD — Arrays:
const arr1 = [1, 2, 3];
const arr2 = [0, ...arr1, 4]; // [0, 1, 2, 3, 4]
const clone = [...arr1];       // Shallow copy

// SPREAD — Objects (ES2018):
const defaults = { theme: "dark", lang: "en", fontSize: 14 };
const userPrefs = { theme: "light", fontSize: 16 };
const merged = { ...defaults, ...userPrefs };
// { theme: "light", lang: "en", fontSize: 16 }
// Later spread wins (overrides)

// REST — Function params:
function sum(...numbers) {
  return numbers.reduce((acc, n) => acc + n, 0);
}
sum(1, 2, 3, 4); // 10

// REST — Destructuring (remove properties):
const { role: _removed, ...withoutRole } = user;
// withoutRole = { id: 1, name: "Alice", age: 30 }

// ⚠️ SHALLOW COPY WARNING:
const nested = { a: { b: 1 } };
const copy = { ...nested };
copy.a.b = 99;
console.log(nested.a.b); // 99 — same reference!
// Use structuredClone(nested) for DEEP copy (ES2022)


/**
 * ═══════════════════════════════════════════════════════════════
 * 📝 6. PROMISES & ASYNC/AWAIT
 * ═══════════════════════════════════════════════════════════════
 *
 * Promise = object representing eventual completion/failure of async op.
 * States: pending → fulfilled | rejected (settled = fulfilled or rejected)
 *
 * Promise chain = .then().then().catch()
 * async/await = syntactic sugar over promises (synchronous-looking async code)
 */

// Creating a Promise:
function fetchData(url) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (url) resolve({ data: "result" });
      else reject(new Error("No URL provided"));
    }, 1000);
  });
}

// Consuming with .then/.catch:
fetchData("/api/users")
  .then((res) => console.log(res))
  .catch((err) => console.error(err))
  .finally(() => console.log("Done")); // Always runs

// Consuming with async/await:
async function loadData() {
  try {
    const res = await fetchData("/api/users");
    console.log(res);
  } catch (err) {
    console.error(err);
  } finally {
    console.log("Done");
  }
}

/**
 * PROMISE COMBINATORS — KEY INTERVIEW TOPIC:
 *
 * | Method            | Resolves when...              | Rejects when...            |
 * |-------------------|-------------------------------|----------------------------|
 * | Promise.all()     | ALL resolve                   | ANY rejects (fail-fast)    |
 * | Promise.allSettled | ALL settle (resolve or reject)| NEVER rejects             |
 * | Promise.race()    | FIRST settles (resolve/reject)| FIRST settles             |
 * | Promise.any()     | FIRST resolves                | ALL reject (AggregateError)|
 */

// Promise.all — parallel requests:
async function loadDashboard() {
  const [users, posts, comments] = await Promise.all([
    fetch("/api/users").then((r) => r.json()),
    fetch("/api/posts").then((r) => r.json()),
    fetch("/api/comments").then((r) => r.json()),
  ]);
  // All 3 fetched in parallel — faster than sequential
}

// Promise.allSettled — don't fail if one rejects:
async function loadWithFallbacks() {
  const results = await Promise.allSettled([
    fetch("/api/critical"),
    fetch("/api/optional"),
  ]);
  results.forEach((result) => {
    if (result.status === "fulfilled") console.log(result.value);
    else console.warn("Failed:", result.reason);
  });
}

// ⚠️ COMMON MISTAKE — forEach is NOT async-aware:
// ❌ This fires ALL requests simultaneously, not sequentially:
// urls.forEach(async (url) => { await fetch(url); });

// ✅ Sequential async:
async function sequential(urls) {
  for (const url of urls) {
    await fetch(url); // Waits for each one
  }
}

// ✅ Parallel async:
async function parallel(urls) {
  await Promise.all(urls.map((url) => fetch(url)));
}


/**
 * ═══════════════════════════════════════════════════════════════
 * 📝 7. OPTIONAL CHAINING (?.) & NULLISH COALESCING (??)
 * ═══════════════════════════════════════════════════════════════
 */

// OPTIONAL CHAINING — safely access nested properties:
const userProfile = null;
const city = userProfile?.address?.city; // undefined (no error)

// Works with methods:
const length = userProfile?.getName?.(); // undefined if getName doesn't exist

// Works with arrays:
const firstItem = userProfile?.orders?.[0]; // undefined

// NULLISH COALESCING — default ONLY for null/undefined:
const value1 = null ?? "default";     // "default"
const value2 = undefined ?? "default"; // "default"
const value3 = 0 ?? "default";        // 0 (NOT "default"!)
const value4 = "" ?? "default";       // "" (NOT "default"!)
const value5 = false ?? "default";    // false

// vs OR (||) — which treats 0, "", false as falsy:
const value6 = 0 || "default";  // "default" — WRONG if 0 is valid!
const value7 = 0 ?? "default";  // 0 — CORRECT

// 💡 INTERVIEW TIP: "Use ?? when 0, empty string, or false are valid values.
//    Use || only when ALL falsy values should trigger the default."

// LOGICAL ASSIGNMENT (ES2021):
let x1 = null;
x1 ??= "default"; // x1 = "default" (only assigns if null/undefined)

let x2 = 0;
x2 ||= 5; // x2 = 5 (assigns because 0 is falsy)

let x3 = 1;
x3 &&= 2; // x3 = 2 (assigns because x3 is truthy)


/**
 * ═══════════════════════════════════════════════════════════════
 * 📝 8. MAP, SET, WEAKMAP, WEAKSET
 * ═══════════════════════════════════════════════════════════════
 *
 * | Collection | Keys          | Ordered | Iterable | GC-able keys |
 * |------------|---------------|---------|----------|--------------|
 * | Object     | String/Symbol | No*     | No*      | ❌           |
 * | Map        | ANY type      | Yes     | Yes      | ❌           |
 * | WeakMap    | Objects only  | No      | No       | ✅ Yes       |
 * | Set        | (values)      | Yes     | Yes      | ❌           |
 * | WeakSet    | Objects only  | No      | No       | ✅ Yes       |
 */

// MAP — keys can be objects, functions, anything:
const cache = new Map();
const objKey = { id: 1 };
cache.set(objKey, "cached value");
cache.get(objKey); // "cached value"
cache.has(objKey); // true
cache.size;        // 1
cache.delete(objKey);

// WHY Map over Object?
// 1. Any key type (not just strings)
// 2. Preserves insertion order
// 3. .size property (no Object.keys().length)
// 4. Better performance for frequent additions/deletions
// 5. No prototype pollution risk

// WEAKMAP — keys are weakly held (garbage collected when no other reference):
const metadata = new WeakMap();
function process(element) {
  metadata.set(element, { clicks: 0 });
}
// When element is removed from DOM & dereferenced, metadata entry is GC'd

// 💡 USE CASES: Private data, DOM metadata, memoization caches that shouldn't
//    prevent garbage collection.

// SET — unique values only:
const uniqueIds = new Set([1, 2, 3, 2, 1]);
console.log(uniqueIds.size); // 3
console.log([...uniqueIds]); // [1, 2, 3]

// Deduplicate array (classic interview one-liner):
const deduped = [...new Set([1, 2, 2, 3, 3, 3])]; // [1, 2, 3]


/**
 * ═══════════════════════════════════════════════════════════════
 * 📝 9. ES6 CLASSES & PRIVATE FIELDS
 * ═══════════════════════════════════════════════════════════════
 */

class Animal {
  // Private field (ES2022) — truly private, not accessible outside
  #sound;

  // Static property
  static kingdom = "Animalia";

  constructor(name, sound) {
    this.name = name;
    this.#sound = sound;
  }

  // Public method
  speak() {
    return `${this.name} says ${this.#sound}`;
  }

  // Static method
  static create(name, sound) {
    return new Animal(name, sound);
  }

  // Getter/Setter
  get info() {
    return `${this.name} (${Animal.kingdom})`;
  }
}

class Dog extends Animal {
  #tricks = [];

  constructor(name) {
    super(name, "Woof"); // Must call super before using `this`
  }

  learn(trick) {
    this.#tricks.push(trick);
  }

  showTricks() {
    return `${this.name} knows: ${this.#tricks.join(", ")}`;
  }
}

const dog = new Dog("Rex");
dog.learn("sit");
dog.speak();     // "Rex says Woof"
// dog.#sound;   // ❌ SyntaxError — truly private

// 💡 INTERVIEW TIP: "# prefix creates hard private fields enforced by the engine,
//    unlike the _ convention or closures. They're not accessible even via reflection."


/**
 * ═══════════════════════════════════════════════════════════════
 * 📝 10. MODULES (import/export)
 * ═══════════════════════════════════════════════════════════════
 *
 * | Feature        | CommonJS (require)          | ES Modules (import)       |
 * |----------------|-----------------------------|-----------------------------|
 * | Loading        | Synchronous                 | Asynchronous               |
 * | Binding        | Copy of value               | Live binding (reference)   |
 * | Tree-shaking   | ❌ Hard                     | ✅ Static analysis          |
 * | Top-level await| ❌ No                       | ✅ Yes (ES2022)            |
 * | Where          | Node.js                     | Browsers + Node.js         |
 *
 * Named exports → multiple per file, must use exact name or alias
 * Default export → one per file, can import with any name
 */

// Named exports:
// export const PI = 3.14;
// export function add(a, b) { return a + b; }

// Default export:
// export default class Calculator { ... }

// Import:
// import Calculator, { PI, add } from './math.js';
// import { add as sum } from './math.js'; // rename

// Dynamic import (code splitting):
// const module = await import('./heavy-module.js');

// 💡 INTERVIEW TIP: "ES Modules are statically analyzable — bundlers like
//    webpack/rollup can tree-shake unused exports. CommonJS can't because
//    require() can be conditional."


/**
 * ═══════════════════════════════════════════════════════════════
 * 📝 11. ITERATORS, GENERATORS & SYMBOLS
 * ═══════════════════════════════════════════════════════════════
 */

// SYMBOL — unique, immutable primitive:
const id1 = Symbol("id");
const id2 = Symbol("id");
console.log(id1 === id2); // false — always unique

// Used for: non-enumerable object keys, well-known protocols
const myObj = { [Symbol.iterator]: function* () { yield 1; yield 2; } };

// ITERATORS — the protocol:
// Any object with [Symbol.iterator]() that returns { next() → { value, done } }

// GENERATORS — functions that can pause and resume:
function* fibonacci() {
  let a = 0, b = 1;
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}
const fib = fibonacci();
fib.next(); // { value: 0, done: false }
fib.next(); // { value: 1, done: false }
fib.next(); // { value: 1, done: false }
fib.next(); // { value: 2, done: false }

// Practical use: Paginated data fetching
function* paginate(fetchPage) {
  let page = 1;
  while (true) {
    const data = yield fetchPage(page);
    if (!data || data.length === 0) return;
    page++;
  }
}

// ASYNC GENERATORS (ES2018):
async function* streamData(url) {
  let page = 1;
  while (true) {
    const res = await fetch(`${url}?page=${page}`);
    const data = await res.json();
    if (data.length === 0) return;
    yield data;
    page++;
  }
}

// for-await-of:
// for await (const chunk of streamData('/api/items')) {
//   processChunk(chunk);
// }


/**
 * ═══════════════════════════════════════════════════════════════
 * 📝 12. PROXY & REFLECT (METAPROGRAMMING)
 * ═══════════════════════════════════════════════════════════════
 */

// Proxy intercepts fundamental operations on objects:
const handler = {
  get(target, prop) {
    console.log(`Accessing ${prop}`);
    return prop in target ? target[prop] : `Property ${prop} doesn't exist`;
  },
  set(target, prop, value) {
    if (prop === "age" && typeof value !== "number") {
      throw new TypeError("Age must be a number");
    }
    target[prop] = value;
    return true;
  },
};
const proxy = new Proxy({}, handler);
proxy.age = 25;    // ✅
// proxy.age = "25"; // ❌ TypeError

// USE CASES:
// 1. Validation (as above)
// 2. Reactive systems (Vue 3 uses Proxy for reactivity)
// 3. Logging/debugging property access
// 4. Default values for missing properties
// 5. API request builders (auto-construct URLs from property access)

// 💡 INTERVIEW TIP: "Vue 3 switched from Object.defineProperty (Vue 2)
//    to Proxy because Proxy can detect property addition/deletion and
//    array mutations without special handling."


/**
 * ═══════════════════════════════════════════════════════════════
 * 📝 13. MODERN ES2020–ES2024 FEATURES
 * ═══════════════════════════════════════════════════════════════
 *
 * ES2020: Optional chaining, nullish coalescing, BigInt, globalThis
 * ES2021: Logical assignment, String.replaceAll, Promise.any
 * ES2022: Top-level await, .at(), Object.hasOwn, #private, cause in Error
 * ES2023: Array findLast/findLastIndex, toSorted/toReversed/toSpliced (immutable)
 * ES2024: Object.groupBy, Map.groupBy, Promise.withResolvers
 */

// .at() — negative indexing (ES2022):
const arr3 = [1, 2, 3, 4, 5];
arr3.at(-1);  // 5 (last element)
arr3.at(-2);  // 4

// Immutable array methods (ES2023):
const original = [3, 1, 2];
const sorted = original.toSorted();     // [1, 2, 3] — original unchanged!
const reversed = original.toReversed(); // [2, 1, 3] — original unchanged!
const spliced = original.toSpliced(1, 1, 99); // [3, 99, 2] — original unchanged!

// Object.groupBy (ES2024):
const people = [
  { name: "Alice", age: 25 },
  { name: "Bob", age: 30 },
  { name: "Charlie", age: 25 },
];
const grouped = Object.groupBy(people, (p) => p.age);
// { 25: [Alice, Charlie], 30: [Bob] }

// Promise.withResolvers (ES2024):
const { promise, resolve, reject } = Promise.withResolvers();
// Cleaner than: new Promise((res, rej) => { resolve = res; reject = rej; })

// structuredClone (ES2022) — deep copy:
const deepObj = { a: { b: { c: 1 } }, date: new Date() };
const deepCopy = structuredClone(deepObj);
deepCopy.a.b.c = 99;
console.log(deepObj.a.b.c); // 1 — unaffected!


/**
 * ═══════════════════════════════════════════════════════════════
 * 📋 ES6+ INTERVIEW SUMMARY
 * ═══════════════════════════════════════════════════════════════
 *
 * 🗣️ WHAT INTERVIEWERS WANT TO HEAR:
 * 1. "let/const are block-scoped with TDZ, var is function-scoped"
 * 2. "Arrow functions lexically bind `this` — no own this, arguments, or prototype"
 * 3. "Destructuring with defaults prevents undefined crashes"
 * 4. "Spread creates SHALLOW copies — use structuredClone for deep"
 * 5. "Promise.all for parallel, for-of for sequential async"
 * 6. "?? only checks null/undefined, || checks all falsy"
 * 7. "Map over Object when keys aren't strings or you need size/order"
 * 8. "WeakMap allows garbage collection of keys — use for metadata/caches"
 * 9. "# private fields are engine-enforced, not convention"
 * 10. "ES Modules enable tree-shaking via static analysis"
 * 11. "Proxy powers Vue 3 reactivity and enables metaprogramming"
 * 12. "toSorted/toReversed are immutable alternatives to sort/reverse"
 */



// ══════════════════════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════════════════════
//
//                    📘 JAVASCRIPT — CLOSURES (DEEP DIVE)
//
// ══════════════════════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════════════════════


// --------------------------------------------------------------
// 23. CLOSURES — COMPREHENSIVE INTERVIEW GUIDE
// --------------------------------------------------------------

/**
 * ═══════════════════════════════════════════════════════════════
 * 🎯 DEFINITION (Multiple ways to explain in interview):
 * ═══════════════════════════════════════════════════════════════
 *
 * SIMPLE: A closure is a function that remembers variables from
 * the place where it was created, even after that place is gone.
 *
 * TECHNICAL: A closure is the combination of a function and the
 * lexical environment within which that function was declared.
 * The inner function maintains a reference to its outer scope's
 * variables even after the outer function has returned.
 *
 * MDN: A closure gives you access to an outer function's scope
 * from an inner function.
 *
 * 🧠 WHY THEY EXIST:
 * JavaScript uses lexical (static) scoping. Functions are
 * executed using the scope chain that was in effect when they
 * were DEFINED, not when they are CALLED.
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 📝 HOW CLOSURES WORK UNDER THE HOOD
 * ═══════════════════════════════════════════════════════════════
 *
 * When a function is created, it gets an internal [[Environment]]
 * property pointing to its outer Lexical Environment.
 *
 * Execution Context Stack:
 * ┌─────────────────────────┐
 * │ inner() Execution Ctx   │ → LexicalEnv → outer's variables
 * ├─────────────────────────┤
 * │ outer() Execution Ctx   │ → LexicalEnv → { count: 0 }
 * ├─────────────────────────┤
 * │ Global Execution Ctx    │
 * └─────────────────────────┘
 *
 * When outer() returns, its execution context is popped.
 * BUT the LexicalEnvironment object survives because inner()
 * still references it via [[Environment]].
 */

// FUNDAMENTAL EXAMPLE:
function outer() {
  let count = 0; // This variable is "closed over"

  function inner() {
    count++;
    return count;
  }

  return inner; // inner retains access to `count`
}

const increment = outer(); // outer() is DONE, stack frame gone
console.log(increment()); // 1 — count still alive!
console.log(increment()); // 2 — same count variable
console.log(increment()); // 3

// Each call to outer() creates a NEW closure with its own `count`:
const increment2 = outer();
console.log(increment2()); // 1 — separate count


/**
 * ═══════════════════════════════════════════════════════════════
 * 🧩 CLOSURE INTERVIEW QUESTIONS (TRICKY ONES)
 * ═══════════════════════════════════════════════════════════════
 */

// ❓ QUESTION 1: What's the output?
function createFunctions() {
  var functions = [];
  for (var i = 0; i < 5; i++) {
    functions.push(function () {
      return i;
    });
  }
  return functions;
}
const funcs = createFunctions();
console.log(funcs[0]()); // 5
console.log(funcs[1]()); // 5
console.log(funcs[4]()); // 5
// ALL return 5! All closures share the SAME `i` (var = function scoped)

// ✅ FIX 1: Use `let`
function createFunctionsFixed1() {
  var functions = [];
  for (let i = 0; i < 5; i++) {
    // `let` creates new binding per iteration
    functions.push(function () {
      return i;
    });
  }
  return functions;
}

// ✅ FIX 2: IIFE (Immediately Invoked Function Expression)
function createFunctionsFixed2() {
  var functions = [];
  for (var i = 0; i < 5; i++) {
    functions.push(
      (function (j) {
        return function () {
          return j;
        };
      })(i)
    );
  }
  return functions;
}

// ✅ FIX 3: bind
function createFunctionsFixed3() {
  var functions = [];
  for (var i = 0; i < 5; i++) {
    functions.push(
      function (j) {
        return j;
      }.bind(null, i)
    );
  }
  return functions;
}


// ❓ QUESTION 2: What's the output?
function makeAdder(x) {
  return function (y) {
    return x + y;
  };
}
const add5 = makeAdder(5);
const add10 = makeAdder(10);
console.log(add5(3));  // 8 (x=5 is closed over)
console.log(add10(3)); // 13 (x=10 is closed over)
// Each call to makeAdder creates a SEPARATE closure


// ❓ QUESTION 3: setTimeout in loop
for (var i = 0; i < 3; i++) {
  setTimeout(function () {
    console.log(i);
  }, i * 1000);
}
// Output: 3, 3, 3 (after 0s, 1s, 2s)
// By the time callbacks fire, loop is done, i = 3


/**
 * ═══════════════════════════════════════════════════════════════
 * 🏗️ REAL-WORLD CLOSURE PATTERNS
 * ═══════════════════════════════════════════════════════════════
 */

// PATTERN 1: MODULE PATTERN (Data Privacy before ES6 modules)
const BankAccount = (function () {
  let balance = 0; // Private — only accessible through returned methods

  return {
    deposit(amount) {
      if (amount <= 0) throw new Error("Invalid amount");
      balance += amount;
      return balance;
    },
    withdraw(amount) {
      if (amount > balance) throw new Error("Insufficient funds");
      balance -= amount;
      return balance;
    },
    getBalance() {
      return balance;
    },
  };
})();
// BankAccount.balance → undefined (private!)
// BankAccount.getBalance() → 0


// PATTERN 2: FUNCTION FACTORY
function createValidator(rules) {
  return function validate(data) {
    const errors = [];
    for (const [field, rule] of Object.entries(rules)) {
      if (rule.required && !data[field]) {
        errors.push(`${field} is required`);
      }
      if (rule.minLength && data[field]?.length < rule.minLength) {
        errors.push(`${field} must be at least ${rule.minLength} chars`);
      }
    }
    return errors.length ? { valid: false, errors } : { valid: true };
  };
}

const validateUser = createValidator({
  name: { required: true, minLength: 2 },
  email: { required: true },
});
validateUser({ name: "A", email: "" });
// { valid: false, errors: ["name must be at least 2 chars", "email is required"] }


// PATTERN 3: MEMOIZATION (caching with closures)
function memoize(fn) {
  const cache = new Map(); // Closed over — persists across calls

  return function (...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      console.log("Cache hit!");
      return cache.get(key);
    }
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

const expensiveCalc = memoize((n) => {
  console.log("Computing...");
  return n * n;
});
expensiveCalc(5); // "Computing..." → 25
expensiveCalc(5); // "Cache hit!" → 25


// PATTERN 4: DEBOUNCE (classic interview question using closures)
function debounce(fn, delay) {
  let timeoutId; // Closed over — persists between calls

  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

// PATTERN 5: ONCE (execute function only once)
function once(fn) {
  let called = false;
  let result;

  return function (...args) {
    if (!called) {
      called = true;
      result = fn.apply(this, args);
    }
    return result;
  };
}

const initialize = once(() => {
  console.log("Initialized!");
  return { ready: true };
});
initialize(); // "Initialized!" → { ready: true }
initialize(); // (nothing) → { ready: true }


// PATTERN 6: CURRYING (closures enable partial application)
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    return function (...nextArgs) {
      return curried.apply(this, [...args, ...nextArgs]);
    };
  };
}

const curriedAdd = curry((a, b, c) => a + b + c);
curriedAdd(1)(2)(3);     // 6
curriedAdd(1, 2)(3);     // 6
curriedAdd(1)(2, 3);     // 6


/**
 * ═══════════════════════════════════════════════════════════════
 * ⚠️ CLOSURE PITFALLS & MEMORY LEAKS
 * ═══════════════════════════════════════════════════════════════
 *
 * PROBLEM: Closures keep references alive → potential memory leaks
 *
 * 1. Event listeners that reference large objects:
 *    element.addEventListener('click', () => {
 *      console.log(hugeArray); // hugeArray can't be GC'd!
 *    });
 *    FIX: Remove listener when not needed, or use WeakRef
 *
 * 2. setInterval closures:
 *    const id = setInterval(() => {
 *      console.log(largeData); // largeData trapped forever
 *    }, 1000);
 *    FIX: clearInterval(id) when done
 *
 * 3. Closures in React:
 *    useEffect(() => {
 *      const handler = () => setState(staleValue); // stale closure!
 *      window.addEventListener('resize', handler);
 *      return () => window.removeEventListener('resize', handler);
 *    }, []); // Empty deps = staleValue never updates
 *    FIX: Add dependencies or use refs
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 📋 CLOSURES INTERVIEW SUMMARY
 * ═══════════════════════════════════════════════════════════════
 *
 * 🗣️ WHAT INTERVIEWERS WANT TO HEAR:
 * 1. "A closure is a function + its lexical environment"
 * 2. "It remembers variables from where it was defined, not called"
 * 3. "var in loops creates shared closure — use let or IIFE to fix"
 * 4. "Practical uses: module pattern, memoize, debounce, curry, once"
 * 5. "Closures can cause memory leaks if they reference large objects"
 * 6. "React stale closures happen with empty dependency arrays"
 * 7. "Each function call creates a NEW closure with its own variables"
 */



// ══════════════════════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════════════════════
//
//                    📘 JAVASCRIPT — SCOPE (DEEP DIVE)
//
// ══════════════════════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════════════════════


// --------------------------------------------------------------
// 24. SCOPE — COMPREHENSIVE INTERVIEW GUIDE
// --------------------------------------------------------------

/**
 * ═══════════════════════════════════════════════════════════════
 * 🎯 DEFINITION:
 * ═══════════════════════════════════════════════════════════════
 *
 * SCOPE determines the accessibility (visibility) of variables
 * in different parts of your code. JavaScript uses LEXICAL
 * (static) scoping — scope is determined at write time, not runtime.
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 📝 TYPES OF SCOPE
 * ═══════════════════════════════════════════════════════════════
 *
 * 1. GLOBAL SCOPE
 *    - Variables declared outside any function/block
 *    - Accessible everywhere in the program
 *    - Attached to `window` (browser) or `global` (Node) if using `var`
 *    - `let`/`const` at top level are global but NOT on window
 *
 * 2. FUNCTION SCOPE
 *    - `var` declarations are scoped to the enclosing function
 *    - Function parameters are function-scoped
 *
 * 3. BLOCK SCOPE
 *    - `let` and `const` are scoped to the nearest {}
 *    - if, for, while, try/catch all create blocks
 *    - `var` IGNORES block scope (only respects function scope)
 *
 * 4. MODULE SCOPE
 *    - Each ES module has its own top-level scope
 *    - Variables are NOT global — only accessible via export/import
 *
 * 5. LEXICAL SCOPE (Static Scope)
 *    - Inner functions can access outer function variables
 *    - Determined by WHERE the function is WRITTEN in source code
 *    - NOT by where it is CALLED (that would be dynamic scope)
 */

// GLOBAL SCOPE:
var globalVar = "I'm on window";
let globalLet = "I'm NOT on window";
// window.globalVar → "I'm on window"
// window.globalLet → undefined

// FUNCTION SCOPE (var):
function example() {
  var local = "only inside example()";
  if (true) {
    var stillFunctionScoped = "I leak out of the if block";
  }
  console.log(stillFunctionScoped); // ✅ Works — var ignores block
}
// console.log(local); // ❌ ReferenceError

// BLOCK SCOPE (let/const):
function blockExample() {
  if (true) {
    let blockScoped = "only inside this if";
    const alsoBlock = "same here";
  }
  // console.log(blockScoped); // ❌ ReferenceError
}

// for-loop scoping:
for (var i = 0; i < 3; i++) {} // `i` leaks out
console.log(i); // 3

for (let j = 0; j < 3; j++) {} // `j` is contained
// console.log(j); // ❌ ReferenceError


/**
 * ═══════════════════════════════════════════════════════════════
 * 🔗 SCOPE CHAIN & VARIABLE LOOKUP
 * ═══════════════════════════════════════════════════════════════
 *
 * When JavaScript needs a variable, it walks UP the scope chain:
 *
 * Current Scope → Parent Scope → ... → Global Scope → ReferenceError
 *
 * It NEVER walks down (inner scopes are not accessible from outer).
 */

const globalName = "Global";

function outerFn() {
  const outerName = "Outer";

  function middleFn() {
    const middleName = "Middle";

    function innerFn() {
      const innerName = "Inner";
      // Can access: innerName, middleName, outerName, globalName
      console.log(globalName, outerName, middleName, innerName); // All ✅
    }
    innerFn();
    // Can access: middleName, outerName, globalName
    // CANNOT access: innerName ❌
  }
  middleFn();
}


/**
 * ═══════════════════════════════════════════════════════════════
 * ⏰ TEMPORAL DEAD ZONE (TDZ) — DEEP DIVE
 * ═══════════════════════════════════════════════════════════════
 *
 * TDZ is the time between entering a scope and the variable's
 * declaration being processed. During TDZ, accessing the variable
 * throws ReferenceError.
 *
 * WHY: Ensures variables are used only after initialization.
 * Catches bugs that `var` would silently produce (undefined).
 */

// TDZ Example:
{
  // TDZ for `x` starts here ─────────┐
  // console.log(x); // ❌ ReferenceError │ TDZ
  // typeof x;       // ❌ ReferenceError │ TDZ
  let x = 10;       // TDZ ends here ──┘
  console.log(x);   // ✅ 10
}

// TDZ in function parameters:
// function greet(name = greeting, greeting = "Hello") {
//   // ❌ ReferenceError: can't access `greeting` before init
// }

// typeof is NOT safe with TDZ:
// typeof undeclaredVar;  // ✅ "undefined" (undeclared is fine)
// typeof letVariable;    // ❌ ReferenceError (TDZ for let)


/**
 * ═══════════════════════════════════════════════════════════════
 * 🧩 SCOPE INTERVIEW QUESTIONS
 * ═══════════════════════════════════════════════════════════════
 */

// ❓ QUESTION: What's the output?
var x = 1;
function foo() {
  console.log(x); // undefined (not 1!) — var x below is hoisted
  var x = 2;
  console.log(x); // 2
}
foo();
// Equivalent to:
// function foo() {
//   var x; // hoisted declaration
//   console.log(x); // undefined
//   x = 2;
//   console.log(x); // 2
// }

// ❓ QUESTION: Lexical scope vs call-site
var valueSc = "global";
function getValueSc() {
  return valueSc; // Looks up scope where DEFINED, not where CALLED
}
function wrapper() {
  var valueSc = "local";
  return getValueSc(); // Still returns "global"!
}
console.log(wrapper()); // "global" — lexical scoping!

// ❓ QUESTION: Block scope in switch
function testSwitch(val) {
  switch (val) {
    case 1:
      let msg = "one";
      break;
    case 2:
      // let msg = "two"; // ❌ SyntaxError — same block!
      break;
  }
  // FIX: Wrap each case in {}
  switch (val) {
    case 1: {
      let msg = "one";
      break;
    }
    case 2: {
      let msg = "two"; // ✅ Different block
      break;
    }
  }
}


/**
 * ═══════════════════════════════════════════════════════════════
 * 📋 SCOPE INTERVIEW SUMMARY
 * ═══════════════════════════════════════════════════════════════
 *
 * 🗣️ WHAT INTERVIEWERS WANT TO HEAR:
 * 1. "JavaScript uses lexical scoping — scope is determined at write time"
 * 2. "var is function-scoped, let/const are block-scoped"
 * 3. "Scope chain walks UP only — inner accesses outer, never reverse"
 * 4. "TDZ prevents using let/const before declaration — ReferenceError"
 * 5. "var global goes on window, let/const global does not"
 * 6. "Module scope means top-level vars aren't global"
 * 7. "Hoisting + var creates surprising undefined values"
 */



// ══════════════════════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════════════════════
//
//                    📘 JAVASCRIPT — EVENT HANDLING (DEEP DIVE)
//
// ══════════════════════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════════════════════


// --------------------------------------------------------------
// 25. EVENT HANDLING — COMPREHENSIVE INTERVIEW GUIDE
// --------------------------------------------------------------

/**
 * ═══════════════════════════════════════════════════════════════
 * 🎯 THE DOM EVENT SYSTEM
 * ═══════════════════════════════════════════════════════════════
 *
 * Every DOM event goes through THREE PHASES:
 *
 * 1. CAPTURING PHASE (top → down)
 *    Event travels from window → document → html → body → ... → target
 *
 * 2. TARGET PHASE
 *    Event reaches the actual element that was clicked/interacted with
 *
 * 3. BUBBLING PHASE (bottom → up)
 *    Event travels from target → ... → body → html → document → window
 *
 *
 *         window
 *           │
 *        document          ─┐
 *           │               │ CAPTURING (phase 1)
 *         <html>            │ (top to bottom)
 *           │               │
 *         <body>           ─┘
 *           │
 *         <div>   ← ← ← ← ← TARGET (phase 2)
 *           │
 *         <body>           ─┐
 *           │               │ BUBBLING (phase 3)
 *         <html>            │ (bottom to top)
 *           │               │
 *        document          ─┘
 *           │
 *         window
 *
 *
 * By default, listeners fire during BUBBLING phase.
 * Use { capture: true } to listen during CAPTURING phase.
 */

// Adding Event Listeners — the RIGHT way:
// element.addEventListener(event, handler, options);

// Options object:
// {
//   capture: false,   // Listen during capture phase?
//   once: true,       // Auto-remove after first fire?
//   passive: true,    // Promise not to call preventDefault?
//   signal: controller.signal  // AbortController for cleanup
// }

// EXAMPLE: Capture vs Bubble
// document.getElementById('outer').addEventListener('click', () => {
//   console.log('Outer - Bubble');
// });
// document.getElementById('outer').addEventListener('click', () => {
//   console.log('Outer - Capture');
// }, { capture: true });
// document.getElementById('inner').addEventListener('click', () => {
//   console.log('Inner - Target/Bubble');
// });

// Click on inner → Output order:
// "Outer - Capture"      (capture phase, going down)
// "Inner - Target/Bubble" (target phase)
// "Outer - Bubble"       (bubble phase, going up)


/**
 * ═══════════════════════════════════════════════════════════════
 * 📝 EVENT DELEGATION — KEY INTERVIEW TOPIC
 * ═══════════════════════════════════════════════════════════════
 *
 * Instead of adding listeners to EVERY child element,
 * add ONE listener to the parent and use event.target to
 * determine which child was clicked.
 *
 * WHY:
 * 1. Performance — 1 listener vs 1000 listeners
 * 2. Dynamic content — works for elements added AFTER listener is set
 * 3. Memory — fewer function objects in memory
 */

// ❌ BAD: Listener on every item
// document.querySelectorAll('li').forEach(li => {
//   li.addEventListener('click', handleClick); // 1000 listeners!
// });

// ✅ GOOD: Event delegation
// document.querySelector('ul').addEventListener('click', (e) => {
//   const li = e.target.closest('li'); // Handles nested elements
//   if (!li) return; // Clicked on ul padding, not an li
//   handleClick(li);
// });

// ⚠️ WHY closest() not just e.target:
// If <li> has child elements like <span>, e.target might be the <span>.
// closest('li') walks UP from target to find the nearest matching ancestor.

// DELEGATION WITH DATA ATTRIBUTES:
// <ul id="menu">
//   <li data-action="save">Save</li>
//   <li data-action="delete">Delete</li>
//   <li data-action="edit">Edit</li>
// </ul>

// document.getElementById('menu').addEventListener('click', (e) => {
//   const action = e.target.closest('[data-action]')?.dataset.action;
//   if (!action) return;
//   switch(action) {
//     case 'save': save(); break;
//     case 'delete': remove(); break;
//     case 'edit': edit(); break;
//   }
// });


/**
 * ═══════════════════════════════════════════════════════════════
 * 📝 stopPropagation vs stopImmediatePropagation vs preventDefault
 * ═══════════════════════════════════════════════════════════════
 *
 * | Method                     | What it does                              |
 * |----------------------------|-------------------------------------------|
 * | e.stopPropagation()        | Stops event from going to parent elements |
 * | e.stopImmediatePropagation | Stops event + prevents other handlers     |
 * |                            | ON THE SAME ELEMENT from firing           |
 * | e.preventDefault()         | Prevents browser default behavior         |
 * |                            | (form submit, link navigation, etc.)      |
 *
 * IMPORTANT: preventDefault does NOT stop propagation!
 *            stopPropagation does NOT prevent default behavior!
 *            They are independent.
 */

// stopPropagation example:
// child.addEventListener('click', (e) => {
//   e.stopPropagation(); // Parent's click handler won't fire
//   console.log('child clicked');
// });

// stopImmediatePropagation:
// button.addEventListener('click', (e) => {
//   e.stopImmediatePropagation();
//   console.log('First handler'); // ✅ Fires
// });
// button.addEventListener('click', () => {
//   console.log('Second handler'); // ❌ Never fires
// });

// preventDefault:
// form.addEventListener('submit', (e) => {
//   e.preventDefault(); // Form won't actually submit
//   // Handle with JS instead (AJAX)
// });

// link.addEventListener('click', (e) => {
//   e.preventDefault(); // Won't navigate to href
//   // SPA routing instead
// });


/**
 * ═══════════════════════════════════════════════════════════════
 * 📝 EVENT OBJECT (e) — IMPORTANT PROPERTIES
 * ═══════════════════════════════════════════════════════════════
 *
 * | Property         | Description                                      |
 * |------------------|--------------------------------------------------|
 * | e.target         | Element that TRIGGERED the event (deepest)       |
 * | e.currentTarget  | Element the handler is ATTACHED to               |
 * | e.type           | Event type string ("click", "keydown")           |
 * | e.bubbles        | Does this event bubble?                          |
 * | e.cancelable     | Can default be prevented?                        |
 * | e.eventPhase     | 1=capture, 2=target, 3=bubble                    |
 * | e.timeStamp      | When the event was created                       |
 * | e.isTrusted      | true if user-initiated, false if script-created  |
 *
 * MOUSE EVENTS:
 * | e.clientX/Y      | Position relative to viewport                    |
 * | e.pageX/Y        | Position relative to document                    |
 * | e.offsetX/Y      | Position relative to target element              |
 * | e.button         | Which mouse button (0=left, 1=middle, 2=right)   |
 *
 * KEYBOARD EVENTS:
 * | e.key            | The character ("a", "Enter", "Escape")           |
 * | e.code           | Physical key ("KeyA", "Digit1", "Space")         |
 * | e.altKey         | Was Alt held?                                    |
 * | e.ctrlKey        | Was Ctrl held?                                   |
 * | e.shiftKey       | Was Shift held?                                  |
 * | e.metaKey        | Was Cmd/Win held?                                |
 *
 * 💡 e.key vs e.code:
 * - key = "a" or "A" (affected by shift/layout)
 * - code = "KeyA" (physical key, layout-independent)
 * - Use `key` for text input, `code` for game controls/shortcuts
 */


/**
 * ═══════════════════════════════════════════════════════════════
 * 📝 CUSTOM EVENTS
 * ═══════════════════════════════════════════════════════════════
 */

// Creating and dispatching custom events:
// const event = new CustomEvent('userLogin', {
//   detail: { userId: 123, role: 'admin' },
//   bubbles: true,      // Will bubble up
//   cancelable: true    // Can be preventDefault'd
// });

// Listening:
// document.addEventListener('userLogin', (e) => {
//   console.log(e.detail.userId); // 123
// });

// Dispatching:
// document.dispatchEvent(event);

// USE CASES: Component communication, plugin systems, decoupled modules


/**
 * ═══════════════════════════════════════════════════════════════
 * 📝 PASSIVE EVENT LISTENERS — PERFORMANCE
 * ═══════════════════════════════════════════════════════════════
 *
 * For scroll/touch events, the browser must WAIT to see if you
 * call preventDefault() before it can scroll. This causes jank.
 *
 * { passive: true } tells the browser: "I won't call preventDefault"
 * → Browser scrolls immediately without waiting → smoother scrolling
 */

// ✅ Smooth scrolling:
// document.addEventListener('touchstart', handler, { passive: true });
// document.addEventListener('wheel', handler, { passive: true });

// ⚠️ Chrome now defaults touchstart/touchmove to passive.
// If you need preventDefault for these, explicitly set { passive: false }


/**
 * ═══════════════════════════════════════════════════════════════
 * 📝 AbortController FOR EVENT CLEANUP
 * ═══════════════════════════════════════════════════════════════
 */

// Modern way to remove multiple listeners at once:
function setupUI() {
  const controller = new AbortController();
  const { signal } = controller;

  document.addEventListener("click", handleClick, { signal });
  document.addEventListener("keydown", handleKeydown, { signal });
  window.addEventListener("resize", handleResize, { signal });

  // Cleanup ALL listeners with one call:
  return () => controller.abort();
}

function handleClick() {}
function handleKeydown() {}
function handleResize() {}

// const cleanup = setupUI();
// cleanup(); // Removes all 3 listeners!

// 💡 INTERVIEW TIP: "AbortController is cleaner than storing references
//    to every handler. Works with fetch() too for cancelling requests."


/**
 * ═══════════════════════════════════════════════════════════════
 * 📝 EVENT LISTENERS IN REACT — SYNTHETIC EVENTS
 * ═══════════════════════════════════════════════════════════════
 *
 * React wraps native events in SyntheticEvent:
 * - Cross-browser compatible
 * - Events are POOLED (reused) for performance (React 16)
 * - React 17+ removed pooling — events persist naturally
 * - React attaches handlers to root, not individual DOM nodes
 *   (event delegation under the hood)
 *
 * DIFFERENCES FROM NATIVE:
 * - camelCase: onClick not onclick
 * - Pass function: onClick={handleClick} not onClick="handleClick()"
 * - preventDefault must be explicit (return false doesn't work)
 * - e.nativeEvent to access underlying native event
 *
 * CAPTURE PHASE IN REACT:
 * - onClickCapture instead of onClick
 */


/**
 * ═══════════════════════════════════════════════════════════════
 * 📋 EVENT HANDLING INTERVIEW SUMMARY
 * ═══════════════════════════════════════════════════════════════
 *
 * 🗣️ WHAT INTERVIEWERS WANT TO HEAR:
 * 1. "Events go through 3 phases: capture → target → bubble"
 * 2. "Event delegation uses bubbling — one handler on parent, check e.target"
 * 3. "Use closest() in delegation to handle nested child elements"
 * 4. "stopPropagation stops bubbling, preventDefault stops default behavior"
 * 5. "e.target is what was clicked, e.currentTarget is where handler is attached"
 * 6. "passive: true improves scroll performance by not blocking"
 * 7. "AbortController can remove multiple listeners with one abort() call"
 * 8. "React uses synthetic events with automatic delegation to root"
 */



// ══════════════════════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════════════════════
//
//                    📘 JAVASCRIPT — BROWSER APIs (DEEP DIVE)
//
// ══════════════════════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════════════════════


// --------------------------------------------------------------
// 26. BROWSER APIs — COMPREHENSIVE INTERVIEW GUIDE
// --------------------------------------------------------------

/**
 * ═══════════════════════════════════════════════════════════════
 * 🎯 OVERVIEW OF KEY BROWSER APIs
 * ═══════════════════════════════════════════════════════════════
 *
 * The browser provides powerful APIs beyond just the DOM.
 * Interviewers test knowledge of these to gauge real-world
 * frontend experience.
 *
 * Categories:
 * 1. Storage (localStorage, sessionStorage, IndexedDB, Cookies)
 * 2. Network (Fetch, XMLHttpRequest, WebSocket, Server-Sent Events)
 * 3. Performance (requestAnimationFrame, IntersectionObserver,
 *    ResizeObserver, MutationObserver, Performance API)
 * 4. Workers (Web Worker, Service Worker, Shared Worker)
 * 5. Communication (postMessage, BroadcastChannel, Channel Messaging)
 * 6. Media (Canvas, WebGL, Web Audio, MediaStream)
 * 7. Location & History (Geolocation, History API, URL API)
 * 8. Notifications & Permissions
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 📝 1. WEB STORAGE APIs
 * ═══════════════════════════════════════════════════════════════
 *
 * | Feature          | localStorage | sessionStorage | Cookies        | IndexedDB     |
 * |------------------|--------------|----------------|----------------|---------------|
 * | Capacity         | ~5-10MB      | ~5MB           | ~4KB           | Unlimited*    |
 * | Lifetime         | Forever      | Tab session    | Expires/maxAge | Forever       |
 * | Sent to server   | ❌ No        | ❌ No          | ✅ Every request| ❌ No        |
 * | Scope            | Origin       | Origin + Tab   | Origin + Path  | Origin        |
 * | API              | Sync         | Sync           | Sync (string)  | Async         |
 * | Web Workers      | ❌ No        | ❌ No          | ❌ No          | ✅ Yes        |
 * | Structured data  | Strings only | Strings only   | Strings only   | Any (objects) |
 */

// localStorage — persists even after browser close:
// localStorage.setItem('theme', 'dark');
// localStorage.getItem('theme'); // "dark"
// localStorage.removeItem('theme');
// localStorage.clear();

// ⚠️ GOTCHA: Only stores strings!
// localStorage.setItem('user', { name: 'Alice' }); // Stores "[object Object]"!
// localStorage.setItem('user', JSON.stringify({ name: 'Alice' })); // ✅ Correct
// JSON.parse(localStorage.getItem('user')); // { name: 'Alice' }

// STORAGE EVENT — cross-tab communication:
// window.addEventListener('storage', (e) => {
//   // Fires in OTHER tabs when localStorage changes
//   console.log(e.key, e.oldValue, e.newValue, e.storageArea);
// });

// sessionStorage — per-tab, cleared when tab closes:
// Same API as localStorage, but data is tab-specific.
// Opening a new tab (even same URL) gets fresh sessionStorage.

// 💡 INTERVIEW TIP: "localStorage persists forever and is shared across tabs.
//    sessionStorage is per-tab and dies with the tab. Neither is sent to server.
//    Use IndexedDB for large/structured data, cookies for server-needed data."


/**
 * ═══════════════════════════════════════════════════════════════
 * 📝 2. FETCH API & NETWORK
 * ═══════════════════════════════════════════════════════════════
 */

// Modern fetch with error handling:
async function fetchWithHandling(url) {
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // Send cookies for CORS
      signal: AbortSignal.timeout(5000), // Timeout after 5s
    });

    // ⚠️ fetch does NOT reject on 404/500! Only on network failure.
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    return await res.json();
  } catch (err) {
    if (err.name === "AbortError") console.log("Request timed out");
    else throw err;
  }
}

// ABORT A FETCH (user cancelled, component unmounted):
function fetchWithCancel(url) {
  const controller = new AbortController();

  const promise = fetch(url, { signal: controller.signal })
    .then((r) => r.json())
    .catch((err) => {
      if (err.name === "AbortError") return null; // Cancelled, not an error
      throw err;
    });

  return { promise, cancel: () => controller.abort() };
}

// STREAMING RESPONSE (large files, real-time):
async function streamResponse(url) {
  const res = await fetch(url);
  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    console.log("Received chunk:", chunk);
  }
}


/**
 * ═══════════════════════════════════════════════════════════════
 * 📝 3. INTERSECTION OBSERVER — LAZY LOADING & INFINITE SCROLL
 * ═══════════════════════════════════════════════════════════════
 *
 * Efficiently detects when an element enters/exits the viewport.
 * Replaces scroll event listeners (which cause jank).
 */

// Lazy load images:
function lazyLoadImages() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src; // Load actual image
          observer.unobserve(img);   // Stop watching
        }
      });
    },
    {
      root: null,       // viewport
      rootMargin: "200px", // Start loading 200px before visible
      threshold: 0,     // Trigger when any pixel is visible
    }
  );

  document.querySelectorAll("img[data-src]").forEach((img) => {
    observer.observe(img);
  });

  return observer;
}

// Infinite scroll:
function infiniteScroll(loadMore) {
  const sentinel = document.querySelector("#scroll-sentinel");
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        loadMore(); // Fetch next page
      }
    },
    { rootMargin: "500px" }
  );
  observer.observe(sentinel);
  return observer;
}

// 💡 INTERVIEW TIP: "IntersectionObserver is async and uses the browser's
//    optimized internal scheduling. Unlike scroll listeners, it doesn't
//    fire on every frame and doesn't cause layout thrashing."


/**
 * ═══════════════════════════════════════════════════════════════
 * 📝 4. MUTATION OBSERVER — WATCH DOM CHANGES
 * ═══════════════════════════════════════════════════════════════
 *
 * Observes changes to DOM: child additions/removals, attribute
 * changes, text content changes.
 *
 * USE CASES: Third-party script monitoring, accessibility tools,
 * form auto-save, analytics tracking.
 */

function watchDOMChanges(target) {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList") {
        mutation.addedNodes.forEach((node) => {
          console.log("Added:", node);
        });
        mutation.removedNodes.forEach((node) => {
          console.log("Removed:", node);
        });
      }
      if (mutation.type === "attributes") {
        console.log(
          `${mutation.attributeName} changed on`,
          mutation.target
        );
      }
    });
  });

  observer.observe(target, {
    childList: true,   // Watch child additions/removals
    attributes: true,  // Watch attribute changes
    subtree: true,     // Watch ALL descendants too
    characterData: true, // Watch text content changes
  });

  return () => observer.disconnect();
}


/**
 * ═══════════════════════════════════════════════════════════════
 * 📝 5. RESIZE OBSERVER
 * ═══════════════════════════════════════════════════════════════
 *
 * Detects when an element's size changes (not just window resize).
 * Better than window.onresize because it watches individual elements.
 */

function watchElementSize(element, callback) {
  const observer = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const { width, height } = entry.contentRect;
      callback({ width, height });
    }
  });
  observer.observe(element);
  return () => observer.disconnect();
}

// USE CASES: Responsive components, chart resizing, container queries polyfill


/**
 * ═══════════════════════════════════════════════════════════════
 * 📝 6. requestAnimationFrame (rAF)
 * ═══════════════════════════════════════════════════════════════
 *
 * Schedules code to run before the NEXT repaint (~60fps = every 16.6ms).
 * Browser-optimized: pauses in background tabs, syncs with display refresh.
 *
 * USE: Animations, batched DOM updates, smooth scrolling.
 * NEVER use setInterval for animations — it's not synced to refresh rate.
 */

function smoothAnimation(element) {
  let start = null;
  const duration = 1000; // 1 second

  function animate(timestamp) {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);

    element.style.transform = `translateX(${progress * 300}px)`;

    if (progress < 1) {
      requestAnimationFrame(animate); // Continue until done
    }
  }

  requestAnimationFrame(animate);
}

// BATCHING DOM READS/WRITES (prevent layout thrashing):
// ❌ BAD: Read → Write → Read → Write (forces layout recalculation each time)
// ✅ GOOD: Batch reads, then batch writes in rAF
function batchedDOMUpdate(elements) {
  // Read phase (all reads together):
  const heights = elements.map((el) => el.offsetHeight);

  // Write phase in rAF:
  requestAnimationFrame(() => {
    elements.forEach((el, i) => {
      el.style.height = heights[i] * 2 + "px";
    });
  });
}


/**
 * ═══════════════════════════════════════════════════════════════
 * 📝 7. WEB WORKERS
 * ═══════════════════════════════════════════════════════════════
 *
 * Run JavaScript in a BACKGROUND THREAD — doesn't block UI.
 *
 * | Type           | Scope        | Shared? | Use Case                    |
 * |----------------|--------------|---------|------------------------------|
 * | Web Worker     | Dedicated    | No      | Heavy computation            |
 * | Shared Worker  | Multi-tab    | Yes     | Shared state across tabs     |
 * | Service Worker | Offline/Proxy| No      | Caching, push notifications  |
 *
 * LIMITATIONS:
 * - No DOM access (no document, window)
 * - Communication via postMessage (structured clone)
 * - Separate global scope (self, not window)
 */

// Main thread:
function offloadWork(data) {
  const worker = new Worker("worker.js");

  worker.postMessage(data);

  worker.onmessage = (e) => {
    console.log("Result from worker:", e.data);
    worker.terminate(); // Clean up
  };

  worker.onerror = (e) => {
    console.error("Worker error:", e.message);
  };
}

// worker.js:
// self.onmessage = (e) => {
//   const result = heavyComputation(e.data);
//   self.postMessage(result);
// };

// TRANSFERABLE OBJECTS — zero-copy transfer:
// const buffer = new ArrayBuffer(1024 * 1024); // 1MB
// worker.postMessage(buffer, [buffer]); // Transfer, not copy
// console.log(buffer.byteLength); // 0 — ownership transferred!

// 💡 INTERVIEW TIP: "Use Web Workers for CPU-intensive tasks:
//    image processing, parsing large JSON, sorting large datasets,
//    crypto operations. Keep the main thread free for 60fps UI."


/**
 * ═══════════════════════════════════════════════════════════════
 * 📝 8. SERVICE WORKERS — OFFLINE & CACHING
 * ═══════════════════════════════════════════════════════════════
 *
 * A proxy between browser and network. Enables:
 * - Offline support (cache-first strategy)
 * - Push notifications
 * - Background sync
 * - Performance (serve from cache, faster than network)
 *
 * LIFECYCLE: install → activate → fetch (intercept requests)
 */

// Registration:
// if ('serviceWorker' in navigator) {
//   navigator.serviceWorker.register('/sw.js')
//     .then(reg => console.log('SW registered', reg.scope))
//     .catch(err => console.error('SW failed', err));
// }

// sw.js — Cache-first strategy:
// const CACHE_NAME = 'v1';
// const ASSETS = ['/', '/index.html', '/styles.css', '/app.js'];
//
// self.addEventListener('install', (e) => {
//   e.waitUntil(
//     caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
//   );
// });
//
// self.addEventListener('fetch', (e) => {
//   e.respondWith(
//     caches.match(e.request).then(cached => cached || fetch(e.request))
//   );
// });


/**
 * ═══════════════════════════════════════════════════════════════
 * 📝 9. HISTORY API & SPA ROUTING
 * ═══════════════════════════════════════════════════════════════
 *
 * Enables URL changes WITHOUT full page reload (SPA routing).
 */

// Push new URL:
// history.pushState({ page: 'about' }, '', '/about');
// URL changes to /about, no reload

// Replace current URL (no back button entry):
// history.replaceState({ page: 'home' }, '', '/home');

// Listen for back/forward navigation:
// window.addEventListener('popstate', (e) => {
//   console.log('Navigated to:', location.pathname);
//   console.log('State:', e.state);
//   // Render the correct view
// });

// 💡 INTERVIEW TIP: "React Router, Vue Router all use History API under the hood.
//    pushState changes URL without reload. popstate fires on back/forward."


/**
 * ═══════════════════════════════════════════════════════════════
 * 📝 10. BROADCAST CHANNEL — CROSS-TAB COMMUNICATION
 * ═══════════════════════════════════════════════════════════════
 */

// Tab 1:
// const channel = new BroadcastChannel('app_events');
// channel.postMessage({ type: 'LOGOUT' });

// Tab 2:
// const channel = new BroadcastChannel('app_events');
// channel.onmessage = (e) => {
//   if (e.data.type === 'LOGOUT') {
//     // Redirect to login
//     window.location.href = '/login';
//   }
// };

// USE CASES: Sync logout across tabs, sync theme/preferences,
// prevent duplicate notifications


/**
 * ═══════════════════════════════════════════════════════════════
 * 📝 11. PERFORMANCE API
 * ═══════════════════════════════════════════════════════════════
 */

// Measure code execution time:
// performance.mark('start-render');
// renderHeavyComponent();
// performance.mark('end-render');
// performance.measure('render-time', 'start-render', 'end-render');
// const measure = performance.getEntriesByName('render-time')[0];
// console.log(`Render took ${measure.duration}ms`);

// Web Vitals (Core Web Vitals):
// - LCP (Largest Contentful Paint): When largest element renders. Target: <2.5s
// - FID (First Input Delay): Time from click to response. Target: <100ms
// - CLS (Cumulative Layout Shift): Visual stability. Target: <0.1
// - INP (Interaction to Next Paint): Replaced FID in 2024. Target: <200ms

// Navigation Timing:
// const timing = performance.getEntriesByType('navigation')[0];
// console.log('DOM Content Loaded:', timing.domContentLoadedEventEnd);
// console.log('Full Page Load:', timing.loadEventEnd);


/**
 * ═══════════════════════════════════════════════════════════════
 * 📋 BROWSER APIs INTERVIEW SUMMARY
 * ═══════════════════════════════════════════════════════════════
 *
 * 🗣️ WHAT INTERVIEWERS WANT TO HEAR:
 * 1. "localStorage is synchronous, same-origin, 5-10MB, persists forever"
 * 2. "fetch doesn't reject on 404/500 — you must check res.ok"
 * 3. "IntersectionObserver replaces scroll listeners for lazy loading"
 * 4. "requestAnimationFrame syncs with display refresh — use for animations"
 * 5. "Web Workers for CPU-heavy tasks, Service Workers for caching/offline"
 * 6. "History API enables SPA routing without page reload"
 * 7. "AbortController cancels fetch AND removes event listeners"
 * 8. "BroadcastChannel syncs state across tabs (logout, theme)"
 * 9. "Use Performance API and Web Vitals for real user metrics"
 * 10. "MutationObserver watches DOM changes without polling"
 */



// ══════════════════════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════════════════════
//
//                    📘 HTML — SEMANTIC HTML (DEEP DIVE)
//
// ══════════════════════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════════════════════


// --------------------------------------------------------------
// 27. SEMANTIC HTML — COMPREHENSIVE INTERVIEW GUIDE
// --------------------------------------------------------------

/**
 * ═══════════════════════════════════════════════════════════════
 * 🎯 DEFINITION:
 * ═══════════════════════════════════════════════════════════════
 *
 * Semantic HTML means using HTML elements for their MEANING,
 * not just their appearance. It tells browsers, search engines,
 * and assistive technologies WHAT the content IS.
 *
 * WHY IT MATTERS:
 * 1. ACCESSIBILITY — Screen readers use semantics to navigate
 * 2. SEO — Search engines understand content structure
 * 3. MAINTAINABILITY — Code is self-documenting
 * 4. DEFAULT BEHAVIORS — buttons are focusable/clickable, forms submit
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 📝 SEMANTIC vs NON-SEMANTIC ELEMENTS
 * ═══════════════════════════════════════════════════════════════
 *
 * NON-SEMANTIC (tell nothing about content):
 * <div>, <span> — generic containers, no meaning
 *
 * SEMANTIC (describe the content):
 * <header> — Introductory content, navigation
 * <nav>    — Navigation links
 * <main>   — Main content (ONE per page)
 * <section> — Thematic grouping with a heading
 * <article> — Self-contained, independently distributable content
 * <aside>  — Tangentially related (sidebar, callout)
 * <footer> — Footer content, copyright, links
 * <figure> — Illustration, diagram, photo with caption
 * <figcaption> — Caption for <figure>
 * <details>/<summary> — Expandable content (native accordion!)
 * <time>   — Machine-readable date/time
 * <mark>   — Highlighted/relevant text
 * <address> — Contact information
 * <hgroup> — Group of headings (h1-h6 with subtitle)
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 📝 CORRECT PAGE STRUCTURE
 * ═══════════════════════════════════════════════════════════════
 *
 * ❌ BAD (div soup):
 * <div class="header">
 *   <div class="nav">
 *     <div class="nav-item">Home</div>
 *   </div>
 * </div>
 * <div class="main">
 *   <div class="article">
 *     <div class="title">My Post</div>
 *   </div>
 * </div>
 * <div class="footer">Copyright 2024</div>
 *
 * ✅ GOOD (semantic):
 * <header>
 *   <nav aria-label="Main navigation">
 *     <ul>
 *       <li><a href="/">Home</a></li>
 *       <li><a href="/about">About</a></li>
 *     </ul>
 *   </nav>
 * </header>
 * <main>
 *   <article>
 *     <h1>My Post</h1>
 *     <time datetime="2024-01-15">January 15, 2024</time>
 *     <p>Content here...</p>
 *   </article>
 * </main>
 * <footer>
 *   <p>&copy; 2024 My Site</p>
 * </footer>
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 📝 SECTION vs ARTICLE vs DIV — WHEN TO USE WHAT
 * ═══════════════════════════════════════════════════════════════
 *
 * <article> — Would this make sense if syndicated (RSS, shared)?
 *   Blog post ✅, comment ✅, product card ✅, tweet ✅
 *
 * <section> — Is this a thematic grouping WITH a heading?
 *   "Features" section ✅, "Pricing" section ✅, chapter ✅
 *
 * <div> — Neither of the above? Just need a wrapper for styling?
 *   Layout container ✅, styling hook ✅
 *
 * RULE: If you can't give it a meaningful heading → probably a <div>
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 📝 HEADING HIERARCHY
 * ═══════════════════════════════════════════════════════════════
 *
 * ❌ BAD: Skip heading levels or use for styling
 * <h1>Title</h1>
 * <h3>Subtitle</h3>   ← Skipped h2!
 * <h4>Small text</h4> ← Using h4 just for smaller font
 *
 * ✅ GOOD: Sequential, one h1 per page:
 * <h1>Page Title</h1>
 *   <h2>Section</h2>
 *     <h3>Subsection</h3>
 *   <h2>Another Section</h2>
 *     <h3>Subsection</h3>
 *
 * Screen readers generate a "heading outline" for navigation.
 * Skipped levels break this outline.
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 📝 INTERACTIVE SEMANTIC ELEMENTS
 * ═══════════════════════════════════════════════════════════════
 *
 * <button> over <div onclick>:
 * - Focusable by default (keyboard accessible)
 * - Triggered by Enter AND Space keys
 * - Announced as "button" by screen readers
 * - Has :focus, :active, :disabled states built-in
 *
 * <a href> over <span onclick>:
 * - Right-click → "Open in new tab"
 * - Ctrl+Click → new tab
 * - Screen readers announce as "link"
 * - Crawlable by search engines
 *
 * <details>/<summary> — Native collapsible (no JS needed!):
 * <details>
 *   <summary>FAQ Question</summary>
 *   <p>The answer is shown when expanded.</p>
 * </details>
 *
 * <dialog> — Native modal (ES2022 browsers):
 * <dialog id="modal">
 *   <h2>Modal Title</h2>
 *   <p>Content</p>
 *   <button onclick="this.closest('dialog').close()">Close</button>
 * </dialog>
 * // dialog.showModal() — opens with backdrop, traps focus
 * // dialog.show() — opens without backdrop
 * // dialog.close() — closes, fires 'close' event
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 📋 SEMANTIC HTML INTERVIEW SUMMARY
 * ═══════════════════════════════════════════════════════════════
 *
 * 🗣️ WHAT INTERVIEWERS WANT TO HEAR:
 * 1. "Semantic elements describe WHAT content is, not how it looks"
 * 2. "Screen readers use semantic elements as navigation landmarks"
 * 3. "<button> gives free keyboard access, focus, and ARIA roles"
 * 4. "One <main> per page, headings in sequential order"
 * 5. "<article> = self-contained, <section> = thematic with heading"
 * 6. "<dialog> with showModal() gives native modal with focus trapping"
 * 7. "div/span are for styling only — they have no semantic meaning"
 * 8. "Proper semantics improve SEO because crawlers understand structure"
 */



// ══════════════════════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════════════════════
//
//                    📘 HTML — ACCESSIBILITY (DEEP DIVE)
//
// ══════════════════════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════════════════════


// --------------------------------------------------------------
// 28. ACCESSIBILITY (a11y) — COMPREHENSIVE INTERVIEW GUIDE
// --------------------------------------------------------------

/**
 * ═══════════════════════════════════════════════════════════════
 * 🎯 WHAT IS WEB ACCESSIBILITY?
 * ═══════════════════════════════════════════════════════════════
 *
 * Making websites usable by EVERYONE, including people with:
 * - Visual impairments (blind, low vision, color blind)
 * - Motor disabilities (can't use mouse, limited mobility)
 * - Cognitive disabilities (dyslexia, ADHD)
 * - Hearing impairments (deaf, hard of hearing)
 * - Temporary disabilities (broken arm, bright sunlight)
 *
 * Standards: WCAG 2.1 (Web Content Accessibility Guidelines)
 * Levels: A (minimum) → AA (standard target) → AAA (highest)
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 📝 WCAG FOUR PRINCIPLES (POUR)
 * ═══════════════════════════════════════════════════════════════
 *
 * 1. PERCEIVABLE — Users can perceive the content
 *    - Text alternatives for images (alt text)
 *    - Captions for video/audio
 *    - Sufficient color contrast (4.5:1 for text)
 *    - Content works without color alone
 *
 * 2. OPERABLE — Users can interact with the interface
 *    - All functionality via keyboard
 *    - Enough time to read/interact
 *    - No seizure-triggering content (no flashing >3/sec)
 *    - Clear navigation and focus indicators
 *
 * 3. UNDERSTANDABLE — Users can understand content/UI
 *    - Readable text (language declared)
 *    - Predictable navigation (consistent)
 *    - Input assistance (error messages, labels)
 *
 * 4. ROBUST — Works with assistive technologies
 *    - Valid HTML
 *    - ARIA used correctly
 *    - Works with screen readers, magnifiers, etc.
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 📝 ARIA (Accessible Rich Internet Applications)
 * ═══════════════════════════════════════════════════════════════
 *
 * FIRST RULE OF ARIA: Don't use ARIA if native HTML works!
 * <button> is better than <div role="button" tabindex="0">
 *
 * ARIA adds semantics that HTML alone can't express.
 *
 * THREE TYPES:
 *
 * 1. ROLES — What IS this element?
 *    role="alert"       — Important, time-sensitive message
 *    role="dialog"      — Modal window
 *    role="tablist"     — Tab container
 *    role="tab"         — Individual tab
 *    role="tabpanel"    — Tab content
 *    role="navigation"  — (same as <nav>)
 *    role="search"      — Search landmark
 *    role="status"      — Live region for status updates
 *
 * 2. PROPERTIES — Characteristics that don't change often
 *    aria-label="Close"      — Accessible name (no visible text)
 *    aria-labelledby="id"    — References another element as label
 *    aria-describedby="id"   — Additional description
 *    aria-required="true"    — Field is required
 *    aria-placeholder="..."  — Placeholder text
 *    aria-haspopup="true"    — Has popup menu
 *    aria-controls="panelId" — This controls that element
 *
 * 3. STATES — Dynamic values that change with interaction
 *    aria-expanded="true/false"  — Expanded/collapsed
 *    aria-hidden="true"          — Hidden from assistive tech
 *    aria-disabled="true"        — Disabled but visible
 *    aria-selected="true"        — Currently selected
 *    aria-checked="true/false/mixed" — Checkbox state
 *    aria-current="page"         — Current item in navigation
 *    aria-live="polite/assertive" — Announces changes
 *    aria-busy="true"            — Loading state
 */

// ARIA LIVE REGIONS — Announce dynamic content:
// <div aria-live="polite" aria-atomic="true">
//   {/* Screen reader announces when content changes */}
//   Items in cart: 3
// </div>

// aria-live values:
// "polite" — Announces at next pause (non-urgent)
// "assertive" — Announces immediately (urgent: errors, alerts)
// "off" — Don't announce

// aria-atomic:
// true → Announces entire region content
// false → Announces only changed nodes


/**
 * ═══════════════════════════════════════════════════════════════
 * 📝 KEYBOARD ACCESSIBILITY
 * ═══════════════════════════════════════════════════════════════
 *
 * ALL interactive elements must be keyboard accessible:
 *
 * | Key      | Expected Behavior                           |
 * |----------|---------------------------------------------|
 * | Tab      | Move focus to next interactive element      |
 * | Shift+Tab| Move focus to previous element              |
 * | Enter    | Activate link/button                        |
 * | Space    | Activate button, toggle checkbox            |
 * | Escape   | Close modal, dismiss popup                  |
 * | Arrows   | Navigate within widgets (tabs, menus, lists)|
 *
 * FOCUS MANAGEMENT:
 *
 * tabindex="0"  — Adds element to natural tab order
 * tabindex="-1" — Focusable via JS (element.focus()) but NOT in tab order
 * tabindex="1+" — ❌ AVOID! Forces unnatural tab order
 *
 * FOCUS TRAPPING (modals):
 * When a modal opens, focus must stay INSIDE the modal.
 * Tab from last element → first element (loop).
 * On close, focus returns to the trigger button.
 */

// Focus trap implementation:
function trapFocus(modal) {
  const focusable = modal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  modal.addEventListener("keydown", (e) => {
    if (e.key !== "Tab") return;

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
}

// SKIP LINKS (first element on page):
// <a href="#main-content" class="skip-link">Skip to main content</a>
// .skip-link { position: absolute; top: -40px; }
// .skip-link:focus { top: 0; } /* Visible when focused */


/**
 * ═══════════════════════════════════════════════════════════════
 * 📝 ACCESSIBLE FORMS
 * ═══════════════════════════════════════════════════════════════
 *
 * Every input MUST have an associated label:
 *
 * METHOD 1 — Explicit (for/id):
 * <label for="email">Email</label>
 * <input id="email" type="email" required>
 *
 * METHOD 2 — Implicit (wrapping):
 * <label>Email <input type="email" required></label>
 *
 * METHOD 3 — aria-label (when no visible label):
 * <input type="search" aria-label="Search products">
 *
 * ERROR MESSAGES:
 * <input id="email" aria-describedby="email-error" aria-invalid="true">
 * <span id="email-error" role="alert">Please enter a valid email</span>
 *
 * FIELDSET + LEGEND (group related inputs):
 * <fieldset>
 *   <legend>Shipping Address</legend>
 *   <label for="street">Street</label>
 *   <input id="street">
 *   ...
 * </fieldset>
 *
 * 💡 NEVER rely solely on placeholder for labeling — it disappears on input!
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 📝 COLOR & CONTRAST
 * ═══════════════════════════════════════════════════════════════
 *
 * WCAG AA minimums:
 * - Normal text: 4.5:1 contrast ratio
 * - Large text (18px+ bold or 24px+): 3:1
 * - UI components (borders, icons): 3:1
 *
 * NEVER use color ALONE to convey information:
 * ❌ "Red fields are required"
 * ✅ "* fields are required" + red color + aria-required
 *
 * Tools: Chrome DevTools → Rendering → Emulate vision deficiencies
 *        axe DevTools, Lighthouse accessibility audit
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 📝 IMAGES & ALT TEXT
 * ═══════════════════════════════════════════════════════════════
 *
 * DECORATIVE images: alt="" (empty string, not missing!)
 *   <img src="decorative-line.svg" alt="">
 *
 * INFORMATIVE images: Describe the content
 *   <img src="chart.png" alt="Sales grew 45% in Q4 2024">
 *
 * FUNCTIONAL images (icons in buttons): Describe the function
 *   <button><img src="search.svg" alt="Search"></button>
 *   OR: <button aria-label="Search"><img src="search.svg" alt=""></button>
 *
 * COMPLEX images (charts, infographics): Long description
 *   <figure>
 *     <img src="chart.png" alt="Quarterly sales chart" aria-describedby="chart-desc">
 *     <figcaption id="chart-desc">Q1: $10M, Q2: $12M, Q3: $15M, Q4: $22M</figcaption>
 *   </figure>
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 📝 TESTING ACCESSIBILITY
 * ═══════════════════════════════════════════════════════════════
 *
 * AUTOMATED:
 * - Lighthouse (Chrome DevTools → Audits)
 * - axe DevTools browser extension
 * - eslint-plugin-jsx-a11y (React)
 * - @axe-core/react (runtime warnings in dev)
 *
 * MANUAL:
 * - Navigate with keyboard only (Tab, Enter, Escape)
 * - Use screen reader (NVDA on Windows, VoiceOver on Mac)
 * - Zoom to 200% — does layout break?
 * - Disable CSS — does content still make sense?
 *
 * 💡 INTERVIEW TIP: "I test with keyboard navigation first, then
 *    run Lighthouse/axe for automated catches, then screen reader
 *    for complex widgets."
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 📋 ACCESSIBILITY INTERVIEW SUMMARY
 * ═══════════════════════════════════════════════════════════════
 *
 * 🗣️ WHAT INTERVIEWERS WANT TO HEAR:
 * 1. "Semantic HTML gives free accessibility — use <button> not <div>"
 * 2. "ARIA is a last resort when native semantics aren't enough"
 * 3. "Every interactive element must be keyboard accessible with visible focus"
 * 4. "aria-live announces dynamic content changes to screen readers"
 * 5. "Every input needs a label — placeholder is NOT a label"
 * 6. "Color contrast must be 4.5:1 for text, never color-only information"
 * 7. "Focus trapping in modals, focus return on close"
 * 8. "I test with keyboard, Lighthouse, and screen reader"
 * 9. "tabindex=0 puts in natural order, tabindex=-1 for programmatic focus"
 */



// ══════════════════════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════════════════════
//
//                    📘 HTML — FORM ELEMENTS (DEEP DIVE)
//
// ══════════════════════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════════════════════


// --------------------------------------------------------------
// 29. HTML FORM ELEMENTS — COMPREHENSIVE INTERVIEW GUIDE
// --------------------------------------------------------------

/**
 * ═══════════════════════════════════════════════════════════════
 * 🎯 WHY FORMS MATTER IN INTERVIEWS:
 * ═══════════════════════════════════════════════════════════════
 *
 * Forms are the primary way users INPUT data. Interviewers test:
 * - Do you know native validation vs custom?
 * - Do you understand form submission (GET vs POST)?
 * - Can you make forms accessible?
 * - Do you know modern form features (FormData, constraint API)?
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 📝 INPUT TYPES — COMPLETE LIST
 * ═══════════════════════════════════════════════════════════════
 *
 * TEXT INPUTS:
 * <input type="text">       — Generic text
 * <input type="email">      — Email validation + mobile keyboard
 * <input type="password">   — Masked characters
 * <input type="tel">        — Phone keyboard on mobile
 * <input type="url">        — URL validation
 * <input type="search">     — Search with clear button (×)
 * <input type="number">     — Numeric + spinner (min, max, step)
 * <textarea>                — Multi-line text
 *
 * DATE/TIME:
 * <input type="date">       — Date picker (YYYY-MM-DD)
 * <input type="time">       — Time picker (HH:MM)
 * <input type="datetime-local"> — Date + time
 * <input type="month">      — Month/year
 * <input type="week">       — Week number
 *
 * SELECTION:
 * <input type="checkbox">   — Multiple selections
 * <input type="radio">      — Single selection (same name)
 * <select>                  — Dropdown
 * <select multiple>         — Multi-select
 * <input type="range">      — Slider (min, max, step)
 * <input type="color">      — Color picker
 *
 * FILE:
 * <input type="file">       — File upload
 * <input type="file" accept=".pdf,.doc" multiple> — Filtered
 *
 * HIDDEN/OTHER:
 * <input type="hidden">     — Not displayed, submitted with form
 * <output>                  — Calculated result (associated with inputs)
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 📝 NATIVE HTML VALIDATION (NO JS NEEDED)
 * ═══════════════════════════════════════════════════════════════
 *
 * ATTRIBUTES:
 * required        — Must not be empty
 * minlength / maxlength — Text length limits
 * min / max       — Numeric range
 * step            — Valid increments (e.g., step="0.01" for cents)
 * pattern         — Regex validation
 * type="email"    — Built-in email format check
 * type="url"      — Built-in URL format check
 *
 * EXAMPLE:
 * <input type="email" required minlength="5"
 *        pattern="[a-z]+@company\.com"
 *        title="Must be a @company.com email">
 *
 * :valid / :invalid CSS pseudo-classes for styling!
 * :user-invalid — Only shows invalid AFTER user interacts (better UX)
 *
 * CONSTRAINT VALIDATION API (JavaScript):
 * input.checkValidity()     — Returns true/false
 * input.reportValidity()    — Shows native tooltip
 * input.validity.valueMissing  — true if required and empty
 * input.validity.typeMismatch  — true if wrong type (email without @)
 * input.validity.patternMismatch — true if regex fails
 * input.validity.tooShort       — true if below minlength
 * input.setCustomValidity("Custom error message")
 */

// Custom validation with Constraint API:
function validateForm(form) {
  const email = form.querySelector('[name="email"]');
  const password = form.querySelector('[name="password"]');

  // Custom validation logic:
  if (password.value.length < 8) {
    password.setCustomValidity("Password must be at least 8 characters");
  } else if (!/[A-Z]/.test(password.value)) {
    password.setCustomValidity("Must contain an uppercase letter");
  } else {
    password.setCustomValidity(""); // Clear = valid
  }

  return form.checkValidity();
}


/**
 * ═══════════════════════════════════════════════════════════════
 * 📝 FORM DATA API & SUBMISSION
 * ═══════════════════════════════════════════════════════════════
 */

// FORM SUBMISSION METHODS:
// <form method="GET">  — Data in URL query string (visible, cacheable, limited size)
// <form method="POST"> — Data in request body (hidden, no size limit)

// MODERN: FormData API — extract form data as key-value pairs:
function handleSubmit(e) {
  e.preventDefault();
  const formData = new FormData(e.target);

  // Access individual fields:
  const email = formData.get("email");
  const files = formData.getAll("attachments"); // Multiple files

  // Convert to plain object:
  const data = Object.fromEntries(formData);

  // Send with fetch:
  fetch("/api/submit", {
    method: "POST",
    body: formData, // Automatically sets multipart/form-data
  });

  // OR send as JSON:
  fetch("/api/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

// FORM ASSOCIATION (inputs outside form):
// <form id="myForm">...</form>
// <input form="myForm" name="external"> ← Associated via form attribute

// FORMACTION (different actions per button):
// <form action="/save">
//   <button type="submit">Save</button>
//   <button type="submit" formaction="/save-draft">Save Draft</button>
// </form>


/**
 * ═══════════════════════════════════════════════════════════════
 * 📝 DATALIST — AUTOCOMPLETE SUGGESTIONS
 * ═══════════════════════════════════════════════════════════════
 *
 * Native autocomplete without JS libraries:
 *
 * <input list="browsers" name="browser">
 * <datalist id="browsers">
 *   <option value="Chrome">
 *   <option value="Firefox">
 *   <option value="Safari">
 *   <option value="Edge">
 * </datalist>
 *
 * User can type freely OR pick from suggestions.
 * Unlike <select>, any value is accepted.
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 📝 ACCESSIBLE FORM PATTERNS
 * ═══════════════════════════════════════════════════════════════
 *
 * REQUIRED FIELDS:
 * <label for="name">Name <span aria-hidden="true">*</span></label>
 * <input id="name" required aria-required="true">
 *
 * ERROR DISPLAY:
 * <label for="email">Email</label>
 * <input id="email" aria-describedby="email-error" aria-invalid="true">
 * <span id="email-error" role="alert">Invalid email format</span>
 *
 * FIELDSET FOR GROUPS:
 * <fieldset>
 *   <legend>Payment Method</legend>
 *   <label><input type="radio" name="payment" value="card"> Credit Card</label>
 *   <label><input type="radio" name="payment" value="paypal"> PayPal</label>
 * </fieldset>
 *
 * AUTOCOMPLETE ATTRIBUTE (helps password managers):
 * <input autocomplete="email">
 * <input autocomplete="new-password">
 * <input autocomplete="current-password">
 * <input autocomplete="given-name">
 * <input autocomplete="street-address">
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 📋 FORMS INTERVIEW SUMMARY
 * ═══════════════════════════════════════════════════════════════
 *
 * 🗣️ WHAT INTERVIEWERS WANT TO HEAR:
 * 1. "Use proper input types for free mobile keyboards and validation"
 * 2. "Native validation with required, pattern, min/max before custom JS"
 * 3. "FormData API extracts all form values without manual DOM queries"
 * 4. "Every input needs a label — use for/id or wrapping"
 * 5. "fieldset + legend groups related inputs for screen readers"
 * 6. "aria-invalid + aria-describedby links errors to inputs"
 * 7. "autocomplete attribute helps autofill and password managers"
 * 8. "setCustomValidity integrates custom logic with native validation UI"
 */



// ══════════════════════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════════════════════
//
//                    📘 HTML — BEST PRACTICES (DEEP DIVE)
//
// ══════════════════════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════════════════════


// --------------------------------------------------------------
// 30. HTML BEST PRACTICES — COMPREHENSIVE INTERVIEW GUIDE
// --------------------------------------------------------------

/**
 * ═══════════════════════════════════════════════════════════════
 * 📝 1. DOCUMENT STRUCTURE BEST PRACTICES
 * ═══════════════════════════════════════════════════════════════
 *
 * <!DOCTYPE html>              — Always declare (triggers standards mode)
 * <html lang="en">             — Declare language (a11y + SEO)
 * <meta charset="UTF-8">       — Character encoding (FIRST in <head>)
 * <meta name="viewport" content="width=device-width, initial-scale=1">
 *                               — Responsive design essential
 *
 * CORRECT ORDER IN <head>:
 * 1. charset meta (first — affects parsing)
 * 2. viewport meta
 * 3. title
 * 4. meta description
 * 5. Preload/prefetch hints
 * 6. CSS links
 * 7. Favicon
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 📝 2. PERFORMANCE BEST PRACTICES
 * ═══════════════════════════════════════════════════════════════
 *
 * SCRIPT LOADING:
 * <script src="app.js">          — Blocks parsing (❌ avoid)
 * <script src="app.js" defer>    — Download parallel, execute after parsing (✅)
 * <script src="app.js" async>    — Download parallel, execute immediately
 * <script type="module">         — Deferred by default
 *
 * | Attribute | Download      | Execute                | Order preserved? |
 * |-----------|---------------|------------------------|------------------|
 * | (none)    | Blocks parse  | Immediately            | Yes              |
 * | defer     | Parallel      | After DOM parsed       | Yes              |
 * | async     | Parallel      | ASAP (interrupts parse)| No               |
 * | module    | Parallel      | After DOM parsed       | Yes              |
 *
 * 💡 RULE: Use `defer` for scripts that need DOM.
 *          Use `async` for independent scripts (analytics, ads).
 *
 * RESOURCE HINTS:
 * <link rel="preload" href="font.woff2" as="font" crossorigin>
 *   — High priority: WILL be needed soon (current page)
 *
 * <link rel="prefetch" href="next-page.js">
 *   — Low priority: MIGHT be needed later (next navigation)
 *
 * <link rel="preconnect" href="https://api.example.com">
 *   — Early DNS + TCP + TLS handshake (saves 200-500ms)
 *
 * <link rel="dns-prefetch" href="https://cdn.example.com">
 *   — DNS only (lighter than preconnect)
 *
 * IMAGE OPTIMIZATION:
 * <img src="photo.jpg"
 *      srcset="photo-480.jpg 480w,
 *              photo-768.jpg 768w,
 *              photo-1200.jpg 1200w"
 *      sizes="(max-width: 600px) 480px,
 *             (max-width: 900px) 768px,
 *             1200px"
 *      loading="lazy"          — Lazy load below-fold images
 *      decoding="async"        — Don't block rendering
 *      fetchpriority="high"    — For LCP image (above fold)
 *      width="800" height="600" — Prevent CLS (layout shift)
 *      alt="Description">
 *
 * <picture> for format switching:
 * <picture>
 *   <source srcset="photo.avif" type="image/avif">
 *   <source srcset="photo.webp" type="image/webp">
 *   <img src="photo.jpg" alt="Fallback">
 * </picture>
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 📝 3. SEO BEST PRACTICES
 * ═══════════════════════════════════════════════════════════════
 *
 * <title>Primary Keyword - Brand Name</title> (50-60 chars)
 * <meta name="description" content="..."> (150-160 chars)
 * <link rel="canonical" href="https://example.com/page">
 *   — Prevent duplicate content issues
 *
 * OPEN GRAPH (social sharing):
 * <meta property="og:title" content="Page Title">
 * <meta property="og:description" content="Description">
 * <meta property="og:image" content="https://example.com/image.jpg">
 * <meta property="og:type" content="website">
 *
 * STRUCTURED DATA (JSON-LD):
 * <script type="application/ld+json">
 * {
 *   "@context": "https://schema.org",
 *   "@type": "Article",
 *   "headline": "...",
 *   "author": { "@type": "Person", "name": "..." }
 * }
 * </script>
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 📝 4. SECURITY BEST PRACTICES
 * ═══════════════════════════════════════════════════════════════
 *
 * CSP (Content Security Policy):
 * <meta http-equiv="Content-Security-Policy"
 *       content="default-src 'self'; script-src 'self' 'nonce-abc123'">
 *   — Prevents XSS by controlling what resources can load
 *
 * LINKS TO EXTERNAL SITES:
 * <a href="https://external.com" rel="noopener noreferrer" target="_blank">
 *   — noopener: prevents window.opener access (security)
 *   — noreferrer: doesn't send Referer header (privacy)
 *   — Modern browsers auto-apply noopener for target=_blank
 *
 * FORM SECURITY:
 * - Always use POST for sensitive data (not in URL)
 * - Include CSRF tokens as hidden inputs
 * - Set autocomplete="off" for sensitive fields (if needed)
 *
 * IFRAMES:
 * <iframe sandbox="allow-scripts allow-forms"
 *         src="..." title="Embedded content">
 *   — sandbox restricts iframe capabilities
 *   — Always include title for accessibility
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 📝 5. COMMON MISTAKES TO AVOID
 * ═══════════════════════════════════════════════════════════════
 *
 * ❌ <div onclick="..."> → ✅ <button onClick="...">
 * ❌ <br> for spacing → ✅ CSS margin/padding
 * ❌ <table> for layout → ✅ CSS Grid/Flexbox
 * ❌ <b>, <i> for styling → ✅ <strong> (importance), <em> (emphasis)
 *    (or just CSS font-weight/font-style if no semantic meaning)
 * ❌ Inline styles → ✅ CSS classes
 * ❌ Missing alt on <img> → ✅ alt="" (decorative) or alt="description"
 * ❌ <input> without <label> → ✅ Always pair them
 * ❌ Multiple <h1> tags → ✅ One h1 per page
 * ❌ Missing lang attribute → ✅ <html lang="en">
 * ❌ Autoplaying video/audio → ✅ muted autoplay or user-initiated
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 📋 HTML BEST PRACTICES INTERVIEW SUMMARY
 * ═══════════════════════════════════════════════════════════════
 *
 * 🗣️ WHAT INTERVIEWERS WANT TO HEAR:
 * 1. "defer for scripts that need DOM, async for independent scripts"
 * 2. "preload for critical assets, preconnect for third-party origins"
 * 3. "srcset + sizes for responsive images, lazy loading for below-fold"
 * 4. "width/height attributes prevent CLS (layout shift)"
 * 5. "CSP prevents XSS by restricting resource origins"
 * 6. "rel=noopener on external target=_blank links"
 * 7. "Use semantic elements for meaning, divs only for layout styling"
 * 8. "JSON-LD structured data helps search engines understand content"
 */



// ══════════════════════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════════════════════
//
//                    📘 CSS — FLEXBOX (DEEP DIVE)
//
// ══════════════════════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════════════════════


// --------------------------------------------------------------
// 31. CSS FLEXBOX — COMPREHENSIVE INTERVIEW GUIDE
// --------------------------------------------------------------

/**
 * ═══════════════════════════════════════════════════════════════
 * 🎯 WHAT IS FLEXBOX?
 * ═══════════════════════════════════════════════════════════════
 *
 * Flexbox is a ONE-DIMENSIONAL layout system (row OR column).
 * It distributes space and aligns items within a container.
 *
 * "Content-out" — content dictates layout size.
 * Perfect for: navbars, card rows, centering, equal height columns,
 * form layouts, footer sticking to bottom.
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 📝 FLEX CONTAINER PROPERTIES (parent)
 * ═══════════════════════════════════════════════════════════════
 *
 * display: flex;           — Establishes flex context
 * display: inline-flex;    — Inline-level flex container
 *
 * ┌─────────────────────────────────────────────────────────┐
 * │  flex-direction                                          │
 * │                                                          │
 * │  row (default)  →→→→→→→  Main axis = horizontal         │
 * │  row-reverse    ←←←←←←←  Main axis = horizontal (RTL)  │
 * │  column         ↓↓↓↓↓↓↓  Main axis = vertical          │
 * │  column-reverse ↑↑↑↑↑↑↑  Main axis = vertical (up)     │
 * └─────────────────────────────────────────────────────────┘
 *
 * flex-wrap:
 *   nowrap (default)  — All items in one line (may shrink)
 *   wrap              — Items wrap to next line
 *   wrap-reverse      — Wrap upward
 *
 * justify-content: (MAIN axis alignment)
 *   flex-start (default) — Pack to start
 *   flex-end            — Pack to end
 *   center              — Center items
 *   space-between       — Even space BETWEEN items (no edge space)
 *   space-around        — Even space around each item
 *   space-evenly        — Truly even gaps (including edges)
 *
 * align-items: (CROSS axis alignment — single line)
 *   stretch (default) — Fill container height
 *   flex-start        — Align to top
 *   flex-end          — Align to bottom
 *   center            — Center vertically
 *   baseline          — Align text baselines
 *
 * align-content: (CROSS axis — MULTI-LINE only, with flex-wrap)
 *   Same values as justify-content + stretch
 *   Only works when there are multiple lines (wrap is on)
 *
 * gap: 16px;         — Space between items (row and column)
 * row-gap: 16px;     — Vertical gap
 * column-gap: 16px;  — Horizontal gap
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 📝 FLEX ITEM PROPERTIES (children)
 * ═══════════════════════════════════════════════════════════════
 *
 * flex-grow: 0 (default)
 *   How much extra space this item should take.
 *   flex-grow: 1 → takes equal share of remaining space
 *   flex-grow: 2 → takes TWICE the extra space as grow:1 siblings
 *
 * flex-shrink: 1 (default)
 *   How much this item shrinks when container is too small.
 *   flex-shrink: 0 → NEVER shrink (fixed size)
 *
 * flex-basis: auto (default)
 *   Initial size before grow/shrink. Like width (for row) or height (for column).
 *   flex-basis: 200px → starts at 200px, then grows/shrinks
 *   flex-basis: 0    → ignores content size, distributes ALL space by grow ratio
 *
 * SHORTHAND (ALWAYS use this):
 * flex: <grow> <shrink> <basis>
 *
 * Common patterns:
 *   flex: 1         → flex: 1 1 0%  (grow equally, ignore content size)
 *   flex: auto      → flex: 1 1 auto (grow equally, respect content size)
 *   flex: none      → flex: 0 0 auto (fixed size, don't grow or shrink)
 *   flex: 0 1 auto  → DEFAULT (don't grow, can shrink)
 *
 * align-self: (override align-items for ONE item)
 *   auto | flex-start | flex-end | center | stretch | baseline
 *
 * order: 0 (default) — Reorder items visually (not in DOM)
 *   Lower values appear first. Negative values allowed.
 *   ⚠️ Breaks keyboard navigation order! Use sparingly.
 */


/**
 * ═══════════════════════════════════════════════════════════════
 * 📝 COMMON FLEXBOX PATTERNS (Interview favorites)
 * ═══════════════════════════════════════════════════════════════
 */

// 1. PERFECTLY CENTERED (holy grail of CSS):
// .container { display: flex; justify-content: center; align-items: center; min-height: 100vh; }

// 2. NAVBAR with logo left, links right:
// .nav { display: flex; justify-content: space-between; align-items: center; }

// 3. FOOTER STICKS TO BOTTOM (even with short content):
// body { display: flex; flex-direction: column; min-height: 100vh; }
// main { flex: 1; }  /* Takes all available space */
// footer { /* naturally stays at bottom */ }

// 4. EQUAL HEIGHT CARDS:
// .card-container { display: flex; gap: 16px; }
// .card { flex: 1; }  /* All same width AND height (stretch default) */

// 5. INPUT + BUTTON GROUP:
// .input-group { display: flex; }
// .input-group input { flex: 1; }  /* Input grows */
// .input-group button { flex: none; }  /* Button stays fixed */

// 6. MEDIA OBJECT (image + text):
// .media { display: flex; gap: 16px; align-items: flex-start; }
// .media img { flex: none; width: 80px; }  /* Fixed image */
// .media .content { flex: 1; }  /* Text fills rest */

// 7. RESPONSIVE WRAP (cards flow to new rows):
// .grid { display: flex; flex-wrap: wrap; gap: 16px; }
// .card { flex: 1 1 300px; }  /* Min 300px, then fill available space */


/**
 * ═══════════════════════════════════════════════════════════════
 * 📝 FLEX-GROW DEEP DIVE (Common interview trick)
 * ═══════════════════════════════════════════════════════════════
 *
 * Container: 600px wide
 * 3 items, each 100px wide (flex-basis: 100px)
 * Remaining space: 600 - 300 = 300px
 *
 * If grow ratios are 1:2:3 (total = 6):
 * Item 1: 100 + (300 × 1/6) = 150px
 * Item 2: 100 + (300 × 2/6) = 200px
 * Item 3: 100 + (300 × 3/6) = 250px
 *
 * ⚠️ flex-grow distributes REMAINING space, not total space!
 *    If flex-basis: 0 → distributes ALL space by ratio.
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 📝 FLEXBOX GOTCHAS
 * ═══════════════════════════════════════════════════════════════
 *
 * 1. min-width: auto (default for flex items)
 *    Text won't shrink below its content width!
 *    FIX: min-width: 0; or overflow: hidden;
 *
 * 2. Images stretch in flex containers
 *    FIX: align-self: flex-start; or flex: none;
 *
 * 3. margin: auto absorbs ALL extra space in flex
 *    margin-left: auto → pushes item to the right
 *    (like float:right but for flex)
 *
 * 4. flex-basis vs width:
 *    flex-basis wins over width (in flex context).
 *    If both set, flex-basis is used.
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 📋 FLEXBOX INTERVIEW SUMMARY
 * ═══════════════════════════════════════════════════════════════
 *
 * 🗣️ WHAT INTERVIEWERS WANT TO HEAR:
 * 1. "Flexbox is 1D — row or column. Use Grid for 2D layouts"
 * 2. "justify-content = main axis, align-items = cross axis"
 * 3. "flex: 1 means grow equally with basis 0 (ignore content size)"
 * 4. "flex-shrink: 0 prevents items from shrinking below basis"
 * 5. "gap is the modern replacement for margin hacks"
 * 6. "min-width: 0 fixes the overflow/shrinking issue"
 * 7. "margin: auto in flex absorbs remaining space (useful for push)"
 * 8. "flex-basis overrides width in flex context"
 */



// ══════════════════════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════════════════════
//
//                    📘 CSS — GRID (DEEP DIVE)
//
// ══════════════════════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════════════════════


// --------------------------------------------------------------
// 32. CSS GRID — COMPREHENSIVE INTERVIEW GUIDE
// --------------------------------------------------------------

/**
 * ═══════════════════════════════════════════════════════════════
 * 🎯 WHAT IS CSS GRID?
 * ═══════════════════════════════════════════════════════════════
 *
 * Grid is a TWO-DIMENSIONAL layout system (rows AND columns).
 * "Layout-in" — you define the grid first, then place items.
 *
 * WHEN TO USE:
 * - Page layouts (header, sidebar, main, footer)
 * - Complex 2D arrangements
 * - When you need items to align in both axes
 * - Dashboard layouts, image galleries
 *
 * FLEXBOX vs GRID:
 * | Scenario                    | Use       |
 * |-----------------------------|-----------|
 * | Navigation bar              | Flexbox   |
 * | Card row (wrapping)         | Flexbox   |
 * | Centering one item          | Flexbox   |
 * | Full page layout            | Grid      |
 * | Complex form layout         | Grid      |
 * | Overlapping items           | Grid      |
 * | Items must align in 2D      | Grid      |
 * | Content dictates size       | Flexbox   |
 * | Layout dictates size        | Grid      |
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 📝 GRID CONTAINER PROPERTIES (parent)
 * ═══════════════════════════════════════════════════════════════
 *
 * display: grid;
 * display: inline-grid;
 *
 * DEFINING COLUMNS & ROWS:
 *
 * grid-template-columns: 200px 1fr 1fr;
 *   → 3 columns: first 200px fixed, last two share remaining space equally
 *
 * grid-template-rows: 80px auto 60px;
 *   → 3 rows: header 80px, main auto (content-based), footer 60px
 *
 * REPEAT:
 * grid-template-columns: repeat(3, 1fr);          → 3 equal columns
 * grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
 *   → Responsive! As many columns as fit, min 250px each
 *
 * auto-fill vs auto-fit:
 *   auto-fill: Creates empty tracks (columns remain even if no content)
 *   auto-fit:  Collapses empty tracks (items stretch to fill)
 *
 *   PRACTICAL DIFFERENCE:
 *   With 2 items in a 4-column grid:
 *   auto-fill: [item][item][empty][empty] — 4 columns maintained
 *   auto-fit:  [item-stretched][item-stretched] — empty tracks collapse
 *
 * FR UNIT:
 *   1fr = 1 fraction of available space
 *   grid-template-columns: 1fr 2fr 1fr;
 *   → Middle column gets TWICE the space
 *
 * MINMAX:
 *   grid-template-columns: minmax(200px, 1fr) 2fr;
 *   → First column: min 200px, max 1fr
 *
 * GAP:
 *   gap: 20px;        → Row and column gap
 *   row-gap: 20px;
 *   column-gap: 16px;
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 📝 PLACING ITEMS ON THE GRID
 * ═══════════════════════════════════════════════════════════════
 *
 * By default, items auto-place into the next available cell.
 * You can explicitly place items:
 *
 * grid-column: 1 / 3;     → Spans from column line 1 to 3 (2 columns)
 * grid-column: 1 / -1;    → Spans entire row (first to last line)
 * grid-column: span 2;    → Spans 2 columns from current position
 *
 * grid-row: 1 / 3;        → Spans rows 1-2
 * grid-row: span 3;       → Spans 3 rows
 *
 * SHORTHAND:
 * grid-area: row-start / col-start / row-end / col-end;
 * grid-area: 1 / 1 / 3 / 4;  → Rows 1-2, Columns 1-3
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 📝 NAMED GRID AREAS (Powerful!)
 * ═══════════════════════════════════════════════════════════════
 *
 * .container {
 *   display: grid;
 *   grid-template-columns: 200px 1fr 200px;
 *   grid-template-rows: 80px 1fr 60px;
 *   grid-template-areas:
 *     "header  header  header"
 *     "sidebar main   aside"
 *     "footer  footer  footer";
 *   gap: 16px;
 *   min-height: 100vh;
 * }
 * .header  { grid-area: header; }
 * .sidebar { grid-area: sidebar; }
 * .main    { grid-area: main; }
 * .aside   { grid-area: aside; }
 * .footer  { grid-area: footer; }
 *
 * USE "." FOR EMPTY CELLS:
 * grid-template-areas:
 *   "header header header"
 *   ". main aside"
 *   "footer footer footer";
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 📝 ALIGNMENT IN GRID
 * ═══════════════════════════════════════════════════════════════
 *
 * ON CONTAINER (align all items):
 * justify-items: start | end | center | stretch (default)
 *   → Aligns items HORIZONTALLY within their grid cell
 *
 * align-items: start | end | center | stretch (default)
 *   → Aligns items VERTICALLY within their grid cell
 *
 * place-items: center center;  → Shorthand (align / justify)
 *
 * justify-content: (when grid is smaller than container)
 * align-content:   (same as flexbox)
 *
 * ON ITEM (override for single item):
 * justify-self: start | end | center | stretch
 * align-self: start | end | center | stretch
 * place-self: center center;
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 📝 RESPONSIVE GRID PATTERNS
 * ═══════════════════════════════════════════════════════════════
 */

// RESPONSIVE CARD GRID (no media queries!):
// .grid {
//   display: grid;
//   grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
//   gap: 24px;
// }
// → Cards are min 280px, max fill available space
// → Automatically wraps to fewer columns on small screens

// RESPONSIVE WITH NAMED AREAS + MEDIA QUERY:
// .layout {
//   display: grid;
//   grid-template-areas:
//     "header"
//     "main"
//     "sidebar"
//     "footer";
//   grid-template-columns: 1fr;
// }
// @media (min-width: 768px) {
//   .layout {
//     grid-template-columns: 250px 1fr;
//     grid-template-areas:
//       "header header"
//       "sidebar main"
//       "footer footer";
//   }
// }

// MASONRY-LIKE (equal width, variable height):
// .masonry {
//   display: grid;
//   grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
//   grid-auto-rows: 10px;
// }
// .item-tall { grid-row: span 20; }
// .item-short { grid-row: span 10; }


/**
 * ═══════════════════════════════════════════════════════════════
 * 📝 SUBGRID (Modern — well-supported in 2024+)
 * ═══════════════════════════════════════════════════════════════
 *
 * A nested grid that inherits track sizing from the parent grid.
 * Allows child elements to align with the parent's grid lines.
 *
 * .parent { display: grid; grid-template-columns: repeat(3, 1fr); }
 * .child  {
 *   grid-column: 1 / -1;
 *   display: grid;
 *   grid-template-columns: subgrid; ← Inherits parent's columns!
 * }
 *
 * USE CASE: Card layouts where title, content, and footer
 * must align across cards (regardless of content length).
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 📝 GRID vs FLEXBOX — COMPLETE COMPARISON
 * ═══════════════════════════════════════════════════════════════
 *
 * | Feature              | Flexbox              | Grid                  |
 * |----------------------|----------------------|-----------------------|
 * | Dimensions           | 1D (row OR column)   | 2D (rows AND columns) |
 * | Approach             | Content-out          | Layout-in             |
 * | Item sizing          | Content-based        | Track-based           |
 * | Overlap              | Not native           | Easy (grid-area)      |
 * | Named areas          | ❌ No               | ✅ Yes                 |
 * | Auto-placement       | Linear only          | 2D auto-placement     |
 * | Wrapping             | flex-wrap            | Built-in with repeat  |
 * | Browser support      | Excellent            | Excellent             |
 *
 * 💡 THEY'RE COMPLEMENTARY:
 * Grid for the page layout, Flexbox for component internals.
 * A grid item can also be a flex container!
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 📋 CSS GRID INTERVIEW SUMMARY
 * ═══════════════════════════════════════════════════════════════
 *
 * 🗣️ WHAT INTERVIEWERS WANT TO HEAR:
 * 1. "Grid is 2D, Flexbox is 1D — use Grid for page layouts"
 * 2. "repeat(auto-fit, minmax(250px, 1fr)) = responsive without media queries"
 * 3. "auto-fill keeps empty tracks, auto-fit collapses them"
 * 4. "fr unit distributes available space proportionally"
 * 5. "Named grid-template-areas make layouts readable and maintainable"
 * 6. "grid-column: 1 / -1 spans the entire row"
 * 7. "subgrid lets nested grids inherit parent track sizes"
 * 8. "Grid and Flexbox are complementary — Grid for layout, Flex for components"
 */



// ══════════════════════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════════════════════
//
//                    📘 CSS — POSITIONING (DEEP DIVE)
//
// ══════════════════════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════════════════════


// --------------------------------------------------------------
// 33. CSS POSITIONING — COMPREHENSIVE INTERVIEW GUIDE
// --------------------------------------------------------------

/**
 * ═══════════════════════════════════════════════════════════════
 * 🎯 POSITION VALUES — COMPLETE BREAKDOWN
 * ═══════════════════════════════════════════════════════════════
 *
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ STATIC (default)                                                     │
 * ├─────────────────────────────────────────────────────────────────────┤
 * │ • Normal document flow                                               │
 * │ • top/right/bottom/left have NO effect                               │
 * │ • z-index has NO effect                                              │
 * │ • Every element is static unless you specify otherwise               │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ RELATIVE                                                             │
 * ├─────────────────────────────────────────────────────────────────────┤
 * │ • Element stays in normal flow (space is preserved)                  │
 * │ • Offset from its ORIGINAL position (top/left/etc.)                  │
 * │ • Creates a new STACKING CONTEXT (if z-index set)                    │
 * │ • Creates CONTAINING BLOCK for absolute children                     │
 * │ • Neighboring elements don't move (they see original position)       │
 * │                                                                       │
 * │ USE: Containing block for absolute children, small nudges            │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ ABSOLUTE                                                             │
 * ├─────────────────────────────────────────────────────────────────────┤
 * │ • REMOVED from normal flow (no space taken)                          │
 * │ • Positioned relative to nearest POSITIONED ancestor                 │
 * │   (ancestor with position: relative/absolute/fixed/sticky)           │
 * │ • If no positioned ancestor → relative to <html> (initial block)     │
 * │ • top/right/bottom/left offset from containing block                 │
 * │ • Can use all four to stretch: top:0; right:0; bottom:0; left:0      │
 * │                                                                       │
 * │ USE: Tooltips, dropdowns, overlays, badges, floating elements        │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ FIXED                                                                │
 * ├─────────────────────────────────────────────────────────────────────┤
 * │ • REMOVED from normal flow                                           │
 * │ • Positioned relative to the VIEWPORT (stays while scrolling)        │
 * │ • EXCEPTION: If ancestor has transform, filter, or perspective,      │
 * │   the element is positioned relative to THAT ancestor instead!       │
 * │ • Always creates a new stacking context                              │
 * │                                                                       │
 * │ USE: Sticky headers, floating buttons, modal backdrops               │
 * │ ⚠️ Mobile issues: fixed elements + virtual keyboard = problems       │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ STICKY                                                               │
 * ├─────────────────────────────────────────────────────────────────────┤
 * │ • HYBRID: relative until scroll threshold, then fixed                │
 * │ • Stays in flow until it hits the threshold (e.g., top: 0)           │
 * │ • Then "sticks" to that position while parent is visible             │
 * │ • Stops sticking when parent scrolls out of view                     │
 * │ • Requires top/bottom/left/right to define stick point               │
 * │ • Parent must NOT have overflow: hidden/auto/scroll                  │
 * │                                                                       │
 * │ USE: Section headers, table headers, sidebar navigation              │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 📝 CONTAINING BLOCK — CRUCIAL CONCEPT
 * ═══════════════════════════════════════════════════════════════
 *
 * "Positioned relative to nearest positioned ancestor"
 *
 * position: static    → Containing block = nearest block-level ancestor
 * position: relative  → Containing block = itself
 * position: absolute  → Nearest ancestor with position ≠ static
 * position: fixed     → Viewport (or ancestor with transform)
 * position: sticky    → Nearest scrolling ancestor
 *
 * COMMON PATTERN:
 * .parent { position: relative; }  ← Creates containing block
 * .child  { position: absolute; top: 0; right: 0; }  ← Positioned within parent
 */

// BADGE ON CARD:
// .card { position: relative; }
// .badge { position: absolute; top: -8px; right: -8px; }

// FULL-SCREEN OVERLAY:
// .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); }
// (`inset: 0` = top:0; right:0; bottom:0; left:0)

// CENTERING WITH ABSOLUTE (old method, still useful):
// .centered {
//   position: absolute;
//   top: 50%; left: 50%;
//   transform: translate(-50%, -50%);
// }

// STICKY HEADER:
// .section-header {
//   position: sticky;
//   top: 0;
//   background: white;
//   z-index: 10;
// }


/**
 * ═══════════════════════════════════════════════════════════════
 * 📝 Z-INDEX & STACKING CONTEXTS
 * ═══════════════════════════════════════════════════════════════
 *
 * z-index controls STACKING ORDER (front-to-back).
 * Only works on POSITIONED elements (not static) or flex/grid items.
 *
 * STACKING CONTEXT — an isolated z-index universe.
 * z-index values are only compared WITHIN the same stacking context.
 * A child can NEVER appear above its parent's stacking context boundary.
 *
 * WHAT CREATES A NEW STACKING CONTEXT:
 * - position: relative/absolute/fixed/sticky + z-index set
 * - opacity < 1
 * - transform (any value)
 * - filter (any value)
 * - will-change: transform/opacity
 * - isolation: isolate (explicit creation)
 * - mix-blend-mode
 * - contain: layout/paint
 *
 * DEFAULT STACKING ORDER (back to front):
 * 1. Root background
 * 2. Negative z-index elements
 * 3. Non-positioned block elements (in order)
 * 4. Non-positioned floats
 * 5. Non-positioned inline elements
 * 6. Positioned elements with z-index: 0 or auto
 * 7. Positive z-index elements (higher = more front)
 */

// ❓ COMMON INTERVIEW QUESTION: "Why isn't my z-index working?"
//
// ANSWER: Usually because:
// 1. Element is position: static (z-index needs positioned)
// 2. Parent creates a stacking context with lower z-index
//    → Child's z-index:9999 is stuck inside parent's context
// 3. FIX: Use isolation: isolate on the parent you want
//    as the stacking boundary

// EXAMPLE OF STACKING CONTEXT TRAP:
// .sidebar { position: relative; z-index: 1; }
// .modal   { position: fixed; z-index: 9999; }
// .sidebar .dropdown { position: absolute; z-index: 100; }
// → The dropdown (z:100) is INSIDE sidebar (z:1)
// → Modal (z:9999) will ALWAYS be above the dropdown
// → Because sidebar's stacking context caps its children

// 💡 BEST PRACTICE: Use a z-index scale system:
// --z-dropdown: 100;
// --z-sticky: 200;
// --z-modal-backdrop: 300;
// --z-modal: 400;
// --z-tooltip: 500;
// --z-toast: 600;


/**
 * ═══════════════════════════════════════════════════════════════
 * 📝 INSET PROPERTY (Modern shorthand)
 * ═══════════════════════════════════════════════════════════════
 *
 * inset: 0;  → top:0; right:0; bottom:0; left:0;
 * inset: 10px 20px;  → top/bottom: 10px, right/left: 20px
 * inset: 10px 20px 30px 40px;  → top right bottom left
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 📝 STICKY GOTCHAS
 * ═══════════════════════════════════════════════════════════════
 *
 * 1. Parent has overflow: hidden/auto/scroll → sticky BREAKS
 *    WHY: Sticky sticks within its scroll container.
 *    If parent clips overflow, that becomes the scroll boundary.
 *
 * 2. Parent has no height → sticky has nothing to stick within
 *    FIX: Ensure parent has enough height for scrolling
 *
 * 3. Sticky won't work without top/bottom value specified
 *    Must declare WHERE it sticks: top: 0;
 *
 * 4. Sticky element must not be the ONLY child
 *    It needs siblings to create scroll distance
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 📋 POSITIONING INTERVIEW SUMMARY
 * ═══════════════════════════════════════════════════════════════
 *
 * 🗣️ WHAT INTERVIEWERS WANT TO HEAR:
 * 1. "static = default, no positioning. relative = offset from original spot"
 * 2. "absolute is removed from flow, positioned to nearest positioned ancestor"
 * 3. "fixed = viewport-relative, BUT breaks if ancestor has transform"
 * 4. "sticky = relative until threshold, then sticks during scroll"
 * 5. "z-index only works on positioned elements (or flex/grid items)"
 * 6. "Stacking contexts are isolated — child can't escape parent's z-index"
 * 7. "transform, opacity<1, filter all create new stacking contexts"
 * 8. "Sticky fails if any ancestor has overflow:hidden/auto"
 * 9. "Use isolation:isolate to explicitly create stacking context boundaries"
 */



// ══════════════════════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════════════════════
//
//                    📘 CSS — RESPONSIVE DESIGN (DEEP DIVE)
//
// ══════════════════════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════════════════════


// --------------------------------------------------------------
// 34. RESPONSIVE DESIGN — COMPREHENSIVE INTERVIEW GUIDE
// --------------------------------------------------------------

/**
 * ═══════════════════════════════════════════════════════════════
 * 🎯 WHAT IS RESPONSIVE DESIGN?
 * ═══════════════════════════════════════════════════════════════
 *
 * Making websites look and work well on ALL screen sizes
 * (mobile, tablet, desktop, large displays) without separate
 * codebases for each.
 *
 * THREE PILLARS:
 * 1. Fluid grids (relative units, flexible layouts)
 * 2. Flexible media (images/video scale with container)
 * 3. Media queries (apply styles based on viewport conditions)
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 📝 THE VIEWPORT META TAG (CRITICAL)
 * ═══════════════════════════════════════════════════════════════
 *
 * <meta name="viewport" content="width=device-width, initial-scale=1">
 *
 * WITHOUT this: Mobile browsers render at ~980px then shrink (tiny text!)
 * WITH this: Width matches device width, 1:1 scale
 *
 * ⚠️ NEVER use maximum-scale=1 or user-scalable=no
 *    — breaks zoom for accessibility (WCAG violation)
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 📝 CSS UNITS FOR RESPONSIVE DESIGN
 * ═══════════════════════════════════════════════════════════════
 *
 * ABSOLUTE:
 * px — Fixed, predictable (use for borders, shadows, small values)
 *
 * RELATIVE TO FONT:
 * em  — Relative to PARENT's font-size (compounds/cascades!)
 * rem — Relative to ROOT (:root/html) font-size (predictable)
 *
 * RELATIVE TO VIEWPORT:
 * vw   — 1% of viewport WIDTH      (100vw = full width)
 * vh   — 1% of viewport HEIGHT     (100vh = full height)
 * vmin — 1% of the SMALLER dimension
 * vmax — 1% of the LARGER dimension
 * dvh  — Dynamic viewport height (accounts for mobile URL bar!)
 * svh  — Small viewport height (URL bar visible)
 * lvh  — Large viewport height (URL bar hidden)
 *
 * RELATIVE TO CONTAINER:
 * %    — Relative to parent element
 * cqw  — 1% of container query width (new!)
 * cqh  — 1% of container query height
 *
 * BEST PRACTICES:
 * - font-size: rem (predictable scaling)
 * - padding/margin: rem or em (scales with text)
 * - width: %, vw, or fr (fluid)
 * - max-width: px or ch (readable line length)
 * - height: avoid fixed! Use min-height or auto
 * - gap: rem (consistent spacing)
 *
 * 💡 "ch" UNIT — width of the "0" character.
 * max-width: 65ch; → Limits text to ~65 characters per line (optimal reading)
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 📝 MEDIA QUERIES
 * ═══════════════════════════════════════════════════════════════
 *
 * MOBILE-FIRST (recommended):
 * Write base styles for mobile, then add complexity:
 *
 * .card { padding: 16px; }                         ← Mobile (default)
 * @media (min-width: 768px) { .card { padding: 24px; } }  ← Tablet+
 * @media (min-width: 1024px) { .card { padding: 32px; } } ← Desktop+
 *
 * DESKTOP-FIRST (legacy):
 * @media (max-width: 768px) { ... }  ← Override for smaller screens
 *
 * WHY MOBILE-FIRST:
 * - Smaller CSS for mobile (fewer overrides)
 * - Forces content-first thinking
 * - Progressive enhancement
 * - Mobile is the constrained environment
 *
 * COMMON BREAKPOINTS (not strict rules):
 * 480px  — Small phones
 * 768px  — Tablets
 * 1024px — Small laptops
 * 1200px — Desktops
 * 1440px — Large desktops
 *
 * 💡 DON'T design to specific device widths!
 *    Add breakpoints where YOUR DESIGN breaks.
 *
 * MODERN MEDIA QUERIES:
 * @media (hover: hover) { ... }         ← Device has hover capability
 * @media (pointer: fine) { ... }        ← Precise pointer (mouse)
 * @media (pointer: coarse) { ... }      ← Imprecise (touch)
 * @media (prefers-color-scheme: dark) { ... }  ← Dark mode
 * @media (prefers-reduced-motion: reduce) { ... } ← Reduce animations
 * @media (orientation: landscape) { ... }
 * @media (min-resolution: 2dppx) { ... } ← Retina/HiDPI screens
 *
 * RANGE SYNTAX (Modern CSS):
 * @media (width >= 768px) { ... }      ← Cleaner than min-width
 * @media (768px <= width <= 1024px) { ... }  ← Range
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 📝 CONTAINER QUERIES (GAME CHANGER — 2023+)
 * ═══════════════════════════════════════════════════════════════
 *
 * Media queries respond to VIEWPORT size.
 * Container queries respond to PARENT/CONTAINER size.
 *
 * WHY: A card component should adapt to ITS container,
 * not the viewport. Same card in sidebar (narrow) vs main (wide)
 * should look different.
 *
 * .card-wrapper {
 *   container-type: inline-size;  ← Opt-in to container queries
 *   container-name: card;         ← Optional name
 * }
 *
 * @container card (min-width: 400px) {
 *   .card { flex-direction: row; }
 * }
 * @container card (max-width: 399px) {
 *   .card { flex-direction: column; }
 * }
 *
 * 💡 INTERVIEW TIP: "Container queries make truly reusable components.
 *    A card adapts to where it's placed, not the screen size."
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 📝 RESPONSIVE IMAGES
 * ═══════════════════════════════════════════════════════════════
 *
 * 1. FLUID IMAGES (basic):
 *    img { max-width: 100%; height: auto; }
 *
 * 2. SRCSET (resolution switching):
 *    <img srcset="img-320.jpg 320w,
 *                 img-640.jpg 640w,
 *                 img-1200.jpg 1200w"
 *         sizes="(max-width: 600px) 320px,
 *                (max-width: 900px) 640px,
 *                1200px"
 *         src="img-640.jpg" alt="...">
 *    Browser picks best image based on viewport + pixel density.
 *
 * 3. PICTURE (art direction):
 *    <picture>
 *      <source media="(max-width: 600px)" srcset="mobile-crop.jpg">
 *      <source media="(max-width: 900px)" srcset="tablet-crop.jpg">
 *      <img src="desktop.jpg" alt="...">
 *    </picture>
 *    → Different images for different viewports (not just sizes)
 *
 * 4. ASPECT-RATIO (prevent CLS):
 *    img { aspect-ratio: 16/9; width: 100%; object-fit: cover; }
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 📝 RESPONSIVE TYPOGRAPHY
 * ═══════════════════════════════════════════════════════════════
 *
 * FLUID TYPE (scales smoothly):
 * font-size: clamp(1rem, 2.5vw, 2rem);
 *   → Min 1rem, preferred 2.5vw, max 2rem
 *   → Scales between min and max based on viewport
 *
 * clamp(MIN, PREFERRED, MAX) — THE responsive tool:
 * width: clamp(300px, 50%, 800px);
 * padding: clamp(1rem, 3vw, 3rem);
 * gap: clamp(16px, 2vw, 32px);
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 📝 RESPONSIVE PATTERNS
 * ═══════════════════════════════════════════════════════════════
 *
 * 1. THE STACK (vertical flow with consistent spacing):
 *    .stack > * + * { margin-top: 1.5rem; }
 *
 * 2. THE SIDEBAR:
 *    .with-sidebar { display: flex; flex-wrap: wrap; gap: 1rem; }
 *    .sidebar { flex-basis: 20rem; flex-grow: 1; }
 *    .content { flex-basis: 0; flex-grow: 999; min-width: 50%; }
 *
 * 3. THE SWITCHER (row until too narrow, then column):
 *    .switcher { display: flex; flex-wrap: wrap; gap: 1rem; }
 *    .switcher > * { flex-grow: 1; flex-basis: calc((30rem - 100%) * 999); }
 *    → If container < 30rem: items go vertical
 *    → If container >= 30rem: items stay horizontal
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 📋 RESPONSIVE DESIGN INTERVIEW SUMMARY
 * ═══════════════════════════════════════════════════════════════
 *
 * 🗣️ WHAT INTERVIEWERS WANT TO HEAR:
 * 1. "Mobile-first: base styles for mobile, min-width media queries to add"
 * 2. "Viewport meta tag is essential — without it mobile renders at 980px"
 * 3. "rem for font-size, % or fr for widths, avoid fixed heights"
 * 4. "clamp() creates fluid values that scale between min and max"
 * 5. "Container queries let components respond to their container, not viewport"
 * 6. "srcset + sizes lets browser pick optimal image"
 * 7. "dvh replaces vh — accounts for mobile browser UI"
 * 8. "Add breakpoints where your design breaks, not at device widths"
 * 9. "prefers-reduced-motion for accessibility, prefers-color-scheme for dark mode"
 */



// ══════════════════════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════════════════════
//
//                    📘 CSS — SPECIFICITY (DEEP DIVE)
//
// ══════════════════════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════════════════════


// --------------------------------------------------------------
// 35. CSS SPECIFICITY — COMPREHENSIVE INTERVIEW GUIDE
// --------------------------------------------------------------

/**
 * ═══════════════════════════════════════════════════════════════
 * 🎯 WHAT IS SPECIFICITY?
 * ═══════════════════════════════════════════════════════════════
 *
 * Specificity is the algorithm browsers use to decide WHICH CSS
 * rule wins when multiple rules target the same element.
 * It's NOT about order (though order breaks ties).
 *
 * SPECIFICITY IS CALCULATED AS A TUPLE: (A, B, C)
 *
 * A = ID selectors                    (#header, #nav)
 * B = Class/attribute/pseudo-class    (.active, [type="text"], :hover)
 * C = Element/pseudo-element          (div, p, ::before, ::after)
 *
 * COMPARISON: Read left to right, higher value wins.
 * (1,0,0) beats (0,99,99)  — ONE id beats ANY number of classes!
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 📝 SPECIFICITY VALUES
 * ═══════════════════════════════════════════════════════════════
 *
 * | Selector                        | Specificity | (A,B,C) |
 * |---------------------------------|-------------|---------|
 * | *                               | 0           | (0,0,0) |
 * | div                             | 1           | (0,0,1) |
 * | div p                           | 2           | (0,0,2) |
 * | .class                          | 10          | (0,1,0) |
 * | div.class                       | 11          | (0,1,1) |
 * | .class1.class2                  | 20          | (0,2,0) |
 * | #id                             | 100         | (1,0,0) |
 * | #id .class                      | 110         | (1,1,0) |
 * | #id .class div                  | 111         | (1,1,1) |
 * | style=""                        | 1000        | Inline  |
 * | !important                      | ∞           | Overrides all |
 *
 *
 * WHAT DOES NOT AFFECT SPECIFICITY:
 * - Universal selector (*)          → (0,0,0)
 * - Combinators (+, >, ~, space)    → (0,0,0)
 * - :not() itself                   → (0,0,0) but its CONTENTS count
 * - :is() / :where()               → Different rules (see below)
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 📝 MODERN SELECTORS & SPECIFICITY
 * ═══════════════════════════════════════════════════════════════
 *
 * :is() — Takes specificity of its MOST SPECIFIC argument
 *   :is(#id, .class, div) → specificity = (1,0,0) — the #id wins!
 *   :is(.a, .b) div       → (0,1,1)
 *
 * :where() — ALWAYS zero specificity (0,0,0)
 *   :where(#id, .class) div → (0,0,1) — id contributes NOTHING!
 *   USE: Resettable base styles, utility libraries
 *
 * :not() — Takes specificity of its argument
 *   :not(.active) → (0,1,0)  — same as .active
 *   :not(#id)     → (1,0,0)  — same as #id
 *
 * :has() — Takes specificity of its argument
 *   div:has(.child) → (0,1,1)
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 📝 THE CASCADE (Full Resolution Order)
 * ═══════════════════════════════════════════════════════════════
 *
 * When multiple rules match, the browser resolves by:
 *
 * 1. ORIGIN & IMPORTANCE (highest priority):
 *    - User agent !important
 *    - User !important
 *    - Author !important        ← Your CSS with !important
 *    - Author @layer'd normal   ← CSS Layers
 *    - Author normal            ← Your CSS
 *    - User normal
 *    - User agent normal        ← Browser defaults
 *
 * 2. SPECIFICITY (within same origin/importance):
 *    (A,B,C) comparison
 *
 * 3. ORDER OF APPEARANCE (tie-breaker):
 *    Later rule wins if specificity is equal
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 📝 CASCADE LAYERS (@layer — Modern CSS)
 * ═══════════════════════════════════════════════════════════════
 *
 * Layers add a new level of control between origin and specificity.
 * Later layers have higher priority (regardless of specificity!).
 *
 * @layer reset, base, components, utilities;
 *
 * @layer reset {
 *   * { margin: 0; box-sizing: border-box; }  ← Lowest priority
 * }
 * @layer base {
 *   h1 { font-size: 2rem; }
 * }
 * @layer components {
 *   .card h1 { font-size: 1.5rem; }  ← Beats base even though same specificity
 * }
 * @layer utilities {
 *   .text-xl { font-size: 2.5rem !important; }  ← Highest priority
 * }
 *
 * UN-LAYERED CSS beats ALL layers (highest implicit priority).
 *
 * 💡 INTERVIEW TIP: "Cascade Layers solve the specificity wars.
 *    Utilities layer always wins over components regardless of specificity."
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 📝 !important — WHEN AND WHEN NOT
 * ═══════════════════════════════════════════════════════════════
 *
 * ❌ AVOID for regular styling — creates maintenance nightmares
 * ❌ NEVER in component libraries — impossible for consumers to override
 *
 * ✅ VALID USES:
 * - Utility classes: .hidden { display: none !important; }
 * - Override third-party CSS you can't control
 * - Accessibility overrides (high contrast, large text)
 *
 * TO OVERRIDE !important, you need:
 * - A higher-specificity rule with !important
 * - OR later in source order with equal specificity + !important
 * - OR an inline style with !important
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 📝 SPECIFICITY INTERVIEW QUESTIONS
 * ═══════════════════════════════════════════════════════════════
 */

// ❓ QUESTION: Which color wins?
// <div id="app">
//   <p class="text highlight">Hello</p>
// </div>
//
// #app p        { color: red; }     → (1,0,1) = 101
// .text.highlight { color: blue; }  → (0,2,0) = 020
// div p.text    { color: green; }   → (0,1,2) = 012
//
// ANSWER: RED wins — (1,0,1) > (0,2,0) > (0,1,2)
// One ID always beats any combination of classes!

// ❓ QUESTION: How to override without !important?
// Problem: Third-party CSS has #header .nav a { color: blue; }
// You need to change it to red.
//
// SOLUTIONS (in order of preference):
// 1. Match or exceed specificity: #header .nav a { color: red; }
// 2. Add extra specificity: #header .nav a.active { color: red; }
// 3. Double the selector: #header#header .nav a { color: red; } (valid!)
// 4. Inline style (React: style={{ color: 'red' }})
// 5. Last resort: !important


/**
 * ═══════════════════════════════════════════════════════════════
 * 📝 SPECIFICITY BEST PRACTICES
 * ═══════════════════════════════════════════════════════════════
 *
 * 1. Keep specificity LOW and FLAT:
 *    ❌ #sidebar .nav ul li a.active { }  → (1,1,4) = too specific!
 *    ✅ .nav-link--active { }             → (0,1,0) = easy to override
 *
 * 2. BEM naming convention avoids specificity wars:
 *    .block__element--modifier { }  → Always (0,1,0)
 *    .card__title--highlighted { }
 *    Never need to nest or use IDs
 *
 * 3. Use :where() for overridable base styles:
 *    :where(.btn) { padding: 8px 16px; }  → (0,0,0)
 *    .btn-large { padding: 12px 24px; }   → (0,1,0) easily wins
 *
 * 4. Use @layer for architecture-level control:
 *    @layer base, components, utilities;
 *
 * 5. Never use IDs for styling (save for JS hooks):
 *    #header → (1,0,0) — way too specific for styling
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 📋 CSS SPECIFICITY INTERVIEW SUMMARY
 * ═══════════════════════════════════════════════════════════════
 *
 * 🗣️ WHAT INTERVIEWERS WANT TO HEAR:
 * 1. "Specificity is (ID, Class, Element) — IDs always beat classes"
 * 2. "Equal specificity → last rule in source order wins"
 * 3. "!important overrides everything but should be avoided in components"
 * 4. ":where() has zero specificity — great for overridable base styles"
 * 5. ":is() takes the specificity of its most specific argument"
 * 6. "Cascade Layers (@layer) add priority control above specificity"
 * 7. "BEM keeps specificity flat at (0,1,0) — avoids wars"
 * 8. "Universal selector *, combinators, and :where() have no specificity"
 * 9. "Inline styles beat all selectors, !important beats inline"
 * 10. "The full cascade: Origin → Layers → Specificity → Source Order"
 */



// --------------------------------------------------------------
// 36. MAP vs OBJECT & SPREAD vs OBJECT.ASSIGN() — DEEP DIVE
// --------------------------------------------------------------

/**
 * ═══════════════════════════════════════════════════════════════
 * 🗺️  MAP vs OBJECT — COMPLETE COMPARISON
 * ═══════════════════════════════════════════════════════════════
 *
 * | Feature              | Object                        | Map                          |
 * |----------------------|-------------------------------|------------------------------|
 * | Key types            | String & Symbol ONLY          | ANY type (objects, functions, |
 * |                      |                               | numbers, NaN, etc.)          |
 * | Key order            | Mostly insertion* (see below) | ALWAYS insertion order       |
 * | Size                 | Object.keys(obj).length       | map.size (O(1))              |
 * | Performance          | Optimized for static shape    | Optimized for frequent       |
 * |                      |                               | add/delete operations        |
 * | Iteration            | for...in, Object.keys/values  | for...of, .forEach()         |
 * |                      | Object.entries()              | (directly iterable)          |
 * | Prototype pollution  | ✅ Has prototype chain        | ❌ No inherited keys         |
 * | Default keys         | toString, hasOwnProperty etc  | Empty (clean)                |
 * | Serialization        | ✅ JSON.stringify/parse       | ❌ Must convert manually     |
 * | Destructuring        | ✅ const { a, b } = obj      | ❌ Not directly              |
 * | Spread               | ✅ { ...obj }                | ❌ Must use [...map]         |
 * | Memory               | Higher overhead per entry     | More efficient for large     |
 * |                      | (hidden classes, shapes)      | collections                  |
 *
 *
 * *Object key order (spec):
 *  1. Integer-like keys in ascending order ("1", "2", "10")
 *  2. String keys in insertion order
 *  3. Symbol keys in insertion order
 *  ⚠️ Integer keys are SORTED, not insertion-ordered!
 */

// ═══════════════════════════════════════════════════════════════
// OBJECT KEY ORDER GOTCHA:
const obj1 = {};
obj1["b"] = 1;
obj1["2"] = 2;
obj1["a"] = 3;
obj1["1"] = 4;
console.log(Object.keys(obj1)); // ["1", "2", "b", "a"]
// Integer keys FIRST (sorted), then string keys (insertion order)

// MAP ALWAYS PRESERVES INSERTION ORDER:
const map1 = new Map();
map1.set("b", 1);
map1.set(2, 2);     // Key is NUMBER 2, not string "2"
map1.set("a", 3);
map1.set(1, 4);
console.log([...map1.keys()]); // ["b", 2, "a", 1] — exact insertion order


// ═══════════════════════════════════════════════════════════════
// ANY KEY TYPE (Map's killer feature):
const map2 = new Map();

// Object as key — impossible with plain objects
const userA = { id: 1, name: "Alice" };
const userB = { id: 2, name: "Bob" };
map2.set(userA, { permissions: ["read", "write"] });
map2.set(userB, { permissions: ["read"] });
map2.get(userA); // { permissions: ["read", "write"] }

// Function as key:
const handler = () => {};
map2.set(handler, "click handler metadata");

// DOM element as key (great for storing element metadata):
// map.set(document.querySelector('#btn'), { clicks: 0 });

// NaN as key (NaN === NaN is false, but Map treats them as same key!):
map2.set(NaN, "not a number");
map2.get(NaN); // "not a number" ✅

// With Object, everything becomes a STRING key:
const badObj = {};
badObj[userA] = "alice data";
badObj[userB] = "bob data";
console.log(Object.keys(badObj)); // ["[object Object]"] — COLLISION!
// Both objects coerce to same string key → data lost!


// ═══════════════════════════════════════════════════════════════
// PROTOTYPE POLLUTION (Object's weakness):

// Object has inherited keys from prototype:
const plainObj = {};
console.log("toString" in plainObj);       // true — inherited!
console.log("constructor" in plainObj);    // true — inherited!

// Dangerous with user input:
const config = {};
// If user sends key "constructor" or "__proto__", it can break things:
// config["__proto__"] = { hacked: true }; // Prototype pollution attack!

// Map has NO inherited keys — safe for arbitrary user input:
const safeConfig = new Map();
safeConfig.set("constructor", "user value"); // No conflict ✅
safeConfig.set("__proto__", "safe");         // Just a key ✅

// FIX for Object: Use Object.create(null) — no prototype:
const nullProtoObj = Object.create(null);
console.log("toString" in nullProtoObj); // false — clean!


// ═══════════════════════════════════════════════════════════════
// PERFORMANCE — WHEN MAP WINS:

// Frequent additions/deletions — Map is optimized for this:
const cache = new Map();
function memoized(key) {
  if (cache.has(key)) return cache.get(key);
  const result = expensiveWork(key);
  cache.set(key, result);
  if (cache.size > 1000) {
    // Delete oldest entry (first inserted):
    cache.delete(cache.keys().next().value);
  }
  return result;
}
function expensiveWork(k) { return k; }

// Object.delete is notoriously slow (deoptimizes V8 hidden classes)
// Map.delete is fast and expected


// ═══════════════════════════════════════════════════════════════
// ITERATION — Map is natively iterable:

const myMap = new Map([["a", 1], ["b", 2], ["c", 3]]);

// Direct for...of:
for (const [key, value] of myMap) {
  console.log(key, value);
}

// .forEach:
myMap.forEach((value, key) => console.log(key, value));

// Destructure entries:
const [firstEntry] = myMap; // ["a", 1]

// Object needs Object.entries() wrapper:
const myObj = { a: 1, b: 2, c: 3 };
for (const [key, value] of Object.entries(myObj)) {
  console.log(key, value);
}


/**
 * ═══════════════════════════════════════════════════════════════
 * 🎯 WHEN TO USE WHICH:
 * ═══════════════════════════════════════════════════════════════
 *
 * USE OBJECT WHEN:
 * ✅ Fixed, known set of string keys (config, options)
 * ✅ Need JSON serialization (API responses, localStorage)
 * ✅ Need destructuring ({ name, age } = user)
 * ✅ Need spread syntax ({ ...defaults, ...overrides })
 * ✅ Single-record data (user profile, settings)
 * ✅ Need to pass to APIs that expect plain objects
 *
 * USE MAP WHEN:
 * ✅ Keys are NOT strings (objects, DOM elements, functions)
 * ✅ Frequent additions/deletions (caches, LRU)
 * ✅ Need guaranteed insertion order for all key types
 * ✅ Need .size without computing Object.keys().length
 * ✅ Key-value data from user input (avoid prototype pollution)
 * ✅ Need key existence check without prototype interference
 * ✅ Large collections (1000+ entries) with dynamic operations
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * ═══════════════════════════════════════════════════════════════
 *
 * 📋 SPREAD OPERATOR (...) vs OBJECT.ASSIGN() — COMPLETE COMPARISON
 *
 * ═══════════════════════════════════════════════════════════════
 * ═══════════════════════════════════════════════════════════════
 *
 * BOTH do shallow merge/copy. But they differ in subtle ways:
 *
 * | Feature               | Spread { ...obj }         | Object.assign(target, src)  |
 * |-----------------------|---------------------------|-----------------------------|
 * | Mutates target?       | ❌ No (creates new)       | ✅ YES (mutates first arg)  |
 * | Returns               | New object                | The target (mutated)        |
 * | Triggers setters?     | ❌ No                     | ✅ Yes (on target)          |
 * | Copies getters?       | Evaluates getter, copies  | Evaluates getter, copies    |
 * |                       | the VALUE                 | the VALUE                   |
 * | Prototype             | Doesn't copy __proto__    | Doesn't copy __proto__      |
 * | Non-enumerable props  | ❌ Skipped                | ❌ Skipped                  |
 * | Symbol properties     | ✅ Copies                 | ✅ Copies                   |
 * | null/undefined source | Silently ignored          | Silently ignored            |
 * | Non-object source     | Strings spread as chars   | Strings spread as chars     |
 * | Performance           | Slightly faster (static)  | Slightly slower (dynamic)   |
 */

// ═══════════════════════════════════════════════════════════════
// KEY DIFFERENCE 1: MUTATION

const defaults1 = { theme: "dark", lang: "en", debug: false };
const userPrefs1 = { theme: "light" };

// SPREAD — always creates new object, originals untouched:
const merged1 = { ...defaults1, ...userPrefs1 };
console.log(defaults1.theme); // "dark" — unchanged ✅

// OBJECT.ASSIGN — MUTATES the target (first argument)!
const merged2 = Object.assign(defaults1, userPrefs1);
console.log(defaults1.theme); // "light" — MUTATED! ⚠️
console.log(merged2 === defaults1); // true — same reference!

// FIX: Pass empty object as target:
const merged3 = Object.assign({}, defaults1, userPrefs1);
// Now defaults1 is safe, merged3 is a new object


// ═══════════════════════════════════════════════════════════════
// KEY DIFFERENCE 2: SETTERS

const target = {
  _name: "",
  set name(val) {
    console.log("Setter called with:", val);
    this._name = val.toUpperCase();
  },
  get name() {
    return this._name;
  },
};

// Object.assign TRIGGERS setters on target:
Object.assign(target, { name: "alice" });
// Console: "Setter called with: alice"
console.log(target.name); // "ALICE" — setter transformed it ✅

// Spread does NOT trigger setters — it creates a plain property:
const copy1 = { ...target, name: "bob" };
// No setter called! copy1.name is just "bob" (plain value, no setter)
console.log(copy1.name); // "bob" — setter LOST


// ═══════════════════════════════════════════════════════════════
// KEY DIFFERENCE 3: GETTER BEHAVIOR

const source = {
  get timestamp() {
    return Date.now(); // Dynamic getter
  },
};

// BOTH evaluate the getter and copy the RESULT (not the getter itself):
const copy2 = { ...source };
const copy3 = Object.assign({}, source);
// copy2.timestamp → a frozen number (not a live getter)
// copy3.timestamp → a frozen number (not a live getter)

// To copy getters/setters properly:
const withGetters = Object.defineProperties(
  {},
  Object.getOwnPropertyDescriptors(source)
);
// Now withGetters.timestamp IS a live getter ✅


// ═══════════════════════════════════════════════════════════════
// BOTH ARE SHALLOW:

const nested1 = { user: { name: "Alice", scores: [1, 2, 3] } };

const spreadCopy = { ...nested1 };
spreadCopy.user.name = "Bob";
console.log(nested1.user.name); // "Bob" — SAME reference! ⚠️

const assignCopy = Object.assign({}, nested1);
assignCopy.user.scores.push(4);
console.log(nested1.user.scores); // [1, 2, 3, 4] — SAME reference! ⚠️

// DEEP COPY SOLUTIONS:
const deep1 = structuredClone(nested1); // ✅ ES2022 — handles cycles, dates, etc.
const deep2 = JSON.parse(JSON.stringify(nested1)); // ⚠️ Loses functions, dates, undefined


// ═══════════════════════════════════════════════════════════════
// MERGING BEHAVIOR (same for both — last source wins):

const base = { a: 1, b: { x: 10, y: 20 }, c: 3 };
const override = { b: { x: 99 }, c: 4 };

const result1 = { ...base, ...override };
// { a: 1, b: { x: 99 }, c: 4 }
// ⚠️ b is REPLACED entirely, not deep merged!
// b.y is GONE! Because spread replaces the whole b property.

// DEEP MERGE requires manual recursion or lodash.merge:
function deepMerge(target2, source2) {
  const output = { ...target2 };
  for (const key of Object.keys(source2)) {
    if (
      source2[key] &&
      typeof source2[key] === "object" &&
      !Array.isArray(source2[key]) &&
      target2[key] &&
      typeof target2[key] === "object"
    ) {
      output[key] = deepMerge(target2[key], source2[key]);
    } else {
      output[key] = source2[key];
    }
  }
  return output;
}
const deepResult = deepMerge(base, override);
// { a: 1, b: { x: 99, y: 20 }, c: 4 } — y preserved! ✅


// ═══════════════════════════════════════════════════════════════
// EDGE CASES:

// Spreading non-objects:
const fromString = { ..."hello" };
// { 0: "h", 1: "e", 2: "l", 3: "l", 4: "o" }

const fromArray = { ...[10, 20, 30] };
// { 0: 10, 1: 20, 2: 30 }

// null/undefined are silently ignored:
const safe1 = { ...null, ...undefined, a: 1 };
// { a: 1 } — no error ✅

Object.assign({}, null, undefined, { a: 1 });
// { a: 1 } — same, no error ✅


/**
 * ═══════════════════════════════════════════════════════════════
 * 🎯 WHEN TO USE WHICH:
 * ═══════════════════════════════════════════════════════════════
 *
 * USE SPREAD WHEN:
 * ✅ Creating new objects (immutability, React state)
 * ✅ Simple property overrides ({ ...defaults, ...userInput })
 * ✅ Cloning objects (const clone = { ...original })
 * ✅ You want clean, readable syntax
 * ✅ Working with Redux/React (always need new references)
 *
 * USE OBJECT.ASSIGN WHEN:
 * ✅ You INTENTIONALLY want to mutate target
 * ✅ Need to trigger setters on the target object
 * ✅ Polyfill concerns (older codebases — spread needs transpilation)
 * ✅ Dynamic number of sources: Object.assign(target, ...sources)
 * ✅ Need to add properties to `this` in a constructor
 *
 * IN MODERN CODE: Prefer spread. It's more explicit (always immutable),
 * harder to misuse, and slightly faster in most engines.
 *
 *
 * ═══════════════════════════════════════════════════════════════
 * 📋 INTERVIEW SUMMARY
 * ═══════════════════════════════════════════════════════════════
 *
 * 🗣️ MAP vs OBJECT:
 * 1. "Map allows any key type — Object only strings/symbols"
 * 2. "Map guarantees insertion order for ALL keys — Object sorts integer keys"
 * 3. "Map has O(1) .size — Object needs Object.keys().length"
 * 4. "Map is better for frequent add/delete — Object.delete deoptimizes V8"
 * 5. "Map is safe from prototype pollution — Object inherits toString etc."
 * 6. "Object wins for JSON serialization, destructuring, and spread syntax"
 *
 * 🗣️ SPREAD vs OBJECT.ASSIGN:
 * 1. "Spread NEVER mutates — always creates new. Assign MUTATES first arg"
 * 2. "Assign triggers setters on target — Spread just writes plain values"
 * 3. "Both are SHALLOW — nested objects are still shared references"
 * 4. "Both evaluate getters and copy the value, not the getter function"
 * 5. "For deep copy use structuredClone(), for deep merge use recursion"
 * 6. "In React/Redux always use spread for immutable state updates"
 */
