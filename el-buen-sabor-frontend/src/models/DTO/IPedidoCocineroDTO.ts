export interface IPedidoCocineroDTO {
  id: number;
  fechaPedido: string;
  total: number;
  estado: string;
  horaEstimadaFinalizacion?: string;
  persona?: {
    usuario?: {
      nombre: string;
    };
  };
}
