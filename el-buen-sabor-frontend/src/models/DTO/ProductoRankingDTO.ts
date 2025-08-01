export interface ProductoRankingDTO {
    id: number;
    denominacion: string;
    cantidadVendida: number;
    nombreProducto: string;
    tipo: string; // puede ser "COCINA" o "BEBIDA"
    precioVenta: number;
    fechaVenta: string; // <-- NUEVO CAMPO (en formato YYYY-MM-DD)
}
