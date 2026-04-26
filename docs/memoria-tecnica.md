# MEMORIA DESCRIPTIVA TÉCNICA — PROYECTO ESQUEL ACTIVO

## ¿Qué es?

Esquel Activo es una **plataforma multi-tenant de comercio local** para la ciudad de Esquel, Argentina. Permite que cada comercio tenga su propia app (catálogo de productos, identidad visual, pedidos por WhatsApp) bajo un sistema unificado. Es un SaaS white-label: cada comercio tiene su propia URL, colores, logo y datos aislados.

---

## Stack tecnológico

| Tecnología | Versión | Rol |
|---|---|---|
| Next.js | 15.x | Framework (App Router, Server Actions) |
| React | 19.x | UI |
| TypeScript | 5.7 | Tipado estático estricto |
| Prisma | 6.x | ORM |
| PostgreSQL | — | Base de datos (Neon, multi-schema) |
| Auth.js | v5 beta | Autenticación con JWT |
| Tailwind CSS | 4.x | Estilos |
| Radix UI | — | Componentes accesibles (shadcn/ui style) |
| Cloudinary | 2.x | Imágenes (logo, productos) |
| pnpm | 9.x | Package manager |
| Turborepo | 2.x | Monorepo build system |

---

## Estructura del monorepo

```
/
├── apps/
│   ├── shell/         → App pública del comercio (catálogo, slideshow, pedidos)  puerto 3000
│   ├── dashboard/     → Panel de administración para dueños de comercios          puerto 3002
│   └── marketplace/   → App de marketplace general (en desarrollo)               puerto 3001
│
└── packages/
    ├── db/            → Prisma schema + cliente compartido
    ├── tenant-engine/ → Lógica de resolución de tenants (subdominio/query param)
    ├── ui/            → Componentes UI reutilizables
    └── config/        → tsconfig y eslint compartidos
```

---

## Arquitectura multi-tenant

### Resolución del tenant

El `tenant-engine` determina qué comercio mostrar usando esta prioridad:

1. Header `x-tenant-id` → apps nativas Capacitor
2. Query param `?tenant=slug` → desarrollo local y producción actual
3. Subdominio → `chocolateria.esquel-activo.com.ar`
4. Dominio propio → `www.chocolateria-esquel.com.ar` (plan Premium)

### Aislamiento de datos

El schema de Prisma tiene **dos schemas de PostgreSQL**:
- `public` → entidades globales: `Tenant`, `User`, `TenantMembership`, tablas de Auth.js
- `tenant_template` → datos por comercio: `Product`, `Category`, `Order`, `OrderItem`, `ProductVariant`

Los modelos `Product` y `Category` tienen `tenantId String` + `@@index([tenantId])` para aislar datos. Todas las queries en el dashboard filtran por `session.user.tenantId`.

### Modelo de datos clave

```
Tenant (public)
  └── TenantMembership → User (roles: OWNER, ADMIN, STAFF)

Category (tenant_template)
  ├── tenantId
  └── products[]

Product (tenant_template)
  ├── tenantId
  ├── price, discountPrice (Decimal)
  ├── imageUrls (String[])
  ├── isFeatured (aparece en slideshow hero)
  └── variants[]

Order (tenant_template)
  └── items[] → OrderItem → Product + ProductVariant
```

---

## App: shell (`@esquel-activo/shell`)

La app pública visible para los clientes del comercio.

- **Ruta `/`**: si hay tenant resuelto → muestra catálogo del comercio. Si no → muestra landing de la plataforma con lista de comercios.
- **Slideshow hero**: productos con `isFeatured: true`
- **Catálogo**: productos agrupados por categoría
- **Botón WhatsApp**: abre WhatsApp con mensaje de pedido pre-armado
- Usa `unstable_cache` de Next.js (30-60s de revalidación). Se invalida con `revalidateTag('tenant-products')` cuando el dashboard guarda cambios.
- **Deploy**: Vercel (funciona en producción)
- Tiene logo real del cliente (SVG con ícono naranja #FE6500 + texto #383838)

---

## App: dashboard (`@esquel-activo/dashboard`)

Panel de administración para los dueños de cada comercio.

### Autenticación
- Auth.js v5 con estrategia JWT
- Provider: Credentials (email + contraseña hasheada con bcryptjs)
- La sesión incluye: `tenantId`, `tenantSlug`, `role`
- Middleware protege todas las rutas excepto `/login` y `/api/auth`

**Patrón importante para middleware en Vercel Edge (límite 1 MB):**
- `auth.config.ts` → config mínima sin deps Node.js (para middleware)
- `auth.ts` → extiende authConfig + agrega Credentials con bcrypt/Prisma
- `middleware.ts` → importa solo `auth.config.ts`

### Rutas del dashboard

| Ruta | Descripción |
|---|---|
| `/login` | Formulario de inicio de sesión |
| `/dashboard` | Página principal (resumen) |
| `/dashboard/products` | CRUD de productos con imágenes |
| `/dashboard/settings` | Configuración del comercio (logo, info) |
| `/dashboard/orders` | Pedidos (pendiente) |

### Funcionalidades implementadas
- **CRUD de productos**: crear, editar, eliminar, activar/desactivar, marcar como destacado
- **Subida de imágenes**: Cloudinary (múltiples imágenes por producto)
- **Subida de logo**: Cloudinary, se guarda en `Tenant.logoUrl`
- **Categorías**: asignación en productos (CRUD de categorías pendiente)
- **Logout**

### UI
- shadcn/ui manual (Radix UI + class-variance-authority + tailwind-merge)
- Componentes en `src/components/ui/`: Button, Input, Label, Badge, Dialog, Select, Switch, Textarea, Separator
- Layout responsive: sidebar en desktop, bottom nav en mobile

### Deploy en Vercel
- URL: `https://esquel-activo-dashboard.vercel.app`
- Branch de producción: `claude/setup-project-standards-6eY1a`
- `vercel.json`:
```json
{
  "installCommand": "cd ../.. && pnpm install --no-frozen-lockfile",
  "buildCommand": "cd ../.. && pnpm turbo build --filter=@esquel-activo/dashboard",
  "outputDirectory": ".next",
  "framework": "nextjs"
}
```
- Root Directory en Vercel: `apps/dashboard`
- Variables de entorno: `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL`, `CLOUDINARY_*`

---

## Variables de entorno necesarias

```bash
# Base de datos (Neon PostgreSQL)
DATABASE_URL=""

# Auth.js v5
AUTH_SECRET=""           # openssl rand -base64 32
NEXTAUTH_URL=""          # URL del dashboard en producción

# Cloudinary
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

# Dominio de la plataforma
NEXT_PUBLIC_PLATFORM_DOMAIN="esquel-activo.com.ar"

# URLs internas
NEXT_PUBLIC_SHELL_URL="http://localhost:3000"
NEXT_PUBLIC_DASHBOARD_URL="http://localhost:3002"
```

---

## Estado actual y roadmap

### Hecho ✅
- Monorepo configurado (pnpm + Turborepo)
- Schema Prisma multi-tenant con aislamiento por `tenantId`
- App shell con catálogo, slideshow, agrupación por categorías
- Dashboard con CRUD de productos e imágenes
- Autenticación con Auth.js v5
- Logo real del cliente (SVG)
- shadcn/ui en dashboard
- Deploy del shell en Vercel (funcionando)
- Deploy del dashboard en Vercel (funcionando)

### Pendiente ❌

| Feature | Descripción |
|---|---|
| Settings completo | Editar nombre, dirección, Instagram, color, logo desde dashboard |
| Categorías CRUD | Crear/editar/eliminar categorías desde dashboard |
| Pedidos por WhatsApp | Botón "Pedir" en shell genera mensaje de WhatsApp |
| Onboarding | Formulario para registrar nuevo comercio + usuario |
| Panel admin | Gestión de todos los tenants desde cuenta administrador |
| Gestión de pedidos | Ver y actualizar estado de pedidos desde dashboard |

---

## Repositorio

- GitHub: `esquelactivo/Esquel-Activo`
- Rama de desarrollo activa: `claude/setup-project-standards-6eY1a`
