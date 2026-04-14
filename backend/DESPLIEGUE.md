# Guia de Despliegue Simplificada - Vladimir Photography

El proyecto esta preparado para desplegarse como una sola unidad: frontend y backend juntos.

## Requisitos Previos
- Cuenta en GitHub
- Cuenta en Render.com
- Cuenta en Cloudinary
- Cuenta en MongoDB Atlas

## Configuracion en Render

1. Crea un nuevo Web Service y conecta tu repositorio.
2. Usa estas opciones:
   - Runtime: `Node`
   - Build Command: `npm run deploy`
   - Start Command: `npm run start`
3. Agrega estas variables de entorno:
   - `PORT`: `5000`
   - `CLOUDINARY_URL`: `cloudinary://API_KEY:API_SECRET@dzn3i9vlh`
   - `MONGODB_URI`: tu cadena de conexion de MongoDB Atlas
   - `AUTH_SECRET`: una cadena larga aleatoria
   - `ADMIN_PASSWORD`: la contrasena del panel

## Beneficios

- Un solo servicio para toda la app
- El frontend queda servido desde el mismo backend
- Las rutas SPA como `/admin` y `/galeria` funcionan al recargar

