// src/services/api.ts
import axios from 'axios';
import { type Auth0ContextInterface } from '@auth0/auth0-react'; //'Auth0ContextInterface' is a type and must be imported using a type-only import when 'verbatimModuleSyntax' is enabled.ts(1484) Importa el tipo de contexto de Auth0

// Define la URL base de tu backend de Spring Boot
// Es una buena práctica que esto también sea una variable de entorno.
// Puedes añadir VITE_API_BASE_URL="http://localhost:8081/api/v1" a tu .env.local del frontend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api/v1'; // Ajusta el puerto y el prefijo de tu API

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 5000, // Opcional: tiempo de espera para las solicitudes
    headers: {
        'Content-Type': 'application/json',
    },
});

// Función para configurar el interceptor de Axios
// Se llamará desde App.tsx una vez que el Auth0Provider esté disponible
export const setupAxiosInterceptor = (getAccessTokenSilently: Auth0ContextInterface['getAccessTokenSilently']) => {
    api.interceptors.request.use(
        async (config) => {
            try {
                // Solo si tenemos la función para obtener el token
                if (getAccessTokenSilently) {
                    const accessToken = await getAccessTokenSilently({
                        // Opcional: puedes especificar la audiencia de tu API aquí
                        // Esto asegura que el token de acceso sea para tu API protegida.
                        authorizationParams: {
                            audience: import.meta.env.VITE_AUTH0_AUDIENCE, // Asegúrate de que esta variable exista en .env.local
                        },
                    });
                    // Añade el token al encabezado de autorización
                    config.headers.Authorization = `Bearer ${accessToken}`;
                }
            } catch (error) {
                console.error("Error al obtener el token de acceso:", error);
                // Puedes manejar el error aquí (ej. redirigir a login, mostrar un mensaje)
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );
};

export default api;