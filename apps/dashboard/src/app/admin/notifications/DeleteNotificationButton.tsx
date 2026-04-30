'use client'

import { deleteNotification } from './actions'

export function DeleteNotificationButton({ id }: { id: string }) {
  return (
    <form
      action={deleteNotification}
      onSubmit={e => {
        if (!confirm('¿Eliminar esta notificación?')) e.preventDefault()
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="text-xs text-red-400 hover:text-red-300 transition-colors"
      >
        Eliminar
      </button>
    </form>
  )
}
