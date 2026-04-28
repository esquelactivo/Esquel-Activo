import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { signOut } from '@/lib/auth'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session?.user?.isSuperAdmin) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-60 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-5 border-b border-gray-800">
          <p className="text-xs font-semibold text-orange-400 uppercase tracking-widest">Super Admin</p>
          <p className="mt-1 text-sm font-bold text-white">Esquel Activo</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <AdminNavLink href="/admin" label="Panel general" icon="⚡" />
          <AdminNavLink href="/admin/tenants" label="Comercios" icon="🏪" />
          <AdminNavLink href="/admin/users" label="Usuarios" icon="👥" />
        </nav>

        <div className="p-4 border-t border-gray-800">
          <p className="text-xs text-gray-500 mb-3">{session.user.email}</p>
          <form action={async () => {
            'use server'
            await signOut({ redirectTo: '/login' })
          }}>
            <button className="w-full text-left text-xs text-gray-400 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-gray-800">
              Cerrar sesión
            </button>
          </form>
        </div>
      </div>

      {/* Main content */}
      <div className="ml-60 p-8">
        {children}
      </div>
    </div>
  )
}

function AdminNavLink({ href, label, icon }: { href: string; label: string; icon: string }) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
    >
      <span>{icon}</span>
      <span>{label}</span>
    </a>
  )
}
