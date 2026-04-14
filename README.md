# Vladimir Photographer Workspace

## Quick start
1. Install dependencies:
   - `npm run install:all`
2. Validate local setup:
   - `npm run doctor`
3. Start everything and open admin panel:
   - `npm run dev`

Admin URL: `http://localhost:5173/admin`

## Deploy
This project is ready to deploy as a single web service with the backend serving the built frontend.

Recommended flow on Render:
1. Connect the GitHub repo.
2. Use `render.yaml` or create a new Web Service manually.
3. Set the build command to `npm run deploy`.
4. Set the start command to `npm run start`.
5. Set these environment variables in Render:
   - `CLOUDINARY_URL`
   - `MONGODB_URI`
   - `AUTH_SECRET`
   - `ADMIN_PASSWORD`
6. Leave `PORT` to the platform or keep it at `5000`.

The app can run without MongoDB if you leave that env var empty:
- it falls back to local JSON files for content and messages
- image uploads should use Cloudinary in production via `CLOUDINARY_URL`

## Notes
- Backend runs on `http://localhost:5000`.
- Frontend runs on `http://localhost:5173`.
- In development, Vite proxy handles `/api` and `/uploads` to backend, so `VITE_API_URL` can stay empty.
- For production, the backend serves the compiled frontend from `backend/dist`.
- If you deploy the frontend separately, set `VITE_API_URL` to your backend URL.

## Estructura del proyecto
- `backend/`: API, autenticacion admin, subida de imagenes y fallback JSON.
- `backend/data/`: respaldo local para `content.json` y `messages.json` cuando no hay DB.
- `backend/uploads/`: cache local de desarrollo para migrar contenido a Cloudinary.
- `frontend/`: app React + Vite (landing, panel admin y galeria).
- `frontend/src/data/content.json`: contenido inicial para el panel admin.
- `frontend/public/`: assets estaticos fuente (se copian a `dist` en build).
- `frontend/dist/`: salida de `npm run build` servida por el backend en produccion.
- `scripts/`: utilidades de desarrollo (`dev.ps1`, `doctor.js`).
