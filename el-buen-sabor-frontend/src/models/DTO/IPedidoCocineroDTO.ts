export interface IPedidoCocineroDTO {
  id: number;
  fechaPedido: string;
  total: number;
  estado: string;
  horaEstimadaFinalizacion?: string;
  cliente?: {
    usuario?: {
      nombre: string;
    };
  };
}
