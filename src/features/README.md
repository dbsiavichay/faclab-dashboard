# features/

Vertical feature modules. Each subdirectory is a self-contained slice:

```
features/<name>/
├── api/          # pure functions calling httpClient
├── model/        # domain types + Zod schemas
├── hooks/        # React Query hooks
├── components/   # feature-specific UI
├── pages/        # route-level page components
├── routes.ts     # route definitions registered in app/routes/routes.config.ts
└── index.ts      # public API — the only import surface for other features
```

See `/docs/architecture.md` for boundary rules.
