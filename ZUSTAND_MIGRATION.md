# Migración Completa: Redux → Zustand + React Query

## ✅ Migración Completada

Se ha migrado exitosamente de Redux a Zustand + React Query.

## 📦 Nuevas Dependencias

- **zustand** - Estado del cliente (auth, theme, locale, UI)
- **@tanstack/react-query** - Estado del servidor (productos, pedidos, etc.)

## 🗂️ Nueva Estructura

```
src/
├── stores/                      # Zustand (Estado Cliente)
│   ├── useAuthStore.ts         # Autenticación y usuario
│   ├── useThemeStore.ts        # Tema y layout
│   ├── useLocaleStore.ts       # Idioma
│   ├── useBaseStore.ts         # Estado base (routes)
│   └── index.ts
│
├── hooks/                       # React Query (Estado Servidor)
│   ├── useAuth.ts              # Auth API calls
│   ├── useProducts.ts          # Products API calls
│   └── index.ts
│
└── lib/
    └── react-query.ts          # Configuración de React Query
```

## 🎯 Cómo Usar la Nueva Arquitectura

### 1. Estado de Autenticación (Zustand)

```typescript
import { useAuthStore } from '@/stores'

// Obtener todo el estado
const { user, token, signedIn } = useAuthStore()

// Obtener solo lo que necesitas (más eficiente)
const user = useAuthStore((state) => state.user)
const signedIn = useAuthStore((state) => state.signedIn)

// Acciones
const { signInSuccess, signOutSuccess, setUser } = useAuthStore()

// Login
signInSuccess(token, user)

// Logout
signOutSuccess()

// Actualizar usuario
setUser({ ...user, userName: 'Nuevo Nombre' })
```

### 2. Estado de Tema (Zustand)

```typescript
import { useThemeStore } from '@/stores'

// Obtener estado del tema
const { mode, themeColor, layout } = useThemeStore()
const mode = useThemeStore((state) => state.mode)

// Cambiar tema
const { setMode, setThemeColor, setLayout } = useThemeStore()

setMode('dark')
setThemeColor('blue')
setLayout('modern')

// Otras acciones disponibles
const {
    setDirection,
    setPreviousLayout,
    setSideNavCollapse,
    setNavMode,
    setPanelExpand,
    setThemeColorLevel,
} = useThemeStore()
```

### 3. Estado de Idioma (Zustand)

```typescript
import { useLocaleStore } from '@/stores'

const currentLang = useLocaleStore((state) => state.currentLang)
const { setLang } = useLocaleStore()

setLang('es')
```

### 4. Queries con React Query (GET)

```typescript
import { useProducts, useProduct } from '@/hooks'

// Obtener todos los productos
function ProductList() {
    const { data: products, isLoading, error, refetch } = useProducts()

    if (isLoading) return <div>Cargando...</div>
    if (error) return <div>Error: {error.message}</div>

    return (
        <div>
            {products?.map(product => (
                <div key={product.id}>{product.name}</div>
            ))}
            <button onClick={() => refetch()}>Refrescar</button>
        </div>
    )
}

// Obtener un producto específico
function ProductDetail({ id }: { id: number }) {
    const { data: product, isLoading } = useProduct(id)

    if (isLoading) return <div>Cargando...</div>

    return <div>{product?.name}</div>
}
```

### 5. Mutations con React Query (POST, PUT, DELETE)

```typescript
import { useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/hooks'

function ProductForm() {
    const createProduct = useCreateProduct()
    const updateProduct = useUpdateProduct()
    const deleteProduct = useDeleteProduct()

    // Crear producto
    const handleCreate = async () => {
        try {
            await createProduct.mutateAsync({
                name: 'Nuevo Producto',
                sku: 'SKU-001',
                description: 'Descripción'
            })
            alert('Producto creado!')
        } catch (error) {
            alert('Error al crear')
        }
    }

    // Actualizar producto
    const handleUpdate = async (id: number) => {
        await updateProduct.mutateAsync({
            id,
            data: { name: 'Nombre Actualizado' }
        })
    }

    // Eliminar producto
    const handleDelete = async (id: number) => {
        if (confirm('¿Eliminar?')) {
            await deleteProduct.mutateAsync(id)
        }
    }

    return (
        <div>
            <button
                onClick={handleCreate}
                disabled={createProduct.isPending}
            >
                {createProduct.isPending ? 'Creando...' : 'Crear'}
            </button>

            {createProduct.isError && (
                <div>Error: {createProduct.error.message}</div>
            )}
        </div>
    )
}
```

### 6. Autenticación con React Query

```typescript
import { useSignIn, useSignOut, useSignUp } from '@/hooks'
import { useAuthStore } from '@/stores'

function LoginForm() {
    const signIn = useSignIn()
    const signOut = useSignOut()
    const user = useAuthStore((state) => state.user)

    const handleLogin = async (credentials) => {
        try {
            await signIn.mutateAsync({
                userName: credentials.email,
                password: credentials.password
            })
            // El token y usuario se guardan automáticamente en useAuthStore
            console.log('Login exitoso!')
        } catch (error) {
            console.error('Error en login:', error)
        }
    }

    const handleLogout = async () => {
        await signOut.mutateAsync()
        // El store se limpia automáticamente
    }

    return (
        <div>
            {user ? (
                <div>
                    <p>Hola {user.userName}</p>
                    <button onClick={handleLogout}>Cerrar Sesión</button>
                </div>
            ) : (
                <button onClick={() => handleLogin({ email: 'admin', password: '123456' })}>
                    Login
                </button>
            )}
        </div>
    )
}
```

### 7. Acceder al Store fuera de Componentes

```typescript
// Para usar en servicios, utils, etc.
import { useAuthStore, useThemeStore } from '@/stores'

// Obtener estado
const token = useAuthStore.getState().token
const mode = useThemeStore.getState().mode

// Ejecutar acciones
useAuthStore.getState().signOutSuccess()
useThemeStore.getState().setMode('dark')

// Suscribirse a cambios
const unsubscribe = useAuthStore.subscribe(
    (state) => console.log('Token cambió:', state.token)
)

// Cuando ya no necesites la suscripción
unsubscribe()
```

## 🎨 Ventajas de la Nueva Arquitectura

### Zustand vs Redux

✅ **90% menos código** - De ~150 líneas a ~30 líneas por store
✅ **Sin boilerplate** - No actions, reducers, ni dispatch
✅ **TypeScript simple** - Inferencia automática de tipos
✅ **Persistencia integrada** - Solo agregar middleware `persist`
✅ **Más rápido** - Mejor performance y re-renders optimizados

### React Query vs Redux para Server State

✅ **Cache automático** - Los datos se cachean automáticamente
✅ **Refetch inteligente** - Al hacer focus, cuando se desactualiza, etc.
✅ **Estados integrados** - `isLoading`, `isError`, `isPending` incluidos
✅ **Optimistic updates** - Actualiza UI antes de la respuesta del servidor
✅ **Invalidación automática** - Refresca datos relacionados automáticamente
✅ **DevTools** - Herramientas de desarrollo incluidas

## 📝 Crear Nuevos Stores (Zustand)

```typescript
// src/stores/useMyStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface MyState {
    count: number
    items: string[]

    increment: () => void
    addItem: (item: string) => void
}

export const useMyStore = create<MyState>()(
    persist(
        (set) => ({
            // Estado inicial
            count: 0,
            items: [],

            // Acciones
            increment: () => set((state) => ({ count: state.count + 1 })),
            addItem: (item) => set((state) => ({ items: [...state.items, item] })),
        }),
        {
            name: 'my-storage', // nombre en localStorage
        }
    )
)
```

## 📝 Crear Nuevos Hooks de React Query

```typescript
// src/hooks/useOrders.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import OrderService from '@/services/OrderService'

export function useOrders() {
    return useQuery({
        queryKey: ['orders'],
        queryFn: async () => {
            const response = await OrderService.getOrders()
            return response.data
        },
    })
}

export function useCreateOrder() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (order) => OrderService.createOrder(order),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] })
        },
    })
}
```

## 🔧 Configuración de React Query

En `src/lib/react-query.ts`:

```typescript
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5,        // 5 minutos
            retry: 1,                         // Reintentar 1 vez
            refetchOnWindowFocus: false,      // No refetch al hacer focus
        },
    },
})
```

## 🚀 Build y Deploy

Todo funciona igual que antes:

```bash
npm start           # Desarrollo
npm run build       # Producción
npm run preview     # Preview del build
```

## 📚 Recursos

- [Zustand Docs](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [React Query Docs](https://tanstack.com/query/latest/docs/framework/react/overview)
- [Zustand Best Practices](https://docs.pmnd.rs/zustand/guides/practice-with-no-store-actions)
- [React Query Best Practices](https://tkdodo.eu/blog/practical-react-query)
