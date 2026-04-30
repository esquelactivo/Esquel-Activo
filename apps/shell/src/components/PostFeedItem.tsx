interface PostFeedItemProps {
  post: {
    id: string
    postTypeSlug: string
    postTypeName: string
    title: string
    publishedAt: string
    values: { fieldKey: string; value: string | null }[]
  }
}

export function PostFeedItem({ post }: PostFeedItemProps) {
  const imageValue = post.values.find(v => v.fieldKey === 'image' || v.fieldKey === 'imagen' || v.fieldKey === 'imageUrl')
  const descValue = post.values.find(v => v.fieldKey === 'description' || v.fieldKey === 'descripcion' || v.fieldKey === 'content' || v.fieldKey === 'contenido')

  const date = new Date(post.publishedAt)
  const formatted = date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      {imageValue?.value && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageValue.value}
          alt={post.title}
          className="w-full h-44 object-cover"
        />
      )}
      <div className="p-4 space-y-2">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
            {post.postTypeName}
          </span>
          <span className="text-xs text-gray-400">{formatted}</span>
        </div>
        <h3 className="font-semibold text-gray-900 leading-snug">{post.title}</h3>
        {descValue?.value && (
          <p className="text-sm text-gray-500 line-clamp-2">{descValue.value}</p>
        )}
      </div>
    </div>
  )
}
