import React from 'react';
import LogoutButton from './LogoutButton';

const ClienteDashboard = () => {
  console.log("Estoy en el dashboard del CLIENTE");

  return (
    <div>
      <h2>Bienvenido cliente 👤</h2>
      <LogoutButton />
    </div>
  );
};

export default ClienteDashboard;
