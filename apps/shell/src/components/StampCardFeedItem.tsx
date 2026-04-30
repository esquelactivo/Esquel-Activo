'use client'

import { useState } from 'react'
import { QrModal } from './QrModal'

interface StampCardFeedItemProps {
  card: {
    id: string
    tenantId: string
    name: string
    description: string | null
    totalStamps: number
    reward: string
    color: string | null
  }
  userCard: {
    currentStamps: number
    completedCount: number
  } | null
  isLoggedIn: boolean
}

export function StampCardFeedItem({ card, userCard, isLoggedIn }: StampCardFeedItemProps) {
  const [showQr, setShowQr] = useState(false)

  const current = userCard?.currentStamps ?? 0
  const total = card.totalStamps
  const bgStyle = card.color
    ? { background: card.color }
    : { background: 'linear-gradient(135deg, #1a1a2e 0%, #e94560 100%)' }

  return (
    <>
      <div className="rounded-2xl text-white overflow-hidden shadow-sm" style={bgStyle}>
        <div className="p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest opacity-70">Tarjeta de sellos</p>
              <p className="text-lg font-bold mt-0.5">{card.name}</p>
              {card.description && <p className="text-sm opacity-70 mt-0.5">{card.description}</p>}
            </div>
            {isLoggedIn && userCard && userCard.completedCount > 0 && (
              <span className="rounded-full bg-white/20 px-2.5 py-1 text-xs font-medium">
                ×{userCard.completedCount} completadas
              </span>
            )}
          </div>

          {/* Sellos */}
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: total }).map((_, i) => (
              <div
                key={i}
                className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-base transition-all ${
                  i < current
                    ? 'border-white bg-white/30'
                    : 'border-white/40 bg-transparent'
                }`}
              >
                {i < current ? '⭐' : ''}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm opacity-80">🎁 {card.reward}</p>
            {isLoggedIn ? (
              <button
                onClick={() => setShowQr(true)}
                className="rounded-xl bg-white/20 hover:bg-white/30 px-4 py-2 text-sm font-medium transition-colors"
              >
                Pedir sello
              </button>
            ) : (
              <a
                href="/login"
                className="rounded-xl bg-white/20 hover:bg-white/30 px-4 py-2 text-sm font-medium transition-colors"
              >
                Iniciar sesión
              </a>
            )}
          </div>

          {isLoggedIn && (
            <div className="h-1.5 rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full rounded-full bg-white/70 transition-all"
                style={{ width: `${(current / total) * 100}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {showQr && <QrModal tenantId={card.tenantId} onClose={() => setShowQr(false)} />}
    </>
  )
}
