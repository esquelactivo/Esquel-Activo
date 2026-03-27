# Assets de Reina Mora

Carpeta de assets estáticos del tenant "Reina Mora".

## Archivos requeridos

| Archivo | Tamaño | Descripción |
|---------|--------|-------------|
| `logo.png` | mínimo 512×512px | Logo principal (fondo transparente o #0f2c32) |
| `logo.svg` | — | Placeholder temporal (reemplazar con el PNG real) |
| `favicon.png` | 32×32px o 64×64px | Ícono del browser tab |
| `icon-192.png` | 192×192px | Ícono PWA (requerido por manifest) |
| `icon-512.png` | 512×512px | Ícono PWA splash screen |

## Instrucciones

1. Copiá el logo original (`image.png` que tenés) a esta carpeta como `logo.png`
2. Generá los íconos de PWA en: https://maskable.app/editor o https://www.pwabuilder.com/imageGenerator
3. Para el favicon: exportá el logo a 32×32px
4. Una vez copiados los archivos, actualizá el seed (`packages/db/src/seed.ts`)
   con la URL correcta del logo (si usás CDN como Cloudinary, reemplazá `/tenants/...` con la URL externa)

## Colores de la marca

- **Primario:** `#0f2c32` (verde oscuro)
- **Secundario:** `#c8a2a2` (rosa suave — patisserie)
- **Fondo:** `#ffffff` (blanco minimalista)
