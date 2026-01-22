# Project Rules: Caching & Data Fetching

## 🛑 Critical Rule: Force Dynamic Rendering for Public Pages

**Problem:**
Prisma Accelerate (or Vercel Data Cache) can serve stale data even after a schema change or `db:push`. If a page is statically generated (ISR with `revalidate`) but the underlying database schema changes (e.g., adding/removing columns), the cache might hold data structure that no longer matches the Prisma Client's expectations, causing **500 Server Errors**.

**Solution:**
All public facing pages that fetch data from the database MUST use **Dynamic Rendering**.

**Implementation:**
Add the following to your `page.tsx`:

```typescript
// ❌ DO NOT USE REVALIDATE
// export const revalidate = 60;

// ✅ USE FORCE-DYNAMIC
export const dynamic = 'force-dynamic';
```

**Affected Pages:**
- `app/(public)/page.tsx`
- `app/(public)/promises/**`
- `app/(public)/politicians/**`
- `app/(public)/parties/**`
- `app/(public)/categories/**`

## Why not `revalidate = 0`?
`revalidate = 0` effectively means "no cache", but `force-dynamic` is more explicit about opting out of the static generation build step entirely, which is safer when dealing with frequent schema migrations during development.

## Future Optimization
Once the database schema is stable (Production v1.0), we can revert to `revalidate = 60` (ISR) to improve performance. However, every time the schema changes, you MUST manually purge the Vercel Data Cache or redeploy with cache clearing.
