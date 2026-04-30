import Link from 'next/link'
import { prisma } from '@esquel-activo/db'
import { deletePostType } from './actions'

export const metadata = { title: 'Tipos de contenido — Admin' }

export default async function AdminPostTypesPage() {
  const postTypes = await prisma.postType.findMany({
    orderBy: { createdAt: 'asc' },
    include: { _count: { select: { fields: true } } },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Tipos de contenido</h1>
          <p className="mt-1 text-sm text-gray-400">
            Definí qué tipos de publicaciones pueden crear los comercios
          </p>
        </div>
        <Link
          href="/admin/post-types/new"
          className="px-4 py-2 rounded-xl bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition-colors"
        >
          + Nuevo tipo
        </Link>
      </div>

      {postTypes.length === 0 ? (
        <div className="rounded-2xl border border-gray-700 bg-gray-800/30 py-16 text-center">
          <p className="text-4xl mb-3">📝</p>
          <p className="text-gray-400 text-sm">No hay tipos de contenido creados aún</p>
          <Link
            href="/admin/post-types/new"
            className="mt-4 inline-block text-sm text-orange-400 hover:text-orange-300"
          >
            Crear el primero →
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700 bg-gray-800/50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Tipo</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Slug</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Campos</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Estado</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {postTypes.map((pt) => (
                <tr key={pt.id} className="bg-gray-800/20 hover:bg-gray-800/40 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {pt.icon && <span className="text-xl">{pt.icon}</span>}
                      <div>
                        <p className="font-medium text-white">{pt.name}</p>
                        {pt.description && (
                          <p className="text-xs text-gray-500 mt-0.5 max-w-xs truncate">{pt.description}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <code className="text-xs text-gray-400 bg-gray-700 px-2 py-0.5 rounded">{pt.slug}</code>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-gray-300">{pt._count.fields} campos</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${pt.isActive ? 'bg-green-900/50 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
                      {pt.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/post-types/${pt.id}/edit`}
                        className="text-xs text-orange-400 hover:text-orange-300 transition-colors"
                      >
                        Editar
                      </Link>
                      <form action={deletePostType.bind(null, pt.id)}>
                        <button
                          type="submit"
                          className="text-xs text-red-400 hover:text-red-300 transition-colors"
                        >
                          Eliminar
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
