export interface ILocalidadDTO {
    id: number;
    nombre: string;
    provincia?: {
        id: number;
        nombre: string;
        pais?: {
            id: number;
            nombre: string;
        };
    };
}
