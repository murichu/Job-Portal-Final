# Job Portal v2 — Client

A full-featured job board frontend built with **React 18**, **Vite**, **Tailwind CSS**, and **React Router v7**.

---

## Quick Start

```bash
# 1. Install dependencies
cd client
npm install

# 2. Set up environment variables
cp .env.example .env
# Edit .env and set VITE_BACKEND_URL to your backend API

# 3. Start dev server
npm run dev
```

The app opens at `http://localhost:5173`.

---

## Environment Variables

| Variable           | Description                 | Example                 |
| ------------------ | --------------------------- | ----------------------- |
| `VITE_BACKEND_URL` | Base URL of the backend API | `http://localhost:4000` |

Copy `.env.example` → `.env` and fill in your values. **Never commit `.env`.**

---

## Project Structure

```
client/
├── index.html                  # Entry HTML — meta tags, fonts, OG
├── vite.config.js              # Vite + path aliases + chunk splitting
├── tailwind.config.js          # Design tokens, custom shadows, animations
├── postcss.config.js
├── .env.example
└── src/
    ├── main.jsx                # App root — StrictMode + BrowserRouter
    ├── App.jsx                 # Routes + route guards + modals
    ├── index.css               # Global styles, Quill overrides, animations
    │
    ├── context/
    │   └── AppContext.jsx      # Global state, axios instance, all fetches
    │
    ├── hooks/
    │   ├── useDebounce.js      # Debounce any value by N ms
    │   └── useLocalStorage.js  # useState that persists to localStorage
    │
    ├── components/
    │   ├── Navbar.jsx          # Sticky nav with user dropdown
    │   ├── Hero.jsx            # Search banner + quick tags
    │   ├── JobCard.jsx         # Job listing card (used in grid + sidebar)
    │   ├── JobListings.jsx     # Filter sidebar + paginated grid
    │   ├── SkeletonCard.jsx    # Loading skeleton matching JobCard shape
    │   ├── AppDownload.jsx     # Mobile app download banner
    │   ├── Footer.jsx          # Footer with social links
    │   ├── Loading.jsx         # Full-screen spinner
    │   ├── ErrorBoundary.jsx   # React error boundary with styled fallback
    │   ├── RecruiterLogin.jsx  # Company sign-in / sign-up modal
    │   └── UserLogin.jsx       # Job seeker sign-in / sign-up modal
    │
    └── pages/
        ├── Home.jsx            # Landing: Hero + JobListings + AppDownload
        ├── ApplyJob.jsx        # Job detail + apply + related jobs
        ├── Applications.jsx    # My applications + resume upload
        ├── Dashboard.jsx       # Recruiter layout with sticky sidebar
        ├── AddJob.jsx          # Post a new job (Quill rich text)
        ├── ManageJobs.jsx      # Manage company job listings
        ├── ViewApplications.jsx # Review + accept/reject applications
        └── NotFound.jsx        # 404 page
```

---

## Authentication Flow

### Job Seekers

- Register / login via **UserLogin** modal
- Token stored in `localStorage` under key `"Token"`
- Auth header injected automatically by the `api` axios instance
- Protected route: `/applications`

### Recruiters / Companies

- Register / login via **RecruiterLogin** modal
- Token stored in `localStorage` under key `"companyToken"`
- Protected routes: all `/dashboard/*` paths
- Logout via `logoutCompany()` from context

### Axios Instance (`api`)

A single configured axios instance lives in `AppContext` and is shared across all components via context. It:

- Attaches `Authorization: Bearer <token>` on every request
- Handles `401` globally — clears tokens and redirects to home once (no loops)
- Has a 15-second timeout

**All data-fetching components use `api` from context — never raw `axios` directly** (except the auth login forms themselves, which POST before a token exists).

---

## Key Technical Decisions

### State Management

- Single `AppContext` with `useCallback`-memoised fetch functions
- In-flight request guard via `useRef` prevents duplicate fetches under React StrictMode
- Job listings cached in `localStorage` for 5 minutes (versioned key `jp_jobs_v2`)

### Search

- Hero uses **controlled inputs** (not uncontrolled refs) so quick-tag clicks properly sync
- `useDebounce` hook available for any future live-search feature

### Routing

- Route guards (`UserRoute`, `CompanyRoute`) redirect unauthenticated users to `/`
- `/dashboard` index redirects to `/dashboard/manage-jobs` (guarded by `location.pathname` check to avoid infinite redirects)
- Full 404 page for unmatched routes

### Loading States

- `jobsLoading` boolean exposed from context
- `SkeletonCard` / `SkeletonGrid` render while jobs fetch — eliminates blank-grid flash on first load

### Security

- All `dangerouslySetInnerHTML` calls go through `DOMPurify.sanitize()`
- No raw HTML injection anywhere else

---

## Scripts

```bash
npm run dev       # Start Vite dev server
npm run build     # Production build
npm run preview   # Preview production build locally
npm run lint      # ESLint
```

---

## Bug Fixes Applied (full changelog)

### Critical Bugs

| #   | File                   | Bug                                                                                                                  | Fix                                            |
| --- | ---------------------- | -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| 1   | `ApplyJob.jsx`         | `DOMPurify` used but never imported — runtime crash                                                                  | Added import                                   |
| 2   | `ApplyJob.jsx`         | Bottom "Apply Now" button called `navigate()` instead of `handleApplyJob()`                                          | Fixed handler                                  |
| 3   | `Applications.jsx`     | Resume `href=""` — linked to nothing                                                                                 | Reads `userData.resume`                        |
| 4   | `Applications.jsx`     | `localStorage.getItem("token")` wrong key (should be `"Token"`)                                                      | Fixed key                                      |
| 5   | `Hero.jsx`             | Uncontrolled refs — quick-tag clicks didn't sync with input display                                                  | Converted to controlled state                  |
| 6   | `Dashboard.jsx`        | `NavLink` used both `className` render prop AND `children` render prop simultaneously — `isActive` only works in one | Removed children render prop                   |
| 7   | `Dashboard.jsx`        | `useEffect` re-redirected every time `companyData` changed, not just at `/dashboard`                                 | Added `location.pathname` guard                |
| 8   | `AppContext.jsx`       | `logout()` cleared user token but not `companyToken` state                                                           | Added `logoutCompany()`, fixed both            |
| 9   | `AppContext.jsx`       | Fetch functions not in `useCallback` — stale closures in `useEffect` deps                                            | Wrapped all in `useCallback`                   |
| 10  | `AddJob.jsx`           | Used raw `axios.post` bypassing auth interceptor                                                                     | Switched to `api` from context                 |
| 11  | `ManageJobs.jsx`       | Used raw `axios` with manual `{ token: companyToken }` header                                                        | Switched to `api` from context                 |
| 12  | `ViewApplications.jsx` | Used raw `axios` with manual token header                                                                            | Switched to `api` from context                 |
| 13  | `Applications.jsx`     | Used raw `axios` with manual `Authorization` header for resume upload                                                | Switched to `api` from context                 |
| 14  | `vite.config.js`       | Used `__dirname` which doesn't exist in ESM modules                                                                  | Fixed with `fileURLToPath` + `import.meta.url` |
| 15  | `ApplyJob.jsx`         | `key={index}` on related jobs list — causes reconciliation bugs                                                      | Changed to `key={job._id}`                     |
| 16  | `ApplyJob.jsx`         | No empty state when company has no other jobs                                                                        | Added empty state UI                           |
| 17  | `ApplyJob.jsx`         | Unauthenticated user sees disabled button with no explanation                                                        | Added "Sign In to Apply" state + login prompt  |
| 18  | `ApplyJob.jsx`         | No error state if job fetch fails — white screen                                                                     | Added `fetchError` state with redirect UI      |
| 19  | `main.jsx`             | Missing `<StrictMode>` wrapper                                                                                       | Added                                          |
| 20  | `App.jsx`              | No route guards — `/applications` and `/dashboard` fully public                                                      | Added `UserRoute` and `CompanyRoute`           |
| 21  | `App.jsx`              | No 404 handling                                                                                                      | Added `NotFound` page + catch-all route        |

### UI/UX Improvements

- **Navbar**: Click-based dropdown (not hover-only), outside-click closes it, shows user email
- **Hero**: Dark gradient banner, dot-grid texture, animated badge, quick-filter tag pills, clear (×) buttons on inputs
- **JobCard**: Color-coded level badges, hover effects, company name subtitle, `line-clamp` descriptions
- **JobListings**: Sticky filter sidebar, active filter count badge, skeleton grid while loading, smart ellipsis pagination, "Clear all" empty state button
- **ApplyJob**: Full redesign — gradient header card, sticky sidebar, back button, better apply CTA
- **Dashboard**: Fixed sidebar with sign-out shortcut, "View Job Board" link, hover dropdown
- **ManageJobs**: Stats cards (total/active/applicants), toggle switches instead of checkboxes
- **ViewApplications**: Stats row, inline Accept/Reject buttons, applicant email shown
- **Applications**: Card-wrapped sections, resume filename shown when selected, proper empty state
- **AddJob**: Live character counter, monthly salary estimate, "Clear Form" button
- **RecruiterLogin**: Step indicator, logo dropzone, click-outside-to-close
- **UserLogin**: Show/hide password toggle, click-outside-to-close, better photo upload
- **AppDownload**: Dark banner with dot grid, social proof, app glow halo
- **ErrorBoundary**: Layered card illustration, dark dev error panel
- **Loading**: Clean two-ring spinner
- **NotFound**: Stacked 404 illustration with navigation options

### New Files

- `src/hooks/useDebounce.js` — debounce hook
- `src/hooks/useLocalStorage.js` — localStorage-persisted state
- `src/components/SkeletonCard.jsx` — animated loading skeleton
- `src/pages/NotFound.jsx` — standalone 404 page
- `.env.example` — environment variable template

---

## Dependencies

| Package               | Purpose                                     |
| --------------------- | ------------------------------------------- |
| `react` + `react-dom` | UI framework                                |
| `react-router-dom`    | Client-side routing                         |
| `axios`               | HTTP client                                 |
| `react-toastify`      | Toast notifications                         |
| `quill`               | Rich text editor (job descriptions)         |
| `dompurify`           | Sanitise HTML from the editor               |
| `moment`              | Date formatting                             |
| `k-convert`           | Salary number formatting (e.g. 75k)         |
| `lucide-react`        | Icon library                                |
| `@clerk/clerk-react`  | (Available — auth can be switched to Clerk) |

---

## Contributing

1. Fork the repo
2. Create your feature branch: `git checkout -b feat/my-feature`
3. Commit your changes: `git commit -m 'feat: add my feature'`
4. Push and open a PR

---

_Built for Learning Purposes — Jacob Kimani, 2025_
