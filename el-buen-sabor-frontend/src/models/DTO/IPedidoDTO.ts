// src/models/DTO/IPedidoDTO.ts

export interface IPedidoDTO {
  id: number; // ✅ Necesario para listar/modificar pedidos existentes
  fechaPedido: string;
  total: number;
  estado: string;
  clienteId: number;
  domicilioId?: number; // Optional, solo requerido si tipoEnvio === 'DELIVERY'
  tipoEnvio: TipoEnvio;
  formaPago: FormaPago;
  detalles: ICreateDetallePedidoDTO[];
}

export enum TipoEnvio {
  RETIRO_EN_LOCAL = "RETIRO_EN_LOCAL",
  DELIVERY = "DELIVERY",
}

export enum FormaPago {
  EFECTIVO = "EFECTIVO",
  TARJETA = "TARJETA",
  TRANSFERENCIA = "TRANSFERENCIA",
  MERCADO_PAGO = "MERCADO_PAGO",
}

export interface ICreateDetallePedidoDTO {
  cantidad: number;
  articuloManufacturadoId?: number | null;
  subtotal?: number | null;
}
