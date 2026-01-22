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

## ⚠️ Database Stability Rule: Use `findFirst` instead of `findUnique`

**Problem:**
When using Prisma Accelerate (Data Proxy) with a rapidly changing schema, `findUnique` queries often fail with "Can't reach database server" or invalid invocation errors, even when `findMany` works fine. This is a known behavior related to how the Proxy caches unique constraints.

**Solution:**
Always use `findFirst` instead of `findUnique` for single item lookups, even when querying by `@unique` fields or `@id`.

**Implementation:**

```typescript
// ❌ Avoid findUnique
const user = await prisma.user.findUnique({
  where: { email: "..." }
});

// ✅ Use findFirst
const user = await prisma.user.findFirst({
  where: { email: "..." }
});
```

This applies to all entities (Politicians, Promises, Parties, Categories, etc.) in `lib/db.ts` or API routes.

## 🚀 Performance Rule: Select Minimal Fields

**Problem:**
Fetching full objects (especially with nested relations like `include: { promises: true }`) consumes excessive memory and bandwidth, leading to connection timeouts on the Serverless DB.

**Solution:**
Always use `select` to fetch **only the fields you strictly need** for the logic.

**Example (Counting Promises):**
```typescript
// ❌ BAD: Fetches title, description, body, etc. for 1000 promises
const promises = await prisma.promise.findMany();
const keptCount = promises.filter(p => p.status === 'KEPT').length;

// ✅ GOOD: Fetches only the status enum
const promises = await prisma.promise.findMany({
  select: { status: true }
});
const keptCount = promises.filter(p => p.status === 'KEPT').length;
```
