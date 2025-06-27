"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ShoppingCart, Plus, Minus, ArrowLeft, Clock, Star, ChevronRight, Heart, X } from "lucide-react"
import { useCart } from "../../components/Cart/context/cart-context"
import type { ArticuloManufacturado } from "../../models/Articulos/ArticuloManufacturado"

export default function ProductDetailPage() {
  // ───────────────────────────── hooks ─────────────────────────────
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
	const { addToCart, isInCart, getItemQuantity, totalItems, removeFromCart } = useCart()

  // ──────────────────────────── state ──────────────────────────────
  const [producto, setProducto] = useState<ArticuloManufacturado | null>(null)
  const [related, setRelated] = useState<ArticuloManufacturado[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [quantity, setQuantity] = useState(1)

  // ─────────────── cargar producto principal ────────────────
  useEffect(() => {
    const fetchProducto = async () => {
      try {
        const res = await fetch(
          `http://localhost:8080/api/articuloManufacturado/${id}`,
        )
        if (!res.ok) throw new Error("Producto no encontrado")
        const data: ArticuloManufacturado = await res.json()
        setProducto(data)
      } catch (err: any) {
        setError(err.message || "Error al cargar el producto")
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchProducto()
  }, [id])

  // ─────────────── cargar productos relacionados ────────────────
  useEffect(() => {
    const fetchRelated = async () => {
      if (!producto?.categoria?.id) return
      try {
        const res = await fetch(
          `http://localhost:8080/api/articuloManufacturado/filtrar?categoriaId=${producto.categoria.id}&baja=false`,
        )
        const data: ArticuloManufacturado[] = await res.json()
        const filtrados = data
          .filter((p) => p.id !== producto.id) // excluir actual
          .slice(0, 4) // máximo 4 sugerencias
        setRelated(filtrados)
      } catch (e) {
        setRelated([])
      }
    }

    fetchRelated()
  }, [producto])

  // ────────────────────── helpers internos ──────────────────────
  const increaseQty = () => setQuantity((q) => Math.min(q + 1, 10))
  const decreaseQty = () => setQuantity((q) => Math.max(q - 1, 1))
  const handleAddToCart = () => {
    if (!producto) return
    for (let i = 0; i < quantity; i++) addToCart(producto)
    navigate("/cart")
  }

  // ──────────────────────────── UI states ────────────────────────
  if (loading) return <div className="p-6">Cargando producto...</div>
  if (error) return <div className="p-6 text-red-600">{error}</div>
  if (!producto) return null

  // ─────────────────────────── render ────────────────────────────
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* volver */}
        <button
          onClick={() => navigate(-1)}
          className="text-orange-500 font-medium flex items-center mb-6 hover:underline"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Volver
        </button>

        {/* bloque principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Imagen */}
          <div className="relative w-full h-80 bg-gray-100 rounded-2xl overflow-hidden">
            <img
              src={producto.imagen?.denominacion || "/placeholder.svg"}
              alt={producto.denominacion}
              className="w-full h-full object-cover"
            />
            {producto.tiempoEstimadoMinutos && (
              <div className="absolute top-3 left-3 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                <Clock className="inline w-4 h-4 mr-1" />
                {producto.tiempoEstimadoMinutos} min
              </div>
            )}
          </div>

          {/* Detalles */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {producto.denominacion}
              </h1>
              {producto.categoria?.denominacion && (
                <p className="text-sm text-gray-500 mt-1">
                  {producto.categoria.denominacion}
                </p>
              )}
            </div>

            <p className="text-gray-700 text-lg leading-relaxed">
              {producto.descripcion || "Un producto delicioso, preparado al momento."}
            </p>

            <div className="text-4xl font-bold text-orange-500">
              ${producto.precioVenta?.toFixed(2)}
            </div>

            {/* Cantidad */}
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

            {/* Botón agregar */}
            <button
              onClick={handleAddToCart}
              className="w-full mt-6 bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl font-semibold flex justify-center items-center gap-2 text-lg"
            >
              <ShoppingCart className="w-5 h-5" />
              Agregar al carrito
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
											<h3 className="font-bold text-gray-900 text-lg line-clamp-2">{item.denominacion}</h3>
											<div className="flex items-center space-x-1 ml-2">
												<span className="text-lg font-bold text-orange-500">${item.precioVenta}</span>
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
												onClick={() => addToCart(item)}
												className={`p-2 rounded-full transition duration-200 ${isInCart(item.id || 1)
													? "bg-green-500 text-white"
													: "bg-orange-500 text-white hover:bg-orange-600"
													}`}
											>
												{isInCart(item.id || 1) ? (
													<div className="flex gap-2">
														<span className="text-xs font-bold">{getItemQuantity(item.id || 0)}</span>
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
															e.stopPropagation()
															removeFromCart(item.id || 0)
														}}
														className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition duration-200"
														title="Eliminar del carrito"
													>
														<X className="w-3 h-3" />
													</button>
												</div>
											) : ''}
										</div>
										<a className="text-center bg-orange-400 text-white py-2 block mx-auto mt-4" href={`/producto/${item.id}`}>Ver detalle</a>
									</div>
								</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
