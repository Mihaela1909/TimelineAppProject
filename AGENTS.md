# AGENTS.md — coding rules for AI assistants (and humans)

Vue 3 (`<script setup>`, Composition API) + Vite + Tailwind 3 + Appwrite (TablesDB + Storage). No backend code.
Read this before changing anything. Project-specific Appwrite setup and past decisions live in `CLAUDE.md`.

## 1. Architecture — Separation of Concerns (SoC)

Each layer has ONE kind of job. Data flows one way: **view → composable → service → Appwrite**.

| Layer | Folder | Does | Never does |
|---|---|---|---|
| Client | `services/appwrite.js` | Creates the Appwrite client, exports IDs | Anything else. The ONLY file that imports the client from `appwrite`. |
| Data access | `services/*Service.js` | One file per table/resource. Plain async functions that read/write Appwrite and return data. | Touch Vue (`ref`, toasts, router), format text for the UI, catch-and-hide errors |
| Application logic | `composables/use*.js` | State (`ref`s), loading/error handling, combining services, computing derived data | Render anything, call `tablesDB`/`storage` directly |
| Pages | `views/`, `views/admin/` | Layout of one route, wiring user events to composable functions | Call services or Appwrite directly, contain business rules |
| Reusable UI | `components/ui/`, `components/layout/` | Presentational pieces driven by props/emits | Fetch data or know which table they're for |
| Structure | `layouts/`, `router/`, `constants/`, `utils/` | Page shells, routes + guards, shared constants, small pure helpers (no Vue, no Appwrite) | — |

**Prefer:** adding a function to the right existing service/composable over creating a new file.
**Avoid:** a view importing from `services/` (only `getImagePreviewUrl` is allowed).

## 2. Single Responsibility Principle (SRP)

- One service file per table. One composable per feature/screen (`useAdminUsers`, `useAdminDashboard`).
- One function = one job. If a name needs "and" (`loadAndFormatAndSave`), split it.
- Pure calculations go in plain functions (e.g. `buildStatistics()`), separate from the code that loads data, so they can be tested alone.
- Components stay small. If a view passes ~250 lines or has a self-contained block (a modal, a table row with a menu), extract it to a component.
- Shared helpers live in one place:
  - pagination/bulk delete → `services/rowHelpers.js`
  - required-field messages → `utils/formChecks.js`; each composable declares its own `REQUIRED_IMAGES`
  - roles → `constants/roles.js`
  - icons → `components/ui/AppIcon.vue`

  Don't re-implement them.

## 3. Checks and resets (every user action)

Every async action a user can trigger (save, delete, change role, upload, approve, login…) follows this shape in its composable:

```js
async function save(id, data) {
  if (saving.value) return false            // CHECK: already running (double-click)
  const problem = validate(data)            // CHECK: input is valid
  if (problem) { error.value = problem; return false }

  saving.value = true
  error.value = null                        // RESET: clear the previous error
  try {
    await service.save(id, data)
    return true
  } catch (err) {
    console.error(err)                      // keep the real error for debugging
    error.value = 'Could not save. Please try again.'   // friendly message for the user
    return false
  } finally {
    saving.value = false                    // RESET: always, even on failure
  }
}
```

- **Checks before acting:**
  - Validate input and trim strings.
  - Block duplicate submits: disable the button while `saving`/`loading` is true.
  - Confirm destructive actions with `ConfirmModal`.
  - Block self-destructive actions, e.g. an admin demoting or deactivating themselves.
- **Resets after acting:**
  - Clear `error` at the start of each attempt.
  - Turn `loading`/`saving` off in `finally`.
  - Clear the form or close the modal after success.
  - Close open menus after a choice.
  - Clear success messages after a few seconds.
- **User feedback:**
  - Success → `useToast().success()`.
  - Failure → `useToast().error()` or an inline error box with a Retry button.
  - Never fail silently, never show raw Appwrite errors to the user, and always `console.error` the real one.
- **Return booleans** (`true`/`false`) from composable actions so views can decide what happens next (navigate, toast) without try/catch.
- **Security checks are in Appwrite, not the UI.**
  - Router guards and hidden buttons are UX only. Every rule must also exist as table/bucket permissions.
  - Never trust data that came from the browser to decide a role.

## 4. Vue conventions

**Prefer**
- `<script setup>` + Composition API, `ref`/`computed`/`watch`.
- `defineProps` with types + defaults; `defineEmits` for every event; `v-model` = `modelValue` + `update:modelValue`.
- Module-scope singleton composables for app-wide state (`useAuth`, `useToast`). No Pinia unless asked.
- `RouterLink` for navigation, `router.push` only after an action succeeds.
- Loading → skeleton (`animate-pulse`); error → red box + Retry; empty → friendly message with a link to create one. Every list view has all three states.
- Comments that explain **why**, not what.

**Avoid**
- Options API, `this`, mixins, global event buses.
- Mutating props. Emit instead.
- `v-if` + `v-for` on the same element.
- `localStorage` for anything that must be shared or secure.
- New npm dependencies (UI kits, icon fonts, chart libraries, date libraries) without asking. Plain HTML + Tailwind first.

## 5. Design & style

**Keep / prefer**
- Tailwind classes only. **The brand palette is defined once, as CSS variables in `src/style.css` (`:root`)**; `tailwind.config.js` maps them to class names. To change a colour, edit `style.css` only.
  - Primary: `olive` #606C38 (brand, primary buttons, active), `cream` #FEFAE0 (page background, field fill), `ochre` #DDA15E (warm accent)
  - Secondary: `leaf` #599038 (success/active/correct), `bark` #4E3A29 (text, sidebar), `butter` #FFEAAD (draft/pending/neutral tags), `wine` #874D4D (muted red accent), `parchment` #EEE7CC (subtle surfaces), `taupe` #AF9C86 (muted, field borders)
  - Derived: `olive-light` (soft active/hover background), `taupe-dark` (icons/muted text on white, 4.6:1)
  - Older aliases still work: `sand` = taupe, `field` = cream fill + taupe border, `olive-dark` = bark
  - Status: draft/pending = `bg-butter text-bark`; active/correct = `bg-leaf/30 text-bark`; errors/danger stay Tailwind red (`red-50/500/600/700`) for contrast
  - Text on light backgrounds is `text-bark` (or `/60`–`/80`). Never put ochre/leaf/taupe as small text on white; they fail contrast.
- Fonts (Google Fonts in `index.html`):
  - `font-voice` = **Metamorphous**, for headlines and page titles
  - `font-button` = **Amethysta**, for buttons. `<button>` gets it automatically; add `font-button` to links styled as buttons.
  - `font-sans` = **Raleway**, the default for body text and tags
- Cards: `bg-white rounded-xl p-5/p-6`. Primary button: `bg-olive text-white rounded-md|rounded-xl hover:bg-olive/90`. Secondary: `border border-olive text-olive`. Danger: `border-red-300 text-red-600` or `bg-red-500 text-white`.
- Admin pages: `h1.font-voice.text-3xl/4xl.text-bark` title, then content cards on `bg-cream`.
- Icons: `<AppIcon name="…" />`. Add new paths there instead of new libraries.
- Charts: plain HTML/Tailwind, single series in `bg-olive`, values labelled directly.
- Images: `getImagePreviewUrl()` (uses `getFileView`). Always set `alt` (empty `alt=""` for decorative).

**Avoid**
- Hard-coded hex colours or inline `style` for colour (inline style only for computed sizes/backgrounds). New colours go into `style.css` `:root` + `tailwind.config.js`.
- New fonts, shadows-everywhere, gradients, or a second primary colour.
- Inventing a new layout for a page that already has a Figma mockup. Follow the mockup.

## 6. Naming

- Services: `get…`, `list…`, `create…`, `update…`, `delete…`, `set…`.
- Composables: `use<Feature>` returning `{ data refs, loading, error, actions }`.
- Views: `<Name>View.vue`; admin views `Admin<Name>View.vue`.
- Constants instead of magic strings (`ROLES.ADMIN`, not `'admin'`).

## 7. Before you finish a change

1. `npx vite build` passes.
2. No view imports a service; no file outside `services/appwrite.js` creates an Appwrite client.
3. New async actions follow the check/reset shape above.
4. If you needed a new Appwrite column or permission, say so explicitly and add it to `CLAUDE.md`.

## Layering status

No view, component or layout imports a service except `mediaService.getImagePreviewUrl`. That's an allowed exception: it's a pure URL helper. Keep it that way. New data access goes through a composable (e.g. `useBlog`, `useQuizzes`, `useCourseProgress`, `useProfileProgress`, `useProfileImages`, `useImageUpload`, `useImageApprovals`).

Shared constants: roles → `constants/roles.js`; blog category badge colours → `constants/blogCategories.js`.
