export interface IPromocionDTO {
    id?: number;
    denominacion: string;
    descripcion: string;
    fechaDesde: string;
    fechaHasta: string;
    horaDesde: string;
    horaHasta: string;
    diasSemana: number[];
    articulos: number[];
    precioPromocional: number;
}
