import { PostTypeForm } from '../PostTypeForm'

export const metadata = { title: 'Nuevo tipo de contenido — Admin' }

export default function NewPostTypePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Nuevo tipo de contenido</h1>
        <p className="mt-1 text-sm text-gray-400">
          Define el nombre, slug y los campos que tendrá este tipo de publicación
        </p>
      </div>
      <PostTypeForm />
    </div>
  )
}
