'use client'

import { useState, useTransition } from 'react'
import { createUser, updateUser, deleteUser, toggleUserActive } from './actions'

type Tenant = { id: string; name: string; slug: string }
type Membership = { id: string; role: string; tenant: Tenant }
type User = {
  id: string
  email: string
  name: string | null
  isSuperAdmin: boolean
  isActive: boolean
  createdAt: string
  memberships: Membership[]
}

export function UserManagement({ users, tenants }: { users: User[]; tenants: Tenant[] }) {
  const [showCreate, setShowCreate] = useState(false)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await createUser(formData)
      if (result.success) setShowCreate(false)
      else setError(result.error ?? 'Error')
    })
  }

  function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await updateUser(formData)
      if (result.success) setEditUser(null)
      else setError(result.error ?? 'Error')
    })
  }

  function handleDelete(userId: string) {
    if (!confirm('¿Seguro que querés eliminar este usuario? Esta acción no se puede deshacer.')) return
    const formData = new FormData()
    formData.set('userId', userId)
    startTransition(async () => {
      await deleteUser(formData)
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Usuarios</h1>
          <p className="mt-1 text-sm text-gray-400">{users.length} usuarios registrados</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 rounded-xl bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition-colors"
        >
          + Nuevo usuario
        </button>
      </div>

      {/* Modal crear usuario */}
      {showCreate && (
        <Modal title="Nuevo usuario" onClose={() => { setShowCreate(false); setError(null) }}>
          <form onSubmit={handleCreate} className="space-y-4">
            <Field label="Nombre" name="name" placeholder="Nombre completo" required />
            <Field label="Email" name="email" type="email" placeholder="email@ejemplo.com" required />
            <Field label="Contraseña" name="password" type="password" placeholder="Mínimo 6 caracteres" required />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-300">Comercio (opcional)</label>
              <select name="tenantId" className="rounded-xl bg-gray-700 border border-gray-600 text-white px-3 py-2 text-sm">
                <option value="">Sin comercio</option>
                {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-300">Rol</label>
              <select name="role" className="rounded-xl bg-gray-700 border border-gray-600 text-white px-3 py-2 text-sm">
                <option value="OWNER">Owner</option>
                <option value="ADMIN">Admin</option>
                <option value="STAFF">Staff</option>
              </select>
            </div>
            {error && <p className="text-sm text-red-400 bg-red-900/20 rounded-xl px-3 py-2">{error}</p>}
            <ModalFooter onCancel={() => { setShowCreate(false); setError(null) }} pending={isPending} label="Crear usuario" />
          </form>
        </Modal>
      )}

      {/* Modal editar usuario */}
      {editUser && (
        <Modal title="Editar usuario" onClose={() => { setEditUser(null); setError(null) }}>
          <form onSubmit={handleUpdate} className="space-y-4">
            <input type="hidden" name="userId" value={editUser.id} />
            <Field label="Nombre" name="name" defaultValue={editUser.name ?? ''} placeholder="Nombre completo" />
            <Field label="Nueva contraseña" name="password" type="password" placeholder="Dejar vacío para no cambiar" />
            {error && <p className="text-sm text-red-400 bg-red-900/20 rounded-xl px-3 py-2">{error}</p>}
            <ModalFooter onCancel={() => { setEditUser(null); setError(null) }} pending={isPending} label="Guardar cambios" />
          </form>
        </Modal>
      )}

      {/* Tabla */}
      <div className="rounded-2xl border border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700 bg-gray-800/50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Usuario</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Comercios</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Tipo</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Estado</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50">
            {users.map((user) => (
              <tr key={user.id} className="bg-gray-800/20 hover:bg-gray-800/40 transition-colors">
                <td className="px-5 py-4">
                  <p className="font-medium text-white">{user.name ?? '—'}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
                </td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap gap-1">
                    {user.memberships.length === 0 && <span className="text-gray-600 text-xs">Sin comercio</span>}
                    {user.memberships.map((m) => (
                      <span key={m.id} className="px-2 py-0.5 rounded-full text-xs bg-gray-700 text-gray-300">
                        {m.tenant.name} · {m.role}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-5 py-4">
                  {user.isSuperAdmin
                    ? <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-900/50 text-orange-400">Super Admin</span>
                    : <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-300">Comercio</span>}
                </td>
                <td className="px-5 py-4">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${user.isActive ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                    {user.isActive ? 'Activo' : 'Suspendido'}
                  </span>
                </td>
                <td className="px-5 py-4">
                  {!user.isSuperAdmin && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditUser(user)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
                      >
                        Editar
                      </button>
                      <form action={toggleUserActive}>
                        <input type="hidden" name="userId" value={user.id} />
                        <input type="hidden" name="hasPassword" value={String(user.isActive)} />
                        <button type="submit" className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${user.isActive ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50' : 'bg-green-900/30 text-green-400 hover:bg-green-900/50'}`}>
                          {user.isActive ? 'Suspender' : 'Reactivar'}
                        </button>
                      </form>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-red-900/20 text-red-400 hover:bg-red-900/40 transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Field({ label, name, type = 'text', placeholder, defaultValue, required }: {
  label: string; name: string; type?: string; placeholder?: string; defaultValue?: string; required?: boolean
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-300">{label}</label>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        required={required}
        className="rounded-xl bg-gray-700 border border-gray-600 text-white px-3 py-2 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
      />
    </div>
  )
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="w-full max-w-md rounded-2xl bg-gray-800 border border-gray-700 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

function ModalFooter({ onCancel, pending, label }: { onCancel: () => void; pending: boolean; label: string }) {
  return (
    <div className="flex gap-3 pt-2">
      <button type="button" onClick={onCancel} className="flex-1 py-2 rounded-xl border border-gray-600 text-gray-300 text-sm hover:bg-gray-700 transition-colors">
        Cancelar
      </button>
      <button type="submit" disabled={pending} className="flex-1 py-2 rounded-xl bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 disabled:opacity-60 transition-colors">
        {pending ? 'Guardando...' : label}
      </button>
    </div>
  )
}
