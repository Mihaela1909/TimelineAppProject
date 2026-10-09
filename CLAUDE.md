# Timeline App — project notes for Claude Code

Vue 3 + Vite + Tailwind front end, Appwrite backend (TablesDB + Storage), no server code.

## Coding rules
@AGENTS.md

All architecture, SRP/SoC, check-and-reset, Vue and design rules are in `AGENTS.md` (imported above). This file holds only project-specific state and decisions.

## Image storage & approval (decided — don't revert)
We previously used ONE media bucket with **File Security ON** and per-file permissions (public vs. private uploads). It kept breaking (images not loading/changing), so we pivoted:

- Media bucket: **File Security OFF**, bucket permissions `Read → any`, `Create → users`. `mediaService.uploadImage()` passes no per-file permissions. Do NOT reintroduce per-file permissions.
- Image URLs use `storage.getFileView()` — `getFilePreview()` needs a paid plan.
- No "choose existing / gallery" picker anywhere — uploads only (`ImageUpload.vue` for admin content, `AvatarUpload.vue` for personal photos).

### Avatar / profile header moderation
A user's upload does NOT go live until an admin approves it.
- **Pending** IDs: `profile_settings.pendingAvatarImageId` / `pendingHeaderImageId`. Each user can read/update their own row.
- **Live** IDs: `profiles.avatarImageId` / `profiles.headerImageId`. Users can read but NOT update `profiles` (it also holds `role`).
- Why split across tables: Appwrite permissions are per-row, not per-column. If the live ID sat in a user-writable row, anyone could set it via the API and skip approval. Never move live image IDs into `profile_settings`.
- Flow: `ProfileView` → `submitPendingImage(userId, 'avatar'|'header', fileId)` (null = cancel). Removing a photo is also a request: the pending value is `REMOVE_IMAGE` (`constants/images.js`); approving it sets the live ID to null. `AvatarUpload` shows "Remove photo" only when there's a live photo and no open request, and the approvals page shows a "Remove photo" box instead of a preview. Admin page `/admin/image-approvals` (`AdminImageApprovalsView.vue`, admin role only) → `approvePendingImage` copies pending → `profiles` via `profileService.setProfileImage`, then clears pending; `rejectPendingImage` just clears it.
- `useAuth().currentUser` exposes `avatarImageId`, `headerImageId`, `pendingAvatarImageId`, `pendingHeaderImageId`.

### Required Appwrite console setup
- `profiles`: columns `avatarImageId`, `headerImageId` (String, optional). Table-level `Read` + `Update` for label `admin`. Users must have NO update permission.
- `profile_settings`: columns `pendingAvatarImageId`, `pendingHeaderImageId` (String, optional). Table-level `Read` + `Update` for label `admin` (otherwise the approvals page only sees the admin's own row).
- Admin accounts need the Appwrite user label `admin` (Auth → user → Labels) in addition to `role: admin` in `profiles`.
- The old `profile_settings.avatarImageId` / `headerImageId` columns are no longer read and can be deleted once any existing photos have been copied into `profiles`.

## Admin dashboard
- `/admin` → `AdminDashboardView.vue` + `useAdminDashboard.js` + `dashboardService.js`. Stat cards use `listRows(limit 1).total`; Users = row count of `profiles`.
- Recent Activity has no log table: it merges the newest rows of courses/quizzes/blog posts (by `$updatedAt`, "published" vs "Draft saved") and profiles (by `$createdAt`, "New user signed up").
- `profiles.name` (String, optional) is written at registration so admin pages can show names. Older users have no name until backfilled.
- `createProfile` sets explicit `Read → that user` permissions. Appwrite's default would grant the creator update/delete, letting users edit their own `role`.
- Phones (< md): the sidebar is a slide-in drawer opened from a bark top bar (menu button); it closes on navigation, Escape or a tap outside. Admin tables hide secondary columns on phones (`hidden sm:table-cell` etc.) and show that info under the main cell instead.
- Sidebar (`AdminLayout.vue`): the "Users" group (Statistic, Inactive, Users, Image Approvals) is admin-only and hidden for editors. Statistic → `AdminStatisticsView.vue`.

## Admin Users page
- `/admin/users` and `/admin/users/inactive` both use `AdminUsersView.vue` (`inactiveOnly` prop) + `useAdminUsers.js`. Each "user" is a `profiles` row, because the client SDK can't list Auth accounts.
- `profiles` columns used: `name`, `email` (copied at registration; NOT synced if the user later changes email), `role`, `active` (Boolean, default true; `null` = active), `avatarImageId`.
- The ••• menu changes `role` or sets `active`. It's disabled on the admin's own row so they can't lock themselves out.
- Deactivation is enforced in `useAuth.refreshCurrentUser`: `active === false` → session deleted, and login shows "account deactivated". This is client-side only: an open session lasts until the next page load, and the API still accepts the user's session. For a hard block use Appwrite console → Auth → user → Block (needs server SDK to automate).
- Changing `role` to admin in the app does NOT add the Appwrite `admin` label (labels need the server SDK). A newly promoted admin can open admin pages but their writes fail until the label is added in the console.
- Icons: `components/ui/AppIcon.vue` (inline SVG). No icon library is installed.

## Admin Statistics page
- `/admin/stats` → `AdminStatisticsView.vue` + `useAdminStatistics.js` (pure `buildStatistics()`) + `statsService.js` (`listAllRows` cursor-paginates).
- Appwrite has no aggregate queries, so all stats are computed client-side from full reads of profiles, courses, published lessons, quizzes, progress, quiz_attempts. Move to an Appwrite Function if tables get large.
- Admin needs table-level Read (label `admin`) on `progress` and `quiz_attempts` — their rows are otherwise owner-only.
- Charts are plain HTML/Tailwind (no chart library), single-series in olive, values labelled directly.

## Listing & deleting rows
- Appwrite `listRows` returns only 25 rows by default. Any "get all" read must use `listAllRows()` from `services/rowHelpers.js` (cursor pagination). Only use raw `listRows` with an explicit `Query.limit`.
- Deletes cascade in the services: `deleteCourse` → its lessons (+ their progress), quizzes (+ questions, attempts), remaining progress; `deleteQuiz` → questions + attempts; `deleteLesson` → its progress. Children are deleted first, so a failure leaves the parent in place to retry.
- Cascades need table-level `Delete` for labels `admin` AND `editor` on lessons, quizzes, quiz_questions, quiz_attempts, progress (editors can delete courses/quizzes too).

## Categories
- Course and blog post categories are plain strings on each row. There's no categories table, so a new category exists once a row is saved with it.
- Admin forms use `components/ui/CategoryPicker.vue`: pick an existing one or "+ Create". It matches case-insensitively, so "ancient" reuses "Ancient".
- Options come from `useAdminCourses().categories` / `useAdminBlogPosts().categories` (blog also includes the built-in `CATEGORY_STYLES` names).
- Blog badges use `categoryStyle(name)` from `constants/blogCategories.js`, with a grey fallback for new categories.

## Public site / home page
- Layout: `AppHeader` (sticky, `top-0 z-40`; anchor scrolls offset by its 80px height; logo, nav, ochre profile circle → account menu with My profile / Admin panel for staff / Log out; hamburger menu on phones) and `AppFooter`. The logo is `public/images/logo.webp` (white artwork) via `AppLogo.vue` (`size` sm/md/lg, `link`).
- Home sections in `components/home/`. Shared UI: `SectionHeading` (title + line + diamond), `CardCarousel` (arrows on md+, swipe on phones), `HistoryCard` (course/blog card).
- Images in `public/images/home/`. The quiz section still uses one flat background image on md+, stacked as a band on phones.
- Who-are-we is built from layers in `public/images/home/who-are-we/` inside a square stage, positioned in %: ring-back → window → napoleon → window-front → rings-front. The olive diagonal is CSS `clip-path` and the dots sit behind it. Napoleon rides in diagonally from bottom-right each time the section scrolls into view; he resets only after the section fully leaves the screen (`composables/useInView.js` with `once: false`; no motion with reduced-motion settings). He is clipped only on the right (right column's outer edge, 84.7%) and bottom (sill, 85%), measured from window.webp, so he breaks out of the frame top-left on purpose.
- Hero logo: `components/layout/AnimatedLogo.vue`, an inline SVG built from "timeline logo.svg" (big version). Act 1: the small mark assembles in the centre (circle fades up, birds fly in, diamond drops, "I" rises). Act 2: everything slides left (`.slide`, 100 units) while the underline grows and "imeline" (live text in Metamorphous) is traced and filled. Only translate/opacity are animated (no scale/rotate) to avoid SVG transform-origin issues. It waits for the font, replays on scroll-in (`useInView`), and has no motion with reduced-motion settings. Header, footer and sidebar still use `logo.webp` via `AppLogo`.
- No separate About page: the Who-are-we section has `id="about"`, and every "About us" link (header, footer, hero) goes to `/#about`. `/about` redirects there. Router `scrollBehavior` smooth-scrolls to `to.hash` (waits 350ms when coming from another page). The header checks the hash itself for the active underline, because Vue Router ignores hashes when marking links active.
- Event of the Day: `services/wikimediaService.js` (Wikipedia "On this day" REST API, no key, CORS OK) → `useEventOfDay.js` picks one pre-1900 event by day-of-year, so it's the same all day.
- "Start Quiz" opens a random published quiz. The "recommended course" quiz in the copy doesn't exist yet.
- "Most Popular Courses" shows the first published courses, not real popularity; guests can't read progress, so there's no popularity data.

## Courses page
- `/courses` → `CoursesView.vue` + `components/courses/CoursesHero.vue`. The hero figures are in `public/images/courses/figures/`, placed in % of two bottom-anchored group boxes (left / right). The values were fitted against the 1648×604 mockup (pixel matching + difference-overlay check). On md+ the hero keeps that aspect ratio, so they match Figma at any width. A short umber fade (28% high) sits over the figures' bottoms. Entrance: each figure has a `row` (0 = back … 2 = front); rows rise from below the bottom edge one after another (`ROW_DELAY` 0.28s), replaying on scroll-in via `useInView`.
- Background: `public/images/courses/hero-bg.webp`.
- Status badges ("In Progress" with a bar / "Completed") come from `useCourseStatuses` (2 reads: the user's progress + all published lessons). Guests see none.
- Sort options: Newest / A–Z / Most lessons. There's no "Popular", because there's no popularity data. 6 per page via `components/ui/PaginationNav.vue`. `HistoryCard` has `layout="grid"` for grids.

## Course + lesson pages
- `/courses/:id` → `CourseDetailView.vue`; `/courses/:id/lessons/:lessonId` → `LessonView.vue`. Both use `components/courses/CourseBanner.vue` (header image, falling back to cover, grayscale + umber fade).
- Overview: the main button is "Start course" / "Continue · Lesson N" / "Review course". Lesson rows are done (parchment + ✓) / current = first not-done (ochre) / upcoming (white). The course quiz (from `useCourseDetail().quiz`) unlocks once all lessons are done; the lock is UX only, the quiz page itself stays public.
- Lesson page: the "Lesson N of M" bar shows position in the course; Mark as Complete via `useCourseProgress`. "Undo" on the Completed bar calls `unmarkComplete` → `progressService.unmarkLessonComplete` (deletes the user's own progress row; rows grant delete to their owner). Requires **Row Security ON** for `progress`, otherwise Appwrite ignores the row permissions and returns 401. Never give `users` table-level Delete. `progress` and `quiz_attempts` rows grant their owner Read + Delete only (no Update), so users can't edit their own scores/progress via the API; never give `users` table-level Update on them either. Moving to another lesson scrolls to the top (normal `scrollBehavior`). `components/courses/LessonSelect.vue` (native `<select>`, ✓ on done lessons) next to the "Lesson N of M" bar jumps to any lesson. Lesson content uses the shared `.reading-content` typography (see Blog pages).

## Quizzes page
- `/quizzes` → `QuizzesView.vue` + `components/quizzes/QuizzesHero.vue` (Thinker + "Eureka!", Tesla + "Hmmm..", fitted against the 1459×540 mockup like CoursesHero; background `bg-bottom`; figures rise, then bubbles pop) + `components/quizzes/QuizCard.vue`.
- Status pills come from `useQuizStatuses` (the user's attempts → best % vs the quiz `passingScore`, default 70; plus `useCourseStatuses` for "Course not completed"): Passed (leaf) / Failed (ochre) / Course not completed (wine, "Finish Course" + "Start anyway") / Not attempted (taupe). Guests get just "Start Quiz".
- Quiz categories come from the linked course's category. Sort: A–Z / Z–A / Newest. 6 per page.

## Quiz-taking page
- `/quizzes/:id` → `QuizTakingView.vue` (state in `useQuizTaking`, which also loads the course's published lesson count) with three dumb components in `components/quizzes/`: `QuizIntro` (status pill, stat boxes, Start/Retake, history OR course progress), `QuizQuestion` (2×2 answers, feedback, Next), `QuizResults`. The phases swap with a `<Transition>`. The card body reuses `images/home/who-are-we/dots.webp`.
- Optional fields shown if present: `quiz.description` (fallback "Test what you learned in <course>.") and `question.explanation` (fallback: the correct answer on a wrong pick). Neither column exists yet; add String columns + admin form fields to use them.
- Est. time = 0.4 min per question. `timeAgo` lives in `utils/time.js`.

## Event of the Day page
- `/event-of-the-day?date=YYYY-MM-DD` → `EventOfDayView.vue`. The date lives in the URL (shareable, back button works); an invalid or missing date means today. Prev/next day, a native date picker (transparent `<input type=date>` over the date), and "Get a random date" (same year).
- Data: `wikimediaService.getOnThisDay` (Wikipedia `/feed/onthisday/all`: events + births) → `useEventOfDay().fetchFor(date)`. Featured = pre-1900 event picked by day-of-year. "Also on this day" = 2 other events + 1 pre-1900 birth (`pickAlsoOnThisDay`). Topics are a keyword guess (`topicOf`), colours in `constants/eventCategories.js`. Births show as "<Name> is born." (`displayText`).
- Reuses the home frame image cropped to the frame only (x 6–69%, y 8.4–87.6%) and `books.webp`. The background is `public/images/event/dots-wave.webp`, top as-is and bottom flipped. Share uses `navigator.share`, falling back to copying the link.

## Login / register
- `/login` and `/register` are top-level routes WITHOUT `PublicLayout` (full-screen scene, no header/footer); the card logo links home. Both keep `?redirect=` when switching between them.
- `components/auth/AuthScene.vue` (dots + olive diagonal + Napoleon artwork from xl/1280px up, card with the static brown `AnimatedLogo :animated="false"`, title, form slot) + `AuthField.vue`. Form logic is unchanged (`useAuth` login/register).
- The window artwork is the shared `components/ui/NapoleonWindow.vue` (`playing`, `layout` 'home' | 'auth'), also used by `WhoAreWe`. 'auth' = ring positions + Napoleon inside the frame, from the login mockup. Mirror a ring with `[--flip:-1]` (part of the pop animation's transform).

## Blog pages
- `/blog` → `BlogView.vue` + `components/blog/BlogHero.vue` (Fitzgerald + Woolf, Camus + Kafka, fitted against the 1408×520 mockup like the other heroes; background `public/images/blog/hero-bg.webp`, unfiltered since its brightness already matches the mockup). 2×2 `HistoryCard` grid (`date` prop: date left, read time right), 4 per page. Sort: Newest / Oldest / A–Z (no "Popular": no view counts).
- `/blog/:id` → `BlogPostDetailView.vue`: grayscale cover banner, dot waves, category pill, intro box (date / read time), diamond divider, content (`.reading-content` in `style.css`: Amethysta h2/h3, roomier paragraphs; shared with lessons), Share, then a "Browse more" carousel (same category first).
- Saved posts: `saved_posts` table (`userId`, `postId`, both String required), env `VITE_APPWRITE_SAVED_POSTS_TABLE_ID`. **Row Security ON**, table-level Create → Users only; each row grants Read + Delete to its owner (set in `savedPostService.savePost`). `useSavedPosts` is module-scope state shared by the post page's Save/Saved button and the profile's "Saved Posts" tab (`components/profile/SavedPostsTab.vue`). Guests clicking Save go to login and come back.
- "Browse more" only renders when there's at least one other published post.
- `formatDate` / `readTimeText` live in `utils/time.js`.

## Profile page
- `/profile` → `ProfileView.vue` (state from `useAuth`, `useProfileProgress`, `useProfileImages`, `useSavedPosts`) with dumb components in `components/profile/`: `ProfileHeader` (full-width grayscale header image + bark strip, round avatar with a bark border overlapping it, name; staff get an "Admin panel" link), `ProfileSection` (white card, dots on the right, title + diamond-ended line), `ProfileCoursesTab` ("Continue on:" / "Completed:" `HistoryCard` grids), `QuizHistoryTab` ("Review performance:"), `SavedPostsTab`, `ProfileTabs` (v-model tab bar), `ProfilePhotosCard`.
- Stat boxes: shared `components/ui/StatBoxes.vue` (also used by `QuizIntro`); the parent's class sets the layout. Tabs: My Courses / Quiz History / Saved Posts / Settings.
- Settings: one "Save Changes" for name + email (only changed fields are sent; the password field appears only when the email changed), a Profile Photos card (`AvatarUpload`, approval flow unchanged), Change Password, and the delete box (signs out only; real deletion needs a server function). Inputs reuse `components/auth/AuthField.vue` (`required` prop, default true).
- `splitTitle` / `lessonsText` for course cards live in `utils/text.js`.

## 404 page
- `NotFoundView.vue` (lazy): unknown URLs AND routes the guard blocks for the user's role (so the admin area isn't advertised). Dot waves, "Lost in time", Back to home / Browse courses.
- Quiz editor's question list (drag + keyboard reorder) is `components/admin/QuizQuestionList.vue`; it emits `move(from, to)` / `delete(question)`.

## SEO
- `index.html` has the default description, Open Graph / Twitter tags and canonical; `public/og-image.jpg` (1200×630, the home hero) is the link-preview image.
- `utils/pageMeta.js` `setPageMeta()` sets title (`<Page> | Timeline`), description, robots, og:*, canonical. `router.afterEach` calls it from route `meta.title` / `meta.description` / `meta.noindex` (login, register, profile, admin, 404 are noindex). Course, lesson, quiz and blog-post pages refine it from loaded data via `composables/usePageMeta.js`.
- `public/robots.txt` (Disallow /admin, /profile) + `public/sitemap.xml`, which is GENERATED by `scripts/generate-sitemap.mjs` in `npm run build` (git-ignored). The script reads published rows via Appwrite's public REST API as a guest (no API key) and falls back to static pages only if Appwrite is unreachable. Appwrite Sites' build command must be `npm run build` for this to run.
- Without robots.txt the SPA fallback served index.html for /robots.txt, which Lighthouse reported as "robots.txt is not valid".

## Web security (XSS / CSRF / brute force / abuse)
- XSS: Vue escapes `{{ }}`. The only `v-html` (lesson + blog content) goes through `utils/sanitizeHtml.js` (allow-list of StarterKit + Link tags; `href` only http/https/mailto/relative; external links get `rel="noopener noreferrer"`). Never add a `v-html` without it. Wikipedia links are accepted only if they're `https://*.wikipedia.org/` (`wikimediaService`).
- CSRF: Appwrite requires the `X-Appwrite-Project` header and rejects unregistered origins (tested: unknown Origin → 403 `general_unknown_origin`). Keep Console → Platforms limited to `timeline.appwrite.network` + localhost.
- Brute force: Appwrite rate-limits email/password login (tested: 11th attempt → 429).
- Console settings still to check: media bucket Maximum file size (e.g. 5 MB) + Allowed extensions `jpg, jpeg, png, webp, gif` (no svg/html: files are publicly served); Auth → Security: password dictionary + personal-data check.

## Performance
- Google Fonts load non-blocking (`rel=preload` + `onload` → stylesheet, `<noscript>` fallback). `AnimatedLogo` therefore waits for Metamorphous's @font-face to appear (`waitForFont`, max 3s) before animating.
- Hero (LCP): `hero-sm.webp` (900w) on phones / `hero.webp` on md+, set in `HeroSection` CSS and preloaded in `index.html` with matching `media` + `fetchpriority="high"`.
- Big home art has `-sm.webp` variants used via `srcset`/`sizes` (window, napoleon, building, event-of-the-day). New large static images: add a `-sm` version the same way, and `width`/`height` attributes.
- Router: routes with `meta.authOptional` (home, blog, event of the day) don't wait for the auth check before rendering; others still await it, because their views read `currentUser` on mount. `refreshCurrentUser()` shares one in-flight request; login/register/profile updates call it with `{ force: true }`, and only the newest load writes (`latestLoad`). Profile + settings rows load in parallel.
- Uploads are shrunk in the browser first (`utils/compressImage.js`: max 1600px, WebP 0.82; GIF/SVG untouched; keeps the original if not smaller). The 5 MB limit applies after compression. Images uploaded before this stay full-size until re-uploaded. The media bucket must allow `.webp` if it has an extension allow-list.

## Accessibility & UI states
- `App.vue` has a "Skip to main content" link (visible on first Tab) → `<main id="main">` in `PublicLayout`, `AdminLayout` and `AuthScene`.
- `ToastContainer` is a `role="status"` live region, so toasts are announced. Error boxes use `role="alert"`, skeletons `aria-live="polite"`.
- `ConfirmModal` is an `alertdialog`: focus goes to Cancel on open, Tab is trapped, Escape / backdrop click cancel, focus returns on close.
- Admin edit forms: `fetchOne` in the admin composables has its own `loadingOne` / `loadError`, so the form shows a skeleton or a Retry box instead of an empty form. Deletes use `deleting`, user changes `updating` (double-click guards).

## Known gaps / next priorities
1. Rejected/replaced files stay in the bucket (orphaned). Cleanup would need bucket `Delete` for label `admin`, then `deleteImage()` on reject/replace.
2. Role/label sync and hard user blocking need an Appwrite Function (server SDK + API key).
