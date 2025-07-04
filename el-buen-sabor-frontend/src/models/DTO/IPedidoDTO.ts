// src/models/Pedido/Pedido.ts (o src/models/DTO/IPedidoDTO.ts si mantienes la ruta)

// Importar interfaces de DTO existentes si son usadas en los detalles
import type { IArticuloManufacturadoResponseDTO } from '../DTO/IAArticuloManufacturadoResponseDTO';
import type { IArticuloInsumoResponseDTO } from '../DTO/IAArticuloInsumoResponseDTO';

// Interfaz para el DTO de Pedido que viene del backend
export interface IPedidoDTO {
  id?: number;
  fechaPedido: string; // Formato string, e.g., "AAAA-MM-DD"
  total: number;
  estado: EstadoPedido; // <-- ¡Usamos el enum EstadoPedido!
  clienteId?: number; // El ID del cliente principal

  cliente?: {
    id: number; // <-- Añadido ID para referencia
    nombre: string;
    apellido: string;
    telefono?: string;
    usuario: {
      id: number; // <-- Añadido ID para referencia
      nombre?: string;
      email?: string;
    };
  };
  domicilioId?: number;
  domicilio?: {
    id: number; // <-- Añadido ID para referencia
    calle: string;
    numero: number;
    cp: number;
    localidad?: {
      id: number; // <-- Añadido ID para referencia
      nombre: string
    }
  };
  factura?: {
    id: number;
    urlPdf?: string; // URL del PDF de la factura
  };
  tipoEnvio: TipoEnvio;
  formaPago: FormaPago;
  horaEstimadaFinalizacion: string; // Formato string, e.g., "HH:MM:SS"
  detalles: IDetallePedidoDTO[];
}

// Enum para TipoEnvio (debe coincidir con el backend)
export enum TipoEnvio {
  RETIRO_EN_LOCAL = "RETIRO_EN_LOCAL",
  DELIVERY = "DELIVERY",
}

// Enum para FormaPago (debe coincidir con el backend)
export enum FormaPago {
  EFECTIVO = "EFECTIVO",
  TARJETA = "TARJETA",
  TRANSFERENCIA = "TRANSFERENCIA",
  MERCADO_PAGO = "MERCADO_PAGO",
}

// Interfaz para el DTO de DetallePedido que viene del backend
export interface IDetallePedidoDTO {
  id?: number; // <-- ¡Añadido ID para la clave de React y referencia!
  cantidad: number;
  subTotal: number;
  articuloManufacturado?: IArticuloManufacturadoResponseDTO | null; // Usar el DTO de respuesta
  articuloInsumo?: IArticuloInsumoResponseDTO | null; // Usar el DTO de respuesta
}

// Enum para los estados del pedido (debe coincidir con el backend)
export enum EstadoPedido {
  PENDIENTE = "PENDIENTE",
  A_CONFIRMAR = "A_CONFIRMAR",
  EN_PREPARACION = "EN_PREPARACION",
  EN_COCINA = "EN_COCINA",
  LISTO = "LISTO",
  EN_CAMINO = "EN_CAMINO",
  ENTREGADO = "ENTREGADO",
  CANCELADO = "CANCELADO",
  PAGADO = "PAGADO"
}