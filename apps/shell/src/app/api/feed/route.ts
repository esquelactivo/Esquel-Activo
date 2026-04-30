import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@esquel-activo/db'
import { getCurrentTenant } from '@/lib/tenant'

export async function GET(req: NextRequest) {
  const tenant = await getCurrentTenant()
  if (!tenant) return NextResponse.json({ items: [], nextCursor: null })

  const { searchParams } = new URL(req.url)
  const cursor = searchParams.get('cursor')
  const type = searchParams.get('type') // 'stamps' | 'posts' | null (all)
  const limit = 10

  if (type === 'stamps') {
    return NextResponse.json({ items: [], nextCursor: null })
  }

  const posts = await prisma.post.findMany({
    where: {
      tenantId: tenant.id,
      isPublished: true,
      ...(type === 'posts' ? {} : {}),
    },
    include: { values: { select: { fieldKey: true, value: true } } },
    orderBy: { publishedAt: 'desc' },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  })

  const hasMore = posts.length > limit
  const items = hasMore ? posts.slice(0, limit) : posts
  const nextCursor = hasMore ? items[items.length - 1].id : null

  return NextResponse.json({
    items: items.map(p => ({
      id: p.id,
      type: 'post',
      postTypeSlug: p.postTypeSlug,
      postTypeName: p.postTypeName,
      title: p.title,
      publishedAt: p.publishedAt?.toISOString() ?? p.createdAt.toISOString(),
      values: p.values,
    })),
    nextCursor,
  })
}
