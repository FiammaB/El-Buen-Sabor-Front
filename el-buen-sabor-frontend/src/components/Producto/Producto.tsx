"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Plus,
  Minus,
  ArrowLeft,
  Ban,
  X,
} from "lucide-react";
import { useCart } from "../../components/Cart/context/cart-context";
import { ArticuloManufacturado } from "../../models/Articulos/ArticuloManufacturado";
import { Articulo } from "../../models/Articulos/Articulo";
import type { IPromocionDTO } from "../../models/DTO/IPromocionDTO";
import { getPromocionById, getPromociones } from "../../services/PromocionService";
import { ArticuloInsumo } from "../../models/Articulos/ArticuloInsumo.ts";

type ProductDetailType = Articulo | IPromocionDTO;

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  // Obtenemos las funciones del carrito. `getItemQuantity` será la "fuente de verdad" para la cantidad.
  const { addToCart, getItemQuantity, updateQuantity, removeFromCart } = useCart();

  const [producto, setProducto] = useState<ProductDetailType | null>(null);
  const [related, setRelated] = useState<ArticuloManufacturado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Eliminamos el estado `quantity` local para el producto principal.
  // La cantidad mostrada y manipulada se derivará directamente de `getItemQuantity`.

  const [relatedPromos, setRelatedPromos] = useState<IPromocionDTO[]>([]);

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      setError("");
      let fetchedProduct: ProductDetailType | null = null;

      try {
        const res = await fetch(`http://localhost:8080/api/articuloManufacturado/${id}`);
        if (res.ok) {
          fetchedProduct = Object.setPrototypeOf(await res.json(), ArticuloManufacturado.prototype) as ArticuloManufacturado;
        } else if (res.status === 404) {
          try {
            const promo = await getPromocionById(Number(id));
            fetchedProduct = promo;
          } catch {
            const insumoRes = await fetch(`http://localhost:8080/api/articuloInsumo/${id}`);
            if (insumoRes.ok) {
              fetchedProduct = Object.setPrototypeOf(await insumoRes.json(), ArticuloInsumo.prototype) as ArticuloInsumo;
            } else {
              throw new Error("Producto no encontrado.");
            }
          }
        } else {
          throw new Error(`Error al cargar producto: ${res.statusText}`);
        }

        if (fetchedProduct) {
          setProducto(fetchedProduct);
          // Ya no es necesario `setQuantity` aquí; la cantidad se obtendrá del contexto del carrito.
        } else {
          setError("Producto no encontrado.");
        }
      } catch (err: unknown) {
        setError("Error al cargar el producto o promoción.");
        console.error("Error en fetchProductDetails:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProductDetails();
  }, [id]); // Dependencias: solo `id` porque `getItemQuantity` es una función del contexto que no cambia.

  // Efecto para cargar productos relacionados
  useEffect(() => {
    const fetchRelated = async () => {
      if (producto instanceof ArticuloManufacturado && producto.categoria?.id) {
        try {
          const res = await fetch(
            // ✅ FILTRADO POR `baja=false` PARA PRODUCTOS RELACIONADOS
            `http://localhost:8080/api/articuloManufacturado/filtrar?categoriaId=${producto.categoria.id}&baja=false`
          );
          const data: ArticuloManufacturado[] = await res.json();
          const filtrados = data
            .filter((p) => p.id !== producto.id)
            .slice(0, 4);
          setRelated(filtrados);
        } catch (e) {
          setRelated([]);
          console.error("Error al cargar relacionados:", e);
        }
      } else {
        setRelated([]);
      }
    };

    fetchRelated();
  }, [producto]); // `producto` como dependencia está bien.

  // Efecto para cargar promociones relacionadas
  useEffect(() => {
    const fetchPromos = async () => {
      try {
        const allPromos = await getPromociones();
        // Filtra por promociones activas (no de baja) y que no sean el producto actual
        const relatedP = allPromos
          .filter(p => !p.baja && p.id !== producto?.id) // ✅ Asegura que no se muestren promos de baja aquí
          .slice(0, 2);
        setRelatedPromos(relatedP);
      } catch (promoError) {
        console.error("Error al cargar promociones relacionadas:", promoError);
      }
    };
    // Carga las promociones relacionadas solo si el producto principal ya está cargado
    if (producto) {
      fetchPromos();
    }
  }, [producto]); // Dependencia `producto` para que se re-ejecute cuando el producto principal esté listo.

  // ---
  // LÓGICA DE CANTIDAD Y CARRITO PARA EL PRODUCTO PRINCIPAL
  // ---

  // La cantidad actual del producto principal en el carrito. Esta es la fuente de verdad.
  const currentProductQuantity = getItemQuantity(producto?.id || 0);

  const handleIncreaseQty = () => {
    if (!producto) return;
    // Si el producto no está en el carrito (o su cantidad es 0), lo agregamos con cantidad 1.
    // Si ya está, actualizamos su cantidad (incrementamos en 1).
    if (currentProductQuantity === 0) {
      addToCart(producto, 1);
    } else {
      updateQuantity(producto.id || 0, currentProductQuantity + 1);
    }
  };

  const handleDecreaseQty = () => {
    if (!producto) return;
    const newQuantityInCart = currentProductQuantity - 1;

    if (newQuantityInCart <= 0) {
      removeFromCart(producto.id || 0); // Si la cantidad llega a 0, lo eliminamos
    } else {
      updateQuantity(producto.id || 0, newQuantityInCart); // Actualiza la cantidad
    }
  };

  // El botón principal de "Agregar al Carrito" también llama a `handleIncreaseQty`
  // para simplificar la lógica y evitar el pestañeo.
  // Si deseas un "picker" de cantidad inicial diferente, sería una refactorización más compleja.
  const handleMainAddToCartButton = () => {
    handleIncreaseQty(); // Al hacer clic en el botón principal, se comporta como el '+'
  };


  if (loading) return <div className="p-6">Cargando producto...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!producto) return null;

  const isArticuloManufacturado = producto instanceof ArticuloManufacturado;
  const isPromocion = 'precioPromocional' in producto;
  // Determina si el producto principal está "de baja" para deshabilitar los controles
  const isProductBaja = producto.baja;


  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <button
          onClick={() => navigate(-1)}
          className="text-orange-500 font-medium flex items-center mb-6 hover:underline"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Volver
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="relative w-full h-80 bg-gray-100 rounded-2xl overflow-hidden">
            <img
              src={producto.imagen?.denominacion || "/placeholder.svg"}
              alt={producto.denominacion}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {producto.denominacion}
              </h1>
            </div>
            <p className="text-gray-700 text-lg leading-relaxed">
              {isArticuloManufacturado ? producto.descripcion : (isPromocion ? producto.descripcionDescuento : "")}
            </p>
            <div className="text-4xl font-bold text-orange-500">
              {isPromocion ? `$${producto.precioPromocional?.toFixed(2)}` : `$${(producto as Articulo).precioVenta?.toFixed(2)}`}
            </div>
            {/* --- INICIO DEL BLOQUE PARA MOSTRAR DETALLES DE LA PROMOCIÓN --- */}
            {isPromocion && (producto.promocionDetalles?.length > 0 || producto.promocionInsumoDetalles?.length > 0) && (
              <div className="mt-6 border-t pt-4">
                <h4 className="text-lg font-semibold text-gray-800">Esta promoción incluye:</h4>
                <ul className="list-disc list-inside mt-2 space-y-1 text-gray-700">

                  {/* Mapea y muestra los artículos manufacturados */}
                  {producto.promocionDetalles?.map((detalle) => (
                    <li key={`detalle-manu-${detalle.id}`}>
                      <span className="font-medium">{detalle.cantidad}x</span> {detalle.articuloManufacturado.denominacion}
                    </li>
                  ))}

                  {/* Mapea y muestra los artículos insumos (ej: bebidas) */}
                  {producto.promocionInsumoDetalles?.map((detalleInsumo) => (
                    <li key={`detalle-insumo-${detalleInsumo.id}`}>
                      <span className="font-medium">{detalleInsumo.cantidad}x</span> {detalleInsumo.articuloInsumo.denominacion}
                    </li>
                  ))}

                </ul>
              </div>
            )}
            {/* --- FIN DEL BLOQUE --- */}
            <div className="flex items-center gap-4">
              {/* Botón de decrementar para el producto principal */}
              {isProductBaja ? (
                <button className="w-10 h-10 rounded-full bg-gray-200 text-gray-500 cursor-not-allowed" disabled>
                  <Ban className="w-4 h-4 text-red-600" />
                </button>
              ) : (
                <button
                  onClick={handleDecreaseQty}
                  // Deshabilita el botón si la cantidad en el carrito es 0
                  disabled={currentProductQuantity === 0}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition ${currentProductQuantity === 0 ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-red-500 text-white hover:bg-red-600"
                    }`}
                >
                  <Minus className="w-4 h-4" />
                </button>
              )}

              {/* Muestra la cantidad actual del carrito para el producto principal */}
              <span className="text-xl font-semibold">{currentProductQuantity}</span>

              {/* Botón de incrementar para el producto principal */}
              {isProductBaja ? (
                <button className="w-10 h-10 rounded-full bg-gray-200 text-gray-500 cursor-not-allowed" disabled>
                  <Ban className="w-4 h-4 text-red-600" />
                </button>
              ) : (
                <button
                  onClick={handleIncreaseQty}
                  className="w-10 h-10 rounded-full bg-green-500 text-white hover:bg-green-600 flex items-center justify-center"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>
            {/* El botón principal de "Agregar al Carrito" */}
            <button
              onClick={handleMainAddToCartButton}
              disabled={isProductBaja}
              className={`w-full mt-6 py-4 rounded-xl font-semibold flex justify-center items-center gap-2 text-lg transition duration-200
                ${isProductBaja ? "bg-gray-300 text-gray-500 cursor-not-allowed" : (currentProductQuantity > 0 ? "bg-green-500 hover:bg-green-600" : "bg-orange-500 hover:bg-orange-600")} text-white`}
            >
              <ShoppingCart className="w-5 h-5" />
              {isProductBaja ? "Producto no disponible" : (currentProductQuantity > 0 ? `Agregado al carrito (${currentProductQuantity})` : "Agregar al carrito")}
            </button>
          </div>
        </div>

        ---

        {/* --- SECCIÓN DE PROMOCIONES RELACIONADAS (CON BOTONES INTERACTIVOS) --- */}
        {relatedPromos.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">¡Aprovecha nuestras promos!</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relatedPromos.map((promo) => (
                <div key={promo.id} className="flex items-center space-x-3 p-3 border border-gray-100 rounded-lg">
                  <img src={promo.imagen?.denominacion || '/placeholder.svg'} alt={promo.denominacion} className="w-16 h-16 object-cover rounded-lg" />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-sm">{promo.denominacion}</h4>
                    <p className="text-orange-500 font-bold text-sm">${promo.precioPromocional.toFixed(2)}</p>
                  </div>

                  {/* --- Lógica de botones interactivos para promos relacionadas --- */}
                  <div className="flex items-center gap-2">
                    {promo.baja ? (
                      <button className="p-2 rounded-full bg-gray-200 text-gray-500 cursor-not-allowed" disabled>
                        <Ban className="w-4 h-4 text-red-600" />
                      </button>
                    ) : (
                      <>
                        {getItemQuantity(promo.id) > 0 && (
                          <button
                            onClick={(e) => { e.stopPropagation(); updateQuantity(promo.id, getItemQuantity(promo.id) - 1); }}
                            className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition duration-200"
                            title="Disminuir cantidad"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                        )}
                        {getItemQuantity(promo.id) > 0 && (
                          <span className="font-bold text-lg">{getItemQuantity(promo.id)}</span>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); addToCart(promo); }}
                          className={`p-2 rounded-full transition duration-200 ${getItemQuantity(promo.id) > 0
                            ? "bg-green-500 text-white hover:bg-green-600"
                            : "bg-orange-500 text-white hover:bg-orange-600"
                            }`}
                          title="Aumentar cantidad"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        {getItemQuantity(promo.id) > 0 && (
                          <button
                            onClick={(e) => { e.stopPropagation(); removeFromCart(promo.id); }}
                            className="p-2 bg-gray-400 text-white rounded-full hover:bg-gray-500 transition duration-200 ml-2"
                            title="Eliminar todas las unidades del carrito"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        ---

        {/* --- SECCIÓN DE PRODUCTOS RELACIONADOS (CON ESTILO DE LISTA Y BOTONES INTERACTIVOS) --- */}
        {related.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">También podría interesarte</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {related.map((relatedProd) => (
                <div key={relatedProd.id} className="flex items-center space-x-3 p-3 border border-gray-100 rounded-lg">
                  <img src={relatedProd.imagen?.denominacion || '/placeholder.svg'} alt={relatedProd.denominacion} className="w-16 h-16 object-cover rounded-lg" />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-sm">{relatedProd.denominacion}</h4>
                    <p className="text-orange-500 font-bold text-sm">${relatedProd.precioVenta.toFixed(2)}</p>
                  </div>

                  {/* --- Lógica de botones interactivos para productos relacionados --- */}
                  <div className="flex items-center gap-2">
                    {relatedProd.baja ? ( // Verifica si el producto relacionado está de baja
                      <button className="p-2 rounded-full bg-gray-200 text-gray-500 cursor-not-allowed" disabled>
                        <Ban className="w-4 h-4 text-red-600" />
                      </button>
                    ) : (
                      <>
                        {getItemQuantity(relatedProd.id || 0) > 0 && (
                          <button
                            onClick={(e) => { e.stopPropagation(); updateQuantity(relatedProd.id || 0, getItemQuantity(relatedProd.id || 0) - 1); }}
                            className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                        )}
                        {getItemQuantity(relatedProd.id || 0) > 0 && (
                          <span className="font-bold">{getItemQuantity(relatedProd.id || 0)}</span>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); addToCart(relatedProd); }}
                          className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center hover:bg-orange-600 transition"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        {getItemQuantity(relatedProd.id || 0) > 0 && (
                          <button
                            onClick={(e) => { e.stopPropagation(); removeFromCart(relatedProd.id || 0); }}
                            className="p-2 bg-gray-400 text-white rounded-full hover:bg-gray-500 transition duration-200 ml-2"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}