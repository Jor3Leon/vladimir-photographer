# Backend - Vladimir Photography

API para contenido del portafolio, panel admin y formulario de contacto.

## Seguridad aplicada
- Login admin en backend (`POST /api/auth/login`).
- Token firmado (Bearer) con expiracion.
- Endpoints sensibles protegidos:
  - `POST /api/content`
  - `POST /api/upload`
  - `GET /api/messages`
  - `PATCH /api/messages/:id`
  - `DELETE /api/messages/:id`
- CORS restringido por lista de origenes.
- Rate limiting en login y envio de mensajes.
- Validacion de input en contacto.
- Limite de payload JSON y de tamano de imagen (5MB).

## Variables de entorno recomendadas
- `PORT=5000`
- `MONGODB_URI=mongodb+srv://...`
- `AUTH_SECRET=<secreto_largo_random>`
- `ADMIN_PASSWORD_HASH=<hash_pbkdf2>`
- `AUTH_TOKEN_TTL_SECONDS=28800`
- `CORS_ORIGINS=https://tu-dominio.com,http://localhost:5173`
- `CLOUDINARY_CLOUD_NAME=...`
- `CLOUDINARY_API_KEY=...`
- `CLOUDINARY_API_SECRET=...`

## Generar hash del password admin
```bash
node ../scripts/hash_gen.cjs "tu-password-seguro"
```

Copia la salida y pegala en `ADMIN_PASSWORD_HASH`.

## Ejecutar
```bash
npm install
npm start
```
