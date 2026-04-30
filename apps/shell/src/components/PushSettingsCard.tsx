'use client'

import { usePushNotifications } from '@/context/PushNotificationsContext'

export function PushSettingsCard() {
  const { state, error, subscribe, unsubscribe } = usePushNotifications()

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-2xl">🔔</span>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">Notificaciones push</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {state === 'subscribed' && 'Activadas — recibirás novedades y promos'}
            {state === 'unsubscribed' && 'Desactivadas'}
            {state === 'denied' && 'Bloqueadas por el navegador'}
            {state === 'ios-needs-pwa' && 'Requiere agregar la app a la pantalla de inicio'}
            {state === 'unsupported' && 'Tu navegador no soporta notificaciones push'}
            {state === 'loading' && 'Comprobando estado…'}
          </p>
        </div>
        {(state === 'subscribed' || state === 'unsubscribed') && (
          <button
            onClick={state === 'subscribed' ? unsubscribe : subscribe}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              state === 'subscribed' ? 'bg-primary' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                state === 'subscribed' ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        )}
      </div>

      {state === 'ios-needs-pwa' && (
        <div className="rounded-xl bg-blue-50 px-4 py-3 text-xs text-blue-700 space-y-1">
          <p className="font-medium">Para activar notificaciones en iPhone:</p>
          <ol className="list-decimal list-inside space-y-0.5">
            <li>Tocá el botón <strong>Compartir</strong> (⬆) en Safari</li>
            <li>Elegí <strong>Agregar a pantalla de inicio</strong></li>
            <li>Abrí la app desde el ícono en tu pantalla de inicio</li>
          </ol>
        </div>
      )}

      {state === 'denied' && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-xs text-red-700">
          Las notificaciones están bloqueadas. Habilitálas en <strong>Configuración del navegador → Privacidad → Notificaciones</strong>.
        </div>
      )}

      {error && (
        <p className="text-xs text-red-500 bg-red-50 rounded-xl px-4 py-2">{error}</p>
      )}
    </div>
  )
}
