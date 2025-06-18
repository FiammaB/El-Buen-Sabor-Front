import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:8080/api/auth/login', form);
      
      // Guardar usuario y token
      localStorage.setItem('user', JSON.stringify(res.data));
      // Si también tenés token:
      // localStorage.setItem('token', res.data.token);

      alert("Login exitoso");

      // Redireccionar según el rol
      const rol = res.data.rol;
      if (rol === "ADMINISTRADOR") {
        navigate('/admin');
      } else if (rol === "CLIENTE") {
        navigate('/cliente');
      } else {
        navigate('/');
      }

    } catch {
      setError("Credenciales inválidas");
    }
  };

  return (
    <div>
      <h2>Iniciar Sesión</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input name="username" type="email" onChange={handleChange} placeholder="Email" required />
        <input name="password" type="password" onChange={handleChange} placeholder="Contraseña" required />
        <button type="submit">Ingresar</button>
      </form>
    </div>
  );
};

export default Login;
