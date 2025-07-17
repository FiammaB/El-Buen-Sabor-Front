export interface ArticuloManufacturadoDetalleCreateDTO {
    // Solo el ID del insumo
    id?: number | null;
    cantidad: number;

    articuloInsumoId?: number | null; // Puede ser null si no se selecciona un insumo
    articuloManufacturadoId?: number | null;
}