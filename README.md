# Vladimir Photographer Workspace

## Quick start
1. Install dependencies:
   - `npm run install:all`
2. Validate local setup:
   - `npm run doctor`
3. Start everything and open admin panel:
   - `npm run dev`

Admin URL: `http://localhost:5173/admin`

## Notes
- Backend runs on `http://localhost:5000`.
- Frontend runs on `http://localhost:5173`.
- In development, Vite proxy handles `/api` and `/uploads` to backend, so `VITE_API_URL` can stay empty.

## Estructura del proyecto
- `backend/`: API, autenticacion admin, subida de imagenes y fallback JSON.
- `backend/data/`: respaldo local para `content.json` y `messages.json` cuando no hay DB.
- `backend/uploads/`: subida local cuando Cloudinary no esta configurado.
- `frontend/`: app React + Vite (landing, panel admin y galeria).
- `frontend/src/data/content.json`: contenido inicial para el panel admin.
- `frontend/public/`: assets estaticos fuente (se copian a `dist` en build).
- `frontend/dist/`: salida de `npm run build` servida por el backend en produccion.
- `scripts/`: utilidades de desarrollo (`dev.ps1`, `doctor.js`).
