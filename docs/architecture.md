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
| `shared/lib/auth/refreshScheduler.ts` | `start(expiresIn)` / `stop()` — proactive JWT refresh scheduler |
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
