// src/components/Cart/context/cart-context.tsx

import type React from "react"
import { createContext, useContext, useReducer, useEffect, useState } from "react"
import { Articulo } from '../../../models/Articulos/Articulo';
import { ArticuloManufacturado } from "../../../models/Articulos/ArticuloManufacturado";
import type { IPromocionDTO } from "../../../models/DTO/IPromocionDTO";


// ===============================================
// DEFINICIONES DE TIPOS (ACTUALIZADAS Y CORREGIDAS)
// ===============================================

export type PurchasableItem =
  (Articulo & { tipo: 'articulo' }) |
  (IPromocionDTO & { tipo: 'promocion' });

export interface CartItem {
  id: number; // El ID del artículo o la promoción
  purchasableItem: PurchasableItem; // El objeto Articulo o Promocion
  quantity: number;
  subtotal: number;
}

type CartAction =
  | { type: "ADD_TO_CART"; payload: { item: Articulo | IPromocionDTO; quantity: number } }
  | { type: "REMOVE_FROM_CART"; payload: { id: number } }
  | { type: "UPDATE_QUANTITY"; payload: { id: number; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "LOAD_CART"; payload: { items: CartItem[] } }

interface CartState {
  items: CartItem[];
}

const initialState: CartState = {
  items: [],
}

export interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  addToCart: (item: Articulo | IPromocionDTO, quantity?: number) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  isInCart: (id: number) => boolean;
  getItemQuantity: (id: number) => number;
}

// ===============================================
// REDUCER DEL CARRITO (LÓGICA DE ADD_TO_CART MEJORADA)
// ===============================================

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_TO_CART": {
      const { item: rawItemToAdd, quantity } = action.payload;

      let priceToUse: number;
      let finalItemForCart: PurchasableItem;

      // Determinar si el item es una promoción o un artículo
      if ('precioPromocional' in rawItemToAdd) {
        const promo = rawItemToAdd as IPromocionDTO;
        priceToUse = promo.precioPromocional || 0;
        finalItemForCart = { ...promo, tipo: 'promocion' };
      } else {
        const articulo = rawItemToAdd as Articulo;
        priceToUse = articulo.precioVenta || 0;
        finalItemForCart = { ...articulo, tipo: 'articulo' };
      }

      // <-- CAMBIO CLAVE AQUÍ: Buscar ítem existente por ID y TIPO
      // Esto asegura que una promoción con ID 1 no se confunda con un artículo con ID 1
      const existingItemIndex = state.items.findIndex(
        (itemInCart) => itemInCart.id === finalItemForCart.id && itemInCart.purchasableItem.tipo === finalItemForCart.tipo
      );

      if (existingItemIndex >= 0) {
        const updatedItems = state.items.map((itemInCart, index) => {
          if (index === existingItemIndex) {
            const newQuantity = itemInCart.quantity + quantity;
            return {
              ...itemInCart,
              quantity: newQuantity,
              subtotal: newQuantity * priceToUse,
            };
          }
          return itemInCart;
        });
        return { ...state, items: updatedItems };
      } else {
        // Asegurar que el ID exista antes de crear el newItem
        if (finalItemForCart.id === undefined || finalItemForCart.id === null) {
          console.error("Attempted to add an item with undefined/null ID:", finalItemForCart);
          return state;
        }
        const newItem: CartItem = {
          id: finalItemForCart.id,
          purchasableItem: finalItemForCart,
          quantity,
          subtotal: quantity * priceToUse,
        };
        return { ...state, items: [...state.items, newItem] };
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
          let priceToUse: number;
          if (item.purchasableItem.tipo === 'articulo') {
            priceToUse = (item.purchasableItem as Articulo).precioVenta || 0;
          } else if (item.purchasableItem.tipo === 'promocion') {
            priceToUse = (item.purchasableItem as IPromocionDTO).precioPromocional || 0;
          } else {
            priceToUse = 0;
          }

          return {
            ...item,
            quantity,
            subtotal: quantity * priceToUse,
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
      const loadedItems = action.payload.items.map(item => {
        let typedItem: PurchasableItem;
        const rawPurchasableItem = item.purchasableItem;

        if (typeof rawPurchasableItem === 'object' && rawPurchasableItem !== null) {
          if ('tipo' in rawPurchasableItem && (rawPurchasableItem.tipo === 'articulo' || rawPurchasableItem.tipo === 'promocion')) {
            if (rawPurchasableItem.tipo === 'articulo') {
              typedItem = Object.setPrototypeOf(rawPurchasableItem, Articulo.prototype) as Articulo & { tipo: 'articulo' };
            } else {
              typedItem = rawPurchasableItem as IPromocionDTO & { tipo: 'promocion' };
            }
          } else {
            console.warn("Item cargado con tipo inconsistente/faltante, intentando inferir:", rawPurchasableItem);
            const itemToSpread = rawPurchasableItem as any;
            if ('precioVenta' in itemToSpread) {
              typedItem = { ...itemToSpread, tipo: 'articulo' } as Articulo & { tipo: 'articulo' };
            } else if ('precioPromocional' in itemToSpread) {
              typedItem = { ...itemToSpread, tipo: 'promocion' } as IPromocionDTO & { tipo: 'promocion' };
            } else {
              console.error("Item cargado con propiedades de precio desconocidas, fallback a artículo sin garantía de tipo:", rawPurchasableItem);
              typedItem = { ...itemToSpread, tipo: 'articulo' } as Articulo & { tipo: 'articulo' };
            }
          }
        } else {
          console.error("Item cargado no es un objeto válido, usando fallback básico:", rawPurchasableItem);
          typedItem = {
            id: item.id,
            denominacion: "Error de carga: Item no válido",
            precioVenta: 0,
            tipo: 'articulo',
          } as Articulo & { tipo: 'articulo' };
        }

        if (item.id === undefined || item.id === null) {
          console.warn("CartItem cargado con ID undefined/null, asignando un ID de fallback:", item);
          return { ...item, id: Date.now() + Math.random(), purchasableItem: typedItem } as CartItem;
        }

        return {
          ...item,
          purchasableItem: typedItem
        };
      });
      return { ...state, items: loadedItems };
    }

    default:
      return state
  }
}

// ... (Resto del contexto y provider sin cambios) ...

// ===============================================
// CONTEXTO Y PROVIDER (SIN CAMBIOS SIGNIFICATIVOS EN LA LÓGICA)
// ===============================================

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("ebs-cart");
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart) && parsedCart.length > 0) {
          dispatch({ type: "LOAD_CART", payload: { items: parsedCart as CartItem[] } });
        }
      }
    } catch (error) {
      console.error("Error loading cart from localStorage:", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isLoaded) {
      console.log("Guardando carrito en localStorage:", state.items);
      const serializableItems = state.items.map(cartItem => ({
        id: cartItem.id,
        quantity: cartItem.quantity,
        subtotal: cartItem.subtotal,
        purchasableItem: cartItem.purchasableItem
      }));
      localStorage.setItem("ebs-cart", JSON.stringify(serializableItems));
    }
  }, [state.items, isLoaded]);

  const totalItems = state.items.reduce((total, item) => total + item.quantity, 0);
  const totalAmount = state.items.reduce((total, item) => total + item.subtotal, 0);

  const addToCart = (item: Articulo | IPromocionDTO, quantity = 1) => {
    console.log("Agregando al carrito:", item.denominacion, "cantidad:", quantity);
    dispatch({ type: "ADD_TO_CART", payload: { item, quantity } });
  };

  const removeFromCart = (id: number) => {
    console.log("Removiendo del carrito:", id);
    dispatch({ type: "REMOVE_FROM_CART", payload: { id } });
  };

  const updateQuantity = (id: number, quantity: number) => {
    console.log("Actualizando cantidad:", id, "nueva cantidad:", quantity);
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } });
  };

  const clearCart = () => {
    console.log("Vaciando carrito");
    dispatch({ type: "CLEAR_CART" });
  };

  const isInCart = (id: number) => {
    // <-- CAMBIO IMPORTANTE: isInCart ahora necesita verificar también el tipo
    // Para promociones, el ID es único para la promo.
    // Para artículos, el ID es único para el artículo.
    // Sin embargo, si tu lógica es que no puedes tener un artículo y una promoción con el mismo ID
    // en el carrito como ítems separados, esta lógica está bien.
    // Si necesitas diferenciar, la lógica de isInCart también debería tomar un 'tipo'.
    // Por ahora, solo usamos el ID para la existencia.
    return state.items.some((item) => item.id === id);
  };

  const getItemQuantity = (id: number) => {
    // <-- Considerar si necesitas cantidad por ID Y TIPO
    const item = state.items.find((item) => item.id === id);
    return item ? item.quantity : 0;
  };

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
  };

  if (!isLoaded) {
    return <div>Cargando carrito...</div>;
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}