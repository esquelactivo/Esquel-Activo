'use client'

import { useRef, useState, useTransition } from 'react'
import { updateTenantInfo } from './actions'

type TenantData = {
  brandName: string | null
  contactPhone: string | null
  contactEmail: string | null
  address: string | null
  instagramUrl: string | null
  facebookUrl: string | null
  googleBusinessUrl: string | null
}

export function TenantInfoEditor({ tenant }: { tenant: TenantData }) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  function handleSubmit(formData: FormData) {
    setError(null)
    setSuccess(false)
    startTransition(async () => {
      const result = await updateTenantInfo(formData)
      if (result.success) {
        setSuccess(true)
        setTimeout(() => { setOpen(false); setSuccess(false) }, 900)
      } else {
        setError(result.error ?? 'Error desconocido')
      }
    })
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="mt-3 w-full rounded-xl border border-primary py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/5"
      >
        Editar información
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center" onClick={() => setOpen(false)}>
          <div
            className="w-full max-w-lg rounded-t-2xl bg-white p-6 shadow-xl sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">Editar información del negocio</h2>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <form ref={formRef} action={handleSubmit} className="flex flex-col gap-3">
              <Field name="brandName" label="Nombre visible" defaultValue={tenant.brandName} placeholder="Ej: Chocolatería Esquel" />
              <Field name="contactPhone" label="Teléfono / WhatsApp" defaultValue={tenant.contactPhone} placeholder="+54 9 294 400-0000" />
              <Field name="contactEmail" label="Email de contacto" defaultValue={tenant.contactEmail} placeholder="info@minegocio.com" type="email" />
              <Field name="address" label="Dirección" defaultValue={tenant.address} placeholder="Av. Alvear 1234, Esquel" />
              <Field name="instagramUrl" label="Instagram URL" defaultValue={tenant.instagramUrl} placeholder="https://instagram.com/tu_negocio" type="url" />
              <Field name="facebookUrl" label="Facebook URL" defaultValue={tenant.facebookUrl} placeholder="https://facebook.com/tu_negocio" type="url" />

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500">Google Business URL</label>
                <input
                  name="googleBusinessUrl"
                  type="url"
                  defaultValue={tenant.googleBusinessUrl ?? ''}
                  placeholder="https://maps.app.goo.gl/..."
                  className="rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-800 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
                <p className="text-[11px] text-gray-400">
                  En Google Maps, buscá tu negocio → Compartir → Copiar enlace
                </p>
              </div>

              {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}
              {success && <p className="rounded-lg bg-green-50 px-3 py-2 text-xs text-green-600">¡Cambios guardados!</p>}

              <button
                type="submit"
                disabled={isPending}
                className="mt-1 w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
              >
                {isPending ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

function Field({
  name, label, defaultValue, placeholder, type = 'text',
}: {
  name: string
  label: string
  defaultValue: string | null
  placeholder?: string
  type?: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-500">{label}</label>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue ?? ''}
        placeholder={placeholder}
        className="rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-800 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
      />
    </div>
  )
}
