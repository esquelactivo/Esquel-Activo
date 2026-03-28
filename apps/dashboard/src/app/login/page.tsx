import { LoginForm } from '@/components/LoginForm'

export const metadata = { title: 'Iniciar sesión' }

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="Esquel Activo" className="mx-auto max-h-[40px] w-auto" />
          <p className="mt-3 text-sm text-gray-500">Panel de gestión de comercios</p>
        </div>

        <LoginForm />
      </div>
    </main>
  )
}
