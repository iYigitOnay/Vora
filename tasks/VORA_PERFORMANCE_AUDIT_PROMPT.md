You are a senior frontend performance engineer specializing in Next.js 14+ App Router, React 18, TypeScript, TailwindCSS, and Framer Motion. Your task is to perform a comprehensive performance and optimization audit on the VORA fitness app frontend codebase.

PROJECT CONTEXT

App name: VORA — a fitness and nutrition tracking mobile-first web app
Stack: Next.js 14 (App Router), React 18, TypeScript, TailwindCSS, Framer Motion, Zustand (state), Prisma (backend), NestJS (API)
Known issues found so far:

Root layout.tsx is marked 'use client' — this forces the entire component tree into client-side rendering, killing all Server Component benefits
usePathname() placed in root layout instead of an isolated child component
AnimatePresence imported but unused in layout — unnecessary Framer Motion bundle weight
cn() utility function defined inline inside layout.tsx instead of a shared lib/utils.ts
Meal card (öğün kartı) open/close animation causing ~10fps jank — likely JS-driven state animation instead of CSS transform

YOUR TASK
Scan the entire frontend/ (or src/) directory and perform the following audits. For each issue found, provide:

File path — exact location
Issue type — category (see below)
Severity — Critical / High / Medium / Low
Root cause — one sentence explanation
Fix — complete corrected code snippet, ready to paste

AUDIT CATEGORIES

1. Server vs Client Component Boundary

Find every file with 'use client' directive
Check if the 'use client' is actually necessary (uses hooks, browser APIs, event handlers)
If a component only needs ONE hook (e.g. usePathname) but is otherwise static, flag it for splitting
Check if any Server Components are importing Client Components incorrectly

2. Re-render & Memoization

Find all components that receive object/array/function props without useMemo or useCallback
Find all list renders missing React.memo on the list item component
Find all inline arrow functions passed as props inside JSX: onChange={() => ...}, onClick={() => ...}
Find useEffect with missing or incorrect dependency arrays
Find useState updates that trigger unnecessary parent re-renders

3. Animation Performance

Find all Framer Motion animate / variants that animate height, width, top, left, margin, or padding — these cause layout thrashing. They must be replaced with transform and opacity only
Find any JS-driven show/hide animations (toggling state to mount/unmount) that should instead use CSS opacity + pointer-events or Framer Motion AnimatePresence correctly
Find motion components inside large lists — each should be wrapped in React.memo
Check if layoutId is overused causing unnecessary FLIP animations

4. Bundle Size

Find unused imports across all files
Find packages imported fully when only one function is needed (e.g. import \_ from 'lodash' instead of import debounce from 'lodash/debounce')
Find any import \* as X from patterns
Check if framer-motion is imported in files where only CSS transitions would suffice
Identify any large dependencies that have lighter alternatives

5. Data Fetching

Find any useEffect + fetch patterns that should be replaced with React Server Components or use() hook
Find missing loading.tsx or error.tsx files for route segments
Find API calls without proper caching strategy (cache, revalidate, unstable_cache)
Find waterfalled requests that could be parallelized with Promise.all
Find missing Suspense boundaries around async components

6. Image & Asset Optimization

Find any <img> tags that should be next/image <Image>
Find <Image> components missing width, height, or sizes props
Find <Image> components missing priority on above-the-fold images
Find large SVGs inlined in JSX that should be components or sprite sheets

7. Font & CSS

Find fonts loaded without display: swap
Find TailwindCSS classes generating large unused CSS (check tailwind.config content paths)
Find repeated inline style={{}} objects that should be Tailwind classes or CSS variables
Find CSS-in-JS patterns that cause style recalculation on every render

8. State Management

Find Zustand stores that are subscribed to fully when only a slice is needed (missing selector pattern)
Find useContext calls that cause full tree re-renders on any state change
Find local state that is duplicated across sibling components (should be lifted or put in store)
Find state that is stored in Zustand but never persisted / never shared (should be local useState)

9. Next.js App Router Specific

Find layout.tsx files that are 'use client' when they should be server components
Find missing generateMetadata on page components
Find useRouter used for navigation where <Link> would be more appropriate
Find router.push inside useEffect without proper cleanup
Find pages missing loading.tsx suspense fallback
Check if next/dynamic with { ssr: false } is used where appropriate for heavy client components (charts, rich text editors, etc.)

10. Accessibility & UX Performance

Find modal/drawer components that don't trap focus
Find scroll-heavy lists missing virtualization (should use react-window or @tanstack/virtual if list > 50 items)
Find missing key props or unstable keys (e.g. using array index as key in dynamic lists)
Find onScroll or onMouseMove handlers not debounced/throttled

OUTPUT FORMAT
For each issue, output in this exact structure:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[SEVERITY] ISSUE TYPE — Short title
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
File: src/components/meals/MealCard.tsx
Line: 42-67
Root cause: Animating `height` property causes layout recalculation on every frame
Severity: Critical

❌ Current code:
[paste problematic snippet]

✅ Fixed code:
[paste complete corrected snippet]

Impact: Fixes ~10fps jank on meal card open animation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PRIORITY ORDER
After listing all issues, produce a prioritized fix plan:
PHASE 1 — Critical (fix today, blocking performance)
PHASE 2 — High (fix this week, noticeable UX impact)  
PHASE 3 — Medium (fix next sprint, optimization)
PHASE 4 — Low (nice to have, minor gains)

CONSTRAINTS

Do NOT suggest rewriting the entire codebase or changing the stack
Do NOT suggest removing Framer Motion — only fix how it's used
Do NOT suggest switching state management library
Every fix must be a drop-in replacement — same props API, same behavior
All fixes must be TypeScript-compatible with strict mode
All fixes must be compatible with Next.js 14 App Router conventions
Tailwind classes must remain — do not convert to CSS modules

FINALLY
After all fixes, generate a single performance-checklist.md file I can commit to the repo with:

All issues found (checked off as fixed)
The priority phases
A "before/after" summary of expected improvements
A note on which fixes require testing (e.g. re-render count in React DevTools, Lighthouse score, animation FPS in Chrome DevTools Performance tab)
