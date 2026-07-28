# Transaction History Module — Interview Prep (HLD + Discussion)

> Resume Line: "Built a high-performance Transaction History module with client & server-side pagination, filtering, sorting, and searching in a mutual fund investor web app."

---

## HIGH-LEVEL ARCHITECTURE

```
┌────────────────────────────────────────────────────────────────────────┐
│                         TRANSACTION HISTORY                              │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   URL (Deep Link)          React Query (Caching Layer)                 │
│   ?status=failed  ──────►  staleTime: 5min | gcTime: 10min            │
│                            refetchInterval: 5min (background polling)  │
│                                     │                                  │
│                                     ▼                                  │
│   ┌──────────────────────────────────────────────────────────────┐    │
│   │              DATA PIPELINE (all memoized)                     │    │
│   │                                                              │    │
│   │  Raw API ──► Transform ──► Filter ──► Sort ──► Paginate     │    │
│   │   (once)     (useMemo)    (useMemo)   (useMemo)  (slice)    │    │
│   └──────────────────────────────────────────────────────────────┘    │
│                                     │                                  │
│                                     ▼                                  │
│   ┌──────────────────────────────────────────────────────────────┐    │
│   │                     UI LAYER                                  │    │
│   │                                                              │    │
│   │  ┌────────────┐  ┌──────────────┐  ┌─────────────────────┐ │    │
│   │  │ Status     │  │ Duration     │  │ Advanced Filters    │ │    │
│   │  │ Chips      │  │ Dropdown     │  │ (Modal with draft)  │ │    │
│   │  │ (URL sync) │  │ (presets +   │  │ Type|Holdings|Funds │ │    │
│   │  │            │  │  custom)     │  │                     │ │    │
│   │  └────────────┘  └──────────────┘  └─────────────────────┘ │    │
│   │                                                              │    │
│   │  ┌──────────────────────────────────────────────────────────┐   │
│   │  │ Desktop: Table with internal pagination (9/page)          │   │
│   │  │ Mobile:  Card list + explicit pagination (10/page)        │   │
│   │  └──────────────────────────────────────────────────────────┘   │
│   └──────────────────────────────────────────────────────────────────┘
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## SECTION 1: ARCHITECTURE & DESIGN DECISIONS

### Q: Walk me through the architecture.

**What I did:**

Think of it like a **water purification plant:**
- Water comes in (raw API data)
- Goes through purification stages (transform → filter → sort)
- Comes out clean to the tap (UI)
- Each stage only runs when it needs to (memoized)

The structure:
1. **Route Guard** — bouncer at the door. If someone types a bad URL like `?status=banana`, redirect them before anything loads
2. **Main Page Component** — the brain. Fetches data, holds state, coordinates everything
3. **Filter Components** — the control panel. User interacts here to change what they see
4. **Table/Card Components** — the display. Just renders whatever data it receives
5. **Utility functions** — the workers. Pure functions that transform and filter data. No UI knowledge, easily testable

**Why this separation matters:**
- If tomorrow we need to show transactions in a different page (say a dashboard widget), we reuse the utilities without touching UI
- If the filter UI changes (say, from chips to dropdowns), the data logic doesn't care
- QA can test filter logic independently without rendering anything

**Trade-off:**
- More files to manage, but each has a single clear responsibility
- Could have put everything in one giant component, but that becomes unmaintainable as features grow

---

### Q: Why client-side filtering instead of server-side?

**Simple explanation:**

Imagine you order food for a party. You have two choices:
1. Order ALL the food once, then let guests pick what they want from the table (client-side)
2. Every time a guest wants something different, call the restaurant again (server-side)

For 50–500 transactions (one investor's history), option 1 is faster and cheaper.

**What I did:** Fetched the complete transaction history once, stored it in React Query's cache, and applied all filters locally in JavaScript.

**Why it works for us:**
- Individual investor = 50–500 transactions maximum (not millions)
- The entire dataset is maybe 50–100KB — trivial for modern devices
- User changes filters frequently (clicking chips, selecting durations) — if each triggered an API call, the UX would feel sluggish with loading spinners everywhere
- React Query caches the data for 5 minutes — navigating away and coming back is instant, no re-fetch

**When I'd choose server-side instead:**
- Admin dashboard viewing ALL users' transactions (millions of records)
- Dataset too large to fit in browser memory
- Data changes so frequently that caching is meaningless
- Need full-text fuzzy search (Elasticsearch on server is better than client-side regex)

**What they might follow up:** "Doesn't this waste bandwidth?"  
**Answer:** Actually the opposite. One API call of ~50KB vs potentially 10+ calls as user plays with filters. Also, React Query's background polling means we're not hitting the server on every user interaction — just once every 5 minutes.

---

### Q: Explain the pagination strategy.

**Simple explanation:**

Think of a book. You don't show all 300 pages at once — you show one page and let the reader flip. That's pagination. But we have TWO different reading experiences:
- Desktop = reading a table (structured, columns)
- Mobile = reading cards (stacked, scrollable)

**What I did:**
- **Desktop:** The table component itself manages pagination. I give it all 200 filtered transactions, it shows 9 at a time internally and handles page navigation
- **Mobile:** I manually slice the data before rendering — show only 10 cards, then render a separate pagination control below

Both approaches mean: regardless of whether you have 50 or 500 transactions, the browser only renders 9-10 DOM elements. This keeps scrolling smooth and memory low.

**Why two approaches?**
- Desktop table is a reusable generic component across the app — it needs to own its pagination
- Mobile needed a completely custom card layout with features like "Showing 1-10 of 234" text and auto-scroll-to-top on page change (mobile UX pattern)

**Important edge case: Pagination reset.**
When user changes any filter, page goes back to 0. Why? Imagine you're on page 5 showing "In Progress" transactions. You switch to "Failed" — there might only be 2 results. Page 5 would be empty. Always safer to reset.

**What they might probe:** "Why not infinite scroll?"

**My reasoning:**
- Transaction history is a "scan and find" pattern — user wants to jump to a specific time period, not browse endlessly
- Infinite scroll makes it hard to get back to where you were (no URL state for scroll position)
- Pagination works better with filters (clear page count tells user "there are 3 pages of failed transactions")
- Also: infinite scroll + complex filters = tricky state management (what if filter changes mid-scroll?)

---

## SECTION 2: STATE MANAGEMENT

### Q: How did you manage state?

**Simple explanation:**

Think of state as a single control panel with multiple switches. Instead of having 8 separate remote controls (one for each setting), I put them all in one panel:

```
{
  activeTab       → which tab user is on (History / Pending)
  filterModalOpen → is the filter popup open?
  durationFilter  → "Last 7 days", "Last 30 days", etc.
  statusFilter    → "All", "Completed", "Failed", etc.
  advancedFilters → actually applied filters (from modal)
  modalFilters    → what user is CURRENTLY selecting in modal (draft)
  filterCount     → how many advanced filters active (for badge)
  sortOrder       → "newest first" or "oldest first"
}
```

**The "Draft State" pattern — most important concept here:**

Imagine filling a form that doesn't save until you hit Submit:
- `modalFilters` = the form being filled (user is checking/unchecking boxes in the filter modal)
- `advancedFilters` = the saved version (only updates when user clicks "Apply")

**Why this matters performance-wise:**
Without draft state → every checkbox click in the modal would re-filter 500 transactions and re-render the table behind the modal. Wasteful.
With draft state → modal interactions are completely isolated. Table only updates on "Apply."

**Why single object vs multiple useState calls?**

When user clicks "Clear All", I need to reset 6 things simultaneously:
- With single state: one `setState` call, one re-render
- With 6 separate states: potentially 6 re-renders (React 18 batches in event handlers, but not always in async/callbacks)

**Why not Redux/Zustand?**
- This state is LOCAL to one page. When user navigates away, it's gone. Global state managers are for data that persists across routes (like user session, theme, cart)
- React Query already handles "server state" (transaction data). This is just "UI state"

**Why not useReducer?**
- useReducer shines when you have complex transitions: "if action is X and current state is Y, then go to Z"
- Here it's all simple: "set this field to this value." A reducer would just be boilerplate switch-cases that all do the same thing

---

### Q: How does URL sync work with filters?

**Simple explanation:**

Think of URLs like a save code in a video game. Not everything is worth saving — just the most important state.

**What I did:**
- Status filter lives in the URL: `?status=failed`
- When user clicks a status chip → URL updates
- When page loads with `?status=failed` → filter auto-selects "Failed"
- Used `replace: true` when updating (important!)

**Why only status in URL?**
- External systems link here. Example: Push notification says "Your transaction failed" → user taps → opens app at `?status=failed` → they immediately see failed transactions
- Duration and advanced filters are "I'm currently exploring" state — nobody shares a link that says "show me HDFC funds from last 7 days with holding type Single"

**Why `replace: true` instead of `push`?**

`push` = adds to browser history. Imagine user clicks: All → Completed → Failed → In Progress
- Without replace: Back button goes In Progress → Failed → Completed → All (4 clicks to leave page!)
- With replace: Back button leaves the page immediately (current filter is replaced in history, not stacked)

**Route Guard — why?**
If someone manually types `?status=banana` or a malicious link sends them there, the guard catches it and redirects to the clean URL. Prevents the component from initializing with invalid state.

---

## SECTION 3: DATA TRANSFORMATION & FILTERING

### Q: How does the data pipeline work?

**Simple explanation:**

Think of it as an assembly line in a factory:

```
Station 1 (Transform): Raw material → Clean, consistent parts
Station 2 (Filter):    Remove parts that don't match criteria
Station 3 (Sort):      Arrange remaining parts in order
Station 4 (Paginate):  Pick only 10 parts for the current box
Station 5 (Render):    Display the box to the customer
```

Each station has a "lazy worker" rule (memoization): **only do work if your input changed.** If the filter criteria changed but the raw data didn't, Station 1 sleeps — only Station 2 onwards re-runs.

**Transform step (runs once per data fetch):**
- Raw API gives messy data: dates as strings, 15 different status codes, null fields
- Transform normalizes everything: parse dates, map statuses, format amounts, provide fallbacks
- This is expensive (date parsing especially) but runs only when fresh data arrives from API

**Filter step (runs on every filter interaction):**
- Three-layer check in order:
  1. Does it match the duration? (Last 7 days, etc.)
  2. Does it match the status? (Completed, Failed, etc.)
  3. Does it match advanced filters? (Transaction type, Holding, Fund name)
- **Short-circuit:** If a transaction fails the duration check, don't bother checking status or advanced. Exit early. This saves time when duration eliminates 80% of records.

**Sort step (runs with filter):**
- Sort by date — uses the already-parsed date object from transform step
- Not parsing date strings again during sort (common mistake that kills performance)

---

### Q: The status normalization — why is it complex?

**Simple explanation:**

Imagine you're a translator. Three people tell you something is wrong, but they each speak differently:
- Payment gateway says: "PAYMENT_FAILED" or "PAYMENT_CANCELLED" or "PAYMENT_REFUNDED"
- RTA (fund registrar) says: "RTA_REJECTED" or "REVERSED"
- Internal system says: "FAILED" or "EXPIRED"

The user doesn't care WHO said it — they just want to know: **"Did my transaction work or not?"**

**What I did:** Created a single mapping function:

```
Input: Any of 15+ raw status codes + transaction type
Output: One of 5 user-friendly statuses
```

| User Sees | Maps From |
|-----------|-----------|
| Completed | COMPLETED, SUCCESS, ACTIVE |
| In Progress | INITIATED, CREATED, PAYMENT_PROCESSING, RTA_SUBMITTED, RTA_APPROVED, etc. |
| Payment Failed | PAYMENT_FAILED, PAYMENT_CANCELLED, PAYMENT_REFUNDED, RTA_REJECTED (for payment types) |
| Failed | Same failure codes BUT for non-payment transactions (SWP, STP, Switch) |
| Rejected | REJECTED |

**Why "Failed" vs "Payment Failed"?**
- If user bought a mutual fund and payment failed → "Payment Failed" (their money didn't go through)
- If user did an SWP (systematic withdrawal) and it failed → just "Failed" (there's no payment involved in withdrawals — saying "Payment Failed" would confuse them)

**The counting edge case:**
When showing the "Failed" chip count, I combine both `PAYMENT_FAILED` + `FAILED` counts. They're displayed as one category to the user even though internally they're tracked separately.

---

### Q: How do status counts work?

**Simple explanation:**

Think of a grocery store with sections. The sign on each section says how many items are there. If you apply a "organic only" filter, the section signs should update to show "5 organic items in Fruits, 3 in Vegetables" — but the section signs should NOT disappear just because you're currently standing in Fruits.

**What I did:**
Status counts are calculated **ignoring the currently selected status filter** but **respecting all other filters.**

Example scenario:
- User selected: Duration = "Last 7 days", Advanced Filter = "HDFC fund only"
- With these filters, there are: 8 Completed, 2 In Progress, 3 Failed
- Chips show: All(13) | Completed(8) | In Progress(2) | Failed(3)
- User clicks "Failed" → table shows 3 failed transactions
- But chips STILL show All(13) | Completed(8) | In Progress(2) | **Failed(3)** ← selected

**Why?** If clicking "Failed" made other chips show 0, the user loses context. They need to see "there are 8 completed ones I can switch to" while viewing failed ones.

---

## SECTION 4: PERFORMANCE

### Q: How did you optimize performance?

**Simple explanation:**

Three rules I followed:
1. **Don't compute what hasn't changed** (memoization)
2. **Don't render what user can't see** (pagination)
3. **Don't fetch what you already have** (caching)

Detailed breakdown:

| What | How | Why (in plain terms) |
|------|-----|-----|
| Transform 500 records | `useMemo` — only re-runs when raw data changes | User clicking filters shouldn't re-parse 500 dates |
| Filter records | `useMemo` — only re-runs when filter state changes | Typing in search shouldn't re-sort |
| Sort records | Combined with filter memo | Sort always runs after filter anyway |
| Status counts | `useMemo` — recalculates when data or filters change | Don't recount 500 items on every render |
| Unique filter options | `useMemo` — extracts once from data | "What transaction types exist?" answer doesn't change unless data changes |
| Retry handler | `useCallback` — stable reference | Prevents child table from re-rendering just because parent re-rendered |
| Modal interactions | Draft state | Checking boxes in modal doesn't touch the table at all |
| Table rendering | Pagination (9-10 items) | Whether there are 50 or 5000 filtered results, DOM always has ~10 rows |
| Data fetching | React Query cache (5 min) | Coming back to this page? Show cached data instantly, refresh in background |

**What they might ask:** "Isn't this premature optimization?"

**My answer:** No, because:
- Memoization with useMemo is almost free to add (one line wrapper)
- Pagination is a UX requirement anyway (nobody wants to scroll through 500 rows)
- Caching is React Query's default behavior — I just configured the timings
- The draft state pattern was needed for correct UX (Apply button semantics) — performance was a bonus

---

### Q: What if it's still slow with 5000 transactions?

**Scaling ladder (what I'd do at each stage):**

| Data Size | Strategy |
|-----------|----------|
| < 500 | Current approach (client-side everything) ✓ |
| 500–2000 | Add **Web Worker** for filtering (offload heavy loop from main thread) + **virtualized list** (react-window — only renders visible rows) |
| 2000–10k | **Server-side pagination** — API returns 50 at a time. Client-side filter only on current page. Server handles the heavy lifting |
| 10k+ | Full server-side: cursor-based pagination, Elasticsearch for search, pre-aggregated counts in Redis, streaming export |

**Key insight:** The architecture I built (data pipeline) makes this migration easy. Swap the source from "client-side filter" to "API with params" — the UI layer doesn't change at all.

---

## SECTION 5: RESPONSIVE DESIGN

### Q: How does mobile differ from desktop?

**Simple explanation:**

It's not "same page made smaller." It's "same data, different experience." Like how a book and an audiobook convey the same story differently.

| Aspect | Desktop | Mobile | Why Different |
|--------|---------|--------|---------------|
| Data display | Table (columns & rows) | Card stack | Tables need horizontal space. Cards work vertically |
| Pagination | Built into table | Separate component below cards | Cards need "Showing 1-10 of 50" text + scroll-to-top |
| Sorting | Click column header | Bottom drawer with options | No column headers on cards, need explicit sort control |
| Status tooltip | Hover | Tap → bottom sheet | No hover on touch devices |
| Filter button | Icon + text "Filter" | Icon only | Save horizontal space |
| Filter chips | Fixed row | Horizontally scrollable | All chips might not fit on 360px |

**Key decision:** I used completely different component trees, not just CSS responsive classes.

**What they might ask:** "Why not just make the table horizontally scrollable on mobile?"

**My answer:** Because it's a terrible UX. Users would need to:
1. Scroll vertically to find the row
2. Scroll horizontally to see the status
3. Scroll back left to see the fund name

With cards, all essential info (fund name, amount, status, date) is visible at once without scrolling. Touch targets are larger. It follows how users naturally read on mobile (top to bottom).

---

## SECTION 6: CACHING & DATA FETCHING

### Q: Explain your caching strategy.

**Simple explanation:**

Think of it like a newspaper delivery:
- `staleTime: 5 min` → "This newspaper is fresh for 5 minutes. Don't order another one"
- `gcTime: 10 min` → "Keep the newspaper on the table for 10 minutes even if no one's reading it. Throw it away after that"
- `refetchInterval: 5 min` → "Every 5 minutes, automatically get the latest edition in the background"
- `refetchOnWindowFocus: false` → "Don't rush to get a new newspaper just because I walked back into the room"

| Setting | Value | Plain English |
|---------|-------|---------------|
| staleTime | 5 min | If user navigates away and comes back within 5 min, show cached data immediately (no loading spinner) |
| gcTime | 10 min | Even after leaving the page, keep data for 10 min in case they return |
| refetchInterval | 5 min | Silently check for new transactions every 5 min while page is open |
| refetchOnWindowFocus | false | Switching browser tabs shouldn't cause a data flash/loading state |

**Why these specific values?**

Transaction history is **looking at the past.** Past transactions don't change every second. A 5-minute delay in seeing a newly completed transaction is acceptable.

If this were a live trading dashboard (showing real-time stock prices), I'd use 5-second refresh or WebSocket.

**Cache invalidation — when do I force a refresh?**
- After user completes a new transaction → invalidate cache → next visit shows new entry
- After retry action succeeds → invalidate → status updates immediately
- Manual pull-to-refresh on mobile → invalidate

**What they might probe:** "What about stale data?"

**My answer:** The worst case is: user's most recent transaction (from 4 minutes ago) doesn't appear until the next background refresh. For a history page, this is acceptable. We're not showing a bank balance — we're showing a log. If real-time was critical, I'd add WebSocket or reduce polling to 30s.

---

## SECTION 7: EDGE CASES & PRODUCTION SCENARIOS

### Q: How does the retry mechanism work?

**Simple explanation:**

Not every failed transaction should have a "Retry" button. Think of it like a vending machine — you can only get a refund under certain conditions:

**5 business rules (ALL must pass to show retry):**

| Rule | Why |
|------|-----|
| 1. Status is Failed/Payment Failed | Obviously — can only retry something that failed |
| 2. Within last 7 days | Payment gateways have time limits. NAV (fund price) changes daily — retrying a 30-day-old transaction at today's NAV makes no sense |
| 3. Not a SIP/ISIP | SIPs auto-retry on the next cycle (monthly/weekly). Manual retry would create duplicate investments |
| 4. Not a Smart Switch | Multi-step transaction (sell Fund A + buy Fund B). Can't "simply retry" — conditions may have changed |
| 5. Scheme master says lumpsum is still enabled | The mutual fund might have stopped accepting new investments. Showing retry for a closed fund = confusing error |

**What happens when user clicks Retry:**
1. Extract all details from the failed transaction (fund, amount, folio, bank, plan)
2. Navigate to the review/confirmation page with all details pre-filled
3. User reviews and confirms → creates a NEW transaction (not modifying the old one)
4. Old failed transaction stays in history. New one appears separately.

**Loading state edge case:**
While scheme master data is loading, hide the retry button entirely. Why? Because if we show it and user clicks, we might find out that fund is closed AFTER the click — poor UX. Better to wait.

---

### Q: How do you handle empty and error states?

**My philosophy:** The page should NEVER be completely broken. Graceful degradation over error screens.

| Scenario | What Happens | Why This Way |
|----------|-------------|--------------|
| API is loading | Full-screen loader overlay | User knows something's happening |
| API returns error | Page renders with "No data" | User can still interact with filters, navigate away. Not stuck on error page |
| Filters match nothing | "No data" in table area, but filter chips still show counts | User sees WHY there's no data (the counts tell them "there are 0 Failed in this time range") |
| Invalid URL parameter | Guard redirects to clean URL | Silent fix, no error shown to user |
| Transaction has null fields | Show `-` or `N/A` | Decided during transform step — UI components never deal with null |
| Invalid date in transaction | Skip duration filter for that record (show it regardless) | Better to show an extra record than hide a valid transaction due to bad date |

**What they might probe:** "Why not show a proper error UI with retry?"

**My answer:** For a data-fetching error, React Query handles retry automatically (3 attempts by default). If all 3 fail, showing "No data" + keeping the page interactive is better than a blocking error modal that requires user action. The user likely already knows their network is bad.

---

### Q: How do you handle switch transactions differently?

**Simple explanation:**

Most transactions are simple: "You invested ₹10,000 in HDFC Top 100 Fund."

But a **switch** transaction says: "You moved ₹10,000 FROM HDFC Top 100 TO ICICI Bluechip."

It involves TWO funds, not one. So:

**Problem:** A single row/card that says "Fund Name: HDFC Top 100" is incomplete. Where's the target fund?

**What I did:**
- Detect switch transactions during the transform step (check transaction type)
- Add extra fields: `switchFrom`, `switchTo`, `fromAmount`, `toAmount`
- Desktop: Table row has an expandable section underneath showing switch details
- Mobile: Card layout completely changes — shows a "From" section and a "To" section with labels

**Why not just show both fund names in one cell?**
Tried it. "HDFC Top 100 Fund Growth → ICICI Prudential Bluechip Fund Direct Growth" doesn't fit in a table column. Breaking it into sections gives a clean visual hierarchy.

---

## SECTION 8: WHAT THEY'LL GRILL ON (2026 TRENDS)

### Q: How would you add real-time updates?

**The scenario:** User makes a transaction. They're watching the history page waiting for it to update from "In Progress" to "Completed."

**What I'd do:**

**Option A — WebSocket:**
- Server pushes status change events to client
- On receiving an event, update React Query cache directly (no full refetch)
- Show a toast: "Your HDFC Top 100 transaction is now Completed"
- Handle reconnection (exponential backoff: 1s, 2s, 4s, 8s...)
- Close socket when user backgrounds the app (saves battery + server resources)

**Option B — Server-Sent Events (SSE):**
- Simpler than WebSocket — one-direction only (server → client)
- Browser handles reconnection automatically
- Better fit here since we only need server-to-client updates (user doesn't send data back through this channel)

**What I'd choose:** SSE for this use case. Simpler, sufficient, less infrastructure.

**Trade-off vs current polling:**
- Polling (current): Simple, 5-min delay acceptable, no infrastructure needed
- SSE/WebSocket: Real-time, but needs server infrastructure, connection management, fallback strategy

---

### Q: How would you implement optimistic updates for retry?

**Simple explanation:**

Optimistic update = "Assume success, fix if wrong." Like a restaurant bringing you the check before you ask — assumes you're done, takes it back if you're not.

**What I'd do for retry:**
1. User clicks "Retry" → immediately update the transaction's status in cache to "In Progress" (before API responds)
2. Save the old state as a snapshot (rollback point)
3. API call goes out
4. If success → great, cache already shows correct state. Invalidate to get fresh data on next poll
5. If failure → revert cache to snapshot, show error toast

**Why?** User clicks retry and navigates to review page. When they come BACK to history (after completing retry), the old failed transaction should already show "In Progress" — not still show "Failed" until the next 5-min poll.

---

### Q: How would you scale this to 1M transactions (admin dashboard)?

**Simple explanation:**

Current approach = "bring all the books to your desk and search through them."
At scale = "tell the librarian what you want, they bring you one shelf at a time."

**Architecture shift:**

```
CURRENT (50-500 records)          AT SCALE (1M records)
─────────────────────             ─────────────────────
Client does everything            Client is just a display
Fetch all → filter locally        Server filters, sorts, paginates
React Query caches full dataset   React Query caches current page only
No search engine needed           Elasticsearch for text search
Counts computed in JS             Counts pre-aggregated in Redis
```

**Key changes:**
1. **Cursor-based pagination** (not offset-based). Why? Offset breaks when new data is inserted: "skip 50, take 10" might miss or duplicate records if data changed between pages. Cursor says "give me 10 after this specific ID" — always consistent.

2. **API contract changes:** All filters become query params: `?status=FAILED&from=2025-01-01&limit=50&cursor=abc123`

3. **Pre-aggregated counts:** Computing "how many Completed?" across 1M records on every request is expensive. Use a Redis counter that updates on each status change: O(1) lookup instead of COUNT(*) query.

4. **Virtual table (react-window):** Even with pagination, an admin might want 50-100 rows visible. Virtualizing ensures only ~20 DOM nodes exist regardless of visible row count.

**What stays the same:** The UI components barely change! Filters still work the same way from the user's perspective. The data source just moves from "local array" to "API call with params."

---

### Q: How would you add search/autocomplete?

**What I'd do:**

1. **Debounced input** — wait 300ms after user stops typing before searching. Without this, typing "HDFC" triggers 4 searches: "H", "HD", "HDF", "HDFC"

2. **Match against:** fund name, transaction type, amount, transaction ID

3. **At current scale (client-side):** Simple string `.includes()` on filtered data. Fast enough for 500 records.

4. **At scale (server-side):** Elasticsearch with:
   - Ngram tokenizer (matches partial words: "HD" finds "HDFC")
   - Fuzzy matching (typo tolerance: "HFDC" still finds "HDFC")
   - Autocomplete suggestions dropdown

5. **UX touches:**
   - Highlight matched text in results
   - Show recent searches (localStorage)
   - "No results" state with suggestion to clear filters

---

### Q: Accessibility concerns?

**Simple explanation:** Can a blind person use this module? Can a keyboard-only user navigate it? Can a colorblind person understand the status?

| Component | Issue | Fix |
|-----------|-------|-----|
| Status chips | Visually "selected" but screen reader doesn't know | Add `role="radiogroup"`, `aria-pressed` on each chip |
| Status colors | Red = failed, Green = success — colorblind users can't distinguish | Always pair color with text label (we do this) + icon |
| Table sorting | Click header to sort — keyboard user can't reach it | Ensure `TableSortLabel` is focusable + has `aria-sort` |
| Pagination | "Page 2" means nothing to screen reader | Add `aria-label="Page 2 of 5"`, `aria-current="page"` |
| Filter modal | Opens over content — focus might stay behind | Focus trap inside modal, return focus to trigger button on close |
| Retry button | Just says "Retry" — retry WHAT? | `aria-label="Retry HDFC Top 100 transaction from July 25"` |

---

### Q: React Server Components — how would this change?

**Simple explanation:**

Currently: Browser downloads JS → JS fetches data → JS renders page (3 steps, all in browser)
With RSC: Server fetches data → Server renders initial HTML → Browser gets pre-rendered page + small JS for interactions

**What changes:**
- Data fetching + transform → moves to server component (runs during build/request)
- Filter interactions + pagination → stays as client component (needs browser events)
- Benefit: User sees content faster (no loading spinner on first visit), smaller JS bundle
- Trade-off: Filter changes still need client-side logic or would need streaming from server

**Would I rewrite?** Only if migrating to Next.js App Router. For an SPA (our current setup), this doesn't apply.

---

## SECTION 9: BEHAVIORAL QUESTIONS

### Q: What was the hardest part?

**Answer:** Status normalization, without question.

The backend returned 15+ status codes from 3 different systems. None of them were documented initially. I had to:
1. Trace actual API responses across 20+ test transactions to discover all possible statuses
2. Sit with the backend team to understand what each means
3. Realize the SAME status code means different things for different transaction types
4. Build a mapping that's correct, extensible (new statuses can be added), and doesn't break existing flows
5. Handle the counting logic where "Failed" chip shows two combined statuses

**What made it hard:** Not the coding — the **ambiguity.** When backend says "REVERSED," does that mean the user's money came back (good) or the transaction was undone (bad)? Context matters. Required collaboration, not just coding.

---

### Q: What would you do differently?

| Change | Why |
|--------|-----|
| TypeScript from day one | Status constants, transaction shape, filter types — all would benefit from compile-time checking. Currently relying on string comparisons that can silently break |
| All filters in URL (using `nuqs` library) | Full state would be shareable/bookmarkable. A support agent could say "send me your page URL" to see exactly what the user sees |
| Server-side filtering from start | Even for small data, it scales without architecture change later |
| Error boundaries per section | Currently if the filter section crashes, whole page goes down. Should be isolated: filter crash shows fallback, table still works |
| Storybook for components | Cards, status badges, filter chips are reusable — should be documented visually |

---

### Q: How did you ensure quality?

- **Pure utility functions** → unit testable without React, without browser, without mock DOM
- **Route guard** → invalid states are impossible (bad URLs caught at the door)
- **Defensive transforms** → null-safe access everywhere, fallback values decided once at transform layer (not scattered across 5 components)
- **Constants file** → single source of truth for all status codes, mappings, configs. Change in one place, everything updates
- **Draft state** → impossible for user to accidentally apply incomplete filter selections

---

## SECTION 10: RAPID-FIRE (SHORT ANSWERS)

**Q: Why useMemo over useCallback for filtered data?**
useMemo caches a VALUE (the filtered array). useCallback caches a FUNCTION. I want the result, not a function to compute it later.

**Q: Why `replace: true` in URL navigation?**
Without it, every filter click adds to browser history. User presses "back" 6 times cycling through filter states instead of leaving the page once.

**Q: Why dayjs over native Date?**
- Immutable (doesn't modify original)
- Readable: `dayjs().subtract(7, 'day')` vs `new Date(Date.now() - 7*24*60*60*1000)`
- Consistent timezone handling
- 2KB library — worth the DX improvement

**Q: What does React Query's `select` do?**
Transforms the raw API response (`response.data.response`) at the cache level. This transformation is memoized by React Query itself — doesn't re-run on every component render. Think of it as a permanent filter between cache and component.

**Q: What if user has 0 transactions?**
Transform step produces empty array → filter produces empty array → table renders "No data" message. Filter chips show All(0). Everything still works, nothing crashes.

**Q: How do you prevent stale closure bugs in callbacks?**
The single state object pattern with `setState(prev => ({ ...prev, ... }))` always reads the latest state via the `prev` parameter. Never reading state directly inside callbacks.

**Q: Why is the pending tab commented out?**
Product decision — pending actions needed a different API endpoint that wasn't ready. We built the UI architecture (tab system, separation logic) but disabled it via comment. When backend delivers the API, we uncomment and connect.

---

## WHITEBOARD DIAGRAM (draw this if asked)

```
API ──► Cache ──► Transform ──► Filter ──► Sort ──► Paginate ──► Render
         │          (memo)       (memo)    (memo)    (slice)
         │             │            │
         │             │       ┌────┴────────────┐
         │             │       │ 3 Filter Layers │
         │             │       │ 1. Status (URL) │
         │             │       │ 2. Duration     │
         │             │       │ 3. Advanced     │
         │             │       │    (modal/draft)│
         │             │       └─────────────────┘
         │             │
         │        ┌────┴─────────┐
         │        │ 15 statuses  │
         │        │ → 5 display  │
         │        └──────────────┘
         │
    ┌────┴─────────────────┐
    │ React Query          │
    │ • stale: 5 min       │
    │ • gc: 10 min         │
    │ • poll: 5 min        │
    │ • no refetch on focus│
    └──────────────────────┘
```

**One-line explanation:** "Each step is memoized — only recomputes when its specific inputs change. Rendering is always O(1) due to pagination. Total filtered data processing is O(n) where n is bounded by one user's history."

---

## FINAL TIP

When explaining, always frame as: **"Given our constraints (individual investor, 50-500 records, mutual fund domain), I chose X because Y. If constraints change to Z, I'd switch to W."**

This shows you're not just implementing blindly — you're making conscious engineering decisions based on context.
