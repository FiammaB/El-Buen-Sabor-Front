// src/components/AuthButtons.tsx
import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const AuthButtons: React.FC = () => {
    const { loginWithRedirect, logout, isAuthenticated, user, isLoading } = useAuth0();

    if (isLoading) {
        return <div>Cargando autenticación...</div>;
    }

    return (
        <div>
            {isAuthenticated ? (
                <>
                    {user && (
                        <div>
                            <img src={user.picture} alt={user.name} style={{ borderRadius: '50%', width: '50px', height: '50px' }} />
                            <h2>{user.name}</h2>
                            <p>{user.email}</p>
                        </div>
                    )}
                    <button onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>
                        Cerrar Sesión
                    </button>
                </>
            ) : (
                <button onClick={() => loginWithRedirect()}>
                    Iniciar Sesión
                </button>
            )}
        </div>
    );
};

export default AuthButtons;