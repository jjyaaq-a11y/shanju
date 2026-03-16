# Homepage Self-Test Checklist

Run this after any homepage-related change.

## 1) Automated smoke test

```bash
npm run verify:home
```

Expected: `PASS: Homepage integrity checks passed`

## 2) Visual/manual checks

1. Open `/` and confirm Hero background image is visible (not blank).
2. Confirm navigation links exist and work:
   - `Home` -> `/`
   - `Routes` -> `/routes`
   - `Journal` -> `/journal`
3. Confirm homepage sections render in order:
   - Hero
   - Featured Routes
   - Why
   - Journal
   - About
   - Footer
4. Confirm `Why` cards are not empty (title/description visible).
5. Click one route card and verify `/routes/[id]` opens.
6. Click one journal card and verify `/journal/[slug-or-id]` opens.
7. Switch locale in navbar and confirm page content updates without manual refresh.
8. Mobile viewport check (`375x812`):
   - Hero still visible
   - No horizontal overflow
   - Navbar menu opens/closes

## 3) Failure handling

If automated check fails:
1. Fix data/API failures first (`/api/globals/site-settings`, `/api/routes`, `/api/journals`).
2. Then fix UI rendering failures (`Hero`, empty sections, broken links).
3. Re-run `npm run verify:home` until pass.
