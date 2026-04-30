import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@esquel-activo/db'
import { togglePublish, deletePost } from './actions'

export const metadata = { title: 'Contenido' }

export default async function PostsPage() {
  const session = await auth()
  if (!session?.user?.tenantId) redirect('/login')
  const tenantId = session.user.tenantId

  const [posts, postTypes] = await Promise.all([
    prisma.post.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      include: { values: { select: { fieldKey: true, value: true } } },
    }),
    prisma.postType.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true, icon: true },
    }),
  ])

  // Agrupar posts por tipo
  const grouped = new Map<string, { name: string; icon: string | null; posts: typeof posts }>()
  for (const p of posts) {
    if (!grouped.has(p.postTypeSlug)) {
      grouped.set(p.postTypeSlug, { name: p.postTypeName, icon: null, posts: [] })
    }
    grouped.get(p.postTypeSlug)!.posts.push(p)
  }

  const hasPostTypes = postTypes.length > 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Contenido</h1>
          <p className="mt-0.5 text-sm text-gray-500">Administrá las publicaciones de tu negocio</p>
        </div>
        {hasPostTypes && (
          <div className="flex items-center gap-2">
            {postTypes.map(pt => (
              <Link
                key={pt.id}
                href={`/dashboard/posts/new?typeId=${pt.id}`}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
              >
                {pt.icon && <span>{pt.icon}</span>}
                <span>+ {pt.name}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {!hasPostTypes ? (
        <div className="rounded-2xl border border-gray-100 bg-gray-50 py-14 text-center">
          <p className="text-3xl mb-3">📝</p>
          <p className="text-sm font-medium text-gray-700">No hay tipos de contenido disponibles</p>
          <p className="text-xs text-gray-400 mt-1">El administrador de la plataforma debe crearlos primero</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-gray-50 py-14 text-center">
          <p className="text-3xl mb-3">📝</p>
          <p className="text-sm font-medium text-gray-700">Todavía no creaste publicaciones</p>
          <p className="text-xs text-gray-400 mt-1">Usá los botones de arriba para crear tu primera publicación</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Array.from(grouped.entries()).map(([slug, group]) => {
            const ptInfo = postTypes.find(pt => pt.slug === slug)
            return (
              <div key={slug}>
                <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  {ptInfo?.icon && <span>{ptInfo.icon}</span>}
                  {group.name}
                  <span className="text-gray-300 font-normal normal-case tracking-normal">({group.posts.length})</span>
                </h2>
                <div className="rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-gray-50">
                      {group.posts.map(p => (
                        <tr key={p.id} className="bg-white hover:bg-gray-50/50 transition-colors">
                          <td className="px-5 py-4">
                            <p className="font-medium text-gray-900 truncate max-w-xs">{p.title}</p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {new Date(p.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </p>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-3">
                              <form action={togglePublish.bind(null, p.id, !p.isPublished)}>
                                <button
                                  type="submit"
                                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${p.isPublished ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                >
                                  {p.isPublished ? 'Publicado' : 'Borrador'}
                                </button>
                              </form>
                              <Link
                                href={`/dashboard/posts/${p.id}/edit`}
                                className="text-xs text-primary hover:opacity-70 font-medium transition-opacity"
                              >
                                Editar
                              </Link>
                              <form action={deletePost.bind(null, p.id)}>
                                <button type="submit" className="text-xs text-red-400 hover:text-red-600 transition-colors">
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
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
