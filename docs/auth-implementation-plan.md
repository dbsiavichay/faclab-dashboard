# Plan de Implementación — Auth API Real

> **Documento vivo.** Léeme al reanudar el trabajo en cualquier sesión. Marca etapas como ✅ conforme se completen, actualiza "Estado actual" y "Próximo paso" siempre.

Contrato backend: ver `auth-api-spec.md` (raíz del repo). Este documento traduce ese contrato a un plan ejecutable en el frontend.

---

## Estado actual

- Branch: `feat/auth-real-api`
- Última etapa completada: **Etapa 5 — Pantalla de cambio de contraseña** ✅
- Próximo paso: **Etapa 6 — Gating de rutas y navegación por permiso**.

Notas de sesión anterior (S4):
- Etapas 4 y 5 completadas en una sola sesión.
- Eliminadas: carpetas `SignUp/`, `ForgotPassword/`, `ResetPassword/` y sus rutas en `authRoute.tsx`.
- Eliminados: tipos deprecated (`SignInCredential`, etc.) de `@types/auth.ts` y stubs de `AuthService.ts`.
- `SignInForm.tsx` migrado a `username` (max 64), labels en español, sin "Remember Me", sin links de signup/forgot.
- Adaptador legacy `src/utils/hooks/useAuth.ts` actualizado: routing por rol (`CASHIER→/pos`, otros→/home) y por `mustChangePassword→/change-password`; `signUp` eliminado.
- `MustChangePasswordGuard` creado en `src/components/route/` y montado en `Layouts.tsx`.
- `ChangePassword/` creada en `src/views/auth/`: container + form con modo obligatorio (oculta "Volver", muestra "Cerrar sesión") y modo self-service; `INVALID_CREDENTIALS` → error inline en `currentPassword`.
- `useChangePassword` en `src/hooks/useAuth.ts` hace rotación de tokens vía `apiRefresh` + re-fetch de `/me` en `onSuccess`.
- Ruta `/change-password` agregada a `protectedRoutes` en `routes.config.ts`.
- `npm run lint` 0 errores. `tsc --noEmit` mismos errores preexistentes que master.

Actualiza estas líneas al final de cada sesión.

---

## Contexto

Hoy la app tiene auth simulada: token opaco en Zustand, `authority[]` con strings genéricos (`['admin','user']`), sin refresh, sin `/me`, endpoints `/sign-in` mockeados. El backend real (spec) usa **rol entero + 31 permisos granulares**, **refresh token rotatorio**, `/me` como fuente de verdad, `mustChangePassword` obligatorio, y CRUD admin de usuarios.

Objetivo: reemplazar la auth mock por integración real preservando Zustand, React Query, `ProtectedRoute`, `AuthorityGuard`, Formik y MirageJS (este último actualizado al nuevo contrato para seguir trabajando offline).

---

## Decisiones tomadas

| Decisión | Elegido |
|---|---|
| URL base backend | Env var `VITE_API_BASE_URL` (fallback `http://localhost:3000`); construir `authApiHost` / `adminUsersApiHost` desde ella |
| MirageJS | Se mantiene, reescrito al nuevo contrato (envelope, roles, permisos) |
| Admin Users | Cuelga de Settings → `/settings/users` |
| Sign-up / Forgot-password públicos | Se eliminan (router + archivos). Único reset: admin-assisted |

---

## Hallazgos clave del código actual (referencia rápida)

| Tema | Estado actual | Ubicación |
|---|---|---|
| Store auth | `{ user: { userName, authority[], avatar, email }, token, signedIn }` persistido (`auth-storage`) | `src/stores/useAuthStore.ts` |
| HTTP client | Axios, interceptor request (Bearer), interceptor response (401 → signOut). Sin refresh | `src/services/BaseService.ts` |
| Servicio auth | `apiSignIn/apiSignUp/apiSignOut/apiForgot/apiReset` → `/sign-in`, etc. | `src/services/AuthService.ts` |
| Hook principal | `useAuth()` util (no RQ) en `src/utils/hooks/useAuth.ts` |  |
| Hooks RQ | `useSignIn/useSignUp/useSignOut/useForgot/useReset` declarados pero **no usados** | `src/hooks/useAuth.ts` |
| Guards | `ProtectedRoute`, `AuthorityGuard` (match sobre `authority[]`) | `src/components/route/` |
| Util de matching | `useAuthority(userAuth, auth).some(...)` | `src/utils/hooks/useAuthority.ts` |
| Rutas | Todas con `authority: []` (no gateadas hoy) | `src/configs/routes.config/routes.config.ts` |
| Nav | Todas con `authority: []` | `src/configs/navigation.config/index.ts` |
| App bootstrap | `App → Theme → Layouts` — no hay llamada `/me` |  |
| Mock | MirageJS activo, mockea `/sign-in` | `src/mock/fakeApi/authFakeApi.ts` |
| Config | `apiPrefix: ''`, hosts separados (`inventoryApiHost`, `posApiHost`, `invoicingApiHost`) | `src/configs/app.config.ts` |
| i18n | `i18next` + `es.json`, sin cadenas auth centralizadas | `src/locales/` |
| Constantes roles | Solo `ADMIN='admin'` y `USER='user'` | `src/constants/roles.constant.ts` |

---

## Diferencias a cubrir

1. Endpoints: `/api/auth/login|refresh|me|change-password`, `/api/admin/users/...` vs `/sign-in|...`.
2. Envelope `{ data, meta }` / `{ errors[], meta }` — el `ApiService` no lo maneja.
3. Refresh token: no existe. Requiere rotación, dedup de llamadas en paralelo, retry-once.
4. Sesión: `role: number` + `permissions: Set<string>` + `mustChangePassword: boolean`.
5. `mustChangePassword`: pantalla bloqueante que no existe.
6. Errores HTTP 400 con `errors[].code` — discriminar por `code`, no por status.
7. Permisos granulares vs roles strings genéricos.
8. Ruteo por rol: CASHIER → `/pos`, resto → `/home`.
9. Admin Users CRUD completo (nuevo).
10. Mock: reescribir handlers.

---

## Etapas

Cada etapa es autoestable (queda compilando y funcional). Marca con ✅ cuando terminen.

### ✅ Etapa 0 — Doc vivo + branch

**Alcance**: este doc existe + branch `feat/auth-real-api` creada.

Checklist:
- [x] Crear `docs/auth-implementation-plan.md`
- [x] Branch `feat/auth-real-api`

---

### ✅ Etapa 1 — Tipos, enums y matriz de permisos

**Alcance**: fuente de verdad estática antes de tocar runtime.

Archivos:
- **`src/@types/auth.ts`** (sobrescribir):
  - `ApiEnvelope<T>`, `ApiErrorResponse`, `ApiErrorItem`
  - `ROLE` enum (1..5), `RoleCode` type
  - `Permission` type (unión literal de los 31 strings del spec)
  - `Session = { id, username, role: RoleCode, permissions: Permission[], mustChangePassword }`
  - `LoginRequest`, `LoginResponse`, `RefreshRequest`, `RefreshResponse`
  - `MeResponse` (igual a Session + id como number)
  - `ChangePasswordRequest`
  - `AdminUserResponse` (para Etapa 8)
  - `AdminUserListParams` (limit, offset, isActive, role)
  - `CreateUserRequest`, `UpdateUserRoleRequest`, `ResetUserPasswordRequest`

- **`src/constants/roles.constant.ts`** (expandir):
  - `ROLE = { ADMIN: 1, MANAGER: 2, OPERATOR: 3, VIEWER: 4, CASHIER: 5 } as const`
  - `ROLE_LABELS: Record<RoleCode, string>` → `'Administrador' | 'Gerente' | ...`
  - Mantener compat: exportar `ADMIN` y `USER` si siguen referenciados (grep primero).

- **`src/constants/permissions.constant.ts`** (nuevo):
  - `PERMISSION = { PRODUCT_READ: 'product:read', ... }` agrupado por dominio.
  - `ROLE_PERMISSIONS: Record<RoleCode, Permission[]>` — matriz del spec §2.3 (solo referencia; runtime usa `/me`).

**Verificación**: `npm run lint` + `npm run build` pasan.

---

### ✅ Etapa 2 — HTTP client con refresh rotatorio

**Alcance ajustado**: cliente auth aislado en vez de reescribir `BaseService` (para no romper los 23 hooks existentes).

Archivos entregados:
- `.env` + `.env.example` con `VITE_API_BASE_URL=http://localhost:3000`.
- `src/configs/app.config.ts` → `apiBaseUrl`, `authApiHost`, `adminUsersApiHost`.
- `src/services/tokenStorage.ts` → localStorage `fc.access`, `fc.refresh`, `fc.accessExpiresAt` (lo consumirá el store en Etapa 3).
- `src/utils/errors/ApiError.ts` → clase `ApiError` + `fromAxiosError` + `isApiError`.
- `src/services/navigationRef.ts` → singleton `setNavigator` / `navigateTo` (fallback `window.location`).
- `src/services/refreshManager.ts` → `refreshOnce()` con promesa in-flight deduplicada; usa axios crudo contra `/api/auth/refresh` para evitar recursión.
- `src/services/AuthApiClient.ts` → instancia axios dedicada, desempaqueta envelope, mapea códigos (`TOKEN_EXPIRED` refresh+retry once, `INVALID_TOKEN`→logout, `PERMISSION_DENIED` sin token→logout, `PASSWORD_CHANGE_REQUIRED`→`/change-password`).
- `src/components/route/NavigationBinder.tsx` montado en `src/App.tsx` dentro de `<BrowserRouter>`.

**NO tocado** (explícito): `BaseService`, `ApiService`, hooks existentes, `useAuthStore`, `AuthService`. Todo eso sigue funcionando con el envelope legacy.

---

### ✅ Etapa 3 — Store de sesión + bootstrap `/me`

**Alcance ajustado**: store SIN `persist` middleware (consume `tokenStorage` como única fuente); adaptador legacy en `src/utils/hooks/useAuth.ts`; migración quirúrgica de 7 consumidores directos del store; `BaseService` legacy actualizado a `accessToken`/`clear()`.

Archivos entregados:
- `src/stores/useAuthStore.ts` reescrito: `{ accessToken, refreshToken, accessExpiresAt, session }` + `setTokens`/`setSession`/`clear`. Tokens hidratados al crear desde `tokenStorage`; `clear` también llama `resetRefreshManager()`.
- Selectores: `useAccessToken`, `useSession`, `useIsAuthenticated`, `useCan(permission)`, `useHasRole(...roles)`. Re-exportados desde `src/stores/index.ts`.
- `src/services/AuthService.ts` reescrito: `apiLogin`/`apiRefresh`/`apiMe`/`apiChangePassword` sobre `authRequest<T>` de `AuthApiClient`. Shims `@deprecated` (`apiSignUp`/`apiForgotPassword`/`apiResetPassword`) que rechazan con error claro — solo para que los forms legacy compilen hasta Etapa 4. `apiSignIn`/`apiSignOut` legacy removidos.
- `src/hooks/useAuth.ts` reescrito: `useLogin` (setTokens + `qc.fetchQuery(['auth','me'])` + setSession), `useMe` (enabled si hay accessToken; en catch llama `clear()`), `useChangePassword`, `useLogout` (no hace request; `clear()` + `qc.clear()` + navega a `unAuthenticatedEntryPath`). Exporta `ME_QUERY_KEY`.
- `src/utils/hooks/useAuth.ts` reescrito como **adaptador legacy** sobre los hooks RQ — firma preservada para no tocar `SignInForm`/`ProtectedRoute`/`Layouts`/`UserDropdown`/`PublicRoute`/`AuthorityGuard`/`AuthorityCheck`/`SignUpForm`.
- `src/components/AuthBootstrap.tsx` nuevo: llama `useMe()` al montar; si `accessToken && !session && isLoading` muestra `<Loading>`. Migra una vez la clave localStorage legacy `auth-storage` (flag `fc.migratedV2`).
- `src/App.tsx`: monta `<AuthBootstrap>` dentro de `<Theme>` envolviendo `<Layout />`.
- Consumidores migrados a `useSession()?.permissions ?? []` (authority) o `useSession()?.username`: `src/views/Views.tsx`, `src/views/pos/components/ShiftOpenDialog.tsx`, `src/components/template/{SideNav,HorizontalNav,MobileNav,SecondaryHeader}.tsx`, `src/components/template/StackedSideNav/StackedSideNav.tsx`.
- `src/services/BaseService.ts` (legacy) actualizado al nuevo shape: `state.token` → `state.accessToken`; `signOutSuccess()` → `clear()`.

**NO tocado** (explícito, reservado para Etapas 4–6): `SignInForm` (sigue usando el adaptador; migra a username/códigos en Etapa 4), `ProtectedRoute`/`PublicRoute`/`Layouts`/`UserDropdown`, `AuthorityGuard`, navegación por rol post-login, pantalla `/change-password`, Admin Users, mocks.

**Verificación**: `npm run lint` 0 errores. `tsc --noEmit` deja exactamente los mismos errores preexistentes que master en Customer/POS/Purchase/Adjustment services (no se introducen nuevos).

---

### ✅ Etapa 4 — Login + pantalla obligatoria `mustChangePassword`

- `SignInForm.tsx`: campo `username`, validación 1..64 / 1..128, mapeo por código.
- Post-login: CASHIER → `/pos`, resto → `/home`. Si `mustChangePassword` → `/change-password`.
- Nuevo `MustChangePasswordGuard` montado en `Layouts.tsx`.
- Borrar SignUp/ForgotPassword: archivos + rutas en `authRoute.tsx`.

---

### ✅ Etapa 5 — Pantalla de cambio de contraseña

- `src/views/auth/ChangePasswordView.tsx`: modo self-service + modo obligatorio.
- Tras 204 → **siempre** `/refresh` → `/me` → navegar.
- Ruta `/change-password` protegida (requiere token, sin permiso).

---

### ☐ Etapa 6 — Gating de rutas y navegación por permiso

- Extender `Route` type con `meta.requiresPermission` / `meta.requiresRole`.
- Renombrar lógica de `AuthorityGuard` → usar `can(perm)`/`hasRole(...)`.
- Rellenar `requires` en `routes.config.ts` y `navigation.config/index.ts` según matriz.
- `navigation` filter: **oculta** items sin permiso (no disable).

---

### ☐ Etapa 7 — Ruteo por rol + enlaces cruzados POS↔Admin

- Post-login/post-`/me`: CASHIER → `/pos`; else → `/home`.
- Gating interno POS: `sale:cancel`, `refund:approve`.
- Link "Abrir POS" visible si `can('pos:operate')`.
- Link "Volver al admin" en POSHeader si rol ≠ CASHIER.

---

### ☐ Etapa 8 — Admin Users CRUD

- `src/services/UserService.ts`: list/get/create/updateRole/activate/deactivate/resetPassword.
- `src/hooks/useUsers.ts` RQ con invalidations.
- `src/views/settings/UsersView.tsx` + modales (`CreateUserModal`, `ResetPasswordModal`, `DeactivateConfirmDialog`).
- Ruta `/settings/users` + entry en nav bajo Configuración, gateada `user:manage`.
- Reset password: generar 12 chars client-side, mostrar una vez con Copy + banner.

---

### ☐ Etapa 9 — Actualizar Mock (MirageJS) al nuevo contrato

- `src/mock/fakeApi/authFakeApi.ts` reescrito (login/refresh/me/change-password con envelope).
- `src/mock/fakeApi/adminUsersFakeApi.ts` nuevo.
- `src/mock/data/authData.ts`: 5 seeds, uno por rol.
- Helpers `withEnvelope`, `withError`.

---

### ☐ Etapa 10 — Pulido

- i18n: `auth.*` en `es.json` (errores, labels, banner).
- Refresh proactivo: `setTimeout` a `expiresIn - 60s`.
- Logout: limpiar tokens + `queryClient.clear()` + navegar.
- `accessExpiresAt` expirado al reload → refresh directo sin `/me`.
- `/access-denied`: copy y botón "volver al home".

---

## Archivos críticos

- `src/stores/useAuthStore.ts` (refactor completo)
- `src/services/BaseService.ts` + `refreshManager.ts` (nuevo)
- `src/services/AuthService.ts` (endpoints nuevos)
- `src/services/UserService.ts` (nuevo)
- `src/hooks/useAuth.ts` (reemplaza util hook)
- `src/@types/auth.ts` (tipado nuevo)
- `src/constants/permissions.constant.ts`, `roles.constant.ts`
- `src/components/route/ProtectedRoute.tsx`, `AuthorityGuard.tsx`, `MustChangePasswordGuard.tsx` (nuevo)
- `src/configs/routes.config/routes.config.ts`, `authRoute.tsx`
- `src/configs/navigation.config/index.ts`
- `src/configs/app.config.ts` + `.env`
- `src/views/auth/SignInForm.tsx`, `ChangePasswordView.tsx` (nuevo)
- `src/views/settings/UsersView.tsx` (nuevo) + modales
- `src/mock/fakeApi/authFakeApi.ts` + `adminUsersFakeApi.ts` (nuevo)
- `src/App.tsx` o `AuthBootstrap` nuevo
- `src/locales/lang/es.json`

---

## Utilidades existentes a reutilizar

- Zustand `persist` middleware (ya en `useAuthStore`).
- `useAuthority` hook: adaptar a `can()`/`hasRole()`.
- `ProtectedRoute`, `AuthorityGuard`: mantener nombres, cambiar semántica interna.
- `ApiService.fetchData`: mantener, ajustar desenvolvido del envelope.
- Formik + Yup (ya instalado).
- React Query `QueryClient` global.
- Patrón de mocks Mirage con `schema.db.*`.

---

## Verificación E2E (cuando todas las etapas estén listas)

1. `npm start` con backend real en `localhost:3000`.
2. Seed admin (`admin` / `ChangeMe123!`).
3. Login admin → `/home` → `/settings/users`.
4. Crear cashier con temp password → logout.
5. Login cashier → `mustChangePassword` → bloqueado en `/change-password`.
6. Cambiar contraseña → refresh auto → `/pos`.
7. URL `/settings/users` → 403.
8. Admin desactiva cashier → al expirar token el cashier es kicked out.
9. Toggle `enableMock=true` y repetir 2-7.
10. `npm run lint && npm run build` verdes.

---

## Orden sugerido por sesión

- S1: Etapas 0 + 1
- S2: Etapa 2
- S3: Etapa 3
- S4: Etapas 4 + 5
- S5: Etapa 6
- S6: Etapa 7
- S7: Etapa 8
- S8: Etapas 9 + 10
