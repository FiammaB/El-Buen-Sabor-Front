export default function Header() {
  return (
    <header className="w-full h-[70px] bg-white">
		<div className="max-w-7xl mx-auto border-b border-gray-200 flex items-center justify-between py-4 px-6">
			 <div className="flex items-center gap-3">
				{/* Logo o Título */}
				<span className="text-2xl font-bold text-blue-600">AdminPanel</span>
			</div>

			<nav className="flex items-center gap-4 text-sm text-gray-600">
				{/* Links rápidos, opcional */}
				<a href="/" className="hover:text-blue-600 transition">Inicio</a>
				<a href="/landing" className="hover:text-blue-600 transition">Ver Landing</a>
			</nav>

			<div className="flex items-center gap-4">
				{/* Acciones de usuario */}
				<span className="text-sm text-gray-700">Hola, Tomás</span>
				<button className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700 transition">
				Cerrar sesión
				</button>
			</div>
		</div>
    </header>
  );
}
