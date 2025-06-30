// src/pages/Cart/CartPage.tsx

import { useEffect, useState } from 'react'
import {
    ArrowLeft, Plus, Minus, Trash2, ShoppingBag,
    CreditCard, Truck, Shield
} from 'lucide-react'
import { useCart } from "../../Cart/context/cart-context" // Asegúrate de que esta ruta sea correcta
import type { ArticuloManufacturado } from '../../../models/Articulos/ArticuloManufacturado';
import type { Articulo } from '../../../models/Articulos/Articulo'; // Importar Articulo para tipado
import type { IPromocionDTO } from '../../../models/DTO/IPromocionDTO'; // Importar IPromocionDTO para tipado

export default function CartPage() {
    const {
        items,
        totalItems,
        totalAmount,
        updateQuantity,
        removeFromCart,
        clearCart,
        addToCart
    } = useCart()

    const [relatedProducts, setRelatedProducts] = useState<ArticuloManufacturado[]>([])

    // Costo de envío, ahora 0 si el total es igual o mayor a 25
    const deliveryFee = totalAmount >= 25 ? 0 : 3.99
    const finalTotal = totalAmount + deliveryFee

    useEffect(() => {
        const fetchRelated = async () => {
            if (items.length === 0) {
                setRelatedProducts([]); // Limpiar productos relacionados si el carrito está vacío
                return;
            }

            // Obtener la categoría del primer artículo manufacturado en el carrito
            // Esto es para la sección "Te podría interesar" que sugiere productos de la misma categoría.
            // Si el primer ítem es una promoción o un insumo, quizás no tengamos una categoría relevante.

            // Type guard para ArticuloManufacturado
            function isArticuloManufacturado(item: any): item is ArticuloManufacturado {
                return (
                    item &&
                    item.tipo === 'articulo' &&
                    typeof item.tiempoEstimadoMinutos === 'number'
                );
            }

            const firstManufacturedArticulo = items.find(item =>
                isArticuloManufacturado(item.purchasableItem)
            )?.purchasableItem as ArticuloManufacturado | undefined;

            const categoriaId = firstManufacturedArticulo?.categoria?.id;

            if (!categoriaId) {
                setRelatedProducts([]); // Si no hay categoría de artículo manufacturado, no mostramos relacionados
                return;
            }

            try {
                const res = await fetch(`http://localhost:8080/api/articuloManufacturado/filtrar?categoriaId=${categoriaId}&baja=false`);
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                const data: ArticuloManufacturado[] = await res.json();

                // Filtrar productos que ya están en el carrito
                const productosFiltrados = data.filter((p: ArticuloManufacturado) =>
                    !items.some((itemInCart) => itemInCart.id === p.id)
                );

                setRelatedProducts(productosFiltrados);
            } catch (err) {
                console.error("Error al cargar productos relacionados:", err);
                setRelatedProducts([]);
            }
        };

        fetchRelated();
    }, [items]); // Vuelve a ejecutar cuando los ítems del carrito cambien

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <a href='/landing' className="p-2 hover:bg-gray-100 rounded-full transition duration-200">
                                <ArrowLeft className="w-6 h-6" />
                            </a>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Mi Carrito</h1>
                                <p className="text-sm text-gray-500">{totalItems} productos</p>
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-orange-500">El Buen Sabor</div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {items.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="max-w-md mx-auto">
                            <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Tu carrito está vacío</h2>
                            <p className="text-gray-500 mb-8">
                                Parece que aún no has agregado ningún producto a tu carrito. ¡Explora nuestro menú y encuentra algo delicioso!
                            </p>
                            <a href='/landing' className="bg-orange-500 text-white px-8 py-3 rounded-full hover:bg-orange-600 transition duration-200 font-medium">
                                Explorar Productos
                            </a>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Lista de productos */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white rounded-2xl shadow-sm p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-gray-900">Productos en tu carrito</h2>
                                    <button
                                        onClick={clearCart}
                                        className="text-red-500 hover:text-red-600 text-sm font-medium transition duration-200"
                                    >
                                        Vaciar carrito
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {items.map((item) => {
                                        const { purchasableItem } = item;
                                        let imageUrl: string = "/placeholder.svg?height=80&width=80";
                                        let itemName: string = "Item desconocido";
                                        let itemCategoryOrType: string = "";
                                        let itemPrice: number = 0;
                                        let itemDescription: string = "";

                                        if (purchasableItem.tipo === 'articulo') {
                                            const articulo = purchasableItem as Articulo;
                                            imageUrl = articulo.imagen?.denominacion || imageUrl; // Asume que ya es URL completa o relativa pública
                                            itemName = articulo.denominacion;
                                            itemCategoryOrType = articulo.categoria?.denominacion || "Artículo";
                                            itemPrice = articulo.precioVenta || 0;
                                            if ('descripcion' in articulo) {
                                                itemDescription = (articulo as ArticuloManufacturado).descripcion || '';
                                            }
                                        } else if (purchasableItem.tipo === 'promocion') {
                                            const promocion = purchasableItem as IPromocionDTO;
                                            // <-- CAMBIO CLAVE AQUÍ: Elimina el prefijo `http://localhost:8080/`
                                            imageUrl = promocion.imagen?.denominacion || imageUrl; // Las URL de Cloudinary son completas
                                            itemName = promocion.denominacion;
                                            itemCategoryOrType = "Promoción";
                                            itemPrice = promocion.precioPromocional || 0;
                                            itemDescription = promocion.descripcionDescuento || '';
                                        }

                                        return (
                                            <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-100 rounded-xl">
                                                <img
                                                    src={imageUrl}
                                                    alt={itemName}
                                                    className="w-20 h-20 object-cover rounded-xl"
                                                />

                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-gray-900 mb-1">{itemName}</h3>
                                                    <p className="text-sm text-gray-500 mb-2">
                                                        {itemCategoryOrType}
                                                        {itemDescription && itemDescription.length > 0 && (
                                                            <span className="block text-xs text-gray-400 line-clamp-1">{itemDescription}</span>
                                                        )}
                                                    </p>
                                                    <p className="text-orange-500 font-bold">${itemPrice.toFixed(2)}</p>
                                                </div>

                                                <div className="flex items-center space-x-3">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition duration-200"
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                    </button>

                                                    <span className="w-12 text-center font-semibold text-lg">{item.quantity}</span>

                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 transition duration-200"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                <div className="text-right">
                                                    <p className="font-bold text-lg text-gray-900">
                                                        ${typeof item.subtotal === "number" ? item.subtotal.toFixed(2) : "0.00"}
                                                    </p>

                                                    <button
                                                        onClick={() => removeFromCart(item.id)}
                                                        className="text-red-500 hover:text-red-600 text-sm mt-1 transition duration-200"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Productos relacionados */}
                            {relatedProducts.length > 0 && (
                                <div className="bg-white rounded-2xl shadow-sm p-6">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">Te podría interesar</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {relatedProducts.map((product) => (
                                            <div key={product.id} className="flex items-center space-x-3 p-3 border border-gray-100 rounded-lg">
                                                <img
                                                    // <-- CAMBIO CLAVE AQUÍ: Lógica para la URL de la imagen (sin prefijo local)
                                                    src={product.imagen?.denominacion || '/placeholder.svg?height=60&width=60'} // Las URL de Cloudinary son completas
                                                    alt={product.denominacion}
                                                    className="w-15 h-15 object-cover rounded-lg"
                                                />
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-gray-900 text-sm">{product.denominacion}</h4>
                                                    <p className="text-orange-500 font-bold text-sm">${product.precioVenta.toFixed(2)}</p>
                                                </div>
                                                <button
                                                    onClick={() => addToCart(product)}
                                                    className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center hover:bg-orange-600 transition duration-200"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Resumen del pedido */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
                                <h3 className="text-lg font-bold text-gray-900 mb-6">Resumen del pedido</h3>

                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Subtotal ({totalItems} productos)</span>
                                        <span className="font-semibold">${totalAmount.toFixed(2)}</span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Costo de envío</span>
                                        <span className="font-semibold">
                                            {deliveryFee === 0 ? (
                                                <span className="text-green-500">Gratis</span>
                                            ) : (
                                                `$${deliveryFee.toFixed(2)}`
                                            )}
                                        </span>
                                    </div>

                                    {totalAmount < 25 && (
                                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                                            <p className="text-sm text-orange-700">
                                                Agrega ${(25 - totalAmount).toFixed(2)} más para obtener envío gratis
                                            </p>
                                        </div>
                                    )}

                                    <div className="border-t pt-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-bold text-gray-900">Total</span>
                                            <span className="text-2xl font-bold text-orange-500">${finalTotal.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                <a href='/checkout' className="w-full bg-orange-500 text-white py-4 rounded-xl font-semibold hover:bg-orange-600 transition duration-200 flex items-center justify-center space-x-2">
                                    <CreditCard className="w-5 h-5" />
                                    <span>Proceder al Pago</span>
                                </a>

                                <div className="mt-4 space-y-3">
                                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                                        <Truck className="w-4 h-4" />
                                        <span>Entrega estimada: 25-35 min</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                                        <Shield className="w-4 h-4" />
                                        <span>Pago 100% seguro</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}