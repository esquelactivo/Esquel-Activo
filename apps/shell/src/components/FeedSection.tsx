import { auth } from '@/lib/auth'
import { prisma } from '@esquel-activo/db'
import { StampCardFeedItem } from './StampCardFeedItem'
import { FeedContainer } from './FeedContainer'

interface FeedSectionProps {
  tenantId: string
  hasCatalog: boolean
  catalogSlot: React.ReactNode
}

export async function FeedSection({ tenantId, hasCatalog, catalogSlot }: FeedSectionProps) {
  const session = await auth()
  const userId = session?.user ? (session.user as { id: string }).id : null

  // Fetch stamp card + user progress + first page of posts in parallel
  const [stampCard, initialPostsRaw] = await Promise.all([
    prisma.stampCard.findFirst({
      where: { tenantId, isActive: true },
      select: { id: true, tenantId: true, name: true, description: true, totalStamps: true, reward: true, color: true },
    }).catch(() => null),
    prisma.post.findMany({
      where: { tenantId, isPublished: true },
      include: { values: { select: { fieldKey: true, value: true } } },
      orderBy: { publishedAt: 'desc' },
      take: 11,
    }).catch((err) => {
      console.error('[FeedSection] Error fetching posts:', err)
      return []
    }),
  ])

  const userCard = stampCard && userId
    ? await prisma.userStampCard.findUnique({
        where: { stampCardId_userId: { stampCardId: stampCard.id, userId } },
        select: { currentStamps: true, completedCount: true },
      }).catch(() => null)
    : null

  const hasMore = initialPostsRaw.length > 10
  const postsPage = hasMore ? initialPostsRaw.slice(0, 10) : initialPostsRaw
  const nextCursor = hasMore ? (postsPage.at(-1)?.id ?? null) : null

  const initialPosts = postsPage.map(p => ({
    id: p.id,
    type: 'post' as const,
    postTypeSlug: p.postTypeSlug,
    postTypeName: p.postTypeName,
    title: p.title,
    publishedAt: p.publishedAt?.toISOString() ?? p.createdAt.toISOString(),
    values: p.values,
  }))

  const stampCardSlot = stampCard ? (
    <StampCardFeedItem
      card={stampCard}
      userCard={userCard}
      isLoggedIn={!!userId}
    />
  ) : null

  if (!stampCard && initialPosts.length === 0 && !hasCatalog) return null

  return (
    <FeedContainer
      initialPosts={initialPosts}
      initialNextCursor={nextCursor}
      hasStampCard={!!stampCard}
      hasCatalog={hasCatalog}
      stampCardSlot={stampCardSlot}
      catalogSlot={catalogSlot}
    />
  )
}
