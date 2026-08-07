# Issue: Git security fixes & dependency resolution

## Task 1: Fix .gitignore and untrack sensitive files

**Problems identified:**
1. `google-services.json` is already tracked in git (committed) even though it's in `.gitignore`. Gitignore only prevents future tracking — already-tracked files stay.
2. `.env.production` is tracked in git but NOT covered by `.gitignore`. Current pattern `.env*.local` only matches `.env.local`, `.env.development.local`, etc. — NOT `.env.production`.
3. `node_modules/` has many modified/deleted files — indicates `package-lock.json` is out of sync with installed packages.

**Steps to fix:**

### A. Stop tracking sensitive files
Run these in order:
- `git rm --cached google-services.json` — untrack from git but keep locally
- `git rm --cached .env.production` — untrack from git but keep locally
- Or use `git rm --cached -r google-services.json .env.production` for both at once

### B. Update .gitignore patterns
Modify `.gitignore`:
- Change `.env*.local` to `.env.*` (covers `.env.production`, `.env.staging`, etc.)
- Keep `.env` as-is (covers the root `.env` file)
- After fixing, git commit the changes

### C. Restore clean node_modules
Run `npm ci` or delete `node_modules` + `npm install` to get a clean dependency tree matching `package-lock.json`.

---

## Task 2: Fix npm ERESOLVE error

**Problem:** `package.json` requires `expo-router@"~55.0.17"` but `package-lock.json` / `node_modules` has `expo-router@55.0.16`. Without the lockfile, npm fails to resolve.

**Steps:**
- After fixing gitignore/untracking (Task 1), run `npm install` in the project root
- This should regenerate `package-lock.json` matching the version ranges in `package.json`
- If it still fails with ERESOLVE:
  - Delete `node_modules/` and `package-lock.json`
  - Run `npm install` clean
  - Or run `npm install --legacy-peer-deps` as fallback

---

## Task 3: Commit all changes

After both tasks are done:
- Stage the `.gitignore` changes, deleted `google-services.json` and `.env.production` refs, updated `package-lock.json`
- Commit with message like `chore: fix gitignore patterns and untrack sensitive files`
- Verify: `git ls-files | grep -E "google-services.json|.env.production"` should return nothing
