'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { PostFeedItem } from './PostFeedItem'

type FeedPost = {
  id: string
  type: 'post'
  postTypeSlug: string
  postTypeName: string
  title: string
  publishedAt: string
  values: { fieldKey: string; value: string | null }[]
}

type FilterType = 'all' | 'stamps' | 'posts'

interface FeedContainerProps {
  initialPosts: FeedPost[]
  initialNextCursor: string | null
  hasStampCard: boolean
  stampCardSlot: React.ReactNode
}

export function FeedContainer({ initialPosts, initialNextCursor, hasStampCard, stampCardSlot }: FeedContainerProps) {
  const [filter, setFilter] = useState<FilterType>('all')
  const [posts, setPosts] = useState<FeedPost[]>(initialPosts)
  const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor)
  const [loading, setLoading] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const loadMore = useCallback(async () => {
    if (!nextCursor || loading) return
    setLoading(true)
    try {
      const params = new URLSearchParams({ cursor: nextCursor })
      if (filter === 'posts') params.set('type', 'posts')
      const res = await fetch(`/api/feed?${params}`)
      const data = await res.json()
      setPosts(prev => [...prev, ...data.items])
      setNextCursor(data.nextCursor)
    } finally {
      setLoading(false)
    }
  }, [nextCursor, loading, filter])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      entries => { if (entries[0]?.isIntersecting) loadMore() },
      { rootMargin: '200px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [loadMore])

  // Reset when filter changes
  useEffect(() => {
    if (filter === 'all' || filter === 'posts') {
      setPosts(initialPosts)
      setNextCursor(initialNextCursor)
    }
  }, [filter, initialPosts, initialNextCursor])

  const showStamp = hasStampCard && (filter === 'all' || filter === 'stamps')
  const showPosts = filter === 'all' || filter === 'posts'

  const filters: { id: FilterType; label: string }[] = [
    { id: 'all', label: 'Todo' },
    ...(hasStampCard ? [{ id: 'stamps' as FilterType, label: 'Sellos' }] : []),
    { id: 'posts', label: 'Novedades' },
  ]

  return (
    <div className="space-y-4">
      {/* Filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {filters.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === f.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-4">
        {showStamp && stampCardSlot}

        {showPosts && posts.map(post => (
          <PostFeedItem key={post.id} post={post} />
        ))}

        {showPosts && posts.length === 0 && !loading && (
          <div className="rounded-2xl border border-dashed border-gray-200 py-10 text-center text-sm text-gray-400">
            Todavía no hay publicaciones
          </div>
        )}
      </div>

      {/* Infinite scroll sentinel */}
      {showPosts && <div ref={sentinelRef} className="h-4" />}

      {loading && (
        <p className="text-center text-xs text-gray-400 py-2">Cargando…</p>
      )}
    </div>
  )
}
