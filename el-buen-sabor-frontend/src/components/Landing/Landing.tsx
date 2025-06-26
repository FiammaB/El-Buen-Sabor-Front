import { useEffect, useState } from "react";
import { ArticuloService } from "../../services/ArticuloService";
import type { ArticuloManufacturado } from "../../models/Articulos/ArticuloManufacturado";
import { useAuth } from "../../pages/auth/Context/AuthContext";
import { Search, MapPin, Clock, Star, Truck, Smartphone, CreditCard, ShoppingBag, Menu, X, ChevronRight, Heart, Plus } from 'lucide-react';
import { useCart } from "../Cart/context/cart-context";
import type {Categoria} from "../../models/Categoria/Categoria.ts";

export default function Landing() {

	const { role, logout, username } = useAuth();



	console.log("ROL DETECTADO:", role);
	const [articulosManufacturados, setArticulosManufacturados] = useState<ArticuloManufacturado[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [search, setSearch] = useState<string>("");
	const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
	const [categorias, setCategorias] = useState<Categoria[]>([]);
	const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<number | null>(null);

	// Cart functions
	const { addToCart, isInCart, getItemQuantity, totalItems, removeFromCart } = useCart()

	const articuloService = new ArticuloService();

	// Función para cargar los artículos (ahora puede ser reutilizada)
	const fetchArticulos = async () => {
		try {
			setLoading(true);
			const data = await articuloService.findAllArticulosManufacturadosActivos();//me falta esa función en el servicio
			setArticulosManufacturados(data);
		} catch (err) {
			setError('Error al cargar los artículos manufacturados.');
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	const categoriasVisibles = [
		"Pizza",
		"Empanada",
		"Hamburguesa",
		"Sanguche",
		"Lomito",

	];

	useEffect(() => {
		articuloService.getAllCategorias()
			.then((todas) => {
				const filtradas = todas.filter(cat => categoriasVisibles.includes(cat.denominacion));
				setCategorias(filtradas);
			})
			.catch(() => setCategorias([]));
	}, []);

	useEffect(() => {
		fetchArticulos();
	}, []);

	// DATOS
	const categories = [
		{ name: 'Pizza', image: 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=300', count: '120+ restaurants' },
		{ name: 'Burgers', image: 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=300', count: '85+ restaurants' },
		{ name: 'Sushi', image: 'https://images.pexels.com/photos/357756/pexels-photo-357756.jpeg?auto=compress&cs=tinysrgb&w=300', count: '45+ restaurants' },
		{ name: 'Mexican', image: 'https://images.pexels.com/photos/461198/pexels-photo-461198.jpeg?auto=compress&cs=tinysrgb&w=300', count: '95+ restaurants' },
		{ name: 'Italian', image: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=300', count: '70+ restaurants' },
		{ name: 'Chinese', image: 'https://images.pexels.com/photos/2456435/pexels-photo-2456435.jpeg?auto=compress&cs=tinysrgb&w=300', count: '60+ restaurants' },
	];
	const featuredRestaurants = [
		{
			name: 'La Cocina Perfecta',
			image: 'https://images.pexels.com/photos/1639562/pexels-photo-1639562.jpeg?auto=compress&cs=tinysrgb&w=500',
			rating: 4.8,
			reviews: 250,
			deliveryTime: '25-35 min',
			deliveryFee: '$2.99',
			cuisine: 'Mexican • Authentic',
			promoted: true
		},
		{
			name: 'Burger Palace',
			image: 'https://images.pexels.com/photos/1552241/pexels-photo-1552241.jpeg?auto=compress&cs=tinysrgb&w=500',
			rating: 4.6,
			reviews: 180,
			deliveryTime: '20-30 min',
			deliveryFee: '$1.99',
			cuisine: 'American • Burgers'
		},
		{
			name: 'Sushi Master',
			image: 'https://images.pexels.com/photos/248537/pexels-photo-248537.jpeg?auto=compress&cs=tinysrgb&w=500',
			rating: 4.9,
			reviews: 320,
			deliveryTime: '30-40 min',
			deliveryFee: '$3.99',
			cuisine: 'Japanese • Sushi'
		},
		{
			name: 'Pizza Corner',
			image: 'https://images.pexels.com/photos/708587/pexels-photo-708587.jpeg?auto=compress&cs=tinysrgb&w=500',
			rating: 4.7,
			reviews: 195,
			deliveryTime: '20-25 min',
			deliveryFee: '$2.49',
			cuisine: 'Italian • Pizza'
		}
	];
	const steps = [
		{
			icon: <Search className="w-8 h-8" />,
			title: 'Encuentra tu comida',
			description: 'Explora miles de restaurantes y encuentra exactamente lo que deseas'
		},
		{
			icon: <ShoppingBag className="w-8 h-8" />,
			title: 'Haz tu pedido',
			description: 'Selecciona tus platillos favoritos y personaliza tu orden'
		},
		{
			icon: <Truck className="w-8 h-8" />,
			title: 'Recibe en casa',
			description: 'Rápida entrega directo a tu puerta en el tiempo estimado'
		}
	];
	const articulosFiltrados = articulosManufacturados.filter(a => {
		const coincideBusqueda = a.denominacion?.toLowerCase().includes(search.toLowerCase()) ||
			a.descripcion?.toLowerCase().includes(search.toLowerCase());
		const coincideCategoria = categoriaSeleccionada === null || a.categoria?.id === categoriaSeleccionada;
		return coincideBusqueda && coincideCategoria;
	});

	return (
		<div className="min-h-screen bg-white ebs-landing">

			{/* Take to cart si tiene algo */}
			{totalItems > 0 && (
				<a
					href="/cart"
					className="text-white fixed bottom-[30px] right-[30px] rounded-full font-bold bg-green-500 p-8 z-50 text-white"
				>
					IR AL CARRITO
				</a>
			)}

			{/* Header */}
			<header className="bg-white shadow-sm sticky top-0 z-50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						{/* Logo */}
						<div className="flex items-center">
							<div className="text-2xl font-bold text-orange-500">
								El Buen Sabor
							</div>
						</div>
						<nav className="hidden md:flex items-center space-x-8">
							<div className="relative w-64">
								<input
									type="text"
									value={search}
									onFocus={() => setShowSuggestions(true)}
									onBlur={() => setTimeout(() => setShowSuggestions(false), 150)} // Permite clickear sugerencias antes de cerrar
									onChange={e => setSearch(e.target.value)}
									placeholder="Buscar productos..."
									className="px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-orange-400 transition w-full"
								/>
								{/* Dropdown de sugerencias */}
								{showSuggestions && search && articulosFiltrados.length > 0 && (
									<div className="absolute left-0 top-12 w-full bg-white border rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto">
										{articulosFiltrados.slice(0, 6).map(a => (
											<div
												key={a.id}
												className="px-4 py-2 cursor-pointer hover:bg-orange-100 flex items-center"
												onMouseDown={() => {
													// Redireccionar o mostrar el detalle (adaptá a tu caso)
													window.location.href = `/producto/${a.id}`;
													setShowSuggestions(false);
													setSearch('');
												}}
											>
												<img
													src={a.imagen?.denominacion || "/placeholder.svg"}
													alt={a.denominacion}
													className="w-8 h-8 rounded mr-3 object-cover"
												/>
												<div>
													<div className="font-medium">{a.denominacion}</div>
													<div className="text-xs text-gray-500">${a.precioVenta?.toFixed(2)}</div>
												</div>
											</div>
										))}
										{articulosFiltrados.length > 6 && (
											<div className="px-4 py-2 text-sm text-gray-600 cursor-pointer hover:bg-orange-50"
												onMouseDown={() => {
													// Ir a una página de búsqueda completa (opcional)
													window.location.href = `/explore?search=${encodeURIComponent(search)}`;
													setShowSuggestions(false);
													setSearch('');
												}}>
												Ver todos los resultados...
											</div>
										)}
									</div>
								)}
								{/* Si no hay resultados */}
								{showSuggestions && search && articulosFiltrados.length === 0 && (
									<div className="absolute left-0 top-12 w-full bg-white border rounded-xl shadow-lg z-50 p-4 text-gray-500">
										No se encontraron productos.
									</div>
								)}
							</div>
						</nav>
						{/* Desktop Navigation */}
						<nav className="hidden md:flex items-center space-x-8">
							<a href="#" className="text-gray-700 hover:text-orange-500 transition duration-200">Inicio</a>
							<a href="#" className="text-gray-700 hover:text-orange-500 transition duration-200">Restaurantes</a>
							<a href="#" className="text-gray-700 hover:text-orange-500 transition duration-200">Ofertas</a>
							<a href="#" className="text-gray-700 hover:text-orange-500 transition duration-200">Ayuda</a>
						</nav>
						{/* Botones para usuarios no logueados */}
						{!role && (
							<div className="hidden md:flex items-center space-x-4">
								<a
									href="/login"
									className="text-gray-700 hover:text-orange-500 transition duration-200 font-medium"
								>
									Iniciar Sesión
								</a>
								<a
									href="/register"
									className="bg-orange-500 text-white px-6 py-2 rounded-full hover:bg-orange-600 transition duration-200 font-medium"
								>
									Registrarse
								</a>
							</div>
						)}
						{/*LOGIN Y REGISTRO*/}
						{role === "ADMINISTRADOR" && (
							<div className="flex items-center space-x-4">
								<span className="text-green-600 font-bold">Administrador</span>
								<a
									href="/admin/ingredientes"
									className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition"
								>
									Ingredientes
								</a>
								<a
									href="/admin/articulos"
									className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition"
								>
									Artículos
								</a>
								<a
									href="/admin/dashboard"
									className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition"
								>
									Dashboard
								</a>
								<button
									onClick={logout}
									className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
								>
									Cerrar Sesión
								</button>
							</div>
						)}

						{role === "CAJERO" && (
							<div className="flex items-center space-x-4">
								<span className="text-purple-700 font-bold">Cajero: {username}</span>
								<a
									href="/cajero/dashboard"
									className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
								>
									Caja
								</a>
								<button
									onClick={logout}
									className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
								>
									Cerrar Sesión
								</button>
							</div>
						)}

						{role === "COCINERO" && (
							<div className="flex items-center space-x-4">
								<span className="text-green-700 font-bold">Cocinero: {username}</span>
								<a
									href="/cocinero/pedidos"
									className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
								>
									Cocina
								</a>
								<button
									onClick={logout}
									className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
								>
									Cerrar Sesión
								</button>
							</div>
						)}

						{role === "CLIENTE" && (
							<div className="flex items-center space-x-4">
								<span className="text-orange-700 font-bold">{username}</span>
								<a
									href="/cliente/dashboard"
									className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition"
								>
									Mi Cuenta
								</a>
								<button
									onClick={logout}
									className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
								>
									Cerrar Sesión
								</button>
							</div>
						)}


						{/* Mobile menu button */}
						<button
							className="md:hidden p-2"
							onClick={() => setIsMenuOpen(!isMenuOpen)}
						>
							{isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
						</button>
					</div>

					{/* Mobile Navigation */}
					{isMenuOpen && (
						<div className="md:hidden py-4 border-t">
							<div className="flex flex-col space-y-4">
								<a href="#" className="text-gray-700 hover:text-orange-500 transition duration-200">Inicio</a>
								<a href="#" className="text-gray-700 hover:text-orange-500 transition duration-200">Restaurantes</a>
								<a href="#" className="text-gray-700 hover:text-orange-500 transition duration-200">Ofertas</a>
								<a href="#" className="text-gray-700 hover:text-orange-500 transition duration-200">Ayuda</a>
								<div className="flex flex-col space-y-2 pt-4 border-t">
									<button className="text-gray-700 hover:text-orange-500 transition duration-200 font-medium text-left">
										Iniciar Sesión
									</button>
									<button className="bg-orange-500 text-white px-6 py-2 rounded-full hover:bg-orange-600 transition duration-200 font-medium w-fit">
										Registrarse
									</button>
								</div>
							</div>
						</div>
					)}
				</div>
			</header>

			{/* Hero Section */}
			<section className="relative bg-gradient-to-br from-orange-50 to-orange-100 py-16 lg:py-24">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
						<div className="space-y-8">
							<div className="space-y-4">
								<h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
									La comida que <span className="text-orange-500">amas</span>, entregada rápido
								</h1>
								<p className="text-xl text-gray-600 leading-relaxed">
									Descubre miles de restaurantes locales y disfruta de tus platillos favoritos desde la comodidad de tu hogar.
								</p>
							</div>

							{/* Search Bar */}
							<div className="bg-white p-2 rounded-2xl shadow-lg border">
								<div className="flex items-center space-x-4">
									<div className="flex items-center space-x-2 flex-1 px-4">
										<MapPin className="w-5 h-5 text-gray-400" />
										<input
											type="text"
											placeholder="Ingresa tu dirección"
											className="flex-1 py-3 bg-transparent outline-none text-gray-700 placeholder-gray-400"
										/>
									</div>
									<button className="bg-orange-500 text-white px-8 py-3 rounded-xl hover:bg-orange-600 transition duration-200 font-medium flex items-center space-x-2">
										<Search className="w-5 h-5" />
										<span>Buscar</span>
									</button>
								</div>
							</div>

							<div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
								<div className="flex items-center space-x-2">
									<Clock className="w-4 h-4" />
									<span>Entrega en 30 min</span>
								</div>
								<div className="flex items-center space-x-2">
									<Truck className="w-4 h-4" />
									<span>Envío gratis desde $25</span>
								</div>
								<div className="flex items-center space-x-2">
									<Star className="w-4 h-4 text-yellow-400" />
									<span>5000+ restaurantes</span>
								</div>
							</div>
						</div>

						<div className="relative">
							<div className="relative z-10">
								<img
									src="https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=800"
									alt="Delicious food delivery"
									className="w-full h-96 lg:h-[500px] object-cover rounded-3xl shadow-2xl"
								/>
							</div>
							<div className="absolute -top-4 -right-4 w-72 h-72 bg-orange-200 rounded-full opacity-20 z-0"></div>
							<div className="absolute -bottom-4 -left-4 w-48 h-48 bg-yellow-200 rounded-full opacity-20 z-0"></div>
						</div>
					</div>
				</div>
			</section>

			{/* Ariculos Section */}
			<section className="py-16 bg-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-12">
						<h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Nuestros Productos Especiales</h2>
						<p className="text-xl text-gray-600">Artículos manufacturados con la mejor calidad</p>
					</div>
					<div className="mb-8">
						<div className="flex gap-2 overflow-x-auto pb-2">
							<button
								className={`px-4 py-2 rounded-full border ${categoriaSeleccionada === null ? "bg-orange-500 text-white" : "bg-white text-gray-800 hover:bg-orange-100"}`}
								onClick={() => setCategoriaSeleccionada(null)}
							>
								Todos
							</button>
							{categorias.map(cat => (
								<button
									key={cat.id}
									className={`px-4 py-2 rounded-full border whitespace-nowrap ${categoriaSeleccionada === cat.id ? "bg-orange-500 text-white" : "bg-white text-gray-800 hover:bg-orange-100"}`}
									onClick={() => setCategoriaSeleccionada(cat.id!)}
								>
									{cat.denominacion}
								</button>
							))}
						</div>
					</div>
					<div className="mb-8 max-w-xl mx-auto">
						<input
							type="text"
							value={search}
							onChange={e => setSearch(e.target.value)}
							className="w-full p-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-orange-400 outline-none text-lg"
							placeholder="Buscar productos por nombre o descripción..."
						/>
					</div>

					{loading ? (
						<div className="flex justify-center items-center py-12">
							<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
						</div>
					) : error ? (
						<div className="text-center py-12">
							<p className="text-red-500 text-lg">{error}</p>
							<button
								onClick={fetchArticulos}
								className="mt-4 bg-orange-500 text-white px-6 py-2 rounded-full hover:bg-orange-600 transition duration-200"
							>
								Reintentar
							</button>
						</div>
					) : articulosManufacturados.length === 0 ? (
						<div className="text-center py-12">
							<p className="text-gray-500 text-lg">No hay artículos disponibles en este momento</p>
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
							{articulosFiltrados.map((articulo) => (
								<div
									key={articulo.id}
									className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition duration-300 group cursor-pointer border hover:border-orange-200"
								>
									<div className="relative">
										<img
											src={
												articulo.imagen
													? articulo.imagen.denominacion
													: "/placeholder.svg?height=200&width=300"
											}
											alt={articulo.denominacion}
											className="w-full h-48 object-cover group-hover:scale-105 transition duration-300"
										/>
										<button className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition duration-200">
											<Heart className="w-4 h-4 text-gray-400" />
										</button>
										{articulo.tiempoEstimadoMinutos && (
											<div className="absolute bottom-3 left-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded-full text-sm">
												<Clock className="w-3 h-3 inline mr-1" />
												{articulo.tiempoEstimadoMinutos} min
											</div>
										)}
									</div>

									<div className="p-6">
										<div className="flex justify-between items-start mb-2">
											<h3 className="font-bold text-gray-900 text-lg line-clamp-2">{articulo.denominacion}</h3>
											<div className="flex items-center space-x-1 ml-2">
												<span className="text-lg font-bold text-orange-500">${articulo.precioVenta}</span>
											</div>
										</div>

										<p className="text-gray-600 text-sm mb-4 line-clamp-2">
											{articulo.descripcion || "Delicioso producto artesanal"}
										</p>

										<div className="flex justify-between items-center">
											<div className="text-sm text-gray-500">
												{articulo.categoria?.denominacion || "Producto especial"}
											</div>
											<button
												onClick={() => addToCart(articulo)}
												className={`p-2 rounded-full transition duration-200 ${isInCart(articulo.id || 1)
													? "bg-green-500 text-white"
													: "bg-orange-500 text-white hover:bg-orange-600"
													}`}
											>
												{isInCart(articulo.id || 1) ? (
													<div className="flex gap-2">
														<span className="text-xs font-bold">{getItemQuantity(articulo.id || 0)}</span>
														<Plus className="w-4 h-4" />
													</div>
												) : (
													<Plus className="w-4 h-4" />
												)}
											</button>
											{isInCart(articulo.id || 1) ? (
												<div className="flex gap-2">
													<button
														onClick={(e) => {
															e.stopPropagation()
															removeFromCart(articulo.id || 0)
														}}
														className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition duration-200"
														title="Eliminar del carrito"
													>
														<X className="w-3 h-3" />
													</button>
												</div>
											) : ''}
										</div>
									</div>
								</div>
							))}
						</div>
					)}

					{articulosManufacturados.length > 0 && (
						<div className="text-center mt-12">
							<button className="bg-orange-500 text-white px-8 py-3 rounded-full hover:bg-orange-600 transition duration-200 font-medium">
								Ver todos los productos
							</button>
						</div>
					)}
				</div>
			</section>

			{/* Categories Section */}
			<section className="py-16 bg-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-12">
						<h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
							¿Qué se te antoja hoy?
						</h2>
						<p className="text-xl text-gray-600">
							Explora nuestras categorías más populares
						</p>
					</div>

					<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
						{categories.map((category, index) => (
							<div
								key={index}
								className="group cursor-pointer"
							>
								<div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition duration-300 border hover:border-orange-200">
									<div className="relative overflow-hidden rounded-xl mb-4">
										<img
											src={category.image}
											alt={category.name}
											className="w-full h-20 object-cover group-hover:scale-110 transition duration-300"
										/>
									</div>
									<h3 className="font-semibold text-gray-900 text-center mb-2">
										{category.name}
									</h3>
									<p className="text-sm text-gray-500 text-center">
										{category.count}
									</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Featured Restaurants */}
			<section className="py-16 bg-gray-50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center mb-12">
						<div>
							<h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
								Restaurantes destacados
							</h2>
							<p className="text-xl text-gray-600">
								Los favoritos de tu ciudad
							</p>
						</div>
						<button className="hidden md:flex items-center space-x-2 text-orange-500 hover:text-orange-600 font-medium">
							<span>Ver todos</span>
							<ChevronRight className="w-5 h-5" />
						</button>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
						{featuredRestaurants.map((restaurant, index) => (
							<div
								key={index}
								className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition duration-300 group cursor-pointer"
							>
								<div className="relative">
									<img
										src={restaurant.image}
										alt={restaurant.name}
										className="w-full h-48 object-cover group-hover:scale-105 transition duration-300"
									/>
									{restaurant.promoted && (
										<div className="absolute top-3 left-3 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
											Promocionado
										</div>
									)}
									<button className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition duration-200">
										<Heart className="w-4 h-4 text-gray-400" />
									</button>
								</div>

								<div className="p-6">
									<div className="flex justify-between items-start mb-2">
										<h3 className="font-bold text-gray-900 text-lg">
											{restaurant.name}
										</h3>
										<div className="flex items-center space-x-1">
											<Star className="w-4 h-4 text-yellow-400 fill-current" />
											<span className="text-sm font-medium text-gray-700">
												{restaurant.rating}
											</span>
										</div>
									</div>

									<p className="text-gray-600 mb-4">{restaurant.cuisine}</p>

									<div className="flex justify-between items-center text-sm text-gray-500">
										<div className="flex items-center space-x-1">
											<Clock className="w-4 h-4" />
											<span>{restaurant.deliveryTime}</span>
										</div>
										<div className="flex items-center space-x-1">
											<Truck className="w-4 h-4" />
											<span>{restaurant.deliveryFee}</span>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* How it Works */}
			<section className="py-16 bg-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
							¿Cómo funciona?
						</h2>
						<p className="text-xl text-gray-600">
							Ordenar es súper fácil, solo sigue estos pasos
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-12">
						{steps.map((step, index) => (
							<div key={index} className="text-center group">
								<div className="relative mb-8">
									<div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-500 transition duration-300">
										<div className="text-orange-500 group-hover:text-white transition duration-300">
											{step.icon}
										</div>
									</div>
									<div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
										{index + 1}
									</div>
								</div>
								<h3 className="text-xl font-bold text-gray-900 mb-4">
									{step.title}
								</h3>
								<p className="text-gray-600 leading-relaxed">
									{step.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-16 bg-gradient-to-r from-orange-500 to-red-500">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<div className="max-w-3xl mx-auto">
						<h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
							¡Descarga nuestra app y obtén 20% de descuento!
						</h2>
						<p className="text-xl text-orange-100 mb-8">
							Disfruta de ofertas exclusivas, seguimiento en tiempo real y mucho más
						</p>
						<div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
							<button className="bg-white text-gray-900 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition duration-200 flex items-center space-x-3">
								<Smartphone className="w-6 h-6" />
								<span>Descargar para iOS</span>
							</button>
							<button className="bg-white text-gray-900 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition duration-200 flex items-center space-x-3">
								<Smartphone className="w-6 h-6" />
								<span>Descargar para Android</span>
							</button>
						</div>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="bg-gray-900 text-white py-16">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
						<div>
							<div className="text-2xl font-bold text-orange-500 mb-6">
								El Buen Sabor
							</div>
							<p className="text-gray-400 mb-6 leading-relaxed">
								La mejor comida de tu ciudad, entregada directo a tu puerta. Rápido, seguro y delicioso.
							</p>
							<div className="flex space-x-4">
								<div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-500 transition duration-200 cursor-pointer">
									<span className="text-sm font-bold">f</span>
								</div>
								<div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-500 transition duration-200 cursor-pointer">
									<span className="text-sm font-bold">t</span>
								</div>
								<div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-500 transition duration-200 cursor-pointer">
									<span className="text-sm font-bold">ig</span>
								</div>
							</div>
						</div>

						<div>
							<h3 className="font-semibold text-lg mb-6">Empresa</h3>
							<ul className="space-y-4">
								<li><a href="#" className="text-gray-400 hover:text-white transition duration-200">Acerca de nosotros</a></li>
								<li><a href="#" className="text-gray-400 hover:text-white transition duration-200">Carreras</a></li>
								<li><a href="#" className="text-gray-400 hover:text-white transition duration-200">Prensa</a></li>
								<li><a href="#" className="text-gray-400 hover:text-white transition duration-200">Blog</a></li>
							</ul>
						</div>

						<div>
							<h3 className="font-semibold text-lg mb-6">Para restaurantes</h3>
							<ul className="space-y-4">
								<li><a href="#" className="text-gray-400 hover:text-white transition duration-200">Únete como socio</a></li>
								<li><a href="#" className="text-gray-400 hover:text-white transition duration-200">Centro de ayuda</a></li>
								<li><a href="#" className="text-gray-400 hover:text-white transition duration-200">Promociones</a></li>
								<li><a href="#" className="text-gray-400 hover:text-white transition duration-200">Recursos</a></li>
							</ul>
						</div>

						<div>
							<h3 className="font-semibold text-lg mb-6">Soporte</h3>
							<ul className="space-y-4">
								<li><a href="#" className="text-gray-400 hover:text-white transition duration-200">Centro de ayuda</a></li>
								<li><a href="#" className="text-gray-400 hover:text-white transition duration-200">Contáctanos</a></li>
								<li><a href="#" className="text-gray-400 hover:text-white transition duration-200">Política de privacidad</a></li>
								<li><a href="#" className="text-gray-400 hover:text-white transition duration-200">Términos de servicio</a></li>
							</ul>
						</div>
					</div>

					<div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
						<p className="text-gray-400 text-sm">
							© 2024 El Buen Sabor. Todos los derechos reservados.
						</p>
						<div className="flex items-center space-x-6 mt-4 md:mt-0">
							<div className="flex items-center space-x-2 text-gray-400">
								<CreditCard className="w-4 h-4" />
								<span className="text-sm">Pagos seguros</span>
							</div>
							<div className="flex items-center space-x-2 text-gray-400">
								<Truck className="w-4 h-4" />
								<span className="text-sm">Entrega garantizada</span>
							</div>
						</div>
					</div>
				</div>
			</footer>
		</div>
	)
}