import React from 'react';
import LogoutButton from './LogoutButton';

const AdminDashboard = () => {
  console.log("Estoy en el dashboard del ADMIN");

  return (
    <div>
      <h2>Bienvenido administrador 🛠️</h2>
      <LogoutButton />
    </div>
  );
};

export default AdminDashboard;
