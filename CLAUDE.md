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
- Flow: `ProfileView` → `submitPendingImage(userId, 'avatar'|'header', fileId)` (null = cancel). Admin page `/admin/image-approvals` (`AdminImageApprovalsView.vue`, admin role only) → `approvePendingImage` copies pending → `profiles` via `profileService.setProfileImage`, then clears pending; `rejectPendingImage` just clears it.
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
- Cascades need table-level `Delete` for label `admin` on lessons, quizzes, quiz_questions, quiz_attempts, progress.

## Known gaps / next priorities
1. Users can't remove a live photo themselves (they can only replace it, or cancel a pending one). Needs an admin-side "remove" or a pending "remove" request.
2. Rejected/replaced files stay in the bucket (orphaned). Cleanup would need bucket `Delete` for label `admin`, then `deleteImage()` on reject/replace.
3. Role/label sync and hard user blocking need an Appwrite Function (server SDK + API key).
