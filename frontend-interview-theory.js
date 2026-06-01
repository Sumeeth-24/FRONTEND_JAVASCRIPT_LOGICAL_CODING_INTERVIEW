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
