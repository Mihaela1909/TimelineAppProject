# Timeline — Project Architecture

Read this before writing any code. If you're an AI coding agent, treat this
file as your instructions for where new code belongs and what patterns to
follow. Do not invent a different structure — extend this one.

## Folder structure and what belongs where

```
src/
├── services/       DATA ACCESS. The ONLY layer allowed to import the
│                   Appwrite SDK. One file per collection/entity
│                   (courseService.js, lessonService.js, quizService.js...).
│                   Functions here take/return plain data — no ref(), no
│                   Vue imports. If it's not obvious how to fetch/write
│                   something without Vue, it belongs here.
│
├── composables/    APPLICATION LOGIC. Owns reactive state (ref, computed)
│                   and orchestrates calls to services/. One composable per
│                   concern (useCourses, useAuth, useQuizAttempt...).
│                   Composables NEVER import Appwrite directly — only
│                   services/. This is what components import.
│
├── components/     UI, grouped by feature area:
│   ├── layout/       AppHeader, AppFooter — used on every page
│   ├── home/         Homepage sections only
│   ├── course/        Course/lesson related components
│   ├── quiz/          Quiz-taking UI components
│   ├── blog/          Blog card/list components
│   ├── admin/         Shared admin UI: DataTable, ConfirmModal, Toast,
│   │                  FormField — reused across every admin entity page
│   └── ui/            Truly generic, content-agnostic: Button, Badge,
│                       Card, ProgressBar. If it doesn't know what a
│                       "course" is, it goes here.
│
├── views/          One component per ROUTE. Views compose components/ +
│                   composables/. Views should stay thin — if a view file
│                   is getting long, that's a sign logic belongs in a
│                   composable instead.
│
├── layouts/        PublicLayout.vue (header+footer) and AdminLayout.vue
│                   (sidebar). Chosen per-route in router/index.js, not
│                   inside individual views.
│
├── router/         index.js only. Route definitions + the navigation
│                   guard (router.beforeEach). This is where
│                   requiresAuth / requiresRole get enforced on the
│                   frontend — but see the security note below.
│
├── constants/       Fixed values used in multiple places (roles.js,
│                   categories.js). Import these instead of typing raw
│                   strings like 'admin' around the codebase.
│
├── stores/         Only if a piece of state is needed across many
│                   unrelated components (e.g. the logged-in user).
│                   Most state should live in composables instead — don't
│                   reach for a store by default.
│
└── data/           Temporary mock data only. Every file here should have
                    a matching service that will replace it. Nothing in
                    data/ should be imported by a component directly —
                    only by its matching service file.
```

## The rule that matters most

**Components never talk to Appwrite. Components call composables.
Composables call services. Services call Appwrite.**

If you're an AI agent adding a new feature, follow this exact chain even if
it feels like more files than necessary for something simple. This
separation is explicitly what this project is graded on.

## Security — read before touching auth or admin features

A `meta: { requiresRole }` check in `router/index.js` is a **UX
convenience only**. It stops a user from *seeing* a page they shouldn't,
but it does nothing to stop them from calling the Appwrite API directly
with dev tools open. The real security boundary is **Appwrite's
collection-level permissions**, configured in the Appwrite console:

- Public content (`courses`, `lessons`, `quizzes`, `blog_posts`): Read: `any`,
  Write: `role:admin` + `role:editor`
- Personal data (`progress`, `quiz_attempts`): Read/Write: `user:[USER_ID]`
  only — never `role:users` generally, or one user could read another's data
- `profiles` (stores each user's role): Write restricted to `role:admin` only,
  so a user can never edit their own document to promote themselves

Never trust that an AI agent got this right without checking it yourself in
the Appwrite console. See the security testing checklist in the project
docs for how to actually verify this (try to hit the API as the wrong role
and confirm it's rejected).

## Naming conventions

- Components: PascalCase (`CourseCard.vue`)
- Composables: camelCase, always prefixed `use` (`useCourses.js`)
- Services: camelCase, suffixed `Service` (`courseService.js`)
- Route names: kebab-case (`course-detail`, `admin-courses`)

## When adding a new entity (e.g. Quizzes)

Follow the exact pattern already built for Courses:
1. `src/data/mockQuizzes.js` — shape matching the future Appwrite collection
2. `src/services/quizService.js` — get/create/update/delete functions
3. `src/composables/useQuizzes.js` — reactive wrapper around the service
4. `src/views/CoursesView.vue`-equivalent for the public list/detail pages
5. `src/views/admin/AdminQuizzesView.vue` + a form view, reusing
   `components/admin/DataTable.vue` and `FormField.vue` rather than
   rebuilding the table/form UI from scratch

## Current status (update this as you go)

- [x] Vue 3 + Vite + Tailwind scaffold
- [x] Router with layouts, guard structure (guard logic is a stub — no
      real auth wired up yet)
- [x] Courses: service + composable + homepage display (mock data)
- [ ] Appwrite project connected (see services/appwrite.js)
- [ ] Auth (useAuth.js, real Login/Register views)
- [ ] Roles + working navigation guard
- [ ] Course Catalog + Detail + Lesson views (real, not placeholder)
- [ ] Admin CRUD: Courses
- [ ] Admin CRUD: Quizzes, Blog Posts
- [ ] Quiz-taking flow
- [ ] User profile/dashboard
