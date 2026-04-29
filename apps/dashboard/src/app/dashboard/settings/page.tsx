import { auth } from '@/lib/auth'
import { prisma } from '@esquel-activo/db'
import { LogoUpload } from '@/components/LogoUpload'
import { LogoutButton } from '@/components/LogoutButton'
import { TenantInfoEditor } from './TenantInfoEditor'

export const metadata = { title: 'Configuración' }

export default async function SettingsPage() {
  const session = await auth()
  const tenant = session?.user?.tenantSlug
    ? await prisma.tenant.findUnique({
        where: { slug: session.user.tenantSlug },
        select: {
          name: true, brandName: true, slug: true,
          primaryColor: true, secondaryColor: true,
          contactPhone: true, contactEmail: true,
          address: true, instagramUrl: true, facebookUrl: true,
          googleBusinessUrl: true, logoUrl: true,
        },
      })
    : null

  const displayName = tenant?.brandName ?? tenant?.name ?? 'Mi negocio'

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-gray-900">Configuración</h1>

      {/* Logo */}
      <Section title="Logo" icon="🖼️">
        <LogoUpload
          currentLogoUrl={tenant?.logoUrl ?? null}
          tenantName={displayName}
        />
      </Section>

      {/* Secciones */}
      <Section title="Mi negocio" icon="🏪">
        <InfoRow label="Nombre" value={displayName} />
        <InfoRow label="Teléfono / WhatsApp" value={tenant?.contactPhone ?? 'No configurado'} />
        <InfoRow label="Email" value={tenant?.contactEmail ?? 'No configurado'} />
        <InfoRow label="Dirección" value={tenant?.address ?? 'No configurado'} />
        <InfoRow label="Instagram" value={tenant?.instagramUrl ?? 'No configurado'} />
        <InfoRow label="Facebook" value={tenant?.facebookUrl ?? 'No configurado'} />
        <InfoRow label="Google Business" value={tenant?.googleBusinessUrl ?? 'No configurado'} />
        <TenantInfoEditor tenant={{
          brandName: tenant?.brandName ?? null,
          contactPhone: tenant?.contactPhone ?? null,
          contactEmail: tenant?.contactEmail ?? null,
          address: tenant?.address ?? null,
          instagramUrl: tenant?.instagramUrl ?? null,
          facebookUrl: tenant?.facebookUrl ?? null,
          googleBusinessUrl: tenant?.googleBusinessUrl ?? null,
        }} />
      </Section>

      <Section title="Apariencia" icon="🎨">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full border border-gray-200" style={{ backgroundColor: tenant?.primaryColor }} />
          <div>
            <p className="text-sm font-medium text-gray-700">Color principal</p>
            <p className="text-xs text-gray-400">{tenant?.primaryColor}</p>
          </div>
        </div>
        <button className="mt-3 w-full rounded-xl border border-primary py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/5">
          Cambiar colores — próximamente
        </button>
      </Section>

      <Section title="WhatsApp Cloud API" icon="💬">
        <p className="text-sm text-gray-500">
          Conectá tu WhatsApp Business para recibir notificaciones de pedidos automáticamente.
        </p>
        <button className="mt-3 w-full rounded-xl border border-primary py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/5">
          Configurar WhatsApp — próximamente
        </button>
      </Section>

      {/* Cerrar sesión — visible en mobile, en desktop está en el sidebar */}
      <div className="rounded-2xl bg-white p-2 shadow-sm ring-1 ring-gray-100 md:hidden">
        <LogoutButton />
      </div>
    </div>
  )
}

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
      <h2 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
        <span>{icon}</span> {title}
      </h2>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-xs font-medium text-gray-400">{label}</p>
      <p className="text-sm text-gray-700">{value}</p>
    </div>
  )
}
