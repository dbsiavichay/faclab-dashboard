# Dashboard Faclab

Dashboard administrativo moderno construido con React, TypeScript, Zustand y React Query.

## 🚀 Características

- ⚡ **Vite** - Build tool ultrarrápido
- ⚛️ **React 18** - Framework UI moderno
- 🔷 **TypeScript** - Type safety completo
- 🎨 **Tailwind CSS** - Estilos utility-first
- 🗃️ **Zustand** - Estado del cliente simple y eficiente
- 🔄 **React Query** - Manejo de estado del servidor con cache automático
- 🎭 **MirageJS** - API mock para desarrollo sin backend
- 🌐 **React Router v6** - Enrutamiento moderno
- 🌍 **i18next** - Internacionalización
- 🎨 **Múltiples temas** - Dark mode, múltiples layouts
- 📱 **Responsive** - Diseño adaptable a todos los dispositivos

## 📋 Requisitos Previos

- Node.js >= 14.0.0
- npm >= 6.0.0

## 🛠️ Instalación

```bash
# Clonar el repositorio
git clone <repository-url>
cd Dashboard

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm start
```

El proyecto estará disponible en [http://localhost:5173](http://localhost:5173)

## 📜 Scripts Disponibles

```bash
# Desarrollo
npm start           # Inicia el servidor de desarrollo

# Producción
npm run build      # Crea el build de producción
npm run preview    # Preview del build de producción

# Calidad de Código
npm run lint       # Ejecuta ESLint
npm run lint:fix   # Corrige problemas de ESLint automáticamente
npm run prettier   # Verifica formato de código
npm run prettier:fix # Corrige formato automáticamente
npm run format     # Ejecuta prettier:fix y lint:fix
```

## 🏗️ Estructura del Proyecto

```
Dashboard/
├── public/              # Archivos estáticos
├── src/
│   ├── @types/         # Definiciones de tipos TypeScript
│   ├── assets/         # Imágenes, fuentes, etc.
│   ├── components/     # Componentes React
│   │   ├── layouts/    # Layouts de la aplicación
│   │   ├── route/      # Componentes de rutas
│   │   ├── shared/     # Componentes compartidos
│   │   ├── template/   # Componentes de plantilla
│   │   └── ui/         # Componentes UI reutilizables
│   ├── configs/        # Configuraciones
│   │   ├── app.config.ts
│   │   ├── theme.config.ts
│   │   └── routes.config/
│   ├── constants/      # Constantes de la aplicación
│   ├── hooks/          # React Query hooks (Server State)
│   │   ├── useAuth.ts
│   │   └── useProducts.ts
│   ├── lib/            # Configuraciones de librerías
│   │   └── react-query.ts
│   ├── locales/        # Archivos de traducción
│   ├── mock/           # API Mock con MirageJS
│   │   ├── data/       # Datos de prueba
│   │   └── fakeApi/    # Endpoints simulados
│   ├── services/       # Servicios API
│   │   ├── ApiService.ts
│   │   ├── AuthService.ts
│   │   ├── BaseService.ts
│   │   └── InventoryService.ts
│   ├── stores/         # Zustand stores (Client State)
│   │   ├── useAuthStore.ts
│   │   ├── useThemeStore.ts
│   │   ├── useLocaleStore.ts
│   │   └── useBaseStore.ts
│   ├── utils/          # Utilidades y helpers
│   ├── views/          # Páginas/Vistas
│   │   ├── auth/       # Vistas de autenticación
│   │   ├── inventory/  # Vistas de inventario
│   │   └── Home.tsx
│   ├── App.tsx         # Componente principal
│   └── main.tsx        # Punto de entrada
├── .env                # Variables de entorno
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.cjs
```

## 🎯 Arquitectura

### Estado de la Aplicación

El proyecto usa un enfoque moderno para manejar el estado:

#### **Client State (Zustand)**
Para estado del cliente (UI, autenticación, tema):

```typescript
import { useAuthStore } from '@/stores'

// Obtener estado
const { user, token } = useAuthStore()

// Ejecutar acciones
const { signInSuccess, signOutSuccess } = useAuthStore()
signInSuccess(token, user)
```

**Stores disponibles:**
- `useAuthStore` - Autenticación y usuario
- `useThemeStore` - Tema, modo, layout
- `useLocaleStore` - Idioma
- `useBaseStore` - Estado base (rutas)

#### **Server State (React Query)**
Para datos del servidor (productos, pedidos, etc.):

```typescript
import { useProducts, useCreateProduct } from '@/hooks'

// Queries (GET)
const { data: products, isLoading, error } = useProducts()

// Mutations (POST, PUT, DELETE)
const createProduct = useCreateProduct()
await createProduct.mutateAsync({ name: 'Producto' })
```

### Servicios API

Los servicios están ubicados en `/src/services`:

- **BaseService**: Cliente Axios con interceptores para auth
- **ApiService**: Wrapper genérico para llamadas HTTP
- **InventoryService**: Ejemplo de servicio de dominio

### Mock API

El proyecto incluye MirageJS para simular un backend:

```typescript
// src/configs/app.config.ts
const appConfig = {
    enableMock: true,  // true = usa datos falsos
    inventoryApiHost: 'http://localhost:3000',  // API real
}
```

## 🎨 Temas y Layouts

### Cambiar Tema

```typescript
import { useThemeStore } from '@/stores'

const { mode, setMode } = useThemeStore()
setMode('dark') // 'light' | 'dark'
```

### Layouts Disponibles

- **Modern** - Layout moderno con navegación transparente
- **Classic** - Layout clásico con sidebar
- **Decked** - Layout tipo deck
- **Simple** - Layout minimalista
- **Stacked Side** - Layout con sidebar apilado

```typescript
const { layout, setLayout } = useThemeStore()
setLayout('modern')
```

## 📄 Agregar Nueva Página

### 1. Crear el componente de vista

```typescript
// src/views/myModule/MyPage.tsx
const MyPage = () => {
    return (
        <div>
            <h1>Mi Nueva Página</h1>
        </div>
    )
}

export default MyPage
```

### 2. Registrar la ruta

```typescript
// src/configs/routes.config/routes.config.ts
export const protectedRoutes = [
    // ... otras rutas
    {
        key: 'myModule.myPage',
        path: '/my-page',
        component: lazy(() => import('@/views/myModule/MyPage')),
        authority: [], // Permisos requeridos
    },
]
```

## 🔌 Agregar Nuevo Servicio

### 1. Crear el servicio

```typescript
// src/services/MyService.ts
import ApiService from './ApiService'

class MyService {
    async getItems() {
        return ApiService.fetchData({
            url: '/items',
            method: 'get'
        })
    }

    async createItem(data: any) {
        return ApiService.fetchData({
            url: '/items',
            method: 'post',
            data
        })
    }
}

export default new MyService()
```

### 2. Crear React Query hooks

```typescript
// src/hooks/useMyService.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import MyService from '@/services/MyService'

export function useItems() {
    return useQuery({
        queryKey: ['items'],
        queryFn: async () => {
            const response = await MyService.getItems()
            return response.data
        },
    })
}

export function useCreateItem() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data) => MyService.createItem(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['items'] })
        },
    })
}
```

### 3. Usar en componentes

```typescript
import { useItems, useCreateItem } from '@/hooks/useMyService'

const MyComponent = () => {
    const { data: items, isLoading } = useItems()
    const createItem = useCreateItem()

    if (isLoading) return <div>Cargando...</div>

    return (
        <div>
            {items?.map(item => <div key={item.id}>{item.name}</div>)}
            <button onClick={() => createItem.mutate({ name: 'Nuevo' })}>
                Crear
            </button>
        </div>
    )
}
```

## 🔒 Autenticación

### Login

```typescript
import { useSignIn } from '@/hooks'
import { useAuthStore } from '@/stores'

const LoginPage = () => {
    const signIn = useSignIn()
    const user = useAuthStore((state) => state.user)

    const handleLogin = async () => {
        try {
            await signIn.mutateAsync({
                userName: 'admin',
                password: '123456'
            })
            // Usuario y token guardados automáticamente
        } catch (error) {
            console.error('Error en login:', error)
        }
    }

    return user ? <h1>Hola {user.userName}</h1> : <button>Login</button>
}
```

### Logout

```typescript
import { useSignOut } from '@/hooks'

const LogoutButton = () => {
    const signOut = useSignOut()

    return (
        <button onClick={() => signOut.mutate()}>
            Cerrar Sesión
        </button>
    )
}
```

## 🌍 Internacionalización

El proyecto incluye soporte para múltiples idiomas con i18next:

```typescript
import { useLocaleStore } from '@/stores'

const { currentLang, setLang } = useLocaleStore()
setLang('es') // Cambiar a español
```

## 🚀 Build y Deploy

### Build de Producción

```bash
npm run build
```

Los archivos generados estarán en `/build`

### Preview del Build

```bash
npm run preview
```

### Variables de Entorno

Configurar en `.env`:

```env
NODE_ENV=local
```

## 📚 Documentación Adicional

- **ZUSTAND_MIGRATION.md** - Guía detallada de uso de Zustand y React Query
- **CLAUDE.md** - Arquitectura del proyecto para desarrollo con Claude Code

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Convenciones de Código

- **Imports**: Usar path alias `@/` para imports absolutos
- **Componentes**: PascalCase para nombres de componentes
- **Archivos**: PascalCase para componentes, camelCase para utilidades
- **Hooks**: Prefijo `use` para hooks personalizados
- **Stores**: Prefijo `use` y sufijo `Store` (ej: `useAuthStore`)
- **TypeScript**: Usar tipos explícitos, evitar `any`

## 🐛 Problemas Conocidos

Revisar el panel de Issues en GitHub para ver problemas conocidos y reportar nuevos.

## 📄 Licencia

Este proyecto es privado.

## 👥 Equipo

- Faclab Team

## 🔗 Links Útiles

- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Zustand Documentation](https://docs.pmnd.rs/zustand)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com)

---

**Desarrollado con ❤️ por Faclab Team**
