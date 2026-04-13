# 🚀 Guía de Despliegue Simplificada - Vladimir Photography

El proyecto ha sido optimizado para desplegarse como una **única unidad** (Frontend + Backend juntos).

## 1. Requisitos Previos
*   Cuenta en **GitHub**.
*   Cuenta en **Render.com** (o Railway.app).
*   Cuenta en **Cloudinary** (Para fotos persistentes).
*   Cuenta en **MongoDB Atlas** (Para texto persistente).

## 2. Configuración en Render.com (Recomendado)

1. **Crear un nuevo "Web Service"** y conectar tu repositorio de GitHub.
2. **Configuración del Proyecto**:
   *   **Runtime**: `Node`
   *   **Build Command**: `npm install && npm run build && cd server && npm install`
   *   **Start Command**: `npm start`
3. **Variables de Entorno (Environment Variables)**:
   Añade las siguientes variables en Render:
   * `PORT`: `5000`
   * `CLOUDINARY_CLOUD_NAME`: (Tu dato de Cloudinary)
   * `CLOUDINARY_API_KEY`: (Tu dato de Cloudinary)
   * `CLOUDINARY_API_SECRET`: (Tu dato de Cloudinary)
   * `MONGODB_URI`: (Tu enlace de conexión de MongoDB Atlas)

## 3. Beneficios de esta configuración
*   **Un solo servicio**: No necesitas pagar o configurar dos servicios distintos para el cliente y el servidor.
*   **Fácil mantenimiento**: El servidor sirve automáticamente la versión más reciente del frontend después de cada build.
*   **Rutas SPA**: El servidor maneja correctamente las rutas de React (como `/admin` o `/galeria`) incluso al refrescar la página.

---
*Guía actualizada por tu asistente Antigravity.*
