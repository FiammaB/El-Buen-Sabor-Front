# El Buen Sabor - Frontend 🍔

Este es el proyecto de frontend para la aplicación de delivery de comida "El Buen Sabor". Está desarrollado como una Single Page Application (SPA) utilizando React y TypeScript, y se comunica con un backend hecho en Java con Spring Boot para toda la gestión de datos.

![Captura de pantalla de la Landing Page](https://i.imgur.com/8YvL6F3.png) 
*(TIP: Reemplazá esta imagen con una captura de tu propia landing page)*

---
## ✨ Características Principales

* **Autenticación y Roles de Usuario:** Sistema de login y registro con diferentes roles (Cliente, Administrador, Cajero, etc.).
* **Catálogo de Productos y Promociones:** Visualización de artículos y promociones traídos desde la API del backend.
* **Carrito de Compras Persistente:** Un carrito funcional que guarda el estado de la compra del usuario utilizando React Context.
* **Proceso de Checkout Multi-paso:** Una interfaz guiada para que el cliente complete su información, método de entrega y pago.
* **Integración con Mercado Pago:** Redirección a la pasarela de pagos de Mercado Pago para procesar compras con tarjeta.
* **Paneles de Administración:** Vistas especiales para que los administradores gestionen productos, promociones y pedidos.
* **Diseño Responsivo:** Interfaz adaptable a diferentes tamaños de pantalla gracias a Tailwind CSS.

---
## 🛠️ Tecnologías Utilizadas

* **Framework:** [React](https://reactjs.org/)
* **Lenguaje:** [TypeScript](https://www.typescriptlang.org/)
* **Build Tool:** [Vite](https://vitejs.dev/)
* **Routing:** [React Router](https://reactrouter.com/)
* **Estilos:** [Tailwind CSS](https://tailwindcss.com/)
* **Iconos:** [Lucide React](https://lucide.dev/)
* **Gestión de Estado:** React Context API

---
## 🚀 Instalación y Puesta en Marcha

Para ejecutar este proyecto en tu máquina local, necesitás tener el [backend de El Buen Sabor](https://github.com/FiammaB/El-Buen-Sabor) corriendo primero.

### Requisitos Previos

* [Node.js](https://nodejs.org/) (versión 18.x o superior)
* `npm` o `yarn`

### Pasos

1.  **Clonar el repositorio:**
    ```bash
    git clone [https://github.com/FiammaB/El-Buen-Sabor-Front.git](https://github.com/FiammaB/El-Buen-Sabor-Front.git)
    ```

2.  **Navegar a la carpeta del proyecto:**
    ```bash
    cd El-Buen-Sabor-Front
    ```

3.  **Instalar las dependencias:**
    ```bash
    npm install
    ```

4.  **Configurar las Variables de Entorno:**
    * En la raíz del proyecto, creá un archivo llamado `.env`.
    * Añadí la siguiente línea para que el frontend sepa dónde está tu backend. (Asegurate de que el puerto sea el correcto).
    ```env
    VITE_API_BASE_URL=http://localhost:8080/api
    ```
    * **Importante:** Después, en tus archivos de servicio (como `PromocionService.ts`), asegurate de usar esta variable para construir las URLs de las peticiones a la API. Ejemplo:
        ```typescript
        const API_URL = import.meta.env.VITE_API_BASE_URL;
        
        export const getPromociones = async () => {
            const response = await fetch(`${API_URL}/promociones`);
            // ...
        };
        ```

5.  **Ejecutar el servidor de desarrollo:**
    ```bash
    npm run dev
    ```

6.  **Abrir en el navegador:**
    * ¡Listo! Abrí tu navegador y andá a `http://localhost:5173` (o la URL que te indique la terminal).

---
## 📁 Estructura del Proyecto

El código fuente está organizado de la siguiente manera para mantener un proyecto limpio y escalable:

```
/src
├── /components/    # Componentes reutilizables (Botones, Cards, Forms, etc.)
│   ├── /Auth/
│   └── /Cart/
├── /context/       # Proveedores de Contexto (AuthContext, CartContext)
├── /models/        # Definiciones de Tipos y Interfaces (TypeScript)
├── /pages/         # Componentes de página principal (Landing, Checkout, Admin, etc.)
├── /services/      # Lógica para las llamadas a la API (PromocionService, PedidoService, etc.)
├── App.tsx         # Componente raíz y configuración de rutas (React Router)
└── main.tsx        # Punto de entrada de la aplicación
```

---
## ✒️ Autores

* **Fiamma Brizuela, Laura Pelayes, Gastón Sisterna, Faustino Viñolo**