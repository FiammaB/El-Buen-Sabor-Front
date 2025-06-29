// src/pages/Landing/Landing.tsx
import { useEffect, useState } from "react";
import { ArticuloService } from "../../services/ArticuloService";
// IMPORTAMOS LAS CLASES DE MODELO, YA QUE EL SERVICIO LAS RETORNA
import { ArticuloManufacturado } from "../../models/Articulos/ArticuloManufacturado";
import { ArticuloInsumo } from "../../models/Articulos/ArticuloInsumo";
import { Articulo } from "../../models/Articulos/Articulo"; // La clase base Articulo
import { useAuth } from "../Auth/Context/AuthContext";
import { Link } from "react-router-dom";
import { Search, MapPin, Clock, Star, Truck, CreditCard, ShoppingBag, Menu, X, Heart, Plus } from 'lucide-react';
import { useCart } from "../Cart/context/cart-context";
import type { Categoria } from "../../models/Categoria/Categoria"; // Categoria es una clase/modelo

import { useNavigate } from "react-router-dom";
import { getPromociones } from "../../services/PromocionService.ts";
import type { IPromocionDTO } from "../../models/DTO/IPromocionDTO";
import PromocionList from "../promocion/PromocionList.tsx";



// El tipo que contendrá todos los artículos para display ahora es la CLASE BASE Articulo
// Ya que ArticuloManufacturado y ArticuloInsumo extienden de ella
type AnyArticuloDisplay = Articulo; // <-- ¡Simplificado y preciso!

export default function Landing() {

	const { id, role, logout, username } = useAuth();
	const navigate = useNavigate();

	console.log("ROL DETECTADO:", role);
	console.log("ID DETECTADO:", id)
	// El estado ahora es de tipo Articulo[], ya que el servicio devuelve instancias de Articulo o sus subclases
	const [articulos, setArticulos] = useState<AnyArticuloDisplay[]>([]); // CAMBIO
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	const [headerSearch, setHeaderSearch] = useState<string>("");
	const [showHeaderSuggestions, setShowHeaderSuggestions] = useState<boolean>(false);

	const [mainSearch, setMainSearch] = useState<string>("");

	const [categorias, setCategorias] = useState<Categoria[]>([]);
	const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<number | null>(null);

	const { addToCart, isInCart, getItemQuantity, totalItems, removeFromCart } = useCart()

	const articuloService = new ArticuloService();

	// Función para cargar AMBOS tipos de artículos
	const fetchArticulos = async () => {
		try {
			setLoading(true);
			// Estos métodos ahora retornan CLASES de modelo
			const manufacturedData: ArticuloManufacturado[] = await articuloService.findAllArticulosManufacturadosActivos();
			const insumoData: ArticuloInsumo[] = await articuloService.findAllArticulosInsumoActivos(); // <--- ¡Añade los paréntesis aquí!//este metodo no existe
			//Type '() => Promise<ArticuloInsumo[]>' is not assignable to type 'ArticuloInsumo[]'.
			// Combinar ambos arrays. Ambos son compatibles con Articulo (la clase base)
			const allArticulos: Articulo[] = [...manufacturedData, ...insumoData];
			setArticulos(allArticulos);
		} catch (err) {
			setError('Error al cargar los artículos.');
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
		"Bebida"
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

	// Lógica de filtrado para los artículos mostrados en la sección principal
	const articulosFiltradosPrincipal = articulos.filter(a => {
		const coincideBusqueda = mainSearch
			? (
				a.denominacion?.toLowerCase().includes(mainSearch.toLowerCase()) ||
				// Usa 'instanceof' para comprobar si es un ArticuloManufacturado y así acceder a 'descripcion'
				(a instanceof ArticuloManufacturado && a.descripcion && a.descripcion.toLowerCase().includes(mainSearch.toLowerCase()))
			)
			: true;

		const coincideCategoria = categoriaSeleccionada === null || a.categoria?.id === categoriaSeleccionada;
		return coincideBusqueda && coincideCategoria;
	});

	//-----------------------------------PROMOCIONES--------------------------------------------
	const [promociones, setPromociones] = useState<IPromocionDTO[]>([]);

	useEffect(() => {
		const fetchPromos = async () => {
			try {
				const data = await getPromociones();
				setPromociones(data);
			} catch (error) {
				console.error("Error al cargar promociones:", error);
			}
		};
		fetchPromos();
	}, []);
	// Lógica de filtrado para las sugerencias de la barra del header
	const articulosFiltradosHeader = articulos.filter(a => {
		return headerSearch
			? (
				a.denominacion?.toLowerCase().includes(headerSearch.toLowerCase()) ||
				// Usa 'instanceof' para comprobar si es un ArticuloManufacturado y así acceder a 'descripcion'
				(a instanceof ArticuloManufacturado && a.descripcion && a.descripcion.toLowerCase().includes(headerSearch.toLowerCase()))
			)
			: false;
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
						{/* Desktop Search Bar (Header) */}
						<nav className="hidden md:flex items-center space-x-8">
							<div className="relative w-64">
								<input
									type="text"
									value={headerSearch}
									onFocus={() => setShowHeaderSuggestions(true)}
									onBlur={() => setTimeout(() => setShowHeaderSuggestions(false), 150)}
									onChange={e => setHeaderSearch(e.target.value)}
									placeholder="Buscar productos..."
									className="px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-orange-400 transition w-full"
								/>
								{/* Dropdown de sugerencias */}
								{showHeaderSuggestions && headerSearch && articulosFiltradosHeader.length > 0 && (
									<div className="absolute left-0 top-12 w-full bg-white border rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto">
										{articulosFiltradosHeader.slice(0, 6).map(a => (
											<div
												key={a.id}
												className="px-4 py-2 cursor-pointer hover:bg-orange-100 flex items-center"
												onMouseDown={() => {
													navigate(`/producto/${a.id}`);
													setShowHeaderSuggestions(false);
													setHeaderSearch('');
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
										{articulosFiltradosHeader.length > 6 && (
											<div className="px-4 py-2 text-sm text-gray-600 cursor-pointer hover:bg-orange-50"
												onMouseDown={() => {
													navigate(`/explore?search=${encodeURIComponent(headerSearch)}`);
													setShowHeaderSuggestions(false);
													setHeaderSearch('');
												}}>
												Ver todos los resultados...
											</div>
										)}
									</div>
								)}
								{/* Si no hay resultados */}
								{showHeaderSuggestions && headerSearch && articulosFiltradosHeader.length === 0 && (
									<div className="absolute left-0 top-12 w-full bg-white border rounded-xl shadow-lg z-50 p-4 text-gray-500">
										No se encontraron productos.
									</div>
								)}
							</div>
						</nav>
						{/* Desktop Navigation */}
						<nav className="hidden md:flex items-center space-x-8">
							<a href="#" className="text-gray-700 hover:text-orange-500 transition duration-200">Inicio</a>

							<Link to="/promociones" className="text-gray-700 hover:text-orange-500 transition duration-200">
								Promociones
							</Link>

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
								<span className="text-indigo-700 font-bold">Admin: {username}</span>
								<a
									href="/admin/dashboard"
									className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
								>
									Panel Admin
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
									href="/cajero/caja"
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
								<button
									onClick={() => navigate("/perfil")}
									className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition"
								>
									Mi Cuenta
								</button>
								<button
									onClick={logout}
									className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
								>
									Cerrar Sesión
								</button>
							</div>
						)}

						{role === "DELIVERY" && (
							<div className="flex items-center space-x-4">
								<span className="text-blue-700 font-bold">Delivery: {username}</span>
								<a
									href="/delivery/pedidos"
									className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
								>
									Pedidos
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

								<a href="#" className="text-gray-700 hover:text-orange-500 transition duration-200">Promociones</a>

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
			<section className="relative bg-gradient-to-br from-orange-50 to-orange-100 py-16 lg:py-24
                            items-center justify-center">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 text-center">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

						<div className="lg:col-span-2 space-y-8">
							<div className="space-y-4">
								<h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
									La comida que <span className="text-orange-500">amas</span>, entregada rápido
								</h1>
								<p className="text-xl text-gray-600 leading-relaxed">
									Disfruta de tus platillos favoritos desde la comodidad de tu hogar.
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Articulos Section */}
			<section className="py-16 bg-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-12">
						<h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Nuestros Productos Especiales</h2>
						<p className="text-xl text-gray-600">Artículos manufacturados y de insumo con la mejor calidad</p>
					</div>

					<section className="promos-section">
						<h2 className="section-title">Promociones destacadas</h2>
						<div className="promos-grid">
							{promociones.map((promo) => (
								<div className="promo-card" key={promo.id}>
									<h3>{promo.denominacion}</h3>
									<p><strong>Precio promocional:</strong> ${promo.precioPromocional}</p>
									<p><strong>Vigencia:</strong> {promo.fechaDesde} al {promo.fechaHasta}</p>
									<ul>
										{promo.articulos?.map((a) => (
											<li key={a.id}>{a.denominacion}</li>
										))}
									</ul>

								</div>
							))}
						</div>
					</section>


					<div className="mb-8 items-center justify-center">
						<div className="flex gap-2 overflow-x-auto pb-2  items-center justify-center">
							<button
								className={`px-4 py-2 rounded-full border  items-center justify-center${categoriaSeleccionada === null ? "bg-orange-500 text-white" : "bg-white text-gray-800 hover:bg-orange-100"}`}
								onClick={() => {
									setCategoriaSeleccionada(null);
									setMainSearch("");
								}}
							>
								Todos
							</button>
							{categorias.map(cat => (
								<button
									key={cat.id}
									className={`px-4 py-2 rounded-full border whitespace-nowrap ${categoriaSeleccionada === cat.id ? "bg-orange-500 text-white" : "bg-white text-gray-800 hover:bg-orange-100"}`}
									onClick={() => {
										setCategoriaSeleccionada(cat.id!);
										setMainSearch("");
									}}
								>
									{cat.denominacion}
								</button>
							))}
						</div>
					</div>
					<div className="mb-8 max-w-xl mx-auto">
						<input
							type="text"
							value={mainSearch}
							onChange={e => setMainSearch(e.target.value)}
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
					) : articulos.length === 0 ? (
						<div className="text-center py-12">
							<p className="text-gray-500 text-lg">No hay artículos disponibles en este momento</p>
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
							{articulosFiltradosPrincipal.map((articulo) => (
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
										{/* Condición para mostrar tiempoEstimadoMinutos solo si es ArticuloManufacturado */}
										{articulo instanceof ArticuloManufacturado && articulo.tiempoEstimadoMinutos !== undefined && (
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
											{/* Si es ArticuloManufacturado, usa su descripción; si no, un mensaje genérico */}
											{articulo instanceof ArticuloManufacturado && articulo.descripcion
												? articulo.descripcion
												: "Delicioso producto."}
										</p>

										<div className="flex justify-between items-center">
											<div className="text-sm text-gray-500">
												{articulo.categoria?.denominacion || "Producto"}
											</div>
											<button
												onClick={() => addToCart(articulo)}/*Argument of type 'Articulo' is not assignable to parameter of type 'ArticuloManufacturado'.
  Type 'Articulo' is missing the following properties from type 'ArticuloManufacturado': descripcion, tiempoEstimadoMinutos, preparacion, detallests(2345)*/
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
										{/* Asume que /producto/:id puede manejar ambos tipos de artículos */}
										<a className="text-center bg-orange-400 text-white py-2 block mx-auto mt-4" href={`/producto/${articulo.id}`}>Ver detalle</a>
									</div>
								</div>
							))}
						</div>
					)}

					{articulos.length > 0 && (
						<div className="text-center mt-12">
							<button className="bg-orange-500 text-white px-8 py-3 rounded-full hover:bg-orange-600 transition duration-200 font-medium">
								Ver todos los productos
							</button>
						</div>
					)}
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