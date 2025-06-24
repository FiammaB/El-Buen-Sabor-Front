// src/models/DTO/IPedidoDTO.ts

import type {IArticuloManufacturadoResponseDTO} from "./IAArticuloManufacturadoResponseDTO.ts";

export interface IPedidoDTO {
  id: number;
  fechaPedido: string;
  total: number;
  estado: string;
  clienteId?: number;
  domicilioId?: number;
  tipoEnvio: TipoEnvio;
  formaPago: FormaPago;
  horaEstimadaFinalizacion: string;
  detalles: IDetallePedidoDTO[];
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

export interface IDetallePedidoDTO {
  cantidad: number;
  subTotal: number;
  articuloManufacturado?: IArticuloManufacturadoDTO | null;
  articuloInsumo?: IArticuloInsumoDTO | null;
}
