"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect, useState } from "react"
import type { ArticuloManufacturado } from "../../../models/Articulos/ArticuloManufacturado"
import type { CartItem, CartContextType } from "../types/cart"

// Acciones del reducer
type CartAction =
  | { type: "ADD_TO_CART"; payload: { articulo: ArticuloManufacturado; quantity: number } }
  | { type: "REMOVE_FROM_CART"; payload: { id: number } }
  | { type: "UPDATE_QUANTITY"; payload: { id: number; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "LOAD_CART"; payload: { items: CartItem[] } }

// Estado inicial
interface CartState {
  items: CartItem[]
}

const initialState: CartState = {
  items: [],
}

// Reducer del carrito
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_TO_CART": {
      const { articulo, quantity } = action.payload
      const existingItemIndex = state.items.findIndex((item) => item.id === articulo.id)

      if (existingItemIndex >= 0) {
        // Si el producto ya existe, actualizar cantidad
        const updatedItems = state.items.map((item, index) => {
          if (index === existingItemIndex) {
            const newQuantity = item.quantity + quantity
            return {
              ...item,
              quantity: newQuantity,
              subtotal: newQuantity * articulo.precioVenta,
            }
          }
          return item
        })
        return { ...state, items: updatedItems }
      } else {
        // Si es un producto nuevo, agregarlo
        if (articulo.id) {
          const newItem: CartItem = {
            id: articulo.id,
            articulo,
            quantity,
            subtotal: quantity * articulo.precioVenta,
          }
          return { ...state, items: [...state.items, newItem] }
        }
      }
    }

    case "REMOVE_FROM_CART": {
      const filteredItems = state.items.filter((item) => item.id !== action.payload.id)
      return { ...state, items: filteredItems }
    }

    case "UPDATE_QUANTITY": {
      const { id, quantity } = action.payload
      if (quantity <= 0) {
        // Si la cantidad es 0 o menor, remover el item
        return cartReducer(state, { type: "REMOVE_FROM_CART", payload: { id } })
      }

      const updatedItems = state.items.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            quantity,
            subtotal: quantity * item.articulo.precioVenta,
          }
        }
        return item
      })
      return { ...state, items: updatedItems }
    }

    case "CLEAR_CART": {
      return { ...state, items: [] }
    }

    case "LOAD_CART": {
      return { ...state, items: action.payload.items }
    }

    default:
      return state
  }
}

// Crear el contexto
const CartContext = createContext<CartContextType | undefined>(undefined)

// Provider del carrito
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)
  const [isLoaded, setIsLoaded] = useState(false)

  // Cargar carrito desde localStorage al inicializar
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("ebs-cart")
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart)
        if (Array.isArray(parsedCart) && parsedCart.length > 0) {
          console.log("Cargando carrito desde localStorage:", parsedCart)
          dispatch({ type: "LOAD_CART", payload: { items: parsedCart } })
        }
      }
    } catch (error) {
      console.error("Error loading cart from localStorage:", error)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Guardar carrito en localStorage cuando cambie (solo después de cargar)
  useEffect(() => {
    if (isLoaded) {
      console.log("Guardando carrito en localStorage:", state.items)
      localStorage.setItem("ebs-cart", JSON.stringify(state.items))
    }
  }, [state.items, isLoaded])

  // Calcular totales
  const totalItems = state.items.reduce((total, item) => total + item.quantity, 0)
  const totalAmount = state.items.reduce((total, item) => total + item.subtotal, 0)



  // Funciones del carrito
  const addToCart = (articulo: Partial<ArticuloManufacturado> & { id: string | number; precioVenta: number; denominacion: string }, quantity = 1) => {
    console.log("Agregando al carrito:", articulo.denominacion, "cantidad:", quantity)
    dispatch({ type: "ADD_TO_CART", payload: { articulo: articulo as ArticuloManufacturado, quantity } })
  }

  const removeFromCart = (id: number) => {
    console.log("Removiendo del carrito:", id)
    dispatch({ type: "REMOVE_FROM_CART", payload: { id } })
  }

  const updateQuantity = (id: number, quantity: number) => {
    console.log("Actualizando cantidad:", id, "nueva cantidad:", quantity)
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } })
  }

  const clearCart = () => {
    console.log("Vaciando carrito")
    dispatch({ type: "CLEAR_CART" })
  }

  const isInCart = (id: number) => {
    return state.items.some((item) => item.id === id)
  }

  const getItemQuantity = (id: number) => {
    const item = state.items.find((item) => item.id === id)
    return item ? item.quantity : 0
  }

  const value: CartContextType = {
    items: state.items,
    totalItems,
    totalAmount,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isInCart,
    getItemQuantity,
  }

  // No renderizar hasta que el carrito esté cargado
  if (!isLoaded) {
    return <div>Cargando...</div>
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// Hook personalizado para usar el contexto
export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
