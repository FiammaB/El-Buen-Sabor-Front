"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Plus,
  Minus,
  ArrowLeft,


} from "lucide-react";
import { useCart } from "../../components/Cart/context/cart-context";
import { ArticuloManufacturado } from "../../models/Articulos/ArticuloManufacturado";
import { Articulo } from "../../models/Articulos/Articulo";
import type { IPromocionDTO } from "../../models/DTO/IPromocionDTO";
import { getPromocionById, getPromociones } from "../../services/PromocionService";
import { ArticuloInsumo } from "../../models/Articulos/ArticuloInsumo.ts";

// Se mantiene tu tipo unificado
type ProductDetailType = Articulo | IPromocionDTO;

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, getItemQuantity, updateQuantity } = useCart();

  const [producto, setProducto] = useState<ProductDetailType | null>(null);
  const [related, setRelated] = useState<ArticuloManufacturado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [relatedPromos, setRelatedPromos] = useState<IPromocionDTO[]>([]);

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      setError("");
      let fetchedProduct: ProductDetailType | null = null;

      try {
        // Tu lógica para cargar el producto principal (Manufacturado, Promo o Insumo)
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
          setQuantity(getItemQuantity(fetchedProduct.id || 0) || 1);

          // =======================================================
          // ✅ AQUÍ ESTÁ LA LÓGICA CORREGIDA PARA BUSCAR PROMOCIONES
          // =======================================================
          try {
            const allPromos = await getPromociones();
            const relatedP = allPromos
              .filter(p => !p.baja && p.id !== fetchedProduct?.id)
              .slice(0, 2);
            setRelatedPromos(relatedP);
          } catch (promoError) {
            console.error("Error al cargar promociones relacionadas:", promoError);
          }
          // =======================================================

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
  }, [id]);

  // Tu segundo useEffect para buscar productos relacionados se mantiene igual
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

  const increaseQty = () => {

    const newQuantity = Math.min(quantity + 1, 10);

    setQuantity(newQuantity);

    if (producto && getItemQuantity(producto.id ?? 0) > 0) {
      updateQuantity(producto.id ?? 0, newQuantity);
    }
  };

  const decreaseQty = () => {

    const newQuantity = Math.max(quantity - 1, 1);

    setQuantity(newQuantity);


    if (producto && getItemQuantity(producto.id ?? 0) > 0) {
      updateQuantity(producto.id ?? 0, newQuantity);
    }
  };

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
  const isPromocion = 'precioPromocional' in producto;


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
          {/* ... Tu JSX para la imagen principal ... */}
          <div className="relative w-full h-80 bg-gray-100 rounded-2xl overflow-hidden">
            <img
              src={producto.imagen?.denominacion || "/placeholder.svg"}
              alt={producto.denominacion}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-6">
            {/* ... Tu JSX para los detalles del producto, precio y botones ... */}
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
            <button onClick={handleAddToCart} className="w-full mt-6 bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl font-semibold flex justify-center items-center gap-2 text-lg">
              <ShoppingCart className="w-5 h-5" />
              {getItemQuantity(producto.id || 0) > 0 ? `Agregado al carrito` : "Agregar al carrito"}
            </button>
          </div>
        </div>

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

                  {/* --- Lógica de botones interactivos --- */}
                  <div className="flex items-center gap-2">
                    {getItemQuantity(promo.id) > 0 ? (
                      <>
                        <button onClick={() => updateQuantity(promo.id, getItemQuantity(promo.id) - 1)} className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition">
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-bold">{getItemQuantity(promo.id)}</span>
                        <button onClick={() => updateQuantity(promo.id, getItemQuantity(promo.id) + 1)} className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 transition">
                          <Plus className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <button onClick={() => addToCart(promo)} className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center hover:bg-orange-600 transition">
                        <Plus className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- SECCIÓN DE PRODUCTOS RELACIONADOS (TU ESTILO) --- */}
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

                  {/* --- Lógica de botones interactivos --- */}
                  <div className="flex items-center gap-2">
                    {getItemQuantity(relatedProd.id ?? 0) > 0 ? (//Argument of type 'number | undefined' is not assignable to parameter of type 'number'. Type 'undefined' is not assignable to type 'number'.
                      <>
                        <button onClick={() => updateQuantity(relatedProd.id ?? 0, getItemQuantity(relatedProd.id ?? 0) - 1)} className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition">
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-bold">{getItemQuantity(relatedProd.id ?? 0)}</span>
                        <button onClick={() => updateQuantity(relatedProd.id ?? 0, getItemQuantity(relatedProd.id ?? 0) + 1)} className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 transition">
                          <Plus className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <button onClick={() => addToCart(relatedProd)} className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center hover:bg-orange-600 transition">
                        <Plus className="w-4 h-4" />
                      </button>
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