# Timeline App — project notes for Claude Code

Vue 3 + Vite + Tailwind front end, Appwrite backend (TablesDB + Storage), no server code.

## Architecture rules
- `src/services/appwrite.js` is the ONLY file that imports the Appwrite client. Everything else goes through `src/services/*.js` (data access layer); composables/components never call Appwrite directly.
- Shared state uses module-scope singleton composables (`useAuth`, `useToast`), not Pinia.
- Roles: `src/constants/roles.js` (`admin`, `editor`, `user`). Router guards in `src/router/index.js` are UX only — the real security boundary is Appwrite table/bucket permissions. Never rely on the guard alone.
- Shared UI components live in `src/components/ui/` (the old `src/components/admin/` copies were deleted).

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
- Sidebar (`AdminLayout.vue`): the "Users" group (Statistic, Inactive, Users, Image Approvals) is admin-only and hidden for editors. Inactive/Users/Statistic are still `PlaceholderView`.
- Icons: `components/ui/AppIcon.vue` (inline SVG). No icon library is installed.

## Known gaps / next priorities
1. Users can't remove a live photo themselves (they can only replace it, or cancel a pending one). Needs an admin-side "remove" or a pending "remove" request.
2. Rejected/replaced files stay in the bucket (orphaned). Cleanup would need bucket `Delete` for label `admin`, then `deleteImage()` on reject/replace.
3. Approvals page shows user IDs, not names — could now look up `profiles.name`.
4. Statistic, Inactive and Users admin pages are placeholders.
