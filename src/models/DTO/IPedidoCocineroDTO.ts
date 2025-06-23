export interface IPedidoCocineroDTO {
  id: number;
  cliente: {
    usuario: {
      nombre: string;
    };
  };
  fechaPedido: string;
  total: number;
  horaEstimadaFinalizacion: string;
  estado: string;
}
