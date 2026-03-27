import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combina clases de Tailwind de forma inteligente.
 * Resuelve conflictos (ej: "p-4 p-6" → "p-6") y soporta condicionales.
 *
 * Uso:
 *   cn("base-class", isActive && "active-class", "another-class")
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
