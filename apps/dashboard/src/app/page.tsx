import { redirect } from 'next/navigation'

// La raíz del dashboard siempre redirige a /dashboard
export default function RootPage() {
  redirect('/dashboard')
}
