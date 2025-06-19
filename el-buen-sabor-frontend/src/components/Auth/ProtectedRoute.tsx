// src/components/ProtectedRoute.tsx
import React from 'react';
import { withAuthenticationRequired } from '@auth0/auth0-react';
import type { RouteProps } from 'react-router-dom'; // Mantén la importación de RouteProps

// Define tus propias props para ProtectedRoute
// Usamos una intersección de tipos (&) con las RouteProps y nuestras props adicionales.
type ProtectedRouteProps = RouteProps & {
    component: React.ComponentType<any>; // El componente que se va a renderizar si está autenticado
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ component: Component, ...rest }) => {
    // Renombramos 'component' a 'Component' para poder usarlo directamente como JSX
    // 'rest' contendrá el resto de las props que puedan venir de RouteProps,
    // aunque para el uso actual con element={<ProtectedRoute component={...} />}
    // no pasarán props de Route directamente al componente anidado.

    const AuthGuardedComponent = withAuthenticationRequired(Component, {
        onRedirecting: () => <div>Cargando...</div>, // Puedes poner un spinner o mensaje
    });

    // Renderizamos el componente AuthGuardedComponent.
    // Las props de React Router (como history, location, match) no se pasan directamente
    // a los componentes que se renderizan a través de la prop 'element' en React Router v6.
    // Si el componente protegido ArticuloManufacturadoList necesitara estas props,
    // deberías pasarlas explícitamente si las obtienes del contexto de React Router,
    // pero con withAuthenticationRequired, normalmente el componente envuelto ya no espera
    // props de ruta directamente.
    return <AuthGuardedComponent {...rest} />;
};

export default ProtectedRoute;