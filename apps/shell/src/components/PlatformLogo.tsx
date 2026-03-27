import Link from 'next/link'

type PlatformLogoProps = {
  /** Si el fondo es oscuro, usar la versión inverse del logo */
  inverse?: boolean
}

/**
 * Logo de la plataforma Esquel Activo.
 * Siempre lleva al home al hacer click.
 * Se adapta al fondo: logo.svg (fondo claro) o logo-inverse.svg (fondo oscuro).
 */
export function PlatformLogo({ inverse = false }: PlatformLogoProps) {
  const src = inverse ? '/logo-inverse.svg' : '/logo.svg'

  return (
    <Link
      href="/"
      className="fixed top-4 left-4 z-50 transition-opacity hover:opacity-80"
      aria-label="Ir al inicio — Esquel Activo"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="Esquel Activo"
        className="h-6 w-auto"
      />
    </Link>
  )
}
