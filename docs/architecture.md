# Architecture Decision Record — Feature Module Migration

**Status:** Active | **Date:** 2026-05-07 | **Applies from:** S0

## Context

Migrating from horizontal layers (`services/`, `hooks/`, `views/`) to vertical feature
modules to reduce cross-cutting change cost and enable isolated testing.
Each feature is self-contained and exposes a single public surface (`index.ts`).

## Boundary Rules (immutable)

1. **Feature-to-feature imports**: only via the target feature's `index.ts`.
   Never import `features/lots/api/getLots.ts` from `features/products`.

2. **`shared/` does not import from `features/`**. Ever. If shared code needs
   a feature type, that type belongs in `shared/`, not the feature.

3. **`app/` orchestrates features**. Contains no business logic.

4. **Schemas live with their feature** (`features/<x>/model/`). The legacy
   `src/schemas/` directory is deleted after migration completes (S6).

5. **Services are pure functions**, not classes or singletons.
   `getSuppliers()`, not `new SupplierService().getSuppliers()`.

6. **Mappers are exceptional**, not mandatory. Add `mappers.ts` only when:
   snake_case→camelCase, numeric enum→label, or legacy shape mismatch.
   If the API returns the right shape, skip the mapper.

7. **`httpClient` returns `T`**, never `AxiosResponse<T>`.
   Axios is an implementation detail of `shared/lib/http`.

8. **Cross-feature data**: import from the feature barrel.
   `PurchaseOrders` needing `Supplier` type uses
   `import type { Supplier } from '@features/suppliers'`, not internal paths.

9. **`@legacy/*` is lint-warned** in `features/`, `shared/`, `app/`.
   It maps to `src/views/` (temporary during migration). Remove the alias at S6.

## Path Aliases

| Alias          | Resolves to      | Purpose                           |
|----------------|------------------|-----------------------------------|
| `@/*`          | `src/*`          | Legacy compat (permanent)         |
| `@app/*`       | `src/app/*`      | Bootstrap, providers, routing     |
| `@features/*`  | `src/features/*` | Vertical feature modules          |
| `@shared/*`    | `src/shared/*`   | Shared lib, utils, primitives     |
| `@stores/*`    | `src/stores/*`   | Global Zustand stores             |
| `@configs/*`   | `src/configs/*`  | App configuration                 |
| `@legacy/*`    | `src/views/*`    | Temporary — remove at S6         |

## Key Shared Libraries

| Path | Purpose |
|---|---|
| `shared/lib/http/httpClient.ts` | Axios wrapper returning `T`; token + 401 handled by `BaseService` interceptors |
| `features/auth/lib/refreshScheduler.ts` | `start(expiresIn)` / `stop()` — proactive JWT refresh scheduler (auth-feature owned) |
| `shared/lib/format.ts` | `formatCurrency`, `formatDate`, `formatDatetime`, `formatPercent` |

## Directory Structure (target state after S6)

```
src/
├── app/          # bootstrap, providers, routes
├── features/     # vertical slices
├── shared/       # cross-cutting lib, ui, utils
├── stores/       # global Zustand state
├── configs/      # environment config
└── @types/       # global types
```

## Migration Sequence

| Session | Scope |
|---|---|
| S0 | Infrastructure (httpClient, format, refreshScheduler, Vitest, aliases, ESLint rule) |
| S1 | Feature pilot: `suppliers` (canonical template + tests) |
| S2 | Refactor remaining services to pure functions + httpClient |
| S3 | Break detail views >500 LOC into sub-components |
| S4 | Migrate leaf features (customers, categories, warehouses, locations) |
| S5 | Migrate cross-feature features (purchases, sales, pos, inventory, reports) |
| S6 | Delete legacy dirs, remove @legacy alias, complete Controlled* wrappers |

## API Response Envelope `{ data, meta }`

**Status:** Active | **Date:** 2026-05-14

### Convention

The backend wraps every JSON response in an envelope:

```ts
// list endpoint
{ data: T[], meta: { pagination: { page, pageSize, total, totalPages } } }

// detail / mutation endpoint
{ data: T }
```

`src/@types/api.ts` declares `PaginatedResponse<T>` and `DataResponse<T>` to type this raw shape.

### Where the unwrap happens

- **`features/<x>/api/client.ts`** — functions are typed against the *raw envelope*
  (`httpClient.get<PaginatedResponse<T>>(...)`). They return the envelope as-is.
- **`features/<x>/hooks/use*.ts`** — hooks unwrap before exposing data:
  `return { items: body.data, pagination: body.meta.pagination }`.
- **Consumers (pages, components)** never see the envelope.

### Why hooks own the unwrap (not `api/client`)

- `meta.pagination` is needed by table components alongside `data`. Centralizing the
  unwrap in `api/client` would either drop `meta` (breaking pagination) or return a
  bespoke shape per endpoint (no net simplification).
- The envelope is a *backend contract*, not a frontend concern. Keeping it visible in
  the type signature of `api/client` makes the boundary explicit; transforming inside
  hooks keeps the frontend model clean.
- React Query keys naturally live in hooks. Unwrap + cache key colocate there.

### Rule for new endpoints

1. Type the `api/client` function with `PaginatedResponse<T>` or `DataResponse<T>`.
2. In the hook, destructure `body.data` (and `body.meta.pagination` when paginated).
3. Never expose the envelope past the hook boundary.
