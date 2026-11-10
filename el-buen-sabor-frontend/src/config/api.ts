// Origen del backend (sin /api al final). Configurable por instancia/cliente
// vía la variable de entorno VITE_API_BASE_URL (ver .env.example).
export const API_ORIGIN =
    (import.meta.env.VITE_API_BASE_URL as string | undefined) || "https://151-145-62-96.sslip.io";