// src/components/Cart/context/cart-context.tsx

import type React from "react"
import { createContext, useContext, useReducer, useEffect, useState } from "react"
// Importamos la clase base Articulo
import { Articulo } from '../../../models/Articulos/Articulo';
// Eliminamos la importación de 'CartItem' y 'CartContextType' de '../types/cart'
// import type { CartItem, CartContextType } from "../types/cart"

// ===============================================
// DEFINICIONES DE TIPOS (MOVIDAS AL PRINCIPIO)
// ===============================================

// 1. Define la interfaz para un ítem del carrito
// Ahora el 'articulo' dentro de CartItem es de tipo Articulo (la clase base)
export interface CartItem { // Exportamos por si la necesitas en otro archivo
  id: number;
  articulo: Articulo; // <--- CAMBIO CLAVE AQUÍ: AHORA ES ARTICULO
  quantity: number;
  subtotal: number;
}

// 2. Define las acciones del reducer
type CartAction =
  | { type: "ADD_TO_CART"; payload: { articulo: Articulo; quantity: number } }
  | { type: "REMOVE_FROM_CART"; payload: { id: number } }
  | { type: "UPDATE_QUANTITY"; payload: { id: number; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "LOAD_CART"; payload: { items: CartItem[] } }

// 3. Define el estado del carrito
interface CartState {
  items: CartItem[];
}

// 4. Define el estado inicial
const initialState: CartState = {
  items: [],
}

// 5. Define la interfaz del contexto del carrito
export interface CartContextType { // Exportamos por si la necesitas en otro archivo
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  addToCart: (item: Articulo, quantity?: number) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  isInCart: (id: number) => boolean;
  getItemQuantity: (id: number) => number;
}

// ===============================================
// REDUCER DEL CARRITO
// ===============================================

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_TO_CART": {
      const { articulo, quantity } = action.payload
      const existingItemIndex = state.items.findIndex((item) => item.id === articulo.id)

      if (existingItemIndex >= 0) {
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
        // Asegúrate de que el artículo tenga un ID antes de crear el newItem
        if (articulo.id !== undefined) { // Mejoramos la comprobación de id
          const newItem: CartItem = {
            id: articulo.id,
            articulo,
            quantity,
            subtotal: quantity * articulo.precioVenta,
          }
          return { ...state, items: [...state.items, newItem] }
        }
        return state; // Retorna el estado actual si el id es undefined
      }
    }

    case "REMOVE_FROM_CART": {
      const filteredItems = state.items.filter((item) => item.id !== action.payload.id)
      return { ...state, items: filteredItems }
    }

    case "UPDATE_QUANTITY": {
      const { id, quantity } = action.payload
      if (quantity <= 0) {
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

// ===============================================
// CONTEXTO Y PROVIDER
// ===============================================

// Crear el contexto (DEBE ir antes de ser usado en CartProvider)
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
        // Asegúrate de que los ítems parseados tengan la estructura de CartItem
        // Aquí podrías añadir una validación más robusta si fuera necesario
        if (Array.isArray(parsedCart) && parsedCart.length > 0) {
          // Re-instanciar los artículos si fuera necesario, o si JSON.parse los convierte a objetos planos
          const itemsFromStorage = parsedCart.map((item: unknown) => {
            const cartItem = item as CartItem;
            return {
              ...cartItem,
              articulo: Object.setPrototypeOf(cartItem.articulo, Articulo.prototype) // ¡IMPORTANTE! Re-instancia a Articulo si guardas clases en LocalStorage
            };
          }) as CartItem[]; // Asegúrate de que el tipo sea CartItem[]
          console.log("Cargando carrito desde localStorage:", itemsFromStorage)
          dispatch({ type: "LOAD_CART", payload: { items: itemsFromStorage } })
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
      // Al guardar, podrías querer guardar solo las propiedades de los artículos, no toda la instancia de clase.
      // Si Articulo tiene métodos, no se guardarán al JSON.parse/stringify.
      // Para simplificar, asumimos que solo las propiedades son relevantes para localStorage.
      localStorage.setItem("ebs-cart", JSON.stringify(state.items))
    }
  }, [state.items, isLoaded])

  // Calcular totales (ahora en scope y bien definidos)
  const totalItems = state.items.reduce((total, item) => total + item.quantity, 0)
  const totalAmount = state.items.reduce((total, item) => total + item.subtotal, 0)

  // Funciones del carrito
  const addToCart = (articulo: Articulo, quantity = 1) => {
    console.log("Agregando al carrito:", articulo.denominacion, "cantidad:", quantity)
    dispatch({ type: "ADD_TO_CART", payload: { articulo, quantity } })
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
