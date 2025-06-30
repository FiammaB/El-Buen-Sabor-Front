"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Plus,
  Minus,
  ArrowLeft,
  Clock,
  ChevronRight,
  Heart,
  X,
} from "lucide-react";
import { useCart } from "../../components/Cart/context/cart-context";
import { ArticuloManufacturado } from "../../models/Articulos/ArticuloManufacturado";
// Eliminamos la importación de ArticuloInsumo
import { Articulo } from "../../models/Articulos/Articulo";
import type { IPromocionDTO } from "../../models/DTO/IPromocionDTO";
import { getPromocionById } from "../../services/PromocionService";

// Reducimos el tipo para que sea solo ArticuloManufacturado o IPromocionDTO
type ProductDetailType = ArticuloManufacturado | IPromocionDTO;

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, isInCart, getItemQuantity, totalItems, removeFromCart } =
    useCart();

  const [producto, setProducto] = useState<ProductDetailType | null>(null);
  const [related, setRelated] = useState<ArticuloManufacturado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      setError("");
      let fetchedProduct: ProductDetailType | null = null;

      try {
        // 1. Intentar cargar como ArticuloManufacturado
        const res = await fetch(`http://localhost:8080/api/articuloManufacturado/${id}`);
        if (res.ok) {
          fetchedProduct = Object.setPrototypeOf(
            await res.json(),
            ArticuloManufacturado.prototype
          ) as ArticuloManufacturado;
        } else if (res.status === 404) {
          // 2. Si no es manufacturado, intentar cargar como Promocion
          try {
            const promo = await getPromocionById(Number(id));
            fetchedProduct = promo;
          } catch (_promoError) {
            throw new Error(`Producto manufacturado o Promoción no encontrada.`);
          }
        } else {
          throw new Error(
            `Error al cargar producto: ${res.statusText}`
          );
        }

        if (fetchedProduct) {
          setProducto(fetchedProduct);
          setQuantity(getItemQuantity(fetchedProduct.id || 0) || 1);
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
  }, [id, getItemQuantity]);

  useEffect(() => {
    const fetchRelated = async () => {
      if (
        producto instanceof ArticuloManufacturado &&
        producto.categoria?.id
      ) {
        try {
          const res = await fetch(
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
  }, [producto]);

  const increaseQty = () => setQuantity((q) => Math.min(q + 1, 10));
  const decreaseQty = () => setQuantity((q) => Math.max(q - 1, 1));

  const handleAddToCart = () => {
    if (!producto) return;

    // Diferenciar el tipo para addToCart
    if (producto instanceof ArticuloManufacturado) {
      addToCart(producto as Articulo, quantity); // Castear a Articulo para el contexto
    } else { // Es una Promocion
      addToCart(producto as IPromocionDTO, quantity); // Pasar la promoción directamente
    }
  };

  if (loading) return <div className="p-6">Cargando producto...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!producto) return null;

  const isArticuloManufacturado = producto instanceof ArticuloManufacturado;
  // Eliminamos isArticuloInsumo
  const isPromocion = !isArticuloManufacturado && 'precioPromocional' in producto; // Simplificamos la comprobación


  return (
    <div className="min-h-screen bg-white">
      {totalItems > 0 && (
        <a
          href="/cart"
          className="text-white fixed bottom-[30px] right-[30px] rounded-full font-bold bg-green-500 p-8 z-50 text-white"
        >
          IR AL CARRITO
        </a>
      )}

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
            {isArticuloManufacturado && producto.tiempoEstimadoMinutos && (
              <div className="absolute top-3 left-3 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                <Clock className="inline w-4 h-4 mr-1" />
                {producto.tiempoEstimadoMinutos} min
              </div>
            )}
            {isPromocion && (
              <div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded-full text-sm">
                ¡Oferta Especial!
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {producto.denominacion}
              </h1>
              {/* Solo muestra la categoría si es ArticuloManufacturado */}
              {isArticuloManufacturado && producto.categoria?.denominacion && (
                <p className="text-sm text-gray-500 mt-1">
                  {producto.categoria.denominacion}
                </p>
              )}
              {isPromocion && (
                <p className="text-sm text-red-500 font-semibold mt-1">
                  Promoción
                </p>
              )}
            </div>

            {isArticuloManufacturado && (
              <p className="text-gray-700 text-lg leading-relaxed">
                {producto.descripcion || "Un producto delicioso, preparado al momento."}
              </p>
            )}

            {/* Eliminado el bloque de ArticuloInsumo */}

            {isPromocion && (
              <div className="text-gray-700 text-base space-y-1">
                <p>{producto.descripcionDescuento || "Aprovecha esta increíble oferta!"}</p>
                {producto.articulosManufacturados && producto.articulosManufacturados.length > 0 && (
                  <p className="text-sm text-gray-600 mt-2">
                    Incluye: {producto.articulosManufacturados.map(a => a.denominacion).join(', ')}
                  </p>
                )}
                {producto.articulosInsumo && producto.articulosInsumo.length > 0 && (
                  <p className="text-sm text-gray-600 mt-2">
                    Bebidas/Extras: {producto.articulosInsumo.map(a => a.denominacion).join(', ')}
                  </p>
                )}
              </div>
            )}

            <div className="text-4xl font-bold text-orange-500">
              {isPromocion ? `$${producto.precioPromocional?.toFixed(2)}` : `$${producto.precioVenta?.toFixed(2)}`}
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={decreaseQty}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-xl font-semibold">{quantity}</span>
              <button
                onClick={increaseQty}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              className="w-full mt-6 bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl font-semibold flex justify-center items-center gap-2 text-lg"
            >
              <ShoppingCart className="w-5 h-5" />
              {getItemQuantity(producto.id || 0) > 0
                ? `Agregado al carrito`
                : "Agregar al carrito"}
            </button>
          </div>
        </div>

        {/* ─────────────── Productos relacionados ─────────────── */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              También podría interesarte
              <ChevronRight className="w-5 h-5 ml-1" />
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {related.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/producto/${item.id}`)}
                  className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition duration-300 group cursor-pointer border hover:border-orange-200"
                >
                  <div className="relative">
                    <img
                      src={
                        item.imagen
                          ? item.imagen.denominacion
                          : "/placeholder.svg?height=200&width=300"
                      }
                      alt={item.denominacion}
                      className="w-full h-48 object-cover group-hover:scale-105 transition duration-300"
                    />
                    <button className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition duration-200">
                      <Heart className="w-4 h-4 text-gray-400" />
                    </button>
                    {item.tiempoEstimadoMinutos && (
                      <div className="absolute bottom-3 left-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded-full text-sm">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {item.tiempoEstimadoMinutos} min
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-gray-900 text-lg line-clamp-2">
                        {item.denominacion}
                      </h3>
                      <div className="flex items-center space-x-1 ml-2">
                        <span className="text-lg font-bold text-orange-500">
                          ${item.precioVenta}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {item.descripcion || "Delicioso producto artesanal"}
                    </p>

                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-500">
                        {item.categoria?.denominacion || "Producto especial"}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(item);
                        }}
                        className={`p-2 rounded-full transition duration-200 ${isInCart(item.id || 1)
                          ? "bg-green-500 text-white"
                          : "bg-orange-500 text-white hover:bg-orange-600"
                          }`}
                      >
                        {isInCart(item.id || 1) ? (
                          <div className="flex gap-2">
                            <span className="text-xs font-bold">
                              {getItemQuantity(item.id || 0)}
                            </span>
                            <Plus className="w-4 h-4" />
                          </div>
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                      </button>
                      {isInCart(item.id || 1) ? (
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFromCart(item.id || 0);
                            }}
                            className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition duration-200"
                            title="Eliminar del carrito"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        ""
                      )}
                    </div>
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