// src/pages/Landing/Landing.tsx

import { useEffect, useState } from "react";
import { ArticuloService } from "../../services/ArticuloService";
import { ArticuloManufacturado } from "../../models/Articulos/ArticuloManufacturado";
import { ArticuloInsumo } from "../../models/Articulos/ArticuloInsumo";
import { Articulo } from "../../models/Articulos/Articulo";
import { useAuth } from "../Auth/Context/AuthContext";
import { Link } from "react-router-dom";
import { Search, Clock, Truck, ShoppingBag, X, Plus, Ban, Minus } from 'lucide-react'; // Import Ban and Minus icons
import { useCart } from "../Cart/context/cart-context"; // Asegúrate de esta ruta
import type { Categoria } from "../../models/Categoria/Categoria";


import { getPromociones } from "../../services/PromocionService.ts";
import type { IPromocionDTO } from "../../models/DTO/IPromocionDTO";


type AnyArticuloDisplay = Articulo;

export default function Landing() {

	const { id, role, } = useAuth();


	console.log("ROL DETECTADO:", role);
	console.log("ID DETECTADO:", id)

	const [articulos, setArticulos] = useState<AnyArticuloDisplay[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	const [mainSearch, setMainSearch] = useState<string>("");

	const [categorias, setCategorias] = useState<Categoria[]>([]);
	const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<number | null>(null);

	// Importamos las funciones del carrito
	const { addToCart, getItemQuantity, totalItems, removeFromCart, updateQuantity } = useCart() // Asegúrate de importar updateQuantity

	const articuloService = new ArticuloService();

	const fetchArticulos = async () => {
		try {
			setLoading(true);
			// Filtrar por artículos activos tanto manufacturados como de insumo
			const manufacturedData: ArticuloManufacturado[] = await articuloService.findAllArticulosManufacturadosActivos();
			const insumoData: ArticuloInsumo[] = await articuloService.findAllArticulosInsumoActivos();
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
		"Pizza", "Empanada", "Hamburguesa", "Sanguche", "Lomito", "Bebida", "Postre", "Pasta", "Ensalada", "Picada", "Sushi", "Taco", "Burrito", "Wrap", "Tortilla", "Galleta", "Helado", "Tarta", "Sopa", "Pescado", "Mariscos", "Asado", "Pollo", "Vegetariano", "Vegano", "Desayuno", "Brunch", "Comida Rápida", "Comida Saludable"
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
		{ icon: <Search className="w-8 h-8" />, title: 'Encuentra tu comida', description: 'Explora miles de restaurantes y encuentra exactamente lo que deseas' },
		{ icon: <ShoppingBag className="w-8 h-8" />, title: 'Haz tu pedido', description: 'Selecciona tus platillos favoritos y personaliza tu orden' },
		{ icon: <Truck className="w-8 h-8" />, title: 'Recibe en casa', description: 'Rápida entrega directo a tu puerta en el tiempo estimado' },


	];

	const articulosFiltradosPrincipal = articulos.filter(a => {
		const coincideBusqueda = mainSearch
			? (
				a.denominacion?.toLowerCase().includes(mainSearch.toLowerCase()) ||
				(a instanceof ArticuloManufacturado && a.descripcion && a.descripcion.toLowerCase().includes(mainSearch.toLowerCase()))
			)
			: true;
		const coincideCategoria = categoriaSeleccionada === null || a.categoria?.id === categoriaSeleccionada;
		return coincideBusqueda && coincideCategoria;
	});

	const [promociones, setPromociones] = useState<IPromocionDTO[]>([]);

	useEffect(() => {
		const fetchPromos = async () => {
			try {
				// Filtrar por promociones activas (no de baja) desde el backend si tu servicio lo permite
				const data = await getPromociones();
				// Asegúrate de que las promos con baja=true no se filtren aquí si quieres mostrarlas desactivadas
				setPromociones(data);
			} catch (error) {
				console.error("Error al cargar promociones:", error);
			}
		};
		fetchPromos();
	}, []);



	return (
		<div className="min-h-screen bg-white ebs-landing">





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

					{/* Promociones destacadas - SECCIÓN MODIFICADA PARA AÑADIR A CARRITO */}
					<section className="promos-section mb-12">
						<h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-8 text-center">Promociones Destacadas</h2>
						{promociones.length === 0 ? (
							<div className="text-center py-6">
								<p className="text-gray-500 text-lg">No hay promociones disponibles en este momento.</p>
							</div>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
								{promociones.map((promo) => (
									<div
										key={promo.id}
										className={`card-container bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition duration-300 group border hover:border-orange-200 ${promo.baja ? 'item-agotado' : ''}`}
									>

										<div className="relative">
											<img
												src={promo.imagen?.denominacion || "/placeholder.svg?height=200&width=300"}
												alt={promo.denominacion}
												className="w-full h-48 object-cover group-hover:scale-105 transition duration-300"
											/>

										</div>

										<div className="p-6">
											<div className="flex justify-between items-start mb-2">
												<h3 className="font-bold text-gray-900 text-lg line-clamp-2">{promo.denominacion}</h3>
												<div className="flex items-center space-x-1 ml-2">
													<span className="text-lg font-bold text-orange-500">${promo.precioPromocional?.toFixed(2)}</span>
												</div>
											</div>

											<p className="text-gray-600 text-sm mb-4 line-clamp-2">
												{promo.descripcionDescuento || "¡Aprovecha esta increíble oferta!"}
											</p>

											{promo.articulosManufacturados && promo.articulosManufacturados.length > 0 && (
												<div className="text-sm text-gray-500 mt-2 h-[60px] overflow-y-auto">
													Incluye: {promo.articulosManufacturados.map(a => a.denominacion).join(', ')}
												</div>
											)}

											<div className="flex justify-between items-center mt-4"> {/* Contenedor para botones */}
												{/* CONTROLES DE CANTIDAD PARA PROMOCIONES */}
												{promo.baja ? (
													// Si la promoción está de baja, solo muestra el icono Ban en un botón deshabilitado
													<button
														className="p-2 rounded-full bg-gray-200 text-gray-500 cursor-not-allowed"
														disabled
													>
														<Ban className="w-4 h-4 text-red-600" />
													</button>
												) : (
													<>
														{/* Botón para disminuir cantidad, visible si hay al menos 1 unidad */}
														{getItemQuantity(promo.id || 0) > 0 && (
															<button
																onClick={(e) => { e.stopPropagation(); updateQuantity(promo.id || 0, getItemQuantity(promo.id || 0) - 1); }}
																className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition duration-200 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
																title="Disminuir cantidad"
																disabled={promo.baja}
															>
																<Minus className="w-4 h-4" />
															</button>
														)}

														{/* Muestra la cantidad actual si es > 0 */}
														{getItemQuantity(promo.id || 0) > 0 && (
															<span className="font-bold text-lg">{getItemQuantity(promo.id || 0)}</span>
														)}

														{/* Botón para aumentar (+) o añadir al carrito, SIEMPRE VISIBLE */}
														<button
															onClick={(e) => { e.stopPropagation(); addToCart(promo); }}
															className={`p-2 rounded-full transition duration-200 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed ${getItemQuantity(promo.id || 0) > 0
																? "bg-green-500 text-white hover:bg-green-600"
																: "bg-orange-500 text-white hover:bg-orange-600"
																}`}
															title="Aumentar cantidad"
															disabled={promo.baja}
														>
															<Plus className="w-4 h-4" />
														</button>

														{/* Botón para eliminar (X), solo aparece si hay items en el carrito */}
														{getItemQuantity(promo.id || 0) > 0 && (
															<button
																onClick={(e) => { e.stopPropagation(); removeFromCart(promo.id || 0); }}
																className="p-2 bg-gray-400 text-white rounded-full hover:bg-gray-500 transition duration-200 ml-2 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
																title="Eliminar todas las unidades del carrito"
																disabled={promo.baja}
															>
																<X className="w-3 h-3" />
															</button>

														)}
													</>
												)}


											</div>
											{/* Enlace para ver detalles de la promoción */}
											<div className="mt-4">
												<Link
													to={`/producto/${promo.id}`} // o articulo.id
													className={`${promo.baja // o articulo.baja
														? 'bg-gray-300 text-gray-500 cursor-not-allowed pointer-events-none'
														: 'bg-orange-400 hover:bg-orange-500 text-white'
														} text-center py-2 block mx-auto mt-4 rounded-md transition duration-200`}
													// Esta línea es clave para deshabilitar la navegación en links
													onClick={(e) => { if (promo.baja) e.preventDefault(); }} // o articulo.baja
												>
													Ver detalles
												</Link>
											</div>
										</div>
									</div>
								))}
							</div>
						)}
						<div className="text-center mt-12">
							<Link to="/promociones" className="bg-orange-500 text-white px-8 py-3 rounded-full hover:bg-orange-600 transition duration-200 font-medium">
								Ver todas las promociones
							</Link>
						</div>
					</section>
					{/* Promociones destacadas - FIN DE LA SECCIÓN MODIFICADA */}


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
									className={`card-container bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition duration-300 group border hover:border-orange-200 ${articulo.baja ? 'item-agotado' : ''}`}
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
											{articulo instanceof ArticuloManufacturado && articulo.descripcion
												? articulo.descripcion
												: "Delicioso producto."}
										</p>

										<div className="flex justify-between items-center">
											<div className="text-sm text-gray-500">
												{articulo.categoria?.denominacion || "Producto"}
											</div>
											{/* CONTROLES DE CANTIDAD PARA ARTÍCULOS */}
											{articulo.baja ? (
												// Si el artículo está de baja, solo muestra el icono Ban en un botón deshabilitado
												<button
													className="p-2 rounded-full bg-gray-200 text-gray-500 cursor-not-allowed"
													disabled
												>
													<Ban className="w-4 h-4 text-red-600" />
												</button>
											) : (
												<>
													{/* Botón para disminuir cantidad, visible si hay al menos 1 unidad */}
													{getItemQuantity(articulo.id || 0) > 0 && (
														<button
															onClick={(e) => { e.stopPropagation(); updateQuantity(articulo.id || 0, getItemQuantity(articulo.id || 0) - 1); }}
															className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition duration-200 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
															title="Disminuir cantidad"
															disabled={articulo.baja}
														>
															<Minus className="w-4 h-4" />
														</button>
													)}

													{/* Muestra la cantidad actual si es > 0 */}
													{getItemQuantity(articulo.id || 0) > 0 && (
														<span className="font-bold text-lg">{getItemQuantity(articulo.id || 0)}</span>
													)}

													{/* Botón para aumentar (+) o añadir al carrito, SIEMPRE VISIBLE */}
													<button
														onClick={(e) => { e.stopPropagation(); addToCart(articulo); }}
														className={`p-2 rounded-full transition duration-200 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed ${getItemQuantity(articulo.id || 0) > 0
															? "bg-green-500 text-white hover:bg-green-600"
															: "bg-orange-500 text-white hover:bg-orange-600"
															}`}
														title="Aumentar cantidad"
														disabled={articulo.baja}
													>
														<Plus className="w-4 h-4" />
													</button>

													{/* Botón para eliminar (X), solo aparece si hay items en el carrito */}
													{getItemQuantity(articulo.id || 0) > 0 && (
														<button
															onClick={(e) => { e.stopPropagation(); removeFromCart(articulo.id || 0); }}
															className="p-2 bg-gray-400 text-white rounded-full hover:bg-gray-500 transition duration-200 ml-2 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
															title="Eliminar todas las unidades del carrito"
															disabled={articulo.baja}
														>
															<X className="w-3 h-3" />
														</button>
													)}

												</>
											)}
										</div>
										<Link
											to={`/producto/${articulo.id}`} // o articulo.id
											className={`${articulo.baja // o articulo.baja
												? 'bg-gray-300 text-gray-500 cursor-not-allowed pointer-events-none'
												: 'bg-orange-400 hover:bg-orange-500 text-white'
												} text-center py-2 block mx-auto mt-4 rounded-md transition duration-200`}
											// Esta línea es clave para deshabilitar la navegación en links
											onClick={(e) => { if (articulo.baja) e.preventDefault(); }} // o articulo.baja
										>
											Ver detalles
										</Link>
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



		</div>
	)
}